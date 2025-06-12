"use client"

import { useState, useEffect } from "react"
import { OptimizedMusicPopup } from "./optimized-music-popup"

export function HomePopupManager() {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Always show popup after a short delay, without checking localStorage
    const timer = setTimeout(() => {
      setShowPopup(true)
    }, 1500) // Show after 1.5 seconds for better UX

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShowPopup(false)
  }

  return <>{showPopup && <OptimizedMusicPopup onClose={handleClose} />}</>
}
