import { Progress } from '@/components/ui/progress'
import { Sun, Moon, Brain, Zap, Heart, Activity } from 'lucide-react'

export function DailyTrackerPreview() {
  const mockData = {
    sleepHours: 7.5,
    energyLevel: 78,
    stressLevel: 35,
    focus: 82,
    physicalHealth: 75,
    emotionalState: 70
  }

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-600/50 pb-3">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Ráno Check-in</h3>
          </div>
        </div>

        {/* Metrics - Compact 2x3 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sleep */}
          <div className="bg-slate-700/40 rounded p-3 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-2">
              <Moon className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 font-semibold truncate">Spánek</span>
              <span className="text-xs font-bold text-blue-300 ml-auto">{mockData.sleepHours}h</span>
            </div>
            <Progress value={mockData.sleepHours * 12.5} className="h-1" />
          </div>

          {/* Energy */}
          <div className="bg-slate-700/40 rounded p-3 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 font-semibold truncate">Energie</span>
              <span className="text-xs font-bold text-yellow-300 ml-auto">{mockData.energyLevel}%</span>
            </div>
            <Progress value={mockData.energyLevel} className="h-1" />
          </div>

          {/* Stress */}
          <div className="bg-slate-700/40 rounded p-3 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 font-semibold truncate">Stres</span>
              <span className="text-xs font-bold text-red-300 ml-auto">{mockData.stressLevel}%</span>
            </div>
            <Progress value={mockData.stressLevel} className="h-1" />
          </div>

          {/* Focus */}
          <div className="bg-slate-700/40 rounded p-3 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-2">
              <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 font-semibold truncate">Focus</span>
              <span className="text-xs font-bold text-purple-300 ml-auto">{mockData.focus}%</span>
            </div>
            <Progress value={mockData.focus} className="h-1" />
          </div>

          {/* Physical */}
          <div className="bg-slate-700/40 rounded p-3 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 font-semibold truncate">Fyzika</span>
              <span className="text-xs font-bold text-green-300 ml-auto">{mockData.physicalHealth}%</span>
            </div>
            <Progress value={mockData.physicalHealth} className="h-1" />
          </div>

          {/* Emotional */}
          <div className="bg-slate-700/40 rounded p-3 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 font-semibold truncate">Emoce</span>
              <span className="text-xs font-bold text-pink-300 ml-auto">{mockData.emotionalState}%</span>
            </div>
            <Progress value={mockData.emotionalState} className="h-1" />
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg p-4 border border-purple-400/40 mt-6">
        <p className="text-xs text-slate-400 text-center mb-1">Trading Readiness Score</p>
        <p className="text-3xl font-black text-center text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">
          76%
        </p>
        <p className="text-xs text-center text-slate-300 mt-2 font-semibold">✓ Ready to Trade</p>
      </div>
    </div>
  )
}
