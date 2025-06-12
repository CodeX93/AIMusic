import React from "react"
import { TextToAudioForm } from "@/components/text-to-audio-form"
import { TrackGallery } from "@/components/track-gallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MusicStudioPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Web Music AI Studio</h1>

      <Tabs defaultValue="text-to-audio" className="w-full max-w-4xl mx-auto mb-12">
        <TabsList className="grid w-full grid-cols-1 mb-8">
          <TabsTrigger value="text-to-audio">Text-to-Audio</TabsTrigger>
        </TabsList>

        <TabsContent value="text-to-audio">
          <TextToAudioForm />
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <TrackGallery />
      </div>
    </div>
  )
}
