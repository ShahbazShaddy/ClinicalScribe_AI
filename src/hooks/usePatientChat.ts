import { useState, useCallback, useEffect } from 'react';
import { 
  createPatientChatMessage, 
  getPatientChatMessagesBySessionId, 
  createPatientChatSession, 
  getPatientChatSessionsByPatientId,
  updatePatientChatSessionTitle,
  deletePatientChatSession,
  getVisitsWithNotesByPatientId,
} from '@/db/services';
import { generateText, type Message } from '@/services/textGeneration';
import type { Patient, Visit } from '@/App';

// Extended visit type with full note content
interface VisitWithNote extends Visit {
  note?: {
    id: string;
    content: any;
    transcription?: string;
    note_type?: string;
    chief_complaint?: string;
  } | null;
}

export interface PatientChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface PatientChatSession {
  id: string;
  patientId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UsePatientChatOptions {
  userId: string;
  patient: Patient;
}

export function usePatientChat({ userId, patient }: UsePatientChatOptions) {
  const [messages, setMessages] = useState<PatientChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PatientChatSession[]>([]);
  const [patientVisits, setPatientVisits] = useState<VisitWithNote[]>([]);

  // Load sessions and patient visits on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);
        
        // Load patient visits with full note content
        const visitsWithNotes = await getVisitsWithNotesByPatientId(patient.id);
        const formattedVisits: VisitWithNote[] = visitsWithNotes.map((v: any) => ({
          id: v.id,
          patientId: v.patient_id,
          noteId: v.note_id,
          date: v.visit_date,
          visitType: v.visit_type || 'routine',
          complaint: v.chief_complaint || '',
          vitals: v.vitals || {},
          summary: v.summary || '',
          diagnosis: v.diagnosis,
          treatmentPlan: v.treatment_plan,
          followUpDate: v.follow_up_date,
          duration: v.duration || 0,
          status: v.status || 'completed',
          note: v.note || null,
        }));
        setPatientVisits(formattedVisits);
        
        // Load chat sessions
        const dbSessions = await getPatientChatSessionsByPatientId(patient.id);
        const formattedSessions: PatientChatSession[] = dbSessions.map((s: any) => ({
          id: s.id,
          patientId: s.patient_id || s.patientId,
          userId: s.user_id || s.userId,
          title: s.title,
          createdAt: new Date(s.created_at || s.createdAt),
          updatedAt: new Date(s.updated_at || s.updatedAt),
        }));
        setSessions(formattedSessions);
        
        // Set current session to the latest one or create new if none exist
        if (formattedSessions.length > 0) {
          setCurrentSessionId(formattedSessions[0].id);
        } else {
          // Create a new session for this patient
          const newSession = await createPatientChatSession(patient.id, userId, `Chat with ${patient.name}`);
          if (newSession) {
            const session: PatientChatSession = {
              id: newSession.id,
              patientId: (newSession as any).patient_id || newSession.patientId,
              userId: (newSession as any).user_id || newSession.userId,
              title: newSession.title || 'Patient Chat',
              createdAt: new Date((newSession as any).created_at || newSession.createdAt),
              updatedAt: new Date((newSession as any).updated_at || newSession.updatedAt),
            };
            setSessions([session]);
            setCurrentSessionId(newSession.id);
          }
        }
      } catch (error) {
        console.error('Error initializing patient chat:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [userId, patient.id, patient.name]);

  // Load messages when session changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!currentSessionId) return;
      
      try {
        const dbMessages = await getPatientChatMessagesBySessionId(currentSessionId);
        const formattedMessages: PatientChatMessage[] = dbMessages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading patient chat history:', error);
      }
    };

    loadChatHistory();
  }, [currentSessionId]);

  // Build system prompt with patient context
  const buildSystemPrompt = useCallback(() => {
    let prompt = `You are an AI Clinical Assistant helping a healthcare provider with information about a specific patient. You have detailed access to this patient's medical records and history.

PATIENT INFORMATION:
- Name: ${patient.name}
- Age: ${patient.age || 'Unknown'}
- Gender: ${patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other/Unknown'}
`;

    if (patient.dateOfBirth) {
      prompt += `- Date of Birth: ${patient.dateOfBirth}\n`;
    }
    
    if (patient.phone) {
      prompt += `- Phone: ${patient.phone}\n`;
    }
    
    if (patient.email) {
      prompt += `- Email: ${patient.email}\n`;
    }
    
    if (patient.address) {
      prompt += `- Address: ${patient.address}\n`;
    }

    if (patient.medicalRecordNumber) {
      prompt += `- Medical Record Number: ${patient.medicalRecordNumber}\n`;
    }

    if (patient.diagnoses && patient.diagnoses.length > 0) {
      prompt += `\nDIAGNOSES:\n${patient.diagnoses.map(d => `- ${d}`).join('\n')}\n`;
    }

    if (patient.medications && patient.medications.length > 0) {
      prompt += `\nCURRENT MEDICATIONS:\n${patient.medications.map(m => `- ${m}`).join('\n')}\n`;
    }

    if (patient.allergies && patient.allergies.length > 0) {
      prompt += `\nALLERGIES:\n${patient.allergies.map(a => `- ${a}`).join('\n')}\n`;
    }

    if (patient.emergencyContact) {
      prompt += `\nEMERGENCY CONTACT: ${patient.emergencyContact}`;
      if (patient.emergencyPhone) {
        prompt += ` (${patient.emergencyPhone})`;
      }
      prompt += '\n';
    }

    if (patient.insuranceProvider) {
      prompt += `\nINSURANCE: ${patient.insuranceProvider}`;
      if (patient.insuranceId) {
        prompt += ` (ID: ${patient.insuranceId})`;
      }
      prompt += '\n';
    }

    if (patient.notes) {
      prompt += `\nADDITIONAL NOTES:\n${patient.notes}\n`;
    }

    // Add visit history with full note content
    if (patientVisits.length > 0) {
      prompt += `\nVISIT HISTORY (${patientVisits.length} visits):\n`;
      patientVisits.slice(0, 10).forEach((visit, index) => {
        const visitDate = new Date(visit.date);
        const dateStr = !isNaN(visitDate.getTime()) 
          ? visitDate.toLocaleDateString() 
          : 'Unknown date';
        
        prompt += `\n--- Visit ${index + 1} (${dateStr}) ---\n`;
        prompt += `Type: ${visit.visitType || 'Routine'}\n`;
        if (visit.complaint) {
          prompt += `Chief Complaint: ${visit.complaint}\n`;
        }
        if (visit.vitals && Object.keys(visit.vitals).length > 0) {
          prompt += `Vitals: `;
          const vitalsList = [];
          if (visit.vitals.bp) vitalsList.push(`BP: ${visit.vitals.bp}`);
          if (visit.vitals.weight) vitalsList.push(`Weight: ${visit.vitals.weight}kg`);
          if (visit.vitals.temperature) vitalsList.push(`Temp: ${visit.vitals.temperature}°C`);
          if (visit.vitals.heartRate) vitalsList.push(`HR: ${visit.vitals.heartRate}bpm`);
          prompt += vitalsList.join(', ') + '\n';
        }
        if (visit.summary) {
          prompt += `Summary: ${visit.summary}\n`;
        }
        if (visit.diagnosis) {
          prompt += `Diagnosis: ${visit.diagnosis}\n`;
        }
        if (visit.treatmentPlan) {
          prompt += `Treatment Plan: ${visit.treatmentPlan}\n`;
        }
        
        // Include full clinical note if available
        if (visit.note) {
          prompt += `\n** Full Clinical Note **\n`;
          if (visit.note.note_type) {
            prompt += `Note Type: ${visit.note.note_type}\n`;
          }
          
          // Include structured note content - handle all dynamic keys
          if (visit.note.content && typeof visit.note.content === 'object') {
            const noteContent = visit.note.content;
            
            // Iterate through all content keys to capture dynamic sections
            Object.entries(noteContent).forEach(([key, value]) => {
              if (value && typeof value === 'string' && value.trim()) {
                prompt += `\n${key}:\n${value}\n`;
              }
            });
          }
          
          // Include transcription if available (limit to prevent token overflow)
          if (visit.note.transcription) {
            const transcription = visit.note.transcription;
            // Limit transcription to first 3000 characters per visit to manage context size
            const limitedTranscription = transcription.length > 3000 
              ? transcription.substring(0, 3000) + '... [truncated]'
              : transcription;
            prompt += `\nOriginal Transcription:\n${limitedTranscription}\n`;
          }
        }
      });
    }

    prompt += `\n
INSTRUCTIONS:
- Answer questions specifically about this patient
- Provide relevant medical insights based on their history
- Help with clinical decision-making for this patient
- Suggest follow-up care based on their conditions
- Be professional, accurate, and always recommend verifying critical information
- When you don't know something, clearly state that
- Always prioritize patient safety and encourage the doctor to use their clinical judgment
- Reference specific information from the patient's records and clinical notes when relevant
- You have access to the full clinical notes including SOAP notes, transcriptions, and structured data`;

    return prompt;
  }, [patient, patientVisits]);

  // Send message
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!currentSessionId) {
        console.error('No active patient chat session');
        return;
      }

      try {
        setIsLoading(true);

        // Add user message to state
        const userMsg: PatientChatMessage = {
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, userMsg]);

        // Save user message to database
        await createPatientChatMessage(currentSessionId, patient.id, userId, 'user', userMessage);

        // Build system prompt with patient context
        const systemPrompt = buildSystemPrompt();

        // Prepare messages for API
        const conversationMessages = messages
          .slice(-10) // Last 10 messages for context
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }));

        // Add current user message
        conversationMessages.push({
          role: 'user',
          content: userMessage,
        });

        // Generate AI response
        const aiResponse = await generateText(
          conversationMessages,
          systemPrompt,
          0.7,  // temperature
          2048  // max tokens
        );

        // Add assistant message to state
        const assistantMsg: PatientChatMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMsg]);

        // Save assistant message to database
        await createPatientChatMessage(currentSessionId, patient.id, userId, 'assistant', aiResponse);

      } catch (error) {
        console.error('Error sending patient chat message:', error);
        // Add error message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        }]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, patient.id, userId, messages, buildSystemPrompt]
  );

  // Create new session
  const createNewSession = useCallback(async () => {
    try {
      const newSession = await createPatientChatSession(patient.id, userId, `Chat with ${patient.name}`);
      if (newSession) {
        const session: PatientChatSession = {
          id: newSession.id,
          patientId: (newSession as any).patient_id || newSession.patientId,
          userId: (newSession as any).user_id || newSession.userId,
          title: newSession.title || 'Patient Chat',
          createdAt: new Date((newSession as any).created_at || newSession.createdAt),
          updatedAt: new Date((newSession as any).updated_at || newSession.updatedAt),
        };
        setSessions(prev => [session, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating new patient chat session:', error);
    }
  }, [patient.id, patient.name, userId]);

  // Switch session
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await deletePatientChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleted current session, switch to another or create new
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id);
        } else {
          await createNewSession();
        }
      }
    } catch (error) {
      console.error('Error deleting patient chat session:', error);
    }
  }, [currentSessionId, sessions, createNewSession]);

  // Clear current chat
  const clearChat = useCallback(async () => {
    if (!currentSessionId) return;
    
    try {
      // Delete current session and create a new one
      await deletePatientChatSession(currentSessionId);
      setSessions(prev => prev.filter(s => s.id !== currentSessionId));
      await createNewSession();
    } catch (error) {
      console.error('Error clearing patient chat:', error);
    }
  }, [currentSessionId, createNewSession]);

  return {
    messages,
    isLoading,
    isInitializing,
    sendMessage,
    sessions,
    currentSessionId,
    createNewSession,
    switchSession,
    deleteSession,
    clearChat,
    patientVisits,
  };
}
