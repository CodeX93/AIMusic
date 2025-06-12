"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Music, Wand2, Headphones, ChevronRight } from "lucide-react"
import Image from "next/image"

export default function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const slides = [
    {
      title: "Welcome to Composition Converter",
      description: "Transform your music with AI-powered tools and create amazing remixes",
      icon: <Music className="h-12 w-12 text-cyan-400" />,
    },
    {
      title: "Remix Any Song",
      description: "Upload your favorite tracks and transform them into EDM, Hip-Hop, and more",
      icon: <Headphones className="h-12 w-12 text-cyan-400" />,
    },
    {
      title: "Text to Audio",
      description: "Convert your text into AI-generated music or vocals with just a few clicks",
      icon: <Wand2 className="h-12 w-12 text-cyan-400" />,
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentSlide, slides.length])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      router.push("/")
    }
  }

  const handleSkip = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Image src="/images/dark-side-logo.png" alt="Composition Converter" width={120} height={72} />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-center mb-8">
              <div className="bg-cyan-500/20 rounded-full p-6">{slides[currentSlide].icon}</div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{slides[currentSlide].title}</h2>
              <p className="text-zinc-400">{slides[currentSlide].description}</p>
            </div>

            <div className="flex justify-center mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${index === currentSlide ? "bg-cyan-500" : "bg-zinc-700"}`}
                />
              ))}
            </div>

            <div className="flex flex-col space-y-4">
              <Button onClick={handleNext} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium">
                {currentSlide < slides.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>

              {currentSlide < slides.length - 1 && (
                <button type="button" className="text-sm text-zinc-400 hover:text-zinc-300" onClick={handleSkip}>
                  Skip tour
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
