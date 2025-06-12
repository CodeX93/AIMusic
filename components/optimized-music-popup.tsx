"use client"

import { useState, useEffect, useRef } from "react"
import { X, Clock, Music, Sparkles, Zap, Play, Pause, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface OptimizedMusicPopupProps {
  onClose: () => void
  autoCloseTime?: number // Time in ms before auto-closing
}

export function OptimizedMusicPopup({ onClose, autoCloseTime = 0 }: OptimizedMusicPopupProps) {
  // Set default autoCloseTime to 0 (disabled) instead of 15000
  const [timeLeft, setTimeLeft] = useState(autoCloseTime)
  const [isClosing, setIsClosing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioError, setAudioError] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Sample track URLs - primary and fallbacks
  const sampleTracks = [
    "/samples/edm-remix-sample.mp3",
    "/samples/music-cheerful.mp3",
    "/samples/music-excited.mp3",
    "/samples/music-neutral.mp3",
  ]
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  // Auto-close timer - only run if autoCloseTime > 0
  useEffect(() => {
    if (autoCloseTime <= 0) return // Don't auto-close if time is 0 or negative

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(timer)
          handleClose()
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(timer)
  }, [autoCloseTime])

  // Initialize audio with fallback mechanism
  useEffect(() => {
    let audio: HTMLAudioElement | null = null

    const loadAudio = () => {
      if (currentTrackIndex >= sampleTracks.length) {
        setIsLoading(false)
        setAudioError(true)
        toast({
          title: "Audio Error",
          description: "Audio tidak dapat diputar, coba format lain atau gunakan sample.",
          variant: "destructive",
        })
        return
      }

      // Clean up previous audio instance if it exists
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.removeEventListener("loadedmetadata", () => {})
        audioRef.current.removeEventListener("timeupdate", () => {})
        audioRef.current.removeEventListener("ended", () => {})
        audioRef.current.removeEventListener("error", () => {})
      }

      // Create new audio instance
      audio = new Audio(sampleTracks[currentTrackIndex])
      audioRef.current = audio

      // Set up event listeners
      audio.addEventListener("loadedmetadata", () => {
        setIsLoading(false)
        setDuration(audio?.duration || 0)
        setAudioError(false)
      })

      audio.addEventListener("timeupdate", () => {
        if (audio) {
          setProgress((audio.currentTime / (audio.duration || 1)) * 100)
        }
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setProgress(0)
        if (audio) audio.currentTime = 0
      })

      audio.addEventListener("error", () => {
        console.log(`Failed to load audio track ${currentTrackIndex}: ${sampleTracks[currentTrackIndex]}`)
        // Try next fallback
        setCurrentTrackIndex((prev) => prev + 1)
      })

      // Explicitly set crossOrigin to anonymous to avoid CORS issues
      audio.crossOrigin = "anonymous"

      // Load the audio
      audio.load()
    }

    loadAudio()

    // Cleanup
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ""
        audio.removeEventListener("loadedmetadata", () => {})
        audio.removeEventListener("timeupdate", () => {})
        audio.removeEventListener("ended", () => {})
        audio.removeEventListener("error", () => {})
      }
    }
  }, [currentTrackIndex])

  // Handle close with animation
  const handleClose = () => {
    // Stop audio if playing
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
    }

    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || audioError) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Reset if ended
      if (audioRef.current.currentTime >= audioRef.current.duration) {
        audioRef.current.currentTime = 0
      }

      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("Playback error:", error)
            setIsPlaying(false)
            toast({
              title: "Playback Error",
              description: "Could not play the audio. Please try again.",
              variant: "destructive",
            })
          })
      }
    }
  }

  // Try another track manually
  const tryAnotherTrack = () => {
    if (currentTrackIndex < sampleTracks.length - 1) {
      setIsLoading(true)
      setCurrentTrackIndex((prev) => prev + 1)
      setAudioError(false)
    } else {
      toast({
        title: "No More Tracks",
        description: "No more fallback tracks available.",
        variant: "destructive",
      })
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate current time based on progress
  const currentTime = duration * (progress / 100)

  // Handle try now button
  const handleTryNow = () => {
    toast({
      title: "5-Minute Optimized Music",
      description: "Redirecting you to the optimized music generator...",
      variant: "default",
    })

    // Close popup and redirect (in a real app, this would navigate to the feature)
    handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`w-full max-w-md rounded-xl border border-cyan-800/50 bg-zinc-900 p-6 shadow-lg shadow-cyan-900/20 transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20">
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">5-Minute Optimized Music</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Auto-close progress - only show if autoCloseTime > 0 */}
        {autoCloseTime > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-zinc-400">This popup will close automatically</span>
              <span className="text-xs font-medium text-cyan-400">{Math.ceil(timeLeft / 1000)}s</span>
            </div>
            <Progress
              value={(timeLeft / autoCloseTime) * 100}
              className="h-1 bg-zinc-800"
              indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
        )}

        {/* Main content */}
        <div className="mb-6 space-y-4">
          <div className="rounded-lg bg-gradient-to-br from-cyan-900/20 to-black p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Quick 5-Minute Tracks</h3>
                <p className="text-sm text-zinc-400">
                  Generate professional-quality EDM tracks in just 5 minutes with our optimized AI engine.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-cyan-900/20 to-black p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Enhanced Quality</h3>
                <p className="text-sm text-zinc-400">
                  Our optimized algorithm delivers crystal-clear sound with perfect mixing and mastering.
                </p>
              </div>
            </div>
          </div>

          {/* Real Audio Player */}
          <div className="rounded-lg border border-cyan-800/30 bg-black/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium text-white">
              <Music className="h-4 w-4 text-cyan-400" />
              Preview Sample {currentTrackIndex > 0 && `(Fallback ${currentTrackIndex})`}
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
                <span className="ml-3 text-sm text-cyan-400">Loading audio...</span>
              </div>
            ) : audioError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <div className="text-center">
                  <p className="text-sm text-red-400">Could not load audio sample</p>
                  <p className="mt-1 text-xs text-zinc-500">Please try again later</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-800/30 text-red-400 hover:bg-red-950/20"
                  onClick={tryAnotherTrack}
                >
                  Try Another Sample
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Play/Pause button and track info */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={togglePlayPause}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <div>
                    <div className="text-sm font-medium text-white">Optimized EDM Track</div>
                    <div className="text-xs text-zinc-400">5-Minute Version</div>
                  </div>
                </div>

                {/* Waveform/Progress bar */}
                <div className="space-y-1">
                  <div className="relative h-8 w-full overflow-hidden rounded bg-zinc-800/50">
                    {/* Waveform background */}
                    <div className="absolute inset-0 flex h-full w-full items-center justify-between px-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-[2px] w-[2px] bg-cyan-500/30"
                          style={{
                            height: `${Math.max(10, Math.sin(i * 0.5) * 20 + Math.random() * 10)}px`,
                          }}
                        ></div>
                      ))}
                    </div>

                    {/* Progress overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 flex h-full w-full items-center justify-between px-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-[2px] w-[2px] bg-cyan-400"
                            style={{
                              height: `${Math.max(10, Math.sin(i * 0.5) * 20 + Math.random() * 10)}px`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time indicators */}
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-600 hover:to-blue-600"
            onClick={handleTryNow}
          >
            <Zap className="mr-2 h-4 w-4" />
            Try Now
          </Button>
          <Link href="/subscription" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-cyan-800/50 text-cyan-400 hover:bg-cyan-950/30"
              onClick={handleClose}
            >
              Upgrade for Unlimited
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-cyan-900/20 px-2 py-1 text-xs text-cyan-300">5-Minute Tracks</span>
          <span className="rounded-full bg-cyan-900/20 px-2 py-1 text-xs text-cyan-300">HD Quality</span>
          <span className="rounded-full bg-cyan-900/20 px-2 py-1 text-xs text-cyan-300">Optimized Bass</span>
          <span className="rounded-full bg-cyan-900/20 px-2 py-1 text-xs text-cyan-300">Perfect Mix</span>
        </div>
      </div>
    </div>
  )
}
