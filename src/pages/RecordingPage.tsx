import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { generateUniqueId } from '@/lib/utils';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page, Note } from '@/App';
import { useAI } from '@/hooks/useAI';

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
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [noteType, setNoteType] = useState<'SOAP' | 'Progress' | 'Consultation' | 'H&P'>('SOAP');
  const [processingStep, setProcessingStep] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingDurationRef = useRef<number>(0);
  
  const { 
    transcribeClinicalRecording, 
    generateStructuredNoteContent,
    error: aiError,
    clearError 
  } = useAI();

  const { saveNote } = useDatabase();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      recordingDurationRef.current = 0; // Reset duration
      
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
      
      // Step 2: Generate structured clinical note
      setProcessingStep('Generating structured clinical note...');
      const noteContent = await generateStructuredNoteContent(transcribedText, noteType);
      console.log('Generated note content:', noteContent);
      
      // Step 3: Create note
      setProcessingStep('Creating clinical note...');

      const note: Note = {
        id: generateUniqueId(),
        patientName: patientName || `Patient-${generateUniqueId()}`,
        patientAge,
        chiefComplaint,
        noteType,
        date: new Date().toISOString(),
        duration: duration, // Use the passed duration
        content: noteContent
      };

      console.log('Creating note with duration:', {
        recordedDuration,
        recordingTime,
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
      onNoteCreated(note);
      toast.success('Clinical note generated successfully');
      
      // Reset form
      setPatientName('');
      setPatientAge('');
      setChiefComplaint('');
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

  return (
    <DashboardLayout user={user} currentPage="recording" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Clinical Note</h1>
          <p className="text-muted-foreground">
            Record patient conversation and generate structured documentation using AI
          </p>
        </div>

        {/* Error Alert */}
        {aiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}

        {/* Patient Information Form */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Patient Information (Optional)</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  placeholder="John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={isRecording || isProcessing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientAge">Age</Label>
                <Input
                  id="patientAge"
                  placeholder="45"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  disabled={isRecording || isProcessing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Input
                id="chiefComplaint"
                placeholder="e.g., Lower back pain"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                disabled={isRecording || isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label>Note Type</Label>
              <Select 
                value={noteType} 
                onValueChange={(value: any) => setNoteType(value)}
                disabled={isRecording || isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOAP">SOAP Note</SelectItem>
                  <SelectItem value="Progress">Progress Note</SelectItem>
                  <SelectItem value="Consultation">Consultation Note</SelectItem>
                  <SelectItem value="H&P">H&P (History & Physical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Card className="border-2 border-primary">
          <CardContent className="p-12 flex flex-col items-center justify-center">
            {!isRecording && !isProcessing && (
              <>
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="w-32 h-32 rounded-full medical-gradient hover:opacity-90 transition-opacity"
                >
                  <Mic className="w-12 h-12" />
                </Button>
                <p className="text-lg font-medium mt-6">Click to Start Recording</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Record your patient conversation
                </p>
              </>
            )}

            {isRecording && (
              <>
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-full bg-destructive flex items-center justify-center recording-pulse">
                    <Mic className="w-12 h-12 text-destructive-foreground" />
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-center gap-1 h-16 mb-6">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse-wave"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>

                <div className="text-4xl font-bold text-destructive mb-4">
                  {formatTime(recordingTime)}
                </div>

                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="px-8"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              </>
            )}

            {isProcessing && (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                <h3 className="text-2xl font-semibold mb-4">Analyzing Recording...</h3>
                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    {processingStep || 'Processing...'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Powered by Groq AI
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Important Note */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900 text-center">
            <strong>IMPORTANT:</strong> Always review and verify AI-generated clinical notes before submission. 
            This system is designed to assist documentation and should not replace clinical judgment.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
