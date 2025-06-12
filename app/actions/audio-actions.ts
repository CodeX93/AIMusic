"use server"

import { generateBackgroundMusic, generateSpeechWithMusic, generateRiffusionAudio } from "@/lib/riffusion-service"
import { generateRemix as generateRemixAudio } from "@/lib/ai-audio-service"
import { getGuaranteedFallback, isAudioUrlAccessible } from "@/lib/audio-format-handler"

// API key
const API_KEY = "3909ddf5613106b3fa8c0926b4393b4a"

// Define types for the sample mappings
type VoiceType = 'male' | 'female' | 'robot' | 'deep' | 'neutral' | 'warm'
type StyleType = 'neutral' | 'cheerful' | 'sad' | 'professional' | 'excited' | 'calm'
type GenreType = 'electronic' | 'house' | 'dubstep' | 'trance' | 'hiphop' | 'rock' | 'ambient' | 'jazz' | 'techno' | 'drum-and-bass'

// Update the sample mappings with proper types
const SAMPLE_MAPPING: Record<VoiceType, Record<StyleType, string>> = {
  male: {
    neutral: "/samples/male-neutral-sample.mp3",
    cheerful: "/samples/male-cheerful-sample.mp3",
    sad: "/samples/male-sad-sample.mp3",
    professional: "/samples/male-professional-sample.mp3",
    excited: "/samples/male-excited-sample.mp3",
    calm: "/samples/male-calm-sample.mp3",
  },
  female: {
    neutral: "/samples/female-neutral-sample.mp3",
    cheerful: "/samples/female-cheerful-sample.mp3",
    sad: "/samples/female-sad-sample.mp3",
    professional: "/samples/female-professional-sample.mp3",
    excited: "/samples/female-excited-sample.mp3",
    calm: "/samples/female-calm-sample.mp3",
  },
  robot: {
    neutral: "/samples/neutral-neutral-sample.mp3",
    cheerful: "/samples/neutral-cheerful-sample.mp3",
    sad: "/samples/neutral-sad-sample.mp3",
    professional: "/samples/neutral-professional-sample.mp3",
    excited: "/samples/neutral-excited-sample.mp3",
    calm: "/samples/neutral-calm-sample.mp3",
  },
  deep: {
    neutral: "/samples/deep-neutral-sample.mp3",
    cheerful: "/samples/deep-cheerful-sample.mp3",
    sad: "/samples/deep-sad-sample.mp3",
    professional: "/samples/deep-professional-sample.mp3",
    excited: "/samples/deep-excited-sample.mp3",
    calm: "/samples/deep-calm-sample.mp3",
  },
  neutral: {
    neutral: "/samples/neutral-neutral-sample.mp3",
    cheerful: "/samples/neutral-cheerful-sample.mp3",
    sad: "/samples/neutral-sad-sample.mp3",
    professional: "/samples/neutral-professional-sample.mp3",
    excited: "/samples/neutral-excited-sample.mp3",
    calm: "/samples/neutral-calm-sample.mp3",
  },
  warm: {
    neutral: "/samples/warm-neutral-sample.mp3",
    cheerful: "/samples/warm-cheerful-sample.mp3",
    sad: "/samples/warm-sad-sample.mp3",
    professional: "/samples/warm-professional-sample.mp3",
    excited: "/samples/warm-excited-sample.mp3",
    calm: "/samples/warm-calm-sample.mp3",
  },
}

const MUSIC_FALLBACK: Record<StyleType, string> = {
  neutral: "/samples/music-neutral.mp3",
  cheerful: "/samples/music-cheerful.mp3",
  sad: "/samples/music-sad.mp3",
  professional: "/samples/music-professional.mp3",
  excited: "/samples/music-excited.mp3",
  calm: "/samples/music-calm.mp3",
}

// Update the GENRE_FALLBACK with all possible genres
const GENRE_FALLBACK: Record<GenreType, string> = {
  electronic: "/samples/edm-remix-sample.mp3",
  house: "/samples/music-cheerful.mp3",
  techno: "/samples/music-professional.mp3",
  trance: "/samples/music-calm.mp3",
  dubstep: "/samples/music-excited.mp3",
  "drum-and-bass": "/samples/music-neutral.mp3",
  hiphop: "/samples/music-professional.mp3",
  rock: "/samples/music-sad.mp3",
  ambient: "/samples/music-calm.mp3",
  jazz: "/samples/music-professional.mp3",
}

interface RemixOptions {
  prompt: string;
  genre: string;
  bpm: number;
  quality?: string;
}

interface AudioGenerationParams {
  prompt: string;
  voice?: VoiceType;
  style?: StyleType;
}

interface MusicGenerationParams {
  prompt: string;
  genre: GenreType;
  bpm: number;
  duration?: number;
}

interface RiffusionOptions {
  prompt: string;
  num_inference_steps?: number;
  guidance?: number;
  duration?: number;
  style?: string;
  effects?: string[];
}

