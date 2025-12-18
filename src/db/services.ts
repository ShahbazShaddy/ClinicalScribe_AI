import supabase, { isSupabaseConfigured } from './client';
import type { User, NewUser, Note, NewNote, UserSettings, NewUserSettings, ChatMessage, NewChatMessage, ChatSession, NewChatSession, Patient, NewPatient, Visit, NewVisit } from './schema';

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
      patient_id: noteData.patientId || null,
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
  patientId?: string;
  patientName: string;
  patientAge?: string;
  chiefComplaint?: string;
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P' | 'Flexible';
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
    patientId: dbNote.patient_id,
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

// ============================================
// Chat Message Operations
// ============================================

export async function createChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  sessionId: string
): Promise<ChatMessage | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: userId,
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat message:', error);
    throw error;
  }

  return data;
}

export async function getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }

  return data || [];
}

export async function deleteChatMessage(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chat message:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting chat message:', err);
    throw err;
  }
}

export async function deleteChatHistoryByUserId(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting chat history:', err);
    throw err;
  }
}

// ============================================
// Chat Session Operations
// ============================================

export async function createChatSession(userId: string, title?: string): Promise<ChatSession | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: title || 'New Chat',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }

  return data;
}

export async function getChatSessionsByUserId(userId: string): Promise<ChatSession[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }

  return data || [];
}

export async function getChatSessionById(sessionId: string): Promise<ChatSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching chat session:', error);
    throw error;
  }

  return data;
}

export async function updateChatSessionTitle(sessionId: string, title: string): Promise<ChatSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating chat session title:', error);
    throw error;
  }

  return data;
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting chat session:', err);
    throw err;
  }
}

// ============================================
// Patient Operations
// ============================================

export async function createPatient(patientData: Omit<NewPatient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      user_id: patientData.userId,
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      date_of_birth: patientData.dateOfBirth,
      phone: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      diagnoses: patientData.diagnoses || [],
      medications: patientData.medications || [],
      allergies: patientData.allergies || [],
      emergency_contact: patientData.emergencyContact,
      emergency_phone: patientData.emergencyPhone,
      insurance_provider: patientData.insuranceProvider,
      insurance_id: patientData.insuranceId,
      medical_record_number: patientData.medicalRecordNumber,
      notes: patientData.notes,
      is_active: patientData.isActive ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating patient:', error);
    throw error;
  }

  return data;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching patient:', error);
    throw error;
  }

  return data;
}

export async function getPatientsByUserId(userId: string): Promise<Patient[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }

  return data || [];
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
  if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.diagnoses !== undefined) dbUpdates.diagnoses = updates.diagnoses;
  if (updates.medications !== undefined) dbUpdates.medications = updates.medications;
  if (updates.allergies !== undefined) dbUpdates.allergies = updates.allergies;
  if (updates.emergencyContact !== undefined) dbUpdates.emergency_contact = updates.emergencyContact;
  if (updates.emergencyPhone !== undefined) dbUpdates.emergency_phone = updates.emergencyPhone;
  if (updates.insuranceProvider !== undefined) dbUpdates.insurance_provider = updates.insuranceProvider;
  if (updates.insuranceId !== undefined) dbUpdates.insurance_id = updates.insuranceId;
  if (updates.medicalRecordNumber !== undefined) dbUpdates.medical_record_number = updates.medicalRecordNumber;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('patients')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient:', error);
    throw error;
  }

  return data;
}

export async function deletePatient(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('patients')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting patient:', err);
    throw err;
  }
}

