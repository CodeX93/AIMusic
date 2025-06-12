"use client"

import { useState } from "react"

interface AudioFallbackProps {
  playlists: {
    id: number
    title: string
    audioUrl: string
  }[]
}

export function AudioFallback({ playlists }: AudioFallbackProps) {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)

  // This component is only for debugging audio issues in preview mode
  return (
    <div className="hidden">
      {playlists.map((playlist) => (
        <div key={playlist.id}>
          <button onClick={() => setSelectedTrack(playlist.id)}>Play {playlist.title}</button>
          {selectedTrack === playlist.id && (
            <audio controls autoPlay src={playlist.audioUrl} onEnded={() => setSelectedTrack(null)} />
          )}
        </div>
      ))}
    </div>
  )
}
