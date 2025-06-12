"use client"

import { useState, useRef, useEffect } from "react"
import { Download, Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function EDMVoiceMixer() {
  const [voiceText, setVoiceText] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("neutral")
  const [selectedEDMEffect, setSelectedEDMEffect] = useState("clean")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const voices = [
    { id: "neutral", name: "Netral" },
    { id: "male", name: "Pria" },
    { id: "female", name: "Wanita" },
    { id: "deep", name: "Dalam" },
  ]

  const edmEffects = [
    { id: "clean", name: "Jernih (Clean)" },
    { id: "bass", name: "Bass Boost" },
    { id: "reverb", name: "Reverb" },
    { id: "delay", name: "Delay" },
    { id: "filter", name: "Filter Sweep" },
  ]

  // Menangani pemutaran audio
  useEffect(() => {
    if (audioRef.current) {
      const audioElement = audioRef.current

      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)
      const handleEnded = () => setIsPlaying(false)

      audioElement.addEventListener("play", handlePlay)
      audioElement.addEventListener("pause", handlePause)
      audioElement.addEventListener("ended", handleEnded)

      return () => {
        audioElement.removeEventListener("play", handlePlay)
        audioElement.removeEventListener("pause", handlePause)
        audioElement.removeEventListener("ended", handleEnded)
      }
    }
  }, [audioRef.current])

  const handleGenerate = () => {
    if (!voiceText.trim()) return

    setIsGenerating(true)

    // Simulasi proses generasi
    setTimeout(() => {
      // Pilih sample audio berdasarkan voice yang dipilih
      let audioSample = ""

      switch (selectedVoice) {
        case "male":
          audioSample = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          break
        case "female":
          audioSample = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
          break
        case "deep":
          audioSample = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
          break
        default:
          audioSample = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
      }

      setGeneratedAudio(audioSample)
      setIsGenerating(false)

      toast({
        title: "Audio Generated",
        description: "Your EDM voice has been generated successfully!",
      })
    }, 2000)
  }

  const handleDownload = () => {
    if (!generatedAudio) return

    try {
      // Fetch and download using Blob untuk menangani CORS
      fetch(generatedAudio)
        .then((response) => response.blob())
        .then((blob) => {
          // Create blob URL
          const blobUrl = URL.createObjectURL(blob)

          // Create anchor element for download
          const downloadLink = document.createElement("a")
          downloadLink.href = blobUrl
          downloadLink.download = `EDM-Voice-${selectedVoice}-${selectedEDMEffect}.mp3`
          document.body.appendChild(downloadLink)
          downloadLink.click()

          // Cleanup
          setTimeout(() => {
            document.body.removeChild(downloadLink)
            URL.revokeObjectURL(blobUrl)
          }, 100)

          toast({
            title: "Download Started",
            description: "Your EDM voice is downloading...",
          })
        })
        .catch((error) => {
          console.error("Download failed:", error)
          toast({
            title: "Download Failed",
            description: "Couldn't download the audio. Please try again.",
            variant: "destructive",
          })
        })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Error",
        description: "There was a problem downloading the audio.",
        variant: "destructive",
      })
    }
  }

  // Implementasi fungsi share
  const handleShare = async () => {
    if (!generatedAudio) return

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: "EDM Voice Mixer",
          text: `Check out this EDM voice with ${selectedEDMEffect} effect!`,
          url: window.location.href,
        })

        toast({
          title: "Shared Successfully",
          description: "Your EDM voice has been shared!",
        })
      } catch (error) {
        console.error("Sharing failed:", error)

        // Fall back to copying to clipboard
        copyLinkToClipboard()
      }
    } else {
      // If Web Share API not supported, copy to clipboard
      copyLinkToClipboard()
    }
  }

  // Helper function to copy link to clipboard
  const copyLinkToClipboard = () => {
    try {
      const shareUrl = window.location.href
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          toast({
            title: "Link Copied",
            description: "EDM voice link copied to clipboard!",
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

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Playback failed:", error)
          toast({
            title: "Playback Failed",
            description: "Could not play the audio. Please try again.",
            variant: "destructive",
          })
        })
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-lg border border-cyan-500/20">
      <h2 className="text-2xl font-bold mb-6 text-white">EDM Voice Mixer</h2>

      <div className="mb-6">
        <label htmlFor="voiceText" className="block text-white mb-2">
          Teks Suara
        </label>
        <textarea
          id="voiceText"
          value={voiceText}
          onChange={(e) => setVoiceText(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          rows={4}
          placeholder="Masukkan teks yang ingin diubah menjadi suara dengan efek EDM..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-white mb-2">Jenis Suara</label>
          <div className="grid grid-cols-2 gap-2">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-3 rounded-lg transition ${
                  selectedVoice === voice.id ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {voice.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Efek EDM</label>
          <div className="grid grid-cols-1 gap-2">
            {edmEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setSelectedEDMEffect(effect.id)}
                className={`p-3 rounded-lg transition ${
                  selectedEDMEffect === effect.id
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !voiceText.trim()}
        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Menghasilkan...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Hasilkan Audio EDM
          </>
        )}
      </button>

      {generatedAudio && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-medium mb-3">Audio yang Dihasilkan</h3>
          <audio
            ref={audioRef}
            controls
            className="w-full mb-4"
            src={generatedAudio}
            onError={(e) => {
              const audioElement = e.currentTarget
              audioElement.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
              audioElement.load()
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download
            </button>

            <button
              onClick={handleShare}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition flex items-center justify-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Bagikan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