export async function searchPatients(userId: string, query: string): Promise<Patient[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching patients:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// Visit Operations
// ============================================

export async function createVisit(visitData: Omit<NewVisit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('visits')
    .insert({
      patient_id: visitData.patientId,
      user_id: visitData.userId,
      note_id: visitData.noteId,
      visit_date: visitData.visitDate || new Date().toISOString(),
      visit_type: visitData.visitType || 'routine',
      chief_complaint: visitData.chiefComplaint,
      vitals: visitData.vitals || {},
      summary: visitData.summary,
      diagnosis: visitData.diagnosis,
      treatment_plan: visitData.treatmentPlan,
      follow_up_date: visitData.followUpDate,
      duration: visitData.duration || 0,
      status: visitData.status || 'completed',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating visit:', error);
    throw error;
  }

  return data;
}

export async function getVisitById(id: string): Promise<Visit | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching visit:', error);
    throw error;
  }

  return data;
}

export async function getVisitsByPatientId(patientId: string): Promise<Visit[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching visits:', error);
    throw error;
  }

  return data || [];
}

export async function getVisitsByUserId(userId: string): Promise<Visit[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', userId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching visits:', error);
    throw error;
  }

  return data || [];
}

export async function updateVisit(id: string, updates: Partial<Visit>): Promise<Visit | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.noteId !== undefined) dbUpdates.note_id = updates.noteId;
  if (updates.visitDate !== undefined) dbUpdates.visit_date = updates.visitDate;
  if (updates.visitType !== undefined) dbUpdates.visit_type = updates.visitType;
  if (updates.chiefComplaint !== undefined) dbUpdates.chief_complaint = updates.chiefComplaint;
  if (updates.vitals !== undefined) dbUpdates.vitals = updates.vitals;
  if (updates.summary !== undefined) dbUpdates.summary = updates.summary;
  if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis;
  if (updates.treatmentPlan !== undefined) dbUpdates.treatment_plan = updates.treatmentPlan;
  if (updates.followUpDate !== undefined) dbUpdates.follow_up_date = updates.followUpDate;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const { data, error } = await supabase
    .from('visits')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating visit:', error);
    throw error;
  }

  return data;
}

export async function deleteVisit(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting visit:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting visit:', err);
    throw err;
  }
}

export async function getVisitsWithNotes(patientId: string): Promise<(Visit & { note?: Note })[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      notes (*)
    `)
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching visits with notes:', error);
    throw error;
  }

  return data || [];
}

// Helper function to convert DB patient to app format
export function dbPatientToAppPatient(dbPatient: any): {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnoses: string[];
  medications: string[];
  allergies: string[];
  lastVisit?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  medicalRecordNumber?: string;
  notes?: string;
} {
  return {
    id: dbPatient.id,
    name: dbPatient.name,
    age: dbPatient.age || 0,
    gender: dbPatient.gender || 'O',
    diagnoses: dbPatient.diagnoses || [],
    medications: dbPatient.medications || [],
    allergies: dbPatient.allergies || [],
    lastVisit: dbPatient.updated_at,
    phone: dbPatient.phone,
    email: dbPatient.email,
    dateOfBirth: dbPatient.date_of_birth,
    address: dbPatient.address,
    emergencyContact: dbPatient.emergency_contact,
    emergencyPhone: dbPatient.emergency_phone,
    insuranceProvider: dbPatient.insurance_provider,
    insuranceId: dbPatient.insurance_id,
    medicalRecordNumber: dbPatient.medical_record_number,
    notes: dbPatient.notes,
  };
}

// Helper function to convert DB visit to app format
export function dbVisitToAppVisit(dbVisit: any): {
  id: string;
  patientId: string;
  noteId?: string;
  date: string;
  visitType: string;
  complaint: string;
  vitals: any;
  summary: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  duration: number;
  status: string;
} {
  return {
    id: dbVisit.id,
    patientId: dbVisit.patient_id,
    noteId: dbVisit.note_id,
    date: dbVisit.visit_date,
    visitType: dbVisit.visit_type || 'routine',
    complaint: dbVisit.chief_complaint || '',
    vitals: dbVisit.vitals || {},
    summary: dbVisit.summary || '',
    diagnosis: dbVisit.diagnosis,
    treatmentPlan: dbVisit.treatment_plan,
    followUpDate: dbVisit.follow_up_date,
    duration: dbVisit.duration || 0,
    status: dbVisit.status || 'completed',
  };
}
