"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Music, Wand2, Headphones, Mic, ChevronRight } from "lucide-react"
import Image from "next/image"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    genres: [],
    features: [],
    experience: null,
  })
  const router = useRouter()

  const genres = [
    { id: "edm", label: "EDM" },
    { id: "hiphop", label: "Hip Hop" },
    { id: "rock", label: "Rock" },
    { id: "pop", label: "Pop" },
    { id: "jazz", label: "Jazz" },
    { id: "classical", label: "Classical" },
    { id: "ambient", label: "Ambient" },
    { id: "lofi", label: "Lo-Fi" },
  ]

  const features = [
    { id: "remix", label: "Remix songs", icon: <Music className="h-5 w-5" /> },
    { id: "text-to-audio", label: "Text to audio", icon: <Wand2 className="h-5 w-5" /> },
    { id: "voice-clone", label: "Voice cloning", icon: <Mic className="h-5 w-5" /> },
    { id: "effects", label: "Audio effects", icon: <Headphones className="h-5 w-5" /> },
  ]

  const experienceLevels = [
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
    { id: "professional", label: "Professional" },
  ]

  const handleGenreToggle = (genreId) => {
    setPreferences((prev) => {
      if (prev.genres.includes(genreId)) {
        return { ...prev, genres: prev.genres.filter((id) => id !== genreId) }
      } else {
        return { ...prev, genres: [...prev.genres, genreId] }
      }
    })
  }

  const handleFeatureToggle = (featureId) => {
    setPreferences((prev) => {
      if (prev.features.includes(featureId)) {
        return { ...prev, features: prev.features.filter((id) => id !== featureId) }
      } else {
        return { ...prev, features: [...prev.features, featureId] }
      }
    })
  }

  const handleExperienceSelect = (experienceId) => {
    setPreferences((prev) => ({
      ...prev,
      experience: experienceId,
    }))
  }

  const handleNext = () => {
    if (step === 1 && preferences.genres.length === 0) {
      toast({
        title: "Select genres",
        description: "Please select at least one genre to continue",
        variant: "destructive",
      })
      return
    }

    if (step === 2 && preferences.features.length === 0) {
      toast({
        title: "Select features",
        description: "Please select at least one feature to continue",
        variant: "destructive",
      })
      return
    }

    if (step === 3 && !preferences.experience) {
      toast({
        title: "Select experience level",
        description: "Please select your experience level to continue",
        variant: "destructive",
      })
      return
    }

    if (step < 4) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would save the user preferences here
      toast({
        title: "Setup complete",
        description: "Your preferences have been saved",
      })

      router.push("/welcome")
    } catch (error) {
      toast({
        title: "Setup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What genres do you like?</h2>
            <p className="text-zinc-400">Select the music genres you're interested in</p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              {genres.map((genre) => (
                <div
                  key={genre.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    preferences.genres.includes(genre.id)
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                  onClick={() => handleGenreToggle(genre.id)}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={preferences.genres.includes(genre.id)}
                      className="h-4 w-4 border-zinc-600 data-[state=checked]:bg-cyan-500"
                    />
                    <span className="ml-2 text-zinc-300">{genre.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What features interest you?</h2>
            <p className="text-zinc-400">Select the features you want to use</p>

            <div className="grid grid-cols-1 gap-3 mt-6">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    preferences.features.includes(feature.id)
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                  onClick={() => handleFeatureToggle(feature.id)}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={preferences.features.includes(feature.id)}
                      className="h-4 w-4 border-zinc-600 data-[state=checked]:bg-cyan-500"
                    />
                    <div className="ml-3 flex items-center">
                      <div className="mr-2 text-cyan-400">{feature.icon}</div>
                      <span className="text-zinc-300">{feature.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What's your experience level?</h2>
            <p className="text-zinc-400">This helps us tailor the experience for you</p>

            <div className="grid grid-cols-1 gap-3 mt-6">
              {experienceLevels.map((level) => (
                <div
                  key={level.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    preferences.experience === level.id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                  onClick={() => handleExperienceSelect(level.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        preferences.experience === level.id ? "bg-cyan-500" : "bg-zinc-700"
                      }`}
                    />
                    <span className="ml-2 text-zinc-300">{level.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="bg-cyan-500/20 rounded-full p-6">
                <Music className="h-12 w-12 text-cyan-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white">You're all set!</h2>
            <p className="text-zinc-400">
              We've customized your experience based on your preferences. You're ready to start creating amazing music!
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Image src="/images/dark-side-logo.png" alt="Composition Converter" width={120} height={72} />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full ${
                    s === step ? "bg-cyan-500 w-8" : s < step ? "bg-cyan-700 w-8" : "bg-zinc-700 w-6"
                  }`}
                />
              ))}
            </div>

            {renderStep()}

            <div className="mt-8">
              <Button
                onClick={handleNext}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : step < 4 ? (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>

              {step < 4 && (
                <button
                  type="button"
                  className="mt-4 w-full text-sm text-zinc-400 hover:text-zinc-300"
                  onClick={() => router.push("/")}
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
