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
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

export type Page = 'landing' | 'auth' | 'dashboard' | 'recording' | 'note' | 'past-notes' | 'settings' | 'chat' | 'privacy' | 'terms';

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
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P';
  date: string;
  duration: number;
  content: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    icd10?: string;
    cpt?: string;
  };
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

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

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage onNavigate={(page) => navigateTo(page as Page || 'auth')} />
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
      {currentPage === 'privacy' && (
        <PrivacyPolicy onNavigate={() => navigateTo('landing')} />
      )}
      {currentPage === 'terms' && (
        <TermsOfService onNavigate={() => navigateTo('landing')} />
      )}
      <Toaster />
    </>
  );
}

export default App;
