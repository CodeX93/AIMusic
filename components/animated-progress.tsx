"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface AnimatedProgressProps {
  value: number
  max?: number
  showValue?: boolean
  color?: string
  height?: number
  className?: string
}

export function AnimatedProgress({
  value,
  max = 100,
  showValue = false,
  color = "bg-gradient-to-r from-cyan-500 to-blue-500",
  height = 8,
  className = "",
}: AnimatedProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div className={`relative ${className}`}>
      <Progress value={percentage} className={`h-[${height}px] bg-zinc-800`} indicatorClassName={color} />

      {showValue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute right-0 top-0 -translate-y-full transform"
        >
          <span className="text-xs font-medium text-cyan-400">{Math.round(percentage)}%</span>
        </motion.div>
      )}
    </div>
  )
}
