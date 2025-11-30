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

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionResult {
  text: string;
  segments?: TranscriptionSegment[];
}

/**
 * Transcribe an audio file to text
 * @param audioFile - The audio file to transcribe
 * @param language - Optional language code (e.g., 'en' for English)
 * @param prompt - Optional prompt to guide the model's style
 * @param verbose - If true, returns detailed segments with timestamps
 * @returns Transcription result with text and optional segments
 */
export async function transcribeAudio(
  audioFile: File,
  language?: string,
  prompt?: string,
  verbose: boolean = false
): Promise<TranscriptionResult> {
  try {
    const responseFormat = verbose ? 'verbose_json' : 'json';

    const transcription = await getClient().audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      language,
      prompt,
      response_format: responseFormat as 'json' | 'verbose_json' | 'text',
      temperature: 0.0,
      timestamp_granularities: verbose ? ['word', 'segment'] : undefined,
    });

    if (verbose && typeof transcription === 'object' && 'segments' in transcription) {
      return {
        text: transcription.text || '',
        segments: (transcription as any).segments,
      };
    }

    return {
      text: typeof transcription === 'string' ? transcription : transcription.text || '',
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Transcribe an audio file from a URL
 * @param audioUrl - URL of the audio file
 * @param language - Optional language code
 * @param prompt - Optional prompt to guide the model
 * @param verbose - If true, returns detailed segments
 * @returns Transcription result
 */
export async function transcribeAudioFromUrl(
  audioUrl: string,
  language?: string,
  prompt?: string,
  verbose: boolean = false
): Promise<TranscriptionResult> {
  try {
    const responseFormat = verbose ? 'verbose_json' : 'json';

    const transcription = await getClient().audio.transcriptions.create({
      file: new File([''], audioUrl), // Groq SDK expects a File, but we'll use URL approach
      model: 'whisper-large-v3-turbo',
      language,
      prompt,
      response_format: responseFormat as 'json' | 'verbose_json' | 'text',
      temperature: 0.0,
    });

    if (verbose && typeof transcription === 'object' && 'segments' in transcription) {
      return {
        text: transcription.text || '',
        segments: (transcription as any).segments,
      };
    }

    return {
      text: typeof transcription === 'string' ? transcription : transcription.text || '',
    };
  } catch (error) {
    console.error('Error transcribing audio from URL:', error);
    throw error;
  }
}

/**
 * Translate an audio file to English
 * @param audioFile - The audio file to translate
 * @param prompt - Optional prompt to guide the translation style
 * @returns Translation result with English text
 */
export async function translateAudio(
  audioFile: File,
  prompt?: string
): Promise<TranscriptionResult> {
  try {
    const translation = await getClient().audio.translations.create({
      file: audioFile,
      model: 'whisper-large-v3',
      prompt,
      response_format: 'json',
      temperature: 0.0,
    });

    return {
      text: typeof translation === 'string' ? translation : translation.text || '',
    };
  } catch (error) {
    console.error('Error translating audio:', error);
    throw error;
  }
}

/**
 * Analyze transcription quality based on metadata
 * @param segment - A transcription segment with metadata
 * @returns Quality assessment
 */
export function analyzeTranscriptionQuality(segment: TranscriptionSegment): {
  confidence: 'high' | 'medium' | 'low';
  hasSpeech: boolean;
  compressionNormal: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // Check avg_logprob (closer to 0 is better)
  if (segment.avg_logprob < -0.5) {
    confidence = 'low';
    issues.push('Low confidence - possible unclear pronunciation or noise');
  } else if (segment.avg_logprob < -0.2) {
    confidence = 'medium';
  }

  // Check no_speech_prob (closer to 0 is better for speech)
  const hasSpeech = segment.no_speech_prob < 0.5;
  if (!hasSpeech) {
    issues.push('No speech detected - might be silence or non-verbal sounds');
  }

  // Check compression_ratio (should be between 1.2 and 2.5)
  const compressionNormal = segment.compression_ratio >= 1.2 && segment.compression_ratio <= 2.5;
  if (!compressionNormal) {
    if (segment.compression_ratio < 1.2) {
      issues.push('Unusual speech patterns - possible stuttering or repetition');
    } else {
      issues.push('Very high compression ratio - might indicate speech clarity issues');
    }
  }

  return {
    confidence,
    hasSpeech,
    compressionNormal,
    issues,
  };
}

/**
 * Process a recording blob to transcribe clinical notes
 * @param blob - Audio blob from recording
 * @param language - Language of the audio
 * @returns Transcribed text
 */
export async function processClinicalRecording(
  blob: Blob,
  language: string = 'en'
): Promise<string> {
  try {
    const file = new File([blob], 'recording.webm', { type: blob.type });
    const result = await transcribeAudio(file, language);
    return result.text;
  } catch (error) {
    console.error('Error processing clinical recording:', error);
    throw error;
  }
}
