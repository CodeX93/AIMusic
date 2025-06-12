"use client"

import { motion } from "framer-motion"

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg"
  color?: string
  type?: "spinner" | "dots" | "pulse"
  text?: string
  className?: string
}

export function AnimatedLoader({
  size = "md",
  color = "text-cyan-400",
  type = "spinner",
  text,
  className = "",
}: AnimatedLoaderProps) {
  // Size classes
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  // Render spinner loader
  if (type === "spinner") {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <motion.div
          className={`border-2 rounded-full ${color} border-t-transparent ${sizeClasses[size]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        {text && <p className={`mt-2 ${color} ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  // Render dots loader
  if (type === "dots") {
    const dotSize = {
      sm: "w-1 h-1",
      md: "w-2 h-2",
      lg: "w-3 h-3",
    }

    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="flex space-x-2">
          <motion.div
            className={`rounded-full ${color} ${dotSize[size]}`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
          />
          <motion.div
            className={`rounded-full ${color} ${dotSize[size]}`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
          />
          <motion.div
            className={`rounded-full ${color} ${dotSize[size]}`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
          />
        </div>
        {text && <p className={`mt-2 ${color} ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  // Render pulse loader
  if (type === "pulse") {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <motion.div
          className={`rounded-full ${color} ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
        {text && <p className={`mt-2 ${color} ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  return null
}
