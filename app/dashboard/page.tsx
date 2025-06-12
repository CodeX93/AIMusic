"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Music,
  Upload,
  Wand2,
  Save,
  Download,
  Share2,
  Play,
  Pause,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  ArrowLeft,
  Repeat,
} from "lucide-react"
import { AudioUploader } from "@/components/audio-uploader"
import { TextToAudioGenerator } from "@/components/text-to-audio-generator"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { AudioEffectsPanel } from "@/components/audio-effects-panel"
import { MixerControls } from "@/components/mixer-controls"
import { SampleLibrary } from "@/components/sample-library"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { EdmPresets } from "@/components/edm-presets"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [generatedAudio, setGeneratedAudio] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioContext, setAudioContext] = useState(null)
  const [audioSource, setAudioSource] = useState(null)
  const [gainNode, setGainNode] = useState(null)
  const [analyserNode, setAnalyserNode] = useState(null)
  const [audioBuffer, setAudioBuffer] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [effects, setEffects] = useState({
    reverb: 30,
    delay: 15,
    distortion: 0,
    phaser: 0,
    filter: 50,
    wobble: 0,
    flanger: 0,
    bitcrush: 0,
    low: 50,
    mid: 50,
    high: 50,
    presence: 40,
  })

  // Audio effect nodes
  const [effectNodes, setEffectNodes] = useState({
    reverbNode: null,
    delayNode: null,
    distortionNode: null,
    filterNode: null,
    wobbleNode: null,
    flangerNode: null,
    bitCrusherNode: null,
    eqLow: null,
    eqMid: null,
    eqHigh: null,
  })

  const [isEffectsEnabled, setIsEffectsEnabled] = useState(true)
  const [activePreset, setActivePreset] = useState(null)
  const [effectsVisible, setEffectsVisible] = useState(true)
  const [currentBpm, setCurrentBpm] = useState(120)
  const [currentKey, setCurrentKey] = useState("C Minor")

  const audioRef = useRef(null)
  const animationRef = useRef(null)
  const convolutionBuffer = useRef(null)
  const oscillatorRef = useRef(null)
  const lfoRef = useRef(null)
  const flangerOscRef = useRef(null)
  const phaserOscRef = useRef(null)

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Fix the AudioContext definition
        const AudioContext = window.AudioContext || window.webkitAudioContext
        const context = new AudioContext()
        const gain = context.createGain()
        const analyser = context.createAnalyser()

        gain.connect(context.destination)
        analyser.connect(gain)

        // Create effect nodes
        const filter = context.createBiquadFilter()
        filter.type = "lowpass"
        filter.frequency.value = 22000
        filter.Q.value = 1

        const delay = context.createDelay(5.0)
        delay.delayTime.value = 0.15

        const distortion = context.createWaveShaper()

        // Create EQ nodes
        const eqLow = context.createBiquadFilter()
        eqLow.type = "lowshelf"
        eqLow.frequency.value = 200
        eqLow.gain.value = 0

        const eqMid = context.createBiquadFilter()
        eqMid.type = "peaking"
        eqMid.frequency.value = 1500
        eqMid.Q.value = 1
        eqMid.gain.value = 0

        const eqHigh = context.createBiquadFilter()
        eqHigh.type = "highshelf"
        eqHigh.frequency.value = 5000
        eqHigh.gain.value = 0

        // Create a simple impulse response directly with the local context variable
        const createReverbImpulse = (ctx) => {
          try {
            const duration = 3 // Longer reverb for EDM
            const decay = 2
            const sampleRate = ctx.sampleRate
            const length = sampleRate * duration
            const impulse = ctx.createBuffer(2, length, sampleRate)

            for (let channel = 0; channel < 2; channel++) {
              const channelData = impulse.getChannelData(channel)
              for (let i = 0; i < length; i++) {
                const n = i / length
                // Simple exponential decay
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay)
              }
            }

            convolutionBuffer.current = impulse
            console.log("Created reverb impulse response")
          } catch (error) {
            console.error("Error creating reverb impulse:", error)
            // Set convolutionBuffer to null so we can handle this case later
            convolutionBuffer.current = null
          }
        }

        // Create the impulse response with the local context
        createReverbImpulse(context)

        setAudioContext(context)
        setGainNode(gain)
        setAnalyserNode(analyser)

        setEffectNodes({
          filterNode: filter,
          delayNode: delay,
          distortionNode: distortion,
          eqLow: eqLow,
          eqMid: eqMid,
          eqHigh: eqHigh,
        })

        return () => {
          if (context.state !== "closed") {
            context.close()
          }
        }
      } catch (error) {
        console.error("Error initializing Web Audio API:", error)
        toast({
          title: "Audio Error",
          description: "Audio tidak dapat diputar, coba format lain atau gunakan sample.",
          variant: "destructive",
        })
      }
    }
  }, [])

  // Handle volume changes
  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = volume / 100
    }
  }, [volume, gainNode])

  // Handle mute state
  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = isMuted ? 0 : volume / 100
    }
  }, [isMuted, volume, gainNode])

  // Load audio file when it changes
  useEffect(() => {
    if (audioFile && audioContext) {
      loadAudio(audioFile)
    }
  }, [audioFile, audioContext])

  // Load generated audio when it changes
  useEffect(() => {
    if (generatedAudio && audioContext) {
      fetch(generatedAudio.url)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((decodedData) => {
          setAudioBuffer(decodedData)
          setDuration(decodedData.duration)
        })
        .catch((error) => {
          console.error("Error loading audio:", error)
          toast({
            title: "Error",
            description: "Failed to load audio file",
            variant: "destructive",
          })
        })
    }
  }, [generatedAudio, audioContext])

  // Update time display during playback
  useEffect(() => {
    if (isPlaying) {
      const updateTime = () => {
        if (audioSource) {
          // Fix the elapsed time calculation
          const elapsed = audioContext.currentTime - (audioSource.startTime || 0)
          if (elapsed < duration) {
            setCurrentTime(elapsed)
            animationRef.current = requestAnimationFrame(updateTime)
          } else {
            setIsPlaying(false)
            setCurrentTime(0)
          }
        }
      }

      animationRef.current = requestAnimationFrame(updateTime)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [isPlaying, audioSource, audioContext, duration])

  // Apply effects when they change
  useEffect(() => {
    if (!audioContext || !effectNodes) return

    const { filterNode, delayNode, distortionNode, eqLow, eqMid, eqHigh } = effectNodes

    // Apply EQ settings
    if (eqLow) {
      eqLow.gain.setValueAtTime((effects.low - 50) * 0.4, audioContext.currentTime) // -20dB to +20dB
    }

    if (eqMid) {
      eqMid.gain.setValueAtTime((effects.mid - 50) * 0.3, audioContext.currentTime) // -15dB to +15dB
    }

    if (eqHigh) {
      eqHigh.gain.setValueAtTime((effects.high - 50) * 0.4, audioContext.currentTime) // -20dB to +20dB
    }

    if (filterNode) {
      // Map 0-100 to 50-22000 (logarithmic)
      const frequency = Math.pow(10, (effects.filter / 100) * 2.64 + 1.7) // 50Hz to 22kHz
      filterNode.frequency.setValueAtTime(frequency, audioContext.currentTime)

      // Make the filter more resonant for EDM effects
      filterNode.Q.setValueAtTime(effects.filter > 50 ? 8 + (effects.filter - 50) / 5 : 1, audioContext.currentTime)
    }

    if (delayNode) {
      // Map 0-100 to 0-1 second
      delayNode.delayTime.setValueAtTime((effects.delay / 100) * 0.75, audioContext.currentTime)
    }

    if (distortionNode) {
      // Create distortion curve based on intensity
      const amount = (effects.distortion / 100) * 100 // Increased for more dramatic effect
      if (amount > 0) {
        const curve = createDistortionCurve(amount)
        distortionNode.curve = curve
      } else {
        distortionNode.curve = null // No distortion
      }
    }

    // Update wobble effect (LFO on filter)
    if (effects.wobble > 0 && isPlaying) {
      if (!lfoRef.current && audioContext) {
        try {
          const lfo = audioContext.createOscillator()
          lfo.type = "sine"

          // Wobble speed based on BPM for better musical sync
          const wobbleSpeed = (currentBpm / 240) * (0.5 + (effects.wobble / 100) * 2)
          lfo.frequency.value = wobbleSpeed // 0.25Hz to 8Hz based on BPM

          const lfoGain = audioContext.createGain()
          lfoGain.gain.value = 500 + (effects.wobble / 100) * 7500 // Much more dramatic wobble

          lfo.connect(lfoGain)

          if (filterNode) {
            lfoGain.connect(filterNode.frequency)
          }

          lfo.start()
          lfoRef.current = { oscillator: lfo, gain: lfoGain }
        } catch (error) {
          console.error("Error creating wobble effect:", error)
        }
      } else if (lfoRef.current) {
        // Update existing LFO
        try {
          const wobbleSpeed = (currentBpm / 240) * (0.5 + (effects.wobble / 100) * 2)
          lfoRef.current.oscillator.frequency.value = wobbleSpeed
          lfoRef.current.gain.gain.value = 500 + (effects.wobble / 100) * 7500
        } catch (error) {
          console.error("Error updating wobble effect:", error)
        }
      }
    } else if (lfoRef.current) {
      // Stop LFO if wobble is disabled
      try {
        lfoRef.current.oscillator.stop()
        lfoRef.current = null
      } catch (error) {
        console.error("Error stopping wobble effect:", error)
      }
    }

    // Update phaser effect
    if (effects.phaser > 0 && isPlaying) {
      if (!phaserOscRef.current && audioContext) {
        try {
          // Create a series of all-pass filters for phaser effect
          const allPassFilters = []
          for (let i = 0; i < 6; i++) {
            const filter = audioContext.createBiquadFilter()
            filter.type = "allpass"
            filter.frequency.value = 1000 + i * 500
            filter.Q.value = 5
            allPassFilters.push(filter)
          }

          // Connect filters in series
          for (let i = 0; i < allPassFilters.length - 1; i++) {
            allPassFilters[i].connect(allPassFilters[i + 1])
          }

          // Create LFO to modulate filter frequencies
          const phaserLFO = audioContext.createOscillator()
          phaserLFO.type = "sine"
          phaserLFO.frequency.value = 0.2 + (effects.phaser / 100) * 0.8 // 0.2Hz to 1Hz

          const phaserLFOGain = audioContext.createGain()
          phaserLFOGain.gain.value = 1500 * (effects.phaser / 100)

          phaserLFO.connect(phaserLFOGain)

          // Connect LFO to all filter frequencies
          for (let i = 0; i < allPassFilters.length; i++) {
            phaserLFOGain.connect(allPassFilters[i].frequency)
          }

          phaserLFO.start()

          phaserOscRef.current = {
            oscillator: phaserLFO,
            gain: phaserLFOGain,
            filters: allPassFilters,
          }
        } catch (error) {
          console.error("Error creating phaser effect:", error)
        }
      } else if (phaserOscRef.current) {
        // Update existing phaser
        try {
          phaserOscRef.current.oscillator.frequency.value = 0.2 + (effects.phaser / 100) * 0.8
          phaserOscRef.current.gain.gain.value = 1500 * (effects.phaser / 100)
        } catch (error) {
          console.error("Error updating phaser effect:", error)
        }
      }
    } else if (phaserOscRef.current) {
      // Stop phaser if disabled
      try {
        phaserOscRef.current.oscillator.stop()
        phaserOscRef.current = null
      } catch (error) {
        console.error("Error stopping phaser effect:", error)
      }
    }

    // Update flanger effect
    if (effects.flanger > 0 && isPlaying) {
      if (!flangerOscRef.current && audioContext) {
        try {
          const flangerDelay = audioContext.createDelay()
          flangerDelay.delayTime.value = 0.005 // 5ms base delay

          // Create LFO for flanger
          const flangerLFO = audioContext.createOscillator()
          flangerLFO.type = "sine"
          flangerLFO.frequency.value = 0.5 + (effects.flanger / 100) * 2 // 0.5-2.5Hz

          const flangerLFOGain = audioContext.createGain()
          flangerLFOGain.gain.value = 0.002 + (effects.flanger / 100) * 0.003 // Modulation depth

          flangerLFO.connect(flangerLFOGain)
          flangerLFOGain.connect(flangerDelay.delayTime)

          // Create feedback path
          const flangerFeedback = audioContext.createGain()
          flangerFeedback.gain.value = 0.3 + (effects.flanger / 100) * 0.5

          flangerDelay.connect(flangerFeedback)
          flangerFeedback.connect(flangerDelay)

          flangerLFO.start()

          flangerOscRef.current = {
            oscillator: flangerLFO,
            gain: flangerLFOGain,
            delay: flangerDelay,
            feedback: flangerFeedback,
          }
        } catch (error) {
          console.error("Error creating flanger effect:", error)
        }
      } else if (flangerOscRef.current) {
        // Update existing flanger
        try {
          flangerOscRef.current.oscillator.frequency.value = 0.5 + (effects.flanger / 100) * 2
          flangerOscRef.current.gain.gain.value = 0.002 + (effects.flanger / 100) * 0.003
          flangerOscRef.current.feedback.gain.value = 0.3 + (effects.flanger / 100) * 0.5
        } catch (error) {
          console.error("Error updating flanger effect:", error)
        }
      }
    } else if (flangerOscRef.current) {
      // Stop flanger if disabled
      try {
        flangerOscRef.current.oscillator.stop()
        flangerOscRef.current = null
      } catch (error) {
        console.error("Error stopping flanger effect:", error)
      }
    }
  }, [effects, audioContext, effectNodes, isPlaying, currentBpm])

  // Clean up oscillators when component unmounts or playback stops
  useEffect(() => {
    if (!isPlaying) {
      if (lfoRef.current) {
        try {
          lfoRef.current.oscillator.stop()
          lfoRef.current = null
        } catch (error) {
          console.error("Error stopping LFO:", error)
        }
      }

      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
          oscillatorRef.current = null
        } catch (error) {
          console.error("Error stopping oscillator:", error)
        }
      }

      if (flangerOscRef.current) {
        try {
          flangerOscRef.current.oscillator.stop()
          flangerOscRef.current = null
        } catch (error) {
          console.error("Error stopping flanger oscillator:", error)
        }
      }

      if (phaserOscRef.current) {
        try {
          phaserOscRef.current.oscillator.stop()
          phaserOscRef.current = null
        } catch (error) {
          console.error("Error stopping phaser oscillator:", error)
        }
      }
    }
  }, [isPlaying])

  const createDistortionCurve = (amount) => {
    const samples = 44100
    const curve = new Float32Array(samples)
    const deg = Math.PI / 180

    // Different distortion curves for different amounts
    if (amount > 80) {
      // Extreme distortion for hardstyle kicks
      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1
        // Hard clipping with slight asymmetry for more character
        curve[i] = Math.max(Math.min(x * 3, 0.8), -0.7)
      }
    } else if (amount > 70) {
      // Hard clipping for dubstep-like distortion
      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1
        curve[i] = Math.max(Math.min((x * amount) / 20, 0.8), -0.8)
      }
    } else if (amount > 40) {
      // Soft clipping for warm distortion
      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1
        curve[i] = Math.tanh((x * amount) / 25)
      }
    } else {
      // Subtle overdrive
      for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
      }
    }

    return curve
  }

  const loadAudio = async (file) => {
    if (!audioContext) return

    try {
      setIsProcessing(true)

      // Create object URL for the file
      const url = URL.createObjectURL(file)
      setAudioUrl(url)

      // Fetch and decode the audio data
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const decodedData = await audioContext.decodeAudioData(arrayBuffer)

      setAudioBuffer(decodedData)
      setDuration(decodedData.duration)
      setIsProcessing(false)

      toast({
        title: "Success",
        description: "Audio loaded successfully",
      })
    } catch (error) {
      console.error("Error loading audio:", error)
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Failed to load audio file",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (file) => {
    setAudioFile(file)
  }

  const handleTextToAudio = (prompt) => {
    setIsProcessing(true)

    // Simulate AI generation with a demo audio file
    setTimeout(() => {
      setGeneratedAudio({
        name: `Generated from: ${prompt.substring(0, 20)}...`,
        url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3", // Demo audio URL
      })
      setIsProcessing(false)

      toast({
        title: "Audio Generated",
        description: `Created audio from prompt: "${prompt.substring(0, 30)}..."`,
      })
    }, 2000)
  }

  const createBitCrusher = (context, bufferSize = 4096) => {
    if (!context) return null

    try {
      const scriptNode = context.createScriptProcessor(bufferSize, 1, 1)
      let bit = 4 // bit depth (1-16)
      let normFreq = 0.1 // normalized frequency (0-1)

      scriptNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer
        const outputBuffer = audioProcessingEvent.outputBuffer

        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
          const inputData = inputBuffer.getChannelData(channel)
          const outputData = outputBuffer.getChannelData(channel)

          // Bit reduction
          const step = Math.pow(0.5, bit)

          // Downsampling
          let lastValue = 0
          for (let i = 0; i < inputBuffer.length; i++) {
            // Downsample (hold sample value for several samples)
            if (Math.random() < normFreq) {
              lastValue = step * Math.floor(inputData[i] / step)
            }
            outputData[i] = lastValue
          }
        }
      }

      // Add methods to control the bit crusher
      scriptNode.setBitDepth = (newBit) => {
        bit = Math.min(Math.max(newBit, 1), 16)
      }

      scriptNode.setDownsampleRate = (newFreq) => {
        normFreq = Math.min(Math.max(newFreq, 0), 1)
      }

      return scriptNode
    } catch (error) {
      console.error("Error creating bit crusher:", error)
      return null
    }
  }

  const setupAudioChain = (source) => {
    if (!audioContext || !effectNodes) return source

    const { filterNode, delayNode, distortionNode, eqLow, eqMid, eqHigh } = effectNodes

    // If effects are disabled, connect directly to analyzer
    if (!isEffectsEnabled) {
      source.connect(analyserNode)
      return source
    }

    try {
      // Create a gain node for the dry/wet mix
      const wetGain = audioContext.createGain()
      wetGain.gain.value = 0.7 // 70% wet for more dramatic effect

      const dryGain = audioContext.createGain()
      dryGain.gain.value = 0.3 // 30% dry

      // Connect the source to both paths
      source.connect(dryGain)

      // Connect through EQ first
      source.connect(eqLow)
      eqLow.connect(eqMid)
      eqMid.connect(eqHigh)
      eqHigh.connect(filterNode)

      // Create a feedback path for delay
      const feedbackGain = audioContext.createGain()
      feedbackGain.gain.value = effects.delay > 50 ? 0.6 : 0.3 // More feedback for higher delay settings

      // Connect the effects chain
      filterNode.connect(distortionNode)

      // Enhanced delay with feedback
      distortionNode.connect(delayNode)
      delayNode.connect(feedbackGain)
      feedbackGain.connect(delayNode)

      // Create a bit crusher effect if bitcrush is enabled
      if (effects.bitcrush > 0) {
        const bitCrusher = createBitCrusher(audioContext)
        if (bitCrusher) {
          // More extreme bit crushing for dubstep and techno
          const bitDepth = 16 - Math.floor((effects.bitcrush / 100) * 14) // Map 0-100 to 16-2 bit depth
          const downsampleRate = effects.bitcrush / 200 // Map 0-100 to 0-0.5 rate

          bitCrusher.setBitDepth(bitDepth)
          bitCrusher.setDownsampleRate(downsampleRate)

          delayNode.connect(bitCrusher)
          bitCrusher.connect(wetGain)
        } else {
          delayNode.connect(wetGain)
        }
      } else {
        delayNode.connect(wetGain)
      }

      // Special processing for Drum & Bass - enhance transients
      if (activePreset === "Drum & Bass" && audioContext) {
        try {
          const transientShaper = audioContext.createDynamicsCompressor()
          transientShaper.threshold.value = -24
          transientShaper.knee.value = 0
          transientShaper.ratio.value = 12
          transientShaper.attack.value = 0.001 // Very fast attack
          transientShaper.release.value = 0.1 // Fast release

          delayNode.connect(transientShaper)
          transientShaper.connect(wetGain)
        } catch (error) {
          console.error("Error creating transient shaper:", error)
          delayNode.connect(wetGain)
        }
      }
      // Special processing for Trap - add sidechain effect
      else if (activePreset === "Trap" && audioContext) {
        try {
          const sidechain = audioContext.createGain()
          sidechain.gain.value = 1

          // Create LFO for sidechain effect
          const sidechainLFO = audioContext.createOscillator()
          sidechainLFO.type = "sine"
          sidechainLFO.frequency.value = currentBpm / 60 // Match to BPM

          const sidechainDepth = audioContext.createGain()
          sidechainDepth.gain.value = 0.5 // Depth of sidechain effect

          sidechainLFO.connect(sidechainDepth)
          sidechainDepth.connect(sidechain.gain)

          delayNode.connect(sidechain)
          sidechain.connect(wetGain)

          sidechainLFO.start()

          // Store for cleanup
          if (!oscillatorRef.current) {
            oscillatorRef.current = sidechainLFO
          }
        } catch (error) {
          console.error("Error creating sidechain effect:", error)
          delayNode.connect(wetGain)
        }
      } else {
        delayNode.connect(wetGain)
      }

      // Apply reverb if enabled
      if (effects.reverb > 0) {
        if (convolutionBuffer.current) {
          // Use convolution reverb if we have an impulse response
          const convolver = audioContext.createConvolver()
          convolver.buffer = convolutionBuffer.current

          // Create a gain node to control reverb amount
          const reverbGain = audioContext.createGain()
          reverbGain.gain.value = effects.reverb / 100

          // Add a parallel path for reverb
          distortionNode.connect(convolver)
          convolver.connect(reverbGain)
          reverbGain.connect(wetGain)
        } else {
          // Fallback to a simple feedback delay network as reverb
          console.log("Using fallback reverb")
          const reverbDelay = audioContext.createDelay(1.0)
          reverbDelay.delayTime.value = 0.1

          const reverbGain = audioContext.createGain()
          reverbGain.gain.value = effects.reverb / 200 // Lower gain to prevent feedback

          distortionNode.connect(reverbDelay)
          reverbDelay.connect(reverbGain)
          reverbGain.connect(reverbDelay) // Feedback
          reverbGain.connect(wetGain)
        }
      }

      // Add flanger effect if enabled
      if (effects.flanger > 0 && flangerOscRef.current) {
        try {
          distortionNode.connect(flangerOscRef.current.delay)
          flangerOscRef.current.delay.connect(wetGain)
        } catch (error) {
          console.error("Error connecting flanger effect:", error)
        }
      }

      // Add phaser effect if enabled
      if (effects.phaser > 0 && phaserOscRef.current) {
        try {
          distortionNode.connect(phaserOscRef.current.filters[0])
          phaserOscRef.current.filters[phaserOscRef.current.filters.length - 1].connect(wetGain)
        } catch (error) {
          console.error("Error connecting phaser effect:", error)
        }
      }

      // Connect both paths to the analyzer
      dryGain.connect(analyserNode)
      wetGain.connect(analyserNode)

      return source
    } catch (error) {
      console.error("Error setting up audio chain:", error)
      // Fallback to direct connection if there's an error
      source.connect(analyserNode)
      return source
    }
  }

  const togglePlayPause = () => {
    if (!audioContext || !audioBuffer) return

    try {
      if (isPlaying) {
        // Stop playback
        if (audioSource) {
          audioSource.stop()
          setAudioSource(null)
        }
        setIsPlaying(false)

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }

        // Clean up oscillators
        if (lfoRef.current) {
          lfoRef.current.oscillator.stop()
          lfoRef.current = null
        }

        if (oscillatorRef.current) {
          oscillatorRef.current.stop()
          oscillatorRef.current = null
        }

        if (flangerOscRef.current) {
          flangerOscRef.current.oscillator.stop()
          flangerOscRef.current = null
        }

        if (phaserOscRef.current) {
          phaserOscRef.current.oscillator.stop()
          phaserOscRef.current = null
        }
      } else {
        // Start playback
        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer

        // Apply effects chain
        setupAudioChain(source)

        // Store the start time properly
        source.startTime = audioContext.currentTime - currentTime
        source.start(0, currentTime)

        setAudioSource(source)
        setIsPlaying(true)

        // Show a toast when effects are applied
        if (isEffectsEnabled && activePreset) {
          toast({
            title: `${activePreset} Preset Active`,
            description: "Effects are being applied to your audio",
          })
        }
      }
    } catch (error) {
      console.error("Error toggling playback:", error)
      toast({
        title: "Playback Error",
        description: "There was an error playing the audio. Please try again.",
        variant: "destructive",
      })
      setIsPlaying(false)
    }
  }

  const toggleEffects = () => {
    setIsEffectsEnabled(!isEffectsEnabled)

    // If we're currently playing, restart with new settings
    if (isPlaying && audioSource) {
      const currentPos = currentTime
      audioSource.stop()

      setTimeout(() => {
        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer

        // Apply effects chain with new settings
        setupAudioChain(source)

        source.startTime = audioContext.currentTime - currentPos
        source.start(0, currentPos)

        setAudioSource(source)
      }, 50)
    }

    toast({
      title: isEffectsEnabled ? "Effects Disabled" : "Effects Enabled",
      description: isEffectsEnabled ? "Now playing original audio" : "Now playing with effects",
    })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value) => {
    const newVolume = value[0]
    setVolume(newVolume)
  }

  const handleEffectChange = (effect, value) => {
    setEffects((prev) => ({
      ...prev,
      [effect]: value[0],
    }))

    // If we're currently playing, apply the effect in real-time
    if (isPlaying && audioSource && effectNodes) {
      // Effect-specific real-time updates would go here
      // Most are handled by the useEffect that watches the effects state
    }

    toast({
      title: "Effect Applied",
      description: `${effect.charAt(0).toUpperCase() + effect.slice(1)} set to ${value[0]}%`,
    })
  }

  const applyEdmPreset = (preset) => {
    setActivePreset(preset.name)
    setEffects(preset.effects)
    setEffectsVisible(true)

    // Update BPM and key if provided in the preset
    if (preset.bpm) setCurrentBpm(preset.bpm)
    if (preset.key) setCurrentKey(preset.key)

    toast({
      title: "EDM Preset Applied",
      description: `Applied "${preset.name}" preset to your audio`,
      variant: "default",
    })

    // If we're currently playing, restart with new settings
    if (isPlaying && audioSource) {
      const currentPos = currentTime
      audioSource.stop()

      setTimeout(() => {
        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer

        // Apply effects chain with new settings
        setupAudioChain(source)

        source.startTime = audioContext.currentTime - currentPos
        source.start(0, currentPos)

        setAudioSource(source)
      }, 50)
    }
  }

  const handleDownload = () => {
    if (!audioBuffer) {
      toast({
        title: "Error",
        description: "No audio to download",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would process the audio with effects and download it
    toast({
      title: "Download Started",
      description: "Your remix is being prepared for download",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Your remix has been downloaded",
      })
    }, 1500)
  }

  const handleShare = () => {
    toast({
      title: "Share",
      description: "Sharing functionality would open here",
    })
  }

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Your remix has been saved to your library",
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-purple-500" />
              <h1 className="text-xl font-bold">WEB MUSIC AI</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="text-lg py-3">
              <Upload className="h-5 w-5 mr-2" />
              Upload & Remix
            </TabsTrigger>
            <TabsTrigger value="generate" className="text-lg py-3">
              <Wand2 className="h-5 w-5 mr-2" />
              Text to Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Upload Audio</h2>
                <AudioUploader onFileUpload={handleFileUpload} isProcessing={isProcessing} />

                {audioFile && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Current Track</h3>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-zinc-300 truncate">{audioFile.name}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-zinc-500">{formatTime(duration)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-400 hover:text-purple-300"
                          onClick={() => {
                            setAudioFile(null)
                            setAudioBuffer(null)
                            setIsPlaying(false)
                            if (audioSource) {
                              audioSource.stop()
                              setAudioSource(null)
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Sample Library</h3>
                  <SampleLibrary
                    onSampleSelect={(sample) => {
                      toast({
                        title: "Sample Added",
                        description: `${sample.name} added to your project`,
                      })
                    }}
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Audio Editor</h2>

                  <AudioVisualizer
                    isPlaying={isPlaying}
                    audioFile={audioFile || generatedAudio}
                    analyserNode={analyserNode}
                    currentTime={currentTime}
                    duration={duration}
                  />

                  <div className="mt-6 flex justify-center items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => {
                        if (audioSource) {
                          audioSource.stop()
                        }
                        setCurrentTime(0)
                        setIsPlaying(false)
                        setTimeout(() => {
                          togglePlayPause()
                        }, 100)
                      }}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={togglePlayPause}
                      disabled={!audioBuffer}
                      className="bg-purple-600 hover:bg-purple-700 rounded-full h-12 w-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      <div className="w-24">
                        <Slider value={[volume]} min={0} max={100} step={1} onValueChange={handleVolumeChange} />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-purple-500 ${isEffectsEnabled ? "bg-purple-500/20 text-purple-300" : "text-zinc-400"}`}
                      onClick={toggleEffects}
                      disabled={!audioBuffer}
                    >
                      <Repeat className="h-4 w-4 mr-2" />
                      {isEffectsEnabled ? "Effects On" : "Effects Off"}
                    </Button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Remix Controls</h2>
                    {activePreset && (
                      <div className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full">
                        {activePreset} Preset • {currentBpm} BPM • {currentKey}
                      </div>
                    )}
                  </div>

                  <EdmPresets onPresetSelect={applyEdmPreset} disabled={!audioBuffer} />

                  {effectsVisible && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">Effect Controls</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => setEffectsVisible(!effectsVisible)}
                        >
                          {effectsVisible ? "Hide" : "Show"}
                        </Button>
                      </div>
                      <AudioEffectsPanel
                        effects={effects}
                        onEffectChange={handleEffectChange}
                        disabled={!audioBuffer || !isEffectsEnabled}
                      />
                    </div>
                  )}

                  <MixerControls
                    disabled={!audioBuffer}
                    onMixerChange={(track, value) => {
                      toast({
                        title: "Mixer Updated",
                        description: `${track} volume set to ${value}%`,
                      })
                    }}
                  />

                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      className="border-purple-500 text-purple-400 hover:bg-purple-950/30"
                      onClick={handleSave}
                      disabled={!audioBuffer}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Remix
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        onClick={handleShare}
                        disabled={!audioBuffer}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                        disabled={!audioBuffer}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Text to Audio</h2>
                <TextToAudioGenerator onGenerate={handleTextToAudio} isProcessing={isProcessing} />

                {generatedAudio && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Generated Track</h3>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-zinc-300 truncate">{generatedAudio.name}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-zinc-500">{formatTime(duration || 0)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-400 hover:text-purple-300"
                          onClick={() => {
                            setIsProcessing(true)
                            setTimeout(() => {
                              toast({
                                title: "Regenerated",
                                description: "Audio has been regenerated with new parameters",
                              })
                              setIsProcessing(false)
                            }, 1500)
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Suggested Prompts</h3>
                  <div className="space-y-2">
                    {[
                      "Upbeat electronic dance track with synth leads",
                      "Lo-fi hip hop beat with piano samples",
                      "Ambient soundscape with nature sounds",
                      "Cinematic orchestral theme with dramatic drums",
                    ].map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        onClick={() => handleTextToAudio(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Audio Preview</h2>

                  <AudioVisualizer
                    isPlaying={isPlaying}
                    audioFile={generatedAudio || audioFile}
                    analyserNode={analyserNode}
                    currentTime={currentTime}
                    duration={duration}
                  />

                  <div className="mt-6 flex justify-center items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => {
                        if (audioSource) {
                          audioSource.stop()
                        }
                        setCurrentTime(0)
                        setIsPlaying(false)
                        setTimeout(() => {
                          togglePlayPause()
                        }, 100)
                      }}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={togglePlayPause}
                      disabled={!audioBuffer}
                      className="bg-purple-600 hover:bg-purple-700 rounded-full h-12 w-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      <div className="w-24">
                        <Slider value={[volume]} min={0} max={100} step={1} onValueChange={handleVolumeChange} />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-purple-500 ${isEffectsEnabled ? "bg-purple-500/20 text-purple-300" : "text-zinc-400"}`}
                      onClick={toggleEffects}
                      disabled={!audioBuffer}
                    >
                      <Repeat className="h-4 w-4 mr-2" />
                      {isEffectsEnabled ? "Effects On" : "Effects Off"}
                    </Button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">AI Generation Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-zinc-400">Genre</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Electronic", "Hip Hop", "Pop", "Rock", "Ambient"].map((genre, index) => (
                          <Button
                            key={genre}
                            variant="outline"
                            size="sm"
                            className={
                              index === 0
                                ? "border-purple-500 bg-purple-500/10 text-purple-300"
                                : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            }
                            onClick={() => {
                              toast({
                                title: "Genre Selected",
                                description: `${genre} genre selected`,
                              })
                            }}
                          >
                            {genre}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2 text-zinc-400">Mood</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Energetic", "Calm", "Dark", "Happy"].map((mood, index) => (
                          <Button
                            key={mood}
                            variant="outline"
                            size="sm"
                            className={
                              index === 0
                                ? "border-purple-500 bg-purple-500/10 text-purple-300"
                                : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            }
                            onClick={() => {
                              toast({
                                title: "Mood Selected",
                                description: `${mood} mood selected`,
                              })
                            }}
                          >
                            {mood}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2 text-zinc-400">Tempo</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={[120]}
                          min={60}
                          max={180}
                          step={1}
                          onValueChange={(value) => {
                            setCurrentBpm(value[0])
                            toast({
                              title: "Tempo Changed",
                              description: `Tempo set to ${value[0]} BPM`,
                            })
                          }}
                        />
                        <div className="flex justify-between mt-1 text-xs text-zinc-500">
                          <span>60 BPM</span>
                          <span>120 BPM</span>
                          <span>180 BPM</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2 text-zinc-400">Duration</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={[30]}
                          min={10}
                          max={60}
                          step={5}
                          onValueChange={(value) => {
                            toast({
                              title: "Duration Changed",
                              description: `Duration set to ${value[0]} seconds`,
                            })
                          }}
                        />
                        <div className="flex justify-between mt-1 text-xs text-zinc-500">
                          <span>10s</span>
                          <span>30s</span>
                          <span>60s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      className="border-purple-500 text-purple-400 hover:bg-purple-950/30"
                      onClick={handleSave}
                      disabled={!audioBuffer}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Track
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        onClick={handleShare}
                        disabled={!audioBuffer}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                        disabled={!audioBuffer}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}
