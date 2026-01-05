"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Shield, Lock } from "lucide-react"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
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

const LiveModeToggle = () => {
  const { isLiveMode, switchToLive } = useLiveMode()
  const { user } = useAuth()
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleModeSwitch = () => {
    if (!isLiveMode) {
      // Always show confirmation dialog
      setShowConfirmDialog(true)
    } else {
      toast({
        title: "Live Mode je aktivní",
        description: "Live Mode je trvalý a nelze ho vypnout. Pracuješ s reálnými daty.",
        variant: "default",
      })
    }
  }

  const confirmSwitch = async () => {
    setShowConfirmDialog(false)

    toast({
      title: "Přepínám do Live Mode...",
      description: "Stránka se automaticky obnoví",
    })

    try {
      await switchToLive()
    } catch (error) {
      toast({
        title: "Chyba při přepínání",
        description: "Nepodařilo se přepnout do Live Mode. Zkus to prosím znovu.",
        variant: "destructive",
      })
    }
  }

  if (isLiveMode) {
    return (
      <Button
        onClick={handleModeSwitch}
        variant="ghost"
        className="
          relative overflow-hidden
          bg-gradient-to-r from-green-600/20 to-emerald-600/20 
          hover:from-green-600/30 hover:to-emerald-600/30 
          border-2 border-green-500/50
          transition-all duration-300 px-4 py-2 rounded-lg
          cursor-default
        "
      >
        <div className="relative flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <Zap className="w-4 h-4 text-green-400" />
          <span className="font-semibold text-green-300">Live Mode</span>
          <Lock className="w-3 h-3 text-green-400/50 ml-1" />
        </div>
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={handleModeSwitch}
        variant="ghost"
        className="
          relative overflow-hidden group
          bg-gradient-to-r from-amber-600/20 to-orange-600/20 
          hover:from-amber-600/30 hover:to-orange-600/30 
          border-2 border-amber-500/50
          transition-all duration-300 px-4 py-2 rounded-lg
        "
      >
        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
            bg-gradient-to-r from-amber-500/10 to-orange-500/10
          "
        />

        <div className="relative flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-amber-300">Virtual Mode</span>
          <span className="text-xs text-amber-400/70 ml-2">→ Přepnout na Live</span>
        </div>
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Přepnout do Live Mode?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="font-semibold text-foreground">Live Mode je TRVALÝ a NELZE ho vypnout.</div>
                <div>Po přepnutí:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Veškerá demo data budou smazána</li>
                  <li>Začneš pracovat s reálnými daty</li>
                  <li>Změny jsou trvalé a nelze vrátit zpět</li>
                  <li>Stránka se automaticky obnoví</li>
                </ul>
                <div className="font-semibold text-red-500 mt-4">Toto rozhodnutí je NEVRATNÉ. Jsi připraven?</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch} className="bg-green-600 hover:bg-green-700">
              Ano, přepnout do Live Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default LiveModeToggle
