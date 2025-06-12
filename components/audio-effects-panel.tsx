"use client"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AudioEffectsPanel({ effects = {}, onEffectChange, disabled = false }) {
  return (
    <Tabs defaultValue="effects" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="effects">Effects</TabsTrigger>
        <TabsTrigger value="edm">EDM Effects</TabsTrigger>
        <TabsTrigger value="eq">EQ</TabsTrigger>
      </TabsList>

      <TabsContent value="effects" className="mt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <EffectControl
            name="Reverb"
            value={effects.reverb || 30}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("reverb", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Delay"
            value={effects.delay || 15}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("delay", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Distortion"
            value={effects.distortion || 0}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("distortion", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Phaser"
            value={effects.phaser || 0}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("phaser", value)}
            disabled={disabled}
          />
        </div>
      </TabsContent>

      <TabsContent value="edm" className="mt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <EffectControl
            name="Filter"
            value={effects.filter || 50}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("filter", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Wobble"
            value={effects.wobble || 0}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("wobble", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Flanger"
            value={effects.flanger || 0}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("flanger", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Bit Crush"
            value={effects.bitcrush || 0}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("bitcrush", value)}
            disabled={disabled}
          />
        </div>
      </TabsContent>

      <TabsContent value="eq" className="mt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <EffectControl
            name="Low (Bass)"
            value={effects.low || 50}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("low", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Mid (Vocals)"
            value={effects.mid || 50}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("mid", value)}
            disabled={disabled}
          />
          <EffectControl
            name="High (Treble)"
            value={effects.high || 50}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("high", value)}
            disabled={disabled}
          />
          <EffectControl
            name="Presence"
            value={effects.presence || 40}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onEffectChange?.("presence", value)}
            disabled={disabled}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}

function EffectControl({ name, value, min, max, step, onChange, disabled = false }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm text-zinc-400">{name}</Label>
        <div className="flex items-center gap-2">
          <Switch
            id={`switch-${name}`}
            checked={value > 0}
            onCheckedChange={(checked) => {
              onChange?.(checked ? [value || min + (max - min) / 3] : [0])
            }}
            disabled={disabled}
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={onChange}
        disabled={disabled}
        className="[&>span]:bg-cyan-500"
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{min === 0 && name.includes("Low") ? "Less" : min}</span>
        <span className={value > 70 || value < 30 ? "text-cyan-400" : ""}>{value}</span>
        <span>{max === 100 && name.includes("High") ? "More" : max}</span>
      </div>
    </div>
  )
}
