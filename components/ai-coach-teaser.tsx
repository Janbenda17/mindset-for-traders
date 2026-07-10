'use client'

import { useRouter } from 'next/navigation'
import { Brain, BarChart2, Target, MessageCircle } from 'lucide-react'

// Compact, presentational preview of the real MindTrader AI chat panel's
// cold-open state (components/mindtrader-ai.tsx) - same greeting copy, same
// quick-start prompts, same "only in live mode can you type" restriction.
// The full component takes over the whole viewport (its own min-h-screen +
// galaxy background), so this is a lighter stand-in for a homepage section
// rather than the component embedded directly.
export default function AiCoachTeaser({ isEn }: { isEn: boolean }) {
  const router = useRouter()

  const starters = isEn
    ? [
        { emoji: '🔴', label: 'Just hit a huge stop-loss and I want to click into another trade. Stop me.' },
        { emoji: '🔵', label: 'Analyze my last MT5 trade. Did I make a mistake?' },
        { emoji: '🔴', label: 'How to recover from loss?' },
        { emoji: '😰', label: 'How to handle fear?' },
      ]
    : [
        { emoji: '🔴', label: 'Právě jsem dostal velkou stopku a chci hned kliknout do dalšího obchodu. Zastav mě.' },
        { emoji: '🔵', label: 'Analyzuj můj poslední obchod z MT5. Udělal jsem chybu?' },
        { emoji: '🔴', label: 'Jak se zotavit po ztrátě?' },
        { emoji: '😰', label: 'Jak zvládat strach?' },
      ]

  const goToAi = (prompt: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindtrader-ai-prefill', prompt)
    }
    router.push('/mindtrader?tab=ai')
  }

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-purple-500/10 p-3 flex sm:flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-200 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5" /> MIND AI
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 text-xs">
            <BarChart2 className="w-3.5 h-3.5" /> {isEn ? 'ANALYTICS AI' : 'ANALYTICS AI'}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 text-xs">
            <Target className="w-3.5 h-3.5" /> {isEn ? 'COACH AI' : 'COACH AI'}
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-5">
          <div className="max-w-[85%] rounded-xl p-3.5 bg-gradient-to-r from-slate-700 to-slate-800 border border-purple-400/20 mb-4">
            <p className="text-sm text-slate-100 whitespace-pre-line leading-relaxed">
              {isEn
                ? "Hi! I'm your MindTrader AI coach. 🧠\n\nI've seen your data and I'm here to help you with trading psychology.\n\nWhat's bothering you? How can I help?"
                : 'Ahoj! Jsem tvůj MindTrader AI kouč. 🧠\n\nViděl jsem tvá data a jsem tu, abych ti pomohl s obchodní psychikou.\n\nCo tě trápí? Jak můžu pomoct?'}
            </p>
          </div>

          <p className="text-xs text-slate-500 font-semibold uppercase mb-2">
            {isEn ? 'Quick start' : 'Rychlý start'}
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {starters.map((s, i) => (
              <button
                key={i}
                onClick={() => goToAi(s.label)}
                className="w-full text-left rounded-lg py-2.5 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-semibold transition-colors"
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-blue-400/70 text-center py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            {isEn ? 'You can only type your own messages in live mode' : 'Jen v live modu můžeš psát vlastní zprávy'}
          </div>
        </div>
      </div>
    </div>
  )
}
