"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { VolumeX, Volume2 } from "lucide-react"

export function MixerControls({ disabled = false, onMixerChange }) {
  const [tracks, setTracks] = useState({
    main: 80,
    drums: 70,
    melody: 65,
  })

  const [muted, setMuted] = useState({
    main: false,
    drums: false,
    melody: false,
  })

  const handleVolumeChange = (track, value) => {
    setTracks((prev) => ({
      ...prev,
      [track]: value[0],
    }))

    onMixerChange?.(track, value[0])
  }

  const toggleMute = (track) => {
    setMuted((prev) => ({
      ...prev,
      [track]: !prev[track],
    }))

    onMixerChange?.(track, muted[track] ? tracks[track] : 0)
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Mixer</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrackControl
          name="Main Track"
          value={tracks.main}
          color="cyan"
          isMuted={muted.main}
          onMute={() => toggleMute("main")}
          onChange={(value) => handleVolumeChange("main", value)}
          disabled={disabled}
        />
        <TrackControl
          name="Drums"
          value={tracks.drums}
          color="cyan"
          isMuted={muted.drums}
          onMute={() => toggleMute("drums")}
          onChange={(value) => handleVolumeChange("drums", value)}
          disabled={disabled}
        />
        <TrackControl
          name="Melody"
          value={tracks.melody}
          color="cyan"
          isMuted={muted.melody}
          onMute={() => toggleMute("melody")}
          onChange={(value) => handleVolumeChange("melody", value)}
          disabled={disabled}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          disabled={disabled}
          onClick={() => onMixerChange?.("tempo", 120)}
        >
          Tempo: 120 BPM
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          disabled={disabled}
          onClick={() => onMixerChange?.("key", "C Minor")}
        >
          Key: C Minor
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          disabled={disabled}
          onClick={() => onMixerChange?.("time", "4/4")}
        >
          Time: 4/4
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          disabled={disabled}
          onClick={() => onMixerChange?.("pitch", 0)}
        >
          Pitch: 0
        </Button>
      </div>
    </div>
  )
}

function TrackControl({ name, value, color, isMuted, onMute, onChange, disabled = false }) {
  const getColorClass = (color) => {
    switch (color) {
      case "cyan":
        return "bg-cyan-500"
      default:
        return "bg-zinc-500"
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{name}</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${isMuted ? "text-red-400 hover:text-red-300" : "text-zinc-400 hover:text-white"}`}
            onClick={onMute}
            disabled={disabled}
          >
            <VolumeX className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-zinc-500" />
        <Slider
          value={[value]}
          min={0}
          max={100}
          step={1}
          className={`[&>[role=slider]]:${getColorClass(color)}`}
          onValueChange={onChange}
          disabled={disabled || isMuted}
        />
      </div>
    </div>
  )
}
