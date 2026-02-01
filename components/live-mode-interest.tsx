"use client"

import { useState, useEffect } from "react"
import { X, Brain } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { usePathname } from "next/navigation"

export function LiveModeInterest() {
  const { user } = useAuth()
  const { isLiveMode } = useData()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  // Skrytí cesty - Landing, About, Product Tour
  const hiddenPaths = ["/landing", "/about", "/product-tour"]
  const isHiddenPath = hiddenPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))

  useEffect(() => {
    if (user || isLiveMode || isHiddenPath) {
      setIsOpen(false)
      return
    }
    const timer = setTimeout(() => setIsOpen(true), 4000)
    return () => clearTimeout(timer)
  }, [user, isLiveMode, isHiddenPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch("/api/live-mode-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setEmail("")
      setIsOpen(false)
    } catch (err) {
      console.error("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-xs">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-lg"></div>
      <div className="relative bg-slate-900 border border-purple-500/30 rounded-xl p-4 shadow-lg backdrop-blur">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 p-1 hover:bg-slate-800 rounded transition"
        >
          <X className="w-3 h-3 text-slate-400" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-cyan-400" />
          <p className="text-sm font-semibold text-white">Zajímá tě Live verze?</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "..." : "OK"}
          </button>
        </form>
      </div>
    </div>
  )
}
