"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
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
  const [rememberMe, setRememberMe] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const { login, resetPassword } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()

  const isEn = language === "en"

  const txt = {
    welcomeBack: isEn ? "Welcome back! Sign in to your account" : "Vítejte zpět! Přihlaste se k vašemu účtu",
    title: isEn ? "Sign In" : "Přihlášení",
    subtitle: isEn ? "Enter your login credentials" : "Zadejte své přihlašovací údaje",
    emailLabel: isEn ? "Email / Username" : "Email / Uživatelské jméno",
    emailPlaceholder: isEn ? "your@email.com" : "váš@email.com",
    passwordLabel: isEn ? "Password" : "Heslo",
    rememberMe: isEn ? "Remember login credentials" : "Zapamatovat přihlašovací údaje",
    signingIn: isEn ? "Signing in..." : "Přihlašuji...",
    retryIn: (s: number) => isEn ? `Retry in ${s}s` : `Zkuste znovu za ${s}s`,
    signIn: isEn ? "Sign In" : "Přihlásit se",
    forgotPassword: isEn ? "Forgot your password?" : "Zapomněli jste heslo?",
    noAccount: isEn ? "Don't have an account?" : "Nemáte účet?",
    registerFree: isEn ? "Register for free" : "Zaregistrujte se zdarma",
    secure: isEn ? "Secure" : "Zabezpečené",
    fast: isEn ? "Fast" : "Rychlé",
    smart: isEn ? "Smart" : "Chytré",
    resetTitle: isEn ? "Reset Password" : "Obnovení hesla",
    resetDesc: isEn ? "Enter your email and we'll send you instructions to reset your password" : "Zadejte svůj email a pošleme vám pokyny pro obnovení hesla",
    emailLabel2: isEn ? "Email" : "Email",
    sendInstructions: isEn ? "Send Instructions" : "Poslat instrukce",
    sending: isEn ? "Sending..." : "Odesílám...",
    back: isEn ? "Back" : "Zpět",
    // Errors
    errWaitSeconds: (s: number) => isEn ? `Please wait ${s} seconds before trying again` : `Prosím počkejte ${s} sekund než zkusíte znovu`,
    errEnterEmail: isEn ? "Please enter your email" : "Prosím zadejte svůj email",
    errEnterPassword: isEn ? "Please enter your password" : "Prosím zadejte své heslo",
    errLoginFailed: isEn ? "Login failed. Please verify your email and password." : "Přihlášení se nezdařilo. Ověřte prosím váš email a heslo.",
    errTooManyAttempts: isEn ? "Too many attempts. Please wait 30 seconds and try again." : "Příliš mnoho pokusů. Počkejte 30 sekund a zkuste znovu.",
    errLoginError: isEn ? "Login error. Please verify your email and password." : "Chyba při přihlášení. Ověřte prosím váš email a heslo.",
    errEnterValidEmail: isEn ? "Please enter your email" : "Prosím zadejte svůj email",
    errValidEmail: isEn ? "Please enter a valid email" : "Prosím zadejte platný email",
    errResetError: isEn ? "Error sending email. Please try again." : "Chyba při odesílání emailu. Zkuste prosím znovu.",
  }

  useEffect(() => {
    const savedEmail = localStorage.getItem("mindtrader-saved-email")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    if (countdownSeconds > 0) {
      const timer = setTimeout(() => setCountdownSeconds(countdownSeconds - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdownSeconds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (countdownSeconds > 0) { setError(txt.errWaitSeconds(countdownSeconds)); return }
    if (!email.trim()) { setError(txt.errEnterEmail); return }
    if (!password) { setError(txt.errEnterPassword); return }
    if (isLoading) return
    setIsLoading(true)
    try {
      if (rememberMe) {
        localStorage.setItem("mindtrader-saved-email", email.trim())
      } else {
        localStorage.removeItem("mindtrader-saved-email")
      }
      const success = await login(email.trim(), password)
      if (!success) {
        setError(txt.errLoginFailed)
        setPassword("")
      }
      setIsLoading(false)
    } catch (error: any) {
      if (error?.message?.includes("rate limit")) {
        setCountdownSeconds(30)
        setError(txt.errTooManyAttempts)
      } else {
        setError(txt.errLoginError)
      }
      setPassword("")
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!resetEmail.trim()) { setError(txt.errEnterValidEmail); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) { setError(txt.errValidEmail); return }
    setResetLoading(true)
    try {
      const success = await resetPassword(resetEmail.trim())
      if (success) { setShowResetForm(false); setResetEmail("") }
    } catch (error) {
      setError(txt.errResetError)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/50 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-lg opacity-50 animate-pulse" />
            <Brain className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3 animate-gradient">
            Trader Mindset
          </h1>
          <p className="text-gray-400 text-base">{txt.welcomeBack}</p>
        </div>

        <Card className="shadow-2xl border-0 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50">
          <CardHeader className="space-y-2 pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-white">{txt.title}</CardTitle>
            <CardDescription className="text-gray-400">{txt.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {!showResetForm ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">{txt.emailLabel}</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="email" type="text" placeholder={txt.emailPlaceholder} value={email}
                      onChange={(e) => { setEmail(e.target.value); setError("") }}
                      className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">{txt.passwordLabel}</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="password" type="password" placeholder="••••••••" value={password}
                      onChange={(e) => { setPassword(e.target.value); setError("") }}
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
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} className="border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                  <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer select-none">{txt.rememberMe}</Label>
                </div>

                <Button type="submit" className="w-full h-13 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || countdownSeconds > 0}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{txt.signingIn}</span>
                    </div>
                  ) : countdownSeconds > 0 ? (
                    <span>{txt.retryIn(countdownSeconds)}</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>{txt.signIn}</span>
                    </div>
                  )}
                </Button>

                <button type="button" onClick={() => { setShowResetForm(true); setError("") }} className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium mt-2">
                  {txt.forgotPassword}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{txt.resetTitle}</h3>
                  <p className="text-sm text-gray-400">{txt.resetDesc}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium text-gray-300">{txt.emailLabel2}</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input id="reset-email" type="email" placeholder={txt.emailPlaceholder} value={resetEmail} onChange={(e) => { setResetEmail(e.target.value); setError("") }} className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all" required />
                  </div>
                </div>
                {error && <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3"><p className="text-red-400 text-sm font-medium">{error}</p></div>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={resetLoading} className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50">
                    {resetLoading ? <div className="flex items-center space-x-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{txt.sending}</span></div> : txt.sendInstructions}
                  </Button>
                  <Button type="button" onClick={() => { setShowResetForm(false); setResetEmail(""); setError("") }} variant="outline" className="flex-1 h-12 border-slate-700 text-gray-300 hover:bg-slate-800/50 rounded-xl">
                    {txt.back}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {txt.noAccount}{" "}
                <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline-offset-2 hover:underline">
                  {txt.registerFree}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/30">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">{txt.secure}</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">{txt.fast}</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">{txt.smart}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
