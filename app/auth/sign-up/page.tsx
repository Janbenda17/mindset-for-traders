"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const validatePassword = (pwd: string) => {
    return {
      hasMinLength: pwd.length >= 6,
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumbers: /[0-9]/.test(pwd),
    }
  }

  const passwordReqs = validatePassword(password)
  const isPasswordValid = Object.values(passwordReqs).every(Boolean)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError("Password must contain: lowercase + uppercase letters + numbers (min. 6 characters)")
      setIsLoading(false)
      return
    }

    console.log("[v0] Starting registration for:", email)

    const success = await register({ email, password, name: name || "Trader" })

    if (!success) {
      setError("Registrace se nezdařila. Zkuste to znovu.")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="w-full max-w-sm">
        <Card className="border-blue-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Registrace</CardTitle>
            <CardDescription className="text-slate-400">Vytvořte si nový účet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-slate-200">
                    Jméno (volitelné)
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Vaše jméno"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vas@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Heslo
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Např: Trader2024"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    disabled={isLoading}
                  />
                  
                  {password && (
                    <div className="mt-2 p-3 bg-slate-800/30 rounded border border-slate-700/50 space-y-1.5">
                      <p className="text-xs font-medium text-gray-300">Požadavky:</p>
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-2 ${passwordReqs.hasMinLength ? "text-green-400" : "text-gray-500"}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordReqs.hasMinLength ? "bg-green-500" : "bg-slate-600"}`} />
                          Min. 6 znaků
                        </div>
                        <div className={`flex items-center gap-2 ${passwordReqs.hasLowercase ? "text-green-400" : "text-gray-500"}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordReqs.hasLowercase ? "bg-green-500" : "bg-slate-600"}`} />
                          Malá písmena (a-z)
                        </div>
                        <div className={`flex items-center gap-2 ${passwordReqs.hasUppercase ? "text-green-400" : "text-gray-500"}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordReqs.hasUppercase ? "bg-green-500" : "bg-slate-600"}`} />
                          Velká písmena (A-Z)
                        </div>
                        <div className={`flex items-center gap-2 ${passwordReqs.hasNumbers ? "text-green-400" : "text-gray-500"}`}>
                          <div className={`w-2 h-2 rounded-full ${passwordReqs.hasNumbers ? "bg-green-500" : "bg-slate-600"}`} />
                          Číslice (0-9)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-slate-200">
                    Zopakujte heslo
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || (password && !isPasswordValid)}
                >
                  {isLoading ? "Vytvářím účet..." : "Zaregistrovat se"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-400">
                Již máte účet?{" "}
                <Link href="/login" className="text-blue-400 underline underline-offset-4">
                  Přihlásit se
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
