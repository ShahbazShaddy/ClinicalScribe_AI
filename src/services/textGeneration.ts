import Groq from 'groq-sdk';
import ENV from '@/config/env';
import { getNoteTemplate } from '@/config/noteTemplates';

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
 * Extract patient information from transcribed text
 * @param transcribedText - The transcribed clinical conversation
 * @returns Extracted patient information (name, age, chief complaint)
 */
export async function extractPatientInfo(
  transcribedText: string
): Promise<{ name?: string; age?: string; chiefComplaint?: string }> {
  const systemPrompt = `You are a clinical documentation specialist. Extract patient information from the transcribed clinical conversation.

Analyze the conversation and extract:
- Patient name: The patient's full name or identifier
- Patient age: The patient's age (numeric value only, e.g., "45" not "45 years old")
- Chief complaint: The primary reason for the visit or main concern

Return a JSON object with these keys (use null for any missing information):
{
  "name": "patient name or null",
  "age": "numeric age or null",
  "chief_complaint": "chief complaint or null"
}

Rules:
- Only extract information explicitly mentioned in the conversation
- For age, return only the numeric value (e.g., "35" not "35 years")
- For chief complaint, extract the main concern in 1-2 sentences
- Use null for any field not mentioned in the audio
- Return ONLY valid JSON, no markdown or code blocks`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Extract patient information from this clinical conversation:\n\n${transcribedText}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.2, 512);
    console.log('📋 Patient Info Extraction Response:', response);

    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully extracted patient info:', {
        name: parsed.name,
        age: parsed.age,
        chief_complaint: parsed.chief_complaint
      });

      return {
        name: parsed.name || undefined,
        age: parsed.age || undefined,
        chiefComplaint: parsed.chief_complaint || undefined,
      };
    }

    console.warn('⚠️ Could not extract JSON for patient info');
    return {};
  } catch (error) {
    console.error('❌ Error extracting patient info:', error);
    return {};
  }
}


export async function generateStructuredNote(
  transcribedText: string
): Promise<Record<string, string>> {
  const systemPrompt = `You are a clinical documentation specialist. Analyze the transcribed clinical conversation and extract relevant clinical information.

IMPORTANT: Generate sections dynamically based on what's actually discussed in the conversation. Do NOT force any predefined structure.

Analyze the content and create appropriate sections. For example:
- If patient history is discussed: create "Patient History" section
- If physical exam is mentioned: create "Physical Examination" section  
- If treatment is discussed: create "Treatment Plan" section
- If diagnoses are mentioned: create "Assessment/Diagnosis" section
- If specific concerns are raised: create sections for those concerns
- If follow-up is discussed: create "Follow-up" section
- If billing codes are relevant: create "ICD-10/CPT Codes" section

Return a JSON object where:
- Each key is a section title (in snake_case, e.g., "patient_history", "physical_exam", "assessment")
- Each value is the detailed content for that section

Example format:
{
  "chief_complaint": "Patient's main concern in brief",
  "patient_history": "Relevant medical and social history",
  "physical_examination": "Physical exam findings",
  "assessment_and_plan": "Clinical impression and treatment approach",
  "follow_up": "Follow-up instructions"
}

Rules:
- Only include sections that are actually relevant to the conversation
- Use descriptive snake_case keys that indicate the section content
- If information is minimal or not discussed, omit that section entirely
- Return ONLY valid JSON, no markdown, no code blocks
- Ensure all string values are properly escaped for JSON`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Analyze this clinical conversation and extract relevant sections dynamically:\n\n${transcribedText}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.3, 2048);
    console.log('📝 Raw AI Response:', response.substring(0, 300) + '...');

    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed dynamic sections with keys:', Object.keys(parsed));
      
      // Use the dynamically generated sections as-is
      const result: Record<string, string> = parsed;
      
      console.log('🎯 Final flexible note structure with sections:', {
        generatedSections: Object.keys(result),
        sectionCount: Object.keys(result).length
      });
      
      return result;
    }

    console.warn('⚠️ Could not extract JSON from response');

    // If JSON parsing fails, return the raw text as a single section
    const fallback: Record<string, string> = {
      'clinical_notes': response
    };
    
    console.log('🔄 Using fallback with single section');
    return fallback;
  } catch (error) {
    console.error('❌ Error generating flexible note:', error);

    // Return error state
    const errorResult: Record<string, string> = {
      'error': 'Error generating note content. Please try again or enter manually.'
    };
    
    console.error('⛔ Error generating note');
    return errorResult;
  }
}

/**
 * Extract structured clinical data from note content
 * @param noteContent - The note content object with all sections
 * @returns Extracted structured data including vitals, clinical info, symptoms
 */
export async function extractStructuredData(
  noteContent: Record<string, string>
): Promise<any> {
  const contentText = Object.entries(noteContent)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n\n');

  const systemPrompt = `You are a clinical data extraction specialist. Analyze clinical notes and extract structured data.

Extract the following information from the clinical notes and return a JSON object:

{
  "vitals": {
    "bloodPressure": {"systolic": number, "diastolic": number, "status": "normal|elevated|high|critical"},
    "heartRate": {"value": number, "status": "normal|low|high"},
    "temperature": {"value": number, "unit": "C|F", "status": "normal|low|fever|high-fever"},
    "weight": {"value": number, "unit": "lbs|kg", "previousValue": number or null, "change": number or null, "status": "stable|gained|lost"},
    "o2Saturation": {"value": number, "status": "normal|low|critical"},
    "respiratoryRate": {"value": number, "status": "normal|low|high"}
  },
  "clinicalInfo": {
    "chiefComplaint": "string",
    "diagnoses": ["array", "of", "diagnoses"],
    "medicationsMentioned": [
      {"name": "medication name", "dosage": "dosage", "frequency": "frequency", "route": "route"}
    ],
    "labValues": [
      {"testName": "test name", "value": "value", "unit": "unit", "referenceRange": "range", "status": "normal|high|low|critical"}
    ],
    "allergies": ["array", "of", "allergies"]
  },
  "symptoms": [
    {"name": "symptom", "severity": "mild|moderate|severe", "duration": "duration"}
  ]
}

Rules:
- Extract ONLY values explicitly mentioned in the notes
- For any missing information, use null
- BP status: normal <120/80, elevated 120-129/<80, high ≥130/80, critical ≥180/120
- HR status: normal 60-100, low <60, high >100
- Temperature status: normal 98.6°F (37°C), fever 100.4-103.9°F, high-fever ≥104°F
- O2 status: normal ≥95%, low 90-94%, critical <90%
- RR status: normal 12-20, low <12, high >20
- For weight: if previous value mentioned, calculate change and status
- Only include diagnoses, medications, and lab values that are actually mentioned
- Return ONLY valid JSON, no markdown`;

  const messages: Message[] = [
    {
      role: 'user',
      content: `Extract structured clinical data from these notes:\n\n${contentText}`,
    },
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.1, 2048);
    console.log('📊 Structured Data Response:', response.substring(0, 300) + '...');

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully extracted structured data');
      return parsed;
    }

    console.warn('⚠️ Could not extract structured data JSON');
    return { vitals: {}, clinicalInfo: {}, symptoms: [] };
  } catch (error) {
    console.error('❌ Error extracting structured data:', error);
    return { vitals: {}, clinicalInfo: {}, symptoms: [] };
  }
}
