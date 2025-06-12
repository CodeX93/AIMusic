"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download, Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Track {
  id: string
  title: string
  description: string
  coverImage: string
  audioSrc: string
}

export function EdmAiPlaylist() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})

  // Sample EDM AI generated tracks
  const tracks: Track[] = [
    {
      id: "1",
      title: "AI Bass Drop",
      description: "AI generated EDM track with heavy bass",
      coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=300&h=300&auto=format&fit=crop",
      audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "2",
      title: "Neural Trance",
      description: "AI generated trance music with ethereal synths",
      coverImage: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=300&h=300&auto=format&fit=crop",
      audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: "3",
      title: "Quantum House Beat",
      description: "AI generated house music with futuristic beats",
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=300&h=300&auto=format&fit=crop",
      audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ]

  const togglePlay = (trackId: string) => {
    const audio = audioRefs.current[trackId]
    if (!audio) return

    if (playingId === trackId) {
      // Pause current track
      audio.pause()
      setPlayingId(null)
    } else {
      // Pause any playing track
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId]?.pause()
      }

      // Play new track
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback failed:", error)
          toast({
            title: "Playback Failed",
            description: "Could not play the audio. Please try again.",
            variant: "destructive",
          })
        })
      }
      setPlayingId(trackId)
    }
  }

  const handleAudioEnded = (trackId: string) => {
    if (playingId === trackId) {
      setPlayingId(null)
    }
  }

  const downloadTrack = (track: Track) => {
    try {
      // Fetch and download using Blob
      fetch(track.audioSrc)
        .then((response) => response.blob())
        .then((blob) => {
          // Create blob URL
          const blobUrl = URL.createObjectURL(blob)

          // Create anchor element for download
          const downloadLink = document.createElement("a")
          downloadLink.href = blobUrl
          downloadLink.download = `${track.title}.mp3`
          document.body.appendChild(downloadLink)
          downloadLink.click()

          // Cleanup
          setTimeout(() => {
            document.body.removeChild(downloadLink)
            URL.revokeObjectURL(blobUrl)
          }, 100)

          toast({
            title: "Download Started",
            description: `${track.title} is downloading...`,
          })
        })
        .catch((error) => {
          console.error("Download failed:", error)
          toast({
            title: "Download Failed",
            description: "Couldn't download the track. Please try again.",
            variant: "destructive",
          })
        })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Error",
        description: "There was a problem downloading the track.",
        variant: "destructive",
      })
    }
  }

  // Implement share functionality
  const shareTrack = async (track: Track) => {
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `Check out this EDM track: ${track.title}`,
          url: window.location.href,
        })

        toast({
          title: "Shared Successfully",
          description: "Track has been shared!",
        })
      } catch (error) {
        console.error("Sharing failed:", error)

        // Fall back to copying to clipboard
        copyTrackLinkToClipboard(track)
      }
    } else {
      // If Web Share API not supported, copy to clipboard
      copyTrackLinkToClipboard(track)
    }
  }

  // Helper function to copy link to clipboard
  const copyTrackLinkToClipboard = (track: Track) => {
    try {
      const shareUrl = `${window.location.origin}/share/track/${track.id}`
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          toast({
            title: "Link Copied",
            description: "Track link copied to clipboard!",
          })
        },
        (err) => {
          console.error("Could not copy text: ", err)
          toast({
            title: "Copy Failed",
            description: "Could not copy link to clipboard.",
            variant: "destructive",
          })
        },
      )
    } catch (error) {
      console.error("Clipboard API not available:", error)
      toast({
        title: "Share Failed",
        description: "Sharing is not supported in your browser.",
        variant: "destructive",
      })
    }
  }

  // Fallback image handling
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/placeholder.svg?key=o59cj"
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">EDM AI Playlist</h2>
        <p className="text-gray-500 dark:text-gray-400">AI generated EDM tracks for your next mix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <Card key={track.id} className="overflow-hidden border-2 hover:border-cyan-500 transition-all duration-300">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={track.coverImage || "/placeholder.svg"}
                alt={track.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"
                  onClick={() => togglePlay(track.id)}
                >
                  {playingId === track.id ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </Button>
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle>{track.title}</CardTitle>
              <CardDescription>{track.description}</CardDescription>
            </CardHeader>

            <CardFooter className="pt-0 flex justify-between">
              <audio
                ref={(el) => (audioRefs.current[track.id] = el)}
                src={track.audioSrc}
                onEnded={() => handleAudioEnded(track.id)}
                preload="metadata"
              />

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
                  onClick={() => downloadTrack(track)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
                  onClick={() => shareTrack(track)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
