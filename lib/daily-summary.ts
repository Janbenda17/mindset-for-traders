// Shared engine for the Daily Tracker "Daily Summary" card (Czech language).
// Produces both the short emotional tagline (tilt/label/tone/tip, unchanged
// logic from the original "AI Emoční stav dne" card) AND a longer narrative
// that summarizes the whole day (trade count, win rate, P&L, best/worst
// trade) followed by the emotional read. That narrative is what gets shown
// in the card body and persisted into journal_entries so it shows up later
// in the Daily Tracker History tab.

export interface DailySummaryResult {
  tilt: number
  label: string
  tone: 'good' | 'warn' | 'bad' | 'neutral'
  message: string
  tip: string | null
  narrative: string
}

function fmtMoney(n: number) {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function tradeLabel(t: any) {
  const dir = String(t?.direction || '').toLowerCase()
  const dirLabel = dir.startsWith('s') ? 'Short' : dir ? 'Long' : ''
  return [dirLabel, t?.pair || 'obchod'].filter(Boolean).join(' ')
}

export function emptyDailySummary(): DailySummaryResult {
  return {
    tilt: 0,
    label: 'Čekání na data',
    tone: 'neutral',
    message:
      'Dnes ještě nemáš žádné obchody — jakmile MetaTrader zaznamená první obchod, AI automaticky vyhodnotí tvůj den.',
    tip: null,
    narrative:
      'Dnes ještě nemáš žádné obchody k shrnutí. Jakmile začneš obchodovat, najdeš tady kompletní shrnutí dne — výsledek, nejlepší a nejhorší obchod a emoční vyhodnocení.',
  }
}

export function buildDailySummary(trades: any[], dateLabel: string): DailySummaryResult {
  if (!trades || trades.length === 0) return emptyDailySummary()

  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let revengeCount = 0
  let maxLossStreak = 0
  let lossStreak = 0
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i]
    if (t.pnl < 0) {
      lossStreak++
      maxLossStreak = Math.max(maxLossStreak, lossStreak)
      const prev = sorted[i - 1]
      if (prev && prev.pnl < 0) {
        const gapMin = (new Date(t.date).getTime() - new Date(prev.date).getTime()) / 60000
        if (gapMin >= 0 && gapMin < 20 && Math.abs(t.pnl) >= Math.abs(prev.pnl)) {
          revengeCount++
        }
      }
    } else {
      lossStreak = 0
    }
  }

  const count = sorted.length
  const wins = sorted.filter((t) => t.pnl > 0).length
  const losses = sorted.filter((t) => t.pnl < 0).length
  const winRate = count > 0 ? Math.round((wins / count) * 100) : 0
  const totalPnL = sorted.reduce((s, t) => s + (t.pnl || 0), 0)
  const bestTrade = sorted.reduce((best, t) => (t.pnl > best.pnl ? t : best), sorted[0])
  const worstTrade = sorted.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst), sorted[0])

  let tilt = 0
  tilt += revengeCount * 30
  tilt += maxLossStreak >= 3 ? 25 : maxLossStreak === 2 ? 10 : 0
  tilt += count > 6 ? 20 : count > 4 ? 10 : 0
  tilt -= count > 0 && count <= 3 && winRate >= 50 ? 10 : 0
  tilt = Math.max(0, Math.min(100, tilt))

  let label: string
  let message: string
  let tip: string
  let tone: 'good' | 'warn' | 'bad' | 'neutral'

  if (tilt >= 50) {
    label = 'Emoční riziko'
    tone = 'bad'
    message = `Vzorec dnešních obchodů (${revengeCount > 0 ? `${revengeCount}× rychlý re-entry po ztrátě, ` : ''}${
      maxLossStreak >= 2 ? `série ${maxLossStreak} ztrát po sobě, ` : ''
    }${count} obchodů celkem) odpovídá emočnímu přetížení, ne plánu.`
    tip = 'Zastav obchodování na zbytek dne. Zítra začni s poloviční velikostí pozice.'
  } else if (revengeCount > 0 || maxLossStreak >= 2) {
    label = 'Lehké napětí'
    tone = 'warn'
    message =
      'Po ztrátě následoval rychlý další vstup — typický raný signál frustrace, i když to dnes nepřerostlo do plného emočního výkyvu.'
    tip = 'Po každé ztrátě si dej alespoň 5 minut pauzu před dalším obchodem.'
  } else if (count > 0 && count <= 3 && winRate >= 50) {
    label = 'Klid a disciplína'
    tone = 'good'
    message = `${count} dobře vybraných obchodů bez známek emočního přetížení — tohle je vzorec, který chceš opakovat.`
    tip = 'Udrž stejnou selektivitu i zítra.'
  } else {
    label = 'Neutrální'
    tone = 'neutral'
    message = 'Dnešní obchody nevykazují výrazné emoční vzorce — žádný emoční výkyv, ale ani jasná disciplína navíc.'
    tip = 'Zapiš si krátkou poznámku, jak ses během obchodování cítil — pomůže to budoucí AI analýze.'
  }

  const bestLine = bestTrade.pnl > 0 ? `Nejlepší obchod dne: ${tradeLabel(bestTrade)} za ${fmtMoney(bestTrade.pnl)}.` : null
  const worstLine = losses > 0 ? `Nejhorší obchod dne: ${tradeLabel(worstTrade)} za ${fmtMoney(worstTrade.pnl)}.` : null

  const tradeWord = count === 1 ? 'obchod' : count >= 2 && count <= 4 ? 'obchody' : 'obchodů'

  const narrative = [
    `${dateLabel}: ${count} ${tradeWord}, ${wins} výherních / ${losses} ztrátových (${winRate}% winrate), celkový výsledek ${fmtMoney(totalPnL)}.`,
    bestLine,
    worstLine,
    message,
    tip,
  ]
    .filter(Boolean)
    .join(' ')

  return { tilt, label, tone, message, tip, narrative }
}
