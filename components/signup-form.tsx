"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Gift, Brain, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export function SignupForm() {
  const [formData, setFormData] = useState({ email: "", password: "", acceptTerms: false, acceptMarketing: false })
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
    emailLabel: isEn ? "Email" : "Email",
    emailPlaceholder: isEn ? "your@email.com" : "your@email.com",
    passwordLabel: isEn ? "Password" : "Password",
    passwordPlaceholder: isEn ? "E.g: trader1" : "E.g: trader1",
    passwordReqs: isEn ? "Password requirements:" : "Password requirements:",
    reqMin6: isEn ? "At least 6 characters" : "At least 6 characters",
    reqDigit: isEn ? "At least 1 number" : "Alespoň 1 číslo",
    acceptTerms: isEn ? "I agree to the" : "I agree to the",
    terms: isEn ? "terms" : "terms",
    and: isEn ? "and" : "and",
    privacy: isEn ? "privacy policy" : "privacy policy",
    marketing: isEn ? "I want to receive trading tips and news" : "I want to receive trading tips and news",
    creatingAccount: isEn ? "Creating account..." : "Creating account...",
    startFree: isEn ? "Start for free" : "Start for free",
    alreadyAccount: isEn ? "Already have an account?" : "Already have an account?",
    signIn: isEn ? "Sign in" : "Sign in",
    // Errors
    errEmail: isEn ? "Email is required" : "Email je povinný",
    errEmailFormat: isEn ? "Invalid email format" : "Neplatný formát emailu",
    errPassword: isEn ? "Password is required" : "Heslo je povinné",
    errPasswordReqs: isEn ? "Password must be at least 6 characters and contain 1 number" : "Heslo musí mít alespoň 6 znaků a obsahovat 1 číslo",
    errTerms: isEn ? "You must agree to the terms of service" : "Musíte souhlasit s podmínkami použití",
    errRegFailed: isEn ? "Registration failed. Please try again." : "Registrace se nezdařila. Zkuste to prosím znovu.",
    errGeneral: isEn ? "An error occurred. Please try again." : "Došlo k chybě. Zkuste to prosím znovu.",
  }

  const validatePassword = (password: string): string[] => {
    const errs: string[] = []
    if (password.length < 6) errs.push("min6")
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
      const success = await register({ email: formData.email, password: formData.password })
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

      <div className="w-full max-w-md relative z-10">
        <div>
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
        </div>
      </div>
    </div>
  )
}
