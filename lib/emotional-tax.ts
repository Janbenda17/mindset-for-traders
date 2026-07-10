// "Účet za emoce" (The Emotional Tax Sheet) engine.
//
// Turns a set of trades + self-report tags into a per-error-type ledger of
// what the trader's psychology cost them. The philosophy mirrors the rest of
// the app: incident counts and *realLoss* are FACTS read straight from the
// trades; the *savedBySelfControl* and *potentialSaving* columns are clearly
// labelled ESTIMATES, every one of them grounded in the trader's own average
// loss size — never an invented market number.
//
// Four behavioural error types, each detected from real signals:
//   - FOMO          – chasing a move late (per-trade `fomo`/`chasedEntry`
//                     flag, or a FOMO_chased self-report day).
//   - Revenge       – re-entering within 20 min after a loss with size >= the
//                     previous one (objective, via countRevengeTrades), or an
//                     explicit `revengeTrade` flag / REVENGE_TRADING tag.
//   - No-SL         – a position opened with no stop loss (`hasStopLoss===false`
//                     / `noStopLoss===true`, or an explicit zero stopLoss).
//   - Oversizing    – position size well above the trader's own median
//                     (> median x 1.5), matching the leak rule in daily-summary.

import { countRevengeTrades } from './daily-summary'

export type TaxKey = 'fomo' | 'revenge' | 'noStop' | 'oversizing'

export interface EmotionalTaxRow {
  key: TaxKey
  label: string // Czech / EN label
  sublabel: string // one-line description
  incidents: number
  realLoss: number // <= 0, exact sum of losses from flagged trades
  savedBySelfControl: number // >= 0, estimate of $ preserved by the disciplined opposite
  potentialSaving: number // <= 0, estimate of how much higher the account could be
}

export interface EmotionalTaxSheet {
  rows: EmotionalTaxRow[]
  totals: { incidents: number; realLoss: number; saved: number; potential: number }
  strategyPnL: number // net P&L of trades with NO behavioural flag ("the edge")
  emotionalPnL: number // net P&L of trades carrying at least one flag
  totalPnL: number
  tradesAnalyzed: number
  hasData: boolean
}

interface TradeFlags {
  fomo: boolean
  revenge: boolean
  noStop: boolean
  oversizing: boolean
}

const KNOWN_TAGS = ['FOMO_overcome', 'FOMO_chased', 'REVENGE_TRADING', 'EARLY_CLOSE', 'CLEAN_DAY']

function dayKeyOf(t: any): string {
  return String(t?.date || t?.closeDate || t?.openTime || '').slice(0, 10)
}

function pnlOf(t: any): number {
  const v = t?.pnl ?? t?.profitLoss ?? 0
  return typeof v === 'number' ? v : Number(v) || 0
}

function sizeOf(t: any): number | null {
  const v = t?.positionSize ?? t?.lots ?? t?.volume
  return typeof v === 'number' && v > 0 ? v : null
}

