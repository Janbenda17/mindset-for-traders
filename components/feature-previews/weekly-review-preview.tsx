import { Badge, TrendingUp, Target, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function WeeklyReviewPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl">
      <h3 className="text-white font-bold text-lg mb-6">Tvůj Týden</h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 rounded-lg p-3 border border-green-500/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Win Rate</span>
          </div>
          <p className="text-2xl font-black text-green-400">67%</p>
          <p className="text-xs text-gray-400">2 výhry, 1 ztráta</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Profit</span>
          </div>
          <p className="text-2xl font-black text-blue-400">+$712</p>
          <p className="text-xs text-gray-400">Průměr: $237</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Readiness</span>
          </div>
          <p className="text-2xl font-black text-purple-400">75%</p>
          <Progress value={75} className="h-1 mt-1" />
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 rounded-lg p-3 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">Trades</span>
          </div>
          <p className="text-2xl font-black text-orange-400">3</p>
          <p className="text-xs text-gray-400">Kvalitní setups</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-purple-300">AI Poznatky:</p>
        <div className="bg-slate-800/50 rounded p-3 border border-purple-500/30">
          <p className="text-xs text-purple-100 leading-relaxed">
            "Výborná disciplína! Žádný revenge trading. Spánek 7.5h je optimální. Pokračuj v ranních ochodech."
          </p>
        </div>
      </div>
    </div>
  )
}
