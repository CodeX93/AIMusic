import { Toaster } from "@/components/ui/toaster"
import "../globals.css"

export const metadata = {
  title: "Authentication - Composition Converter",
  description: "Log in or sign up to Composition Converter, the AI music remix platform.",
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
      <Toaster />
    </div>
  )
}
