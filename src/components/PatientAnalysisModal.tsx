import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TrendingUp, TrendingDown, Activity, Calendar, Heart, Scale, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { getPatientStatistics, getVisitsWithNotesByPatientId } from '@/db/services';
import { getRiskLevelColor } from '@/services/riskAssessment';
import type { Patient } from '@/App';

interface PatientAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

interface VisitWithDetails {
  id: string;
  date: string;
  visitType: string;
  diagnosis?: string;
  vitals: any;
  riskLevel?: string;
  riskScore?: number;
}

export function PatientAnalysisModal({ isOpen, onClose, patient }: PatientAnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);

  useEffect(() => {
    if (isOpen && patient.id) {
      loadData();
    }
  }, [isOpen, patient.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get statistics
      const stats = await getPatientStatistics(patient.id);
      setStatistics(stats);

      // Get visits with details
      const visitsData = await getVisitsWithNotesByPatientId(patient.id);
      const formattedVisits = visitsData.map(v => ({
        id: v.id,
        date: v.visit_date,
        visitType: v.visit_type || 'routine',
        diagnosis: v.diagnosis,
        vitals: v.vitals || {},
        riskLevel: v.risk_level,
        riskScore: v.risk_score,
      }));
      setVisits(formattedVisits);
    } catch (error) {
      console.error('Error loading patient analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process vitals data for charts
  const vitalsChartData = visits.map(v => {
    const bp = v.vitals?.bp?.split('/');
    return {
      date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic: bp ? parseInt(bp[0]) : null,
      diastolic: bp ? parseInt(bp[1]) : null,
      heartRate: v.vitals?.heartRate || null,
      weight: v.vitals?.weight || null,
      temperature: v.vitals?.temperature || null,
      oxygenSaturation: v.vitals?.oxygenSaturation || null,
    };
  }).reverse();

  // Process risk history for chart
  const riskChartData = statistics?.riskHistory?.map((r: any) => ({
    date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: r.risk_score,
    level: r.risk_level,
  })) || [];

  // Visit frequency data
  const visitFrequencyData = visits.reduce((acc: any[], v) => {
    const month = new Date(v.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const existing = acc.find(a => a.month === month);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []).reverse();

  // Get latest vitals for comparison
  const latestVitals = visits[0]?.vitals || {};
  const previousVitals = visits[1]?.vitals || {};

  const getVitalTrend = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return null;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            Patient Analysis - {patient.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Visits</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{statistics?.totalVisits || 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Avg Duration</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {statistics?.avgVisitDuration ? Math.round(statistics.avgVisitDuration / 60) : 0}m
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                    </div>
                    <Badge 
                      className={`mt-1 ${getRiskLevelColor(patient.riskLevel || 'low')}`}
                    >
                      {(patient.riskLevel || 'Low').toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last Visit</span>
                    </div>
                    <p className="text-sm font-medium mt-1">
                      {statistics?.lastVisit 
                        ? new Date(statistics.lastVisit).toLocaleDateString()
                        : 'No visits'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for different analyses */}
              <Tabs defaultValue="vitals" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="vitals">Vitals Trend</TabsTrigger>
                  <TabsTrigger value="risk">Risk History</TabsTrigger>
                  <TabsTrigger value="visits">Visit Frequency</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                {/* Vitals Tab */}
                <TabsContent value="vitals" className="space-y-4">
                  {/* Current Vitals Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-muted-foreground">BP</span>
                        </div>
                        {getVitalTrend(
                          parseInt(latestVitals.bp?.split('/')[0]),
                          parseInt(previousVitals.bp?.split('/')[0])
                        ) === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                        {getVitalTrend(
                          parseInt(latestVitals.bp?.split('/')[0]),
                          parseInt(previousVitals.bp?.split('/')[0])
                        ) === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-lg font-semibold mt-1">{latestVitals.bp || 'N/A'}</p>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-pink-500" />
                          <span className="text-xs text-muted-foreground">Heart Rate</span>
                        </div>
                        {getVitalTrend(latestVitals.heartRate, previousVitals.heartRate) === 'up' && 
                          <TrendingUp className="h-4 w-4 text-orange-500" />}
                        {getVitalTrend(latestVitals.heartRate, previousVitals.heartRate) === 'down' && 
                          <TrendingDown className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {latestVitals.heartRate ? `${latestVitals.heartRate} bpm` : 'N/A'}
                      </p>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground">Weight</span>
                        </div>
                        {getVitalTrend(latestVitals.weight, previousVitals.weight) === 'up' && 
                          <TrendingUp className="h-4 w-4 text-orange-500" />}
                        {getVitalTrend(latestVitals.weight, previousVitals.weight) === 'down' && 
                          <TrendingDown className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {latestVitals.weight ? `${latestVitals.weight} kg` : 'N/A'}
                      </p>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-cyan-500" />
                          <span className="text-xs text-muted-foreground">SpO2</span>
                        </div>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {latestVitals.oxygenSaturation ? `${latestVitals.oxygenSaturation}%` : 'N/A'}
                      </p>
                    </Card>
                  </div>

                  {/* Blood Pressure Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Blood Pressure Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vitalsChartData.some(d => d.systolic) ? (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={vitalsChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" fontSize={10} />
                              <YAxis domain={[60, 180]} fontSize={10} />
                              <Tooltip />
                              <Area 
                                type="monotone" 
                                dataKey="systolic" 
                                stackId="1"
                                stroke="#ef4444" 
                                fill="#fecaca" 
                                name="Systolic"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="diastolic" 
                                stackId="2"
                                stroke="#3b82f6" 
                                fill="#bfdbfe" 
                                name="Diastolic"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          No blood pressure data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Heart Rate & Weight Chart */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Heart Rate Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {vitalsChartData.some(d => d.heartRate) ? (
                          <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={vitalsChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={10} />
                                <YAxis domain={[50, 120]} fontSize={10} />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="heartRate" 
                                  stroke="#ec4899" 
                                  strokeWidth={2}
                                  dot={{ fill: '#ec4899' }}
                                  name="Heart Rate"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-36 flex items-center justify-center text-muted-foreground text-sm">
                            No heart rate data
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Weight Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {vitalsChartData.some(d => d.weight) ? (
                          <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={vitalsChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="weight" 
                                  stroke="#3b82f6" 
                                  strokeWidth={2}
                                  dot={{ fill: '#3b82f6' }}
                                  name="Weight (kg)"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-36 flex items-center justify-center text-muted-foreground text-sm">
                            No weight data
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Risk History Tab */}
                <TabsContent value="risk" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risk Score Over Time</CardTitle>
                      <CardDescription>Track how patient risk has changed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {riskChartData.length > 0 ? (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={riskChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" fontSize={10} />
                              <YAxis domain={[0, 100]} fontSize={10} />
                              <Tooltip />
                              <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#f59e0b" 
                                fill="#fef3c7" 
                                name="Risk Score"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          No risk history data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Risk Factors */}
                  {patient.riskFactors && patient.riskFactors.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Current Risk Factors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {patient.riskFactors.map((factor, i) => (
                            <Badge key={i} variant="secondary">{factor}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Visit Frequency Tab */}
                <TabsContent value="visits" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Visits Per Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {visitFrequencyData.length > 0 ? (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={visitFrequencyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" fontSize={10} />
                              <YAxis allowDecimals={false} fontSize={10} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#3b82f6" name="Visits" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          No visit data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recent Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {visits.slice(0, 5).map((visit, i) => (
                          <div key={visit.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {new Date(visit.date).toLocaleDateString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {visit.visitType}
                                </Badge>
                              </div>
                              {visit.diagnosis && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {visit.diagnosis}
                                </p>
                              )}
                            </div>
                            {visit.riskLevel && (
                              <Badge className={getRiskLevelColor(visit.riskLevel)}>
                                {visit.riskLevel}
                              </Badge>
                            )}
                          </div>
                        ))}
                        {visits.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No visits recorded</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conditions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Diagnoses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {patient.diagnoses && patient.diagnoses.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {patient.diagnoses.map((d, i) => (
                              <Badge key={i} variant="secondary">{d}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No diagnoses recorded</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Medications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {patient.medications && patient.medications.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {patient.medications.map((m, i) => (
                              <Badge key={i} variant="outline">{m}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No medications recorded</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}

        <div className="border-t p-4">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
