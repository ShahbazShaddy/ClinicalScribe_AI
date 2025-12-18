import React, { useEffect, useMemo, useState } from 'react';
import type { User, Patient, Page } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Search, Mic, Eye, Loader2, UserPlus, MessageSquare, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { createPatient, getPatientsByUserId, dbPatientToAppPatient, getVisitsByPatientId } from '@/db/services';
import { isSupabaseConfigured } from '@/db/client';
import { PatientChatModal } from '@/components/PatientChatModal';
import { PatientAnalysisModal } from '@/components/PatientAnalysisModal';
import { RiskLevelEditor } from '@/components/RiskLevelEditor';
import { getRiskLevelColor } from '@/services/riskAssessment';

interface PatientsPageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onViewPatient: (patient: Patient) => void;
  onStartRecording: (patient: Patient) => void;
  onPatientAdded: (patient: Patient) => void;
  onLogout: () => void;
}

interface NewPatientForm {
  name: string;
  age: string;
  gender: 'M' | 'F' | 'O';
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  diagnoses: string;
  medications: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider: string;
  insuranceId: string;
  medicalRecordNumber: string;
  notes: string;
}

const initialFormState: NewPatientForm = {
  name: '',
  age: '',
  gender: 'M',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  diagnoses: '',
  medications: '',
  allergies: '',
  emergencyContact: '',
  emergencyPhone: '',
  insuranceProvider: '',
  insuranceId: '',
  medicalRecordNumber: '',
  notes: '',
};

