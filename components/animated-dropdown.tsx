"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface AnimatedDropdownProps {
  trigger: ReactNode
  children: ReactNode
  className?: string
}

export function AnimatedDropdown({ trigger, children, className = "" }: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen(!isOpen)

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={toggleDropdown} className="flex cursor-pointer items-center">
        {trigger}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-1">
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Dropdown content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 min-w-[200px] rounded-md border border-cyan-800/50 bg-zinc-900 p-2 shadow-lg shadow-cyan-900/20"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
