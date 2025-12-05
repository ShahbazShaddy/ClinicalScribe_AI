import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AlertsPanel from '@/components/AlertsPanel';
import AlertSummaryPanel from '@/components/AlertSummaryPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { generateUniqueId } from '@/lib/utils';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page, Note } from '@/App';
import { useAI } from '@/hooks/useAI';
import type { Alert as AlertType } from '@/types/alerts';
import { generateSimulatedAlerts } from '@/lib/alertDefinitions';

interface RecordingPageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteCreated: (note: Note) => void;
}

export default function RecordingPage({ user, onNavigate, onLogout, onNoteCreated }: RecordingPageProps) {
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
      
      // Step 2: Extract patient information from audio
      setProcessingStep('Extracting patient information...');
      console.log('📋 Extracting patient info from audio');
      const patientInfo = await extractPatientInfoFromAudio(transcribedText);
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
        patientName: patientInfo.name || `Patient-${generateUniqueId()}`,
        patientAge: patientInfo.age,
        chiefComplaint: patientInfo.chiefComplaint,
        noteType: 'Flexible', // Mark as flexible/dynamic
        date: new Date().toISOString(),
        duration: duration,
        content: noteContent
      };

      console.log('Creating note with extracted patient info:', {
        patientName: note.patientName,
        patientAge: note.patientAge,
        chiefComplaint: note.chiefComplaint,
        sections: Object.keys(note.content),
        sectionCount: Object.keys(note.content).length,
        duration: note.duration,
        durationInMinutes: Math.floor(note.duration / 60)
      });

      // Save to database
      try {
        const userId = user.id || generateUniqueId();
        const savedNote = await saveNote(userId, {
          patientName: note.patientName,
          patientAge: note.patientAge,
          chiefComplaint: note.chiefComplaint,
          noteType: note.noteType,
          duration: note.duration,
          content: note.content
        });
        
        console.log('Note saved to database:', {
          savedNote,
          duration: savedNote?.duration
        });
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
    <DashboardLayout user={user} currentPage="recording" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
        {/* Main Content - Recording Interface */}
        <div className="lg:col-span-3 space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Create New Clinical Note</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Record patient conversation and generate structured documentation using AI
            </p>
          </div>

          {/* Error Alert */}
          {aiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">{aiError}</AlertDescription>
            </Alert>
          )}

          {/* Recording Interface */}
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
                    className="px-6 sm:px-8"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                </>
              )}

              {isProcessing && (
                <>
                  <Loader2 className="w-12 sm:w-16 h-12 sm:h-16 text-primary animate-spin mb-4 sm:mb-6" />
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Analyzing Recording...</h3>
                  <div className="space-y-2 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      {processingStep || 'Processing...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                      Powered by Groq AI
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Important Note */}
          <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs sm:text-sm text-amber-900 text-center">
              <strong>IMPORTANT:</strong> Always review and verify AI-generated clinical notes before submission. 
              This system is designed to assist documentation and should not replace clinical judgment.
            </p>
          </div>

          {/* Alert Summary Panel - shown after recording stops */}
          {showAlertSummary && alerts.length > 0 && (
            <AlertSummaryPanel alerts={alerts} timestamp={alertSummaryTimestamp} />
          )}
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
    </DashboardLayout>
  );
}
