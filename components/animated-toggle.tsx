"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"

interface AnimatedToggleProps {
  defaultChecked?: boolean
  label?: string
  description?: string
  onChange?: (checked: boolean) => void
  className?: string
}

export function AnimatedToggle({
  defaultChecked = false,
  label,
  description,
  onChange,
  className = "",
}: AnimatedToggleProps) {
  const [checked, setChecked] = useState(defaultChecked)

  const handleCheckedChange = (newChecked: boolean) => {
    setChecked(newChecked)
    if (onChange) onChange(newChecked)
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        {label && <div className="text-sm font-medium text-white">{label}</div>}
        {description && <div className="text-xs text-zinc-400">{description}</div>}
      </div>

      <Switch checked={checked} onCheckedChange={handleCheckedChange} />

      {/* Animated indicator */}
      {checked && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="ml-2 h-2 w-2 rounded-full bg-cyan-400"
        />
      )}
    </div>
  )
}
