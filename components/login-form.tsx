"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Mail, Lock, LogIn, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(0)
  const [error, setError] = useState("")
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds(countdownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdownSeconds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check if still in countdown from rate limit
    if (countdownSeconds > 0) {
      setError(`Prosím počkejte ${countdownSeconds} sekund než zkusíte znovu`)
      return
    }

    // Validace emailu
    if (!email.trim()) {
      setError("Prosím zadejte svůj email")
      return
    }

    // Validace hesla
    if (!password) {
      setError("Prosím zadejte své heslo")
      return
    }

    // Prevent double submission
    if (isLoading) {
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Attempting login for:", email.trim())

      // Do NOT save password to localStorage - security risk
      localStorage.removeItem("mindtrader-saved-email")
      localStorage.removeItem("mindtrader-saved-password")

      // Call login with trimmed email
      const success = await login(email.trim(), password)

      if (!success) {
        console.error("[v0] Login failed")
        setError("Přihlášení se nezdařilo. Ověřte prosím váš email a heslo.")
        setPassword("")
      }
      
      setIsLoading(false)
    } catch (error: any) {
      console.error("[v0] Login error:", error.message)
      
      // If rate limit error, set countdown
      if (error?.message?.includes("rate limit")) {
        setCountdownSeconds(30)
        setError("Příliš mnoho pokusů. Počkejte 30 sekund a zkuste znovu.")
      } else {
        setError("Chyba při přihlášení. Ověřte prosím váš email a heslo.")
      }
      
      setPassword("")
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!resetEmail.trim()) {
      setError("Prosím zadejte svůj email")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      setError("Prosím zadejte platný email")
      return
    }

    setError("")
    alert(`Email pro reset hesla byl poslán na: ${resetEmail}`)
    setShowResetForm(false)
    setResetEmail("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/50 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-lg opacity-50 animate-pulse" />
            <Brain className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3 animate-gradient">
            Trader Mindset
          </h1>
          <p className="text-gray-400 text-base">Vítejte zpět! Přihlaste se k vašemu účtu</p>
        </div>

        <Card className="shadow-2xl border-0 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50">
          <CardHeader className="space-y-2 pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-white">Přihlášení</CardTitle>
            <CardDescription className="text-gray-400">Zadejte své přihlašovací údaje</CardDescription>
          </CardHeader>
          <CardContent>
            {!showResetForm ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email / Uživatelské jméno
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="váš@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Heslo
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError("")
                      }}
                      className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 animate-in fade-in">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer select-none">
                    Zapamatovat přihlašovací údaje
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-13 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || countdownSeconds > 0}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Přihlašuji...</span>
                    </div>
                  ) : countdownSeconds > 0 ? (
                    <span>Zkuste znovu za {countdownSeconds}s</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>Přihlásit se</span>
                    </div>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(true)
                    setError("")
                  }}
                  className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium mt-2"
                >
                  Zapomněli jste heslo?
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Obnovení hesla</h3>
                  <p className="text-sm text-gray-400">
                    Zadejte svůj email a pošleme vám pokyny pro obnovení hesla
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium text-gray-300">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="váš@email.com"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value)
                        setError("")
                      }}
                      className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 animate-in fade-in">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
                  >
                    Poslat instrukce
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false)
                      setResetEmail("")
                      setError("")
                    }}
                    variant="outline"
                    className="flex-1 h-12 border-slate-700 text-gray-300 hover:bg-slate-800/50 rounded-xl"
                  >
                    Zpět
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Nemáte účet?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline-offset-2 hover:underline"
                >
                  Zaregistrujte se zdarma
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/30">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Zabezpečené</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Rychlé</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">Chytré</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
