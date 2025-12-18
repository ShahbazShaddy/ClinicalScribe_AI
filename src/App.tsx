import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import RecordingPage from '@/pages/RecordingPage';
import NotePage from '@/pages/NotePage';
import PastNotesPage from '@/pages/PastNotesPage';
import SettingsPage from '@/pages/SettingsPage';
import ChatPage from '@/pages/ChatPage';
import PatientsPage from '@/pages/PatientsPage';
import PatientDetailPage from '@/pages/PatientDetailPage';
import type { StructuredData } from '@/types/structuredData';

export type Page = 'landing' | 'auth' | 'dashboard' | 'recording' | 'note' | 'past-notes' | 'settings' | 'chat' | 'patients' | 'patient' | 'patient-recording';

export interface User {
  id?: string;
  email: string;
  name: string;
  specialty: string;
  practiceName: string;
}

export interface Note {
  id: string;
  patientId?: string;
  patientName: string;
  patientAge?: string;
  chiefComplaint?: string;
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P' | 'Flexible'; // Flexible for dynamic content
  date: string;
  duration: number;
  content: Record<string, string>; // Dynamic key-value pairs for flexible sections
  transcription?: string; // Original voice transcription
  structuredData?: StructuredData; // Extracted vitals, clinical info, symptoms
  previousVisitData?: StructuredData; // For trend comparison
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  diagnoses: string[];
  medications: string[];
  allergies?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  medicalRecordNumber?: string;
  notes?: string;
  lastVisit?: string;
  visits?: Visit[];
  // Risk assessment fields
  riskLevel?: 'low' | 'moderate' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  riskFactors?: string[];
  riskAssessedAt?: string;
  riskNotes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  noteId?: string;
  date: string;
  visitType: string;
  complaint: string;
  vitals: {
    bp?: string;
    weight?: number;
    height?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  summary: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  duration: number;
  status: string;
  // Risk assessment fields
  riskLevel?: 'low' | 'medium' | 'high';
  riskScore?: number;
  riskFactors?: string[];
  aiRiskAssessment?: {
    riskLevel: string;
    riskScore: number;
    riskFactors: string[];
    summary: string;
    concerns: string[];
    recommendations: string[];
    followUpUrgency: string;
  };
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [recordingForPatient, setRecordingForPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('clinicalscribe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('clinicalscribe_user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('clinicalscribe_user');
    setCurrentPage('landing');
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const handleNoteCreated = (note: Note) => {
    setCurrentNote(note);
    // If recording was for a specific patient, navigate back to patient detail
    if (recordingForPatient) {
      setCurrentPatient(recordingForPatient);
      setRecordingForPatient(null);
      navigateTo('patient');
    } else {
      navigateTo('note');
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setCurrentPatient(patient);
    navigateTo('patient');
  };

  const handleStartRecordingForPatient = (patient: Patient) => {
    setRecordingForPatient(patient);
    navigateTo('patient-recording');
  };

  const handlePatientAdded = (patient: Patient) => {
    setCurrentPatient(patient);
    navigateTo('patient');
  };

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage onNavigate={() => navigateTo('auth')} />
      )}
      {currentPage === 'auth' && (
        <AuthPage onLogin={handleLogin} onBack={() => navigateTo('landing')} />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onNavigate={navigateTo} 
          onLogout={handleLogout}
          onNoteSelect={(note) => {
            setCurrentNote(note);
            navigateTo('note');
          }}
        />
      )}
      {currentPage === 'recording' && user && (
        <RecordingPage 
          user={user} 
          onNavigate={navigateTo} 
          onLogout={handleLogout}
          onNoteCreated={handleNoteCreated}
        />
      )}
      {currentPage === 'note' && user && currentNote && (
        <NotePage 
          user={user} 
          note={currentNote}
          onNavigate={navigateTo} 
          onLogout={handleLogout}
          onNoteDeleted={() => setCurrentNote(null)}
        />
      )}
      {currentPage === 'past-notes' && user && (
        <PastNotesPage 
          user={user} 
          onNavigate={navigateTo} 
          onLogout={handleLogout}
          onNoteSelect={(note) => {
            setCurrentNote(note);
            navigateTo('note');
          }}
        />
      )}
      {currentPage === 'settings' && user && (
        <SettingsPage user={user} onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'chat' && user && (
        <ChatPage user={user} onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      {currentPage === 'patients' && user && (
        <PatientsPage 
          user={user} 
          onNavigate={navigateTo} 
          onViewPatient={handlePatientSelect} 
          onStartRecording={handleStartRecordingForPatient}
          onPatientAdded={handlePatientAdded}
          onLogout={handleLogout} 
        />
      )}
      {currentPage === 'patient' && user && currentPatient && (
        <PatientDetailPage 
          user={user} 
          patient={currentPatient} 
          onNavigate={navigateTo} 
          onStartRecording={handleStartRecordingForPatient}
          onViewNote={(note) => {
            setCurrentNote(note);
            navigateTo('note');
          }}
          onPatientUpdated={(updatedPatient) => setCurrentPatient(updatedPatient)}
          onLogout={handleLogout} 
        />
      )}
      {currentPage === 'patient-recording' && user && recordingForPatient && (
        <RecordingPage 
          user={user} 
          patient={recordingForPatient}
          onNavigate={navigateTo} 
          onLogout={handleLogout}
          onNoteCreated={handleNoteCreated}
        />
      )}
      <Toaster />
    </>
  );
}

export default App;
