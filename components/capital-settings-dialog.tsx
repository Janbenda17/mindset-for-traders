'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CapitalSettingsDialogProps {
  currentCapital: number
  onCapitalUpdated?: (newCapital: number) => void
}

export function CapitalSettingsDialog({ currentCapital, onCapitalUpdated }: CapitalSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [capital, setCapital] = useState(currentCapital.toString())
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    const newCapital = parseFloat(capital)

    if (isNaN(newCapital) || newCapital <= 0) {
      toast({
        title: 'Chyba',
        description: 'Zadej prosím správnou částku.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/update-total-capital', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_capital: newCapital }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      const data = await response.json()

      toast({
        title: 'Úspěch!',
        description: `Celkový kapitál aktualizován na $${data.total_capital.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })}`,
      })

      if (onCapitalUpdated) {
        onCapitalUpdated(data.total_capital)
      }

      setOpen(false)
    } catch (error) {
      console.error('[v0] Error updating capital:', error)
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se aktualizovat kapitál.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Nastavení kapitálu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-white">Nastavit celkový kapitál</DialogTitle>
          <DialogDescription className="text-slate-400">
            Aktualizuj svůj celkový kapitál, pokud jsi si koupil(a) fundovaný účet nebo si chceš změnit iniciální částku.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Částka (USD)</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 text-slate-400">$</span>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="50000"
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              Aktuální: ${currentCapital.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1 bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50"
              disabled={isLoading}
            >
              Zrušit
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={isLoading}
            >
              {isLoading ? 'Ukládám...' : 'Uložit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
