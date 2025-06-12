"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { staggerChildren } from "@/lib/animation-utils"

interface AnimatedLayoutProps {
  children: ReactNode
  delay?: number
  staggerDelay?: number
}

export function AnimatedLayout({ children, delay = 0, staggerDelay = 0.05 }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerChildren(staggerDelay)}
      transition={{ delay }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