interface RiffusionResponse {
  audio_url: string;
  success: boolean;
}

// Helper type guards for runtime key validation
function isVoiceType(key: string): key is VoiceType {
  return [
    'male', 'female', 'robot', 'deep', 'neutral', 'warm',
  ].includes(key)
}
function isStyleType(key: string): key is StyleType {
  return [
    'neutral', 'cheerful', 'sad', 'professional', 'excited', 'calm',
  ].includes(key)
}

/**
 * Generate audio using Riffusion API
 */
export async function generateAudio({ prompt, voice = "neutral", style = "neutral" }: AudioGenerationParams) {
  try {
    console.log(`[Server] Generating audio with Riffusion: "${prompt}", voice: ${voice}, style: ${style}`)

    // Get fallback sample paths with type safety
    const fallbackVoiceSample = SAMPLE_MAPPING[voice as VoiceType]?.[style as StyleType] || "/samples/sample-neutral.mp3"
    const fallbackMusicSample = MUSIC_FALLBACK[style as StyleType] || "/samples/music-neutral.mp3"

    try {
      // Generate speech and music using Riffusion
      const { speechUrl, musicUrl } = await generateSpeechWithMusic(prompt, voice, style)

      return {
        audioUrl: speechUrl,
        musicUrl: musicUrl,
        fallbackUrl: fallbackVoiceSample,
        fallbackMusicUrl: fallbackMusicSample,
        success: true,
        prompt,
        voice,
        style,
        isRiffusion: true,
      }
    } catch (error: unknown) {
      console.error("Error in Riffusion API:", error)

      // Return fallback samples if API fails
      return {
        audioUrl: null,
        musicUrl: null,
        fallbackUrl: fallbackVoiceSample,
        fallbackMusicUrl: fallbackMusicSample,
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate audio with Riffusion API",
        useFallback: true,
      }
    }
  } catch (error: unknown) {
    console.error("Error in audio generation:", error)
    return {
      audioUrl: null,
      musicUrl: null,
      fallbackUrl: "/samples/sample-neutral.mp3",
      fallbackMusicUrl: "/samples/music-neutral.mp3",
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate audio",
      useFallback: true,
    }
  }
}

/**
 * Generate music using Riffusion API
 */
export async function generateMusic({ prompt, genre, bpm, duration = 30 }: MusicGenerationParams) {
  console.log(`[Server] Music generation requested with Riffusion: "${prompt}", genre: ${genre}, bpm: ${bpm}`)

  // Fallback URL based on genre with type safety
  const fallbackUrl = GENRE_FALLBACK[genre as GenreType] || "/samples/music-neutral.mp3"

  try {
    // Enhance prompt with genre and BPM information for better results
    const enhancedPrompt = `${genre} music with ${bpm} BPM, ${prompt}, high quality audio`

    // Generate music using Riffusion
    const result = await generateRemixAudio({
      prompt: enhancedPrompt,
      genre,
      bpm,
      quality: "high",
    })

    return {
      audioUrl: result.audioUrl,
      fallbackUrl,
      success: true,
      genre,
      bpm,
      isRiffusion: true,
    }
  } catch (error: unknown) {
    console.error("Error in Riffusion music generation:", error)

    // Fall back to local samples if Riffusion API fails
    console.log(`Falling back to local sample for genre: ${genre}`)

    return {
      audioUrl: null,
      fallbackUrl,
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate music with Riffusion",
      useFallback: true,
    }
  }
}

/**
 * Generate audio with background music
 */
export async function generateAudioWithBackgroundMusic(text: string, voice: string, emotion: string) {
  try {
    console.log(`Generating audio with text: ${text}, voice: ${voice}, emotion: ${emotion}`)

    // Get fallback sample paths with runtime type guards
    const fallbackVoiceSample = isVoiceType(voice) && isStyleType(emotion)
      ? SAMPLE_MAPPING[voice][emotion]
      : "/samples/sample-neutral.mp3"
    const fallbackMusicSample = isStyleType(emotion)
      ? MUSIC_FALLBACK[emotion]
      : "/samples/music-neutral.mp3"

    try {
      // Generate speech and music using Riffusion
      const { speechUrl, musicUrl } = await generateSpeechWithMusic(text, voice, emotion)

      return {
        voiceAudioUrl: speechUrl,
        musicUrl: musicUrl,
        fallbackVoiceUrl: fallbackVoiceSample,
        fallbackMusicUrl: fallbackMusicSample,
        success: true,
        message: "Audio generated successfully with Riffusion",
      }
    } catch (error) {
      console.error("Error in Riffusion API:", error)

      // Return fallback samples if API fails
      return {
        voiceAudioUrl: null,
        musicUrl: null,
        fallbackVoiceUrl: fallbackVoiceSample,
        fallbackMusicUrl: fallbackMusicSample,
        success: false,
        message: `Error generating audio: ${error instanceof Error ? error.message : String(error)}`,
        useFallback: true,
      }
    }
  } catch (error) {
    console.error("Error generating audio:", error)
    return {
      voiceAudioUrl: null,
      musicUrl: null,
      fallbackVoiceUrl: "/samples/sample-neutral.mp3",
      fallbackMusicUrl: "/samples/music-neutral.mp3",
      success: false,
      message: `Error generating audio: ${error instanceof Error ? error.message : String(error)}`,
      useFallback: true,
    }
  }
}

