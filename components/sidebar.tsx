"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, History, Library, CreditCard, Bell, Settings } from "lucide-react"
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-full w-[220px] bg-black border-r border-zinc-800">
      <div className="p-6">
        <Link href="/home" className="flex items-center justify-center py-4">
          <Image
            src="/images/prism-logo.png"
            alt="Dark Side of the Moon Logo"
            width={60}
            height={36}
            className="object-contain"
          />
        </Link>
      </div>

      <div className="space-y-1 px-3 py-2">
        <Link
          href="/home"
          className={`sidebar-link ${pathname === "/home" ? "active bg-cyan-500/10 text-cyan-400" : ""}`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/my-library"
          className={`sidebar-link ${pathname === "/my-library" ? "active bg-cyan-500/10 text-cyan-400" : ""}`}
        >
          <Library className="h-5 w-5" />
          <span>My Library</span>
        </Link>
        <Link
          href="/subscription"
          className={`sidebar-link ${pathname === "/subscription" ? "active bg-cyan-500/10 text-cyan-400" : ""}`}
        >
          <CreditCard className="h-5 w-5" />
          <span>Subscription</span>
        </Link>
      </div>

      <div className="absolute bottom-8 left-0 right-0 space-y-1 px-3 py-2">
        <Link
          href="/notifications"
          className={`sidebar-link ${pathname === "/notifications" ? "active bg-cyan-500/10 text-cyan-400" : ""}`}
        >
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </Link>
        <Link
          href="/settings"
          className={`sidebar-link ${pathname === "/settings" ? "active bg-cyan-500/10 text-cyan-400" : ""}`}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )
}
