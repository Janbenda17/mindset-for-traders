"use client"

import { useData } from "@/contexts/data-context"
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
import { AlertTriangle } from "lucide-react"

export function LiveModeWarning() {
  const { showLiveWarning, setShowLiveWarning, switchToLive } = useData()

  return (
    <AlertDialog open={showLiveWarning} onOpenChange={setShowLiveWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Přepnout na Live režim?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>Pozor!</strong> Přepnutím na Live režim se:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Smažou všechna demo data</li>
              <li>Ztratíte přístup k ukázkovým obchodům a analýzám</li>
              <li>Budete pracovat pouze se svými skutečnými daty</li>
              <li>Tato akce je nevratná</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              Doporučujeme přepnout na Live režim až když jste si vyzkoušeli všechny funkce ve Virtual módu.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction onClick={switchToLive} className="bg-red-600 hover:bg-red-700">
            Ano, přepnout na Live
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