function hasNoStop(t: any): boolean {
  if (t?.noStopLoss === true) return true
  if (t?.hasStopLoss === false) return true
  // Only treat an explicit zero/empty stop as "no stop"; a missing field is
  // unknown (most MT5 syncs don't carry SL yet) and must NOT be counted.
  if (('stopLoss' in (t || {}) || 'sl' in (t || {})) && !t.stopLoss && !t.sl) return true
  return false
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// Build a date -> Set<tag> map from journal entries carrying self-report tags.
function tagsByDay(journalEntries: any[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>()
  for (const j of journalEntries || []) {
    if (!Array.isArray(j?.tags)) continue
    const rel = j.tags.filter((t: string) => KNOWN_TAGS.includes(t))
    if (rel.length === 0) continue
    const key = dayKeyOf(j)
    if (!key) continue
    const set = m.get(key) || new Set<string>()
    rel.forEach((t: string) => set.add(t))
    m.set(key, set)
  }
  return m
}

/**
 * Detects the four behavioural flags for every trade. Revenge is computed
 * per-day (it needs the day's ordered sequence); the rest are per-trade.
 */
export function flagTrades(trades: any[], journalEntries: any[] = []): TradeFlags[] {
  const flags: TradeFlags[] = trades.map(() => ({ fomo: false, revenge: false, noStop: false, oversizing: false }))
  const dayTags = tagsByDay(journalEntries)

  // Oversizing uses the trader's overall median size (robust when most days
  // only have 1-2 trades).
  const allSizes = trades.map(sizeOf).filter((v): v is number => v !== null)
  const medSize = median(allSizes)

  // Group original indices by day for revenge + FOMO-day attribution.
  const byDay = new Map<string, number[]>()
  trades.forEach((t, i) => {
    const k = dayKeyOf(t)
    if (!k) return
    if (!byDay.has(k)) byDay.set(k, [])
    byDay.get(k)!.push(i)
  })

  trades.forEach((t, i) => {
    // Per-trade flags
    if (t?.fomo === true || t?.chasedEntry === true) flags[i].fomo = true
    if (t?.revengeTrade === true) flags[i].revenge = true
    if (hasNoStop(t)) flags[i].noStop = true
    const sz = sizeOf(t)
    if (medSize && sz && sz > medSize * 1.5) flags[i].oversizing = true
  })

  // Per-day revenge detection + FOMO_chased day attribution.
  byDay.forEach((indices, day) => {
    const ordered = [...indices].sort(
      (a, b) => new Date(trades[a]?.date || 0).getTime() - new Date(trades[b]?.date || 0).getTime(),
    )
    const orderedTrades = ordered.map((idx) => trades[idx])
    const { revengeFlags } = countRevengeTrades(orderedTrades)
    revengeFlags.forEach((isRev, pos) => {
      if (isRev) flags[ordered[pos]].revenge = true
    })

    const tags = dayTags.get(day)
    if (tags?.has('REVENGE_TRADING')) {
      // Attribute the day's worst loss to revenge if nothing else caught it.
      if (!ordered.some((idx) => flags[idx].revenge)) {
        const worst = ordered.reduce((w, idx) => (pnlOf(trades[idx]) < pnlOf(trades[w]) ? idx : w), ordered[0])
        if (pnlOf(trades[worst]) < 0) flags[worst].revenge = true
      }
    }
    if (tags?.has('FOMO_chased')) {
      // Attribute one FOMO incident to the day's worst loss if no per-trade
      // FOMO flag is present that day.
      if (!ordered.some((idx) => flags[idx].fomo)) {
        const worst = ordered.reduce((w, idx) => (pnlOf(trades[idx]) < pnlOf(trades[w]) ? idx : w), ordered[0])
        if (pnlOf(trades[worst]) < 0) flags[worst].fomo = true
      }
    }
  })

  return flags
}

const ROW_META: Record<TaxKey, { label: string; labelEn: string; sub: string; subEn: string }> = {
  fomo: {
    label: 'FOMO (naskakování pozdě)',
    labelEn: 'FOMO (chasing late)',
    sub: 'Vstup do již rozjetého pohybu ze strachu, že o něj přijdeš',
    subEn: 'Jumping into an already-running move for fear of missing out',
  },
  revenge: {
    label: 'Revenge Trading (pomsta)',
    labelEn: 'Revenge Trading',
    sub: 'Rychlý znovu-vstup po ztrátě, snaha pomstít se trhu',
    subEn: 'Re-entering fast after a loss to get back at the market',
  },
  noStop: {
    label: 'No-SL (hazard bez ochrany)',
    labelEn: 'No-SL (no stop loss)',
    sub: 'Pozice otevřená bez stop-lossu — neomezené riziko',
    subEn: 'A position opened without a stop loss — unlimited risk',
  },
  oversizing: {
    label: 'Oversizing (přepálené loty)',
    labelEn: 'Oversizing',
    sub: 'Výrazně větší pozice než tvůj běžný objem',
    subEn: 'Position size well above your usual volume',
  },
}

const SAVED_WEIGHT: Record<TaxKey, number> = { fomo: 1.0, revenge: 0.35, noStop: 0.7, oversizing: 0.3 }

export function buildEmotionalTaxSheet(
  trades: any[],
  journalEntries: any[] = [],
  isEn = false,
): EmotionalTaxSheet {
  const safeTrades = (trades || []).filter((t) => t && (t.type === undefined || t.type === 'trade'))
  const flags = flagTrades(safeTrades, journalEntries)

  const losing = safeTrades.filter((t) => pnlOf(t) < 0)
  const avgLossMag =
    losing.length > 0
      ? losing.reduce((s, t) => s + Math.abs(pnlOf(t)), 0) / losing.length
      : safeTrades.length > 0
        ? (safeTrades.reduce((s, t) => s + Math.abs(pnlOf(t)), 0) / safeTrades.length) * 0.8
        : 0

  const allSizes = safeTrades.map(sizeOf).filter((v): v is number => v !== null)
  const medSize = median(allSizes)
  const dayTags = tagsByDay(journalEntries)

  // Pre-compute per-day loss/revenge presence for "resisted" estimates.
  const dayHasLoss = new Map<string, boolean>()
  const dayHasRevenge = new Map<string, boolean>()
  const dayHasOversize = new Map<string, boolean>()
  safeTrades.forEach((t, i) => {
    const k = dayKeyOf(t)
    if (!k) return
    if (pnlOf(t) < 0) dayHasLoss.set(k, true)
    if (flags[i].revenge) dayHasRevenge.set(k, true)
    if (flags[i].oversizing) dayHasOversize.set(k, true)
  })

  let fomoOvercomeDays = 0
  dayTags.forEach((set) => {
    if (set.has('FOMO_overcome')) fomoOvercomeDays++
  })

  const makeRow = (key: TaxKey): EmotionalTaxRow => {
    const idxs = safeTrades.map((_, i) => i).filter((i) => flags[i][key])
    const incidents = idxs.length
    const realLoss = idxs.reduce((s, i) => (pnlOf(safeTrades[i]) < 0 ? s + pnlOf(safeTrades[i]) : s), 0)
    const lossyCount = idxs.filter((i) => pnlOf(safeTrades[i]) < 0).length

    // --- "saved by self-control": resistedCount x avg loss x weight, capped.
    let resisted = 0
    if (key === 'fomo') {
      resisted = fomoOvercomeDays
    } else if (key === 'revenge') {
      // Days with a loss but no revenge incident = the urge was resisted.
      dayHasLoss.forEach((_, k) => {
        if (!dayHasRevenge.get(k)) resisted++
      })
    } else if (key === 'noStop') {
      // Losing trades that DID carry a stop (hasStopLoss === true).
      resisted = losing.filter((t) => t?.hasStopLoss === true).length
    } else {
      // Oversizing: days with a loss where size stayed at/under normal.
      dayHasLoss.forEach((_, k) => {
        if (!dayHasOversize.get(k)) resisted++
      })
    }
    let saved = Math.round(resisted * avgLossMag * SAVED_WEIGHT[key])
    const savedCap = Math.round(Math.abs(realLoss) * 1.5) || Math.round(avgLossMag * 3)
    if (saved > savedCap) saved = savedCap

    // --- "potential saving" (how much higher the account could be), <= 0.
    let potential = 0
    if (key === 'fomo' || key === 'revenge') {
      // Fully avoidable — these trades should never have happened.
      potential = Math.round(realLoss)
    } else if (key === 'noStop') {
      // A normal stop would have capped each loss at ~avg loss size; only the
      // excess beyond that is recoverable.
      const cappedPerTrade = avgLossMag // typical controlled loss magnitude
      potential = Math.round(Math.min(0, realLoss + lossyCount * cappedPerTrade))
    } else {
      // Oversizing: only the excess from the oversized portion is recoverable.
      let excess = 0
      idxs.forEach((i) => {
        const t = safeTrades[i]
        const sz = sizeOf(t)
        if (pnlOf(t) < 0 && sz && medSize) {
          const normalFraction = Math.min(1, medSize / sz)
          excess += pnlOf(t) * (1 - normalFraction)
        }
      })
      potential = Math.round(excess)
    }
    // Potential can never claim back more than was actually lost.
    if (potential < realLoss) potential = Math.round(realLoss)

    const meta = ROW_META[key]
    return {
      key,
      label: isEn ? meta.labelEn : meta.label,
      sublabel: isEn ? meta.subEn : meta.sub,
      incidents,
      realLoss: Math.round(realLoss),
      savedBySelfControl: saved,
      potentialSaving: potential,
    }
  }

  const rows = (['fomo', 'revenge', 'noStop', 'oversizing'] as TaxKey[]).map(makeRow)

  const flaggedIdx = new Set<number>()
  flags.forEach((f, i) => {
    if (f.fomo || f.revenge || f.noStop || f.oversizing) flaggedIdx.add(i)
  })
  const emotionalPnL = Math.round(
    safeTrades.reduce((s, t, i) => (flaggedIdx.has(i) ? s + pnlOf(t) : s), 0),
  )
  const strategyPnL = Math.round(
    safeTrades.reduce((s, t, i) => (flaggedIdx.has(i) ? s : s + pnlOf(t)), 0),
  )
  const totalPnL = Math.round(safeTrades.reduce((s, t) => s + pnlOf(t), 0))

  const totals = rows.reduce(
    (acc, r) => ({
      incidents: acc.incidents + r.incidents,
      realLoss: acc.realLoss + r.realLoss,
      saved: acc.saved + r.savedBySelfControl,
      potential: acc.potential + r.potentialSaving,
    }),
    { incidents: 0, realLoss: 0, saved: 0, potential: 0 },
  )

  return {
    rows,
    totals,
    strategyPnL,
    emotionalPnL,
    totalPnL,
    tradesAnalyzed: safeTrades.length,
    hasData: totals.incidents > 0,
  }
}

// ---------------------------------------------------------------------------
// Trade Autopsy — second-by-second dissection for the day-detail panel.
// ---------------------------------------------------------------------------

export interface TradeAutopsyItem {
  tradeId: string
  category: TaxKey | 'clean'
  emoji: string
  title: string
  timeLabel: string | null
  narrative: string
  emotionalCost: number // $ attributed to the emotional decision (>= 0)
  roi: 'controlled' | 'leak'
}

// Resolve a clock time with seconds from openTime ("HH:MM[:SS]") or the date.
function clockOf(t: any): { date: Date | null; label: string | null } {
  const raw = t?.openTime || t?.time || t?.date
  if (!raw) return { date: null, label: null }
  let d: Date
  if (typeof raw === 'string' && /^\d{1,2}:\d{2}/.test(raw)) {
    const base = new Date(t?.date || Date.now())
    const m = raw.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
    d = new Date(base)
    if (m) d.setHours(+m[1], +m[2], m[3] ? +m[3] : 0, 0)
  } else {
    d = new Date(raw)
  }
  if (isNaN(d.getTime())) return { date: null, label: null }
  const hasClock = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0
  return {
    date: d,
    label: hasClock ? d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null,
  }
}

function gapPhrase(seconds: number, isEn: boolean): string {
  if (seconds < 90) return isEn ? `${Math.round(seconds)} seconds later` : `o ${Math.round(seconds)} vteřin později`
  const mins = Math.round(seconds / 60)
  return isEn ? `${mins} min later` : `o ${mins} min později`
}

/**
 * Produces a hyper-detailed autopsy for a single day's trades. Each emotional
 * trade gets a forensic narrative + an "emotional ROI" verdict; clean trades
 * get a green "under control" verdict.
 */
export function buildTradeAutopsy(
  dayTrades: any[],
  journalTags: string[] = [],
  isEn = false,
): { items: TradeAutopsyItem[]; emotionalTotal: number } {
  const sorted = [...(dayTrades || [])].sort(
    (a, b) => new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
  )
  const flags = flagTrades(sorted, journalTags.length ? [{ date: dayTrades[0]?.date, tags: journalTags }] : [])
  const sizes = sorted.map(sizeOf).filter((v): v is number => v !== null)
  const medSize = median(sizes)

  const items: TradeAutopsyItem[] = []
  let emotionalTotal = 0

  sorted.forEach((t, i) => {
    const pnl = pnlOf(t)
    const clock = clockOf(t)
    const pair = t?.pair || (isEn ? 'trade' : 'obchod')
    const dir = String(t?.direction || '').toLowerCase()
    const dirLabel = dir.startsWith('s') ? 'short' : dir ? 'long' : ''
    const f = flags[i]

    // Pick the dominant category for the narrative (revenge > noStop > oversizing > fomo).
    let category: TaxKey | 'clean' = 'clean'
    if (f.revenge) category = 'revenge'
    else if (f.noStop) category = 'noStop'
    else if (f.oversizing) category = 'oversizing'
    else if (f.fomo) category = 'fomo'

    if (category === 'clean') {
      items.push({
        tradeId: t?.id || `t-${i}`,
        category: 'clean',
        emoji: '✅',
        title: isEn ? 'Under control' : 'Pod kontrolou',
        timeLabel: clock.label,
        narrative: isEn
          ? `${dirLabel ? dirLabel.toUpperCase() + ' ' : ''}${pair}${clock.label ? ` at ${clock.label}` : ''} — clean execution, in line with the plan.`
          : `${dirLabel ? dirLabel.toUpperCase() + ' ' : ''}${pair}${clock.label ? ` v ${clock.label}` : ''} — čistá exekuce v souladu s plánem.`,
        emotionalCost: 0,
        roi: 'controlled',
      })
      return
    }

    const sz = sizeOf(t)
    let emotionalCost = pnl < 0 ? Math.abs(pnl) : 0
    let title = ''
    let emoji = ''
    let narrative = ''

    if (category === 'revenge') {
      emoji = '🔁'
      title = isEn ? 'Revenge Trade' : 'Revenge Trade'
      const prev = sorted[i - 1]
      const prevClock = clockOf(prev)
      let gapTxt = ''
      if (prev && prevClock.date && clock.date) {
        const sec = (clock.date.getTime() - prevClock.date.getTime()) / 1000
        if (sec >= 0) gapTxt = ` (${gapPhrase(sec, isEn)})`
      }
      const prevSz = sizeOf(prev)
      let sizeTxt = ''
      if (sz && prevSz && sz > prevSz * 1.3) {
        sizeTxt = isEn
          ? ` but with ${(sz / prevSz).toFixed(1)}× the size (${sz} vs ${prevSz} lots)`
          : ` ale s ${(sz / prevSz).toFixed(1)}× objemem (${sz} místo ${prevSz} lotu)`
      }
      narrative = isEn
        ? `${prevClock.label ? `At ${prevClock.label} you closed a ${pair} trade at a loss. At ${clock.label || '—'}${gapTxt} you clicked back in${sizeTxt}. Textbook revenge trade — the market wasn't running away, you just couldn't sit with being wrong.`
          : `You re-entered fast after a loss${sizeTxt}. The market wasn't running away — you were fighting your own impatience.`}`
        : `${prevClock.label ? `V ${prevClock.label} jsi zavřel ${pair} ve ztrátě. V ${clock.label || '—'}${gapTxt} jsi tam kliknul znova${sizeTxt}. Učebnicový revenge trade — trh ti neutíkal, ty jsi jen nedokázal unést pocit, že jsi neměl pravdu.`
          : `Rychlý znovu-vstup po ztrátě${sizeTxt}. Trh ti neutíkal — bojoval jsi s vlastní netrpělivostí.`}`
    } else if (category === 'noStop') {
      emoji = '🛑'
      title = isEn ? 'No stop loss' : 'Bez stop-lossu'
      narrative = isEn
        ? `${dirLabel.toUpperCase()} ${pair}${clock.label ? ` at ${clock.label}` : ''} opened with no stop loss. ${pnl < 0 ? `It cost you $${Math.abs(Math.round(pnl))} — with a defined stop the damage would have been capped.` : `It worked out this time, but unlimited risk is a matter of when, not if.`}`
        : `${dirLabel.toUpperCase()} ${pair}${clock.label ? ` v ${clock.label}` : ''} otevřený bez stop-lossu. ${pnl < 0 ? `Stálo tě to $${Math.abs(Math.round(pnl))} — s nastaveným stopem by byla škoda omezená.` : `Tentokrát to vyšlo, ale neomezené riziko je otázka kdy, ne jestli.`}`
    } else if (category === 'oversizing') {
      emoji = '📈'
      title = isEn ? 'Oversized position' : 'Přepálená pozice'
      const mult = sz && medSize ? (sz / medSize).toFixed(1) : null
      // Cost attributed = the excess loss from the oversized portion.
      if (pnl < 0 && sz && medSize) emotionalCost = Math.abs(Math.round(pnl * (1 - Math.min(1, medSize / sz))))
      narrative = isEn
        ? `${pair}${clock.label ? ` at ${clock.label}` : ''} opened at ${sz} lots — ${mult ? `${mult}× ` : ''}your usual size. ${pnl < 0 ? `Of the $${Math.abs(Math.round(pnl))} loss, roughly $${emotionalCost} came purely from the oversize.` : `It won this time, but the size — not the setup — was driving the risk.`}`
        : `${pair}${clock.label ? ` v ${clock.label}` : ''} otevřený na ${sz} lotech — ${mult ? `${mult}× ` : ''}tvůj běžný objem. ${pnl < 0 ? `Ze ztráty $${Math.abs(Math.round(pnl))} šlo zhruba $${emotionalCost} čistě na vrub přepálené velikosti.` : `Tentokrát vyhrál, ale riziko hnala velikost, ne setup.`}`
    } else {
      emoji = '🏃'
      title = isEn ? 'FOMO entry' : 'FOMO vstup'
      narrative = isEn
        ? `${dirLabel.toUpperCase()} ${pair}${clock.label ? ` at ${clock.label}` : ''} — you chased an already-running move. ${pnl < 0 ? `The late entry cost $${Math.abs(Math.round(pnl))}.` : `It worked, but chasing is a coin flip, not an edge.`}`
        : `${dirLabel.toUpperCase()} ${pair}${clock.label ? ` v ${clock.label}` : ''} — naskočil jsi do již rozjetého pohybu. ${pnl < 0 ? `Pozdní vstup tě stál $${Math.abs(Math.round(pnl))}.` : `Vyšlo to, ale honit pohyb je hod mincí, ne edge.`}`
    }

    emotionalTotal += emotionalCost
    items.push({
      tradeId: t?.id || `t-${i}`,
      category,
      emoji,
      title,
      timeLabel: clock.label,
      narrative,
      emotionalCost,
      roi: 'leak',
    })
  })

  return { items, emotionalTotal: Math.round(emotionalTotal) }
}
