import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { PremiumBanner } from "@/components/premium-banner"
import { DummyModeBanner } from "@/app/dummy-banner"

export default function SettingsLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-[220px] flex-1">
        <Header />
        <DummyModeBanner />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </div>
      <PremiumBanner />
    </div>
  )
}
