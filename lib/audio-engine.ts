/**
 * Audio format detection and support utilities
 */

/**
 * Detects the audio format from a URL or file path
 * @param url The URL or file path to check
 * @returns The detected format as a string (mp3, wav, etc.) or null if not detected
 */
export function detectFormat(url: string): string | null {
  if (!url) return null
  const extension = url.split(".").pop()?.toLowerCase()

  if (!extension) return null

  // Handle common audio formats
  if (["mp3", "wav", "ogg", "aac", "flac", "m4a", "webm"].includes(extension)) {
    return extension
  }

  // Handle URLs with query parameters
  if (url.includes("?")) {
    const baseUrl = url.split("?")[0]
    const baseExtension = baseUrl.split(".").pop()?.toLowerCase()

    if (baseExtension && ["mp3", "wav", "ogg", "aac", "flac", "m4a", "webm"].includes(baseExtension)) {
      return baseExtension
    }
  }

  return null
}

/**
 * Checks if a given audio format is supported in the current browser
 * @param format The audio format to check (mp3, wav, etc.)
 * @returns Boolean indicating if the format is supported
 */
export function isFormatSupported(format: string): boolean {
  if (!format) return false

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
    case "flac":
      return audio.canPlayType("audio/flac").replace("no", "") !== ""
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
 * Gets the fallback URL for a given genre
 * @param genre The audio genre
 * @returns The corresponding fallback URL
 */
export function getFallbackUrl(genre: string): string {
  switch (genre.toLowerCase()) {
    case "house":
      return "/samples/music-cheerful.mp3"
    case "techno":
      return "/samples/music-professional.mp3"
    case "trance":
      return "/samples/music-calm.mp3"
    case "dubstep":
      return "/samples/music-excited.mp3"
    case "drum-and-bass":
      return "/samples/music-neutral.mp3"
    default:
      return "/samples/edm-remix-sample.mp3"
  }
}

/**
 * Creates an audio type definition for TypeScript
 */
export type AudioFormat = "mp3" | "wav" | "ogg" | "aac" | "flac" | "m4a" | "webm" | null
