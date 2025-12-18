import React, { useEffect, useState } from 'react';
import type { User, Patient, Page, Note, Visit } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Mic, 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Pill, 
  AlertTriangle, 
  Stethoscope,
  FileText,
  Clock,
  Heart,
  Thermometer,
  Scale,
  Activity,
  Edit,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getVisitsByPatientId, 
  dbVisitToAppVisit, 
  updatePatient,
  getNoteById,
  dbNoteToAppNote
} from '@/db/services';
import { isSupabaseConfigured } from '@/db/client';

interface PatientDetailPageProps {
  user: User;
  patient: Patient;
  onNavigate: (page: Page) => void;
  onStartRecording: (patient: Patient) => void;
  onViewNote: (note: Note) => void;
  onPatientUpdated: (patient: Patient) => void;
  onLogout: () => void;
}

export default function PatientDetailPage({ 
  user, 
  patient, 
  onNavigate, 
  onStartRecording,
  onViewNote,
  onPatientUpdated,
  onLogout 
}: PatientDetailPageProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    diagnoses: patient.diagnoses?.join(', ') || '',
    medications: patient.medications?.join(', ') || '',
    allergies: patient.allergies?.join(', ') || '',
    notes: patient.notes || '',
  });

  useEffect(() => {
    loadVisits();
  }, [patient.id]);

  const loadVisits = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoadingVisits(false);
      return;
    }

    try {
      setIsLoadingVisits(true);
      const dbVisits = await getVisitsByPatientId(patient.id);
      const convertedVisits = dbVisits.map(v => dbVisitToAppVisit(v));
      setVisits(convertedVisits as Visit[]);
    } catch (error) {
      console.error('Error loading visits:', error);
      toast.error('Failed to load visits');
    } finally {
      setIsLoadingVisits(false);
    }
  };

  const handleViewNoteFromVisit = async (noteId: string) => {
    try {
      const dbNote = await getNoteById(noteId);
      if (dbNote) {
        const note = dbNoteToAppNote(dbNote);
        onViewNote(note as Note);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      toast.error('Failed to load note');
    }
  };

  const handleUpdatePatient = async () => {
    setIsSubmitting(true);
    try {
      const updatedPatient = await updatePatient(patient.id, {
        diagnoses: editFormData.diagnoses.split(',').map(d => d.trim()).filter(Boolean),
        medications: editFormData.medications.split(',').map(m => m.trim()).filter(Boolean),
        allergies: editFormData.allergies.split(',').map(a => a.trim()).filter(Boolean),
        notes: editFormData.notes,
      });

      if (updatedPatient) {
        toast.success('Patient updated successfully');
        setIsEditDialogOpen(false);
        onPatientUpdated({
          ...patient,
          diagnoses: editFormData.diagnoses.split(',').map(d => d.trim()).filter(Boolean),
          medications: editFormData.medications.split(',').map(m => m.trim()).filter(Boolean),
          allergies: editFormData.allergies.split(',').map(a => a.trim()).filter(Boolean),
          notes: editFormData.notes,
        });
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return mins > 0 ? `${mins} min` : '<1 min';
  };

  const getVisitTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      routine: 'bg-green-100 text-green-800',
      'follow-up': 'bg-blue-100 text-blue-800',
      urgent: 'bg-yellow-100 text-yellow-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout user={user} currentPage="patient" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onNavigate('patients')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-primary">{patient.name}</h1>
              <p className="text-sm text-muted-foreground">
                {patient.age && `${patient.age} years old`}
                {patient.age && patient.gender && ' • '}
                {patient.gender && (patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other')}
                {patient.medicalRecordNumber && ` • MRN: ${patient.medicalRecordNumber}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => onStartRecording(patient)}>
              <Mic className="h-4 w-4 mr-2" />
              New Recording
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{patient.address}</span>
                  </div>
                )}
                {patient.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>DOB: {patient.dateOfBirth}</span>
                  </div>
                )}
                {!patient.phone && !patient.email && !patient.address && (
                  <p className="text-sm text-muted-foreground">No contact information</p>
                )}
              </CardContent>
            </Card>

            {/* Medical Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Diagnoses</div>
                  <div className="flex flex-wrap gap-1">
                    {patient.diagnoses && patient.diagnoses.length > 0 ? (
                      patient.diagnoses.map((d, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No diagnoses</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Pill className="h-3 w-3" /> Medications
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {patient.medications && patient.medications.length > 0 ? (
                      patient.medications.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{m}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No medications</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Allergies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies && patient.allergies.length > 0 ? (
                      patient.allergies.map((a, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No known allergies</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Card */}
            {(patient.insuranceProvider || patient.insuranceId) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Insurance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {patient.insuranceProvider && (
                    <div>
                      <span className="text-muted-foreground">Provider: </span>
                      {patient.insuranceProvider}
                    </div>
                  )}
                  {patient.insuranceId && (
                    <div>
                      <span className="text-muted-foreground">ID: </span>
                      {patient.insuranceId}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Emergency Contact Card */}
            {(patient.emergencyContact || patient.emergencyPhone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {patient.emergencyContact && <div>{patient.emergencyContact}</div>}
                  {patient.emergencyPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {patient.emergencyPhone}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Visits */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Visit History
                  </span>
                  <Badge variant="outline">{visits.length} visits</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingVisits ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No visits yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start recording to create the first visit note
                    </p>
                    <Button onClick={() => onStartRecording(patient)}>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div
                        key={visit.id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div 
                          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{formatDate(visit.date)}</span>
                                <Badge className={getVisitTypeBadge(visit.visitType)}>
                                  {visit.visitType}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {visit.complaint || 'No chief complaint recorded'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(visit.duration)}
                              </span>
                              {expandedVisit === visit.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </div>

                        {expandedVisit === visit.id && (
                          <div className="border-t p-4 bg-muted/30 space-y-4">
                            {/* Vitals */}
                            {visit.vitals && Object.keys(visit.vitals).length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">VITALS</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {visit.vitals.bp && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span>BP: {visit.vitals.bp}</span>
                                    </div>
                                  )}
                                  {visit.vitals.heartRate && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Activity className="h-4 w-4 text-pink-500" />
                                      <span>HR: {visit.vitals.heartRate} bpm</span>
                                    </div>
                                  )}
                                  {visit.vitals.temperature && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Thermometer className="h-4 w-4 text-orange-500" />
                                      <span>Temp: {visit.vitals.temperature}°F</span>
                                    </div>
                                  )}
                                  {visit.vitals.weight && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Scale className="h-4 w-4 text-blue-500" />
                                      <span>Wt: {visit.vitals.weight} kg</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {visit.summary && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">SUMMARY</h4>
                                <p className="text-sm">{visit.summary}</p>
                              </div>
                            )}

                            {/* Diagnosis */}
                            {visit.diagnosis && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">DIAGNOSIS</h4>
                                <p className="text-sm">{visit.diagnosis}</p>
                              </div>
                            )}

                            {/* Treatment Plan */}
                            {visit.treatmentPlan && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">TREATMENT PLAN</h4>
                                <p className="text-sm">{visit.treatmentPlan}</p>
                              </div>
                            )}

                            {/* Follow-up */}
                            {visit.followUpDate && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">FOLLOW-UP</h4>
                                <p className="text-sm">{visit.followUpDate}</p>
                              </div>
                            )}

                            {/* View Full Note Button */}
                            {visit.noteId && (
                              <div className="pt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewNoteFromVisit(visit.noteId!)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Full Note
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-diagnoses">Diagnoses (comma-separated)</Label>
              <Input
                id="edit-diagnoses"
                value={editFormData.diagnoses}
                onChange={(e) => setEditFormData(prev => ({ ...prev, diagnoses: e.target.value }))}
                placeholder="Type 2 Diabetes, Hypertension"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-medications">Medications (comma-separated)</Label>
              <Input
                id="edit-medications"
                value={editFormData.medications}
                onChange={(e) => setEditFormData(prev => ({ ...prev, medications: e.target.value }))}
                placeholder="Metformin 500mg, Lisinopril 10mg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-allergies">Allergies (comma-separated)</Label>
              <Input
                id="edit-allergies"
                value={editFormData.allergies}
                onChange={(e) => setEditFormData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="Penicillin, Sulfa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePatient} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
