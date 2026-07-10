"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Brain, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export function SignupForm() {
  const [formData, setFormData] = useState({ email: "", password: "", acceptTerms: false })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [presaleStats, setPresaleStats] = useState<{ total: number; claimed: number } | null>(null)
  const { register } = useAuth()
  const { language } = useLanguage()
  const isEn = language === "en"

  // Same real presale-slot count the homepage shows - no fabricated
  // countdown, just the actual number of claimed founding-member spots.
  useEffect(() => {
    let cancelled = false
    fetch('/api/presale-stats')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPresaleStats(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const txt = {
    presaleBadge: isEn ? "Presale" : "Předprodej",
    presaleTitle: isEn ? "First 30 founding members keep this presale pricing" : "Prvních 30 zakládajících členů má tuhle předprodejní cenu",
    presaleClaimed: isEn ? "claimed" : "obsazeno",
    presaleTotal: isEn ? "total spots" : "míst celkem",
    cardTitle: isEn ? "Create your account" : "Vytvořit účet",
    cardDesc: isEn ? "Just email and password - takes 30 seconds" : "Jen email a heslo - zabere to 30 sekund",
    emailLabel: isEn ? "Email" : "Email",
    emailPlaceholder: isEn ? "your@email.com" : "vas@email.com",
    passwordLabel: isEn ? "Password" : "Heslo",
    passwordReqs: isEn ? "Password requirements:" : "Požadavky na heslo:",
    reqMin6: isEn ? "At least 6 characters" : "Alespoň 6 znaků",
    reqLower: isEn ? "Lowercase letters (a-z)" : "Malá písmena (a-z)",
    reqUpper: isEn ? "Uppercase letters (A-Z)" : "Velká písmena (A-Z)",
    reqDigit: isEn ? "Digits (0-9)" : "Číslice (0-9)",
    acceptTerms: isEn ? "I agree to the" : "Souhlasím s",
    terms: isEn ? "terms" : "podmínkami použití",
    and: isEn ? "and" : "a",
    privacy: isEn ? "privacy policy" : "zásadami ochrany soukromí",
    creatingAccount: isEn ? "Creating account..." : "Vytvářím účet...",
    startFree: isEn ? "Create account" : "Vytvořit účet",
    alreadyAccount: isEn ? "Already have an account?" : "Už máte účet?",
    signIn: isEn ? "Sign in" : "Přihlásit se",
    // Errors
    errEmail: isEn ? "Email is required" : "Email je povinný",
    errEmailFormat: isEn ? "Invalid email format" : "Neplatný formát emailu",
    errPassword: isEn ? "Password is required" : "Heslo je povinné",
    errPasswordReqs: isEn ? "Password must contain: lower + upper case letters + numbers (min. 6 chars)" : "Heslo musí obsahovat: malá + velká písmena + čísla (min. 6 znaků)",
    errTerms: isEn ? "You must agree to the terms of service" : "Musíte souhlasit s podmínkami použití",
    errRegFailed: isEn ? "Registration failed. Please try again." : "Registrace se nezdařila. Zkuste to prosím znovu.",
    errGeneral: isEn ? "An error occurred. Please try again." : "Došlo k chybě. Zkuste to prosím znovu.",
  }

  const validatePassword = (password: string): string[] => {
    const errs: string[] = []
    if (password.length < 6) errs.push("min6")
    if (!/[a-z]/.test(password)) errs.push("lower")
    if (!/[A-Z]/.test(password)) errs.push("upper")
    if (!/[0-9]/.test(password)) errs.push("digit")
    return errs
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) newErrors.email = txt.errEmail
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = txt.errEmailFormat
    if (!formData.password) newErrors.password = txt.errPassword
    else if (validatePassword(formData.password).length > 0) newErrors.password = txt.errPasswordReqs
    if (!formData.acceptTerms) newErrors.acceptTerms = txt.errTerms
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    try {
      const derivedName = formData.email.split("@")[0] || "Trader"
      const success = await register({ name: derivedName, email: formData.email, password: formData.password })
      if (!success) { setIsLoading(false); setErrors({ general: txt.errRegFailed }) }
    } catch (error: any) {
      setIsLoading(false)
      setErrors({ general: error?.message || txt.errGeneral })
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: "" })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-2xl mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MindTrader</h1>
        </div>

        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-300">{txt.presaleBadge}</span>
          </div>
          <p className="text-sm text-slate-300 leading-snug mb-3">{txt.presaleTitle}</p>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-700"
              style={{
                width: presaleStats ? `${Math.max(4, (presaleStats.claimed / presaleStats.total) * 100)}%` : '4%',
              }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>{presaleStats ? presaleStats.claimed : '···'} {txt.presaleClaimed}</span>
            <span>{presaleStats ? presaleStats.total : 30} {txt.presaleTotal}</span>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white">{txt.cardTitle}</CardTitle>
            <CardDescription className="text-slate-400">{txt.cardDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400">{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-300">{txt.emailLabel}</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={txt.emailPlaceholder}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 ${errors.email ? "border-red-500/50" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">{txt.passwordLabel}</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 ${errors.password ? "border-red-500/50" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-1">
                    <p className="text-xs font-medium text-slate-400">{txt.passwordReqs}</p>
                    {[
                      { check: formData.password.length >= 6, label: txt.reqMin6 },
                      { check: /[a-z]/.test(formData.password), label: txt.reqLower },
                      { check: /[A-Z]/.test(formData.password), label: txt.reqUpper },
                      { check: /[0-9]/.test(formData.password), label: txt.reqDigit },
                    ].map((req, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs ${req.check ? "text-emerald-400" : "text-slate-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${req.check ? "bg-emerald-500" : "bg-slate-600"}`} />
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(c) => handleInputChange("acceptTerms", c as boolean)}
                  className={`mt-0.5 ${errors.acceptTerms ? "border-red-500/50" : ""}`}
                  disabled={isLoading}
                />
                <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer text-slate-400 leading-tight">
                  {txt.acceptTerms}{" "}
                  <Link href="/terms" className="text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2">{txt.terms}</Link>
                  {" "}{txt.and}{" "}
                  <Link href="/privacy" className="text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2">{txt.privacy}</Link>
                </Label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-red-400">{errors.acceptTerms}</p>}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-semibold rounded-lg mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{txt.creatingAccount}</span>
                  </div>
                ) : (
                  txt.startFree
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                {txt.alreadyAccount}{" "}
                <Link href="/login" className="font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors underline-offset-2 hover:underline">{txt.signIn}</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
