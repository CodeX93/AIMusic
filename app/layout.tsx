import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { AudioProvider } from "@/components/audio-context"

export const metadata = {
  title: "Composition Converter - AI Music Remix Platform",
  description: "Transform your audio or create entirely new tracks with our powerful AI remixing platform."
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-dark min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AudioProvider>{children}</AudioProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
