import { AlertCircle, TrendingDown, CheckCircle2, Lightbulb } from 'lucide-react'

export function FailLogPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <h3 className="text-white font-bold text-base mb-3 pb-2 border-b border-slate-600/50">
        Fail Log - Lekcí
      </h3>

      {/* Trades */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {/* Failed trade 1 - Red */}
        <div className="bg-red-900/25 rounded-lg p-3 border border-red-500/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm">EURUSD Short</p>
                <p className="text-xs text-slate-400">-$150 • Revenge Trade</p>
              </div>
            </div>
            <span className="text-xs bg-red-600/40 text-red-200 px-2 py-1 rounded-sm flex-shrink-0 ml-2">Psychika</span>
          </div>
          <p className="text-xs text-slate-200 leading-tight">Vstup bez signálu po ztrátě.</p>
        </div>

        {/* Failed trade 2 - Yellow */}
        <div className="bg-yellow-900/25 rounded-lg p-3 border border-yellow-500/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm">GBPUSD Long</p>
                <p className="text-xs text-slate-400">-$85 • Bez Konfirmace</p>
              </div>
            </div>
            <span className="text-xs bg-yellow-600/40 text-yellow-200 px-2 py-1 rounded-sm flex-shrink-0 ml-2">Setup</span>
          </div>
          <p className="text-xs text-slate-200 leading-tight">Chyběla druhá konfirmace.</p>
        </div>

        {/* Winning trade - Green */}
        <div className="bg-green-900/25 rounded-lg p-3 border border-green-500/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm">NZDUSD Long</p>
                <p className="text-xs text-slate-400">+$237 • Právo Udělán</p>
              </div>
            </div>
            <span className="text-xs bg-green-600/40 text-green-200 px-2 py-1 rounded-sm flex-shrink-0 ml-2">✓ Win</span>
          </div>
          <p className="text-xs text-slate-200 leading-tight">Všechny pravidla dodržena.</p>
        </div>
      </div>

      {/* Learning Section */}
      <div className="mt-3 pt-3 border-t border-slate-600/50 bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200 leading-tight">
            <span className="font-semibold">Key Lesson:</span> Čekej 30min po ztrátě. Dej si 2 konfirmace na setup.
          </p>
        </div>
      </div>
    </div>
  )
}
