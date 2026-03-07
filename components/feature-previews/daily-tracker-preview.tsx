import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Zap, Smile, TrendingDown, Moon } from 'lucide-react'

export function DailyTrackerPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl flex flex-col justify-between">
      <div>
        <h3 className="text-white font-bold text-lg mb-6">Tvůj Stav Dnes</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300">Nálada</span>
            </div>
            <span className="text-white font-semibold">82%</span>
          </div>
          <Progress value={82} className="h-2" />

          <div className="flex items-center justify-between mb-2 mt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">Energie</span>
            </div>
            <span className="text-white font-semibold">75%</span>
          </div>
          <Progress value={75} className="h-2" />

          <div className="flex items-center justify-between mb-2 mt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-300">Stres</span>
            </div>
            <span className="text-white font-semibold">35%</span>
          </div>
          <Progress value={35} className="h-2" />

          <div className="flex items-center justify-between mb-2 mt-4">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-gray-300">Spánek</span>
            </div>
            <span className="text-white font-semibold">7.5h</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
      </div>

      <div className="mt-8 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
        <p className="text-xs text-purple-200">
          ✓ Trading ready: Máš optimální podmínky pro trading dnes
        </p>
      </div>
    </div>
  )
}
