"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-black/80 px-6 backdrop-blur-sm">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] bg-zinc-900 pl-9 text-sm text-zinc-400 focus:ring-cyan-500"
          />
        </div>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-cyan-400">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=32&width=32&query=avatar"
            alt="User"
            className="h-8 w-8 rounded-full"
          />
        </Button>
      </div>
    </header>
  )
}
