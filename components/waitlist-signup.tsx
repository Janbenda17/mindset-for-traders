"use client"

import { useState } from "react"
import { Mail, Zap, CheckCircle2, AlertCircle, Users, Sparkles, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WaitlistSignup() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [discountCode, setDiscountCode] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const waitlistCount = 627

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
        console.log("[v0] Waitlist signup success - Full data:", data)
        setStatus("success")
        setDiscountCode(data.discountCode)
        setEmail("")
        console.log("[v0] Discount code set to:", data.discountCode)
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
    <div className="w-full relative">
      {status === "idle" && (
        <div className="space-y-6 relative">
          {/* Animated glowing background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-3xl blur-2xl opacity-75 animate-pulse"></div>
          <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50"></div>

          {/* Content container */}
          <div className="relative space-y-6">
            {/* Social Proof Badge - Enhanced */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-cyan-500/50 rounded-full backdrop-blur-md shadow-2xl shadow-cyan-500/20">
                <div className="flex items-center gap-2 animate-bounce" style={{ animationDelay: "0s" }}>
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {waitlistCount}+ členy
                  </span>
                </div>
                <div className="text-cyan-400/50">|</div>
                <div className="flex items-center gap-2 animate-bounce" style={{ animationDelay: "0.2s" }}>
                  <Rocket className="w-5 h-5 text-purple-400" />
                  <span className="text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    čeká na start
                  </span>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center space-y-3">
              <h3 className="text-3xl sm:text-4xl font-bold text-white">
                Chceš být
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  mezi prvními?
                </span>
              </h3>
              <p className="text-lg text-slate-300 font-semibold">
                Přidej se a získej <span className="text-yellow-400 font-bold">5% slevu</span> navždy
              </p>
            </div>

            {/* Main signup form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                {/* Animated border glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>

                {/* Form container */}
                <div className="relative bg-slate-950/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-1">
                  <div className="flex flex-col sm:flex-row gap-3 p-4">
                    <div className="flex-1 relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="tvůj@email.cz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all text-base font-medium"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !email}
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-xl disabled:opacity-50 whitespace-nowrap transition-all hover:shadow-2xl hover:shadow-cyan-500/50 text-base shadow-xl shadow-cyan-500/30"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Přidávám...
                        </div>
                      ) : (
                        "Dostat přístup"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Benefits Grid - Enhanced */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-yellow-500/50 transition-all backdrop-blur">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-bold text-yellow-300">5% sleva</div>
                      <div className="text-sm text-slate-400">navždy na všechno</div>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-purple-500/50 transition-all backdrop-blur">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-bold text-purple-300">Early access</div>
                      <div className="text-sm text-slate-400">než všichni ostatní</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-center text-slate-400 font-medium">
                Bez spamu, bez závazků. Zrušit kdykoliv.
              </p>
            </form>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="relative space-y-6">
          {/* Success glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 rounded-3xl blur-2xl opacity-75"></div>

          <div className="relative space-y-4 p-8 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-2 border-emerald-500/50 rounded-2xl backdrop-blur-md shadow-2xl shadow-emerald-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-emerald-300 text-xl">Skvěle! Jsi na waitlistu!</p>
                <p className="text-slate-300 mt-2 text-base">
                  Pošleme ti notifikaci den předtím než spustíme, plus den samotného spuštění. Buď připravený!
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border-2 border-emerald-500/30 rounded-xl p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Tvůj kód pro 5% slevu:</p>
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-800/40 border border-slate-700 rounded-lg">
                <code className="text-2xl font-mono font-bold text-cyan-400">{discountCode}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(discountCode)
                    alert("Kód zkopírován!")
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/30"
                >
                  Kopírovat
                </button>
              </div>
            </div>

            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-slate-400 hover:text-slate-200 underline font-medium transition-colors"
            >
              Přidat jiný email
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 to-pink-600/30 rounded-2xl blur-xl opacity-50"></div>
          <div className="relative flex items-start gap-4 p-6 bg-red-900/30 border-2 border-red-500/50 rounded-2xl backdrop-blur">
            <div className="p-2 bg-red-500/20 rounded-lg mt-1">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-300 text-base">{errorMsg}</p>
              <button
                onClick={() => setStatus("idle")}
                className="text-sm text-red-300 hover:text-red-200 underline mt-3 font-medium transition-colors"
              >
                Zkusit znovu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
