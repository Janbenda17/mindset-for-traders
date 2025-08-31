"use client"

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
import { AlertTriangle, Trash2, Play } from "lucide-react"

interface LiveModeWarningProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LiveModeWarning({ open, onOpenChange, onConfirm }: LiveModeWarningProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">Přepnout na Live režim?</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trash2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800 mb-1">Všechna demo data budou smazána</p>
                <p className="text-sm text-orange-700">
                  Ukázkové obchody, záznamy v deníku a analýzy budou trvale odstraněny.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Play className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 mb-1">Začnete s čistými daty</p>
                <p className="text-sm text-green-700">Budete pracovat pouze se svými skutečnými obchody a záznamy.</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Tuto akci nelze vrátit zpět. Pokud si chcete zachovat demo data, můžete se kdykoli vrátit do Virtual režimu.
          </p>
        </AlertDialogDescription>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">Zrušit</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Přepnout na Live
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
