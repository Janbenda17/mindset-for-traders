import { Users, MessageCircle, Share2, TrendingUp } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function TeamClubPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-purple-400" />
        <h3 className="text-white font-bold text-lg">Team Club</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-purple-900/30 rounded p-3 border border-purple-500/30">
          <p className="text-xs text-gray-400">Členů</p>
          <p className="text-2xl font-black text-purple-300">234</p>
        </div>
        <div className="bg-green-900/30 rounded p-3 border border-green-500/30">
          <p className="text-xs text-gray-400">Avg Win%</p>
          <p className="text-2xl font-black text-green-300">62%</p>
        </div>
      </div>

      {/* Recent activity */}
      <p className="text-xs font-semibold text-purple-300 mb-3">Poslední aktivity:</p>
      <div className="space-y-3">
        {/* User post */}
        <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src="https://i.pravatar.cc/150?img=1" />
              <AvatarFallback>MT</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-white">Lukáš T.</p>
              <p className="text-xs text-gray-400">2 minuty zpět</p>
            </div>
          </div>
          <p className="text-sm text-gray-100">
            Právě jsem dosáhl 60% win rate s mým systemem! Toto je breakthrough moment. 🔥
          </p>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <button className="flex items-center gap-1 hover:text-purple-300">
              <MessageCircle className="w-4 h-4" /> 12
            </button>
            <button className="flex items-center gap-1 hover:text-purple-300">
              <TrendingUp className="w-4 h-4" /> 24
            </button>
          </div>
        </div>

        {/* Strategy share */}
        <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src="https://i.pravatar.cc/150?img=5" />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-white">Jana P.</p>
              <p className="text-xs text-gray-400">1 hod zpět</p>
            </div>
          </div>
          <p className="text-sm text-gray-100">
            Sdílím svou strategii: 4H timeframe breakouts s risk 1:2 ratio
          </p>
          <div className="mt-2 p-2 bg-purple-900/30 rounded text-xs text-purple-200 border border-purple-500/30">
            <Share2 className="w-3 h-3 inline mr-1" /> Strategie připravena k diskuzi
          </div>
        </div>
      </div>

      <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-semibold transition">
        Připoj se
      </button>
    </div>
  )
}
