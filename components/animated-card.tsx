"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { slideUp, useHoverAnimation } from "@/lib/animation-utils"

interface AnimatedCardProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  delay?: number
  className?: string
}

export function AnimatedCard({ children, header, footer, delay = 0, className = "" }: AnimatedCardProps) {
  const [isHovered, bindHover] = useHoverAnimation()

  return (
    <motion.div
      variants={slideUp(0.4, delay)}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
      {...bindHover}
      className={className}
    >
      <Card className={`transition-shadow duration-300 ${isHovered ? "shadow-lg shadow-cyan-900/20" : "shadow-md"}`}>
        {header && <CardHeader>{header}</CardHeader>}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </motion.div>
  )
}
