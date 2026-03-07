import { Brain, Send } from 'lucide-react'

export function MindTraderAIPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-600/50">
        <div className="p-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded border border-purple-400/50">
          <Brain className="w-5 h-5 text-purple-300" />
        </div>
        <h3 className="text-base font-bold text-white">MindTrader AI</h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto mb-3 pr-2">
        {/* AI Welcome */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-slate-700/50 rounded-lg p-3 border border-purple-400/30 text-white text-xs leading-relaxed">
            <p className="font-semibold text-purple-300 mb-1">Ahoj! 👋</p>
            <p>Jsem tvůj AI coach pro trading psychiku. Co tě trápí?</p>
          </div>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-xs bg-purple-600/70 rounded-lg p-3 text-white text-xs">
            Měl jsem ztrátu a chci ji vrátit...
          </div>
        </div>

        {/* AI Response - Alert */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-red-900/30 rounded-lg p-3 border border-red-500/30 text-white text-xs leading-relaxed">
            <p className="font-semibold text-red-300 mb-1">⚠️ Revenge Trading!</p>
            <p className="text-slate-200">STOP! Dej si 15min pauzu. Walk, voda, dýchání. Tvůj mozek dělá špatná rozhodnutí teď.</p>
          </div>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-xs bg-purple-600/70 rounded-lg p-3 text-white text-xs">
            Jak se mám zbavit stresu?
          </div>
        </div>

        {/* AI Response - Tips */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-slate-700/50 rounded-lg p-3 border border-green-400/30 text-white text-xs leading-relaxed">
            <p className="font-semibold text-green-300 mb-2">💚 Stress Relief:</p>
            <ul className="space-y-1 text-slate-200">
              <li>• Box breathing: 4-4-4</li>
              <li>• 10min bez telefonu</li>
              <li>• Připomni si: 1 loss ≠ jsi bad trader</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-slate-600/50">
        <input 
          type="text" 
          placeholder="Ptej se..." 
          className="flex-1 bg-slate-700/40 border border-slate-600/50 rounded px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
          disabled
        />
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded hover:from-purple-700 hover:to-pink-700 transition flex-shrink-0">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
