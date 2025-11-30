import { useState, useCallback, useEffect } from 'react';
import { 
  createChatMessage, 
  getChatMessagesBySessionId, 
  createChatSession, 
  getChatSessionsByUserId,
  updateChatSessionTitle,
  deleteChatSession,
} from '@/db/services';
import { getNotesByUserId } from '@/db/services';
import { generateText } from '@/services/textGeneration';
import type { Note } from '@/App';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseChatOptions {
  userId: string;
}

export function useChat({ userId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isTitleSetting, setIsTitleSetting] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsInitializing(true);
        const dbSessions = await getChatSessionsByUserId(userId);
        const formattedSessions: ChatSession[] = dbSessions.map((s: any) => ({
          id: s.id,
          userId: s.user_id,
          title: s.title,
          createdAt: new Date(s.created_at),
          updatedAt: new Date(s.updated_at),
        }));
        setSessions(formattedSessions);
        
        // Set current session to the latest one or create new if none exist
        if (formattedSessions.length > 0) {
          setCurrentSessionId(formattedSessions[0].id);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadSessions();
  }, [userId]);

  // Load messages when session changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!currentSessionId) return;
      
      try {
        const dbMessages = await getChatMessagesBySessionId(currentSessionId);
        const formattedMessages: ChatMessage[] = dbMessages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [currentSessionId]);

  // Build system prompt with patient context
  const buildSystemPrompt = useCallback(
    async (userNotes: any[]) => {
      let patientContext = '';

      if (userNotes.length > 0) {
        patientContext = `\n\nYou have access to the following patient information from the doctor's clinical notes:\n\n`;
        
        const patientsInfo = new Map<string, any>();
        
        userNotes.forEach((note: any) => {
          if (!patientsInfo.has(note.patientName)) {
            patientsInfo.set(note.patientName, {
              name: note.patientName,
              age: note.patientAge,
              complaints: [],
              notes: [],
            });
          }
          
          const patient = patientsInfo.get(note.patientName)!;
          if (note.chiefComplaint) {
            patient.complaints.push(note.chiefComplaint);
          }
          patient.notes.push({
            type: note.noteType,
            date: new Date(note.createdAt || note.date).toLocaleDateString(),
            content: note.content,
          });
        });

        patientsInfo.forEach(patient => {
          patientContext += `\nPatient: ${patient.name}`;
          if (patient.age) patientContext += ` (Age: ${patient.age})`;
          patientContext += '\n';
          
          if (patient.complaints.length > 0) {
            patientContext += `Chief Complaints: ${patient.complaints.join(', ')}\n`;
          }
          
          patient.notes.slice(-3).forEach((note: any) => {
            patientContext += `\n${note.type} Note (${note.date}):\n`;
            if (note.content.subjective) patientContext += `- Subjective: ${note.content.subjective}\n`;
            if (note.content.objective) patientContext += `- Objective: ${note.content.objective}\n`;
            if (note.content.assessment) patientContext += `- Assessment: ${note.content.assessment}\n`;
            if (note.content.plan) patientContext += `- Plan: ${note.content.plan}\n`;
          });
        });
      }

      return `You are an AI Clinical Assistant helping a healthcare provider. You have access to their patient records and clinical notes. You assist with:
- Answering questions about patient history and clinical information
- Providing medical guidance based on the patient records
- Helping with clinical decision-making
- Suggesting follow-up care based on patient conditions
- Providing medical information and best practices

Be professional, accurate, and always recommend verifying critical information with the patient or other medical sources.
When you don't know something or it requires external verification, clearly state that.
Always prioritize patient safety and encourage the doctor to use their clinical judgment.${patientContext}`;
    },
    []
  );

  // Send message
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!currentSessionId) {
        console.error('No active chat session');
        return;
      }

      try {
        setIsLoading(true);

        // Add user message to state and database
        const userMsg: ChatMessage = {
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, userMsg]);

        // Save user message to database
        await createChatMessage(userId, 'user', userMessage, currentSessionId);

        // Auto-generate title for first message
        if (messages.length === 0 && !isTitleSetting) {
          setIsTitleSetting(true);
          try {
            const title = userMessage.split('\n')[0].substring(0, 50);
            await updateChatSessionTitle(currentSessionId, title);
            setSessions(prev => prev.map(s => 
              s.id === currentSessionId ? { ...s, title } : s
            ));
          } catch (error) {
            console.error('Error setting session title:', error);
          } finally {
            setIsTitleSetting(false);
          }
        }

        // Get patient context
        const userNotes = await getNotesByUserId(userId);
        const systemPrompt = await buildSystemPrompt(userNotes);

        // Prepare messages for API
        const conversationMessages = messages
          .concat(userMsg)
          .map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          }));

        // Generate response
        const response = await generateText(conversationMessages, systemPrompt, 0.7, 1024);

        // Add assistant message to state and database
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMsg]);

        // Save assistant message to database
        await createChatMessage(userId, 'assistant', response, currentSessionId);
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Add error message
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMsg]);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentSessionId, messages, buildSystemPrompt, isTitleSetting]
  );

  // Create new chat session
  const createNewChat = useCallback(async () => {
    try {
      const newSession = await createChatSession(userId, 'New Chat');
      if (newSession) {
        const formattedSession: ChatSession = {
          id: newSession.id,
          userId: newSession.userId,
          title: newSession.title,
          createdAt: newSession.createdAt,
          updatedAt: newSession.updatedAt,
        };
        setSessions(prev => [formattedSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating new chat session:', error);
      throw error;
    }
  }, [userId]);

  // Switch to existing session
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        // Switch to another session or create new one
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id);
        } else {
          await createNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }, [currentSessionId, sessions, createNewChat]);

  return {
    messages,
    isLoading,
    isInitializing,
    currentSessionId,
    sessions,
    sendMessage,
    createNewChat,
    switchSession,
    deleteSession,
  };
}
