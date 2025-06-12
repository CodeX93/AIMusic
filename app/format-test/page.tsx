"use client"

import dynamic from "next/dynamic"

const FormatTestPanel = dynamic(() => import("@/components/format-test-panel").then(mod => mod.FormatTestPanel), { ssr: false })

export default function FormatTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Audio Format Compatibility Test</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Test various audio formats to verify compatibility with your browser and our player.
          </p>
        </div>

        <FormatTestPanel />

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
          <h3 className="font-medium mb-2">About Audio Format Compatibility</h3>
          <p className="mb-2">
            Different browsers support different audio formats. Our player automatically detects format compatibility
            and falls back to supported formats when necessary.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>MP3: Supported in all major browsers</li>
            <li>WAV: Supported in all major browsers</li>
            <li>AAC/M4A: Supported in all major browsers</li>
            <li>OGG: Supported in Chrome, Firefox, and Edge (not Safari)</li>
            <li>FLAC: Supported in Chrome, Firefox, and Edge (not Safari)</li>
            <li>WebM: Supported in Chrome, Firefox, and Edge (not Safari)</li>
            <li>Opus: Supported in Chrome and Firefox (limited support elsewhere)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
