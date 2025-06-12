"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Download, RefreshCw, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { detectAudioFormat, isFormatSupported, getGuaranteedFallback } from "@/lib/audio-format-handler"

interface AudioPlayerProps {
  audioUrl: string
  fallbackUrl?: string
  title?: string
  subtitle?: string
  showWaveform?: boolean
  showDownload?: boolean
  onPlaybackComplete?: () => void
  onError?: (error: Error) => void
  genre?: string
}

export function AudioPlayer({
  audioUrl,
  fallbackUrl,
  title = "Audio Track",
  subtitle,
  showWaveform = false,
  showDownload = false,
  onPlaybackComplete,
  onError,
  genre = "edm",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioSource, setAudioSource] = useState<string>(audioUrl)
  const [usedFallback, setUsedFallback] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Initialize audio element with error handling
  const initAudio = useCallback(
    (url: string) => {
      setIsLoading(true)
      setLoadingProgress(0)
      setError(null)

      // Clean up previous audio element
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.removeEventListener("canplay", () => {})
        audioRef.current.removeEventListener("timeupdate", () => {})
        audioRef.current.removeEventListener("ended", () => {})
        audioRef.current.removeEventListener("error", () => {})
        audioRef.current.removeEventListener("progress", () => {})
        audioRef.current.load()
      }

      // Clear any existing timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }

      // Set a timeout to detect if loading takes too long
      loadTimeoutRef.current = setTimeout(() => {
        console.warn("Audio loading timeout - trying fallback")
        handleFallback("Loading timeout")
      }, 10000) // 10 second timeout

      // Create new audio element
      const audio = new Audio(url)
      audio.crossOrigin = "anonymous"
      audioRef.current = audio

      // Set up event listeners
      audio.addEventListener("canplay", () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current)
          loadTimeoutRef.current = null
        }
        setIsLoading(false)
        setLoadingProgress(100)
        setDuration(audio.duration)
      })

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime)
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setCurrentTime(0)
        if (onPlaybackComplete) {
          onPlaybackComplete()
        }
      })

      audio.addEventListener("progress", () => {
        if (audio.duration > 0 && audio.buffered.length > 0) {
          const loadedPercentage = Math.round((audio.buffered.end(audio.buffered.length - 1) / audio.duration) * 100)
          setLoadingProgress(loadedPercentage)
        }
      })

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e, audio.error)

        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current)
          loadTimeoutRef.current = null
        }

        setIsLoading(false)

        // Handle the error by trying fallback
        handleFallback(`Audio error: ${audio.error?.message || "Unknown error"}`)
      })

      // Load the audio
      audio.load()
    },
    [onPlaybackComplete],
  )

  // Handle fallback mechanism
  const handleFallback = useCallback(
    (errorMessage: string) => {
      // If we have a fallback URL and haven't used it yet
      if (fallbackUrl && !usedFallback) {
        console.log("Trying fallback URL:", fallbackUrl)
        setAudioSource(fallbackUrl)
        setUsedFallback(true)

        toast({
          title: "Audio format issue detected",
          description: "Switching to a compatible audio format.",
          variant: "default",
        })

        initAudio(fallbackUrl)
      } else {
        // If we've already tried the fallback or don't have one, use guaranteed fallback
        const guaranteedFallback = getGuaranteedFallback(genre)
        console.log("Using guaranteed fallback:", guaranteedFallback)

        setError(errorMessage)
        setAudioSource(guaranteedFallback)
        setUsedFallback(true)

        if (onError) {
          onError(new Error(errorMessage))
        }

        toast({
          title: "Audio playback error",
          description: "Using fallback audio. You can try again or use the retry button.",
          variant: "destructive",
        })

        // Load the guaranteed fallback
        initAudio(guaranteedFallback)
      }
    },
    [fallbackUrl, usedFallback, genre, initAudio, onError, toast],
  )

  // Initialize audio when URL changes or on retry
  useEffect(() => {
    // Check if the audio format is supported
    const format = detectAudioFormat(audioUrl)

    if (!format || (format && !isFormatSupported(format))) {
      console.log(`Format ${format || "unknown"} may not be supported in this browser. Trying anyway.`)
    }

    setAudioSource(audioUrl)
    initAudio(audioUrl)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [audioUrl, retryCount, initAudio])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  // Draw waveform visualization
  useEffect(() => {
    if (!showWaveform || !canvasRef.current || !isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const drawWaveform = () => {
      animationRef.current = requestAnimationFrame(drawWaveform)

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "rgb(20, 20, 30)"
      ctx.fillRect(0, 0, width, height)

      // Generate a simple waveform-like visualization
      const barCount = 60
      const barWidth = width / barCount - 1

      for (let i = 0; i < barCount; i++) {
        // Create a pseudo-random height based on position and time
        const seed = (i * 7 + currentTime * 10) % 100
        const randomHeight = Math.sin(seed) * 0.5 + 0.5
        const barHeight = randomHeight * height * 0.8

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
        gradient.addColorStop(0, "rgb(0, 215, 255)")
        gradient.addColorStop(1, "rgb(0, 90, 255)")

        ctx.fillStyle = gradient
        ctx.fillRect(i * (barWidth + 1), height - barHeight, barWidth, barHeight)
      }
    }

    drawWaveform()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [showWaveform, isPlaying, currentTime])

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    } else {
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((err) => {
            console.error("Play error:", err)

            // Handle autoplay policy restrictions
            if (err.name === "NotAllowedError") {
              toast({
                title: "Playback blocked",
                description: "Please interact with the page first to enable audio playback.",
                variant: "default",
              })
            } else {
              // Try fallback for other errors
              handleFallback(`Playback error: ${err.message}`)
            }
          })
      }
    }
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Handle seek
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    const newTime = (value[0] / 100) * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Format time (MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Handle retry
  const handleRetry = () => {
    setError(null)
    setUsedFallback(false)
    setRetryCount((prev) => prev + 1)
  }

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(audioSource)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.mp3`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      toast({
        title: "Download started",
        description: "Your audio file is downloading.",
      })
    } catch (err) {
      console.error("Download error:", err)
      toast({
        title: "Download failed",
        description: "There was an error downloading the audio file.",
        variant: "destructive",
      })
    }
  }

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold">{title}</h3>
              <div className="flex items-center gap-2">
                {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                {usedFallback && <span className="text-xs text-amber-400">(Using fallback audio)</span>}
              </div>
            </div>

            {showDownload && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-cyan-400 hover:bg-gray-800"
                onClick={handleDownload}
                disabled={isLoading || !!error}
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Loading audio...</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-700 rounded-md p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-200">Audio playback error</p>
              </div>
              <Button variant="outline" size="sm" className="border-red-700 text-red-200" onClick={handleRetry}>
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            </div>
          ) : (
            <>
              {showWaveform && (
                <div className="w-full h-20 bg-gray-950 rounded-md overflow-hidden">
                  <canvas ref={canvasRef} width={600} height={80} className="w-full h-full" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
                  <Slider
                    value={[progress]}
                    min={0}
                    max={100}
                    step={0.1}
                    onValueChange={(value) => handleSeek([value[0]])}
                    className="flex-grow"
                  />
                  <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-cyan-400 hover:bg-gray-800"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-cyan-400 hover:bg-gray-800"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>

                    {usedFallback && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={handleRetry}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Try Original
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-24">
                    <Slider value={volume} min={0} max={100} step={1} onValueChange={setVolume} className="flex-grow" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
