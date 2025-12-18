import { useEffect, useState, useMemo } from 'react';
import { 
  FileText, Clock, Activity, Plus, Users, AlertTriangle, 
  TrendingUp, Calendar, ChevronRight, Heart, Shield,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDatabase } from '@/hooks/useDatabase';
import { 
  getDashboardStats, 
  getHighRiskPatients, 
  getVisitTrends, 
  getRecentActivity,
  getUpcomingFollowUps,
  type DashboardStats,
  type VisitTrendData,
  type RecentActivity
} from '@/db/services';
import type { User, Page, Note } from '@/App';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteSelect?: (note: Note) => void;
}

const RISK_COLORS = { low: '#22c55e', medium: '#eab308', high: '#ef4444' };

export default function Dashboard({ user, onNavigate, onLogout, onNoteSelect }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [highRiskPatientsList, setHighRiskPatientsList] = useState<Array<{
    id: string;
    name: string;
    age: number;
    gender: string;
    riskLevel?: string;
    riskScore?: number;
    riskFactors?: string[];
  }>>([]);
  const [visitTrends, setVisitTrends] = useState<VisitTrendData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<Array<{
    patientId: string;
    patientName: string;
    followUpDate: string;
    reason: string;
    riskLevel?: string;
  }>>([]);
  const { fetchNotes, isLoading: dbLoading } = useDatabase();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (user.id) {
          // Fetch all data in parallel
          const [
            dbNotes,
            dashboardStats,
            riskPatients,
            trends,
            activity,
            followUps
          ] = await Promise.all([
            fetchNotes(user.id),
            getDashboardStats(user.id),
            getHighRiskPatients(user.id),
            getVisitTrends(user.id, 30),
            getRecentActivity(user.id, 10),
            getUpcomingFollowUps(user.id)
          ]);

          setNotes(dbNotes);
          setStats(dashboardStats);
          setHighRiskPatientsList(riskPatients);
          setVisitTrends(trends);
          setRecentActivity(activity);
          setUpcomingFollowUps(followUps);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [user.id, fetchNotes]);

  // Calculate derived stats
  const totalMinutes = notes.reduce((sum, note) => sum + note.duration, 0);
  const timesSaved = Math.round((totalMinutes * 2) / 60); // Assuming 2x time saved

  // Prepare chart data
  const riskPieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Low Risk', value: stats.riskDistribution.low, color: RISK_COLORS.low },
      { name: 'Medium Risk', value: stats.riskDistribution.medium, color: RISK_COLORS.medium },
      { name: 'High Risk', value: stats.riskDistribution.high, color: RISK_COLORS.high },
    ].filter(d => d.value > 0);
  }, [stats]);

  const ageBarData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: '<30', value: stats.patientsByAgeGroup.under30 },
      { name: '30-50', value: stats.patientsByAgeGroup.age30to50 },
      { name: '50-70', value: stats.patientsByAgeGroup.age50to70 },
      { name: '70+', value: stats.patientsByAgeGroup.over70 },
    ];
  }, [stats]);

  const visitTypeData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.visitsByType).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [stats]);

  // Weekly trend summary
  const weeklyTrend = useMemo(() => {
    if (visitTrends.length < 14) return { change: 0, direction: 'neutral' };
    const lastWeek = visitTrends.slice(-7).reduce((sum, d) => sum + d.visits, 0);
    const prevWeek = visitTrends.slice(-14, -7).reduce((sum, d) => sum + d.visits, 0);
    const change = prevWeek > 0 ? Math.round(((lastWeek - prevWeek) / prevWeek) * 100) : 0;
    return {
      change: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  }, [visitTrends]);

  if (isLoading || dbLoading) {
    return (
      <DashboardLayout user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = stats && (stats.totalPatients > 0 || stats.totalVisits > 0 || notes.length > 0);

  return (
    <DashboardLayout user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Welcome back, Dr. {user.name.split(' ').pop()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.specialty} • {user.practiceName} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button onClick={() => onNavigate('recording')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Recording
          </Button>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activePatients || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalPatients || 0} total registered
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.highRiskPatients || 0}</div>
              <p className="text-xs text-muted-foreground">
                Patients requiring attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visits This Month</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.visitsThisMonth || 0}</div>
              <div className="flex items-center text-xs">
                {weeklyTrend.direction === 'up' && (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{weeklyTrend.change}% vs last week</span>
                  </>
                )}
                {weeklyTrend.direction === 'down' && (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-red-500">-{weeklyTrend.change}% vs last week</span>
                  </>
                )}
                {weeklyTrend.direction === 'neutral' && (
                  <>
                    <Minus className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-muted-foreground">No change</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesSaved}h</div>
              <p className="text-xs text-muted-foreground">
                {notes.length} notes generated
              </p>
            </CardContent>
          </Card>
        </div>

        {!hasData ? (
          /* Empty State */
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start by adding patients and recording clinical notes to see your practice analytics and insights here.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onNavigate('patients')}>
                  <Users className="w-4 h-4 mr-2" />
                  Add Patients
                </Button>
                <Button onClick={() => onNavigate('recording')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Main Dashboard Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Visit Trends Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Visit Activity</CardTitle>
                        <CardDescription>Daily visits over the last 30 days</CardDescription>
                      </div>
                      <Badge variant="outline">{stats?.totalVisits || 0} total</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {visitTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={visitTrends}>
                          <defs>
                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            interval="preserveStartEnd"
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value: number, name: string) => [value, name === 'visits' ? 'Visits' : 'Avg Risk']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="visits" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorVisits)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No visit data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Demographics Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Risk Distribution */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Patient Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {riskPieData.length > 0 ? (
                        <div className="flex items-center gap-4">
                          <ResponsiveContainer width={120} height={120}>
                            <PieChart>
                              <Pie
                                data={riskPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {riskPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-2 flex-1">
                            {riskPieData.map((item) => (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="text-sm">{item.name}</span>
                                </div>
                                <span className="font-semibold">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
                          No patient data
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Age Distribution */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Patient Age Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ageBarData.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height={120}>
                          <BarChart data={ageBarData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
                          No patient data
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Visit Types */}
                {visitTypeData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Visit Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {visitTypeData.map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.name}</span>
                              <span className="font-medium">{item.value}</span>
                            </div>
                            <Progress 
                              value={(item.value / (stats?.totalVisits || 1)) * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Lists */}
              <div className="space-y-6">
                {/* High Risk Patients */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        High Risk Patients
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => onNavigate('patients')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {highRiskPatientsList.length > 0 ? (
                      highRiskPatientsList.slice(0, 5).map((patient) => (
                        <div 
                          key={patient.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => onNavigate('patients')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <Heart className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {patient.age}y • {patient.riskFactors?.[0] || 'High risk'}
                              </p>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {patient.riskScore || 0}%
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No high-risk patients</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Follow-ups */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Upcoming Follow-ups
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingFollowUps.length > 0 ? (
                      upcomingFollowUps.slice(0, 5).map((followUp, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100"
                        >
                          <div>
                            <p className="font-medium text-sm">{followUp.patientName}</p>
                            <p className="text-xs text-muted-foreground">{followUp.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(followUp.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            {followUp.riskLevel && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  followUp.riskLevel === 'high' ? 'border-red-300 text-red-600' :
                                  followUp.riskLevel === 'medium' ? 'border-yellow-300 text-yellow-600' :
                                  'border-green-300 text-green-600'
                                }`}
                              >
                                {followUp.riskLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No upcoming follow-ups</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'note' ? 'bg-primary/10' :
                            activity.type === 'visit' ? 'bg-green-100' :
                            'bg-yellow-100'
                          }`}>
                            {activity.type === 'note' && <FileText className="h-4 w-4 text-primary" />}
                            {activity.type === 'visit' && <Activity className="h-4 w-4 text-green-600" />}
                            {activity.type === 'risk_update' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.patientName || activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate('patients')}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manage Patients</h3>
                    <p className="text-sm text-muted-foreground">{stats?.activePatients || 0} active patients</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate('settings')}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Practice Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure preferences</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
