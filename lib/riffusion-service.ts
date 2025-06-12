"use server"

// Riffusion API service for high-quality audio generation
export interface RiffusionOptions {
  prompt: string
  negative_prompt?: string
  seed?: number
  denoising?: number
  guidance?: number
  num_inference_steps?: number
  width?: number
  height?: number
  alpha?: number
  interpolation_texts?: string[]
  num_interpolation_steps?: number
}

export interface RiffusionResponse {
  audio_url: string
  seed: number
  image_url: string
}

export interface TextToSpeechOptions {
  text: string
  voice_type?: string // male, female, neutral, etc.
  emotion?: string // neutral, cheerful, sad, etc.
  quality?: string // low, medium, high
}

export interface RemixOptions {
  description: string
  genre?: string
  bpm?: number
  quality?: "standard" | "high" | "ultra"
  seed?: number
}

const RIFFUSION_API_KEY = "3909ddf5613106b3fa8c0926b4393b4a"
const RIFFUSION_API_URL = "https://api.riffusion.com/v1"

/**
 * Generate high-quality audio using the Riffusion API
 */
export async function generateRiffusionAudio(options: RiffusionOptions): Promise<RiffusionResponse> {
  try {
    const defaultOptions = {
      negative_prompt: "low quality, noise, distortion, muffled, garbled, static, hiss",
      denoising: 0.78,
      guidance: 7.5,
      num_inference_steps: 60,
      width: 512,
      height: 512,
      alpha: 0.5,
    }

    const requestOptions = {
      ...defaultOptions,
      ...options,
    }

    console.log("Generating Riffusion audio with options:", JSON.stringify(requestOptions))

    const response = await fetch(`${RIFFUSION_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RIFFUSION_API_KEY}`,
      },
      body: JSON.stringify(requestOptions),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Riffusion API error:", errorText)
      throw new Error(`Riffusion API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Handle the response format correctly
    if (data.data && data.data.length > 0) {
      const generatedItem = data.data[0]
      return {
        audio_url: generatedItem.audio_url || "",
        seed: generatedItem.seed || 0,
        image_url: generatedItem.url || "",
      }
    } else {
      throw new Error("Unexpected response format from Riffusion API")
    }
  } catch (error) {
    console.error("Error generating Riffusion audio:", error)
    throw error
  }
}

/**
 * Generate text-to-speech audio using Riffusion
 */
export async function generateTextToSpeech(options: TextToSpeechOptions): Promise<string> {
  try {
    const { text, voice_type = "neutral", emotion = "neutral", quality = "high" } = options

    // Create a prompt that instructs Riffusion to generate speech
    // We'll use specific prompts based on voice type and emotion to guide the generation
    let voicePrompt = ""

    switch (voice_type) {
      case "male":
        voicePrompt = "male voice, deep, clear speech"
        break
      case "female":
        voicePrompt = "female voice, clear speech"
        break
      case "deep":
        voicePrompt = "deep voice, bass, resonant"
        break
      case "warm":
        voicePrompt = "warm voice, smooth, rich tones"
        break
      default:
        voicePrompt = "neutral voice, clear speech"
    }

    // Add emotion to the prompt
    let emotionPrompt = ""
    switch (emotion) {
      case "cheerful":
        emotionPrompt = "happy, upbeat, positive tone"
        break
      case "sad":
        emotionPrompt = "sad, melancholic, somber tone"
        break
      case "professional":
        emotionPrompt = "professional, formal, business-like"
        break
      case "excited":
        emotionPrompt = "excited, enthusiastic, energetic"
        break
      case "calm":
        emotionPrompt = "calm, soothing, relaxed"
        break
      default:
        emotionPrompt = "neutral tone"
    }

    // Quality settings
    const qualitySettings = {
      low: {
        num_inference_steps: 30,
        guidance: 6.0,
      },
      medium: {
        num_inference_steps: 50,
        guidance: 7.0,
      },
      high: {
        num_inference_steps: 70,
        guidance: 8.0,
      },
    }

    const settings = qualitySettings[quality] || qualitySettings.high

    // Create the full prompt
    const prompt = `${voicePrompt}, ${emotionPrompt}, speaking: "${text}", high quality audio, clear articulation, no background noise`

    // Generate the audio
    const result = await generateRiffusionAudio({
      prompt,
      negative_prompt: "music, instruments, low quality, noise, static, distortion, muffled, garbled",
      num_inference_steps: settings.num_inference_steps,
      guidance: settings.guidance,
    })

    return result.audio_url
  } catch (error) {
    console.error("Error generating text-to-speech:", error)
    throw error
  }
}

/**
 * Generate background music based on a mood or genre
 */
export async function generateBackgroundMusic(mood: string, genre?: string): Promise<string> {
  try {
    const prompt = genre
      ? `${genre} music with ${mood} mood, high quality, clear audio, professional production`
      : `${mood} music, high quality, clear audio, professional production`

    const result = await generateRiffusionAudio({
      prompt,
      num_inference_steps: 50, // Higher steps for better quality
      guidance: 7.5, // Higher guidance for more adherence to prompt
    })

    return result.audio_url
  } catch (error) {
    console.error("Error generating background music:", error)
    throw error
  }
}

/**
 * Transform existing audio with Riffusion
 */
export async function transformAudio(audioUrl: string, transformPrompt: string): Promise<string> {
  try {
    // For now, we'll just generate new audio based on the prompt
    // In a real implementation, you would upload the audio to Riffusion and transform it
    const result = await generateRiffusionAudio({
      prompt: transformPrompt,
      num_inference_steps: 50,
    })

    return result.audio_url
  } catch (error) {
    console.error("Error transforming audio:", error)
    throw error
  }
}

/**
 * Generate a remix based on a description
 */
export async function generateRemix(options: RemixOptions): Promise<RiffusionResponse> {
  try {
    const { description, genre = "edm", bpm = 128, quality = "high", seed } = options

    // Create an enhanced prompt based on the genre and description
    let enhancedPrompt = ""

    // Craft genre-specific prompts for better results
    switch (genre.toLowerCase()) {
      case "house":
        enhancedPrompt = `House music remix with ${bpm} BPM, four-on-the-floor beat, ${description}, deep bass, clear hi-hats, professional club sound`
        break
      case "techno":
        enhancedPrompt = `Techno remix with ${bpm} BPM, driving rhythm, ${description}, analog synths, industrial elements, warehouse sound`
        break
      case "trance":
        enhancedPrompt = `Trance remix with ${bpm} BPM, uplifting melody, ${description}, euphoric build-up, atmospheric pads, festival energy`
        break
      case "dubstep":
        enhancedPrompt = `Dubstep remix with ${bpm} BPM, heavy wobble bass, ${description}, intense drop, gritty texture, powerful sub-bass`
        break
      case "drum-and-bass":
        enhancedPrompt = `Drum and Bass remix with ${bpm} BPM, fast breakbeats, ${description}, rolling bassline, energetic rhythm, crisp percussion`
        break
      default: // EDM or other genres
        enhancedPrompt = `EDM remix with ${bpm} BPM, ${description}, punchy kick, clear mix, professional production, dance floor ready`
    }

    // Quality settings based on the selected quality level
    const qualitySettings = {
      standard: {
        num_inference_steps: 40,
        guidance: 7.0,
        denoising: 0.75,
      },
      high: {
        num_inference_steps: 60,
        guidance: 7.5,
        denoising: 0.78,
      },
      ultra: {
        num_inference_steps: 80,
        guidance: 8.0,
        denoising: 0.82,
      },
    }

    const settings = qualitySettings[quality]

    // Generate the remix with optimized settings
    const result = await generateRiffusionAudio({
      prompt: enhancedPrompt,
      negative_prompt: "low quality, noise, distortion, muffled, garbled, amateur, poor mixing, clipping audio",
      num_inference_steps: settings.num_inference_steps,
      guidance: settings.guidance,
      denoising: settings.denoising,
      seed: seed,
    })

    return result
  } catch (error) {
    console.error("Error generating remix:", error)
    throw error
  }
}

/**
 * Generate combined speech and music
 */
export async function generateSpeechWithMusic(
  text: string,
  voice_type: string,
  emotion: string,
  musicGenre?: string,
): Promise<{ speechUrl: string; musicUrl: string }> {
  try {
    // Generate speech and music in parallel
    const [speechUrl, musicUrl] = await Promise.all([
      generateTextToSpeech({
        text,
        voice_type,
        emotion,
        quality: "high",
      }),
      generateBackgroundMusic(emotion, musicGenre),
    ])

    return {
      speechUrl,
      musicUrl,
    }
  } catch (error) {
    console.error("Error generating speech with music:", error)
    throw error
  }
}
