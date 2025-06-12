"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EnhancedAudioPlayer } from "./enhanced-audio-player"
import { generateRemixTrack } from "@/app/actions/audio-actions"
import { useToast } from "@/hooks/use-toast"
import { Music, Wand2, Save, Share2, History, AlertTriangle, RefreshCw } from "lucide-react"
import { getGuaranteedFallback } from "@/lib/audio-format-handler"

export function AIRemixStudio() {
  const [isLoading, setIsLoading] = useState(false)
  const [remixDescription, setRemixDescription] = useState("")
  const [remixUrl, setRemixUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)
  const [genre, setGenre] = useState("edm")
  const [bpm, setBpm] = useState(128)
  const [quality, setQuality] = useState("high")
  const [seed, setSeed] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [autoplay, setAutoplay] = useState(true)
  const [remixTitle, setRemixTitle] = useState("AI Generated Remix")
  const [retryCount, setRetryCount] = useState(0)
  const [usedFallback, setUsedFallback] = useState(false)
  const [visualizer, setVisualizer] = useState<"waveform" | "bars" | "circle">("bars")
  const [emergencyMode, setEmergencyMode] = useState(false)

  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Genre descriptions for better user guidance
  const genreDescriptions = {
    edm: "Electronic Dance Music with energetic beats and synthesized sounds",
    house: "Four-on-the-floor beats with soulful influences and groovy basslines",
    techno: "Repetitive beats with minimal melodies and industrial sounds",
    trance: "Uplifting melodies with atmospheric pads and euphoric builds",
    dubstep: "Heavy bass drops with wobble effects and aggressive sound design",
    "drum-and-bass": "Fast breakbeats with heavy bass and energetic rhythms",
  }

  // Example prompts to help users get started
  const examplePrompts = [
    "Upbeat EDM track with strong bass and euphoric synth leads",
    "Deep house groove with soulful vocals and smooth chord progression",
    "Dark techno with industrial percussion and hypnotic rhythm",
    "Energetic dubstep with aggressive wobble bass and cinematic elements",
    "Melodic trance with uplifting arpeggios and emotional breakdown",
  ]

  const handleGenerateRemix = async () => {
    if (!remixDescription.trim()) {
      toast({
        title: "Description is required",
        description: "Please enter a description for your remix.",
        variant: "destructive",
      })
      descriptionRef.current?.focus()
      return
    }

    setIsLoading(true)
    setError(null)
    setUsedFallback(false)
    setEmergencyMode(false)

    // Prepare fallback URL based on genre
    const genreFallbackUrl = getGuaranteedFallback(genre)
    setFallbackUrl(genreFallbackUrl)

    try {
      // Generate remix using the server action
      const result = await generateRemixTrack(
        remixDescription,
        genre,
        typeof bpm === "string" ? Number.parseInt(bpm) : bpm,
        quality,
      )

      if (result.success && result.remixUrl) {
        // Update state with the generated remix
        setRemixUrl(result.remixUrl)
        setImageUrl(result.imageUrl || null)
        setFallbackUrl(result.fallbackUrl)

        // Set a title based on the description
        setRemixTitle(remixDescription.length > 30 ? `${remixDescription.substring(0, 30)}...` : remixDescription)

        toast({
          title: "Remix generated",
          description: "Your custom remix is ready to play!",
        })
      } else if (result.useFallback && result.fallbackUrl) {
        // Use fallback if API fails but fallback is available
        setRemixUrl(null)
        setFallbackUrl(result.fallbackUrl)
        setUsedFallback(true)

        toast({
          title: "Using fallback audio",
          description: result.message || "API generation failed. Using a fallback sample instead.",
          variant: "warning",
        })

        // Set error message for display
        if (result.errorDetails) {
          setError(`API Error: ${result.errorDetails}`)
        } else {
          setError("The audio generation API returned an invalid response. Using fallback audio instead.")
        }
      } else {
        throw new Error(result.message || "Failed to generate remix")
      }
    } catch (error) {
      console.error("Error in handleGenerateRemix:", error)

      // Format the error message
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(`${errorMessage}`)

      // Show error toast
      toast({
        title: "Error generating remix",
        description: errorMessage,
        variant: "destructive",
      })

      // Set fallback URL if we have one
      if (fallbackUrl) {
        setUsedFallback(true)
        toast({
          title: "Using fallback audio",
          description: "Using a fallback sample due to generation error.",
          variant: "warning",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    setError(null)
    setEmergencyMode(false)
    handleGenerateRemix()
  }, [])

  const handleUseExample = useCallback((example: string) => {
    setRemixDescription(example)
    if (descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [])

  const handleRandomSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 1000000))
  }, [])

  const handleSaveRemix = useCallback(() => {
    // This would save the remix to the user's library in a real app
    toast({
      title: "Remix saved",
      description: "Your remix has been saved to your library.",
    })
  }, [toast])

  const handleShareRemix = useCallback(() => {
    // This would share the remix in a real app
    toast({
      title: "Remix shared",
      description: "Your remix has been shared.",
    })
  }, [toast])

  const handleEmergencyFallback = useCallback(() => {
    // Force use of guaranteed fallback
    setEmergencyMode(true)
    setUsedFallback(true)
    setRemixUrl(null)
    setFallbackUrl(getGuaranteedFallback(genre))

    toast({
      title: "Emergency fallback activated",
      description: "Using guaranteed working audio sample.",
      variant: "default",
    })
  }, [genre, toast])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-cyan-500" />
          <CardTitle>AI Remix Studio</CardTitle>
        </div>
        <CardDescription>Create high-quality EDM remixes with AI technology</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              {usedFallback && (
                <p className="mt-2 text-sm">
                  Using fallback audio sample instead. You can try again or adjust your settings.
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleRetry} disabled={isLoading}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Retry Generation
                </Button>

                <Button variant="destructive" size="sm" onClick={handleEmergencyFallback} disabled={isLoading}>
                  <AlertTriangle className="mr-2 h-4 w-4" /> Emergency Fallback
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Remix</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remix-description">Remix Description</Label>
                <Textarea
                  id="remix-description"
                  ref={descriptionRef}
                  placeholder="Describe your remix (e.g., 'Upbeat EDM remix with strong bass and synth leads')"
                  value={remixDescription}
                  onChange={(e) => setRemixDescription(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleUseExample(prompt)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-2 py-1 rounded-full transition-colors"
                    >
                      {prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select defaultValue={genre} onValueChange={setGenre} disabled={isLoading}>
                    <SelectTrigger id="genre">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edm">EDM</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="techno">Techno</SelectItem>
                      <SelectItem value="trance">Trance</SelectItem>
                      <SelectItem value="dubstep">Dubstep</SelectItem>
                      <SelectItem value="drum-and-bass">Drum & Bass</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">{genreDescriptions[genre as keyof typeof genreDescriptions]}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bpm">BPM: {bpm}</Label>
                  <Slider
                    id="bpm"
                    value={[bpm]}
                    min={80}
                    max={180}
                    step={1}
                    onValueChange={(value) => setBpm(value[0])}
                    disabled={isLoading}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Slow (80)</span>
                    <span>Fast (180)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-options"
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                    disabled={isLoading}
                  />
                  <Label htmlFor="advanced-options">Show advanced options</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="autoplay" checked={autoplay} onCheckedChange={setAutoplay} disabled={isLoading} />
                  <Label htmlFor="autoplay">Autoplay when ready</Label>
                </div>
              </div>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="quality">Audio Quality</Label>
                    <Select defaultValue={quality} onValueChange={setQuality} disabled={isLoading}>
                      <SelectTrigger id="quality">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (Faster)</SelectItem>
                        <SelectItem value="high">High (Recommended)</SelectItem>
                        <SelectItem value="ultra">Ultra (Slower)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="seed">Seed (Optional)</Label>
                      <Button variant="outline" size="sm" onClick={handleRandomSeed} disabled={isLoading}>
                        Random
                      </Button>
                    </div>
                    <Input
                      id="seed"
                      type="number"
                      placeholder="Random seed for generation"
                      value={seed || ""}
                      onChange={(e) => setSeed(e.target.value ? Number.parseInt(e.target.value) : null)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">Use the same seed to recreate similar results</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="visualizer">Visualizer Style</Label>
                    <Select
                      defaultValue={visualizer}
                      onValueChange={(value) => setVisualizer(value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="visualizer">
                        <SelectValue placeholder="Select visualizer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bars">Frequency Bars</SelectItem>
                        <SelectItem value="waveform">Waveform</SelectItem>
                        <SelectItem value="circle">Circular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateRemix}
                className="w-full"
                disabled={isLoading || !remixDescription.trim()}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Remix
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Remix Title</Label>
                  <Input
                    placeholder="Enter a title for your remix"
                    value={remixTitle}
                    onChange={(e) => setRemixTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Remix Length</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (15-30 sec)</SelectItem>
                      <SelectItem value="medium">Medium (30-60 sec)</SelectItem>
                      <SelectItem value="long">Long (60-90 sec)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Structure</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Intro, Build, Drop, Outro)</SelectItem>
                    <SelectItem value="extended">Extended (Intro, Build, Drop, Breakdown, Drop, Outro)</SelectItem>
                    <SelectItem value="minimal">Minimal (Build, Drop, Outro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sound Characteristics</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Bass Intensity</Label>
                    <Slider defaultValue={[70]} max={100} step={1} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Brightness</Label>
                    <Slider defaultValue={[60]} max={100} step={1} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Complexity</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Energy</Label>
                    <Slider defaultValue={[80]} max={100} step={1} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {(remixUrl || fallbackUrl) && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Generated Remix
                {usedFallback && (
                  <span className="ml-2 text-xs text-amber-500 font-normal">(Using fallback audio)</span>
                )}
                {emergencyMode && <span className="ml-2 text-xs text-red-500 font-normal">(Emergency Mode)</span>}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveRemix}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareRemix}>
                  <Share2 className="h-4 w-4 mr-1" /> Share
                </Button>
              </div>
            </div>

            <EnhancedAudioPlayer
              audioUrl={remixUrl || ""}
              fallbackUrl={fallbackUrl || undefined}
              title={remixTitle}
              subtitle={`${genre.charAt(0).toUpperCase() + genre.slice(1)} - ${bpm} BPM`}
              imageUrl={imageUrl || undefined}
              showWaveform={true}
              autoplay={autoplay}
              visualizer={visualizer}
              genre={genre}
              onError={(error) => {
                console.error("Player error:", error)
                setError(`Audio playback error: ${error.message}`)
                setUsedFallback(true)
              }}
              key={`player-${retryCount}`} // Force re-render on retry
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
        <p className="text-sm text-gray-500">Powered by AI for high-quality audio generation</p>
        <Button variant="ghost" size="sm">
          <History className="h-4 w-4 mr-1" /> View History
        </Button>
      </CardFooter>
    </Card>
  )
}
