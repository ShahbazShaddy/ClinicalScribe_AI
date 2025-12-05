import { useEffect, useState } from 'react';
import { FileText, Clock, Activity, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HighRiskPatientCard from '@/components/HighRiskPatientCard';
import PracticeStatisticsCards from '@/components/PracticeStatisticsCards';
import PriorityListPanel from '@/components/PriorityListPanel';
import RiskTrendsChart from '@/components/RiskTrendsChart';
import MorningBriefing from '@/components/MorningBriefing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDatabase } from '@/hooks/useDatabase';
import type { User, Page, Note } from '@/App';
import {
  highRiskPatients,
  getHighRiskPatientsByFilter,
  getPracticeStatistics,
  getTodaysPriorityList,
  getRiskTrendData
} from '@/lib/dashboardData';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteSelect?: (note: Note) => void;
}

export default function Dashboard({ user, onNavigate, onLogout, onNoteSelect }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientFilter, setPatientFilter] = useState<'today' | 'week' | 'all'>('week');
  const [scrollPosition, setScrollPosition] = useState(0);
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

  const filteredHighRiskPatients = getHighRiskPatientsByFilter(patientFilter);
  const practiceStats = getPracticeStatistics();
  const priorityList = getTodaysPriorityList();
  const riskTrendData = getRiskTrendData();

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
        {/* Morning Briefing Banner */}
        <MorningBriefing
          doctorName={user.name}
          urgentPatients={highRiskPatients.filter(p => p.urgencyLevel === 'urgent').length}
          pendingLabResults={5}
          overdueAppointments={2}
          onStartDay={() => {
            // Scroll to high-risk patients section
            document.getElementById('high-risk-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Welcome, Dr. {user.name.split(' ').pop()}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {user.specialty} • {user.practiceName}
          </p>
        </div>

        {/* High-Risk Patients Section */}
        <section id="high-risk-section" className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">Patients Requiring Attention</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Based on AI risk assessment</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
            {(['today', 'week', 'all'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setPatientFilter(filter)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  patientFilter === filter
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'All High-Risk'}
              </button>
            ))}
          </div>

          {/* High-Risk Patient Cards - Horizontally Scrollable */}
          <div className="relative group">
            <div
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-5 lg:overflow-visible lg:snap-none"
              id="patient-scroll"
            >
              {filteredHighRiskPatients.length > 0 ? (
                filteredHighRiskPatients.map(patient => (
                  <HighRiskPatientCard
                    key={patient.id}
                    patient={patient}
                    onViewPatient={(patientId) => {
                      console.log('View patient:', patientId);
                      onNavigate('patient');
                    }}
                    onContactPatient={(patientName) => {
                      console.log('Contact patient:', patientName);
                    }}
                  />
                ))
              ) : (
                <div className="w-full flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No high-risk patients for this period</p>
                </div>
              )}
            </div>

            {/* Scroll Buttons */}
            {filteredHighRiskPatients.length > 3 && (
              <>
                <button
                  onClick={() => {
                    const scroll = document.getElementById('patient-scroll');
                    if (scroll) scroll.scrollBy({ left: -400, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const scroll = document.getElementById('patient-scroll');
                    if (scroll) scroll.scrollBy({ left: 400, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </section>

        {/* Practice Intelligence - Statistics Cards */}
        <section className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Practice Intelligence</h2>
          </div>
          <PracticeStatisticsCards stats={practiceStats} />
        </section>

        {/* Two Column Layout: Priority List + Risk Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <PriorityListPanel
              items={priorityList}
              onItemClick={(itemId) => {
                console.log('Priority item clicked:', itemId);
              }}
            />
          </div>
          <div className="lg:col-span-2">
            <RiskTrendsChart
              data={riskTrendData}
              onViewAnalytics={() => {
                console.log('View full analytics');
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Notes Generated</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{totalNotes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Clinical documentation completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-gradient-to-br from-success/5 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Time Saved This Month</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-success">{timesSaved}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                More time for patient care
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{notes.slice(0, 7).length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Notes in the last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create New Note CTA */}
        <Card className="border-primary bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-primary-foreground">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-4 sm:p-8 gap-4 sm:gap-6">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Create New Clinical Note</h3>
              <p className="text-xs sm:text-base text-primary-foreground/90">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Recent Notes</h2>
            <Button
              variant="outline"
              size="sm"
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
            <div className="grid gap-3 sm:gap-4">
              {notes.slice(0, 5).map((note) => (
                <Card
                  key={note.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                >
                  <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">
                          {note.patientName || 'Patient ' + note.id.slice(0, 8)}
                        </h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700 w-fit">
                          {note.noteType}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                        <span className="hidden sm:block">•</span>
                        <span>{Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')} min</span>
                        {note.chiefComplaint && (
                          <>
                            <span className="hidden sm:block">•</span>
                            <span className="truncate">{note.chiefComplaint}</span>
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
