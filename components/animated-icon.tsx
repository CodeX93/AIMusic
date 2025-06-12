"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedIconProps {
  icon: ReactNode
  size?: "sm" | "md" | "lg"
  color?: string
  hoverColor?: string
  animation?: "pulse" | "bounce" | "spin" | "wiggle" | "none"
  className?: string
  onClick?: () => void
}

export function AnimatedIcon({
  icon,
  size = "md",
  color = "text-cyan-400",
  hoverColor = "text-cyan-300",
  animation = "none",
  className = "",
  onClick,
}: AnimatedIconProps) {
  // Size classes
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  // Animation variants
  const animations = {
    pulse: {
      animate: {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    bounce: {
      animate: {
        y: [0, -5, 0],
        transition: {
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    spin: {
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        },
      },
    },
    wiggle: {
      animate: {
        rotate: [-3, 3, -3],
        transition: {
          duration: 0.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        },
      },
    },
    none: {},
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${color} transition-colors duration-200 hover:${hoverColor} ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      variants={animations[animation]}
      animate={animation !== "none" ? "animate" : undefined}
      onClick={onClick}
    >
      {icon}
    </motion.div>
  )
}
