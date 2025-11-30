/**
 * Text-to-Speech Service
 * This service uses the Web Speech API for client-side text-to-speech synthesis
 * The SpeechSynthesis API is natively supported in modern browsers
 */

export interface TextToSpeechOptions {
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
  language?: string; // e.g., 'en-US', 'en-GB'
  voiceIndex?: number; // Index of the voice to use
}

export interface Voice {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

/**
 * Get available voices for text-to-speech
 * @returns Array of available voices
 */
export function getAvailableVoices(): Voice[] {
  const synth = window.speechSynthesis;
  return synth.getVoices().map((voice) => ({
    name: voice.name,
    lang: voice.lang,
    default: voice.default,
    localService: voice.localService,
  }));
}

/**
 * Speak text using the Web Speech API
 * @param text - The text to speak
 * @param options - Configuration options for speech synthesis
 * @returns Promise that resolves when speech starts
 */
export async function speakText(
  text: string,
  options: TextToSpeechOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;

    // Cancel any ongoing speech
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure options
    if (options.rate) utterance.rate = options.rate;
    if (options.pitch) utterance.pitch = options.pitch;
    if (options.volume) utterance.volume = options.volume;
    if (options.language) utterance.lang = options.language;

    if (options.voiceIndex !== undefined) {
      const voices = synth.getVoices();
      if (options.voiceIndex < voices.length) {
        utterance.voice = voices[options.voiceIndex];
      }
    }

    utterance.onstart = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    synth.speak(utterance);
  });
}

/**
 * Stop current speech synthesis
 */
export function stopSpeech(): void {
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.paused) {
    synth.cancel();
  }
}

/**
 * Pause current speech synthesis
 */
export function pauseSpeech(): void {
  const synth = window.speechSynthesis;
  if (synth.speaking) {
    synth.pause();
  }
}

/**
 * Resume paused speech synthesis
 */
export function resumeSpeech(): void {
  const synth = window.speechSynthesis;
  if (synth.paused) {
    synth.resume();
  }
}

/**
 * Check if speech synthesis is currently speaking
 */
export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}

/**
 * Check if speech synthesis is supported in the browser
 */
export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Speak clinical notes with professional tone
 * @param notes - Clinical notes text to speak
 * @returns Promise that resolves when speech completes
 */
export async function speakClinicalNotes(notes: string): Promise<void> {
  const options: TextToSpeechOptions = {
    rate: 1.0, // Normal speech rate
    pitch: 1.0, // Normal pitch
    volume: 1.0, // Full volume
    language: 'en-US', // English US
  };

  return speakText(notes, options);
}

/**
 * Speak text with real-time streaming support
 * Useful for streaming text as it's being generated
 * @param text - Text to speak
 * @param options - Speech synthesis options
 * @param onEnd - Callback when speech ends
 */
export function speakTextWithCallback(
  text: string,
  options: TextToSpeechOptions = {},
  onEnd?: () => void
): void {
  const synth = window.speechSynthesis;

  if (synth.speaking) {
    synth.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);

  if (options.rate) utterance.rate = options.rate;
  if (options.pitch) utterance.pitch = options.pitch;
  if (options.volume) utterance.volume = options.volume;
  if (options.language) utterance.lang = options.language;

  if (options.voiceIndex !== undefined) {
    const voices = synth.getVoices();
    if (options.voiceIndex < voices.length) {
      utterance.voice = voices[options.voiceIndex];
    }
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  synth.speak(utterance);
}

/**
 * Request microphone access for recording
 * @returns Promise with the media stream
 */
export async function requestMicrophoneAccess(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return stream;
  } catch (error) {
    console.error('Error requesting microphone access:', error);
    throw error;
  }
}

/**
 * Stop all audio tracks in a media stream
 * @param stream - The media stream to stop
 */
export function stopAudioStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}
