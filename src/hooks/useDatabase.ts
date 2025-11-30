import { useState, useCallback } from 'react';
import { isSupabaseConfigured } from '@/db/client';
import { generateUniqueId } from '@/lib/utils';
import {
  createUser,
  getUserByEmail,
  updateUser,
  createNote,
  getNotesByUserId,
  getNoteById,
  updateNote,
  deleteNote,
  archiveNote,
  searchNotes,
  getUserSettings,
  createOrUpdateUserSettings,
  dbNoteToAppNote,
  dbUserToAppUser,
} from '@/db/services';
import type { Note as AppNote, User as AppUser } from '@/App';

export function useDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // ============================================
  // User Operations
  // ============================================

  const signUpUser = useCallback(async (userData: {
    email: string;
    name: string;
    specialty?: string;
    practiceName?: string;
  }): Promise<AppUser | null> => {
    if (!isConfigured) {
      // Fallback to localStorage
      const user: AppUser = {
        id: generateUniqueId(),
        email: userData.email,
        name: userData.name,
        specialty: userData.specialty || '',
        practiceName: userData.practiceName || '',
      };
      localStorage.setItem('clinicalscribe_user', JSON.stringify(user));
      return user;
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbUser = await createUser({
        email: userData.email,
        name: userData.name,
        specialty: userData.specialty,
        practiceName: userData.practiceName,
      });
      if (dbUser) {
        return dbUserToAppUser(dbUser);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const getUser = useCallback(async (email: string): Promise<AppUser | null> => {
    if (!isConfigured) {
      // Fallback to localStorage
      const savedUser = localStorage.getItem('clinicalscribe_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbUser = await getUserByEmail(email);
      if (dbUser) {
        return dbUserToAppUser(dbUser);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  // ============================================
  // Note Operations
  // ============================================

  const saveNote = useCallback(async (
    userId: string,
    noteData: Omit<AppNote, 'id' | 'date'>
  ): Promise<AppNote | null> => {
    if (!isConfigured) {
      setError('Database not configured');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbNote = await createNote({
        userId,
        patientName: noteData.patientName,
        patientAge: noteData.patientAge,
        chiefComplaint: noteData.chiefComplaint,
        noteType: noteData.noteType,
        duration: noteData.duration,
        content: noteData.content,
      });
      if (dbNote) {
        return dbNoteToAppNote(dbNote);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const fetchNotes = useCallback(async (userId: string): Promise<AppNote[]> => {
    if (!isConfigured) {
      setError('Database not configured');
      return [];
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbNotes = await getNotesByUserId(userId);
      return dbNotes.map(dbNoteToAppNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const fetchNoteById = useCallback(async (noteId: string): Promise<AppNote | null> => {
    if (!isConfigured) {
      setError('Database not configured');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbNote = await getNoteById(noteId);
      if (dbNote) {
        return dbNoteToAppNote(dbNote);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch note');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const editNote = useCallback(async (
    noteId: string,
    updates: Partial<AppNote>
  ): Promise<AppNote | null> => {
    if (!isConfigured) {
      setError('Database not configured');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbNote = await updateNote(noteId, updates);
      if (dbNote) {
        return dbNoteToAppNote(dbNote);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const removeNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!isConfigured) {
      const errorMsg = 'Database not configured';
      setError(errorMsg);
      console.error(errorMsg);
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Deleting note with ID:', noteId);
      const result = await deleteNote(noteId);
      console.log('Delete operation result:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMessage);
      console.error('Error in removeNote:', errorMessage, err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const archiveNoteById = useCallback(async (noteId: string): Promise<AppNote | null> => {
    if (!isConfigured) {
      setError('Database not configured');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbNote = await archiveNote(noteId);
      if (dbNote) {
        return dbNoteToAppNote(dbNote);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive note');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const findNotes = useCallback(async (userId: string, query: string): Promise<AppNote[]> => {
    if (!isConfigured) {
      setError('Database not configured');
      return [];
    }

    setIsLoading(true);
    setError(null);
    try {
      const dbNotes = await searchNotes(userId, query);
      return dbNotes.map(dbNoteToAppNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search notes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  // ============================================
  // Settings Operations
  // ============================================

  const fetchSettings = useCallback(async (userId: string) => {
    if (!isConfigured) {
      const savedSettings = localStorage.getItem('clinicalscribe_settings');
      return savedSettings ? JSON.parse(savedSettings) : null;
    }

    setIsLoading(true);
    setError(null);
    try {
      return await getUserSettings(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const saveSettings = useCallback(async (userId: string, settings: {
    defaultNoteType?: string;
    audioQuality?: string;
    autoSave?: boolean;
    darkMode?: boolean;
  }) => {
    if (!isConfigured) {
      localStorage.setItem('clinicalscribe_settings', JSON.stringify(settings));
      return settings;
    }

    setIsLoading(true);
    setError(null);
    try {
      return await createOrUpdateUserSettings(userId, settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  return {
    isConfigured,
    isLoading,
    error,
    clearError,

    // User operations
    signUpUser,
    getUser,

    // Note operations
    saveNote,
    fetchNotes,
    fetchNoteById,
    editNote,
    removeNote,
    archiveNoteById,
    findNotes,

    // Settings operations
    fetchSettings,
    saveSettings,
  };
}
