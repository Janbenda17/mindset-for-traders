"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  Gift,
  Brain,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  CreditCard,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptMarketing: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Jméno je povinné"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email je povinný"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Neplatný formát emailu"
    }

    if (!formData.password) {
      newErrors.password = "Heslo je povinné"
    } else if (formData.password.length < 6) {
      newErrors.password = "Heslo musí mít alespoň 6 znaků"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Hesla se neshodují"
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Musíte souhlasit s podmínkami použití"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      console.log("[v0] Attempting registration...")
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (!success) {
        console.log("[v0] Registration returned false")
        setIsLoading(false)
        setErrors({ general: "Registrace se nezdařila. Zkuste to prosím znovu." })
      }
      // Success - context redirects to /onboarding
    } catch (error: any) {
      console.error("[v0] Signup form error:", error)
      setIsLoading(false)
      setErrors({ general: error?.message || "Došlo k chybě. Zkuste to prosím znovu." })
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side - Form */}
          <div>
            {/* Premium Banner */}
            <div className="mb-6 p-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white shadow-2xl shadow-green-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-6 h-6 animate-bounce" />
                  <span className="font-bold text-lg">Virtual režim ZDARMA!</span>
                </div>
                <p className="text-sm text-center text-green-50">
                  Začni okamžitě trenovat s demo daty, upgrade na Live kdykoliv
                </p>
              </div>
            </div>

            {/* Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl mb-4 shadow-2xl shadow-purple-500/50 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-lg opacity-50 animate-pulse" />
                <Brain className="w-10 h-10 text-white relative z-10" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-gradient">
                Trader Mindset
              </h1>
              <p className="text-gray-400">Začněte svou cestu k úspěchu</p>
            </div>

            <Card className="shadow-2xl border-0 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50">
              <CardHeader className="space-y-2 pb-6 text-center">
                <CardTitle className="text-2xl font-bold text-white">Vytvořit účet</CardTitle>
                <CardDescription className="text-gray-400">Připojte se k tisícům úspěšných traderů</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.general && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertDescription className="text-red-400">{errors.general}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                      Celé jméno
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Jan Novák"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${
                          errors.name ? "border-red-500/50" : ""
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jan@email.cz"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${
                          errors.email ? "border-red-500/50" : ""
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                      Heslo
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors z-10" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimálně 6 znaků"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`pl-12 pr-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${
                          errors.password ? "border-red-500/50" : ""
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors z-10"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                      Potvrdit heslo
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors z-10" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Zopakujte heslo"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`pl-12 pr-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${
                          errors.confirmPassword ? "border-red-500/50" : ""
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors z-10"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                        className={`mt-0.5 ${errors.acceptTerms ? "border-red-500/50" : ""}`}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="acceptTerms"
                        className="text-sm font-normal cursor-pointer text-gray-300 leading-tight"
                      >
                        Souhlasím s{" "}
                        <Link
                          href="/terms"
                          className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                        >
                          podmínkami
                        </Link>{" "}
                        a{" "}
                        <Link
                          href="/privacy"
                          className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                        >
                          ochranou údajů
                        </Link>
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-red-400">{errors.acceptTerms}</p>}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptMarketing"
                        checked={formData.acceptMarketing}
                        onCheckedChange={(checked) => handleInputChange("acceptMarketing", checked as boolean)}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="acceptMarketing"
                        className="text-sm font-normal cursor-pointer text-gray-400 leading-tight"
                      >
                        Chci dostávat trading tipy a novinky
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 text-base mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Vytvářím účet...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Začít zdarma</span>
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Už máte účet?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-purple-400 hover:text-purple-300 transition-colors underline-offset-2 hover:underline"
                    >
                      Přihlásit se
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - How it works */}
          <div className="space-y-6 lg:sticky lg:top-8">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Jak to funguje?</h2>
              <p className="text-gray-400">4 jednoduché kroky k lepšímu tradingu</p>
            </div>

            {/* Step 1 */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardContent className="pt-8 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-400" />
                      Jednoduchá registrace
                    </h3>
                    <p className="text-sm text-gray-400">
                      Email, heslo a jméno. Žádné kraviny. Za 30 sekund jsi uvnitř.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardContent className="pt-8 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      Virtual režim ZDARMA
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Okamžitý přístup k aplikaci s demo daty. Vyzkoušej všechny funkce bez rizika.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 w-fit">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-semibold">Navždy zdarma</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 relative overflow-hidden group hover:border-green-500/50 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardContent className="pt-8 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/30">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-green-400" />
                      Upgrade na Live kdykoliv
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Když budeš připravený na skutečný trading, přepni do Live režimu.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 w-fit">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">1499 Kč/měsíc</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 relative overflow-hidden group hover:border-orange-500/50 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              <CardContent className="pt-8 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      Trackuj své skutečné obchody
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      V Live režimu zapisuj své reálné obchody, získej AI analýzy a zlepšuj se.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-gray-300">AI insights</span>
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-gray-300">Analytics</span>
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-gray-300">Team Club</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 text-center">
              <p className="text-white font-semibold mb-2">Žádné závazky. Zruš kdykoliv.</p>
              <p className="text-sm text-gray-400">
                Virtual režim zůstává zdarma navždy. Upgrade jen když budeš připravený.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
