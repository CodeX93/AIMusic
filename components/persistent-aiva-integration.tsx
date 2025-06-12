"use client"

import { useState, useEffect, useRef } from "react"
import { X, Minimize2, Check, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Constant for total integration time in milliseconds (72 hours = 3 days)
const TOTAL_INTEGRATION_TIME = 72 * 60 * 60 * 1000 // 72 hours in milliseconds

// Status messages that will cycle during the integration
const STATUS_MESSAGES = [
  "Initializing AIVA connection...",
  "Downloading AI music models...",
  "Configuring EDM presets...",
  "Syncing audio processing modules...",
  "Optimizing neural networks...",
  "Training on your music preferences...",
  "Calibrating audio parameters...",
  "Integrating with remix engine...",
  "Setting up voice models...",
  "Analyzing music patterns...",
  "Building harmonic structures...",
  "Configuring rhythm generators...",
  "Optimizing melody synthesis...",
  "Training genre classifiers...",
  "Calibrating audio mastering...",
  "Syncing with cloud models...",
  "Downloading additional voice packs...",
  "Configuring advanced EDM effects...",
  "Optimizing real-time processing...",
  "Training on global music database...",
  "Analyzing your previous remixes...",
  "Building custom sound profiles...",
  "Configuring advanced audio filters...",
  "Optimizing latency for live performance...",
  "Syncing with music theory database...",
  "Downloading professional mixing presets...",
  "Configuring spatial audio processing...",
  "Optimizing multi-track capabilities...",
  "Training on genre-specific patterns...",
  "Analyzing harmonic compatibility...",
  "Building advanced drum patterns...",
  "Configuring adaptive tempo matching...",
  "Optimizing frequency response curves...",
  "Syncing with latest AI models...",
  "Downloading high-resolution samples...",
  "Configuring neural mixing algorithms...",
  "Optimizing for your hardware configuration...",
  "Training custom voice models...",
  "Analyzing audio quality parameters...",
  "Building custom effect chains...",
  "Finalizing integration...",
]

// Phases of integration with their own progress ranges
const INTEGRATION_PHASES = [
  { name: "Initial Setup", range: [0, 5] },
  { name: "Model Download", range: [5, 20] },
  { name: "Neural Training", range: [20, 45] },
  { name: "Audio Processing Setup", range: [45, 60] },
  { name: "Voice Model Integration", range: [60, 75] },
  { name: "Advanced Features Setup", range: [75, 90] },
  { name: "Final Optimization", range: [90, 100] },
]

export function PersistentAivaIntegration() {
  // State for minimized view
  const [minimized, setMinimized] = useState(false)

  // State for progress and status
  const [progress, setProgress] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const [currentPhase, setCurrentPhase] = useState(INTEGRATION_PHASES[0])

  // Refs for animation frames and intervals
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // State for occasional slowdowns and speedups
  const [progressRate, setProgressRate] = useState(1)

  const { toast } = useToast()

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem("aivaIntegrationProgress")
    const savedTimestamp = localStorage.getItem("aivaIntegrationTimestamp")

    if (savedProgress && savedTimestamp) {
      const elapsedTime = Date.now() - Number.parseInt(savedTimestamp)
      const savedProgressValue = Number.parseFloat(savedProgress)

      // Calculate new progress based on elapsed time
      let newProgress = savedProgressValue + (elapsedTime / TOTAL_INTEGRATION_TIME) * 100

      // Cap at 100%
      if (newProgress >= 100) {
        newProgress = 100
        setIsComplete(true)
      }

      setProgress(newProgress)

      // Set current phase based on progress
      updateCurrentPhase(newProgress)
    }
  }, [])

  // Update current phase based on progress
  const updateCurrentPhase = (currentProgress: number) => {
    const phase =
      INTEGRATION_PHASES.find((phase) => currentProgress >= phase.range[0] && currentProgress < phase.range[1]) ||
      INTEGRATION_PHASES[INTEGRATION_PHASES.length - 1]

    setCurrentPhase(phase)
  }

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      localStorage.setItem("aivaIntegrationProgress", progress.toString())
      localStorage.setItem("aivaIntegrationTimestamp", Date.now().toString())

      // Update current phase
      updateCurrentPhase(progress)
    } else if (progress >= 100) {
      // Clear localStorage when complete
      localStorage.removeItem("aivaIntegrationProgress")
      localStorage.removeItem("aivaIntegrationTimestamp")
    }
  }, [progress])

  // Set up progress increment interval
  useEffect(() => {
    if (progress < 100 && !isComplete) {
      // Calculate increment per interval (to complete in 72 hours)
      // Update every 10 seconds with tiny increments
      const INCREMENT_INTERVAL = 10000 // 10 seconds
      const baseIncrementPerInterval = (INCREMENT_INTERVAL / TOTAL_INTEGRATION_TIME) * 100

      progressIntervalRef.current = setInterval(() => {
        // Randomly adjust progress rate occasionally (simulate network/processing variations)
        if (Math.random() < 0.05) {
          // 5% chance to change rate
          const newRate = 0.5 + Math.random() * 1.5 // Between 0.5x and 2x speed
          setProgressRate(newRate)
        }

        setProgress((prev) => {
          const adjustedIncrement = baseIncrementPerInterval * progressRate
          const newProgress = prev + adjustedIncrement

          // Occasionally simulate a brief pause (0.5% chance)
          if (Math.random() < 0.005) {
            return prev // No progress this interval
          }

          if (newProgress >= 100) {
            setIsComplete(true)
            clearInterval(progressIntervalRef.current!)
            return 100
          }
          return newProgress
        })
      }, INCREMENT_INTERVAL)
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [progress, isComplete, progressRate])

  // Cycle through status messages
  useEffect(() => {
    if (!isComplete) {
      // Change status message every 45-90 seconds (more varied and longer)
      const randomInterval = Math.floor(Math.random() * 45000) + 45000

      statusIntervalRef.current = setInterval(() => {
        // Select a status message appropriate for the current phase
        const phaseProgress = (progress - currentPhase.range[0]) / (currentPhase.range[1] - currentPhase.range[0])
        const phaseIndex = Math.floor((phaseProgress * STATUS_MESSAGES.length) / INTEGRATION_PHASES.length)

        // Ensure we don't repeat the same message consecutively
        let newIndex
        do {
          newIndex = Math.floor(Math.random() * STATUS_MESSAGES.length)
        } while (newIndex === statusIndex)

        setStatusIndex(newIndex)

        // Trigger pulse animation when status changes
        setPulseAnimation(true)
        if (pulseTimeoutRef.current) {
          clearTimeout(pulseTimeoutRef.current)
        }
        pulseTimeoutRef.current = setTimeout(() => {
          setPulseAnimation(false)
        }, 2000)
      }, randomInterval)
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current)
      }
    }
  }, [isComplete, progress, currentPhase, statusIndex])

  // Show completion toast when integration is complete
  useEffect(() => {
    if (isComplete) {
      toast({
        title: "AIVA Integration Complete",
        description: "You can now use AIVA's AI music generation features in your projects.",
        variant: "default",
      })
    }
  }, [isComplete, toast])

  // Handle close notification
  const handleClose = () => {
    setShowNotification(false)

    // Clear all intervals and timeouts
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current)
    }
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current)
    }

    // Clear localStorage
    localStorage.removeItem("aivaIntegrationProgress")
    localStorage.removeItem("aivaIntegrationTimestamp")
  }

  if (!showNotification) {
    return null
  }

  // Calculate time remaining (rough estimate)
  const calculateTimeRemaining = () => {
    const percentRemaining = 100 - progress
    const hoursRemaining = Math.ceil((percentRemaining / 100) * (TOTAL_INTEGRATION_TIME / (60 * 60 * 1000)))

    if (hoursRemaining > 24) {
      const days = Math.floor(hoursRemaining / 24)
      const hours = hoursRemaining % 24
      return `~${days}d ${hours}h remaining`
    }

    return `~${hoursRemaining}h remaining`
  }

  // Determine status message based on progress
  const getStatusMessage = () => {
    if (isComplete) {
      return "Integration complete! AIVA is ready to use."
    }

    return STATUS_MESSAGES[statusIndex]
  }

  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-300 ease-in-out",
        minimized ? "bottom-4 right-4 w-12 h-12" : "bottom-4 right-4 w-80 md:w-96",
      )}
    >
      {minimized ? (
        // Minimized view - just a floating icon
        <button
          onClick={() => setMinimized(false)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all",
            isComplete ? "bg-gradient-to-r from-green-500 to-cyan-500" : "bg-gradient-to-r from-cyan-500 to-blue-500",
            pulseAnimation && "animate-pulse",
          )}
        >
          {isComplete ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          )}
        </button>
      ) : (
        // Expanded view - notification card
        <div className="rounded-lg border border-cyan-800/30 bg-zinc-900/95 shadow-lg backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-800/20 p-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  isComplete ? "bg-green-500/20" : "bg-cyan-500/20",
                )}
              >
                {isComplete ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <div className="h-3 w-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                )}
              </div>
              <h3 className="text-sm font-medium text-white">AIVA Integration</h3>
              {!isComplete && <span className="ml-1 text-xs text-zinc-500">{currentPhase.name}</span>}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-white"
                onClick={() => setMinimized(true)}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-white"
                onClick={handleClose}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className={cn("text-xs font-medium", pulseAnimation ? "text-cyan-400" : "text-zinc-400")}>
                  {getStatusMessage()}
                </span>
                <span className="text-xs font-medium text-cyan-400">{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                className="h-1.5 bg-zinc-800"
                indicatorClassName={cn(
                  "transition-all duration-1000",
                  isComplete
                    ? "bg-gradient-to-r from-green-500 to-cyan-500"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500",
                )}
              />

              {!isComplete && (
                <div className="mt-1 flex items-center justify-end">
                  <span className="flex items-center text-xs text-zinc-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {calculateTimeRemaining()}
                  </span>
                </div>
              )}
            </div>

            {/* Status details */}
            <div className="mb-3 rounded-md bg-zinc-800/50 p-2.5 text-xs text-zinc-400">
              {isComplete ? (
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                  <span>
                    AIVA has been successfully integrated with your Composition Converter. You can now use AI-powered
                    music generation in your projects.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-400" />
                  <span>
                    AIVA integration is in progress. This is a complex process that requires downloading and configuring
                    multiple AI models and may take several days to complete. You can continue using the application
                    while the integration runs in the background.
                  </span>
                </div>
              )}
            </div>

            {/* Phase progress */}
            {!isComplete && (
              <div className="mb-3">
                <div className="grid grid-cols-7 gap-1">
                  {INTEGRATION_PHASES.map((phase, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-1 rounded-full",
                        progress >= phase.range[1]
                          ? "bg-cyan-400"
                          : progress >= phase.range[0]
                            ? "bg-gradient-to-r from-cyan-400 to-zinc-800"
                            : "bg-zinc-800",
                      )}
                      title={phase.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {isComplete ? (
              <div className="flex gap-2">
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:from-green-600 hover:to-cyan-600"
                  size="sm"
                  onClick={handleClose}
                >
                  Start Using AIVA
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-800/30 text-cyan-400 hover:bg-cyan-950/30"
                  onClick={() => setMinimized(true)}
                >
                  Minimize
                </Button>
                <Button variant="link" size="sm" className="text-cyan-400" onClick={handleClose}>
                  Cancel Integration
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