export default function PatientsPage({ user, onNavigate, onViewPatient, onStartRecording, onPatientAdded, onLogout }: PatientsPageProps) {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewPatientForm>(initialFormState);
  const [chatPatient, setChatPatient] = useState<Patient | null>(null);
  const [analysisPatient, setAnalysisPatient] = useState<Patient | null>(null);
  const [riskEditPatient, setRiskEditPatient] = useState<Patient | null>(null);

  // Load patients from database
  useEffect(() => {
    loadPatients();
  }, [user.id]);

  const loadPatients = async () => {
    if (!user.id || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const dbPatients = await getPatientsByUserId(user.id);
      
      // Convert and get last visit date for each patient
      const patientsWithVisits = await Promise.all(
        dbPatients.map(async (p) => {
          const patient = dbPatientToAppPatient(p);
          try {
            const visits = await getVisitsByPatientId(p.id);
            if (visits.length > 0 && visits[0].visitDate) {
              const visitDate = new Date(visits[0].visitDate);
              if (!isNaN(visitDate.getTime())) {
                patient.lastVisit = visitDate.toISOString().split('T')[0];
              }
            }
            return { ...patient, visitCount: visits.length };
          } catch (err) {
            console.warn(`Error loading visits for patient ${p.id}:`, err);
            return { ...patient, visitCount: 0 };
          }
        })
      );
      
      setPatients(patientsWithVisits as Patient[]);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      const errorMessage = error?.message?.includes('timeout') || error?.message?.includes('ERR_TIMED_OUT')
        ? 'Connection timed out. Please check your network and try again.'
        : 'Failed to load patients. Please try again.';
      setLoadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  }, [query, patients]);

  const handleInputChange = (field: keyof NewPatientForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Patient name is required');
      return;
    }

    if (!user.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      const newPatient = await createPatient({
        userId: user.id,
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        diagnoses: formData.diagnoses ? formData.diagnoses.split(',').map(d => d.trim()).filter(Boolean) : [],
        medications: formData.medications ? formData.medications.split(',').map(m => m.trim()).filter(Boolean) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        emergencyContact: formData.emergencyContact || null,
        emergencyPhone: formData.emergencyPhone || null,
        insuranceProvider: formData.insuranceProvider || null,
        insuranceId: formData.insuranceId || null,
        medicalRecordNumber: formData.medicalRecordNumber || null,
        notes: formData.notes || null,
        isActive: true,
      });

      if (newPatient) {
        const convertedPatient = dbPatientToAppPatient(newPatient);
        toast.success('Patient added successfully');
        setIsAddDialogOpen(false);
        setFormData(initialFormState);
        loadPatients();
        onPatientAdded(convertedPatient as Patient);
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout user={user} currentPage="patients" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Patient Records</h1>
            <p className="text-sm text-muted-foreground">Manage patients and their visit history</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          placeholder="35"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Male</SelectItem>
                            <SelectItem value="F">Female</SelectItem>
                            <SelectItem value="O">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Contact Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main St, City, State 12345"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Medical Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="diagnoses">Diagnoses (comma-separated)</Label>
                        <Input
                          id="diagnoses"
                          value={formData.diagnoses}
                          onChange={(e) => handleInputChange('diagnoses', e.target.value)}
                          placeholder="Type 2 Diabetes, Hypertension"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medications">Medications (comma-separated)</Label>
                        <Input
                          id="medications"
                          value={formData.medications}
                          onChange={(e) => handleInputChange('medications', e.target.value)}
                          placeholder="Metformin 500mg, Lisinopril 10mg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                        <Input
                          id="allergies"
                          value={formData.allergies}
                          onChange={(e) => handleInputChange('allergies', e.target.value)}
                          placeholder="Penicillin, Sulfa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mrn">Medical Record Number</Label>
                        <Input
                          id="mrn"
                          value={formData.medicalRecordNumber}
                          onChange={(e) => handleInputChange('medicalRecordNumber', e.target.value)}
                          placeholder="MRN-123456"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Contact Name</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          placeholder="+1 (555) 987-6543"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Insurance Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                        <Input
                          id="insuranceProvider"
                          value={formData.insuranceProvider}
                          onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                          placeholder="Blue Cross Blue Shield"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insuranceId">Insurance ID</Label>
                        <Input
                          id="insuranceId"
                          value={formData.insuranceId}
                          onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                          placeholder="INS-123456789"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Additional Notes</h3>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any additional notes about the patient..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Patient
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading patients...</p>
          </div>
        ) : loadError ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Connection Error</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">{loadError}</p>
            <Button onClick={loadPatients}>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </Button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {query ? 'Try adjusting your search criteria' : 'Get started by adding your first patient'}
            </p>
            {!query && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Patient
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead className="bg-sky-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-3 sm:px-4">Patient Name</th>
                    <th className="hidden sm:table-cell text-left px-3 py-3 sm:px-4">Age</th>
                    <th className="hidden md:table-cell text-center px-3 py-3 sm:px-4">Risk</th>
                    <th className="hidden lg:table-cell text-left px-3 py-3 sm:px-4">Last Visit</th>
                    <th className="text-right px-3 py-3 sm:px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(p => (
                    <tr key={p.id} className="border-t hover:bg-accent/50 transition-colors">
                      <td className="px-3 py-3 sm:px-4">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {p.diagnoses?.length > 0 ? p.diagnoses.join(', ') : 'No diagnoses'}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-3 sm:px-4">
                        {p.age || '—'} {p.gender ? `(${p.gender})` : ''}
                      </td>
                      <td className="hidden md:table-cell px-3 py-3 sm:px-4 text-center">
                        <Badge 
                          variant={p.riskLevel === 'high' ? 'destructive' : p.riskLevel === 'medium' ? 'secondary' : 'outline'}
                          className={`cursor-pointer ${
                            p.riskLevel === 'high' ? 'bg-red-500 hover:bg-red-600' : 
                            p.riskLevel === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 
                            'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          onClick={() => setRiskEditPatient(p)}
                        >
                          {p.riskLevel === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {p.riskLevel === 'medium' && <Shield className="h-3 w-3 mr-1" />}
                          {(p.riskLevel || 'low').charAt(0).toUpperCase() + (p.riskLevel || 'low').slice(1)}
                          {p.riskScore !== undefined && p.riskScore !== null && (
                            <span className="ml-1 opacity-80">({p.riskScore})</span>
                          )}
                        </Badge>
                      </td>
                      <td className="hidden lg:table-cell px-3 py-3 sm:px-4">
                        {p.lastVisit || 'No visits yet'}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setAnalysisPatient(p)}
                            title="Patient Analysis"
                            className="hidden sm:flex"
                          >
                            <BarChart3 className="h-4 w-4 sm:mr-1" />
                            <span className="hidden lg:inline">Analysis</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onViewPatient(p)}
                            title="View Patient"
                          >
                            <Eye className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setChatPatient(p)}
                            title="Chat with AI about patient"
                          >
                            <MessageSquare className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Chat</span>
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => onStartRecording(p)}
                            title="Start Recording"
                          >
                            <Mic className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Record</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patient Chat Modal */}
        {chatPatient && (
          <PatientChatModal
            isOpen={!!chatPatient}
            onClose={() => setChatPatient(null)}
            patient={chatPatient}
            user={user}
          />
        )}

        {/* Patient Analysis Modal */}
        {analysisPatient && (
          <PatientAnalysisModal
            isOpen={!!analysisPatient}
            onClose={() => setAnalysisPatient(null)}
            patient={analysisPatient}
          />
        )}

        {/* Risk Level Editor Modal */}
        {riskEditPatient && (
          <RiskLevelEditor
            isOpen={!!riskEditPatient}
            onClose={() => setRiskEditPatient(null)}
            patient={riskEditPatient}
            onRiskUpdated={(updatedPatient) => {
              // Update patient in local state
              setPatients(patients.map(p => 
                p.id === riskEditPatient.id 
                  ? { 
                      ...p, 
                      riskLevel: updatedPatient.riskLevel, 
                      riskScore: updatedPatient.riskScore,
                      riskFactors: updatedPatient.riskFactors,
                      riskNotes: updatedPatient.riskNotes
                    } 
                  : p
              ));
              setRiskEditPatient(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
