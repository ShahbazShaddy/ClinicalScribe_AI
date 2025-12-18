import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle, User as UserIcon, ArrowLeft, Search, Plus, UserPlus, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AlertsPanel from '@/components/AlertsPanel';
import AlertSummaryPanel from '@/components/AlertSummaryPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { generateUniqueId } from '@/lib/utils';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page, Note, Patient } from '@/App';
import { useAI } from '@/hooks/useAI';
import type { Alert as AlertType } from '@/types/alerts';
import { generateSimulatedAlerts } from '@/lib/alertDefinitions';
import { createVisit, updateVisitRiskAssessment, updatePatientRiskLevel, createPatientRiskHistoryEntry, getPatientVisits, getPatientsByUserId, createPatient, dbPatientToAppPatient } from '@/db/services';
import { analyzeVisitRisk } from '@/services/riskAssessment';

interface RecordingPageProps {
  user: User;
  patient?: Patient; // Optional patient for patient-specific recording
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteCreated: (note: Note) => void;
}

export default function RecordingPage({ user, patient: initialPatient, onNavigate, onLogout, onNoteCreated }: RecordingPageProps) {
  // Patient selection state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient || null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '',
    gender: 'M' as 'M' | 'F' | 'O',
    phone: '',
    email: '',
  });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [showAlertSummary, setShowAlertSummary] = useState(false);
  const [alertSummaryTimestamp, setAlertSummaryTimestamp] = useState<string>('');
  
  const timerRef = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingDurationRef = useRef<number>(0);
  const alertTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { 
    transcribeClinicalRecording, 
    generateStructuredNoteContent,
    extractPatientInfoFromAudio,
    error: aiError,
    clearError 
  } = useAI();

  const { saveNote } = useDatabase();

  // Load patients on mount
  useEffect(() => {
    const loadPatients = async () => {
      if (!user.id) return;
      setIsLoadingPatients(true);
      try {
        const dbPatients = await getPatientsByUserId(user.id);
        const appPatients = dbPatients.map(dbPatientToAppPatient);
        setPatients(appPatients);
      } catch (err) {
        console.error('Error loading patients:', err);
      } finally {
        setIsLoadingPatients(false);
      }
    };
    loadPatients();
  }, [user.id]);

  // Filter patients based on search
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    p.phone?.includes(patientSearchQuery) ||
    p.email?.toLowerCase().includes(patientSearchQuery.toLowerCase())
  );

  // Handle new patient creation
  const handleCreatePatient = async () => {
    if (!newPatientForm.name.trim()) {
      toast.error('Patient name is required');
      return;
    }

    setIsCreatingPatient(true);
    try {
      const newPatient = await createPatient({
        userId: user.id,
        name: newPatientForm.name.trim(),
        age: newPatientForm.age ? parseInt(newPatientForm.age) : undefined,
        gender: newPatientForm.gender,
        phone: newPatientForm.phone || undefined,
        email: newPatientForm.email || undefined,
        diagnoses: [],
        medications: [],
      });

      if (newPatient) {
        const appPatient = dbPatientToAppPatient(newPatient);
        setPatients([appPatient, ...patients]);
        setSelectedPatient(appPatient);
        setShowNewPatientDialog(false);
        setNewPatientForm({ name: '', age: '', gender: 'M', phone: '', email: '' });
        toast.success(`Patient "${appPatient.name}" created successfully`);
      }
    } catch (err) {
      console.error('Error creating patient:', err);
      toast.error('Failed to create patient');
    } finally {
      setIsCreatingPatient(false);
    }
  };

  // Use selectedPatient instead of patient prop
  const patient = selectedPatient;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      recordingDurationRef.current = 0; // Reset duration
      setAlerts([]); // Clear previous alerts
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Process immediately with the blob and captured duration
        processRecording(blob, recordingDurationRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          recordingDurationRef.current = newTime; // Update the ref with current time
          return newTime;
        });
      }, 1000);

      // Simulate alerts appearing 5-10 seconds after recording starts
      alertTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          const newAlerts = generateSimulatedAlerts();
          setAlerts(newAlerts);
          toast.info(`${newAlerts.length} clinical alert${newAlerts.length !== 1 ? 's' : ''} detected`);
        }
      }, 5000 + Math.random() * 5000); // 5-10 second delay

      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setIsRecording(false);
      // Processing is now triggered by mediaRecorder.onstop with the captured duration
    }
  };

  const processRecording = async (blob?: Blob, recordedDuration?: number) => {
    const recordingBlob = blob || audioBlob;
    const duration = recordedDuration !== undefined ? recordedDuration : recordingTime;
    
    if (!recordingBlob) {
      toast.error('No recording found');
      return;
    }

    setIsProcessing(true);
    clearError();
    
    try {
      // Step 1: Transcribe audio
      setProcessingStep('Transcribing audio...');
      const transcribedText = await transcribeClinicalRecording(recordingBlob);
      console.log('Transcribed text:', transcribedText);
      
      // Step 2: Extract patient information from audio (use patient info if available)
      setProcessingStep('Extracting patient information...');
      console.log('📋 Extracting patient info from audio');
      const patientInfo = patient 
        ? { name: patient.name, age: patient.age?.toString(), chiefComplaint: '' }
        : await extractPatientInfoFromAudio(transcribedText);
      console.log('Extracted patient info:', patientInfo);
      
      // Step 3: Generate dynamic note sections based on content
      setProcessingStep('Analyzing content and generating note sections...');
      console.log('📋 Generating flexible note structure based on audio content');
      const noteContent = await generateStructuredNoteContent(transcribedText);
      console.log('Generated dynamic sections:', Object.keys(noteContent));
      console.log('Generated note content:', noteContent);
      
      // Step 4: Create note with extracted patient info
      setProcessingStep('Creating clinical note...');

      const note: Note = {
        id: generateUniqueId(),
        patientId: patient?.id,
        patientName: patient?.name || patientInfo.name || `Patient-${generateUniqueId()}`,
        patientAge: patient?.age?.toString() || patientInfo.age,
        chiefComplaint: patientInfo.chiefComplaint || noteContent['Chief Complaint'] || '',
        noteType: 'Flexible', // Mark as flexible/dynamic
        date: new Date().toISOString(),
        duration: duration,
        content: noteContent,
        transcription: transcribedText // Save the original transcription
      };

      console.log('Creating note with extracted patient info:', {
        patientId: note.patientId,
        patientName: note.patientName,
        patientAge: note.patientAge,
        chiefComplaint: note.chiefComplaint,
        sections: Object.keys(note.content),
        sectionCount: Object.keys(note.content).length,
        duration: note.duration,
        durationInMinutes: Math.floor(note.duration / 60)
      });

      // Save to database
      let savedNoteId: string | undefined;
      try {
        const userId = user.id || generateUniqueId();
        const savedNote = await saveNote(userId, {
          patientId: patient?.id,
          patientName: note.patientName,
          patientAge: note.patientAge,
          chiefComplaint: note.chiefComplaint,
          noteType: note.noteType,
          duration: note.duration,
          content: note.content,
          transcription: note.transcription // Include the original transcription
        });
        
        savedNoteId = savedNote?.id;
        console.log('Note saved to database:', {
          savedNote,
          duration: savedNote?.duration
        });

        // If recording for a patient, create a visit record
        if (patient && savedNote) {
          setProcessingStep('Creating visit record...');
          const visit = await createVisit({
            patientId: patient.id,
            userId: userId,
            noteId: savedNote.id,
            visitDate: new Date().toISOString(),
            visitType: 'routine',
            chiefComplaint: note.chiefComplaint || '',
            vitals: {},
            summary: noteContent['Assessment'] || noteContent['Summary'] || '',
            diagnosis: noteContent['Assessment'] || noteContent['Diagnosis'] || '',
            treatmentPlan: noteContent['Plan'] || noteContent['Treatment Plan'] || '',
            duration: note.duration,
            status: 'completed',
          });
          console.log('Visit created:', visit);

          // Perform AI risk assessment
          if (visit) {
            setProcessingStep('Analyzing patient risk...');
            try {
              // Get previous visits for context
              const previousVisits = await getPatientVisits(patient.id);
              
              const visitData = {
                chiefComplaint: note.chiefComplaint || '',
                vitals: noteContent['Vitals'] || {},
                diagnosis: noteContent['Assessment'] || noteContent['Diagnosis'] || '',
                treatmentPlan: noteContent['Plan'] || noteContent['Treatment Plan'] || '',
                noteContent: noteContent
              };

              const patientData = {
                age: patient.age,
                gender: patient.gender,
                diagnoses: patient.diagnoses || [],
                medications: patient.medications || [],
                allergies: patient.allergies || []
              };

              const riskAssessment = await analyzeVisitRisk(visitData, patientData, previousVisits);
              console.log('Risk assessment completed:', riskAssessment);

              // Update visit with risk assessment
              await updateVisitRiskAssessment(visit.id, {
                riskLevel: riskAssessment.riskLevel,
                riskScore: riskAssessment.riskScore,
                riskFactors: riskAssessment.riskFactors,
                summary: riskAssessment.summary,
                concerns: riskAssessment.concerns,
                recommendations: riskAssessment.recommendations,
                followUpUrgency: riskAssessment.followUpUrgency
              });

              // Update patient's overall risk level
              await updatePatientRiskLevel(
                patient.id,
                riskAssessment.riskLevel,
                riskAssessment.riskScore,
                riskAssessment.riskFactors,
                riskAssessment.summary
              );

              // Create risk history entry
              await createPatientRiskHistoryEntry(
                patient.id,
                visit.id,
                riskAssessment.riskLevel,
                riskAssessment.riskScore,
                riskAssessment.riskFactors,
                'ai',
                riskAssessment.summary
              );

              toast.success(`Risk assessment complete: ${riskAssessment.riskLevel.toUpperCase()} risk (${riskAssessment.riskScore}/100)`);
            } catch (riskErr) {
              console.error('Error performing risk assessment:', riskErr);
              // Don't fail the whole process if risk assessment fails
            }
          }
        }
      } catch (dbErr) {
        console.error('Error saving to database:', dbErr);
        // Continue anyway - note will still be used via parent callback
      }

      setIsProcessing(false);
      setProcessingStep('');
      setShowAlertSummary(true);
      setAlertSummaryTimestamp(new Date().toISOString());
      onNoteCreated(note);
      toast.success('Clinical note generated successfully');
      
      // Reset form
      setAudioBlob(null);
    } catch (err) {
      console.error('Processing error:', err);
      toast.error(aiError || 'Error processing recording');
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, dismissed: true } : a
    ));
  };

  const handleAddToPlan = (alert: AlertType) => {
    setAlerts(alerts.map(a =>
      a.id === alert.id ? { ...a, addedToPlan: true } : a
    ));
    toast.success('Actions added to care plan');
  };

  const handleClearAllAlerts = () => {
    setAlerts(alerts.map(a => ({ ...a, dismissed: true })));
  };

  const hasNewAlert = alerts.some(a => !a.dismissed && !a.addedToPlan);

  return (
    <DashboardLayout user={user} currentPage={patient ? "patient" : "recording"} onNavigate={onNavigate} onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
        {/* Main Content - Recording Interface */}
        <div className="lg:col-span-3 space-y-6 sm:space-y-8">
          {/* Patient Selection Section - Show when no patient is selected */}
          {!patient && (
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Patient Before Recording
                </CardTitle>
                <CardDescription>
                  A patient must be linked before starting a recording. Select an existing patient or create a new one.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search existing patients */}
                <div className="space-y-2">
                  <Label>Search Existing Patients</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, or email..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Patient list */}
                {isLoadingPatients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading patients...</span>
                  </div>
                ) : filteredPatients.length > 0 ? (
                  <ScrollArea className="h-[280px] rounded-md border">
                    <div className="p-2 space-y-1">
                      {filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPatient(p)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {p.age && `${p.age} yrs`}
                              {p.age && p.gender && ' • '}
                              {p.gender && (p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other')}
                              {(p.phone || p.email) && ' • '}
                              {p.phone || p.email}
                            </div>
                          </div>
                          {p.riskLevel && (
                            <Badge 
                              variant={p.riskLevel === 'high' ? 'destructive' : p.riskLevel === 'medium' ? 'secondary' : 'outline'}
                              className="flex-shrink-0"
                            >
                              {p.riskLevel}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No patients found</p>
                    <p className="text-sm">Create a new patient to start recording</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No patients match your search</p>
                    <p className="text-sm">Try a different search term or create a new patient</p>
                  </div>
                )}

                {/* Create new patient button */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowNewPatientDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Patient
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Patient Context Header - Show when patient is selected */}
          {patient && (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => initialPatient ? onNavigate('patient') : setSelectedPatient(null)} title={initialPatient ? 'Back to patient' : 'Change patient'}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Card className="flex-1">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {patient.age && `${patient.age} yrs`}
                        {patient.age && patient.gender && ' • '}
                        {patient.gender && (patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other')}
                      </div>
                    </div>
                    {patient.diagnoses && patient.diagnoses.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1">
                        {patient.diagnoses.slice(0, 2).map((d, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                        ))}
                        {patient.diagnoses.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{patient.diagnoses.length - 2}</Badge>
                        )}
                      </div>
                    )}
                    {!initialPatient && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                        Change
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              {patient ? `New Visit for ${patient.name}` : 'New Recording'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {patient 
                ? 'Record patient conversation and generate structured documentation using AI'
                : 'Select or create a patient to begin recording'
              }
            </p>
          </div>

          {/* Error Alert */}
          {aiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">{aiError}</AlertDescription>
            </Alert>
          )}

          {/* Recording Interface - Only show when patient is selected */}
          {patient && (
            <Card className="border-2 border-primary">
              <CardContent className="p-6 sm:p-12 flex flex-col items-center justify-center">
                {!isRecording && !isProcessing && (
                  <>
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="w-24 sm:w-32 h-24 sm:h-32 rounded-full medical-gradient hover:opacity-90 transition-opacity"
                    >
                      <Mic className="w-8 sm:w-12 h-8 sm:h-12" />
                    </Button>
                    <p className="text-base sm:text-lg font-medium mt-4 sm:mt-6">Click to Start Recording</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Record your patient conversation
                    </p>
                  </>
                )}

                {isRecording && (
                  <>
                    <div className="relative mb-6 sm:mb-8">
                      <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-destructive flex items-center justify-center recording-pulse">
                        <Mic className="w-8 sm:w-12 h-8 sm:h-12 text-destructive-foreground" />
                      </div>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="flex items-center gap-0.5 sm:gap-1 h-12 sm:h-16 mb-4 sm:mb-6">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 sm:w-1 bg-primary rounded-full animate-pulse-wave"
                          style={{
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>

                    <div className="text-2xl sm:text-4xl font-bold text-destructive mb-3 sm:mb-4">
                      {formatTime(recordingTime)}
                    </div>

                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={stopRecording}
                      className="gap-2"
                    >
                      <Square className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="text-sm sm:text-base">Stop Recording</span>
                    </Button>
                  </>
                )}

                {isProcessing && (
                  <>
                    <Loader2 className="w-12 sm:w-16 h-12 sm:h-16 animate-spin text-primary mb-4 sm:mb-6" />
                    <p className="text-base sm:text-lg font-medium">{processingStep || 'Processing...'}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      This may take a few moments
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alert Summary Panel */}
          {showAlertSummary && alerts.length > 0 && (
            <AlertSummaryPanel
              alerts={alerts}
              timestamp={alertSummaryTimestamp}
              onDismiss={(id) => handleDismissAlert(id)}
              onAddToPlan={(alert) => handleAddToPlan(alert)}
              onClearAll={handleClearAllAlerts}
            />
          )}

          {/* Important Note */}
          <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs sm:text-sm text-amber-900 text-center">
              <strong>IMPORTANT:</strong> Always review and verify AI-generated clinical notes before submission. 
              This system is designed to assist documentation and should not replace clinical judgment.
            </p>
          </div>
        </div>

        {/* Right Sidebar - Alerts Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AlertsPanel
              alerts={alerts}
              onDismissAlert={handleDismissAlert}
              onAddToPlan={handleAddToPlan}
              onClearAll={handleClearAllAlerts}
              hasNewAlert={hasNewAlert}
            />
          </div>
        </div>
      </div>

      {/* New Patient Dialog */}
      <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Patient
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                placeholder="Enter patient name"
                value={newPatientForm.name}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientAge">Age</Label>
                <Input
                  id="patientAge"
                  type="number"
                  placeholder="Age"
                  value={newPatientForm.age}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientGender">Gender</Label>
                <Select 
                  value={newPatientForm.gender} 
                  onValueChange={(value: 'M' | 'F' | 'O') => setNewPatientForm({ ...newPatientForm, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientPhone">Phone</Label>
              <Input
                id="patientPhone"
                placeholder="Phone number"
                value={newPatientForm.phone}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientEmail">Email</Label>
              <Input
                id="patientEmail"
                type="email"
                placeholder="Email address"
                value={newPatientForm.email}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPatientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePatient} disabled={isCreatingPatient}>
              {isCreatingPatient ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
