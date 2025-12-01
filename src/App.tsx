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
import PatientTimeline from '@/pages/PatientTimeline';

export type Page = 'landing' | 'auth' | 'dashboard' | 'recording' | 'note' | 'past-notes' | 'settings' | 'chat' | 'patients' | 'patient';

export interface User {
  id?: string;
  email: string;
  name: string;
  specialty: string;
  practiceName: string;
}

export interface Note {
  id: string;
  patientName: string;
  patientAge?: string;
  chiefComplaint?: string;
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P' | 'Flexible'; // Flexible for dynamic content
  date: string;
  duration: number;
  content: Record<string, string>; // Dynamic key-value pairs for flexible sections
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnoses: string[];
  medications: string[];
  allergies?: string[];
  lastVisit?: string;
  visits?: any[];
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

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
    navigateTo('note');
  };

  const handlePatientSelect = (patient: Patient) => {
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
        <PatientsPage user={user} onNavigate={navigateTo} onViewPatient={handlePatientSelect} onLogout={handleLogout} />
      )}
      {currentPage === 'patient' && user && currentPatient && (
        <PatientTimeline user={user} patient={currentPatient} onNavigate={navigateTo} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}

export default App;
