// Shared engine for generating Weekly Review content (Czech language).
// Used both by the demo-mode path (components/weekly-review-analysis.tsx, using
// virtual/local trades) and the live-mode path (app/actions/weekly-review.ts,
// using real journal_entries trades from Supabase). Keeping the logic in one
// place means demo and live users get the same depth of insight, not a
// generic fallback in one of the two modes.

import { buildEmotionalTaxSheet } from './emotional-tax'

export interface WeeklyReviewData {
  summary: string
  keyMetrics: { label: string; value: string | number; trend: 'up' | 'down' | 'neutral' }[]
  highlights: string[]
  improvements: string[]
  nextWeekFocus: string[]
  psychologicalInsights: string[]
  riskAssessment: string
  // --- Richer fields (additive; safe defaults in emptyWeeklyReview) ---
  grade: { letter: string; score: number; headline: string } // A–F weekly grade
  quant: {
    profitFactor: number | null
    avgWin: number
    avgLoss: number
    expectancy: number
    largestWin: number
    largestLoss: number
    maxDrawdown: number
    maxDrawdownR: number | null // drawdown expressed in average-trade ("R") units
  }
  equityCurve: number[] // cumulative P&L after each trade, chronological
  emotionalTax: {
    total: number // $ given back to emotional mistakes this week (>= 0)
    topOffender: string | null
    rows: { label: string; incidents: number; realLoss: number }[]
  } | null
}

export interface NormalizedTrade {
  date: string
  pair?: string | null
  direction?: string | null
  pnl: number
  mood?: number | null
  confidence?: number | null
  stress?: number | null
  discipline?: number | null
  emotionBefore?: string | null
  notes?: string | null
  followedPlan?: boolean | null
  // Optional behavioural fields used by the Emotional Tax integration.
  id?: string | null
  positionSize?: number | null
  revengeTrade?: boolean | null
  fomo?: boolean | null
  hasStopLoss?: boolean | null
  openTime?: string | null
}

const DAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']

const fmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(0)}`
// Proper USD formatting with sign + thousands separator: +$1,234 / -$850.
const money = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
const moneySigned = (n: number) => `${n >= 0 ? '+' : '-'}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`

const EMPTY_GRADE = { letter: '—', score: 0, headline: 'Zatím bez hodnocení' }
const EMPTY_QUANT = {
  profitFactor: null,
  avgWin: 0,
  avgLoss: 0,
  expectancy: 0,
  largestWin: 0,
  largestLoss: 0,
  maxDrawdown: 0,
  maxDrawdownR: null,
}

function avgOf(trades: NormalizedTrade[], key: keyof NormalizedTrade): number | null {
  const vals = trades.map((t) => t[key]).filter((v): v is number => typeof v === 'number')
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
}

export function emptyWeeklyReview(): WeeklyReviewData {
  return {
    summary:
      'Tento týden nemáš zaznamenané žádné obchody. Takhle bude vypadat tvůj weekly review, jakmile budeš mít obchody za posledních 7 dní.',
    keyMetrics: [
      { label: 'Celkem obchodů', value: 0, trend: 'neutral' },
      { label: 'Win Rate', value: '0%', trend: 'neutral' },
      { label: 'Týdenní P&L', value: '$0', trend: 'neutral' },
      { label: 'Nejlepší obchod', value: '$0', trend: 'neutral' },
      { label: 'Průměrný obchod', value: '$0', trend: 'neutral' },
    ],
    highlights: ['Zatím žádná data za tento týden'],
    improvements: ['Začni zaznamenávat obchody do deníku'],
    nextWeekFocus: ['Stanov si jasná pravidla vstupu', 'Definuj maximální riziko na obchod'],
    psychologicalInsights: ['Zatím nedostatek dat pro psychologickou analýzu'],
    riskAssessment: 'Bez obchodů tento týden nelze vyhodnotit riziko.',
    grade: EMPTY_GRADE,
    quant: EMPTY_QUANT,
    equityCurve: [],
    emotionalTax: null,
  }
}

export interface WeekSelfReportDay {
  date: string
  tags: string[]
}

const SELF_REPORT_TAG_LABELS: Record<string, string> = {
  FOMO_overcome: 'ustál FOMO impuls',
  FOMO_chased: 'naskočil do FOMO pohybu',
  REVENGE_TRADING: 'revenge trading',
  EARLY_CLOSE: 'brzké uzavření ze strachu',
  CLEAN_DAY: 'bezchybný den (dodržen plán)',
}

function buildSelfReportTrend(weekJournals: WeekSelfReportDay[]): string[] {
  const insights: string[] = []
  if (!weekJournals || weekJournals.length === 0) return insights

  const totalDays = weekJournals.length
  const tagCounts: Record<string, number> = {}
  weekJournals.forEach((day) => {
    day.tags.forEach((t) => {
      if (SELF_REPORT_TAG_LABELS[t]) tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  })

  // Self-reported good behavior - frame as "ustál X ze Y dní"
  if (tagCounts['FOMO_overcome']) {
    insights.push(`FOMO ustál ${tagCounts['FOMO_overcome']}x z ${totalDays} zaznamenaných dní – sebereflexe ukazuje rostoucí kontrolu`)
  }
  if (tagCounts['CLEAN_DAY']) {
    insights.push(`${tagCounts['CLEAN_DAY']}x z ${totalDays} dní jsi sám označil jako bezchybný den (dodržen plán)`)
  }

  // Warning patterns
  if (tagCounts['FOMO_chased']) {
    insights.push(`Podle self-reportu jsi ${tagCounts['FOMO_chased']}x z ${totalDays} dní naskočil do FOMO pohybu – sleduj, co tyto dny spouští`)
  }
  if (tagCounts['REVENGE_TRADING']) {
    insights.push(`Revenge trading sis sám přiznal ${tagCounts['REVENGE_TRADING']}x tento týden – po dvou ztrátách v řadě si vynuť pauzu`)
  }
  if (tagCounts['EARLY_CLOSE']) {
    insights.push(`${tagCounts['EARLY_CLOSE']}x jsi podle self-reportu uzavřel pozici předčasně ze strachu o zisk`)
  }

  return insights
}

export function buildWeeklyReview(weekTradesInput: NormalizedTrade[], weekJournals: WeekSelfReportDay[] = []): WeeklyReviewData {
  if (weekTradesInput.length === 0) {
    const empty = emptyWeeklyReview()
    const selfReportOnly = buildSelfReportTrend(weekJournals)
    if (selfReportOnly.length > 0) {
      empty.psychologicalInsights = selfReportOnly.slice(0, 7)
    }
    return empty
  }

  const weekTrades = weekTradesInput
    .slice()
    .filter((t) => !isNaN(new Date(t.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (weekTrades.length === 0) return emptyWeeklyReview()

  const winningTrades = weekTrades.filter((t) => t.pnl > 0)
  const losingTrades = weekTrades.filter((t) => t.pnl < 0)
  const totalPnL = weekTrades.reduce((sum, t) => sum + t.pnl, 0)
  const winRate = (winningTrades.length / weekTrades.length) * 100
  const bestTrade = weekTrades.reduce((best, t) => (t.pnl > best.pnl ? t : best), weekTrades[0])
  const worstTrade = weekTrades.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst), weekTrades[0])
  const avgTrade = totalPnL / weekTrades.length

  const avgDiscipline = avgOf(weekTrades, 'discipline')
  const avgStress = avgOf(weekTrades, 'stress')
  const avgConfidence = avgOf(weekTrades, 'confidence')
  const avgMood = avgOf(weekTrades, 'mood')

  // --- Quant metrics (the numbers a serious trader actually wants) ---------
  const grossProfit = winningTrades.reduce((s, t) => s + t.pnl, 0)
  const grossLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  const avgWin = winningTrades.length ? grossProfit / winningTrades.length : 0
  const avgLoss = losingTrades.length ? grossLoss / losingTrades.length : 0
  const expectancy = avgTrade // mean P&L per trade
  const largestWin = winningTrades.length ? Math.max(...winningTrades.map((t) => t.pnl)) : 0
  const largestLoss = losingTrades.length ? Math.min(...losingTrades.map((t) => t.pnl)) : 0
  const avgAbsTrade = weekTrades.reduce((s, t) => s + Math.abs(t.pnl), 0) / weekTrades.length

  // Equity curve + max drawdown, both computed once from the same running sum.
  const equityCurve: number[] = []
  let runningEq = 0
  let peakEq = 0
  let maxDrawdown = 0
  weekTrades.forEach((t) => {
    runningEq += t.pnl
    equityCurve.push(Math.round(runningEq))
    peakEq = Math.max(peakEq, runningEq)
    maxDrawdown = Math.max(maxDrawdown, peakEq - runningEq)
  })
  // Drawdown in "R" units = relative to a typical trade, so the threshold
  // works for a $50 account and a $500k account alike (the old $10 threshold
  // flagged literally every real account as high risk).
  const maxDrawdownR = avgAbsTrade > 0 ? maxDrawdown / avgAbsTrade : null

  // --- Emotional Tax for the week: the app's signature insight, reused here
  // so Weekly Review agrees with the Journal's Emotional Tax Sheet. ---------
  const taxJournalEntries = weekJournals.map((j) => ({ date: j.date, tags: j.tags }))
  const taxSheet = buildEmotionalTaxSheet(weekTrades as any[], taxJournalEntries)
  const emotionalTaxTotal = Math.abs(taxSheet.totals.realLoss)
  const taxRowsSorted = [...taxSheet.rows]
    .filter((r) => r.incidents > 0)
    .sort((a, b) => a.realLoss - b.realLoss) // most negative first
  const topTaxOffender = taxRowsSorted[0] || null
  const emotionalTax = taxSheet.hasData
    ? {
        total: emotionalTaxTotal,
        topOffender: topTaxOffender ? topTaxOffender.label : null,
        rows: taxRowsSorted.map((r) => ({ label: r.label, incidents: r.incidents, realLoss: r.realLoss })),
      }
    : null

  const followedPlanTrades = weekTrades.filter((t) => t.followedPlan !== null && t.followedPlan !== undefined)
  const followedPlanCount = followedPlanTrades.filter((t) => t.followedPlan).length
  const followedPlanRate = followedPlanTrades.length ? (followedPlanCount / followedPlanTrades.length) * 100 : null

  // Consecutive-loss streaks, with the dates they happened on
  let maxConsecutiveLosses = 0
  let currentStreak = 0
  let currentStreakStart: string | null = null
  let worstStreak: { count: number; start: string; end: string } | null = null
  weekTrades.forEach((t) => {
    if (t.pnl < 0) {
      if (currentStreak === 0) currentStreakStart = t.date
      currentStreak++
      if (currentStreak > maxConsecutiveLosses) {
        maxConsecutiveLosses = currentStreak
        worstStreak = { count: currentStreak, start: currentStreakStart!, end: t.date }
      }
    } else {
      currentStreak = 0
    }
  })

  // Revenge-trade detector: a trade placed right after 2+ losses in a row
  let revengeTradeAfter: NormalizedTrade | null = null
  let lossRun = 0
  for (const t of weekTrades) {
    if (lossRun >= 2 && t.pnl < 0) { revengeTradeAfter = t; break }
    lossRun = t.pnl < 0 ? lossRun + 1 : 0
  }

  // Pair concentration
  const pairCounts: Record<string, number> = {}
  const pairPnl: Record<string, number> = {}
  weekTrades.forEach((t) => {
    if (t.pair) {
      pairCounts[t.pair] = (pairCounts[t.pair] || 0) + 1
      pairPnl[t.pair] = (pairPnl[t.pair] || 0) + t.pnl
    }
  })
  const topPairEntry = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]
  const topPair = topPairEntry?.[0]

  // Day-of-week breakdown
  const dayStats: Record<string, { count: number; wins: number; pnl: number }> = {}
  weekTrades.forEach((t) => {
    const day = DAY_NAMES[new Date(t.date).getDay()]
    if (!dayStats[day]) dayStats[day] = { count: 0, wins: 0, pnl: 0 }
    dayStats[day].count++
    if (t.pnl > 0) dayStats[day].wins++
    dayStats[day].pnl += t.pnl
  })
  const dayEntries = Object.entries(dayStats)
  const bestDay = dayEntries.length ? dayEntries.reduce((b, d) => (d[1].pnl > b[1].pnl ? d : b)) : null
  const worstDay = dayEntries.length > 1 ? dayEntries.reduce((w, d) => (d[1].pnl < w[1].pnl ? d : w)) : null

  // Stress / confidence vs outcome correlation
  const avgStressWinners = avgOf(winningTrades, 'stress')
  const avgStressLosers = avgOf(losingTrades, 'stress')
  const avgConfWinners = avgOf(winningTrades, 'confidence')
  const avgConfLosers = avgOf(losingTrades, 'confidence')

  const highlights: string[] = []
  const improvements: string[] = []
  const psychologicalInsights: string[] = []

  // --- Specific, named callouts first (these are what make it feel "real") ---
  const fmtDate = (d: string) => {
    const dt = new Date(d)
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })
  }

  if (bestTrade.pnl > 0) {
    const tag = [bestTrade.direction, bestTrade.pair].filter(Boolean).join(' ')
    const feel = bestTrade.confidence != null ? ` (sebevědomí ${bestTrade.confidence}/10 před vstupem)` : ''
    highlights.push(
      `Nejlepší obchod týdne: ${tag || 'obchod'} z ${fmtDate(bestTrade.date)} za ${fmt(bestTrade.pnl)}$${feel}`,
    )
  }

  if (worstTrade.pnl < 0) {
    const tag = [worstTrade.direction, worstTrade.pair].filter(Boolean).join(' ')
    const isRevenge = revengeTradeAfter && revengeTradeAfter.date === worstTrade.date
    improvements.push(
      isRevenge
        ? `Nejhorší obchod (${tag || 'obchod'}, ${fmtDate(worstTrade.date)}, ${fmt(worstTrade.pnl)}$) přišel hned po dvou předchozích ztrátách – vypadá to na revenge trade`
        : `Nejhorší obchod týdne: ${tag || 'obchod'} z ${fmtDate(worstTrade.date)} za ${fmt(worstTrade.pnl)}$`,
    )
  }

  if (bestDay && dayEntries.length > 1) {
    const [day, stats] = bestDay
    highlights.push(`Nejsilnější den byl ${day} – ${fmt(stats.pnl)}$ z ${stats.count} ${stats.count === 1 ? 'obchodu' : 'obchodů'}`)
  }
  if (worstDay && worstDay[1].pnl < 0) {
    const [day, stats] = worstDay
    improvements.push(`${day} byl nejslabší den – ${fmt(stats.pnl)}$, zvaž proč se ti zrovna tehdy nedařilo`)
  }

  if (topPair && pairCounts[topPair] >= 2) {
    const pnlOnPair = pairPnl[topPair]
    highlights.push(
      `Nejvíc jsi obchodoval ${topPair} (${pairCounts[topPair]}×), ${pnlOnPair >= 0 ? 'vydělal jsi na něm' : 'prodělal jsi na něm'} ${fmt(pnlOnPair)}$`,
    )
  }

  if (winRate >= 60) highlights.push(`Solidní úspěšnost ${winRate.toFixed(0)}% – tvoje vstupy fungují`)
  else if (winRate < 45) improvements.push(`Win rate ${winRate.toFixed(0)}% je nízký – rozeber, co mají neúspěšné obchody společného`)

  if (followedPlanRate !== null) {
    if (followedPlanRate >= 70) highlights.push(`Dodržel jsi svůj plán u ${followedPlanRate.toFixed(0)}% obchodů`)
    else improvements.push(`Plán jsi dodržel jen u ${followedPlanRate.toFixed(0)}% obchodů – disciplína je klíč`)
  }

  if (maxConsecutiveLosses >= 3 && worstStreak) {
    psychologicalInsights.push(
      `${worstStreak.count} ztráty v řadě mezi ${fmtDate(worstStreak.start)} a ${fmtDate(worstStreak.end)} – po druhé ztrátě v řadě si dej pauzu, než vstoupíš do dalšího obchodu`,
    )
  } else if (weekTrades.length >= 3) {
    highlights.push('Žádné dlouhé série ztrát – dobrá emoční kontrola')
  }

  // Real correlations, not just two separate averages
  if (avgStressWinners !== null && avgStressLosers !== null && winningTrades.length && losingTrades.length) {
    const diff = avgStressLosers - avgStressWinners
    if (Math.abs(diff) >= 1.2) {
      psychologicalInsights.push(
        diff > 0
          ? `Ve ztrátových obchodech jsi měl v průměru vyšší stres (${avgStressLosers.toFixed(1)}/10) než ve výherních (${avgStressWinners.toFixed(1)}/10) – stres tě tlačí k horším rozhodnutím`
          : `Zajímavé: ve výherních obchodech jsi měl naopak vyšší stres (${avgStressWinners.toFixed(1)}/10) než ve ztrátových (${avgStressLosers.toFixed(1)}/10) – tlak tě možná paradoxně zostřuje`,
      )
    }
  }
  if (avgConfWinners !== null && avgConfLosers !== null && winningTrades.length && losingTrades.length) {
    const diff = avgConfWinners - avgConfLosers
    if (Math.abs(diff) >= 1.2) {
      psychologicalInsights.push(
        diff > 0
          ? `Když jsi vstupoval se sebevědomím ${avgConfWinners.toFixed(1)}/10+, obchody vycházely lépe než ty se sebevědomím ${avgConfLosers.toFixed(1)}/10 – nízké sebevědomí je varovný signál nevstupovat`
          : `Nejlepší obchody přišly i s nižším sebevědomím (${avgConfWinners.toFixed(1)}/10) než ztrátové (${avgConfLosers.toFixed(1)}/10) – možná příliš velké sebevědomí tě vede k horším vstupům`,
      )
    }
  }
  if (avgStress !== null && psychologicalInsights.length < 3) {
    psychologicalInsights.push(
      avgStress >= 6
        ? `Průměrný stres během obchodování byl vysoký (${avgStress.toFixed(1)}/10) – zvaž kratší seance`
        : `Stres byl celý týden pod kontrolou (${avgStress.toFixed(1)}/10)`,
    )
  }
  if (avgDiscipline !== null) {
    psychologicalInsights.push(`Disciplína v průměru ${avgDiscipline.toFixed(1)}/10 napříč obchody tento týden`)
  }
  if (avgMood !== null && avgConfidence !== null && psychologicalInsights.length < 5) {
    psychologicalInsights.push(`Sebevědomí před obchody ${avgConfidence.toFixed(1)}/10, nálada po obchodech ${avgMood.toFixed(1)}/10`)
  }

  // Self-reported daily tags (FOMO_overcome/FOMO_chased/REVENGE_TRADING/EARLY_CLOSE/CLEAN_DAY)
  const selfReportInsights = buildSelfReportTrend(weekJournals)
  psychologicalInsights.push(...selfReportInsights)

  const nextWeekFocus: string[] = []
  if (revengeTradeAfter) {
    nextWeekFocus.push('Po dvou ztrátách za sebou si vynuť alespoň 15minutovou pauzu před dalším vstupem')
  } else if (maxConsecutiveLosses >= 3) {
    nextWeekFocus.push('Nastav si pravidlo: po druhé ztrátě v řadě stop pro daný den')
  }
  if (followedPlanRate !== null && followedPlanRate < 70) {
    nextWeekFocus.push('Zaměř se na 100% dodržování plánu před vstupem do obchodu')
  }
  if (winRate < 50) {
    nextWeekFocus.push('Zaměř se na revizi vstupních pravidel – win rate je pod 50 %')
  }
  if (topPair && pairPnl[topPair] < 0) {
    nextWeekFocus.push(`Přehodnoť obchodování na ${topPair} – tento týden je v minusu`)
  }
  if (nextWeekFocus.length < 3) {
    nextWeekFocus.push(
      winRate >= 50 ? 'Udržuj kvalitní setupy a nepřeobchoduj' : 'Obchoduj menší velikost pozic, dokud se výsledky nezlepší',
    )
  }
  if (nextWeekFocus.length < 3) nextWeekFocus.push('Udržuj maximální riziko 2 % kapitálu na jeden obchod')

  // --- Emotional Tax callouts (consistent with the Journal's tax sheet) ----
  if (emotionalTax && topTaxOffender) {
    improvements.push(
      `Emoční chyby tě tento týden stály ${money(emotionalTaxTotal)} (${taxSheet.totals.incidents}× incident) – nejdražší byl ${topTaxOffender.label.toLowerCase()} za ${money(topTaxOffender.realLoss)}`,
    )
    if (taxSheet.strategyPnL > 0 && taxSheet.emotionalPnL < 0) {
      highlights.push(
        `Tvá čistá strategie vydělala ${moneySigned(taxSheet.strategyPnL)} – problém nejsou vstupy, ale emoční obchody (${moneySigned(taxSheet.emotionalPnL)})`,
      )
    }
    nextWeekFocus.unshift(`Cíl: nula incidentů typu „${topTaxOffender.label}“ – to byl tento týden tvůj nejdražší vzorec`)
  }
  if (profitFactor !== Infinity && profitFactor >= 1.5 && losingTrades.length > 0) {
    highlights.push(`Profit faktor ${profitFactor.toFixed(2)} – tvé výhry solidně převažují ztráty`)
  } else if (profitFactor !== Infinity && profitFactor < 1 && weekTrades.length >= 4) {
    improvements.push(`Profit faktor ${profitFactor.toFixed(2)} (pod 1.0) – ztráty převažují výhry, zmenši velikost ztrát nebo zvyš kvalitu vstupů`)
  }

  // --- Weekly grade (process-weighted, not just P&L) -----------------------
  const revengeIncidents = (taxSheet.rows.find((r) => r.key === 'revenge')?.incidents) || 0
  let gScore = 100
  if (totalPnL < 0) gScore -= 6
  if (winRate < 40) gScore -= 18
  else if (winRate < 50) gScore -= 10
  else if (winRate >= 60) gScore += 4
  if (followedPlanRate !== null) {
    if (followedPlanRate < 50) gScore -= 18
    else if (followedPlanRate < 70) gScore -= 9
    else if (followedPlanRate >= 90) gScore += 5
  }
  if (avgDiscipline !== null) {
    if (avgDiscipline < 5) gScore -= 10
    else if (avgDiscipline >= 8) gScore += 4
  }
  gScore -= Math.min(24, revengeIncidents * 8)
  if (grossProfit > 0 && emotionalTaxTotal > grossProfit * 0.5) gScore -= 10
  if (maxDrawdownR !== null) {
    if (maxDrawdownR > 4) gScore -= 14
    else if (maxDrawdownR > 2.5) gScore -= 7
  }
  gScore = Math.max(0, Math.min(100, Math.round(gScore)))
  const gLetter = gScore >= 90 ? 'A' : gScore >= 80 ? 'B' : gScore >= 70 ? 'C' : gScore >= 58 ? 'D' : 'F'
  let gHeadline: string
  if (revengeIncidents > 0) gHeadline = 'Revenge trading ti tento týden srazil známku nejvíc'
  else if (followedPlanRate !== null && followedPlanRate < 70) gHeadline = 'Největší slabina týdne je disciplína v dodržování plánu'
  else if (winRate < 50) gHeadline = 'Edge potřebuje doladit – nízký win rate'
  else if (maxDrawdownR !== null && maxDrawdownR > 4) gHeadline = 'Výsledek táhl dolů hluboký propad uvnitř týdne'
  else if (gLetter === 'A' || gLetter === 'B') gHeadline = 'Silný, disciplinovaný týden – drž ten proces'
  else gHeadline = 'Solidní týden s prostorem pro doladění'
  const grade = { letter: gLetter, score: gScore, headline: gHeadline }

  // --- Risk assessment grounded in drawdown-as-R (works at any account size)
  const riskAssessment =
    maxDrawdownR === null
      ? 'Bez dostatku obchodů nelze spolehlivě vyhodnotit riziko.'
      : maxDrawdownR > 4
        ? `Zvýšené riziko – maximální propad uvnitř týdne byl ${money(maxDrawdown)} (${maxDrawdownR.toFixed(1)}× tvůj průměrný obchod). Sniž velikost pozic, dokud se křivka neuklidní.`
        : maxDrawdownR > 2.5
          ? `Mírně zvýšené riziko – propad ${money(maxDrawdown)} (${maxDrawdownR.toFixed(1)}× průměrný obchod). Drž velikost pozic na uzdě a sleduj sérii ztrát.`
          : `Riziko pod kontrolou – maximální propad jen ${money(maxDrawdown)} (${maxDrawdownR.toFixed(1)}× průměrný obchod). Pokračuj ve stejném risk managementu.`

  const bestTag = [bestTrade.direction, bestTrade.pair].filter(Boolean).join(' ')
  const summary =
    `Známka týdne: ${grade.letter} (${grade.score}/100). ` +
    `Udělal jsi ${weekTrades.length} ${weekTrades.length === 1 ? 'obchod' : 'obchodů'} s ${winRate.toFixed(0)}% úspěšností a výsledkem ${moneySigned(totalPnL)}. ` +
    `Tahounem byl${bestTag ? ` ${bestTag}` : ''} obchod z ${fmtDate(bestTrade.date)} (${moneySigned(bestTrade.pnl)})` +
    (worstTrade.pnl < 0 ? `, naopak nejvíc bolel obchod z ${fmtDate(worstTrade.date)} (${moneySigned(worstTrade.pnl)}).` : '.') +
    (emotionalTax && emotionalTaxTotal > 0
      ? ` Tvé emoce tě přitom stály ${money(emotionalTaxTotal)} – nejvíc ${(topTaxOffender?.label || '').toLowerCase()}.`
      : '')

  const pfDisplay = profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)

  return {
    summary,
    keyMetrics: [
      { label: 'Celkem obchodů', value: weekTrades.length, trend: 'neutral' },
      { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, trend: winRate >= 55 ? 'up' : winRate < 45 ? 'down' : 'neutral' },
      { label: 'Týdenní P&L', value: money(totalPnL), trend: totalPnL > 0 ? 'up' : totalPnL < 0 ? 'down' : 'neutral' },
      { label: 'Profit faktor', value: pfDisplay, trend: profitFactor >= 1.3 ? 'up' : profitFactor < 1 ? 'down' : 'neutral' },
      { label: 'Průměrný obchod', value: money(expectancy), trend: expectancy >= 0 ? 'up' : 'down' },
      { label: 'Max. propad', value: money(maxDrawdown), trend: 'down' },
    ],
    highlights: highlights.length ? highlights : ['Stabilní týden bez výrazných výkyvů'],
    improvements: improvements.length ? improvements : ['Pokračuj v zapisování obchodů pro hlubší analýzu'],
    nextWeekFocus: nextWeekFocus.slice(0, 3),
    psychologicalInsights: psychologicalInsights.length ? psychologicalInsights.slice(0, 7) : ['Nedostatek psychologických dat za tento týden'],
    riskAssessment,
    grade,
    quant: {
      profitFactor: profitFactor === Infinity ? null : Math.round(profitFactor * 100) / 100,
      avgWin: Math.round(avgWin),
      avgLoss: Math.round(avgLoss),
      expectancy: Math.round(expectancy),
      largestWin: Math.round(largestWin),
      largestLoss: Math.round(largestLoss),
      maxDrawdown: Math.round(maxDrawdown),
      maxDrawdownR: maxDrawdownR === null ? null : Math.round(maxDrawdownR * 10) / 10,
    },
    equityCurve,
    emotionalTax,
  }
}
