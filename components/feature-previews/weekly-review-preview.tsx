import { TrendingUp, DollarSign, Zap, AlertCircle, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function WeeklyReviewPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <h3 className="text-white font-bold text-base mb-3 pb-2 border-b border-slate-600/50">
        Týdenní Přehled
      </h3>

      {/* Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Win Rate */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-950/40 rounded-lg p-3 border border-green-500/30">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-semibold truncate">Win Rate</span>
          </div>
          <p className="text-2xl font-black text-green-400">67%</p>
          <p className="text-xs text-slate-400 mt-1">2W / 1L</p>
        </div>

        {/* Profit */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-semibold truncate">Profit</span>
          </div>
          <p className="text-2xl font-black text-blue-400">+$712</p>
          <p className="text-xs text-slate-400 mt-1">avg: $237</p>
        </div>

        {/* Readiness */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-semibold">Readiness</span>
          </div>
          <Progress value={75} className="h-1.5 mb-1" />
          <p className="text-xs text-slate-400 font-semibold">75%</p>
        </div>

        {/* Trades */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 rounded-lg p-3 border border-orange-500/30">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-semibold">Trades</span>
          </div>
          <p className="text-2xl font-black text-orange-400">3</p>
          <p className="text-xs text-slate-400 mt-1">kvalitní</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-300">AI Insights</span>
        </div>
        
        <div className="bg-slate-700/30 rounded-lg p-3 border border-purple-400/30 flex-1 overflow-y-auto">
          <p className="text-xs text-slate-200 leading-relaxed">
            <span className="text-purple-300 font-semibold block mb-1">✓ Výborná disciplína!</span>
            Žádný revenge trading z 3 tradů. Spánek 7.5h je optimální pro trading.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Pokračuj v ranních ochodech - tam máš best edge. Věnuj pozornost stress managementu.
          </p>
        </div>
      </div>
    </div>
  )
}
