import { Users, Star, Zap } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function TeamClubPreview() {
  const buddies = [
    {
      name: 'Lukáš T.',
      skill: 'Advanced',
      winRate: 67,
      trades: 245,
      match: 92,
      image: 'https://i.pravatar.cc/150?img=1'
    },
    {
      name: 'Jana P.',
      skill: 'Intermediate',
      winRate: 58,
      trades: 156,
      match: 88,
      image: 'https://i.pravatar.cc/150?img=5'
    },
    {
      name: 'David K.',
      skill: 'Advanced',
      winRate: 71,
      trades: 312,
      match: 85,
      image: 'https://i.pravatar.cc/150?img=8'
    }
  ]

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-600/50">
        <Users className="w-5 h-5 text-purple-400" />
        <h3 className="text-base font-bold text-white">Trading Buddies</h3>
      </div>

      {/* Buddies Grid */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {buddies.map((buddy, idx) => (
          <div key={idx} className="bg-gradient-to-r from-slate-700/50 to-slate-700/30 rounded-lg p-3 border border-purple-500/30 hover:border-purple-400/50 transition cursor-pointer">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5 flex-1">
                <Avatar className="w-8 h-8 border border-purple-400/50">
                  <AvatarImage src={buddy.image} />
                  <AvatarFallback>{buddy.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{buddy.name}</p>
                  <p className="text-xs text-purple-300 font-semibold">{buddy.skill}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-yellow-400 flex-shrink-0 ml-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400' : ''}`} />
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-slate-900/60 rounded px-2 py-1.5 border border-slate-600/30 text-center">
                <p className="text-xs text-slate-400">Win Rate</p>
                <p className="text-sm font-black text-green-400">{buddy.winRate}%</p>
              </div>
              <div className="bg-slate-900/60 rounded px-2 py-1.5 border border-slate-600/30 text-center">
                <p className="text-xs text-slate-400">Trades</p>
                <p className="text-sm font-black text-blue-400">{buddy.trades}</p>
              </div>
              <div className="bg-slate-900/60 rounded px-2 py-1.5 border border-slate-600/30 text-center">
                <p className="text-xs text-slate-400">Match</p>
                <p className="text-sm font-black text-purple-400">{buddy.match}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="mt-3 pt-3 border-t border-slate-600/50 bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-200 leading-tight">
            <span className="font-semibold">Top Match:</span> David K. (85% compatibility)
          </p>
        </div>
      </div>
    </div>
  )
}
