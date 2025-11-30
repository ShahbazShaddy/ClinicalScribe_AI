import { useState, useCallback, useRef } from 'react';
import {
  generateText,
  streamText,
  generateClinicalNoteSummary,
  extractClinicalInformation,
  generateStructuredNote,
  Message,
} from '@/services/textGeneration';
import {
  transcribeAudio,
  processClinicalRecording,
  TranscriptionResult,
} from '@/services/speechToText';
import {
  speakText,
  stopSpeech,
  isSpeaking,
  TextToSpeechOptions,
} from '@/services/textToSpeech';

export interface ClinicalExtraction {
  diagnosis: string[];
  medications: string[];
  labOrders: string[];
  followUpInstructions: string;
}

export interface StructuredNoteContent {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10: string;
  cpt: string;
}

/**
 * Custom hook for AI services including text generation, speech-to-text, and text-to-speech
 */
export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Text Generation Functions
  const generateTextCompletion = useCallback(
    async (messages: Message[], systemPrompt?: string, temperature?: number) => {
      setIsGenerating(true);
      setError(null);
      try {
        const result = await generateText(messages, systemPrompt, temperature);
        setGeneratedText(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error generating text';
        setError(errorMessage);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const generateStreamingText = useCallback(
    async (
      messages: Message[],
      systemPrompt: string | undefined,
      temperature: number | undefined,
      onChunk?: (chunk: string) => void
    ) => {
      setIsGenerating(true);
      setError(null);
      let fullText = '';

      try {
        await streamText(messages, systemPrompt, temperature, 1024, (chunk) => {
          fullText += chunk;
          setGeneratedText(fullText);
          if (onChunk) {
            onChunk(chunk);
          }
        });
        return fullText;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error streaming text';
        setError(errorMessage);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const generateClinicalSummary = useCallback(async (notes: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const summary = await generateClinicalNoteSummary(notes);
      setGeneratedText(summary);
      return summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generating summary';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const extractClinicalData = useCallback(async (notes: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const extracted = await extractClinicalInformation(notes);
      return extracted as ClinicalExtraction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error extracting data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateStructuredNoteContent = useCallback(
    async (transcribedText: string, noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P' = 'SOAP') => {
      setIsGenerating(true);
      setError(null);
      try {
        const noteContent = await generateStructuredNote(transcribedText, noteType);
        return noteContent as StructuredNoteContent;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error generating structured note';
        setError(errorMessage);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Speech-to-Text Functions
  const transcribeAudioFile = useCallback(async (file: File, language?: string) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const result: TranscriptionResult = await transcribeAudio(file, language);
      setTranscribedText(result.text);
      return result.text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error transcribing audio';
      setError(errorMessage);
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const transcribeClinicalRecording = useCallback(async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const text = await processClinicalRecording(blob, 'en');
      setTranscribedText(text);
      return text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error transcribing recording';
      setError(errorMessage);
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  // Text-to-Speech Functions
  const speakGeneratedText = useCallback(
    async (text?: string, options?: TextToSpeechOptions) => {
      setIsSpeakingText(true);
      setError(null);
      try {
        const textToSpeak = text || generatedText;
        if (!textToSpeak) {
          throw new Error('No text to speak');
        }
        await speakText(textToSpeak, options);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error speaking text';
        setError(errorMessage);
        throw err;
      } finally {
        setIsSpeakingText(false);
      }
    },
    [generatedText]
  );

  const stopSpeaking = useCallback(() => {
    stopSpeech();
    setIsSpeakingText(false);
  }, []);

  const checkIfSpeaking = useCallback(() => {
    return isSpeaking();
  }, []);

  // Clear states
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetStates = useCallback(() => {
    setIsGenerating(false);
    setIsTranscribing(false);
    setIsSpeakingText(false);
    setGeneratedText('');
    setTranscribedText('');
    setError(null);
  }, []);

  return {
    // State
    isGenerating,
    isTranscribing,
    isSpeakingText,
    generatedText,
    transcribedText,
    error,

    // Text Generation
    generateTextCompletion,
    generateStreamingText,
    generateClinicalSummary,
    extractClinicalData,
    generateStructuredNoteContent,

    // Speech-to-Text
    transcribeAudioFile,
    transcribeClinicalRecording,

    // Text-to-Speech
    speakGeneratedText,
    stopSpeaking,
    checkIfSpeaking,

    // Utilities
    clearError,
    resetStates,
  };
}
