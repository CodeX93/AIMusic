import { Music } from "lucide-react"

export default function PlaylistLoading() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 h-64 bg-zinc-800 rounded-lg flex items-center justify-center">
          <Music className="h-16 w-16 text-zinc-700" />
        </div>
        <div className="flex-1">
          <div className="h-8 w-48 bg-zinc-800 rounded mb-4"></div>
          <div className="h-4 w-96 bg-zinc-800 rounded mb-8"></div>
          <div className="flex gap-4 mb-8">
            <div className="h-10 w-24 bg-zinc-800 rounded"></div>
            <div className="h-10 w-10 bg-zinc-800 rounded-full"></div>
            <div className="h-10 w-10 bg-zinc-800 rounded-full"></div>
            <div className="h-10 w-10 bg-zinc-800 rounded-full"></div>
          </div>
          <div className="h-px w-full bg-zinc-800 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <div className="h-6 w-6 bg-zinc-800 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-zinc-800 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-zinc-800 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
