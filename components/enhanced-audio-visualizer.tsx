"use client"

import { useRef, useEffect, useState } from "react"

interface EnhancedAudioVisualizerProps {
  audioElement?: HTMLAudioElement | null
  color?: string
  backgroundColor?: string
  height?: number
  className?: string
  isPlaying?: boolean
}

export function EnhancedAudioVisualizer({
  audioElement,
  color = "rgb(34, 211, 238)", // cyan-400
  backgroundColor = "rgba(8, 47, 73, 0.3)", // cyan-900/30
  height = 60,
  className = "",
  isPlaying = false,
}: EnhancedAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null)
  const [source, setSource] = useState<MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number>(0)

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!audioElement) return

    const context = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyzerNode = context.createAnalyser()
    analyzerNode.fftSize = 256

    const bufferLength = analyzerNode.frequencyBinCount
    const dataArr = new Uint8Array(bufferLength)

    const sourceNode = context.createMediaElementSource(audioElement)
    sourceNode.connect(analyzerNode)
    analyzerNode.connect(context.destination)

    setAudioContext(context)
    setAnalyser(analyzerNode)
    setDataArray(dataArr)
    setSource(sourceNode)

    return () => {
      if (source) {
        source.disconnect()
      }
      if (analyser) {
        analyser.disconnect()
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close()
      }
      cancelAnimationFrame(animationRef.current)
    }
  }, [audioElement])

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !analyser || !dataArray) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      if (!canvas || !ctx || !analyser || !dataArray) return

      // Set canvas dimensions
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Draw background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate bar width based on canvas width and data length
      const barWidth = canvas.width / dataArray.length

      // Draw bars
      ctx.fillStyle = color

      for (let i = 0; i < dataArray.length; i++) {
        // If not playing, use a sine wave for idle animation
        let barHeight
        if (!isPlaying) {
          const time = Date.now() * 0.001
          const amplitude = 10 * window.devicePixelRatio
          const frequency = 0.15
          barHeight = Math.sin(i * frequency + time) * amplitude + 15 * window.devicePixelRatio
        } else {
          barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        }

        // Ensure minimum height for aesthetics
        barHeight = Math.max(barHeight, 2 * window.devicePixelRatio)

        const x = i * barWidth
        const y = canvas.height - barHeight

        // Draw rounded bars
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth - 1 * window.devicePixelRatio, barHeight, [2 * window.devicePixelRatio])
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [analyser, dataArray, color, backgroundColor, height, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-[${height}px] rounded-md ${className}`}
      style={{ height: `${height}px` }}
    />
  )
}
