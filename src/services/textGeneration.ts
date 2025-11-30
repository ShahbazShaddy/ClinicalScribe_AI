import Groq from 'groq-sdk';
import ENV from '@/config/env';

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    const apiKey = ENV.GROQ_API_KEY;
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      isDev: ENV.IS_DEV,
      allEnvKeys: Object.keys(import.meta.env)
    });
    
    if (!apiKey) {
      console.error('Available environment variables:', import.meta.env);
      throw new Error('VITE_GROQ_API_KEY environment variable is not set. Please restart your dev server after adding the .env file.');
    }
    client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }
  return client;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate a text completion using Groq's Chat Completions API
 * @param messages - Array of messages in chronological order
 * @param systemPrompt - Optional system message to set the behavior of the assistant
 * @param temperature - Controls randomness (0-1, default 0.5)
 * @param maxTokens - Maximum tokens to generate (default 1024)
 * @returns The generated text response
 */
export async function generateText(
  messages: Message[],
  systemPrompt?: string,
  temperature: number = 0.5,
  maxTokens: number = 1024
): Promise<string> {
  const fullMessages: Message[] = [];

  if (systemPrompt) {
    fullMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  fullMessages.push(...messages);

  try {
    const completion = await getClient().chat.completions.create({
      messages: fullMessages,
      model: 'llama-3.3-70b-versatile',
      temperature,
      max_completion_tokens: maxTokens,
      top_p: 1,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

/**
 * Stream a text completion for real-time responses
 * @param messages - Array of messages in chronological order
 * @param systemPrompt - Optional system message
 * @param temperature - Controls randomness (0-1, default 0.5)
 * @param maxTokens - Maximum tokens to generate (default 1024)
 * @param onChunk - Callback function called for each chunk of text
 */
export async function streamText(
  messages: Message[],
  systemPrompt: string | undefined,
  temperature: number = 0.5,
  maxTokens: number = 1024,
  onChunk: (chunk: string) => void
): Promise<void> {
  const fullMessages: Message[] = [];

  if (systemPrompt) {
    fullMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  fullMessages.push(...messages);

  try {
    const stream = await getClient().chat.completions.create({
      messages: fullMessages,
      model: 'llama-3.3-70b-versatile',
      temperature,
      max_completion_tokens: maxTokens,
      top_p: 1,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Error streaming text:', error);
    throw error;
  }
}

/**
 * Generate clinical notes summary from transcribed text
 * @param transcribedText - The transcribed clinical note text
 * @returns Structured clinical note summary
 */
export async function generateClinicalNoteSummary(
  transcribedText: string
): Promise<string> {
  const systemPrompt = `You are a clinical documentation specialist. Your task is to analyze transcribed clinical notes and provide a structured, professional summary. 
Focus on:
- Chief Complaint
- History of Present Illness
- Physical Examination Findings
- Assessment and Plan
- Return instructions and follow-up care

Format the response clearly with section headers.`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Please create a structured clinical note summary from the following transcribed text:\n\n${transcribedText}`,
    },
  ];

  return generateText(messages, systemPrompt, 0.3, 1024);
}

/**
 * Extract key information from clinical notes
 * @param notes - Clinical notes text
 * @returns Extracted key information
 */
export async function extractClinicalInformation(notes: string): Promise<{
  diagnosis: string[];
  medications: string[];
  labOrders: string[];
  followUpInstructions: string;
}> {
  const systemPrompt = `You are a clinical information extraction specialist. Extract the following information from clinical notes and return a JSON object with:
- diagnosis: array of diagnoses mentioned
- medications: array of medications prescribed or mentioned
- labOrders: array of laboratory tests ordered
- followUpInstructions: string containing follow-up care instructions

Return ONLY valid JSON, no additional text.`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Extract clinical information from these notes:\n\n${notes}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.1, 1024);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      diagnosis: [],
      medications: [],
      labOrders: [],
      followUpInstructions: '',
    };
  } catch (error) {
    console.error('Error extracting clinical information:', error);
    return {
      diagnosis: [],
      medications: [],
      labOrders: [],
      followUpInstructions: '',
    };
  }
}

/**
 * Generate structured SOAP note content from transcribed text
 * @param transcribedText - The transcribed clinical conversation
 * @param noteType - Type of note to generate
 * @returns Structured note content object
 */
export async function generateStructuredNote(
  transcribedText: string,
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P' = 'SOAP'
): Promise<{
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10: string;
  cpt: string;
}> {
  const systemPrompt = `You are a clinical documentation specialist. Generate a structured ${noteType} note from the transcribed patient conversation.

Return a JSON object with these exact keys:
- subjective: Patient's reported symptoms, history, and concerns (what the patient tells you)
- objective: Clinical findings, vital signs, physical exam findings, test results
- assessment: Clinical impression, diagnosis, differential diagnoses
- plan: Treatment plan, medications, follow-up instructions, referrals
- icd10: Relevant ICD-10 diagnosis codes (format: "Code - Description" on separate lines)
- cpt: Relevant CPT procedure codes (format: "Code - Description" on separate lines)

Be thorough and professional. If information is not available in the transcript, indicate "Not documented" for that section.
Return ONLY valid JSON, no additional text or markdown.`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Generate a structured ${noteType} note from this transcribed patient conversation:\n\n${transcribedText}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.3, 2048);
    console.log('AI Response:', response);
    
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        subjective: parsed.subjective || 'Not documented',
        objective: parsed.objective || 'Not documented',
        assessment: parsed.assessment || 'Not documented',
        plan: parsed.plan || 'Not documented',
        icd10: parsed.icd10 || 'Not documented',
        cpt: parsed.cpt || 'Not documented',
      };
    }
    
    // If JSON parsing fails, return a structured response with the raw text
    return {
      subjective: response,
      objective: 'Unable to parse structured response',
      assessment: 'Please review and edit manually',
      plan: 'Please review and edit manually',
      icd10: 'Not documented',
      cpt: 'Not documented',
    };
  } catch (error) {
    console.error('Error generating structured note:', error);
    return {
      subjective: 'Error generating note content',
      objective: 'Please try again or enter manually',
      assessment: 'Error occurred during AI processing',
      plan: 'Please review and complete manually',
      icd10: 'Not documented',
      cpt: 'Not documented',
    };
  }
}
