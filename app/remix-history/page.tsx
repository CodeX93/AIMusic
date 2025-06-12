"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Share2, Trash2, Search, Play, Pause } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AudioPlayer } from "@/components/audio-player"

export default function RemixHistoryPage() {
  const [filter, setFilter] = useState("all")
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Sample audio URLs - in a real app, these would come from your database
  const audioSamples = {
    1: "/samples/sample-neutral.mp3",
    2: "/samples/sample-male.mp3",
    3: "/samples/sample-female.mp3",
    4: "/samples/sample-warm.mp3",
  }

  const remixes = [
    {
      id: 1,
      title: "Neon Dreams (EDM Remix)",
      original: "Dreams by Sarah Chen",
      date: "2024-03-14",
      duration: "02:20",
      image: "/placeholder.svg?key=3w8bn",
    },
    {
      id: 2,
      title: "Neon Dreams (EDM Remix)",
      original: "Dreams by Sarah Chen",
      date: "2024-03-14",
      duration: "02:20",
      image: "/placeholder.svg?key=9icam",
    },
    {
      id: 3,
      title: "Neon Dreams (EDM Remix)",
      original: "Dreams by Sarah Chen",
      date: "2024-03-14",
      duration: "02:20",
      image: "/placeholder.svg?key=5nfa4",
    },
    {
      id: 4,
      title: "Neon Dreams (EDM Remix)",
      original: "Dreams by Sarah Chen",
      date: "2024-03-14",
      duration: "02:20",
      image: "/placeholder.svg?key=l7yh5",
    },
  ]

  // Update the handlePlayPause function to use the actual audio from the API
  const handlePlayPause = (id: number) => {
    if (currentlyPlaying === id) {
      // If this track is already playing, pause it
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    } else {
      // If another track is playing, stop it first
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Create a new audio element and play the selected track
      const audio = new Audio(audioSamples[id as keyof typeof audioSamples])
      audio.crossOrigin = "anonymous" // Add this for CORS support
      audio.onended = () => setCurrentlyPlaying(null)
      audio.onerror = (e) => {
        console.error("Audio error:", e)
        toast({
          title: "Audio Error",
          description: "Audio tidak dapat diputar, coba format lain atau gunakan sample.",
          variant: "destructive",
        })
        setCurrentlyPlaying(null)
      }

      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
        toast({
          title: "Audio Error",
          description: "Audio tidak dapat diputar, coba format lain atau gunakan sample.",
          variant: "destructive",
        })
        setCurrentlyPlaying(null)
      })

      audioRef.current = audio
      setCurrentlyPlaying(id)
    }
  }

  const handleDownload = (id: number) => {
    const audioUrl = audioSamples[id as keyof typeof audioSamples]
    if (!audioUrl) return

    fetch(audioUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `remix-${id}.mp3`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Audio downloaded successfully!",
        })
      })
      .catch((error) => {
        console.error("Error downloading audio:", error)
        toast({
          title: "Error",
          description: "Failed to download audio. Please try again.",
          variant: "destructive",
        })
      })
  }

  const handleShare = (id: number) => {
    const title = remixes.find((remix) => remix.id === id)?.title || "Remix"
    const url = window.location.href

    if (navigator.share) {
      navigator
        .share({
          title: title,
          url: url,
        })
        .then(() => {
          toast({
            title: "Shared",
            description: "Content shared successfully!",
          })
        })
        .catch((error) => {
          console.error("Error sharing:", error)
          handleFallbackShare(url)
        })
    } else {
      handleFallbackShare(url)
    }
  }

  const handleFallbackShare = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Link copied to clipboard!",
        })
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error)
        toast({
          title: "Error",
          description: "Failed to copy link. Please try again.",
          variant: "destructive",
        })
      })
  }

  const handleDelete = (id: number) => {
    // In a real app, you would delete from your database
    toast({
      title: "Deleted",
      description: "Remix deleted successfully!",
    })
  }

  const renderRemix = (remix) => (
    <div key={remix.id} className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="flex items-center gap-4">
        <img
          src={remix.image || "/placeholder.svg"}
          alt={remix.title}
          className="w-16 h-16 rounded object-cover"
        />
        <div>
          <div className="font-bold">{remix.title}</div>
          <div className="text-xs text-zinc-400">{remix.original}</div>
          <div className="text-xs text-zinc-500">{remix.date} • {remix.duration}</div>
        </div>
      </div>
      <div className="mt-2">
        <AudioPlayer
          audioUrl={remix.audioUrl || audioSamples[remix.id as keyof typeof audioSamples]}
          title={remix.title}
          showWaveform
          showDownload
        />
      </div>
    </div>
  )

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Remix History</h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search remixes"
              className="w-[250px] bg-zinc-900 pl-9 text-sm text-zinc-400 focus:ring-cyan-500"
            />
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] border-zinc-700 bg-zinc-900">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900">
              <SelectItem value="all">All remixes</SelectItem>
              <SelectItem value="recent">Recent remixes</SelectItem>
              <SelectItem value="oldest">Oldest remixes</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        <Button
          className={`rounded-full px-4 ${filter === "all" ? "bg-cyan-500 text-black" : "bg-zinc-800 text-zinc-300"}`}
        >
          All
        </Button>
        <Button className="rounded-full bg-zinc-800 px-4 text-zinc-300 hover:bg-zinc-700">Most played</Button>
        <Button className="rounded-full bg-zinc-800 px-4 text-zinc-300 hover:bg-zinc-700">Instrumental</Button>
        <Button className="rounded-full bg-zinc-800 px-4 text-zinc-300 hover:bg-zinc-700">EDM</Button>
        <Button className="rounded-full bg-zinc-800 px-4 text-zinc-300 hover:bg-zinc-700">Trap</Button>
      </div>

      <h2 className="mb-6 text-2xl font-bold">Recent Remixes</h2>

      <div className="space-y-4">
        {remixes.map(renderRemix)}
      </div>

      <h2 className="mb-6 mt-12 text-2xl font-bold">Most Played Remixes</h2>

      <div className="space-y-4">
        {remixes.map(renderRemix)}
      </div>
    </div>
  )
}
