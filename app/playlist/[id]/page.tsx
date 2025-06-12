"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Download, Heart, MoreHorizontal, Pause, Play, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PlaylistDetailPage({ params }: { params: { id: string } }) {
  const [playlist, setPlaylist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null)

  useEffect(() => {
    // Simulate fetching playlist data
    const fetchPlaylist = async () => {
      setLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data based on the playlist ID
      const id = Number.parseInt(params.id)

      const playlistData = {
        id,
        title: getPlaylistTitle(id),
        description: "A collection of the best EDM tracks curated just for you.",
        coverImage: getPlaylistImage(id),
        createdBy: "DJ Master",
        followers: "2.3k",
        tracks: generateTracks(id, 8),
      }

      setPlaylist(playlistData)
      setLoading(false)
    }

    fetchPlaylist()
  }, [params.id])

  // Helper functions to generate mock data
  function getPlaylistTitle(id: number) {
    const titles = ["Neon Pulse", "Bass Reactor", "Techno Fusion", "Electric Dreams", "Drop Zone", "Future Beats"]
    return titles[id - 1] || "EDM Playlist"
  }

  function getPlaylistImage(id: number) {
    const images = [
      "https://images.unsplash.com/photo-1540238247413-4f913a5c43f8?auto=format&fit=crop&w=500&h=500",
      "https://images.unsplash.com/photo-1580651132045-42f94d3d2765?auto=format&fit=crop&w=500&h=500",
      "https://images.unsplash.com/photo-1581276879432-c38ca4efec04?auto=format&fit=crop&w=500&h=500",
      "https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=500&h=500",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&h=500",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&h=500",
    ]
    return images[id - 1] || images[0]
  }

  function generateTracks(playlistId: number, count: number) {
    const tracks = []
    const audioSamples = [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    ]

    const trackNames = [
      "Bass Drop",
      "Neon Lights",
      "Electric Pulse",
      "Midnight Drive",
      "Laser Beam",
      "Techno Dreams",
      "Club Night",
      "Festival Vibes",
      "Synth Wave",
      "Digital Love",
      "Future Sound",
      "Beat Master",
    ]

    const artists = [
      "DJ Synth",
      "BassKing",
      "TechMaster",
      "Dreamweaver",
      "HouseMaster",
      "FutureBeat",
      "ElectroDJ",
      "SynthWave",
    ]

    for (let i = 1; i <= count; i++) {
      tracks.push({
        id: i,
        title: trackNames[(i + playlistId) % trackNames.length],
        artist: artists[(i + playlistId) % artists.length],
        duration: `${Math.floor(Math.random() * 2) + 3}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`,
        audioUrl: audioSamples[(i - 1) % audioSamples.length],
        playlistId,
      })
    }

    return tracks
  }

  // Function to toggle play/pause for a track
  const togglePlay = (trackId: number) => {
    if (!playlist) return

    if (playingTrackId === trackId) {
      // If this track is already playing, pause it
      const audio = document.getElementById(`track-audio-${trackId}`) as HTMLAudioElement
      if (audio) {
        audio.pause()
      }
      setPlayingTrackId(null)
    } else {
      // If another track is playing, pause it first
      if (playingTrackId !== null) {
        const previousAudio = document.getElementById(`track-audio-${playingTrackId}`) as HTMLAudioElement
        if (previousAudio) {
          previousAudio.pause()
        }
      }

      // Play the new track
      const audio = document.getElementById(`track-audio-${trackId}`) as HTMLAudioElement
      if (audio) {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error)
        })
      }
      setPlayingTrackId(trackId)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 aspect-square bg-gray-200 animate-pulse"></div>

          <div className="flex-1">
            <div className="h-8 w-48 bg-gray-200 animate-pulse mb-4"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse mb-8"></div>

            <div className="flex gap-4 mb-8">
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <div className="h-4 w-4 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2">
          <Link href="/home">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-medium">Playlist not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/home">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-medium">EDM Playlist</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 aspect-square">
          <img
            src={playlist.coverImage || "/placeholder.svg"}
            alt={playlist.title}
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{playlist.title}</h1>
          <p className="text-zinc-400 mb-4">{playlist.description}</p>

          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
            <span>Created by {playlist.createdBy}</span>
            <span>•</span>
            <span>{playlist.followers} followers</span>
            <span>•</span>
            <span>{playlist.tracks.length} tracks</span>
          </div>

          <div className="flex gap-4 mb-8">
            <Button
              className="bg-cyan-600 hover:bg-cyan-700"
              onClick={() => {
                if (playlist.tracks.length > 0) {
                  togglePlay(playlist.tracks[0].id)
                }
              }}
            >
              {playingTrackId !== null ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {playingTrackId !== null ? "Pause" : "Play"}
            </Button>
            <Button size="icon" variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-b border-zinc-800 pb-2 mb-4">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 text-sm text-zinc-400">
              <span>#</span>
              <span>Title</span>
              <span className="flex items-center">
                <Clock className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {playlist.tracks.map((track: any, index: number) => (
              <div
                key={track.id}
                className={`grid grid-cols-[auto_1fr_auto] gap-4 p-2 rounded-md ${
                  playingTrackId === track.id ? "bg-cyan-900/20" : "hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center justify-center w-6">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => togglePlay(track.id)}>
                    {playingTrackId === track.id ? (
                      <Pause className="h-3 w-3 text-cyan-400" />
                    ) : (
                      <span className="text-sm text-zinc-400">{index + 1}</span>
                    )}
                  </Button>
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm ${playingTrackId === track.id ? "text-cyan-400" : ""}`}>{track.title}</span>
                  <span className="text-xs text-zinc-400">{track.artist}</span>
                  {playingTrackId === track.id && (
                    <div className="mt-2 flex space-x-0.5">
                      <div className="h-2 w-0.5 animate-pulse bg-cyan-400"></div>
                      <div className="h-3 w-0.5 animate-pulse bg-cyan-400" style={{ animationDelay: "0.1s" }}></div>
                      <div className="h-1 w-0.5 animate-pulse bg-cyan-400" style={{ animationDelay: "0.2s" }}></div>
                      <div className="h-4 w-0.5 animate-pulse bg-cyan-400" style={{ animationDelay: "0.3s" }}></div>
                      <div className="h-2 w-0.5 animate-pulse bg-cyan-400" style={{ animationDelay: "0.4s" }}></div>
                      <div className="h-3 w-0.5 animate-pulse bg-cyan-400" style={{ animationDelay: "0.5s" }}></div>
                      <div className="h-2 w-0.5 animate-pulse bg-cyan-400" style={{ animationDelay: "0.6s" }}></div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400">{track.duration}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>

                {/* Hidden audio element for this track */}
                <audio
                  id={`track-audio-${track.id}`}
                  src={track.audioUrl}
                  className="hidden"
                  onEnded={() => setPlayingTrackId(null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
