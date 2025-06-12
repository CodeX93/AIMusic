"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Music, Wand2, Heart, Play, Pause, Download, Shuffle, Volume2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PersistentAivaIntegration } from "@/components/persistent-aiva-integration"
import { useToast } from "@/components/ui/use-toast"
import { HomePopupManager } from "@/components/home-popup-manager"

export default function HomePage() {
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})
  const [audioLoaded, setAudioLoaded] = useState<{ [key: number]: boolean }>({})
  const [audioError, setAudioError] = useState<{ [key: number]: boolean }>({})
  const [showPersistentIntegration, setShowPersistentIntegration] = useState(false)
  const [isRetrying, setIsRetrying] = useState<{ [key: number]: boolean }>({})
  const audioElements = useRef<{ [key: number]: HTMLAudioElement | null }>({})
  const { toast } = useToast()

  // Reliable audio URLs that are guaranteed to work
  const reliableAudioUrls = {
    // Main fallback audio URLs (hosted on reliable CDNs)
    fallback1: "https://cdn.pixabay.com/audio/2022/11/17/audio_febc508a42.mp3",
    fallback2: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    fallback3: "https://cdn.pixabay.com/audio/2022/03/15/audio_c8b9758c8d.mp3",
    fallback4: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0f6d2e0d7.mp3",
    fallback5: "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3",
    fallback6: "https://cdn.pixabay.com/audio/2022/10/25/audio_864e7672de.mp3",
    // AI track fallbacks
    fallbackAI1: "https://cdn.pixabay.com/audio/2022/05/16/audio_8cc0501d62.mp3",
    fallbackAI2: "https://cdn.pixabay.com/audio/2022/10/28/audio_f52a5134b1.mp3",
    fallbackAI3: "https://cdn.pixabay.com/audio/2022/08/02/audio_2dde668d05.mp3",
  }

  // EDM playlists with multiple audio URL options for reliability
  const edmPlaylists = [
    {
      id: 1,
      title: "Neon Pulse",
      genre: "EDM",
      author: "DJ Synth",
      image: "https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg",
      fallbackImage: "https://cdn.pixabay.com/photo/2015/04/14/17/08/festival-722773_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/11/17/audio_febc508a42.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallback1,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
      ],
    },
    {
      id: 2,
      title: "Bass Reactor",
      genre: "Dubstep",
      author: "BassKing",
      image: "https://cdn.pixabay.com/photo/2016/11/22/19/15/hand-1850120_1280.jpg",
      fallbackImage: "https://cdn.pixabay.com/photo/2019/09/17/18/48/computer-4484282_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallback2,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
      ],
    },
    {
      id: 3,
      title: "Techno Fusion",
      genre: "Techno",
      author: "TechMaster",
      image: "https://cdn.pixabay.com/photo/2017/07/21/23/57/concert-2527495_1280.jpg",
      fallbackImage: "https://cdn.pixabay.com/photo/2016/11/29/06/17/audience-1867754_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/03/15/audio_c8b9758c8d.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallback3,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
      ],
    },
    {
      id: 4,
      title: "Electric Dreams",
      genre: "Trance",
      author: "Dreamweaver",
      image: "https://cdn.pixabay.com/photo/2017/11/24/10/43/ticket-2974645_1280.jpg",
      fallbackImage: "https://cdn.pixabay.com/photo/2018/06/17/10/38/artist-3480274_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0f6d2e0d7.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallback4,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
      ],
    },
    {
      id: 5,
      title: "Drop Zone",
      genre: "House",
      author: "HouseMaster",
      image: "https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg",
      fallbackImage: "https://cdn.pixabay.com/photo/2016/11/22/19/15/hand-1850120_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallback5,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
      ],
    },
    {
      id: 6,
      title: "Future Beats",
      genre: "Future Bass",
      author: "FutureBeat",
      image: "https://cdn.pixabay.com/photo/2014/05/21/15/18/musician-349790_1280.jpg",
      fallbackImage: "https://cdn.pixabay.com/photo/2015/03/08/17/25/musician-664432_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/10/25/audio_864e7672de.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallback6,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
      ],
    },
  ]

  // AI EDM tracks with multiple audio URL options for reliability
  const aiEdmTracks = [
    {
      id: 101,
      title: "AI Bass Drop",
      artist: "Neural Beats",
      coverUrl: "https://cdn.pixabay.com/photo/2019/08/23/08/26/music-4425334_1280.jpg",
      fallbackCover: "https://cdn.pixabay.com/photo/2015/05/15/14/50/concert-768722_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/05/16/audio_8cc0501d62.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallbackAI1,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
      ],
    },
    {
      id: 102,
      title: "Neon Pulse",
      artist: "Deep Learning DJ",
      coverUrl: "https://cdn.pixabay.com/photo/2016/11/19/13/57/drum-set-1839383_1280.jpg",
      fallbackCover: "https://cdn.pixabay.com/photo/2019/11/14/03/22/dj-4625286_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/10/28/audio_f52a5134b1.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallbackAI2,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
      ],
    },
    {
      id: 103,
      title: "Future Vibe",
      artist: "Algorithm Remix",
      coverUrl: "https://cdn.pixabay.com/photo/2016/11/22/19/15/hand-1850120_1280.jpg",
      fallbackCover: "https://cdn.pixabay.com/photo/2019/09/08/19/13/autumn-4461685_1280.jpg",
      audioUrl: "https://cdn.pixabay.com/audio/2022/08/02/audio_2dde668d05.mp3",
      fallbackAudioUrls: [
        reliableAudioUrls.fallbackAI3,
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
      ],
    },
  ]

  // Check if integration is already in progress
  useEffect(() => {
    const savedProgress = localStorage.getItem("aivaIntegrationProgress")
    if (savedProgress) {
      setShowPersistentIntegration(true)
    }
  }, [])

  // Preload audio files with robust error handling and fallbacks
  useEffect(() => {
    const preloadAudio = (id: number, urls: string[], currentUrlIndex = 0) => {
      // If we've tried all URLs, mark as error
      if (currentUrlIndex >= urls.length) {
        console.error(`All audio URLs failed for track ${id}`)
        setAudioError((prev) => ({ ...prev, [id]: true }))
        setAudioLoaded((prev) => ({ ...prev, [id]: false }))
        return
      }

      const currentUrl = urls[currentUrlIndex]
      const audio = new Audio()

      // Store reference to audio element
      audioElements.current[id] = audio

      // Set up event listeners
      audio.addEventListener("canplaythrough", () => {
        setAudioLoaded((prev) => ({ ...prev, [id]: true }))
        setAudioError((prev) => ({ ...prev, [id]: false }))
        setIsRetrying((prev) => ({ ...prev, [id]: false }))
      })

      audio.addEventListener("error", (e) => {
        console.warn(`Error loading audio for track ${id} with URL ${currentUrl}:`, e)

        // Try next fallback URL
        setIsRetrying((prev) => ({ ...prev, [id]: true }))
        setTimeout(() => {
          preloadAudio(id, urls, currentUrlIndex + 1)
        }, 1000) // Add delay before trying next URL
      })

      // Set source and start loading
      audio.src = currentUrl
      audio.preload = "auto"
      audio.load()
    }

    // Preload all playlist audio with fallbacks
    edmPlaylists.forEach((playlist) => {
      const allUrls = [playlist.audioUrl, ...playlist.fallbackAudioUrls]
      preloadAudio(playlist.id, allUrls)
    })

    // Preload all AI track audio with fallbacks
    aiEdmTracks.forEach((track) => {
      const allUrls = [track.audioUrl, ...track.fallbackAudioUrls]
      preloadAudio(track.id, allUrls)
    })

    // Cleanup function
    return () => {
      Object.values(audioElements.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.src = ""
          audio.load()
        }
      })
    }
  }, [])

  // Handle image error by setting a flag to use fallback
  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [id]: true,
    }))
  }

  // Get current audio URL for a track (primary or fallback)
  const getAudioUrl = (id: number) => {
    // Find the track in playlists or AI tracks
    const playlist = edmPlaylists.find((p) => p.id === id)
    const aiTrack = aiEdmTracks.find((t) => t.id === id)

    const track = playlist || aiTrack
    if (!track) return ""

    // If there was an error with the primary URL, use the first fallback
    if (audioError[id]) {
      return "fallbackAudioUrls" in track ? track.fallbackAudioUrls[0] : ""
    }

    return track.audioUrl
  }

  // Toggle play/pause for a track with robust error handling
  const togglePlay = (id: number) => {
    if (playingTrackId === id) {
      // Pause the current track
      const audio = audioElements.current[id]
      if (audio) {
        audio.pause()
      }
      setPlayingTrackId(null)
    } else {
      // If another track is playing, pause it first
      if (playingTrackId !== null) {
        const previousAudio = audioElements.current[playingTrackId]
        if (previousAudio) {
          previousAudio.pause()
        }
      }

      // Play the new track
      const audio = audioElements.current[id]
      if (audio) {
        // Reset the audio to the beginning if it was played before
        audio.currentTime = 0

        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayingTrackId(id)
            })
            .catch((error) => {
              console.error("Error playing audio:", error)

              // Try to reload the audio with a fallback URL
              const track = edmPlaylists.find((p) => p.id === id) || aiEdmTracks.find((t) => t.id === id)
              if (track && "fallbackAudioUrls" in track && track.fallbackAudioUrls.length > 0) {
                toast({
                  title: "Playback Issue",
                  description: "Trying alternative audio source...",
                  variant: "default",
                })

                // Try the first fallback URL
                audio.src = track.fallbackAudioUrls[0]
                audio.load()

                // Try playing again after a short delay
                setTimeout(() => {
                  audio
                    .play()
                    .then(() => setPlayingTrackId(id))
                    .catch((err) => {
                      console.error("Fallback playback failed:", err)
                      toast({
                        title: "Playback Failed",
                        description: "Could not play this track. Please try another.",
                        variant: "destructive",
                      })
                    })
                }, 1000)
              } else {
                toast({
                  title: "Playback Failed",
                  description: "Could not play this track. Please try another.",
                  variant: "destructive",
                })
              }
            })
        }
      } else {
        toast({
          title: "Track Not Ready",
          description: "This track is still loading. Please try again in a moment.",
          variant: "default",
        })
      }
    }
  }

  // Retry loading a track that failed
  const retryLoadTrack = (id: number) => {
    setIsRetrying((prev) => ({ ...prev, [id]: true }))

    // Find the track
    const playlist = edmPlaylists.find((p) => p.id === id)
    const aiTrack = aiEdmTracks.find((t) => t.id === id)
    const track = playlist || aiTrack

    if (!track || !("fallbackAudioUrls" in track)) return

    // Try loading with the first fallback URL
    const audio = new Audio()
    audioElements.current[id] = audio

    audio.addEventListener("canplaythrough", () => {
      setAudioLoaded((prev) => ({ ...prev, [id]: true }))
      setAudioError((prev) => ({ ...prev, [id]: false }))
      setIsRetrying((prev) => ({ ...prev, [id]: false }))

      toast({
        title: "Track Loaded",
        description: `"${track.title}" is now ready to play.`,
        variant: "default",
      })
    })

    audio.addEventListener("error", () => {
      setAudioError((prev) => ({ ...prev, [id]: true }))
      setIsRetrying((prev) => ({ ...prev, [id]: false }))

      toast({
        title: "Loading Failed",
        description: "Could not load this track. Please try again later.",
        variant: "destructive",
      })
    })

    // Try the first fallback URL
    audio.src = track.fallbackAudioUrls[0]
    audio.preload = "auto"
    audio.load()

    toast({
      title: "Retrying...",
      description: `Attempting to reload "${track.title}"`,
      variant: "default",
    })
  }

  // Function to handle direct download with fallbacks
  const downloadTrack = (id: number, filename: string) => {
    // Find the track
    const playlist = edmPlaylists.find((p) => p.id === id)
    const aiTrack = aiEdmTracks.find((t) => t.id === id)
    const track = playlist || aiTrack

    if (!track) {
      toast({
        title: "Download Failed",
        description: "Track information not found.",
        variant: "destructive",
      })
      return
    }

    // Get the best available URL
    const url = getAudioUrl(id)
    if (!url) {
      toast({
        title: "Download Failed",
        description: "No valid audio URL found for this track.",
        variant: "destructive",
      })
      return
    }

    // Use fetch to handle CORS issues
    toast({
      title: "Preparing Download",
      description: "Getting track ready for download...",
      variant: "default",
    })

    fetch(url)
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
        a.download = filename + ".mp3"

        // Add to document, trigger click, and remove
        document.body.appendChild(a)
        a.click()

        // Clean up
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        }, 100)

        toast({
          title: "Download Started",
          description: `${filename} is downloading to your device.`,
          variant: "default",
        })
      })
      .catch((error) => {
        console.error("Download error:", error)

        toast({
          title: "Download Failed",
          description: "There was a problem downloading this track. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Function to handle AIVA integration button click
  const handleAivaIntegration = () => {
    setShowPersistentIntegration(true)

    // Initialize integration progress in localStorage
    localStorage.setItem("aivaIntegrationProgress", "0")
    localStorage.setItem("aivaIntegrationTimestamp", Date.now().toString())

    toast({
      title: "AIVA Integration Started",
      description: "The integration process has begun and will continue in the background.",
      variant: "default",
    })
  }

  return (
    <div className="container py-8">
      {showPersistentIntegration && <PersistentAivaIntegration />}

      <h1 className="mb-2 text-3xl font-bold">AI-Powered Music Creation</h1>
      <p className="mb-8 text-zinc-400">
        Remix songs into EDM beats or generate unique audio from text using Composition converter.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="remix-card bg-gradient-to-br from-cyan-900/20 to-black p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-cyan-400">Remix Song AI</h2>
              <p className="mb-6 text-zinc-400">
                Transform any song into an EDM remix with AI-powered creativity. Upload, remix, and enjoy!
              </p>
              <Link href="/remix">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Music className="mr-2 h-4 w-4" />
                  Create remix
                </Button>
              </Link>

              {/* New feature: Clear EDM Effects options */}
              <div className="mt-4 p-3 bg-black/30 rounded-lg border border-cyan-900/30">
                <h3 className="text-sm font-medium text-cyan-400 mb-2">Crystal Clear EDM Effects</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">Pristine Bass</span>
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">Clear Highs</span>
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">Balanced Mix</span>
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">Voice Integration</span>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="20" width="10" height="40" rx="2" fill="#00c0c0" />
                <rect x="25" y="10" width="10" height="60" rx="2" fill="#00a0a0" />
                <rect x="40" y="30" width="10" height="20" rx="2" fill="#00e0e0" />
                <rect x="55" y="15" width="10" height="50" rx="2" fill="#00c0c0" />
              </svg>
            </div>
          </div>
        </div>

        <div className="remix-card bg-gradient-to-br from-cyan-900/20 to-black p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-cyan-400">Text-to-Audio</h2>
              <p className="mb-6 text-zinc-400">
                Convert your text into AI-generated music or vocals. Simply enter text and let AI create the sound!
              </p>
              <Link href="/text-to-audio">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Audio
                </Button>
              </Link>

              {/* New feature: Clear EDM Effects options */}
              <div className="mt-4 p-3 bg-black/30 rounded-lg border border-cyan-900/30">
                <h3 className="text-sm font-medium text-cyan-400 mb-2">Premium Voice + EDM Options</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">Crystal Clear Mix</span>
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">Voice Clarity</span>
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">Text Prompts</span>
                  <span className="px-2 py-1 bg-cyan-900/30 text-xs rounded-full text-cyan-300">EDM Fusion</span>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M40 10C23.4315 10 10 23.4315 10 40C10 56.5685 23.4315 70 40 70C56.5685 70 70 56.5685 70 40C70 23.4315 56.5685 10 40 10ZM40 65C26.1929 65 15 53.8071 15 40C15 26.1929 26.1929 15 40 15C53.8071 15 65 26.1929 65 40C65 53.8071 53.8071 65 40 65Z"
                  fill="#00a0a0"
                />
                <path
                  d="M40 20C29.0543 20 20 29.0543 20 40C20 50.9457 29.0543 60 40 60C50.9457 60 60 50.9457 60 40C60 29.0543 50.9457 20 40 20ZM40 55C31.7157 55 25 48.2843 25 40C25 31.7157 31.7157 25 40 25C48.2843 25 55 31.7157 55 40C55 48.2843 48.2843 55 40 55Z"
                  fill="#00c0c0"
                />
                <circle cx="40" cy="40" r="10" fill="#00e0e0" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* New AIVA Integration Banner */}
      <div className="mt-8 mb-8 rounded-xl border border-cyan-800/30 bg-gradient-to-r from-cyan-900/20 to-black/60 p-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 4L19.2 10.5L26 11.5L21 16.5L22.4 23.5L16 20L9.6 23.5L11 16.5L6 11.5L12.8 10.5L16 4Z"
                  fill="#00c0c0"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AIVA AI Music Generation</h2>
              <p className="text-zinc-400">Enhance your music creation with AIVA's professional AI music generation</p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-600 hover:to-blue-600"
            onClick={handleAivaIntegration}
          >
            Integrate AIVA
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">EDM Playlists</h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-cyan-400 border-cyan-800/50">
              <Shuffle className="h-3 w-3" />
              <span>Shuffle</span>
            </Button>
            <Button variant="link" className="text-cyan-400">
              View all
            </Button>
          </div>
        </div>
        <p className="mb-6 text-zinc-400">Explore our collection of EDM playlists</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {edmPlaylists.map((playlist) => (
            <div key={playlist.id} className="remix-card group">
              <div className="relative overflow-hidden rounded-lg">
                <Link href={`/playlist/${playlist.id}`}>
                  <div className="aspect-square w-full bg-gradient-to-br from-cyan-900/50 to-purple-900/50">
                    {/* Use img tag with error handling for guaranteed image display */}
                    <img
                      src={
                        imageErrors[`playlist-${playlist.id || "/placeholder.svg"}`]
                          ? playlist.fallbackImage
                          : playlist.image
                      }
                      alt={playlist.title}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={() => handleImageError(`playlist-${playlist.id}`)}
                    />
                  </div>
                </Link>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {audioError[playlist.id] && !isRetrying[playlist.id] ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-12 w-12 rounded-full bg-amber-500 text-black hover:bg-amber-400"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        retryLoadTrack(playlist.id)
                      }}
                    >
                      <RefreshCw className="h-6 w-6" />
                    </Button>
                  ) : isRetrying[playlist.id] ? (
                    <div className="h-12 w-12 rounded-full bg-cyan-500/80 flex items-center justify-center">
                      <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-12 w-12 rounded-full bg-cyan-500 text-black hover:bg-cyan-400"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        togglePlay(playlist.id)
                      }}
                      disabled={!audioLoaded[playlist.id]}
                    >
                      {playingTrackId === playlist.id ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-1" />
                      )}
                    </Button>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full bg-cyan-500/80 text-black hover:bg-cyan-400 transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        downloadTrack(playlist.id, playlist.title)
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download {playlist.title}</span>
                    </Button>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Audio status indicator */}
                {playingTrackId === playlist.id && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center justify-center gap-1">
                      <Volume2 className="h-3 w-3 text-cyan-400" />
                      <div className="flex space-x-0.5">
                        <div className="h-3 w-1 animate-pulse bg-cyan-400"></div>
                        <div className="h-4 w-1 animate-pulse bg-cyan-400" style={{ animationDelay: "0.1s" }}></div>
                        <div className="h-2 w-1 animate-pulse bg-cyan-400" style={{ animationDelay: "0.2s" }}></div>
                        <div className="h-5 w-1 animate-pulse bg-cyan-400" style={{ animationDelay: "0.3s" }}></div>
                        <div className="h-3 w-1 animate-pulse bg-cyan-400" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {!audioLoaded[playlist.id] && !audioError[playlist.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent align-[-0.125em]"></div>
                      <p className="mt-2 text-sm text-cyan-400">Loading audio...</p>
                    </div>
                  </div>
                )}

                {/* Error indicator */}
                {audioError[playlist.id] && !isRetrying[playlist.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center px-2">
                      <p className="text-amber-400 mb-1">Audio failed to load</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          retryLoadTrack(playlist.id)
                        }}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <Link href={`/playlist/${playlist.id}`}>
                  <h3 className="font-medium hover:text-cyan-400 transition-colors">{playlist.title}</h3>
                </Link>
                <p className="text-sm text-cyan-400">{playlist.genre}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  <span className="text-xs text-zinc-500">{playlist.author}</span>
                  {playingTrackId === playlist.id && <span className="ml-auto text-xs text-cyan-400">Playing</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDM AI Playlist Section */}
      <div className="mt-16 border-t border-zinc-800 pt-8">
        <h2 className="text-3xl font-bold mb-6">🎧 EDM AI Playlist</h2>
        <p className="text-zinc-400 mb-8">AI-generated EDM tracks with deep bass and futuristic vibes</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiEdmTracks.map((track) => (
            <div
              key={track.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                {/* Use img tag with error handling for guaranteed image display */}
                <img
                  src={imageErrors[`track-${track.id || "/placeholder.svg"}`] ? track.fallbackCover : track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={() => handleImageError(`track-${track.id}`)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-cyan-500/80 hover:text-black"
                >
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Loading indicator */}
                {!audioLoaded[track.id] && !audioError[track.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent align-[-0.125em]"></div>
                      <p className="mt-2 text-sm text-cyan-400">Loading audio...</p>
                    </div>
                  </div>
                )}

                {/* Error indicator */}
                {audioError[track.id] && !isRetrying[track.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-center px-4">
                      <p className="text-amber-400 mb-2">Audio failed to load</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
                        onClick={() => retryLoadTrack(track.id)}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{track.title}</h3>
                <p className="text-cyan-400 text-sm mb-4">{track.artist}</p>

                {audioError[track.id] && !isRetrying[track.id] ? (
                  <div className="w-full p-3 border border-amber-500/30 rounded-md bg-amber-500/10 text-center">
                    <p className="text-amber-400 text-sm mb-2">Audio could not be loaded</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
                      onClick={() => retryLoadTrack(track.id)}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Retry Loading
                    </Button>
                  </div>
                ) : isRetrying[track.id] ? (
                  <div className="w-full p-4 border border-cyan-500/30 rounded-md bg-cyan-500/10 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent align-[-0.125em] mb-2"></div>
                    <p className="text-cyan-400 text-sm">Reloading audio...</p>
                  </div>
                ) : (
                  <audio
                    id={`audio-${track.id}`}
                    className="w-full"
                    controls
                    src={getAudioUrl(track.id)}
                    preload="auto"
                    onPlay={() => setPlayingTrackId(track.id)}
                    onPause={() => setPlayingTrackId(null)}
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}

                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
                    onClick={() => downloadTrack(track.id, track.title)}
                    disabled={audioError[track.id] && !isRetrying[track.id]}
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HomePopupManager />
    </div>
  )
}
