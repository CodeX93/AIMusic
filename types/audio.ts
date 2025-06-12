// Audio-related type definitions

/**
 * Props for the EnhancedAudioPlayer component
 */
export interface AudioPlayerProps {
  audioUrl: string
  fallbackUrl?: string
  title?: string
  subtitle?: string
  imageUrl?: string
  onPlaybackComplete?: () => void
  onError?: (error: Error) => void
  showWaveform?: boolean
  autoplay?: boolean
  visualizer?: "bars" | "waveform" | "circle"
  genre?: string
}

/**
 * Audio processing options
 */
export interface AudioProcessingOptions {
  /** Gain/volume level from 0 to 1 */
  gain?: number

  /** Reverb level from 0 to 1 */
  reverb?: number

  /** Delay time in seconds */
  delay?: number

  /** Delay feedback amount from 0 to 1 */
  delayFeedback?: number

  /** Low-pass filter cutoff frequency in Hz */
  lowpass?: number

  /** High-pass filter cutoff frequency in Hz */
  highpass?: number
}

/**
 * Audio generation parameters
 */
export interface AudioGenerationParams {
  /** Text prompt for generation */
  prompt: string

  /** Voice type to use */
  voice?: "male" | "female" | "neutral" | "warm" | "deep"

  /** Emotional tone for the voice */
  tone?: "neutral" | "cheerful" | "sad" | "professional" | "excited" | "calm"

  /** Music genre to generate */
  genre?: "none" | "edm" | "ambient" | "rock" | "jazz" | "classical"

  /** Processing options for the generated audio */
  processing?: AudioProcessingOptions
}

export interface AudioFormat {
  extension: string
  mimeType: string
  browserSupport: {
    chrome: boolean
    firefox: boolean
    safari: boolean
    edge: boolean
  }
}
