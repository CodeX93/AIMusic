"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useScrollAnimation, fadeIn } from "@/lib/animation-utils"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  threshold?: number
}

export function AnimatedSection({ children, className = "", threshold = 0.1 }: AnimatedSectionProps) {
  const [ref, isVisible] = useScrollAnimation(threshold)

  return (
    <motion.section
      ref={ref}
      initial="initial"
      animate={isVisible ? "animate" : "initial"}
      variants={fadeIn(0.6)}
      className={className}
    >
      {children}
    </motion.section>
  )
}
