export function PremiumBanner() {
  return (
    <div className="fixed bottom-4 left-4 z-50 w-[200px] rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 text-black">
      <h3 className="mb-1 font-bold">Go Premium & Remix Like a Pro!</h3>
      <p className="mb-3 text-xs">
        Get unlimited AI-powered remixes with high-quality EDM effects & exclusive sound packs!
      </p>
      <button className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-zinc-800">
        Upgrade Now
      </button>
    </div>
  )
}
