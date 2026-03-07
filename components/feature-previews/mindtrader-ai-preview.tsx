import { Sparkles, MessageCircle } from 'lucide-react'

export function MindTraderAIPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        <h3 className="text-white font-bold text-lg">MindTrader AI</h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-xs bg-purple-600 rounded-lg p-3 text-white text-sm">
            Měl jsem dnes malou ztrátu a teď chci ji vrátit hned. Co mám dělat?
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-slate-800 rounded-lg p-3 text-white text-sm border border-purple-500/30">
            <p className="font-semibold text-purple-300 mb-2">Revenge Trading Alert!</p>
            <p className="text-gray-100 text-xs leading-relaxed">
              To co cítíš je normální. Stop. Udělej si 15min pauzu, jdi na walk. Ztráta už se nestane, ale hloupá rozhodnutí ano. Tvůj edge pracuje na dlouhý termín.
            </p>
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-xs bg-purple-600 rounded-lg p-3 text-white text-sm">
            Ok, chápu. Jak se mám zbavit toho útlaku?
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-slate-800 rounded-lg p-3 text-white text-sm border border-purple-500/30">
            <p className="font-semibold text-purple-300 mb-2">Anxiety Relief</p>
            <ul className="text-xs text-gray-100 space-y-1">
              <li>• Box breathing: 4 vdechy, 4 výdechy</li>
              <li>• 10min procházka bez telefonu</li>
              <li>• Připomni si: 1 ztráta ≠ jsi špatný trader</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Ptej se AI..." 
          className="flex-1 bg-slate-800 border border-purple-500/30 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
          disabled
        />
        <button className="bg-purple-600 p-2 rounded hover:bg-purple-700 transition">
          <MessageCircle className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
}
