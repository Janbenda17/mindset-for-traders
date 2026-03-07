import { AlertCircle, TrendingDown, CheckCircle2 } from 'lucide-react'

export function FailLogPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl">
      <h3 className="text-white font-bold text-lg mb-6">Fail Log - Tvoje Chyby</h3>

      <div className="space-y-4">
        {/* Failed trade 1 */}
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2">
              <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-white font-semibold">EURUSD Short</p>
                <p className="text-xs text-gray-400">-$150 (2% risk)</p>
              </div>
            </div>
            <span className="text-xs bg-red-600/30 text-red-200 px-2 py-1 rounded">Psychika</span>
          </div>
          <p className="text-xs text-red-100 mt-2">Revenge trade po předchozí ztrátě. Vstup bez potvrzení signálu.</p>
          <div className="mt-3 p-2 bg-slate-800/50 rounded">
            <p className="text-xs text-gray-300"><span className="font-semibold text-yellow-300">AI:</span> Čekej 30min po ztrátě. Tvoje rozhodnutí pod emocemi jsou špatná.</p>
          </div>
        </div>

        {/* Failed trade 2 */}
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-white font-semibold">GBPUSD Long</p>
                <p className="text-xs text-gray-400">-$85 (1% risk)</p>
              </div>
            </div>
            <span className="text-xs bg-yellow-600/30 text-yellow-200 px-2 py-1 rounded">Setup</span>
          </div>
          <p className="text-xs text-yellow-100 mt-2">Signál nebyl konfirmován. Stoploss zásah byl správný.</p>
          <div className="mt-3 p-2 bg-slate-800/50 rounded">
            <p className="text-xs text-gray-300"><span className="font-semibold text-blue-300">Lekce:</span> Čekej na 2 konfirmace. Stoploss je tvůj přátel.</p>
          </div>
        </div>

        {/* Winning trade */}
        <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-white font-semibold">NZDUSD Long</p>
                <p className="text-xs text-gray-400">+$237 (3% gain)</p>
              </div>
            </div>
            <span className="text-xs bg-green-600/30 text-green-200 px-2 py-1 rounded">Win!</span>
          </div>
          <p className="text-xs text-green-100 mt-2">Čekál jsi na potvrzení, držel si stoploss, brankl profit.</p>
        </div>
      </div>
    </div>
  )
}
