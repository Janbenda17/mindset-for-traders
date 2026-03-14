"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, User, Lock, Gift, Brain, Sparkles, TrendingUp, CheckCircle2, CreditCard, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export function SignupForm() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", acceptTerms: false, acceptMarketing: false })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { language } = useLanguage()
  const isEn = language === "en"

  const txt = {
    freeBanner: isEn ? "Virtual Mode FREE!" : "Virtual Mode FREE!",
    freeBannerSub: isEn ? "Start practicing with demo data instantly, upgrade to Live anytime" : "Start practicing with demo data instantly, upgrade to Live anytime",
    tagline: isEn ? "Start your journey to success" : "Start your journey to success",
    cardTitle: isEn ? "Create Account" : "Create Account",
    cardDesc: isEn ? "Join thousands of successful traders" : "Join thousands of successful traders",
    nameLabel: isEn ? "Full Name" : "Full Name",
    namePlaceholder: isEn ? "John Smith" : "John Smith",
    emailLabel: isEn ? "Email" : "Email",
    emailPlaceholder: isEn ? "your@email.com" : "your@email.com",
    passwordLabel: isEn ? "Password" : "Password",
    passwordPlaceholder: isEn ? "E.g: Trader2024" : "E.g: Trader2024",
    passwordReqs: isEn ? "Password requirements:" : "Password requirements:",
    reqMin6: isEn ? "At least 6 characters" : "At least 6 characters",
    reqLower: isEn ? "Lowercase letters (a-z)" : "Lowercase letters (a-z)",
    reqUpper: isEn ? "Uppercase letters (A-Z)" : "Uppercase letters (A-Z)",
    reqDigit: isEn ? "Digits (0-9)" : "Digits (0-9)",
    acceptTerms: isEn ? "I agree to the" : "I agree to the",
    terms: isEn ? "terms" : "terms",
    and: isEn ? "and" : "and",
    privacy: isEn ? "privacy policy" : "privacy policy",
    marketing: isEn ? "I want to receive trading tips and news" : "I want to receive trading tips and news",
    creatingAccount: isEn ? "Creating account..." : "Creating account...",
    startFree: isEn ? "Start for free" : "Start for free",
    alreadyAccount: isEn ? "Already have an account?" : "Already have an account?",
    signIn: isEn ? "Sign in" : "Sign in",
    howItWorks: isEn ? "How does it work?" : "Jak to funguje?",
    howItWorksSub: isEn ? "4 simple steps to better trading" : "4 jednoduché kroky k lepšímu tradingu",
    step1Title: isEn ? "Simple Registration" : "Jednoduchá registrace",
    step1Desc: isEn ? "Email, password and name. No nonsense. You're in within 30 seconds." : "Email, heslo a jméno. Žádné kraviny. Za 30 sekund jsi uvnitř.",
    step2Title: isEn ? "Virtual Mode FREE" : "Virtual režim ZDARMA",
    step2Desc: isEn ? "Instant access to the app with demo data. Try all features without risk." : "Okamžitý přístup k aplikaci s demo daty. Vyzkoušej všechny funkce bez rizika.",
    step2Badge: isEn ? "Free forever" : "Navždy zdarma",
    step3Title: isEn ? "Upgrade to Live anytime" : "Upgrade na Live kdykoliv",
    step3Desc: isEn ? "When you're ready for real trading, switch to Live mode." : "Když budeš připravený na skutečný trading, přepni do Live režimu.",
    step4Title: isEn ? "Track your real trades" : "Trackuj své skutečné obchody",
    step4Desc: isEn ? "In Live mode, log your real trades, get AI analyses and improve." : "V Live režimu zapisuj své reálné obchody, získej AI analýzy a zlepšuj se.",
    // Errors
    errName: isEn ? "Name is required" : "Jméno je povinné",
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
    if (!formData.name.trim()) newErrors.name = txt.errName
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
      const success = await register({ name: formData.name, email: formData.email, password: formData.password })
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side - Form */}
          <div>
            <div className="mb-6 p-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white shadow-2xl shadow-green-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-6 h-6 animate-bounce" />
                  <span className="font-bold text-lg">{txt.freeBanner}</span>
                </div>
                <p className="text-sm text-center text-green-50">{txt.freeBannerSub}</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl mb-4 shadow-2xl shadow-purple-500/50 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-lg opacity-50 animate-pulse" />
                <Brain className="w-10 h-10 text-white relative z-10" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-gradient">
                Trader Mindset
              </h1>
              <p className="text-gray-400">{txt.tagline}</p>
            </div>

            <Card className="shadow-2xl border-0 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50">
              <CardHeader className="space-y-2 pb-6 text-center">
                <CardTitle className="text-2xl font-bold text-white">{txt.cardTitle}</CardTitle>
                <CardDescription className="text-gray-400">{txt.cardDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.general && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertDescription className="text-red-400">{errors.general}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-300">{txt.nameLabel}</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input id="name" type="text" placeholder={txt.namePlaceholder} value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} className={`pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${errors.name ? "border-red-500/50" : ""}`} disabled={isLoading} />
                    </div>
                    {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">{txt.emailLabel}</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input id="email" type="email" placeholder={txt.emailPlaceholder} value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className={`pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${errors.email ? "border-red-500/50" : ""}`} disabled={isLoading} />
                    </div>
                    {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-300">{txt.passwordLabel}</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors z-10" />
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder={txt.passwordPlaceholder} value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className={`pl-12 pr-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${errors.password ? "border-red-500/50" : ""}`} disabled={isLoading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors z-10" disabled={isLoading}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-2">
                        <p className="text-xs font-medium text-gray-300">{txt.passwordReqs}</p>
                        <div className="space-y-1">
                          {[
                            { check: formData.password.length >= 6, label: txt.reqMin6 },
                            { check: /[a-z]/.test(formData.password), label: txt.reqLower },
                            { check: /[A-Z]/.test(formData.password), label: txt.reqUpper },
                            { check: /[0-9]/.test(formData.password), label: txt.reqDigit },
                          ].map((req, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs ${req.check ? "text-green-400" : "text-gray-500"}`}>
                              <div className={`w-3 h-3 rounded-full ${req.check ? "bg-green-500" : "bg-slate-600"}`} />
                              <span>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={(c) => handleInputChange("acceptTerms", c as boolean)} className={`mt-0.5 ${errors.acceptTerms ? "border-red-500/50" : ""}`} disabled={isLoading} />
                      <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer text-gray-300 leading-tight">
                        {txt.acceptTerms}{" "}
                        <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">{txt.terms}</Link>
                        {" "}{txt.and}{" "}
                        <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">{txt.privacy}</Link>
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-red-400">{errors.acceptTerms}</p>}
                    <div className="flex items-start space-x-3">
                      <Checkbox id="acceptMarketing" checked={formData.acceptMarketing} onCheckedChange={(c) => handleInputChange("acceptMarketing", c as boolean)} disabled={isLoading} className="mt-0.5" />
                      <Label htmlFor="acceptMarketing" className="text-sm font-normal cursor-pointer text-gray-400 leading-tight">{txt.marketing}</Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 text-base mt-6" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{txt.creatingAccount}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>{txt.startFree}</span>
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    {txt.alreadyAccount}{" "}
                    <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors underline-offset-2 hover:underline">{txt.signIn}</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - How it works */}
          <div className="space-y-6 lg:sticky lg:top-8">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{txt.howItWorks}</h2>
              <p className="text-gray-400">{txt.howItWorksSub}</p>
            </div>

            {[
              { num: 1, color: "purple", icon: <User className="w-5 h-5 text-purple-400" />, title: txt.step1Title, desc: txt.step1Desc, badge: null },
              { num: 2, color: "blue", icon: <Zap className="w-5 h-5 text-blue-400" />, title: txt.step2Title, desc: txt.step2Desc, badge: <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 w-fit"><CheckCircle2 className="w-4 h-4" /><span className="font-semibold">{txt.step2Badge}</span></div> },
              { num: 3, color: "green", icon: <Brain className="w-5 h-5 text-green-400" />, title: txt.step3Title, desc: txt.step3Desc, badge: <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 w-fit"><CreditCard className="w-4 h-4" /><span className="font-semibold">1499 Kč/month</span></div> },
              { num: 4, color: "orange", icon: <TrendingUp className="w-5 h-5 text-orange-400" />, title: txt.step4Title, desc: txt.step4Desc, badge: <div className="flex flex-wrap gap-2"><span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-gray-300">AI insights</span><span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-gray-300">Analytics</span><span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-gray-300">Team Club</span></div> },
            ].map((step) => (
              <Card key={step.num} className={`bg-slate-900/80 backdrop-blur-xl border-slate-700/50 relative overflow-hidden group hover:border-${step.color}-500/50 transition-all`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${step.color}-500 to-${step.color === "purple" ? "pink" : step.color === "blue" ? "cyan" : step.color === "green" ? "emerald" : "red"}-500`} />
                <CardContent className="pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-${step.color}-600 to-${step.color === "purple" ? "pink" : step.color === "blue" ? "cyan" : step.color === "green" ? "emerald" : "red"}-600 flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">{step.icon}{step.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{step.desc}</p>
                      {step.badge}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
