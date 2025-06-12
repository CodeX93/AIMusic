"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export function SampleLibrary({ onSampleSelect }) {
  const [playingSample, setPlayingSample] = useState(null)

  const sampleCategories = [
    {
      name: "Drums",
      samples: [
        {
          name: "Kick Drum",
          duration: "0:01",
          url: "https://assets.mixkit.co/sfx/preview/mixkit-drum-bass-hit-2294.mp3",
        },
        { name: "Snare", duration: "0:01", url: "https://assets.mixkit.co/sfx/preview/mixkit-tribal-dry-drum-558.mp3" },
        {
          name: "Hi-Hat",
          duration: "0:01",
          url: "https://assets.mixkit.co/sfx/preview/mixkit-hi-hat-single-hit-2223.mp3",
        },
      ],
    },
    {
      name: "Synths",
      samples: [
        {
          name: "Pad",
          duration: "0:05",
          url: "https://assets.mixkit.co/sfx/preview/mixkit-futuristic-bass-hit-2303.mp3",
        },
        { name: "Lead", duration: "0:03", url: "https://assets.mixkit.co/sfx/preview/mixkit-melodic-bass-671.mp3" },
        { name: "Bass", duration: "0:02", url: "https://assets.mixkit.co/sfx/preview/mixkit-deep-bass-hit-2294.mp3" },
      ],
    },
    {
      name: "Effects",
      samples: [
        {
          name: "Riser",
          duration: "0:03",
          url: "https://assets.mixkit.co/sfx/preview/mixkit-cinematic-transition-swoosh-heartbeat-trailer-488.mp3",
        },
        {
          name: "Impact",
          duration: "0:02",
          url: "https://assets.mixkit.co/sfx/preview/mixkit-cinematic-impact-bass-701.mp3",
        },
        {
          name: "Sweep",
          duration: "0:04",
          url: "https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3",
        },
      ],
    },
  ]

  const playSample = (sample) => {
    if (playingSample) {
      playingSample.pause()
      if (typeof playingSample.currentTime !== "undefined") {
        playingSample.currentTime = 0
      }
    }

    try {
      const audio = new Audio()
      audio.src = sample.url
      audio.crossOrigin = "anonymous" // Add this to avoid CORS issues

      audio.addEventListener(
        "canplaythrough",
        () => {
          audio.play().catch((err) => {
            toast({
              title: "Audio Error",
              description: "Audio tidak dapat diputar, coba format lain atau gunakan sample.",
              variant: "destructive",
            })
          })
        },
        { once: true },
      )

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e)
      })

      setPlayingSample(audio)

      audio.onended = () => {
        setPlayingSample(null)
      }
    } catch (error) {
      console.error("Error creating audio element:", error)
    }
  }

  const addSample = (sample) => {
    if (onSampleSelect) {
      onSampleSelect(sample)
    }
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-4">
        {sampleCategories.map((category) => (
          <div key={category.name} className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-400">{category.name}</h4>
            <div className="space-y-1">
              {category.samples.map((sample) => (
                <div
                  key={sample.name}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mr-2 text-zinc-400 hover:text-white"
                      onClick={() => playSample(sample)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <span className="text-sm text-zinc-300">{sample.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{sample.duration}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-400 hover:text-white"
                      onClick={() => addSample(sample)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
