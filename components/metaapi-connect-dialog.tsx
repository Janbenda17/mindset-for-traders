import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader, AlertCircle, Check } from 'lucide-react'
import { connectMetaApi } from '@/app/account/integrations/actions'

interface MetaApiConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess?: () => void
}

export function MetaApiConnectDialog({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: MetaApiConnectDialogProps) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [server, setServer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleConnect = async () => {
    if (!login || !password || !server) {
      setError('Vyplň všechna pole')
      setTimeout(() => setError(''), 3000)
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log('[v0] MetaApi connect dialog - connecting...')
      await connectMetaApi(userId, {
        login,
        password,
        broker: server,
      })

      console.log('[v0] MetaApi connected successfully')
      setSuccess(true)
      setLogin('')
      setPassword('')
      setServer('')

      setTimeout(() => {
        onOpenChange(false)
        onSuccess?.()
      }, 1500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chyba při připojení'
      console.error('[v0] MetaApi connection error:', err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Připoj MetaApi</DialogTitle>
          <DialogDescription className="text-slate-400">
            Zadej své MT5 přihlašovací údaje pro připojení k MetaApi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-medium">MetaApi připojen!</p>
              <p className="text-sm text-slate-400 text-center">
                Tvá data se synchronizují každých 30 sekund
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  MT5 Login (číslo účtu)
                </label>
                <Input
                  type="text"
                  placeholder="např. 123456"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  disabled={loading}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Heslo
                </label>
                <Input
                  type="password"
                  placeholder="Tvoje MT5 heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Server (Broker)
                </label>
                <Input
                  type="text"
                  placeholder="např. IC Markets-Demo nebo Pepperstone"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  disabled={loading}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Najdi v MT5: Tools → Options → Servers
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  variant="ghost"
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={loading || !login || !password || !server}
                  className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Připojuji...
                    </>
                  ) : (
                    'Připojit'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
