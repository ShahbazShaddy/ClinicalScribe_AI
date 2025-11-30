import supabase, { isSupabaseConfigured } from './client';
import type { User, NewUser, Note, NewNote, UserSettings, NewUserSettings } from './schema';

// ============================================
// User Operations
// ============================================

export async function createUser(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      name: userData.name,
      specialty: userData.specialty,
      practice_name: userData.practiceName,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching user:', error);
    throw error;
  }

  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
    throw error;
  }

  return data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Convert camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.specialty !== undefined) dbUpdates.specialty = updates.specialty;
  if (updates.practiceName !== undefined) dbUpdates.practice_name = updates.practiceName;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data;
}

// ============================================
// Note Operations
// ============================================

export async function createNote(noteData: Omit<NewNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  // Ensure duration is a number and not null
  const duration = typeof noteData.duration === 'number' ? noteData.duration : parseInt(String(noteData.duration || 0), 10);

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: noteData.userId,
      patient_name: noteData.patientName,
      patient_age: noteData.patientAge,
      chief_complaint: noteData.chiefComplaint,
      note_type: noteData.noteType,
      duration: duration,
      content: noteData.content,
      transcription: noteData.transcription,
      audio_url: noteData.audioUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return data;
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching note:', error);
    throw error;
  }

  return data;
}

export async function getNotesByUserId(userId: string): Promise<Note[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data || [];
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Convert camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.patientName !== undefined) dbUpdates.patient_name = updates.patientName;
  if (updates.patientAge !== undefined) dbUpdates.patient_age = updates.patientAge;
  if (updates.chiefComplaint !== undefined) dbUpdates.chief_complaint = updates.chiefComplaint;
  if (updates.noteType !== undefined) dbUpdates.note_type = updates.noteType;
  if (updates.duration !== undefined) {
    // Ensure duration is a number
    dbUpdates.duration = typeof updates.duration === 'number' ? updates.duration : parseInt(String(updates.duration || 0), 10);
  }
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.transcription !== undefined) dbUpdates.transcription = updates.transcription;
  if (updates.audioUrl !== undefined) dbUpdates.audio_url = updates.audioUrl;
  if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;

  const { data, error } = await supabase
    .from('notes')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }

  return data;
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    console.log('Deleting note from database with ID:', id);
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('Note deleted successfully:', data);
    return true;
  } catch (err) {
    console.error('Error deleting note:', err);
    throw err;
  }
}

export async function archiveNote(id: string): Promise<Note | null> {
  return updateNote(id, { isArchived: true });
}

// ============================================
// User Settings Operations
// ============================================

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user settings:', error);
    throw error;
  }

  return data;
}

export async function createOrUpdateUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserSettings | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      default_note_type: settings.defaultNoteType,
      audio_quality: settings.audioQuality,
      auto_save: settings.autoSave,
      dark_mode: settings.darkMode,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }

  return data;
}

// ============================================
// Search and Filter Operations
// ============================================

export async function searchNotes(userId: string, query: string): Promise<Note[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .or(`patient_name.ilike.%${query}%,chief_complaint.ilike.%${query}%,transcription.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching notes:', error);
    throw error;
  }

  return data || [];
}

export async function getNotesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Note[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes by date range:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// Helper function to convert DB row to app format
// ============================================

export function dbNoteToAppNote(dbNote: any): {
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
} {
  // Ensure duration is always a number
  const duration = typeof dbNote.duration === 'number' ? dbNote.duration : parseInt(String(dbNote.duration || 0), 10);
  
  return {
    id: dbNote.id,
    patientName: dbNote.patient_name,
    patientAge: dbNote.patient_age,
    chiefComplaint: dbNote.chief_complaint,
    noteType: dbNote.note_type,
    date: dbNote.created_at,
    duration: duration,
    content: dbNote.content || {},
  };
}

export function dbUserToAppUser(dbUser: any): {
  id?: string;
  email: string;
  name: string;
  specialty: string;
  practiceName: string;
} {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    specialty: dbUser.specialty || '',
    practiceName: dbUser.practice_name || '',
  };
}
