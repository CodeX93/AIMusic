"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import type { ReactNode } from "react"

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode
  icon?: ReactNode
  iconPosition?: "left" | "right"
  hoverScale?: number
}

export function AnimatedButton({
  children,
  icon,
  iconPosition = "left",
  hoverScale = 1.03,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div whileHover={{ scale: hoverScale }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
      <Button {...props}>
        {icon && iconPosition === "left" && (
          <motion.span className="mr-2" initial={{ x: 0 }} whileHover={{ x: -2 }} transition={{ duration: 0.2 }}>
            {icon}
          </motion.span>
        )}

        {children}

        {icon && iconPosition === "right" && (
          <motion.span className="ml-2" initial={{ x: 0 }} whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
            {icon}
          </motion.span>
        )}
      </Button>
    </motion.div>
  )
}
