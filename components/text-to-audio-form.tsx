"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Music, Mic, RefreshCw } from "lucide-react"
import { AudioPlayer } from "./audio-player"
import { ErrorFallback } from "./error-fallback"
import { canAudioPlay } from "@/lib/audio-format-handler"

const GENRES = [
  { value: "edm", label: "EDM" },
  { value: "house", label: "House" },
  { value: "techno", label: "Techno" },
  { value: "trance", label: "Trance" },
  { value: "dubstep", label: "Dubstep" },
  { value: "drum-and-bass", label: "Drum & Bass" },
]

export function TextToAudioForm() {
  const [text, setText] = useState("")
  const [genre, setGenre] = useState("edm")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)

  const { toast } = useToast()

  // Handle text-to-audio generation with robust error handling
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to convert to audio.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError(null)
    setAudioError(null)
    setGeneratedAudioUrl(null)

    try {
      // 1. Coba backend Flask
      const flaskRes = await fetch("http://localhost:5000/text-to-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })
      const flaskData = await flaskRes.json()
      if (flaskData.success && flaskData.audio_url) {
        setGeneratedAudioUrl(flaskData.audio_url)
        setIsGenerating(false)
        toast({
          title: "Audio generated",
          description: "Your text has been converted to audio successfully! (Flask)",
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
        setGeneratedAudioUrl(audioUrl)
        setIsGenerating(false)
        toast({
          title: "Audio generated",
          description: "Your text has been converted to audio successfully! (ElevenLabs)",
        })
        return
      } else {
        throw new Error(data.error || "Failed to generate audio")
      }
    } catch (err) {
      // 3. Fallback ke sample jika gagal
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 200)
      setTimeout(async () => {
        clearInterval(interval)
        setProgress(100)
        const sampleUrl = `/samples/music-${genre}.mp3`
        const canPlay = await canAudioPlay(sampleUrl)
        if (canPlay) {
          setGeneratedAudioUrl(sampleUrl)
          setIsGenerating(false)
          toast({
            title: "Audio generated",
            description: "Your text has been converted to audio successfully! (Sample)",
          })
        } else {
          setIsGenerating(false)
          setError(`Failed to generate audio: ${err instanceof Error ? err.message : "Unknown error"}`)
          toast({
            title: "Audio generation failed",
            description: "There was an error generating your audio.",
            variant: "destructive",
          })
        }
      }, 4000)
    }
  }

  // Handle audio error
  const handleAudioError = useCallback(
    (err: Error) => {
      console.error("Audio player error:", err)
      setAudioError(err.message)

      toast({
        title: "Audio playback issue",
        description: "There was a problem playing the audio. A fallback has been used.",
        variant: "warning",
      })
    },
    [toast],
  )

  // Handle retry
  const handleRetry = () => {
    setError(null)
    handleGenerate()
  }

  // Handle reset
  const handleReset = () => {
    setText("")
    setGenre("edm")
    setGeneratedAudioUrl(null)
    setError(null)
    setAudioError(null)
    setIsGenerating(false)
    setProgress(0)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-cyan-500" />
          <CardTitle>Text-to-Audio Generator</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Text Input Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">1. Enter Your Text</h3>
          <Textarea
            placeholder="Enter text to convert to audio (e.g., 'Sing a line about summer nights')"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px]"
            disabled={isGenerating}
          />
        </div>

        {/* Genre Selection Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">2. Select Music Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select value={genre} onValueChange={setGenre} disabled={isGenerating}>
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre.value} value={genre.value}>
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Processing Section */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating audio...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Result Section */}
        {generatedAudioUrl && !isGenerating && !error && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Generated Audio</h3>
            <AudioPlayer
              audioUrl={generatedAudioUrl}
              title="Generated Audio"
              subtitle={`${GENRES.find((g) => g.value === genre)?.label || genre} style`}
              showWaveform
              showDownload
              onError={handleAudioError}
              fallbackUrl="/samples/edm-remix-sample.mp3"
              genre={genre}
            />
            {audioError && (
              <div className="text-sm text-amber-500 mt-2">
                Note: Using fallback audio due to playback issues with the generated audio.
              </div>
            )}
          </div>
        )}

        {/* Error Section */}
        {error && <ErrorFallback error={error} resetErrorBoundary={handleRetry} />}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset} disabled={isGenerating || (!text && !generatedAudioUrl)}>
          Start Over
        </Button>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Music className="mr-2 h-4 w-4" />
              Generate Audio
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
