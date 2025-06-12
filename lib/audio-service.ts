// Audio service for handling audio loading, playback, and error handling
export class AudioService {
  private static audioCache: Map<string, HTMLAudioElement> = new Map()
  private static fallbackUrls: Map<string, string[]> = new Map()

  /**
   * Preload an audio file with fallbacks
   * @param id Unique identifier for the audio
   * @param primaryUrl Primary URL to try first
   * @param fallbackUrls Array of fallback URLs to try if primary fails
   * @param onLoaded Callback when audio is loaded successfully
   * @param onError Callback when all URLs fail
   * @param onProgress Callback for loading progress (0-100)
   */
  static preloadAudio(
    id: string,
    primaryUrl: string,
    fallbackUrls: string[] = [],
    onLoaded?: () => void,
    onError?: (error: Error) => void,
    onProgress?: (progress: number) => void,
  ): void {
    // Store fallback URLs for later use
    this.fallbackUrls.set(id, [primaryUrl, ...fallbackUrls])

    // Try to load the primary URL
    this.loadAudioUrl(id, primaryUrl, 0, onLoaded, onError, onProgress)
  }

  /**
   * Load an audio URL with fallback mechanism
   */
  private static loadAudioUrl(
    id: string,
    url: string,
    urlIndex: number,
    onLoaded?: () => void,
    onError?: (error: Error) => void,
    onProgress?: (progress: number) => void,
  ): void {
    const audio = new Audio()

    // Set up event listeners
    audio.addEventListener("canplaythrough", () => {
      // Store in cache
      this.audioCache.set(id, audio)

      // Call success callback
      if (onLoaded) onLoaded()
    })

    audio.addEventListener("error", (e) => {
      console.warn(`Error loading audio ${id} from URL ${url}:`, e)

      // Try next fallback URL if available
      const fallbacks = this.fallbackUrls.get(id) || []
      const nextIndex = urlIndex + 1

      if (nextIndex < fallbacks.length) {
        console.log(`Trying fallback URL ${nextIndex} for audio ${id}`)
        setTimeout(() => {
          this.loadAudioUrl(id, fallbacks[nextIndex], nextIndex, onLoaded, onError, onProgress)
        }, 1000) // Add delay before trying next URL
      } else {
        // All URLs failed
        if (onError) onError(new Error(`Failed to load audio ${id} after trying all URLs`))
      }
    })

    // Add progress event if supported
    if (onProgress) {
      audio.addEventListener("progress", () => {
        if (audio.duration) {
          const loadedTime = Array.from(audio.buffered.values()).reduce(
            (acc, range) => acc + (range.end - range.start),
            0,
          )
          const progress = Math.min(100, Math.round((loadedTime / audio.duration) * 100))
          onProgress(progress)
        }
      })
    }

    // Start loading
    audio.preload = "auto"
    audio.src = url
    audio.load()
  }

  /**
   * Play an audio file by ID
   * @param id Unique identifier for the audio
   * @returns Promise that resolves when playback starts
   */
  static playAudio(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = this.audioCache.get(id)

      if (!audio) {
        reject(new Error(`Audio ${id} not found in cache`))
        return
      }

      // Reset to beginning
      audio.currentTime = 0

      // Play with error handling
      audio
        .play()
        .then(() => resolve())
        .catch((error) => {
          console.error(`Error playing audio ${id}:`, error)

          // Try to reload with first fallback URL
          const fallbacks = this.fallbackUrls.get(id) || []
          if (fallbacks.length > 1) {
            console.log(`Trying to reload audio ${id} with fallback URL`)
            audio.src = fallbacks[1]
            audio.load()

            // Try playing again
            setTimeout(() => {
              audio
                .play()
                .then(() => resolve())
                .catch((err) => reject(err))
            }, 1000)
          } else {
            reject(error)
          }
        })
    })
  }

  /**
   * Pause an audio file by ID
   * @param id Unique identifier for the audio
   */
  static pauseAudio(id: string): void {
    const audio = this.audioCache.get(id)
    if (audio) {
      audio.pause()
    }
  }

  /**
   * Check if an audio file is loaded
   * @param id Unique identifier for the audio
   * @returns True if audio is loaded and ready to play
   */
  static isAudioLoaded(id: string): boolean {
    return this.audioCache.has(id)
  }

  /**
   * Get the current audio element for an ID
   * @param id Unique identifier for the audio
   * @returns The audio element or null if not found
   */
  static getAudio(id: string): HTMLAudioElement | null {
    return this.audioCache.get(id) || null
  }

  /**
   * Download an audio file
   * @param id Unique identifier for the audio
   * @param filename Filename to use for download
   * @returns Promise that resolves when download starts
   */
  static downloadAudio(id: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = this.audioCache.get(id)

      if (!audio) {
        reject(new Error(`Audio ${id} not found in cache`))
        return
      }

      // Use fetch to handle CORS issues
      fetch(audio.src)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.blob()
        })
        .then((blob) => {
          // Create a blob URL
          const blobUrl = URL.createObjectURL(blob)

          // Create an invisible anchor element
          const a = document.createElement("a")
          a.style.display = "none"
          a.href = blobUrl
          a.download = `${filename}.mp3`

          // Add to document, trigger click, and remove
          document.body.appendChild(a)
          a.click()

          // Clean up
          setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(blobUrl)
          }, 100)

          resolve()
        })
        .catch((error) => {
          console.error("Download error:", error)
          reject(error)
        })
    })
  }

  /**
   * Clean up all audio resources
   */
  static cleanup(): void {
    this.audioCache.forEach((audio) => {
      audio.pause()
      audio.src = ""
      audio.load()
    })

    this.audioCache.clear()
    this.fallbackUrls.clear()
  }
}
