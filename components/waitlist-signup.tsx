"use client"

import { useState } from "react"
import { Mail, Zap, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WaitlistSignup() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [discountCode, setDiscountCode] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("idle")
    setErrorMsg("")

    try {
      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setDiscountCode(data.discountCode)
        setEmail("")
        console.log("[v0] Waitlist signup success:", data.email)
      } else {
        setStatus("error")
        setErrorMsg(data.error || "Chyba při přidání na waitlist")
        console.error("[v0] Waitlist error:", data.error)
      }
    } catch (error) {
      setStatus("error")
      setErrorMsg("Něco se pokazilo. Zkus to prosím znovu.")
      console.error("[v0] Waitlist fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {status === "idle" && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="Tvůj email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !email}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Přidávám..." : "Přidej se na waitlist"}
            </Button>
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            5% sleva pro první členy waitlistu
          </p>
        </form>
      )}

      {status === "success" && (
        <div className="space-y-4 p-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-emerald-300 text-lg">Právě jsi na waitlistu!</p>
              <p className="text-slate-300 mt-2">
                Pošleme ti notifikaci den předtím než spustíme, plus den samotného spuštění.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Tvůj kód pro 5% slevu:</p>
            <div className="flex items-center justify-between gap-3">
              <code className="text-xl font-mono font-bold text-blue-400">{discountCode}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(discountCode)
                  alert("Kód zkopírován!")
                }}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm font-semibold rounded border border-blue-600/50 transition-colors"
              >
                Kopírovat
              </button>
            </div>
          </div>

          <button
            onClick={() => setStatus("idle")}
            className="text-sm text-slate-400 hover:text-slate-300 underline"
          >
            Přidat jiný email
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">{errorMsg}</p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-red-300 hover:text-red-200 underline mt-2"
            >
              Zkusit znovu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
