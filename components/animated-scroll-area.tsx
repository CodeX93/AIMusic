"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { type ReactNode, useRef, useState, useEffect } from "react"

interface AnimatedScrollAreaProps {
  children: ReactNode
  height?: string
  className?: string
}

export function AnimatedScrollArea({ children, height = "300px", className = "" }: AnimatedScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollbar, setShowScrollbar] = useState(false)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Update scroll percentage when scrolling
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollPercentage(percentage)
    }

    scrollElement.addEventListener("scroll", handleScroll)
    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle scrollbar drag
  const handleScrollbarDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const scrollElement = scrollRef.current
    if (!scrollElement || !isDragging) return

    const { clientY } = e
    const { top, height } = scrollElement.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((clientY - top) / height) * 100))

    const scrollPosition = (percentage / 100) * (scrollElement.scrollHeight - scrollElement.clientHeight)
    scrollElement.scrollTop = scrollPosition
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setShowScrollbar(true)}
      onMouseLeave={() => setShowScrollbar(false)}
      onMouseMove={handleScrollbarDrag}
      onMouseUp={() => setIsDragging(false)}
    >
      <div ref={scrollRef} className="custom-scrollbar overflow-y-auto" style={{ height }}>
        {children}
      </div>

      {/* Custom scrollbar */}
      <AnimatePresence>
        {showScrollbar && (
          <motion.div
            initial={{ opacity: 0, width: 3 }}
            animate={{ opacity: 1, width: 5 }}
            exit={{ opacity: 0, width: 3 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-0 h-full w-1 rounded-full bg-zinc-800"
          >
            <motion.div
              className="absolute right-0 w-full cursor-pointer rounded-full bg-cyan-500"
              style={{
                top: `${scrollPercentage}%`,
                height: "50px",
                transform: "translateY(-50%)",
              }}
              animate={{
                backgroundColor: isDragging ? "rgb(6, 182, 212)" : "rgb(34, 211, 238)",
              }}
              whileHover={{ backgroundColor: "rgb(6, 182, 212)" }}
              onMouseDown={() => setIsDragging(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
