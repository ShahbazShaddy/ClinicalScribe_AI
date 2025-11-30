import { useState, useEffect } from 'react';
import { Search, FileText, Filter } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page, Note } from '@/App';

interface PastNotesPageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteSelect: (note: Note) => void;
}

export default function PastNotesPage({ user, onNavigate, onLogout, onNoteSelect }: PastNotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
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

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || note.noteType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading || dbLoading) {
    return (
      <DashboardLayout user={user} currentPage="past-notes" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} currentPage="past-notes" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Past Notes</h1>
          <p className="text-muted-foreground">
            View and manage all your clinical documentation
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or complaint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SOAP">SOAP Notes</SelectItem>
              <SelectItem value="Progress">Progress Notes</SelectItem>
              <SelectItem value="Consultation">Consultation</SelectItem>
              <SelectItem value="H&P">H&P</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first clinical note to get started'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => onNoteSelect(note)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {note.patientName}
                        </h3>
                        <span className="px-3 py-1 text-xs rounded-full bg-primary-100 text-primary-700 font-medium whitespace-nowrap">
                          {note.noteType}
                        </span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Date:</span>
                          <span>{new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Duration:</span>
                          <span>{Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')} min</span>
                        </div>
                        {note.patientAge && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Age:</span>
                            <span>{note.patientAge}</span>
                          </div>
                        )}
                        {note.chiefComplaint && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Complaint:</span>
                            <span className="truncate">{note.chiefComplaint}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="whitespace-nowrap">
                      View Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredNotes.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            <span>
              Showing {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>
            <span>
              Total time recorded: {Math.round(filteredNotes.reduce((sum, note) => sum + note.duration, 0) / 60)} minutes
            </span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
