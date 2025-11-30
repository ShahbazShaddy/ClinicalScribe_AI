import { useEffect, useState } from 'react';
import { FileText, Clock, Activity, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page, Note } from '@/App';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteSelect?: (note: Note) => void;
}

export default function Dashboard({ user, onNavigate, onLogout, onNoteSelect }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchNotes, isLoading: dbLoading } = useDatabase();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        if (user.id) {
          const dbNotes = await fetchNotes(user.id);
          setNotes(dbNotes);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, [user.id, fetchNotes]);

  const totalNotes = notes.length;
  const totalMinutes = notes.reduce((sum, note) => sum + note.duration, 0);
  const timesSaved = Math.round((totalMinutes * 2) / 60); // Assuming 2x time saved

  if (isLoading || dbLoading) {
    return (
      <DashboardLayout user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, Dr. {user.name.split(' ').pop()}
          </h1>
          <p className="text-muted-foreground">
            {user.specialty} • {user.practiceName}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes Generated</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalNotes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Clinical documentation completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-gradient-to-br from-success/5 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved This Month</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{timesSaved}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                More time for patient care
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{notes.slice(0, 7).length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Notes in the last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create New Note CTA */}
        <Card className="border-primary bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-primary-foreground">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8 gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Create New Clinical Note</h3>
              <p className="text-primary-foreground/90">
                Start recording a patient conversation to generate comprehensive documentation
              </p>
            </div>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('recording')}
              className="whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Recording
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Notes</h2>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('past-notes')}
            >
              View All
            </Button>
          </div>

          {notes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create your first clinical note by recording a patient conversation
                </p>
                <Button onClick={() => onNavigate('recording')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {notes.slice(0, 5).map((note) => (
                <Card 
                  key={note.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                >
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {note.patientName || 'Patient ' + note.id.slice(0, 8)}
                        </h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                          {note.noteType}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')} min</span>
                        {note.chiefComplaint && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{note.chiefComplaint}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        onNoteSelect?.(note);
                        onNavigate('note');
                      }}
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
