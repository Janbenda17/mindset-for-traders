"use client"

import type React from "react"

import { Lock, Sparkles, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface LockedFeatureProps {
  title?: string
  description?: string
  features?: string[]
  icon?: React.ReactNode
  requiresLive?: boolean
}

export function LockedFeature({
  title = "Premium Feature",
  description = "This feature is available in live mode with Premium subscription",
  features = ["Real-time AI analysis", "Personalized recommendations", "Advanced insights"],
  icon,
  requiresLive = false,
}: LockedFeatureProps) {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const { isLiveMode, switchToLive, canSwitchModes } = useData()
  const [showLiveDialog, setShowLiveDialog] = useState(false)

  const handleUnlock = () => {
    // Check if user is authenticated
    if (!authUser) {
      // Not authenticated - redirect to signup
      router.push("/signup")
      return
    }

    if (requiresLive && !isLiveMode && canSwitchModes) {
      setShowLiveDialog(true)
    } else {
      router.push("/upgrade")
    }
  }

  const handleSwitchToLive = () => {
    switchToLive()
    setShowLiveDialog(false)
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="max-w-2xl w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                  {icon || <Lock className="w-12 h-12 text-white" />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CardTitle className="text-3xl font-bold text-white">{title}</CardTitle>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {requiresLive ? "Live + Premium" : "Premium"}
                </Badge>
              </div>
              <CardDescription className="text-gray-400 text-lg">{description}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {requiresLive && !isLiveMode && canSwitchModes && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-200">
                  💡 Tato funkce vyžaduje Live režim. Přepněte do Live režimu pro aktivaci.
                </p>
              </div>
            )}

            <Button
              onClick={handleUnlock}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {!authUser
                ? "Zaregistrovat se pro přístup"
                : requiresLive && !isLiveMode && canSwitchModes
                  ? "Přepnout do Live režimu"
                  : "Odemknout Premium funkce"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              {!authUser
                ? "Zaregistrujte se pro přístup ke všem funkcím"
                : requiresLive
                  ? "Aktivní Live režim + Premium předplatné vyžadováno"
                  : "Upgrade na Premium pro přístup ke všem funkcím"}
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showLiveDialog} onOpenChange={setShowLiveDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Přepnout do Live režimu?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Pro použití MindTrader AI musíte přepnout do Live režimu. V Live režimu budete pracovat s reálnými daty a
              všechna demo data budou vymazána.
              <br />
              <br />
              <strong className="text-amber-400">Upozornění:</strong> Tento krok je nevratný. Po přepnutí do Live režimu
              se již nebudete moci vrátit k demo datům.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSwitchToLive}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Přepnout do Live
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
