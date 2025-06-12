"use client"

import { createContext, useContext, useState, useRef, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

interface AudioContextType {
  currentlyPlaying: string | null
  playAudio: (id: string, url: string) => void
  pauseAudio: () => void
  isPlaying: (id: string) => boolean
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const playAudio = (id: string, url: string) => {
    if (currentlyPlaying === id) {
      pauseAudio()
      return
    }

    // If another audio is playing, stop it first
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Create a new audio element and play
    const audio = new Audio(url)
    audio.onended = () => setCurrentlyPlaying(null)
    audio.onerror = () => {
      toast({
        title: "Error",
        description: "Audio tidak dapat diputar, coba format lain atau gunakan sample.",
        variant: "destructive",
      })
      setCurrentlyPlaying(null)
    }

    audio.play().catch((error) => {
      console.error("Error playing audio:", error)
      toast({
        title: "Error",
        description: "Audio tidak dapat diputar, coba format lain atau gunakan sample.",
        variant: "destructive",
      })
      setCurrentlyPlaying(null)
    })

    audioRef.current = audio
    setCurrentlyPlaying(id)
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setCurrentlyPlaying(null)
    }
  }

  const isPlaying = (id: string) => {
    return currentlyPlaying === id
  }

  return (
    <AudioContext.Provider value={{ currentlyPlaying, playAudio, pauseAudio, isPlaying }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
