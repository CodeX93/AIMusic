"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2, Music, Sparkles, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

export function AivaIntegrationPopup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const { toast } = useToast()

  // Simulate integration progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          return 100
        }

        // Update steps based on progress
        if (prevProgress >= 25 && step === 1) {
          setStep(2)
        } else if (prevProgress >= 50 && step === 2) {
          setStep(3)
        } else if (prevProgress >= 75 && step === 3) {
          setStep(4)
        } else if (prevProgress >= 95 && step === 4) {
          setIsCompleted(true)
          toast({
            title: "AIVA Integration Complete",
            description: "You can now use AIVA's AI music generation features in your projects.",
            variant: "default",
          })
        }

        return prevProgress + 1
      })
    }, 100)

    return () => clearInterval(timer)
  }, [step, toast])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-cyan-800/50 bg-zinc-900 p-6 shadow-lg shadow-cyan-900/20">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">AIVA Integration</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Integration progress</span>
            <span className="text-sm font-medium text-cyan-400">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-zinc-800"
            indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-500"
          />
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${step > 1 || isCompleted ? "bg-cyan-500 text-black" : "bg-zinc-800 text-zinc-500"}`}
            >
              {step > 1 || isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">1</span>}
            </div>
            <div>
              <h3 className={`font-medium ${step === 1 ? "text-cyan-400" : step > 1 ? "text-white" : "text-zinc-500"}`}>
                Connecting to AIVA
              </h3>
              <p className="text-sm text-zinc-500">
                Establishing secure connection to AIVA's AI music generation platform
              </p>
            </div>
            {step === 1 && <Loader2 className="ml-auto h-4 w-4 animate-spin text-cyan-400" />}
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${step > 2 || isCompleted ? "bg-cyan-500 text-black" : step === 2 ? "bg-zinc-800 text-cyan-400" : "bg-zinc-800 text-zinc-500"}`}
            >
              {step > 2 || isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">2</span>}
            </div>
            <div>
              <h3 className={`font-medium ${step === 2 ? "text-cyan-400" : step > 2 ? "text-white" : "text-zinc-500"}`}>
                Syncing music models
              </h3>
              <p className="text-sm text-zinc-500">Downloading and configuring AI music generation models</p>
            </div>
            {step === 2 && <Loader2 className="ml-auto h-4 w-4 animate-spin text-cyan-400" />}
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${step > 3 || isCompleted ? "bg-cyan-500 text-black" : step === 3 ? "bg-zinc-800 text-cyan-400" : "bg-zinc-800 text-zinc-500"}`}
            >
              {step > 3 || isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">3</span>}
            </div>
            <div>
              <h3 className={`font-medium ${step === 3 ? "text-cyan-400" : step > 3 ? "text-white" : "text-zinc-500"}`}>
                Configuring EDM presets
              </h3>
              <p className="text-sm text-zinc-500">Setting up EDM-specific music generation parameters</p>
            </div>
            {step === 3 && <Loader2 className="ml-auto h-4 w-4 animate-spin text-cyan-400" />}
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${isCompleted ? "bg-cyan-500 text-black" : step === 4 ? "bg-zinc-800 text-cyan-400" : "bg-zinc-800 text-zinc-500"}`}
            >
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">4</span>}
            </div>
            <div>
              <h3
                className={`font-medium ${step === 4 ? "text-cyan-400" : isCompleted ? "text-white" : "text-zinc-500"}`}
              >
                Finalizing integration
              </h3>
              <p className="text-sm text-zinc-500">Completing setup and verifying connection</p>
            </div>
            {step === 4 && !isCompleted && <Loader2 className="ml-auto h-4 w-4 animate-spin text-cyan-400" />}
          </div>
        </div>

        {isCompleted ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-cyan-500/10 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h3 className="font-medium text-white">AIVA Integration Complete!</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                You can now use AIVA's AI music generation features in your projects. Create professional EDM tracks
                with just a few clicks.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-600 hover:to-blue-600"
                onClick={onClose}
              >
                <Music className="mr-2 h-4 w-4" />
                Start Creating
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-cyan-800/50 text-cyan-400 hover:bg-cyan-950/30"
                onClick={onClose}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                AIVA Documentation
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              onClick={onClose}
            >
              Continue in background
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