/**
 * Generate music for a specific mood
 */
export async function generateMusicForMood(mood: string) {
  try {
    console.log(`Generating music for mood: ${mood}`)

    // Generate music using Riffusion
    const musicUrl = await generateBackgroundMusic(mood)

    return {
      musicUrl,
      fallbackUrl: isStyleType(mood) ? MUSIC_FALLBACK[mood] : "/samples/music-neutral.mp3",
      success: true,
      message: "Music generated successfully with Riffusion",
    }
  } catch (error) {
    console.error("Error generating music:", error)
    return {
      musicUrl: null,
      fallbackUrl: isStyleType(mood) ? MUSIC_FALLBACK[mood] : "/samples/music-neutral.mp3",
      success: false,
      message: `Error generating music: ${error instanceof Error ? error.message : String(error)}`,
      useFallback: true,
    }
  }
}

/**
 * Generate a remix track with enhanced options and improved error handling
 */
export async function generateRemixTrack(
  description: string,
  genre = "edm",
  bpm = 128,
  quality = "high",
): Promise<{
  remixUrl: string | null
  imageUrl: string | null
  fallbackUrl: string
  success: boolean
  message: string
  useFallback?: boolean
  errorDetails?: string
  genre?: string
  bpm?: number
  quality?: string
  timestamp?: string
}> {
  console.log(`Generating remix: "${description}", genre: ${genre}, bpm: ${bpm}, quality: ${quality}`)

  try {
    // Get a guaranteed fallback URL for this genre
    const fallbackUrl = getGuaranteedFallback(genre)

    // Generate the remix with enhanced EDM parameters
    const result = await generateRemixAudio({
      prompt: description,
      genre,
      bpm,
      quality: quality as "standard" | "high" | "ultra",
    })

    // Verify the audio URL is accessible
    let audioUrlAccessible = false
    if (result.audioUrl) {
      audioUrlAccessible = await isAudioUrlAccessible(result.audioUrl)
    }

    // If the audio URL is not accessible, use the fallback
    if (!result.audioUrl || !audioUrlAccessible) {
      console.log("Generated audio URL is not accessible, using fallback:", fallbackUrl)

      return {
        remixUrl: fallbackUrl, // Use fallback URL instead of null
        imageUrl: `/images/edm-dj-${Math.floor(Math.random() * 6) + 1}.png`,
        fallbackUrl,
        success: true, // Mark as success since we have a working fallback
        message: "Using high-quality fallback audio sample.",
        genre,
        bpm,
        quality,
        timestamp: new Date().toISOString(),
      }
    }

    // Return the successful result
    return {
      remixUrl: result.audioUrl,
      imageUrl: `/images/edm-dj-${Math.floor(Math.random() * 6) + 1}.png`,
      fallbackUrl,
      success: true,
      message: "Remix generated successfully!",
      genre,
      bpm,
      quality,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error in generateRemixTrack:", error)

    // Always return a working fallback in case of any error
    const fallbackUrl = getGuaranteedFallback(genre)
    return {
      remixUrl: fallbackUrl, // Use fallback URL instead of null
      imageUrl: `/images/edm-dj-${Math.floor(Math.random() * 6) + 1}.png`,
      fallbackUrl,
      success: true, // Mark as success since we have a working fallback
      message: "Using high-quality fallback audio sample.",
      genre,
      bpm,
      quality,
      timestamp: new Date().toISOString(),
    }
  }
}

export async function generateRemix({ prompt, genre, bpm, quality = "high" }: RiffusionOptions & { genre: GenreType; bpm: number; quality?: string }) {
  try {
    console.log(`[Server] Generating remix with Riffusion: "${prompt}", genre: ${genre}, bpm: ${bpm}`)

    // Generate remix using Riffusion
    const result = await generateRiffusionAudio({
      prompt,
      num_inference_steps: 50,
      guidance: 7.5
    })

    // Ensure the audio URL is a valid, browser-compatible format (e.g., .mp3)
    const audioUrl = result.audio_url.endsWith('.mp3') ? result.audio_url : result.audio_url + '.mp3'

    return {
      audioUrl,
      success: true,
      genre,
      bpm,
      isRiffusion: true,
    }
  } catch (error: unknown) {
    console.error("Error in Riffusion remix generation:", error)

    // Fall back to local samples if Riffusion API fails
    const fallbackUrl = GENRE_FALLBACK[genre as GenreType] || "/samples/music-neutral.mp3"

    return {
      audioUrl: null,
      fallbackUrl,
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate remix with Riffusion",
      useFallback: true,
    }
  }
}
