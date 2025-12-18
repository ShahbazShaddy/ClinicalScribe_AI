import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, Send, Loader2, Sparkles, RefreshCw, Edit3, History, 
  CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import type { Patient, Visit } from '@/App';
import { 
  generateVisitEmail, 
  regenerateEmail, 
  sendEmail, 
  isValidEmail,
  type VisitEmailContext 
} from '@/services/emailService';
import { 
  createPatientEmail, 
  getPatientEmails, 
  updatePatientEmail, 
  markEmailAsSent,
  getPatientVisits
} from '@/db/services';

interface PatientEmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  visit?: Visit;
  userId: string;
  doctorName: string;
}

interface EmailRecord {
  id: string;
  subject: string;
  body: string;
  recipientEmail: string;
  status: string;
  sentAt?: string;
  createdAt: string;
  emailType: string;
}

export function PatientEmailComposer({
  isOpen,
  onClose,
  patient,
  visit,
  userId,
  doctorName,
}: PatientEmailComposerProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Email form state
  const [recipientEmail, setRecipientEmail] = useState(patient.email || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  
  // Email history
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([]);
  
  // Latest visit for context
  const [latestVisit, setLatestVisit] = useState<Visit | null>(visit || null);

  // Load patient's latest visit if not provided
  useEffect(() => {
    const loadLatestVisit = async () => {
      if (!visit && patient.id) {
        try {
          const visits = await getPatientVisits(patient.id);
          if (visits && visits.length > 0) {
            setLatestVisit(visits[0] as unknown as Visit);
          }
        } catch (err) {
          console.error('Error loading visits:', err);
        }
      }
    };
    loadLatestVisit();
  }, [patient.id, visit]);

  // Load email history
  useEffect(() => {
    const loadEmailHistory = async () => {
      if (activeTab === 'history' && patient.id) {
        setIsLoadingHistory(true);
        try {
          const emails = await getPatientEmails(patient.id);
          setEmailHistory(emails.map(e => ({
            id: e.id,
            subject: e.subject,
            body: e.body,
            recipientEmail: e.recipientEmail,
            status: e.status,
            sentAt: e.sentAt ? e.sentAt.toString() : undefined,
            createdAt: e.createdAt.toString(),
            emailType: e.emailType,
          })));
        } catch (err) {
          console.error('Error loading email history:', err);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };
    loadEmailHistory();
  }, [activeTab, patient.id]);

  // Generate email content
  const handleGenerateEmail = async () => {
    if (!latestVisit) {
      toast.error('No visit data available to generate email');
      return;
    }

    setIsGenerating(true);
    try {
      const context: VisitEmailContext = {
        patientName: patient.name,
        patientAge: patient.age,
        doctorName: doctorName,
        visitDate: latestVisit.date,
        chiefComplaint: latestVisit.complaint,
        diagnosis: latestVisit.diagnosis,
        treatmentPlan: latestVisit.treatmentPlan,
        medications: patient.medications,
        followUpDate: latestVisit.followUpDate,
        vitals: latestVisit.vitals,
      };

      const result = await generateVisitEmail(context);
      setSubject(result.subject);
      setBody(result.body);
      toast.success('Email generated successfully');
    } catch (err) {
      console.error('Error generating email:', err);
      toast.error('Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate with custom prompt
  const handleRegenerateEmail = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt to regenerate the email');
      return;
    }

    if (!latestVisit) {
      toast.error('No visit data available');
      return;
    }

    setIsGenerating(true);
    try {
      const context: VisitEmailContext = {
        patientName: patient.name,
        patientAge: patient.age,
        doctorName: doctorName,
        visitDate: latestVisit.date,
        chiefComplaint: latestVisit.complaint,
        diagnosis: latestVisit.diagnosis,
        treatmentPlan: latestVisit.treatmentPlan,
        medications: patient.medications,
        followUpDate: latestVisit.followUpDate,
        vitals: latestVisit.vitals,
      };

      const result = await regenerateEmail(
        context,
        customPrompt,
        { subject, body }
      );
      
      setSubject(result.subject);
      setBody(result.body);
      setShowPromptInput(false);
      setCustomPrompt('');
      toast.success('Email regenerated successfully');
    } catch (err) {
      console.error('Error regenerating email:', err);
      toast.error('Failed to regenerate email');
    } finally {
      setIsGenerating(false);
    }
  };

  // Send email
  const handleSendEmail = async () => {
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in both subject and body');
      return;
    }

    setIsSending(true);
    try {
      // Save email to database first
      const savedEmail = await createPatientEmail({
        userId,
        patientId: patient.id,
        visitId: latestVisit?.id,
        subject,
        body,
        recipientEmail,
        recipientName: patient.name,
        emailType: 'visit_summary',
        status: 'sending',
        aiGenerated: true,
        generationContext: latestVisit ? {
          visitDate: latestVisit.date,
          chiefComplaint: latestVisit.complaint,
          diagnosis: latestVisit.diagnosis,
        } : undefined,
      });

      // Send the email
      const result = await sendEmail({
        to: recipientEmail,
        toName: patient.name,
        subject,
        body,
      });

      if (result.success) {
        // Update email status to sent
        if (savedEmail) {
          await markEmailAsSent(savedEmail.id);
        }
        toast.success('Email sent successfully!');
        onClose();
      } else {
        // Update email status to failed
        if (savedEmail) {
          await updatePatientEmail(savedEmail.id, { status: 'failed' });
        }
        toast.error(result.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Edit3 className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Patient - {patient.name}
          </DialogTitle>
          <DialogDescription>
            Send an AI-generated email summary of the latest visit to your patient
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'compose' | 'history')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Compose Email
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Email History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="flex-1 flex flex-col space-y-4 mt-4">
            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="patient@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              {recipientEmail && !isValidEmail(recipientEmail) && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Generate Button */}
            {!subject && !body && (
              <Button 
                onClick={handleGenerateEmail} 
                disabled={isGenerating || !latestVisit}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Email from Latest Visit
                  </>
                )}
              </Button>
            )}

            {!latestVisit && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No visit data found for this patient. Please create a visit first.
              </p>
            )}

            {/* Subject */}
            {(subject || body) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Body */}
                <div className="space-y-2 flex-1">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    placeholder="Email content..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </div>

                {/* Regenerate Section */}
                <div className="space-y-2">
                  {showPromptInput ? (
                    <div className="space-y-2">
                      <Label>Custom Prompt</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Make it more friendly, add medication reminders..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRegenerateEmail()}
                        />
                        <Button 
                          onClick={handleRegenerateEmail} 
                          disabled={isGenerating || !customPrompt.trim()}
                        >
                          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowPromptInput(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowPromptInput(true)}
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerate with Custom Instructions
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : emailHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mb-3 opacity-50" />
                <p>No emails sent to this patient yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {emailHistory.map((email) => (
                    <Card key={email.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">{email.subject}</h4>
                          {getStatusBadge(email.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {email.body}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>To: {email.recipientEmail}</span>
                          <span>
                            {email.sentAt 
                              ? `Sent ${new Date(email.sentAt).toLocaleDateString()}`
                              : `Created ${new Date(email.createdAt).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === 'compose' && subject && body && (
            <Button 
              onClick={handleSendEmail} 
              disabled={isSending || !isValidEmail(recipientEmail)}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
