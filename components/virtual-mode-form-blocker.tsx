"use client"

import type React from "react"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/hooks/use-toast"
import { Lock } from "lucide-react"

interface VirtualModeFormBlockerProps {
  children: React.ReactNode
  showOverlay?: boolean
}

export function VirtualModeFormBlocker({ children, showOverlay = true }: VirtualModeFormBlockerProps) {
  const { isLiveMode } = useData()
  const { toast } = useToast()

  const handleBlockedClick = (e: React.MouseEvent) => {
    if (!isLiveMode) {
      e.preventDefault()
      e.stopPropagation()
      toast({
        title: "Virtual Mode - pouze pro zobrazení",
        description: "Ve Virtual Mode nelze vyplňovat formuláře. Upgraduj na Premium a přepni do Live Mode pro plnou funkcionalitu.",
        variant: "destructive",
      })
    }
  }

  if (!isLiveMode && showOverlay) {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-50">{children}</div>
        <div
          onClick={handleBlockedClick}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center cursor-not-allowed group hover:bg-slate-900/60 transition-all"
        >
          <div className="bg-slate-800/90 border-2 border-amber-500/50 rounded-lg p-4 flex items-center gap-3 shadow-xl group-hover:scale-105 transition-transform">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-amber-300 font-semibold text-sm">Virtual Mode</div>
              <div className="text-slate-400 text-xs">Klikni pro více informací</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLiveMode && !showOverlay) {
    return <div onClick={handleBlockedClick}>{children}</div>
  }

  return <>{children}</>
}
