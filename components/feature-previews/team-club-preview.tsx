import { Users, MessageSquare, Heart, TrendingUp, Crown } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function TeamClubPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-600/50">
        <Users className="w-5 h-5 text-purple-400" />
        <h3 className="text-base font-bold text-white">Team Club</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-purple-900/30 rounded-lg p-2.5 border border-purple-500/30 text-center">
          <p className="text-xs text-slate-400 mb-1">Členů</p>
          <p className="text-xl font-black text-purple-300">234</p>
        </div>
        <div className="bg-green-900/30 rounded-lg p-2.5 border border-green-500/30 text-center">
          <p className="text-xs text-slate-400 mb-1">Avg Win</p>
          <p className="text-xl font-black text-green-300">62%</p>
        </div>
      </div>

      {/* Activity Feed */}
      <p className="text-xs font-semibold text-slate-300 mb-2">Poslední Posty:</p>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {/* Post 1 */}
        <div className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src="https://i.pravatar.cc/150?img=1" />
              <AvatarFallback>LT</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Lukáš T.</p>
              <p className="text-xs text-slate-400">2 min</p>
            </div>
            <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          </div>
          <p className="text-xs text-slate-200 leading-tight">
            60% win rate! Breakthrough moment! 🔥
          </p>
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <button className="flex items-center gap-1 hover:text-purple-300">
              <MessageSquare className="w-3 h-3" /> 12
            </button>
            <button className="flex items-center gap-1 hover:text-purple-300">
              <Heart className="w-3 h-3" /> 28
            </button>
          </div>
        </div>

        {/* Post 2 */}
        <div className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src="https://i.pravatar.cc/150?img=5" />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Jana P.</p>
              <p className="text-xs text-slate-400">1h</p>
            </div>
          </div>
          <p className="text-xs text-slate-200 leading-tight">
            4H breakouts. 1:2 Risk/Reward ratio working great!
          </p>
          <div className="mt-2 px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200 border border-purple-500/30">
            💡 Strategy: High Probability Setup
          </div>
        </div>

        {/* Post 3 */}
        <div className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src="https://i.pravatar.cc/150?img=8" />
              <AvatarFallback>MR</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Matěj R.</p>
              <p className="text-xs text-slate-400">3h</p>
            </div>
          </div>
          <p className="text-xs text-slate-200 leading-tight">
            Kdo chce accountability partnera? Hledám někoho s +1 yr experience
          </p>
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <button className="flex items-center gap-1 hover:text-purple-300">
              <MessageSquare className="w-3 h-3" /> 8
            </button>
          </div>
        </div>
      </div>

      {/* Join Button */}
      <button className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg text-xs font-bold transition mt-auto">
        Připoj se ke klubu →
      </button>
    </div>
  )
}
