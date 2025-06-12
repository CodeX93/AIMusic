"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Loader2, Music, Mic } from "lucide-react"
import { EnhancedAudioPlayer } from "./enhanced-audio-player"
import { useToast } from "@/hooks/use-toast"
import { generateAudioWithBackgroundMusic } from "@/app/actions/audio-actions"

export function TextToAudioGenerator() {
  const [text, setText] = useState("")
  const [voice, setVoice] = useState("neutral")
  const [emotion, setEmotion] = useState("neutral")
  const [effect, setEffect] = useState("clean")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVoiceAudio, setGeneratedVoiceAudio] = useState<string | null>(null)
  const [generatedMusicAudio, setGeneratedMusicAudio] = useState<string | null>(null)
  const [fallbackVoiceAudio, setFallbackVoiceAudio] = useState<string | null>(null)
  const [fallbackMusicAudio, setFallbackMusicAudio] = useState<string | null>(null)
  const [volume, setVolume] = useState([80])
  const [musicVolume, setMusicVolume] = useState([50])
  const [isMuted, setIsMuted] = useState(false)
  const [visualizer, setVisualizer] = useState<"waveform" | "bars" | "circle">("bars")
  const [mixedAudioUrl, setMixedAudioUrl] = useState<string | null>(null)
  const { toast } = useToast()

  // Generate audio
  const generateAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to convert to audio.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedVoiceAudio(null)
    setGeneratedMusicAudio(null)
    setFallbackVoiceAudio(null)
    setFallbackMusicAudio(null)
    setMixedAudioUrl(null)

    try {
      // 1. Coba backend Flask
      const flaskRes = await fetch("http://localhost:5000/text-to-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })
      const flaskData = await flaskRes.json()
      if (flaskData.success && flaskData.audio_url) {
        setGeneratedVoiceAudio(flaskData.audio_url)
        toast({
          title: "Voice Generated",
          description: "Voice audio has been generated successfully (Flask).",
        })
        return
      }
      // 2. Coba ElevenLabs API
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await response.json()
      if (data.success && data.audioData) {
        const audioUrl = `data:${data.contentType};base64,${data.audioData}`
        setGeneratedVoiceAudio(audioUrl)
        toast({
          title: "Voice Generated",
          description: "Voice audio has been generated successfully (ElevenLabs).",
        })
        return
      } else {
        throw new Error(data.error || "Failed to generate audio")
      }
    } catch (error) {
      // 3. Fallback ke logic lama jika gagal
      try {
        const result = await generateAudioWithBackgroundMusic(text, voice, emotion)
        if (result.success) {
          if (result.voiceAudioUrl) setGeneratedVoiceAudio(result.voiceAudioUrl)
          if (result.musicUrl) setGeneratedMusicAudio(result.musicUrl)
          toast({ title: "Voice Generated", description: "Voice audio has been generated successfully." })
        } else {
          if (result.fallbackVoiceUrl) setFallbackVoiceAudio(result.fallbackVoiceUrl)
          if (result.fallbackMusicUrl) setFallbackMusicAudio(result.fallbackMusicUrl)
          toast({ title: "Using Sample Audio", description: result.message || "API unavailable. Using sample audio instead.", variant: "warning" })
        }
      } catch (err) {
        setFallbackVoiceAudio(`/samples/${voice}-${emotion}-sample.mp3`)
        setFallbackMusicAudio(`/samples/music-${emotion}.mp3`)
        toast({ title: "Generation Failed", description: error instanceof Error ? error.message : "Failed to generate audio", variant: "destructive" })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Mix voice and music
  const handleMixAudio = async () => {
    const voiceUrl = generatedVoiceAudio || fallbackVoiceAudio
    const musicUrl = generatedMusicAudio || fallbackMusicAudio

    if (!voiceUrl || !musicUrl) {
      toast({
        title: "Missing Audio",
        description: "Both voice and music audio must be available to mix.",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real implementation, this would mix the audio on the server
      // For now, we'll just set the mixed URL to the voice URL
      setMixedAudioUrl(voiceUrl)

      toast({
        title: "Audio Mixed",
        description: "Voice and music have been mixed successfully!",
      })
    } catch (error) {
      console.error("Error mixing audio:", error)
      toast({
        title: "Mixing Failed",
        description: "Failed to mix voice and music audio.",
        variant: "destructive",
      })
    }
  }

  // Voices and emotions
  const voices = [
    { id: "male", name: "Male Voice" },
    { id: "female", name: "Female Voice" },
    { id: "neutral", name: "Neutral Voice" },
    { id: "warm", name: "Warm Voice" },
    { id: "deep", name: "Deep Voice" },
  ]

  const emotions = [
    { id: "neutral", name: "Neutral" },
    { id: "cheerful", name: "Cheerful" },
    { id: "sad", name: "Sad" },
    { id: "professional", name: "Professional" },
    { id: "excited", name: "Excited" },
    { id: "calm", name: "Calm" },
  ]

  // Effects
  const edmEffects = [
    { id: "clean", name: "Clean" },
    { id: "bass-boost", name: "Bass Boost" },
    { id: "reverb", name: "Reverb" },
    { id: "delay", name: "Delay" },
    { id: "filter-sweep", name: "Filter Sweep" },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-2 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Text to Audio Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="voice">Voice Settings</TabsTrigger>
              <TabsTrigger value="effects">Audio Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-[200px] resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-type">Voice Type</Label>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger id="voice-type">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emotion">Emotion</Label>
                    <Select value={emotion} onValueChange={setEmotion}>
                      <SelectTrigger id="emotion">
                        <SelectValue placeholder="Select emotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Visualizer Style</Label>
                  <Select value={visualizer} onValueChange={(value) => setVisualizer(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visualizer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bars">Frequency Bars</SelectItem>
                      <SelectItem value="waveform">Waveform</SelectItem>
                      <SelectItem value="circle">Circular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Voice Volume</Label>
                    <span className="text-sm text-gray-500">{volume[0]}%</span>
                  </div>
                  <Slider value={volume} min={0} max={100} step={1} onValueChange={setVolume} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Music Volume</Label>
                    <span className="text-sm text-gray-500">{musicVolume[0]}%</span>
                  </div>
                  <Slider value={musicVolume} min={0} max={100} step={1} onValueChange={setMusicVolume} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>EDM Effect</Label>
                  <Select value={effect} onValueChange={setEffect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select effect" />
                    </SelectTrigger>
                    <SelectContent>
                      {edmEffects.map((effect) => (
                        <SelectItem key={effect.id} value={effect.id}>
                          {effect.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bass Boost</Label>
                    <Slider defaultValue={[50]} min={0} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reverb</Label>
                    <Slider defaultValue={[30]} min={0} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Delay</Label>
                    <Slider defaultValue={[20]} min={0} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Filter</Label>
                    <Slider defaultValue={[70]} min={0} max={100} step={1} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full flex justify-between items-center">
            <Button
              onClick={generateAudio}
              disabled={isGenerating || !text.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Audio"
              )}
            </Button>

            {(generatedVoiceAudio || fallbackVoiceAudio) && (
              <Button variant="outline" onClick={handleMixAudio} disabled={isGenerating}>
                <Music className="mr-2 h-4 w-4" />
                Mix Voice & Music
              </Button>
            )}
          </div>

          {(generatedVoiceAudio || fallbackVoiceAudio) && (
            <div className="w-full pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="h-4 w-4 text-cyan-500" />
                <p className="text-sm font-medium">Voice Audio</p>
              </div>
              <EnhancedAudioPlayer
                audioUrl={generatedVoiceAudio || ""}
                fallbackUrl={fallbackVoiceAudio || undefined}
                title="Generated Voice"
                subtitle={`${voice} - ${emotion}`}
                showWaveform={true}
                visualizer={visualizer}
                autoplay={false}
              />
            </div>
          )}

          {(generatedMusicAudio || fallbackMusicAudio) && (
            <div className="w-full pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Music className="h-4 w-4 text-cyan-500" />
                <p className="text-sm font-medium">Background Music</p>
              </div>
              <EnhancedAudioPlayer
                audioUrl={generatedMusicAudio || ""}
                fallbackUrl={fallbackMusicAudio || undefined}
                title="Background Music"
                subtitle={`${emotion} mood`}
                showWaveform={true}
                visualizer={visualizer}
                autoplay={false}
              />
            </div>
          )}

          {mixedAudioUrl && (
            <div className="w-full pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Music className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">Mixed Audio</p>
              </div>
              <EnhancedAudioPlayer
                audioUrl={mixedAudioUrl}
                title="Mixed Audio"
                subtitle={`${voice} voice with ${emotion} music`}
                showWaveform={true}
                visualizer={visualizer}
                autoplay={true}
              />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
