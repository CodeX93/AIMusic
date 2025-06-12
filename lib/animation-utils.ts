"use client"

import { useEffect, useState } from "react"

// Stagger children animations
export const staggerChildren = (delay = 0.05) => ({
  animate: {
    transition: {
      staggerChildren: delay,
    },
  },
})

// Fade in animation preset
export const fadeIn = (duration = 0.5, delay = 0) => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration * 0.75, ease: "easeIn" },
  },
})

// Slide up animation preset
export const slideUp = (duration = 0.5, delay = 0, y = 20) => ({
  initial: { opacity: 0, y },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1.0] },
  },
  exit: {
    opacity: 0,
    y: y / 2,
    transition: { duration: duration * 0.75, ease: "easeIn" },
  },
})

// Scale animation preset
export const scaleIn = (duration = 0.5, delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1.0] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: duration * 0.75, ease: "easeIn" },
  },
})

// Custom hook for entrance animations
export const useEntranceAnimation = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [delay])

  return isVisible
}

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(ref)

    return () => {
      if (ref) observer.unobserve(ref)
    }
  }, [ref, threshold])

  return [setRef, isVisible] as const
}

// Custom hook for hover animations
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false)

  const bindHover = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onFocus: () => setIsHovered(true),
    onBlur: () => setIsHovered(false),
  }

  return [isHovered, bindHover] as const
}

// Utility for wave animation (for audio visualizers)
export const generateWavePoints = (width: number, height: number, amplitude = 20, frequency = 0.02, speed = 0.1) => {
  const points: number[] = []
  const time = Date.now() * speed

  for (let i = 0; i <= width; i += 5) {
    const y = Math.sin(i * frequency + time) * amplitude + height / 2
    points.push(y)
  }

  return points
}
