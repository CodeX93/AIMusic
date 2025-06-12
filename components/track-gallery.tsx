"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, RefreshCw } from "lucide-react"
import { AudioPlayer } from "./audio-player"
import { useToast } from "@/hooks/use-toast"

// Sample track data
const SAMPLE_TRACKS = [
  {
    id: "track-1",
    title: "Summer Vibes Remix",
    genre: "EDM",
    audioUrl: "/samples/edm-remix-sample.mp3",
  },
  {
    id: "track-2",
    title: "Deep House Groove",
    genre: "House",
    audioUrl: "/samples/music-calm.mp3",
  },
  {
    id: "track-3",
    title: "Energetic Dubstep",
    genre: "Dubstep",
    audioUrl: "/samples/music-excited.mp3",
  },
  {
    id: "track-4",
    title: "Melodic Trance",
    genre: "Trance",
    audioUrl: "/samples/music-professional.mp3",
  },
]

export function TrackGallery() {
  const [tracks, setTracks] = useState(SAMPLE_TRACKS)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Simulate loading tracks
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Handle track retry
  const handleRetry = (trackId: string) => {
    toast({
      title: "Reloading track",
      description: "Attempting to reload the track...",
    })

    // Simulate track reload
    setTimeout(() => {
      toast({
        title: "Track reloaded",
        description: "Track has been successfully reloaded.",
      })
    }, 1000)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-cyan-500" />
            <CardTitle>Your Music Library</CardTitle>
          </div>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-10 w-10 text-cyan-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading your tracks...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tracks found. Generate some music to see it here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tracks.map((track) => (
              <div key={track.id} className="remix-card p-4">
                <div className="mb-2">
                  <h3 className="font-medium text-lg">{track.title}</h3>
                  <p className="text-sm text-gray-400">{track.genre}</p>
                </div>

                <AudioPlayer
                  audioUrl={track.audioUrl}
                  title={track.title}
                  subtitle={track.genre}
                  showWaveform
                  showDownload
                  onPlaybackComplete={() => console.log(`Finished playing ${track.title}`)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button className="cyan-button">Upgrade for Unlimited Tracks</Button>
        </div>
      </CardContent>
    </Card>
  )
}
