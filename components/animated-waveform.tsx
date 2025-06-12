"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface AnimatedWaveformProps {
  color?: string
  height?: number
  width?: number
  amplitude?: number
  frequency?: number
  speed?: number
  className?: string
}

export function AnimatedWaveform({
  color = "rgb(34, 211, 238)", // cyan-400
  height = 60,
  width = 300,
  amplitude = 20,
  frequency = 0.02,
  speed = 0.1,
  className = "",
}: AnimatedWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Scale context for device pixel ratio
    ctx.scale(dpr, dpr)

    // Animation function
    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw wave
      ctx.beginPath()
      ctx.moveTo(0, height / 2)

      const time = Date.now() * speed

      for (let x = 0; x < width; x++) {
        const y = Math.sin(x * frequency + time) * amplitude + height / 2
        ctx.lineTo(x, y)
      }

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [color, height, width, amplitude, frequency, speed])

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}
