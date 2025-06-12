"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Download,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  Music,
  Mic,
  RefreshCw,
  AlertCircle,
  Wand2,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateAudio } from "@/app/actions/audio-actions"
import { Progress } from "@/components/ui/progress"

export default function TextToAudioPage() {
  // State for text-to-audio
  const [text, setText] = useState("")
  const [voice, setVoice] = useState("neutral")
  const [style, setStyle] = useState("neutral")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVoiceAudio, setGeneratedVoiceAudio] = useState<string | null>(null)
  const [fallbackVoiceAudio, setFallbackVoiceAudio] = useState<string | null>(null)
  const [generatedMusicAudio, setGeneratedMusicAudio] = useState<string | null>(null)
  const [fallbackMusicAudio, setFallbackMusicAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [musicVolume, setMusicVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
  const [gainNode, setGainNode] = useState<GainNode | null>(null)
  const [musicGainNode, setMusicGainNode] = useState<GainNode | null>(null)
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null)
  const [musicSource, setMusicSource] = useState<MediaElementAudioSourceNode | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [currentBpm, setCurrentBpm] = useState(128)
  const [selectedGenre, setSelectedGenre] = useState("electronic")
  const [isMixing, setIsMixing] = useState(false)
  const [mixedAudioUrl, setMixedAudioUrl] = useState<string | null>(null)
  const [voiceLoaded, setVoiceLoaded] = useState(false)
  const [musicLoaded, setMusicLoaded] = useState(false)
  const [voiceLoadError, setVoiceLoadError] = useState(false)
  const [musicLoadError, setMusicLoadError] = useState(false)
  const [isRetryingVoice, setIsRetryingVoice] = useState(false)
  const [isRetryingMusic, setIsRetryingMusic] = useState(false)
  const [usingFallbackVoice, setUsingFallbackVoice] = useState(false)
  const [usingFallbackMusic, setUsingFallbackMusic] = useState(false)
  const [voiceLoadingProgress, setVoiceLoadingProgress] = useState(0)
  const [musicLoadingProgress, setMusicLoadingProgress] = useState(0)
  const [quality, setQuality] = useState("high")
  const [effects, setEffects] = useState({
    bassBoost: 70,
    reverb: 40,
    delay: 20,
    filter: 50,
    wobble: 0,
    distortion: 0,
    pitch: 50,
    speed: 50,
  })

  // References for audio elements and canvas
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)
  const mixedAudioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  // Voice options
  const voices = [
    { id: "male", name: "Male Voice" },
    { id: "female", name: "Female Voice" },
    { id: "neutral", name: "Neutral Voice" },
    { id: "warm", name: "Warm Voice" },
    { id: "deep", name: "Deep Voice" },
  ]

  // Music genre options
  const genres = [
    { id: "electronic", name: "Electronic" },
    { id: "house", name: "House" },
    { id: "dubstep", name: "Dubstep" },
    { id: "trance", name: "Trance" },
    { id: "hiphop", name: "Hip Hop" },
    { id: "rock", name: "Rock" },
    { id: "ambient", name: "Ambient" },
    { id: "jazz", name: "Jazz" },
  ]

  // Emotion/style options
  const styles = [
    { id: "neutral", name: "Neutral" },
    { id: "cheerful", name: "Cheerful" },
    { id: "sad", name: "Sad" },
    { id: "professional", name: "Professional" },
    { id: "excited", name: "Excited" },
    { id: "calm", name: "Calm" },
  ]

  // Quality options
  const qualityOptions = [
    { id: "low", name: "Low (Faster)" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High (Better)" },
  ]

  // Audio effect presets
  const presets = [
    {
      id: "clean",
      name: "Clean",
      effects: {
        bassBoost: 50,
        reverb: 20,
        delay: 10,
        filter: 80,
        wobble: 0,
        distortion: 0,
        pitch: 50,
        speed: 50,
      },
      bpm: 128,
    },
    {
      id: "dubstep",
      name: "Dubstep",
      effects: {
        bassBoost: 80,
        reverb: 20,
        delay: 15,
        filter: 30,
        wobble: 80,
        distortion: 60,
        pitch: 45,
        speed: 50,
      },
      bpm: 140,
    },
    {
      id: "trance",
      name: "Trance",
      effects: {
        bassBoost: 65,
        reverb: 70,
        delay: 50,
        filter: 60,
        wobble: 0,
        distortion: 0,
        pitch: 55,
        speed: 55,
      },
      bpm: 138,
    },
    {
      id: "house",
      name: "House",
      effects: {
        bassBoost: 70,
        reverb: 40,
        delay: 20,
        filter: 70,
        wobble: 0,
        distortion: 0,
        pitch: 50,
        speed: 50,
      },
      bpm: 124,
    },
  ]

  // Example prompts
  const examplePrompts = [
    "Welcome to the ultimate EDM experience",
    "Drop the bass right now",
    "Feel the rhythm, feel the vibe",
    "Let the music take control",
    "This is Composition Converter in the house",
  ]

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        const context = new AudioContext()
        const analyser = context.createAnalyser()
        analyser.fftSize = 256
        const gain = context.createGain()
        const musicGain = context.createGain()

        gain.connect(context.destination)
        musicGain.connect(context.destination)
        analyser.connect(gain)

        setAudioContext(context)
        setAnalyserNode(analyser)
        setGainNode(gain)
        setMusicGainNode(musicGain)

        return () => {
          if (context.state !== "closed") {
            context.close()
          }
        }
      } catch (error) {
        console.error("Error initializing Web Audio API:", error)
      }
    }
  }, [])

  // Create audio elements
  useEffect(() => {
    // Create voice audio element if it doesn't exist
    if (!voiceAudioRef.current) {
      const voiceAudio = new Audio()

      // Add event listeners
      voiceAudio.addEventListener("canplaythrough", () => {
        console.log("Voice audio loaded successfully")
        setVoiceLoaded(true)
        setVoiceLoadError(false)
        setVoiceLoadingProgress(100)
      })

      voiceAudio.addEventListener("progress", (e) => {
        try {
          if (voiceAudio.duration) {
            const loadedTime = Array.from(voiceAudio.buffered.values()).reduce(
              (acc, range) => acc + (range.end - range.start),
              0,
            )
            const progress = Math.min(100, Math.round((loadedTime / voiceAudio.duration) * 100))
            setVoiceLoadingProgress(progress)
          }
        } catch (err) {
          console.warn("Error calculating voice loading progress:", err)
        }
      })

      voiceAudio.addEventListener("error", (e) => {
        console.error("Voice audio error:", e)
        setVoiceLoadError(true)
        setVoiceLoadingProgress(0)

        // Try fallback if available
        if (fallbackVoiceAudio && !usingFallbackVoice) {
          tryFallbackVoice()
        } else {
          toast({
            title: "Voice Audio Error",
            description: "Failed to load voice audio. Please try again or use a different voice type.",
            variant: "destructive",
          })
        }
      })

      voiceAudio.addEventListener("ended", () => {
        setIsPlaying(false)
      })

      voiceAudioRef.current = voiceAudio
    }

    // Create music audio element if it doesn't exist
    if (!musicAudioRef.current) {
      const musicAudio = new Audio()
      musicAudio.loop = true

      // Add event listeners
      musicAudio.addEventListener("canplaythrough", () => {
        console.log("Music audio loaded successfully")
        setMusicLoaded(true)
        setMusicLoadError(false)
        setMusicLoadingProgress(100)
      })

      musicAudio.addEventListener("progress", (e) => {
        try {
          if (musicAudio.duration) {
            const loadedTime = Array.from(musicAudio.buffered.values()).reduce(
              (acc, range) => acc + (range.end - range.start),
              0,
            )
            const progress = Math.min(100, Math.round((loadedTime / musicAudio.duration) * 100))
            setMusicLoadingProgress(progress)
          }
        } catch (err) {
          console.warn("Error calculating music loading progress:", err)
        }
      })

      musicAudio.addEventListener("error", (e) => {
        console.error("Music audio error:", e)
        setMusicLoadError(true)
        setMusicLoadingProgress(0)

        // Try fallback if available
        if (fallbackMusicAudio && !usingFallbackMusic) {
          tryFallbackMusic()
        } else {
          toast({
            title: "Music Audio Error",
            description: "Failed to load music audio. Please try again or use a different genre.",
            variant: "destructive",
          })
        }
      })

      musicAudioRef.current = musicAudio
    }

    return () => {
      // Cleanup
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause()
        voiceAudioRef.current.src = ""
      }
      if (musicAudioRef.current) {
        musicAudioRef.current.pause()
        musicAudioRef.current.src = ""
      }
    }
  }, [fallbackVoiceAudio, fallbackMusicAudio, usingFallbackVoice, usingFallbackMusic])

  // Try fallback voice
  const tryFallbackVoice = useCallback(() => {
    if (!voiceAudioRef.current || !fallbackVoiceAudio) return

    setIsRetryingVoice(true)
    setUsingFallbackVoice(true)
    setVoiceLoaded(false)
    setVoiceLoadingProgress(0)

    console.log(`Trying fallback voice URL: ${fallbackVoiceAudio}`)

    voiceAudioRef.current.src = fallbackVoiceAudio
    voiceAudioRef.current.load()

    toast({
      title: "Retrying Voice",
      description: "Using fallback voice sample...",
    })

    setTimeout(() => {
      setIsRetryingVoice(false)
    }, 1000)
  }, [fallbackVoiceAudio])

  // Try fallback music
  const tryFallbackMusic = useCallback(() => {
    if (!musicAudioRef.current || !fallbackMusicAudio) return

    setIsRetryingMusic(true)
    setUsingFallbackMusic(true)
    setMusicLoaded(false)
    setMusicLoadingProgress(0)

    console.log(`Trying fallback music URL: ${fallbackMusicAudio}`)

    musicAudioRef.current.src = fallbackMusicAudio
    musicAudioRef.current.load()

    toast({
      title: "Retrying Music",
      description: "Using fallback music sample...",
    })

    setTimeout(() => {
      setIsRetryingMusic(false)
    }, 1000)
  }, [fallbackMusicAudio])

  // Set voice audio source when generated
  useEffect(() => {
    if (generatedVoiceAudio && voiceAudioRef.current) {
      setUsingFallbackVoice(false)
      voiceAudioRef.current.src = generatedVoiceAudio
      voiceAudioRef.current.load()
      setVoiceLoaded(false)
      setVoiceLoadError(false)
      setVoiceLoadingProgress(0)
    }
  }, [generatedVoiceAudio])

  // Set music audio source when generated
  useEffect(() => {
    if (generatedMusicAudio && musicAudioRef.current) {
      setUsingFallbackMusic(false)
      musicAudioRef.current.src = generatedMusicAudio
      musicAudioRef.current.load()
      setMusicLoaded(false)
      setMusicLoadError(false)
      setMusicLoadingProgress(0)
    }
  }, [generatedMusicAudio])

  // Connect voice audio element to Web Audio API when loaded
  useEffect(() => {
    if (
      voiceAudioRef.current &&
      audioContext &&
      analyserNode &&
      gainNode &&
      (generatedVoiceAudio || fallbackVoiceAudio) &&
      voiceLoaded
    ) {
      // Disconnect previous source if exists
      if (audioSource) {
        try {
          audioSource.disconnect()
        } catch (error) {
          console.error("Error disconnecting audio source:", error)
        }
      }

      try {
        // Create new source from audio element
        const source = audioContext.createMediaElementSource(voiceAudioRef.current)

        // Apply effects
        applyAudioEffects(source)

        setAudioSource(source)
      } catch (error) {
        console.error("Error connecting voice audio to Web Audio API:", error)
        // If we get an "already connected" error, we can ignore it
        if (error instanceof DOMException && error.name === "InvalidAccessError") {
          console.log("Audio element already connected to a different AudioNode, ignoring...")
        } else {
          toast({
            title: "Audio Processing Error",
            description: "There was an error processing the voice audio. Effects may not work properly.",
            variant: "destructive",
          })
        }
      }
    }

    return () => {
      if (audioSource) {
        try {
          audioSource.disconnect()
        } catch (error) {
          console.error("Error disconnecting audio source during cleanup:", error)
        }
      }
    }
  }, [generatedVoiceAudio, fallbackVoiceAudio, audioContext, analyserNode, gainNode, voiceLoaded, audioSource])

  // Connect music audio element to Web Audio API when loaded
  useEffect(() => {
    if (
      musicAudioRef.current &&
      audioContext &&
      musicGainNode &&
      (generatedMusicAudio || fallbackMusicAudio) &&
      musicLoaded
    ) {
      // Disconnect previous source if exists
      if (musicSource) {
        try {
          musicSource.disconnect()
        } catch (error) {
          console.error("Error disconnecting music source:", error)
        }
      }

      try {
        // Create new source from audio element
        const source = audioContext.createMediaElementSource(musicAudioRef.current)

        // Connect to music gain node
        source.connect(musicGainNode)

        setMusicSource(source)
      } catch (error) {
        console.error("Error connecting music audio to Web Audio API:", error)
        // If we get an "already connected" error, we can ignore it
        if (error instanceof DOMException && error.name === "InvalidAccessError") {
          console.log("Music element already connected to a different AudioNode, ignoring...")
        } else {
          toast({
            title: "Music Processing Error",
            description: "There was an error processing the music audio. Volume control may not work properly.",
            variant: "warning",
          })
        }
      }
    }

    return () => {
      if (musicSource) {
        try {
          musicSource.disconnect()
        } catch (error) {
          console.error("Error disconnecting music source:", error)
        }
      }
    }
  }, [generatedMusicAudio, fallbackMusicAudio, audioContext, musicGainNode, musicLoaded, musicSource])

  // Audio visualization
  useEffect(() => {
    if (!analyserNode || !canvasRef.current || !isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!ctx || !analyserNode) return

      analyserNode.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Gradient based on frequency
        const hue = (i / bufferLength) * 180 + 180 // Cyan to blue range
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyserNode, isPlaying])

  // Apply audio effects to source
  const applyAudioEffects = (source: MediaElementAudioSourceNode) => {
    if (!audioContext || !analyserNode || !gainNode) return

    // Create effect nodes
    const bassBoost = audioContext.createBiquadFilter()
    bassBoost.type = "lowshelf"
    bassBoost.frequency.value = 100
    bassBoost.gain.value = (effects.bassBoost - 50) * 0.5

    const filter = audioContext.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 20000 * (effects.filter / 100)
    filter.Q.value = 1

    const delay = audioContext.createDelay(5.0)
    delay.delayTime.value = (effects.delay / 100) * 0.5

    const delayGain = audioContext.createGain()
    delayGain.gain.value = effects.delay / 200

    const distortion = audioContext.createWaveShaper()
    if (effects.distortion > 0) {
      const curve = createDistortionCurve(effects.distortion * 5)
      distortion.curve = curve
    }

    // Connect nodes
    source.connect(bassBoost)
    bassBoost.connect(filter)
    filter.connect(distortion)

    // Main path
    distortion.connect(analyserNode)

    // Delay path
    distortion.connect(delay)
    delay.connect(delayGain)
    delayGain.connect(analyserNode)

    // Create wobble effect if enabled
    if (effects.wobble > 0) {
      const lfo = audioContext.createOscillator()
      lfo.type = "sine"
      lfo.frequency.value = (currentBpm / 240) * (0.5 + (effects.wobble / 100) * 2)

      const lfoGain = audioContext.createGain()
      lfoGain.gain.value = 500 + (effects.wobble / 100) * 7500

      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)
      lfo.start()
    }
  }

  // Create distortion curve
  const createDistortionCurve = (amount: number) => {
    const samples = 44100
    const curve = new Float32Array(samples)
    const deg = Math.PI / 180

    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
    }

    return curve
  }

  // Update voice volume
  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = isMuted ? 0 : volume / 100
    }

    if (voiceAudioRef.current) {
      voiceAudioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted, gainNode])

  // Update music volume
  useEffect(() => {
    if (musicGainNode) {
      musicGainNode.gain.value = isMuted ? 0 : musicVolume / 100
    }

    if (musicAudioRef.current) {
      musicAudioRef.current.volume = isMuted ? 0 : musicVolume / 100
    }
  }, [musicVolume, isMuted, musicGainNode])

  // Handle voice volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  // Handle music volume change
  const handleMusicVolumeChange = (value: number[]) => {
    setMusicVolume(value[0])
  }

  // Handle effect change
  const handleEffectChange = (effect: keyof typeof effects, value: number[]) => {
    setEffects((prev) => ({
      ...prev,
      [effect]: value[0],
    }))
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Handle play/pause
  const togglePlay = () => {
    if (mixedAudioUrl && mixedAudioRef.current) {
      if (isPlaying) {
        mixedAudioRef.current.pause()
      } else {
        mixedAudioRef.current.play().catch((error) => {
          console.error("Playback failed:", error)
          toast({
            title: "Playback Error",
            description: "Couldn't play the mixed audio. Please try again.",
            variant: "destructive",
          })
        })
      }
      setIsPlaying(!isPlaying)
      return
    }

    if (!voiceAudioRef.current || (!generatedVoiceAudio && !fallbackVoiceAudio) || !voiceLoaded) return

    if (isPlaying) {
      voiceAudioRef.current.pause()
      if (musicAudioRef.current && (generatedMusicAudio || fallbackMusicAudio) && musicLoaded) {
        musicAudioRef.current.pause()
      }
      setIsPlaying(false)
    } else {
      // Resume audio context if suspended
      if (audioContext?.state === "suspended") {
        audioContext.resume()
      }

      // Play voice audio
      voiceAudioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
          // Play music audio if available
          if (musicAudioRef.current && (generatedMusicAudio || fallbackMusicAudio) && musicLoaded) {
            musicAudioRef.current.currentTime = 0 // Start from beginning
            musicAudioRef.current
              .play()
              .then(() => {
                console.log("Music playback started successfully")
              })
              .catch((error) => {
                console.error("Music playback failed:", error)
                toast({
                  title: "Music Playback Error",
                  description: "Couldn't play the background music. Voice will play without music.",
                  variant: "destructive",
                })
              })
          }
        })
        .catch((error) => {
          console.error("Voice playback failed:", error)
          toast({
            title: "Playback Error",
            description: "Couldn't play the voice audio. Please try again.",
            variant: "destructive",
          })
        })
    }
  }

  // Apply preset
  const applyPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)

    if (preset) {
      setActivePreset(preset.name)
      setEffects(preset.effects)
      setCurrentBpm(preset.bpm)

      toast({
        title: "Preset Applied",
        description: `${preset.name} effect has been applied!`,
      })
    }
  }

  // Generate audio
  const handleGenerateAudio = async () => {
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
    setFallbackVoiceAudio(null)
    setGeneratedMusicAudio(null)
    setFallbackMusicAudio(null)
    setMixedAudioUrl(null)
    setVoiceLoaded(false)
    setMusicLoaded(false)
    setVoiceLoadError(false)
    setMusicLoadError(false)
    setUsingFallbackVoice(false)
    setUsingFallbackMusic(false)
    setVoiceLoadingProgress(0)
    setMusicLoadingProgress(0)
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
        const result = await generateAudio({ prompt: text, voice, style, quality })
        if (result.success && result.audioUrl) {
          setGeneratedVoiceAudio(result.audioUrl)
          toast({ title: "Voice Generated", description: "Voice audio has been generated successfully." })
        } else if (result.fallbackUrl) {
          setUsingFallbackVoice(true)
          setGeneratedVoiceAudio(result.fallbackUrl)
          toast({ title: "Using Sample Voice", description: "Voice generation API unavailable. Using a sample voice instead.", variant: "warning" })
        }
        if (result.musicUrl) {
          setGeneratedMusicAudio(result.musicUrl)
          toast({ title: "Music Generated", description: "Background music has been generated successfully." })
        } else if (result.fallbackMusicUrl) {
          setUsingFallbackMusic(true)
          setGeneratedMusicAudio(result.fallbackMusicUrl)
          toast({ title: "Using Sample Music", description: "Music generation API unavailable. Using a sample music instead.", variant: "warning" })
        }
      } catch (err) {
        setUsingFallbackVoice(true)
        setGeneratedVoiceAudio(`/samples/sample-neutral.mp3`)
        setUsingFallbackMusic(true)
        setGeneratedMusicAudio(`/samples/music-neutral.mp3`)
        toast({ title: "Generation Failed", description: error instanceof Error ? error.message : "Failed to generate audio", variant: "destructive" })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Mix voice and music into a single audio file
  const handleMixAudio = async () => {
    const currentVoiceUrl = usingFallbackVoice ? fallbackVoiceAudio : generatedVoiceAudio
    const currentMusicUrl = usingFallbackMusic ? fallbackMusicAudio : generatedMusicAudio

    if (!currentVoiceUrl || !currentMusicUrl || !voiceLoaded || !musicLoaded) {
      toast({
        title: "Missing Audio",
        description: "Both voice and music audio must be loaded successfully first.",
        variant: "destructive",
      })
      return
    }

    setIsMixing(true)

    try {
      // Create offline audio context for mixing
      const offlineCtx = new OfflineAudioContext({
        numberOfChannels: 2,
        length: 44100 * 30, // 30 seconds at 44.1kHz
        sampleRate: 44100,
      })

      // Load voice audio
      const voiceResponse = await fetch(currentVoiceUrl)
      const voiceArrayBuffer = await voiceResponse.arrayBuffer()
      const voiceAudioBuffer = await offlineCtx.decodeAudioData(voiceArrayBuffer)

      // Load music audio
      const musicResponse = await fetch(currentMusicUrl)
      const musicArrayBuffer = await musicResponse.arrayBuffer()
      const musicAudioBuffer = await offlineCtx.decodeAudioData(musicArrayBuffer)

      // Create source nodes
      const voiceSource = offlineCtx.createBufferSource()
      voiceSource.buffer = voiceAudioBuffer

      const musicSource = offlineCtx.createBufferSource()
      musicSource.buffer = musicAudioBuffer

      // Create gain nodes for volume control
      const voiceGain = offlineCtx.createGain()
      voiceGain.gain.value = volume / 100

      const musicGain = offlineCtx.createGain()
      musicGain.gain.value = musicVolume / 100

      // Connect nodes
      voiceSource.connect(voiceGain)
      musicSource.connect(musicGain)
      voiceGain.connect(offlineCtx.destination)
      musicGain.connect(offlineCtx.destination)

      // Start playback at time 0
      voiceSource.start(0)
      musicSource.start(0)

      // Render audio
      const renderedBuffer = await offlineCtx.startRendering()

      // Convert to WAV
      const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length)

      // Create URL for the mixed audio
      const mixedUrl = URL.createObjectURL(wavBlob)
      setMixedAudioUrl(mixedUrl)

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
    } finally {
      setIsMixing(false)
    }
  }

  // Convert AudioBuffer to WAV Blob
  const bufferToWave = (abuffer: AudioBuffer, len: number) => {
    const numOfChan = abuffer.numberOfChannels
    const length = len * numOfChan * 2 + 44
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    const channels = []
    let i
    let sample
    let offset = 0
    let pos = 0

    // Write WAVE header
    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8) // file length - 8
    setUint32(0x45564157) // "WAVE"
    setUint32(0x20746d66) // "fmt " chunk
    setUint32(16) // length = 16
    setUint16(1) // PCM (uncompressed)
    setUint16(numOfChan)
    setUint32(abuffer.sampleRate)
    setUint32(abuffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
    setUint16(numOfChan * 2) // block-align
    setUint16(16) // 16-bit
    setUint32(0x61746164) // "data" chunk
    setUint32(length - pos - 4) // chunk length

    // Write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i))
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])) // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // scale to 16-bit signed int
        view.setInt16(pos, sample, true) // write 16-bit sample
        pos += 2
      }
      offset++ // next source sample
    }

    // Helper function
    function setUint16(data: number) {
      view.setUint16(pos, data, true)
      pos += 2
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true)
      pos += 4
    }

    return new Blob([buffer], { type: "audio/wav" })
  }

  // Handle download
  const handleDownload = () => {
    // If we have mixed audio, download that
    if (mixedAudioUrl) {
      const a = document.createElement("a")
      a.href = mixedAudioUrl
      a.download = `Riffusion-Mixed-${voice}-${style}.wav`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)

        toast({
          title: "Download Started",
          description: "Your mixed audio is downloading...",
        })
      }, 100)
      return
    }

    // Otherwise download voice audio
    const currentVoiceUrl = usingFallbackVoice ? fallbackVoiceAudio : generatedVoiceAudio
    if (!currentVoiceUrl) return

    // For data URL, we need to convert to Blob first
    if (currentVoiceUrl.startsWith("data:")) {
      // Extract base64 data
      const base64Data = currentVoiceUrl.split(",")[1]
      // Convert to blob
      const blob = base64ToBlob(base64Data, "audio/mpeg")
      // Create object URL
      const url = URL.createObjectURL(blob)

      // Create anchor element for download
      const a = document.createElement("a")
      a.href = url
      a.download = `Riffusion-${voice}-${style}.mp3`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Download Started",
          description: "Your audio is downloading...",
        })
      }, 100)
    } else {
      // For regular URL
      fetch(currentVoiceUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `Riffusion-${voice}-${style}.mp3`
          document.body.appendChild(a)
          a.click()

          // Cleanup
          setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast({
              title: "Download Started",
              description: "Your audio is downloading...",
            })
          }, 100)
        })
        .catch((error) => {
          console.error("Download error:", error)
          toast({
            title: "Download Failed",
            description: "Failed to download the audio file.",
            variant: "destructive",
          })
        })
    }
  }

  // Helper to convert base64 to Blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)

      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: mimeType })
  }

  // Handle share
  const handleShare = () => {
    if (!generatedVoiceAudio && !fallbackVoiceAudio) return

    // Try to use Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: "Riffusion Audio",
          text: `Check out this awesome audio: "${text.substring(0, 30)}..."`,
          url: window.location.href,
        })
        .then(() => {
          toast({
            title: "Shared Successfully",
            description: "Audio has been shared!",
          })
        })
        .catch((error) => {
          console.error("Sharing failed:", error)
          copyToClipboard()
        })
    } else {
      copyToClipboard()
    }
  }

  // Helper to copy to clipboard
  const copyToClipboard = () => {
    const shareText = `Check out this awesome audio: "${text.substring(0, 30)}..." - ${window.location.href}`

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Audio link copied to clipboard!",
        })
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        })
      })
  }

  // Handle example prompt click
  const handleExamplePromptClick = useCallback(
    (prompt: string) => {
      setText(prompt)
    },
    [setText],
  )

  // Handle manual retry for voice loading
  const handleRetryVoice = useCallback(() => {
    if (!voiceAudioRef.current) return

    if (fallbackVoiceAudio && !usingFallbackVoice) {
      tryFallbackVoice()
    } else if (generatedVoiceAudio && usingFallbackVoice) {
      // Try the original voice again
      setUsingFallbackVoice(false)
      setVoiceLoaded(false)
      setVoiceLoadError(false)
      setVoiceLoadingProgress(0)

      voiceAudioRef.current.src = generatedVoiceAudio
      voiceAudioRef.current.load()

      toast({
        title: "Retrying Voice",
        description: "Trying original voice source again...",
      })
    } else {
      // Just reload the current source
      const currentSrc = voiceAudioRef.current.src
      voiceAudioRef.current.src = ""
      setVoiceLoaded(false)
      setVoiceLoadError(false)
      setVoiceLoadingProgress(0)

      setTimeout(() => {
        if (voiceAudioRef.current) {
          voiceAudioRef.current.src = currentSrc
          voiceAudioRef.current.load()
        }
      }, 500)

      toast({
        title: "Retrying Voice",
        description: "Reloading voice source...",
      })
    }
  }, [fallbackVoiceAudio, generatedVoiceAudio, usingFallbackVoice, tryFallbackVoice])

  // Handle manual retry for music loading
  const handleRetryMusic = useCallback(() => {
    if (!musicAudioRef.current) return

    if (fallbackMusicAudio && !usingFallbackMusic) {
      tryFallbackMusic()
    } else if (generatedMusicAudio && usingFallbackMusic) {
      // Try the original music again
      setUsingFallbackMusic(false)
      setMusicLoaded(false)
      setMusicLoadError(false)
      setMusicLoadingProgress(0)

      musicAudioRef.current.src = generatedMusicAudio
      musicAudioRef.current.load()

      toast({
        title: "Retrying Music",
        description: "Trying original music source again...",
      })
    } else {
      // Just reload the current source
      const currentSrc = musicAudioRef.current.src
      musicAudioRef.current.src = ""
      setMusicLoaded(false)
      setMusicLoadError(false)
      setMusicLoadingProgress(0)

      setTimeout(() => {
        if (musicAudioRef.current) {
          musicAudioRef.current.src = currentSrc
          musicAudioRef.current.load()
        }
      }, 500)

      toast({
        title: "Retrying Music",
        description: "Reloading music source...",
      })
    }
  }, [fallbackMusicAudio, generatedMusicAudio, usingFallbackMusic, tryFallbackMusic])

  return (
    <div className="container py-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-2">Describe Your Audio & Let Riffusion Create!</h1>
      <p className="text-zinc-400 mb-8">
        Enter a prompt, select voice type and emotion to generate high-quality audio.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel - Text input */}
        <div className="lg:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your Text</h2>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here to convert to audio..."
            className="min-h-[200px] bg-zinc-800/50 border-zinc-700 mb-4"
          />

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Voice Type</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="border-zinc-700 bg-zinc-900">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  {voices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Emotion</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="border-zinc-700 bg-zinc-900">
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  {styles.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Music Genre</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="border-zinc-700 bg-zinc-900">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  {genres.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Audio Quality</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="border-zinc-700 bg-zinc-900">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  {qualityOptions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">BPM</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[currentBpm]}
                  min={80}
                  max={180}
                  step={1}
                  className="flex-1 [&>span]:bg-cyan-500"
                  onValueChange={(value) => setCurrentBpm(value[0])}
                />
                <span className="text-sm font-medium w-12 text-right">{currentBpm}</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            onClick={handleGenerateAudio}
            disabled={isGenerating || !text.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Audio...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate with Riffusion
              </>
            )}
          </Button>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Example Prompts</h3>
            <div className="space-y-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={() => handleExamplePromptClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - Audio preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Preview</h2>

            {generatedVoiceAudio || fallbackVoiceAudio ? (
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Generated Audio</h3>
                    <p className="text-zinc-400 text-sm">{text.length > 30 ? `${text.substring(0, 30)}...` : text}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tabs for audio controls */}
                <Tabs defaultValue="preview" className="mb-4">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="preview">Audio Preview</TabsTrigger>
                    <TabsTrigger value="mixer">Audio Mixer</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview">
                    {/* Visualizer */}
                    <div className="h-24 bg-zinc-800 rounded-lg mb-4 overflow-hidden">
                      <canvas ref={canvasRef} width={600} height={100} className="w-full h-full"></canvas>
                    </div>

                    {/* Audio controls */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 bg-cyan-600 hover:bg-cyan-700 border-none"
                        onClick={togglePlay}
                        disabled={!voiceLoaded || (musicLoadError && !musicLoaded)}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </Button>

                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <Button variant="ghost" size="icon" onClick={toggleMute}>
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                          value={[volume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                          className="flex-1 [&>span]:bg-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Audio status */}
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                        <div className="flex items-center gap-1">
                          <Mic
                            className={`h-3 w-3 ${voiceLoaded ? "text-green-500" : voiceLoadError ? "text-red-500" : "text-yellow-500"}`}
                          />
                          <span
                            className={
                              voiceLoaded ? "text-green-500" : voiceLoadError ? "text-red-500" : "text-yellow-500"
                            }
                          >
                            {voiceLoaded
                              ? "Voice loaded" + (usingFallbackVoice ? " (using fallback)" : "")
                              : voiceLoadError
                                ? "Voice load error"
                                : "Loading voice..."}
                          </span>

                          {voiceLoadError && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                              onClick={handleRetryVoice}
                              disabled={isRetryingVoice}
                            >
                              <RefreshCw className={`h-3 w-3 mr-1 ${isRetryingVoice ? "animate-spin" : ""}`} />
                              Retry
                            </Button>
                          )}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Music
                            className={`h-3 w-3 ${
                              musicLoaded ? "text-green-500" : musicLoadError ? "text-red-500" : "text-yellow-500"
                            }`}
                          />
                          <span
                            className={
                              musicLoaded ? "text-green-500" : musicLoadError ? "text-red-500" : "text-yellow-500"
                            }
                          >
                            {musicLoaded
                              ? "Music loaded" + (usingFallbackMusic ? " (using fallback)" : "")
                              : musicLoadError
                                ? "Music load error"
                                : "Loading music..."}
                          </span>

                          {musicLoadError && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                              onClick={handleRetryMusic}
                              disabled={isRetryingMusic}
                            >
                              <RefreshCw className={`h-3 w-3 mr-1 ${isRetryingMusic ? "animate-spin" : ""}`} />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Voice loading progress bar */}
                      {!voiceLoaded && !voiceLoadError && (
                        <div className="w-full mt-2">
                          <Progress value={voiceLoadingProgress} className="h-1 bg-zinc-700" />
                          <p className="text-xs text-zinc-500 mt-1">Loading voice: {voiceLoadingProgress}%</p>
                        </div>
                      )}

                      {/* Music loading progress bar */}
                      {!musicLoaded && !musicLoadError && (
                        <div className="w-full mt-2">
                          <Progress value={musicLoadingProgress} className="h-1 bg-zinc-700" />
                          <p className="text-xs text-zinc-500 mt-1">Loading music: {musicLoadingProgress}%</p>
                        </div>
                      )}

                      {/* Voice error message */}
                      {voiceLoadError && !voiceLoaded && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-red-950/30 border border-red-900/50 rounded text-xs text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>
                            There was an error loading the voice audio. Please try the retry button or generate again
                            with a different voice type.
                          </span>
                        </div>
                      )}

                      {/* Music error message */}
                      {musicLoadError && !musicLoaded && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-red-950/30 border border-red-900/50 rounded text-xs text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>
                            There was an error loading the music. Please try the retry button or generate again with a
                            different genre.
                          </span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="mixer">
                    <div className="space-y-4">
                      {/* Voice volume control */}
                      <div className="flex items-center gap-4">
                        <Mic className="h-5 w-5 text-cyan-500" />
                        <div className="flex-1">
                          <label className="block text-sm text-zinc-400 mb-1">Voice Volume</label>
                          <Slider
                            value={[volume]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="[&>span]:bg-cyan-500"
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{volume}%</span>
                      </div>

                      {/* Music volume control */}
                      <div className="flex items-center gap-4">
                        <Music className="h-5 w-5 text-cyan-500" />
                        <div className="flex-1">
                          <label className="block text-sm text-zinc-400 mb-1">Music Volume</label>
                          <Slider
                            value={[musicVolume]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={handleMusicVolumeChange}
                            className="[&>span]:bg-cyan-500"
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{musicVolume}%</span>
                      </div>

                      {/* Mix button */}
                      <Button
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={handleMixAudio}
                        disabled={
                          isMixing ||
                          !(generatedVoiceAudio || fallbackVoiceAudio) ||
                          !(generatedMusicAudio || fallbackMusicAudio) ||
                          !musicLoaded ||
                          !voiceLoaded
                        }
                      >
                        {isMixing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Mixing Audio...
                          </>
                        ) : (
                          "Mix Voice & Music"
                        )}
                      </Button>

                      {mixedAudioUrl && (
                        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                          <p className="text-sm text-zinc-300 mb-2">Mixed audio ready for download!</p>
                          <audio
                            ref={mixedAudioRef}
                            src={mixedAudioUrl}
                            controls
                            className="w-full"
                            onEnded={() => setIsPlaying(false)}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="border-dashed border-2 border-zinc-700">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-zinc-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Audio Generated Yet</h3>
                  <p className="text-zinc-400 mb-4">
                    Enter your text and click "Generate with Riffusion" to create high-quality audio with background
                    music
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Audio Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Pitch</label>
                  <Slider
                    value={[effects.pitch]}
                    min={0}
                    max={100}
                    step={1}
                    className="[&>span]:bg-cyan-500"
                    onValueChange={(value) => handleEffectChange("pitch", value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Speed</label>
                  <Slider
                    value={[effects.speed]}
                    min={0}
                    max={100}
                    step={1}
                    className="[&>span]:bg-cyan-500"
                    onValueChange={(value) => handleEffectChange("speed", value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Effects</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Bass Boost</label>
                <Slider
                  value={[effects.bassBoost]}
                  min={0}
                  max={100}
                  step={1}
                  className="[&>span]:bg-cyan-500"
                  onValueChange={(value) => handleEffectChange("bassBoost", value)}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Reverb</label>
                <Slider
                  value={[effects.reverb]}
                  min={0}
                  max={100}
                  step={1}
                  className="[&>span]:bg-cyan-500"
                  onValueChange={(value) => handleEffectChange("reverb", value)}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Delay</label>
                <Slider
                  value={[effects.delay]}
                  min={0}
                  max={100}
                  step={1}
                  className="[&>span]:bg-cyan-500"
                  onValueChange={(value) => handleEffectChange("delay", value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  className={`border-zinc-700 hover:border-cyan-500 hover:bg-cyan-500/10 ${
                    activePreset === preset.name ? "border-cyan-500 bg-cyan-500/10" : ""
                  }`}
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
