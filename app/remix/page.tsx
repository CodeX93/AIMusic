import { AIRemixStudio } from "@/components/ai-remix-studio"
import { EnhancedAudioPlayer } from "@/components/enhanced-audio-player"

export default function RemixPage() {
  const audioUrl = "" // Replace with actual audio URL if available

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Remix Studio</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create custom remixes with AI technology. Describe the sound you want, and our AI will generate a unique
            track.
          </p>
        </div>

        <AIRemixStudio />

        {audioUrl && (
          <EnhancedAudioPlayer audioUrl={audioUrl} fallbackUrl="/samples/edm-remix-sample.mp3" genre="edm" />
        )}

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm">
          <h3 className="font-medium mb-2">Tips for Great Remixes</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be specific about the mood and style you want</li>
            <li>Mention specific instruments or sounds</li>
            <li>Adjust the BPM to match the energy level you desire</li>
            <li>Try different genres for varied results</li>
            <li>Use the "Ultra" quality setting for the best audio fidelity</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
