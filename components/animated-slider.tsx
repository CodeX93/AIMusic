"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"

interface AnimatedSliderProps {
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  label?: string
  onChange?: (value: number[]) => void
  className?: string
}

export function AnimatedSlider({
  defaultValue = [50],
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  label,
  onChange,
  className = "",
}: AnimatedSliderProps) {
  const [value, setValue] = useState(defaultValue)

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue)
    if (onChange) onChange(newValue)
  }

  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-400">{label}</label>
          {showValue && (
            <motion.span
              key={value[0]}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-cyan-400"
            >
              {value[0]}
            </motion.span>
          )}
        </div>
      )}

      <Slider
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        className="py-1"
      />
    </div>
  )
}
