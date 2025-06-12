"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { staggerChildren, slideUp } from "@/lib/animation-utils"

interface AnimatedListProps {
  children: ReactNode[]
  delay?: number
  staggerDelay?: number
  className?: string
}

export function AnimatedList({ children, delay = 0, staggerDelay = 0.05, className = "" }: AnimatedListProps) {
  return (
    <motion.ul
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerChildren(staggerDelay)}
      transition={{ delay }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.li key={index} variants={slideUp(0.4, index * staggerDelay)} className="list-none">
          {child}
        </motion.li>
      ))}
    </motion.ul>
  )
}
