"use client"

import { useState, useEffect } from "react"
import { X, Zap, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LiveModeInterest() {
  const { user } = useAuth()
  const { isLiveMode } = useData()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Don't show if user is authenticated or in live mode
  useEffect(() => {
    if (user || isLiveMode) {
      setIsOpen(false)
      return
    }

    // Show after 3 seconds if in virtual mode
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [user, isLiveMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/live-mode-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Chyba při ukládání")
        return
      }

      setSubmitted(true)
      setEmail("")

      // Close after 3 seconds
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      setError("Chyba připojení")
      console.error("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      {/* Bubble container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur-xl"></div>

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-green-400 font-semibold">Díky!</p>
              <p className="text-slate-400 text-sm mt-1">Brzy ti pošleme info o Live verzi</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Zajímá tě Live verze?</h3>
                  <p className="text-xs text-slate-400">Získej přístup jako první</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Input
                    type="email"
                    placeholder="Tvůj email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 text-white placeholder-slate-500 h-9 text-sm"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold disabled:opacity-50 h-9 text-sm"
                >
                  {loading ? "Odesílám..." : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Přihlásit se
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-3">
                Bezpečné a bez spamu ✓
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
