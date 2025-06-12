"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page when the root page is accessed
    router.push("/auth/login")
  }, [router])

  return null // This page just redirects, so no content needed
}
