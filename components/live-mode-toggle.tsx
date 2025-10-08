"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Monitor, Play, AlertTriangle, Info, TestTube } from "lucide-react"
import { useData } from "@/contexts/data-context"

export function LiveModeToggle() {
  const { isLiveMode, switchToLive, switchToVirtual, canSwitchModes, showLiveWarning, setShowLiveWarning } = useData()

  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (!canSwitchModes) {
      return
    }

    setIsLoading(true)

    // Show warning for switching to live mode
    if (!isLiveMode && !showLiveWarning) {
      setShowLiveWarning(true)
      setIsLoading(false)
      return
    }

    try {
      if (isLiveMode) {
        await switchToVirtual()
      } else {
        await switchToLive()
      }
    } catch (error) {
      console.error("Error switching modes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmLive = async () => {
    setIsLoading(true)
    try {
      await switchToLive()
      setShowLiveWarning(false)
    } catch (error) {
      console.error("Error switching to live mode:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`
            ${
              isLiveMode
                ? "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                : "bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30"
            }
            backdrop-blur-sm transition-all duration-300
          `}
        >
          {isLiveMode ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              LIVE
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              VIRTUAL
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-xl"
        align="end"
      >
        <DropdownMenuLabel className="text-white">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Režim aplikace</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700/50" />

        <div className="p-3 space-y-4">
          {/* Current Mode Info */}
          <div
            className={`p-3 rounded-lg border ${
              isLiveMode ? "bg-red-500/10 border-red-500/30" : "bg-blue-500/10 border-blue-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {isLiveMode ? (
                  <Play className="w-4 h-4 text-red-400" />
                ) : (
                  <TestTube className="w-4 h-4 text-blue-400" />
                )}
                <span className="font-medium text-white">{isLiveMode ? "LIVE MODE" : "VIRTUAL MODE"}</span>
              </div>
              <Badge
                className={
                  isLiveMode
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                }
              >
                Aktivní
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              {isLiveMode
                ? "Pracujete s reálnými daty a obchody. Všechny změny jsou trvalé."
                : "Používáte demo data pro testování. Žádné reálné obchody nejsou ovlivněny."}
            </p>
          </div>

          {/* Mode Toggle */}
          {canSwitchModes ? (
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <TestTube className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white">Virtual</span>
                </div>
                <Switch
                  checked={isLiveMode}
                  onCheckedChange={handleToggle}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-white">Live</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Omezený přístup</span>
              </div>
              <p className="text-xs text-gray-400">
                Nemáte oprávnění přepínat mezi režimy. Kontaktujte administrátora.
              </p>
            </div>
          )}

          {/* Live Mode Warning */}
          {showLiveWarning && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg space-y-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-300 mb-1">Varování - Přepnutí na LIVE režim</p>
                  <p className="text-xs text-red-400 mb-2">
                    Přepnutím na LIVE režim budete pracovat s reálnými daty. Všechna demo data budou vymazána. Tato akce
                    je nevratná.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirmLive}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Přepínám..." : "Potvrdit LIVE"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLiveWarning(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Zrušit
                </Button>
              </div>
            </div>
          )}

          {/* Warning */}
          {isLiveMode && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-300 mb-1">Upozornění</p>
                  <p className="text-xs text-red-400">
                    V LIVE režimu pracujete s reálnými daty. Buďte opatrní při provádění změn.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-300 mb-1">Informace</p>
                <p className="text-xs text-gray-400">
                  {isLiveMode
                    ? "V LIVE režimu se zobrazují pouze vaše reálná data bez demo obsahu."
                    : "Ve VIRTUAL režimu vidíte demo data společně s vašimi reálnými daty pro testování."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
