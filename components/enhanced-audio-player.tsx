"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Download, RefreshCw, Music, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { detectFormat, isFormatSupported } from "@/lib/audio-engine"
import { getGuaranteedFallback } from "@/lib/audio-format-handler"

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

export function EnhancedAudioPlayer({
  audioUrl,
  fallbackUrl,
  title = "Audio Track",
  subtitle = "Audio Player",
  imageUrl,
  onPlaybackComplete,
  onError,
  showWaveform = true,
  autoplay = false,
  visualizer = "bars",
  genre = "edm",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [usedFallback, setUsedFallback] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [audioSource, setAudioSource] = useState<string>(audioUrl)
  const [formatInfo, setFormatInfo] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [emergencyMode, setEmergencyMode] = useState(false)

  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const analyserNodeRef = useRef<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio context and nodes
  const initAudioContext = useCallback(() => {
    try {
      if (typeof window === "undefined") return

      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContext()
      }

      if (!gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.gain.value = volume[0] / 100
      }

      if (!analyserNodeRef.current && audioContextRef.current) {
        analyserNodeRef.current = audioContextRef.current.createAnalyser()
        analyserNodeRef.current.fftSize = 256

        if (gainNodeRef.current) {
          gainNodeRef.current.connect(analyserNodeRef.current)
          analyserNodeRef.current.connect(audioContextRef.current.destination)
        }
      }
    } catch (error) {
      console.error("Error initializing audio context:", error)
      setError(`Could not initialize audio context: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [volume])

  const connectAudioSource = useCallback(() => {
    if (!audioElementRef.current || !audioContextRef.current) return

    try {
      // Disconnect previous source if it exists
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }

      // Create new source node
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current)

      // Connect nodes
      if (gainNodeRef.current) {
        sourceNodeRef.current.connect(gainNodeRef.current)
      }
    } catch (error) {
      console.error("Error connecting audio source:", error)

      // If we get an "already connected" error, we can ignore it
      if (error instanceof DOMException && error.name === "InvalidAccessError") {
        console.log("Audio element already connected to a different AudioNode, ignoring...")
      } else {
        setError(`Error connecting audio: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }, [])

  const loadAudio = useCallback(
    (url: string) => {
      setIsLoading(true)
      setLoadingProgress(0)
      setError(null)

      if (!usedFallback) {
        console.log("Loading audio from:", url)
      }

      // Clean up previous audio element
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.removeAttribute("src")
        audioElementRef.current.load()
      }

      // Clear any existing timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }

      // Set a timeout to detect if loading takes too long
      loadTimeoutRef.current = setTimeout(() => {
        console.warn("Audio loading timeout - switching to emergency mode")

        // If we're already in emergency mode or using fallback, use the guaranteed fallback
        if (emergencyMode || usedFallback) {
          const guaranteedFallback = getGuaranteedFallback(genre)
          console.log("Using guaranteed fallback:", guaranteedFallback)
          setAudioSource(guaranteedFallback)
          setUsedFallback(true)
          loadAudio(guaranteedFallback)
        } else {
          // Try fallback if available
          if (fallbackUrl) {
            console.log("Loading timeout - trying fallback URL:", fallbackUrl)
            setUsedFallback(true)
            setAudioSource(fallbackUrl)
            setEmergencyMode(true)
            loadAudio(fallbackUrl)
          } else {
            // Use guaranteed fallback as last resort
            const guaranteedFallback = getGuaranteedFallback(genre)
            console.log("Using guaranteed fallback:", guaranteedFallback)
            setAudioSource(guaranteedFallback)
            setUsedFallback(true)
            setEmergencyMode(true)
            loadAudio(guaranteedFallback)
          }
        }
      }, 10000) // 10 second timeout

      // Create a new audio element
      const audio = new Audio()
      audio.crossOrigin = "anonymous"

      // Set up event listeners
      audio.addEventListener("canplaythrough", () => {
        // Clear the timeout since loading succeeded
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current)
          loadTimeoutRef.current = null
        }

        setIsLoading(false)
        setLoadingProgress(100)
        audioElementRef.current = audio

        // Connect to audio context
        try {
          // Resume audio context if suspended
          if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume().catch(console.error)
          }

          connectAudioSource()

          // Autoplay if enabled
          if (autoplay) {
            // Play directly instead of using handlePlayPause to avoid circular reference
            if (audioContextRef.current?.state === "suspended") {
              audioContextRef.current.resume().catch(console.error)
            }

            audio
              .play()
              .then(() => setIsPlaying(true))
              .catch(console.error)
          }
        } catch (error) {
          console.error("Error connecting audio:", error)
        }
      })

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })

      audio.addEventListener("timeupdate", () => {
        if (audio.duration > 0) {
          setCurrentTime(audio.currentTime)
          setProgress((audio.currentTime / audio.duration) * 100)
        }
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setProgress(100)
        setCurrentTime(audio.duration)
        if (onPlaybackComplete) onPlaybackComplete()
      })

      audio.addEventListener("progress", () => {
        if (audio.duration > 0 && audio.buffered.length > 0) {
          const loadedPercentage = Math.round((audio.buffered.end(audio.buffered.length - 1) / audio.duration) * 100)
          setLoadingProgress(loadedPercentage)
        }
      })

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e, audio.error)

        // Clear the timeout since we got an error
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current)
          loadTimeoutRef.current = null
        }

        const format = detectFormat(url)
        const errorMessage = audio.error?.message || "Unknown error"

        // Check for demuxer errors specifically
        const isDemuxerError =
          e.toString().includes("DEMUXER_ERROR") ||
          errorMessage.includes("DEMUXER_ERROR") ||
          errorMessage.includes("could not open")

        // If we have a demuxer error, go straight to guaranteed fallback
        if (isDemuxerError) {
          console.warn("Demuxer error detected - switching to guaranteed fallback immediately")
          const guaranteedFallback = getGuaranteedFallback(genre)
          console.log("Using guaranteed fallback:", guaranteedFallback)
          setAudioSource(guaranteedFallback)
          setUsedFallback(true)
          setEmergencyMode(true)
          loadAudio(guaranteedFallback)
          return
        }

        // If we're already in emergency mode, go straight to guaranteed fallback
        if (emergencyMode) {
          const guaranteedFallback = getGuaranteedFallback(genre)
          console.log("Emergency mode - using guaranteed fallback:", guaranteedFallback)
          setAudioSource(guaranteedFallback)
          setUsedFallback(true)
          loadAudio(guaranteedFallback)
          return
        }

        // Try fallback if we haven't already and a fallback URL is provided
        if (!usedFallback && fallbackUrl) {
          console.log(`Error loading ${format || "audio"} format, trying fallback URL:`, fallbackUrl)
          setUsedFallback(true)
          setAudioSource(fallbackUrl)

          toast({
            title: `Audio format issue detected`,
            description: "Switching to a compatible audio format.",
            variant: "default",
          })

          loadAudio(fallbackUrl)
        } else {
          setIsLoading(false)
          setError(`Audio error: ${errorMessage}`)

          // If we're already using fallback and still getting errors, try the guaranteed fallback
          if (usedFallback) {
            const guaranteedFallback = getGuaranteedFallback(genre)
            console.log("Fallback also failed, using guaranteed fallback:", guaranteedFallback)
            setAudioSource(guaranteedFallback)
            setEmergencyMode(true)
            loadAudio(guaranteedFallback)
          }
        }
      })

      // Start loading the audio
      audio.preload = "auto"
      audio.src = url
      audio.load()
    },
    [autoplay, connectAudioSource, fallbackUrl, onPlaybackComplete, usedFallback, emergencyMode, genre],
  )

  // Now define handlePlayPause after loadAudio is defined
  const handlePlayPause = useCallback(() => {
    if (!audioElementRef.current) return

    if (isPlaying) {
      audioElementRef.current.pause()
      setIsPlaying(false)

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    } else {
      // Resume audio context if suspended
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume().catch(console.error)
      }

      // Reset audio to beginning if it's ended
      if (audioElementRef.current.ended) {
        audioElementRef.current.currentTime = 0
      }

      // Play audio
      const playPromise = audioElementRef.current.play()

      // Handle play promise
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("Error playing audio:", error)

            // Handle autoplay policy restrictions
            if (error.name === "NotAllowedError") {
              toast({
                title: "Playback blocked",
                description: "Please interact with the page first to enable audio playback.",
                variant: "default",
              })
            } else {
              // Try fallback for other errors
              if (!usedFallback && fallbackUrl) {
                setUsedFallback(true)
                setAudioSource(fallbackUrl)
                loadAudio(fallbackUrl)

                // Try playing again after loading fallback
                setTimeout(() => {
                  if (audioElementRef.current) {
                    audioElementRef.current
                      .play()
                      .then(() => setIsPlaying(true))
                      .catch(console.error)
                  }
                }, 1000)
              } else if (usedFallback) {
                // If already using fallback, try guaranteed fallback
                const guaranteedFallback = getGuaranteedFallback(genre)
                setAudioSource(guaranteedFallback)
                setEmergencyMode(true)
                loadAudio(guaranteedFallback)

                // Try playing again after loading guaranteed fallback
                setTimeout(() => {
                  if (audioElementRef.current) {
                    audioElementRef.current
                      .play()
                      .then(() => setIsPlaying(true))
                      .catch(console.error)
                  }
                }, 1000)
              }
            }
          })
      }
    }
  }, [isPlaying, fallbackUrl, usedFallback, genre, emergencyMode])

  // Initialize audio element
  useEffect(() => {
    initAudioContext()

    // Create audio element
    const audioElement = new Audio()
    audioElement.crossOrigin = "anonymous"
    audioElementRef.current = audioElement

    return () => {
      // Clean up resources
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.src = ""
      }

      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [initAudioContext])

  // Load audio when URL changes or on retry
  useEffect(() => {
    if (!audioUrl && !fallbackUrl) return

    // If we have no audio URL but have a fallback, use the fallback immediately
    if (!audioUrl && fallbackUrl) {
      setAudioSource(fallbackUrl)
      setUsedFallback(true)
      loadAudio(fallbackUrl)
      return
    }

    // If we have an audio URL, try to load it
    if (audioUrl) {
      const format = detectFormat(audioUrl)

      // If format detection fails or format is not supported, use fallback
      if (!format || (format && !isFormatSupported(format))) {
        console.log(`Format ${format || "unknown"} is not supported in this browser. Using fallback.`)
        setFormatInfo(`${format ? format.toUpperCase() : "Unknown format"} not supported in this browser`)

        if (fallbackUrl) {
          const fallbackFormat = detectFormat(fallbackUrl)
          if (fallbackFormat && isFormatSupported(fallbackFormat)) {
            setAudioSource(fallbackUrl)
            setUsedFallback(true)
            loadAudio(fallbackUrl)
            return
          }
        }

        // If fallback also not supported, use guaranteed MP3 fallback
        const guaranteedFallback = getGuaranteedFallback(genre)
        setAudioSource(guaranteedFallback)
        setUsedFallback(true)
        loadAudio(guaranteedFallback)
      } else {
        setAudioSource(audioUrl)
        if (format) {
          setFormatInfo(`Format: ${format.toUpperCase()}`)
        } else {
          setFormatInfo("")
        }
        loadAudio(audioUrl)
      }
    }
  }, [audioUrl, retryCount, fallbackUrl, genre])

  // Update volume when slider changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume[0] / 100
    }

    if (audioElementRef.current) {
      audioElementRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  // Draw visualization
  useEffect(() => {
    if (!showWaveform || !canvasRef.current || !analyserNodeRef.current || !isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const bufferLength = analyserNodeRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyserNodeRef.current || !ctx || !isPlaying) return

      animationRef.current = requestAnimationFrame(draw)
      analyserNodeRef.current.getByteFrequencyData(dataArray)

      ctx.fillStyle = "rgb(20, 20, 30)"
      ctx.fillRect(0, 0, width, height)

      if (visualizer === "bars") {
        // Bar visualization
        const barWidth = (width / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height

          // Create gradient for bars
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
          gradient.addColorStop(0, "rgb(0, 215, 255)")
          gradient.addColorStop(1, "rgb(0, 90, 255)")

          ctx.fillStyle = gradient
          ctx.fillRect(x, height - barHeight, barWidth, barHeight)

          x += barWidth + 1
        }
      } else if (visualizer === "waveform") {
        // Waveform visualization
        analyserNodeRef.current.getByteTimeDomainData(dataArray)

        ctx.lineWidth = 2
        ctx.strokeStyle = "rgb(0, 215, 255)"
        ctx.beginPath()

        const sliceWidth = width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * height) / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        }

        ctx.lineTo(width, height / 2)
        ctx.stroke()
      } else if (visualizer === "circle") {
        // Circle visualization
        ctx.clearRect(0, 0, width, height)

        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 4

        for (let i = 0; i < bufferLength; i++) {
          const amplitude = dataArray[i] / 255
          const angle = (i / bufferLength) * Math.PI * 2
          const adjustedRadius = radius + amplitude * radius

          const x = centerX + Math.cos(angle) * adjustedRadius
          const y = centerY + Math.sin(angle) * adjustedRadius

          if (i === 0) {
            ctx.beginPath()
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          // Add inner circle
          if (i === bufferLength - 1) {
            ctx.closePath()
            const gradient = ctx.createRadialGradient(centerX, centerY, radius / 2, centerX, centerY, adjustedRadius)
            gradient.addColorStop(0, "rgba(0, 215, 255, 0.2)")
            gradient.addColorStop(1, "rgba(0, 90, 255, 0.8)")
            ctx.fillStyle = gradient
            ctx.fill()

            ctx.strokeStyle = "rgb(0, 215, 255)"
            ctx.lineWidth = 2
            ctx.stroke()
          }
        }
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, showWaveform, visualizer])

  const handleProgressChange = useCallback((value: number[]) => {
    if (!audioElementRef.current) return

    const newTime = (value[0] / 100) * (audioElementRef.current.duration || 0)
    audioElementRef.current.currentTime = newTime
    setProgress(value[0])
    setCurrentTime(newTime)
  }, [])

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }, [])

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    setUsedFallback(false)
    setError(null)
    setEmergencyMode(false)

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    // If original URL is available, try it again
    if (audioUrl) {
      setAudioSource(audioUrl)
      loadAudio(audioUrl)

      // Set a timeout to fall back to guaranteed fallback if retry fails
      retryTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          console.log("Retry timeout - using guaranteed fallback")
          const guaranteedFallback = getGuaranteedFallback(genre)
          setAudioSource(guaranteedFallback)
          setUsedFallback(true)
          setEmergencyMode(true)
          loadAudio(guaranteedFallback)
        }
      }, 5000) // 5 second timeout for retry
    } else if (fallbackUrl) {
      // If no original URL but fallback is available, try fallback
      setAudioSource(fallbackUrl)
      setUsedFallback(true)
      loadAudio(fallbackUrl)
    } else {
      // Last resort - use guaranteed fallback
      const guaranteedFallback = getGuaranteedFallback(genre)
      setAudioSource(guaranteedFallback)
      setUsedFallback(true)
      setEmergencyMode(true)
      loadAudio(guaranteedFallback)
    }
  }, [audioUrl, fallbackUrl, loadAudio, genre, isLoading])

  const handleEmergencyFallback = useCallback(() => {
    // Force use of guaranteed fallback
    const guaranteedFallback = getGuaranteedFallback(genre)
    console.log("Emergency fallback activated:", guaranteedFallback)
    setAudioSource(guaranteedFallback)
    setUsedFallback(true)
    setEmergencyMode(true)
    loadAudio(guaranteedFallback)

    toast({
      title: "Emergency fallback activated",
      description: "Using guaranteed working audio sample.",
      variant: "default",
    })
  }, [genre, loadAudio])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleDownload = useCallback(async () => {
    try {
      // Always download from the current audio source
      const response = await fetch(audioSource)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const format = detectFormat(audioSource)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.${format || "mp3"}`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      toast({
        title: "Download Started",
        description: "Your audio is downloading...",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Available",
        description: "Right-click on the player and select 'Save Audio As...'",
        variant: "default",
      })
    }
  }, [audioSource, title])

  // Fallback image handling
  const [imgError, setImgError] = useState(false)
  const handleImageError = useCallback(() => setImgError(true), [])

  return (
    <Card className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none shadow-xl">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={
                  imgError
                    ? "/placeholder.svg?height=80&width=80&query=music visualization"
                    : imageUrl || "/placeholder.svg?height=80&width=80&query=edm music"
                }
                alt={title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>

            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                <div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-gray-300 text-sm">
                    {subtitle} {usedFallback && "(Using compatible format)"}
                    {emergencyMode && " - Emergency Mode"}
                  </p>
                  <p className="text-xs text-gray-400">{formatInfo}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-cyan-400 hover:bg-gray-800"
                    onClick={handleDownload}
                    disabled={isLoading}
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Loading audio...</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <Progress value={loadingProgress} className="h-2" />

                  {/* Emergency fallback button if loading takes too long */}
                  {loadingProgress === 0 && (
                    <Button variant="destructive" size="sm" className="mt-2 w-full" onClick={handleEmergencyFallback}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Force Emergency Fallback
                    </Button>
                  )}
                </div>
              ) : error ? (
                <div className="bg-red-900/30 border border-red-700 rounded-md p-3 flex items-center gap-2">
                  <Music className="h-5 w-5 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm text-red-200">Audio playback error. Using fallback.</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-red-700 text-red-200"
                        onClick={handleRetry}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                      </Button>

                      <Button variant="destructive" size="sm" className="text-xs" onClick={handleEmergencyFallback}>
                        <AlertTriangle className="h-3 w-3 mr-1" /> Emergency Fallback
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
                    <Slider
                      value={[progress]}
                      min={0}
                      max={100}
                      step={0.1}
                      onValueChange={(value) => handleProgressChange(value)}
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
                        onClick={handlePlayPause}
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

                      {(usedFallback || emergencyMode) && (
                        <Button variant="outline" size="sm" className="text-xs" onClick={handleRetry}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Try Original
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-24">
                      <Slider
                        value={volume}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={setVolume}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showWaveform && !isLoading && !error && (
            <div className="w-full h-24 bg-gray-950 rounded-md overflow-hidden">
              <canvas ref={canvasRef} width={800} height={100} className="w-full h-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
