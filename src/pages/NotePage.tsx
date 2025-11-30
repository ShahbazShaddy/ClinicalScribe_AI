import { useState } from 'react';
import { FileText, Download, Copy, RefreshCw, Edit2, Save, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useDatabase } from '@/hooks/useDatabase';
import { useAI } from '@/hooks/useAI';
import type { User, Page, Note } from '@/App';

interface NotePageProps {
  user: User;
  note: Note;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteDeleted?: () => void;
}

export default function NotePage({ user, note, onNavigate, onLogout, onNoteDeleted }: NotePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { editNote, saveNote, isLoading, removeNote } = useDatabase();
  const { generateStructuredNoteContent, isGenerating } = useAI();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedNote = { ...note, content: editedNote };
      
      // Save to database
      await editNote(note.id, updatedNote);
      
      toast.success('Note saved successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to save note');
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    const noteText = Object.entries(editedNote)
      .map(([key, value]) => `${key.toUpperCase()}:\n${value}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(noteText);
    toast.success('Note copied to clipboard');
  };

  const handleExport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(note.patientName || 'Clinical Note', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const headerInfo = `Date: ${new Date(note.date).toLocaleString()} | Duration: ${Math.floor(note.duration / 60)}:${(note.duration % 60).toString().padStart(2, '0')} | Type: ${note.noteType}`;
      doc.text(headerInfo, margin, yPosition);
      yPosition += 7;
      
      if (note.patientAge || note.chiefComplaint) {
        if (note.patientAge) doc.text(`Age: ${note.patientAge}`, margin, yPosition);
        yPosition += 5;
        if (note.chiefComplaint) {
          const wrappedComplaint = doc.splitTextToSize(`Chief Complaint: ${note.chiefComplaint}`, maxWidth);
          doc.text(wrappedComplaint, margin, yPosition);
          yPosition += wrappedComplaint.length * 5 + 3;
        }
      }
      
      yPosition += 5;
      
      const addSection = (title: string, content: string) => {
        if (!content) return;
        
        if (yPosition > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text(title, margin, yPosition);
        yPosition += 7;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const wrappedText = doc.splitTextToSize(content, maxWidth);
        doc.text(wrappedText, margin, yPosition);
        yPosition += wrappedText.length * 5 + 5;
      };
      
      if (note.noteType === 'SOAP') {
        addSection('SUBJECTIVE', editedNote.subjective || '');
        addSection('OBJECTIVE', editedNote.objective || '');
        addSection('ASSESSMENT', editedNote.assessment || '');
        addSection('PLAN', editedNote.plan || '');
      }
      
      addSection('ICD-10 Codes', editedNote.icd10 || '');
      addSection('CPT Codes', editedNote.cpt || '');
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        (doc as any).setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 15, pageHeight - 10);
      }
      
      doc.save(`clinical-note-${note.id.slice(0, 8)}.pdf`);
      toast.success('Note exported to PDF successfully');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      toast.error('Failed to export note to PDF');
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const currentContent = Object.entries(editedNote)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n\n');
      
      const newContent = await generateStructuredNoteContent(currentContent, note.noteType);
      setEditedNote(newContent);
      toast.success('Note regenerated successfully');
    } catch (err) {
      console.error('Error regenerating note:', err);
      toast.error('Failed to regenerate note');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this note for ${note.patientName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Starting note deletion for note ID:', note.id);
      const success = await removeNote(note.id);
      console.log('Delete operation completed. Success:', success);
      
      if (success) {
        console.log('Delete successful, showing success toast');
        toast.success('Note deleted successfully');
        
        console.log('Calling onNoteDeleted callback');
        onNoteDeleted?.();
        
        console.log('Navigating to dashboard');
        // Add a small delay to ensure deletion is processed
        await new Promise(resolve => setTimeout(resolve, 500));
        onNavigate('dashboard');
      } else {
        console.warn('Delete operation returned false');
        toast.error('Failed to delete note');
      }
    } catch (err) {
      console.error('Exception during note deletion:', err);
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout user={user} currentPage="note" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {note.patientName || 'Clinical Note'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(note.date).toLocaleString()}</span>
              <span>•</span>
              <span>Duration: {Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')}</span>
              <span>•</span>
              <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">
                {note.noteType} Note
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button onClick={handleSave} disabled={isSaving || isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving || isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={isDeleting || isEditing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Patient Info */}
        {(note.patientAge || note.chiefComplaint) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-6 text-sm">
                {note.patientAge && (
                  <div>
                    <span className="text-muted-foreground">Age: </span>
                    <span className="font-medium">{note.patientAge}</span>
                  </div>
                )}
                {note.chiefComplaint && (
                  <div>
                    <span className="text-muted-foreground">Chief Complaint: </span>
                    <span className="font-medium">{note.chiefComplaint}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isEditing}>
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
          <Button variant="outline" onClick={handleRegenerate} disabled={isEditing || isRegenerating || isGenerating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating || isGenerating ? 'animate-spin' : ''}`} />
            {isRegenerating || isGenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>

        {/* Note Content */}
        <div className="space-y-6">
          {note.noteType === 'SOAP' && (
            <>
              <NoteSection
                title="Subjective"
                content={editedNote.subjective || ''}
                isEditing={isEditing}
                onChange={(value) => setEditedNote({ ...editedNote, subjective: value })}
              />
              <NoteSection
                title="Objective"
                content={editedNote.objective || ''}
                isEditing={isEditing}
                onChange={(value) => setEditedNote({ ...editedNote, objective: value })}
              />
              <NoteSection
                title="Assessment"
                content={editedNote.assessment || ''}
                isEditing={isEditing}
                onChange={(value) => setEditedNote({ ...editedNote, assessment: value })}
              />
              <NoteSection
                title="Plan"
                content={editedNote.plan || ''}
                isEditing={isEditing}
                onChange={(value) => setEditedNote({ ...editedNote, plan: value })}
              />
            </>
          )}

          {/* ICD-10 and CPT Codes */}
          <div className="grid md:grid-cols-2 gap-6">
            <NoteSection
              title="ICD-10 Codes"
              content={editedNote.icd10 || ''}
              isEditing={isEditing}
              onChange={(value) => setEditedNote({ ...editedNote, icd10: value })}
            />
            <NoteSection
              title="CPT Codes"
              content={editedNote.cpt || ''}
              isEditing={isEditing}
              onChange={(value) => setEditedNote({ ...editedNote, cpt: value })}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900 text-center">
            <strong>⚠️ Important:</strong> AI-generated content must be reviewed and verified by a licensed healthcare provider before clinical use.
          </p>
        </div>

        {/* Feedback */}
        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Was this note accurate?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your feedback helps improve our AI
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => toast.success('Thank you for your feedback!')}>
                👍 Yes, accurate
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('Thank you for your feedback!')}>
                👎 Needs improvement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface NoteSectionProps {
  title: string;
  content: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

function NoteSection({ title, content, isEditing, onChange }: NoteSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-foreground">{content}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
