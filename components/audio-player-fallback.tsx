"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface AudioPlayerFallbackProps {
  trackName: string
  artistName: string
  isPlaying: boolean
  onPlayPause: () => void
  className?: string
}

export function AudioPlayerFallback({
  trackName,
  artistName,
  isPlaying,
  onPlayPause,
  className = "",
}: AudioPlayerFallbackProps) {
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeControl, setShowVolumeControl] = useState(false)

  // Simulate audio visualization
  const [visualizerBars, setVisualizerBars] = useState<number[]>([])

  useEffect(() => {
    if (isPlaying) {
      // Generate random visualization bars when playing
      const interval = setInterval(() => {
        const newBars = Array.from({ length: 5 }, () => Math.floor(Math.random() * 5) + 1)
        setVisualizerBars(newBars)
      }, 200)
      return () => clearInterval(interval)
    } else {
      setVisualizerBars([])
    }
  }, [isPlaying])

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 rounded-full bg-cyan-600 text-white hover:bg-cyan-700"
        onClick={onPlayPause}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </Button>

      <div className="flex flex-col">
        <span className="font-medium">{trackName}</span>
        <span className="text-sm text-zinc-400">{artistName}</span>
      </div>

      {isPlaying && (
        <div className="flex items-end gap-0.5 h-5">
          {visualizerBars.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-cyan-400 rounded-t"
              style={{
                height: `${height * 4}px`,
                animationDelay: `${index * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      <div
        className="relative ml-auto"
        onMouseEnter={() => setShowVolumeControl(true)}
        onMouseLeave={() => setShowVolumeControl(false)}
      >
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        {showVolumeControl && (
          <div className="absolute -left-12 bottom-full mb-2 bg-zinc-800 p-3 rounded-md shadow-lg z-10">
            <Slider
              className="w-24"
              value={[isMuted ? 0 : volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => {
                setVolume(value[0] / 100)
                if (isMuted && value[0] > 0) {
                  setIsMuted(false)
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
