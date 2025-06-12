"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Zap, Music, Waves, Radio, Sparkles, Drumstick, Flame, CloudLightningIcon as Lightning } from 'lucide-react'

export function EdmPresets({ onPresetSelect, disabled = false }) {
  const presets = [
    {
      name: "Deep House",
      icon: <Waves className="h-4 w-4" />,
      description: "Smooth bass and subtle effects",
      effects: {
        reverb: 40,
        delay: 20,
        distortion: 0,
        phaser: 0,
        filter: 70,
        wobble: 0,
        flanger: 10,
        bitcrush: 0,
        low: 70, // Slightly reduced from 80 to avoid overpowering bass
        mid: 45, // Slightly increased from 40 for better vocal clarity
        high: 50, // Reduced from 60 to avoid harsh high frequencies
        presence: 30,
      },
      bpm: 124,
      key: "C Minor",
    },
    {
      name: "Dubstep",
      icon: <Zap className="h-4 w-4" />,
      description: "Heavy bass and wobble effects",
      effects: {
        reverb: 20,
        delay: 15,
        distortion: 60, // Reduced from 70 to be less harsh
        phaser: 30,
        filter: 30,
        wobble: 80, // Reduced from 90 to be more balanced
        flanger: 20,
        bitcrush: 30, // Reduced from 40 to be less harsh
        low: 80, // Reduced from 90 to avoid muddy bass
        mid: 55, // Slightly reduced from 60 for better balance
        high: 60, // Reduced from 70 to avoid harsh high frequencies
        presence: 45, // Reduced from 50 for better balance
      },
      bpm: 140,
      key: "F Minor",
    },
    {
      name: "Trance",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Uplifting and atmospheric",
      effects: {
        reverb: 70, // Reduced from 80 for better clarity
        delay: 50, // Reduced from 60 to avoid muddiness
        distortion: 0,
        phaser: 40,
        filter: 60,
        wobble: 0,
        flanger: 40, // Reduced from 50 for better balance
        bitcrush: 0,
        low: 65, // Reduced from 70 for better balance
        mid: 60,
        high: 75, // Reduced from 85 to avoid harshness
        presence: 65, // Reduced from 70 for better balance
      },
      bpm: 138,
      key: "A Minor",
    },
    {
      name: "Drum & Bass",
      icon: <Drumstick className="h-4 w-4" />,
      description: "Fast breaks and deep bass",
      effects: {
        reverb: 30,
        delay: 25,
        distortion: 35, // Reduced from 40 for better balance
        phaser: 20,
        filter: 50,
        wobble: 30,
        flanger: 15,
        bitcrush: 20, // Reduced from 25 for better clarity
        low: 75, // Reduced from 85 to avoid overpowering bass
        mid: 50, // Increased from 45 for better vocal presence
        high: 65, // Reduced from 75 to avoid harshness
        presence: 55, // Reduced from 60 for better balance
      },
      bpm: 174,
      key: "D Minor",
    },
    {
      name: "Trap",
      icon: <Flame className="h-4 w-4" />,
      description: "808s and rapid hi-hats",
      effects: {
        reverb: 50,
        delay: 40,
        distortion: 50, // Reduced from 60 for better balance
        phaser: 10,
        filter: 40,
        wobble: 20,
        flanger: 0,
        bitcrush: 25, // Reduced from 30 for better clarity
        low: 85, // Reduced from 95 to avoid overpowering bass
        mid: 40, // Increased from 30 for better vocal presence
        high: 70, // Reduced from 80 to avoid harsh hi-hats
        presence: 60, // Reduced from 65 for better balance
      },
      bpm: 140,
      key: "G Minor",
    },
    {
      name: "Hardstyle",
      icon: <Lightning className="h-4 w-4" />,
      description: "Hard kicks and euphoric melodies",
      effects: {
        reverb: 55, // Reduced from 60 for better clarity
        delay: 30,
        distortion: 75, // Reduced from 85 for less harshness
        phaser: 15,
        filter: 45,
        wobble: 40,
        flanger: 20,
        bitcrush: 40, // Reduced from 50 for better balance
        low: 80, // Reduced from 90 to avoid overpowering bass
        mid: 65, // Reduced from 70 for better balance
        high: 65, // Reduced from 75 to avoid harshness
        presence: 70, // Reduced from 80 for better balance
      },
      bpm: 150,
      key: "E Minor",
    },
    {
      name: "Techno",
      icon: <Radio className="h-4 w-4" />,
      description: "Minimal and rhythmic",
      effects: {
        reverb: 30,
        delay: 25,
        distortion: 20,
        phaser: 0,
        filter: 60,
        wobble: 10,
        flanger: 0,
        bitcrush: 30,
        low: 75,
        mid: 50,
        high: 60,
        presence: 40,
      },
      bpm: 130,
      key: "G Minor",
    },
    {
      name: "Future Bass",
      icon: <Music className="h-4 w-4" />,
      description: "Modern and energetic",
      effects: {
        reverb: 50,
        delay: 25,
        distortion: 30,
        phaser: 40,
        filter: 50,
        wobble: 30,
        flanger: 30,
        bitcrush: 20,
        low: 80,
        mid: 70,
        high: 75,
        presence: 60,
      },
      bpm: 150,
      key: "E Minor",
    },
  ]

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">EDM Presets</h3>
      <ScrollArea className="h-auto">
        <div className="flex gap-2 pb-2 overflow-x-auto">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-cyan-500 flex-shrink-0"
              onClick={() => onPresetSelect(preset)}
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                <div className="bg-cyan-500/20 p-1.5 rounded-md text-cyan-400">{preset.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-zinc-500">{preset.description}</div>
                  <div className="text-xs text-cyan-400/70 mt-1">
                    {preset.bpm} BPM • {preset.key}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
