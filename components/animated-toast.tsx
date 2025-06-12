"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Toast, type ToastProps } from "@/components/ui/toast"
import { forwardRef } from "react"

export const AnimatedToast = forwardRef<HTMLDivElement, ToastProps>(({ ...props }, ref) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
      >
        <Toast ref={ref} {...props} />
      </motion.div>
    </AnimatePresence>
  )
})

AnimatedToast.displayName = "AnimatedToast"
