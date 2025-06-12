/**
 * Audio format detection and support utilities
 */

/**
 * Detects the audio format from a URL or file path
 * @param url The URL or file path to check
 * @returns The detected format as a string (mp3, wav, etc.) or null if not detected
 */
export function detectAudioFormat(url: string): string | null {
  if (!url) return null

  // Handle URLs with query parameters
  const baseUrl = url.split("?")[0]

  // Get extension from the URL
  const extension = baseUrl.split(".").pop()?.toLowerCase()

  if (!extension) return null

  // Handle common audio formats
  if (["mp3", "wav", "ogg", "aac", "flac", "m4a", "webm"].includes(extension)) {
    return extension
  }

  return null
}

/**
 * Check if a given audio format is supported in the current browser
 * @param format The audio format to check (mp3, wav, etc.)
 * @returns Boolean indicating if the format is supported
 */
export function isFormatSupported(format: string): boolean {
  if (typeof window === "undefined") return true // SSR safety
  if (!format) return false

  try {
    // Create a test audio element
    const audio = document.createElement("audio")

    // Check format support based on canPlayType
    switch (format.toLowerCase()) {
      case "mp3":
        return audio.canPlayType("audio/mpeg").replace("no", "") !== ""
      case "wav":
        return audio.canPlayType("audio/wav").replace("no", "") !== ""
      case "ogg":
        return audio.canPlayType("audio/ogg").replace("no", "") !== ""
      case "aac":
        return audio.canPlayType("audio/aac").replace("no", "") !== ""
      case "m4a":
        return (
          audio.canPlayType("audio/m4a").replace("no", "") !== "" ||
          audio.canPlayType("audio/x-m4a").replace("no", "") !== ""
        )
      case "webm":
        return audio.canPlayType("audio/webm").replace("no", "") !== ""
      default:
        return false
    }
  } catch (e) {
    console.error("Error checking format support:", e)
    return true // Assume supported if we can't check
  }
}

/**
 * Gets the MIME type for a given audio format
 * @param format The audio format (mp3, wav, etc.)
 * @returns The corresponding MIME type or null if not recognized
 */
export function getMimeType(format: string | null): string | null {
  if (!format) return null

  switch (format.toLowerCase()) {
    case "mp3":
      return "audio/mpeg"
    case "wav":
      return "audio/wav"
    case "ogg":
      return "audio/ogg"
    case "aac":
      return "audio/aac"
    case "flac":
      return "audio/flac"
    case "m4a":
      return "audio/m4a"
    case "webm":
      return "audio/webm"
    default:
      return null
  }
}

/**
 * Create an audio element and test if it can actually play
 * @param url The audio URL to test
 * @returns Promise resolving to boolean indicating if audio can play
 */
export function canAudioPlay(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(true) // SSR safety
      return
    }

    const audio = new Audio()

    // Set up event listeners
    const onCanPlay = () => {
      cleanup()
      resolve(true)
    }

    const onError = () => {
      cleanup()
      resolve(false)
    }

    // Set timeout to avoid hanging
    const timeout = setTimeout(() => {
      cleanup()
      resolve(false)
    }, 5000)

    // Clean up function
    const cleanup = () => {
      audio.removeEventListener("canplaythrough", onCanPlay)
      audio.removeEventListener("error", onError)
      clearTimeout(timeout)
      audio.src = ""
      audio.load()
    }

    // Set up listeners
    audio.addEventListener("canplaythrough", onCanPlay)
    audio.addEventListener("error", onError)

    // Start loading
    audio.crossOrigin = "anonymous"
    audio.src = url
    audio.load()
  })
}

/**
 * Gets the fallback URL for a given genre
 * @param genre The audio genre
 * @returns The corresponding fallback URL
 */
export function getGuaranteedFallback(genre = "default"): string {
  // Guaranteed working fallback samples by genre
  const FALLBACK_SAMPLES: Record<string, string> = {
    edm: "/samples/edm-remix-sample.mp3",
    house: "/samples/music-cheerful.mp3",
    techno: "/samples/music-professional.mp3",
    trance: "/samples/music-calm.mp3",
    dubstep: "/samples/music-excited.mp3",
    "drum-and-bass": "/samples/music-neutral.mp3",
    default: "/samples/edm-remix-sample.mp3",
  }
  // Convert genre to lowercase for case-insensitive matching
  const normalizedGenre = genre.toLowerCase()

  // Return the fallback URL for the specified genre, or the default if not found
  return FALLBACK_SAMPLES[normalizedGenre] || FALLBACK_SAMPLES.default
}

/**
 * Force a specific audio format for generated content
 * @param audioUrl The original URL
 * @param format The desired format
 * @returns Modified URL with forced format
 */
export function forceAudioFormat(audioUrl: string, format: string): string {
  // Check if the audioUrl already has the correct format
  if (audioUrl.endsWith(`.${format}`)) {
    return audioUrl
  }

  // If not, try to replace the extension
  const lastDotIndex = audioUrl.lastIndexOf(".")
  if (lastDotIndex !== -1) {
    return audioUrl.substring(0, lastDotIndex) + `.${format}`
  }

  // If there's no extension, just append the format
  return `${audioUrl}.${format}`
}

/**
 * Check if an audio URL is accessible
 * @param url The URL to check
 * @returns Promise resolving to boolean indicating if URL is accessible
 */
export async function isAudioUrlAccessible(url: string): Promise<boolean> {
  try {
    // Try a HEAD request first (faster)
    try {
      const response = await fetch(url, { method: "HEAD", mode: "cors" })
      if (response.ok) return true
    } catch (e) {
      console.log("HEAD request failed, trying GET:", e)
    }

    // If HEAD fails, try a small range GET request
    const response = await fetch(url, {
      headers: { Range: "bytes=0-1024" },
      mode: "cors",
    })

    return response.ok
  } catch (error) {
    console.error("Error checking audio URL accessibility:", error)
    return false
  }
}

/**
 * Emergency audio loader that tries multiple formats
 * @param baseUrl The base URL without format
 * @returns Promise resolving to a working audio URL
 */
export async function emergencyAudioLoader(baseUrl: string): Promise<string> {
  // Supported audio formats in order of preference
  const SUPPORTED_FORMATS = ["mp3", "wav", "aac", "m4a", "ogg"]

  // If it's already a local sample, return it directly
  if (baseUrl.startsWith("/samples/")) {
    return baseUrl
  }

  // Try each format in sequence
  for (const format of SUPPORTED_FORMATS) {
    try {
      const formattedUrl = forceAudioFormat(baseUrl, format)
      const isAccessible = await isAudioUrlAccessible(formattedUrl)

      if (isAccessible) {
        return formattedUrl
      }
    } catch (error) {
      console.warn(`Failed to load ${format} format:`, error)
      // Continue to next format
    }
  }

  // If all formats fail, return the default fallback
  return getGuaranteedFallback("default")
}

/**
 * Create an audio type definition for TypeScript
 */
export type AudioFormat = "mp3" | "wav" | "ogg" | "aac" | "flac" | "m4a" | "webm" | null
