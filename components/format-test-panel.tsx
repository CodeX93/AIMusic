"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormatAdaptivePlayer } from "./format-adaptive-player"

const TEST_FORMATS = [
  { name: "MP3", extension: "mp3", path: "/samples/test-mp3.mp3" },
  { name: "WAV", extension: "wav", path: "/samples/test-wav.wav" },
  { name: "AAC", extension: "aac", path: "/samples/test-aac.aac" },
  { name: "M4A", extension: "m4a", path: "/samples/test-m4a.m4a" },
  { name: "OGG", extension: "ogg", path: "/samples/test-ogg.ogg" },
  { name: "FLAC", extension: "flac", path: "/samples/test-flac.flac" },
  { name: "WebM", extension: "webm", path: "/samples/test-webm.webm" },
  { name: "Opus", extension: "opus", path: "/samples/test-opus.opus" },
]

export function FormatTestPanel() {
  const [selectedFormat, setSelectedFormat] = useState(TEST_FORMATS[0])

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''

  return (
    <Card className="w-full shadow-lg border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>Audio Format Compatibility Test</CardTitle>
        <CardDescription>Test different audio formats to verify compatibility with your browser.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs
          defaultValue="mp3"
          onValueChange={(value) => {
            const format = TEST_FORMATS.find((f) => f.extension === value)
            if (format) setSelectedFormat(format)
          }}
        >
          <TabsList className="grid grid-cols-4 md:grid-cols-8">
            {TEST_FORMATS.map((format) => (
              <TabsTrigger key={format.extension} value={format.extension}>
                {format.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {TEST_FORMATS.map((format) => (
            <TabsContent key={format.extension} value={format.extension}>
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium mb-2">{format.name} Format</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Testing playback of {format.name} ({format.extension}) audio format.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">File path: {format.path}</p>
                </div>

                <FormatAdaptivePlayer
                  audioUrl={format.path}
                  fallbackUrl="/samples/edm-remix-sample.mp3"
                  title={`${format.name} Test`}
                  subtitle={`Testing ${format.name} format compatibility`}
                  autoplay={false}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">Browser detected: {userAgent}</p>
      </CardFooter>
    </Card>
  )
}
