"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, Shield, Lock, Download, Crown } from "lucide-react"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { offerMigration, migrateVirtualDataToLive } from "@/lib/data-migration"
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
  const router = useRouter()
  const { isLiveMode, switchToLive } = useLiveMode()
  const { user } = useAuth()
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  const handleModeSwitch = () => {
    if (!isLiveMode) {
      // Check if user is authenticated first
      if (!user) {
        console.log("[v0] Guest user trying to switch to Live - redirecting to signup")
        toast({
          title: "Vyžaduje se registrace",
          description: "Pro přepnutí do Live módu se musíš nejdřív zaregistrovat. Přesměrovávám...",
        })
        setTimeout(() => {
          router.push("/signup")
        }, 1500)
        return
      }

      // Live Mode (real trade journaling) is available to every free
      // account -- it's the core product loop and shouldn't be paywalled.
      // Premium (paid or in-trial) unlocks the AI coach / advanced insights
      // on top of it, but writing your own real data is always free.
      console.log("[v0] Allowing live mode switch (free tier)")

      // Check if user has data worth migrating
      if (user && offerMigration(user.id)) {
        setShowMigrationDialog(true)
      } else {
        setShowConfirmDialog(true)
      }
    } else {
      toast({
        title: "Live Mode je aktivní",
        description: "Live Mode je trvalý a nelze ho vypnout. Pracuješ s reálnými daty.",
        variant: "default",
      })
    }
  }

  const handleMigrationChoice = async (migrate: boolean) => {
    setShowMigrationDialog(false)

    if (migrate && user) {
      setIsMigrating(true)
      toast({
        title: "Migruji demo data...",
        description: "Přenášíme tvoje demo obchody do live databáze",
      })

      const success = await migrateVirtualDataToLive(user.id)
      setIsMigrating(false)

      if (!success) {
        // Migration failed, don't switch to live
        return
      }

      // Wait a moment for user to see success toast
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    // Now switch to live mode
    confirmSwitch()
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
        disabled={isMigrating}
        className="
          relative overflow-hidden group
          bg-gradient-to-r from-amber-600/20 to-orange-600/20 
          hover:from-amber-600/30 hover:to-orange-600/30 
          border-2 border-amber-500/50
          transition-all duration-300 px-4 py-2 rounded-lg
          disabled:opacity-50
        "
      >
        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
            bg-gradient-to-r from-amber-500/10 to-orange-500/10
          "
        />

        <div className="relative flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <Shield className="w-3 h-3 text-amber-400" />
          <span className="font-semibold text-amber-300 text-xs md:text-sm">{isMigrating ? "Migruji..." : "Virtual"}</span>
          {!isMigrating && (
            <span className="text-xs text-amber-400/70">→ Live</span>
          )}
        </div>
      </Button>

      <AlertDialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Přenést demo data do Live módu?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>Máš demo data, která by mohla být užitečná v Live módu:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Demo obchody a jejich analýzy</li>
                  <li>Morning checks a readiness záznamy</li>
                  <li>Journal entries a poznámky</li>
                  <li>Trading cíle a progress</li>
                </ul>
                <div className="font-semibold text-foreground mt-4">Chceš tato demo data přenést do Live databáze?</div>
                <div className="text-xs text-muted-foreground">
                  Pokud ne, data zůstanou pouze v demo režimu a Live režim začne s čistým štítem.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleMigrationChoice(false)}>
              Ne, začít s čistým štítem
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMigrationChoice(true)} className="bg-blue-600 hover:bg-blue-700">
              Ano, přenést demo data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Přepnout do Live Mode?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="font-semibold text-foreground">Live Mode je TRVALÝ a NELZE ho vypnout.</div>
                <div>Po přepnutí:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Začneš pracovat s reálnými daty</li>
                  <li>Změny jsou trvalé a ukládají se do databáze</li>
                  <li>Nelze se vrátit zpět do Virtual Mode</li>
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
