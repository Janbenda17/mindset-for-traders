// Discipline Matrix engine — per-day discipline color for the Journal
// heatmap. Deliberately self-contained: it does NOT reuse
// buildDailySummary's 0-100 `discipline.score` average, because that score
// mixes an ambiguous 0-10 self-rated "discipline" number (only present on
// demo/virtual trades) with plan-adherence booleans, and is meaningless for
// real MT5-synced trades that carry neither field.
//
// What MT5 auto-synced trades (mt4_trades table, via /api/trades/webhook)
// actually carry: price, volume, P&L, open/close time. No followedPlan,
// no matchedPlan, no discipline rating, no revenge flag. Manually-added
// trades (/api/trades/add) and demo/virtual trades DO carry followedPlan /
// matchedPlan booleans. So the color rule below uses, in priority order:
//
//   1. Self-report tag REVENGE_TRADING for that day, OR an objectively
//      detected revenge re-entry (countRevengeTrades — two losses within
//      20 minutes, second >= first) -> always RED, regardless of P&L.
//   2. followedPlan/matchedPlan boolean ratio for that day, when at least
//      one trade carries it -> score = ratio * 100, colored with the same
//      80/50 thresholds used on /daily-tracker (emerald/orange/red).
//      A CLEAN_DAY or FOMO_overcome self-report tag can lift a borderline
//      day; an EARLY_CLOSE/FOMO_chased tag can pull a green day down to
//      orange (mild rule break called out by the trader themselves).
//   3. No plan-adherence signal at all (the common case for pure MT5
//      auto-sync with no manual tagging) -> ORANGE. Never inferred from
//      whether the day was profitable or not — a financial loss with a
//      clean process must NOT default to red, and an undisciplined win
//      must NOT default to green. Orange here means "no discipline
//      signal recorded", not "rule broken"; CLEAN_DAY/FOMO_overcome tags
//      still lift it to green, and REVENGE_TRADING still forces red.
//   4. Zero trades AND zero journal entries that day -> GRAY ("no trading
//      day"), excluded from scoring entirely.

export type DisciplineColor = 'emerald' | 'orange' | 'red' | 'gray'

export interface DisciplineDay {
  date: string // YYYY-MM-DD
  color: DisciplineColor
  score: number | null // 0-100 display score, null for gray (no-trade) days
  tradeCount: number
  tags: string[]
  reason: string // short Czech explanation for the tooltip
}

const KNOWN_SELF_REPORT_TAGS = ['FOMO_overcome', 'FOMO_chased', 'REVENGE_TRADING', 'EARLY_CLOSE', 'CLEAN_DAY']

function dateKey(value: any): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return typeof value === 'string' ? value.slice(0, 10) : ''
  return d.toISOString().slice(0, 10)
}

function colorFromScore(score: number): DisciplineColor {
  if (score >= 80) return 'emerald'
  if (score >= 50) return 'orange'
  return 'red'
}

// Lazily imported to avoid a circular dependency at module-load time
// (daily-summary.ts has no dependency back on this file, but importing it
// at the top of a shared lib file is kept local to this one call site for
// clarity about exactly where the shared revenge logic is used).
import { countRevengeTrades } from './daily-summary'

/**
 * Builds one DisciplineDay per calendar day that has at least one trade or
 * journal entry, covering the union of both date sets.
 */
export function buildDisciplineMatrix(trades: any[], journalEntries: any[]): DisciplineDay[] {
  const tradesByDay = new Map<string, any[]>()
  for (const t of trades || []) {
    const key = dateKey(t?.date || t?.closeDate || t?.openTime)
    if (!key) continue
    if (!tradesByDay.has(key)) tradesByDay.set(key, [])
    tradesByDay.get(key)!.push(t)
  }

  const tagsByDay = new Map<string, string[]>()
  for (const j of journalEntries || []) {
    if (!Array.isArray(j?.tags) || j.tags.length === 0) continue
    const key = dateKey(j?.date)
    if (!key) continue
    const relevant = j.tags.filter((t: string) => KNOWN_SELF_REPORT_TAGS.includes(t))
    if (relevant.length === 0) continue
    const existing = tagsByDay.get(key) || []
    tagsByDay.set(key, [...new Set([...existing, ...relevant])])
  }

  const allDays = new Set<string>([...tradesByDay.keys(), ...tagsByDay.keys()])
  const result: DisciplineDay[] = []

  for (const day of allDays) {
    const dayTrades = tradesByDay.get(day) || []
    const tags = tagsByDay.get(day) || []

    if (dayTrades.length === 0) {
      // Journal-only day (e.g. a reflection note with no trades) — still
      // worth showing on the matrix, but never scored as disciplined/not.
      result.push({
        date: day,
        color: 'gray',
        score: null,
        tradeCount: 0,
        tags,
        reason: 'Žádné obchody tento den',
      })
      continue
    }

    const sorted = [...dayTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const { revengeCount } = countRevengeTrades(sorted)
    const hasRevengeTag = tags.includes('REVENGE_TRADING')
    const hasCleanTag = tags.includes('CLEAN_DAY') || tags.includes('FOMO_overcome')
    const hasMildTag = tags.includes('FOMO_chased') || tags.includes('EARLY_CLOSE')

    if (hasRevengeTag || revengeCount > 0) {
      result.push({
        date: day,
        color: 'red',
        score: revengeCount > 0 ? 15 : 25,
        tradeCount: dayTrades.length,
        tags,
        reason:
          revengeCount > 0
            ? `Detekován revenge re-entry (${revengeCount}x ztráta → rychlý znovu-vstup do 20 min)`
            : 'Sám jsi tento den označil jako revenge trading',
      })
      continue
    }

    const followedValues = sorted
      .map((t) => (typeof t.followedPlan === 'boolean' ? t.followedPlan : typeof t.matchedPlan === 'boolean' ? t.matchedPlan : null))
      .filter((v): v is boolean => v !== null)

    if (followedValues.length > 0) {
      const ratio = followedValues.filter(Boolean).length / followedValues.length
      let score = Math.round(ratio * 100)
      let color = colorFromScore(score)
      if (hasCleanTag && color !== 'emerald' && score >= 40) {
        color = 'emerald'
        score = Math.max(score, 80)
      }
      if (hasMildTag && color === 'emerald') {
        color = 'orange'
        score = Math.min(score, 79)
      }
      result.push({
        date: day,
        color,
        score,
        tradeCount: dayTrades.length,
        tags,
        reason: `${followedValues.filter(Boolean).length}/${followedValues.length} obchodů podle plánu`,
      })
      continue
    }

    // No plan-adherence signal at all for this day (typical for pure MT5
    // auto-sync trades with no manual tagging). Default to orange — never
    // inferred from P&L sign.
    if (hasCleanTag) {
      result.push({
        date: day,
        color: 'emerald',
        score: 85,
        tradeCount: dayTrades.length,
        tags,
        reason: 'Sám jsi tento den označil jako bezchybný / ustál FOMO',
      })
    } else if (hasMildTag) {
      result.push({
        date: day,
        color: 'orange',
        score: 55,
        tradeCount: dayTrades.length,
        tags,
        reason: 'Mírné porušení podle self-reportu (FOMO / brzké uzavření)',
      })
    } else {
      result.push({
        date: day,
        color: 'orange',
        score: null,
        tradeCount: dayTrades.length,
        tags,
        reason: 'Bez signálu o dodržení plánu (auto-sync bez self-reportu)',
      })
    }
  }

  return result.sort((a, b) => (a.date < b.date ? 1 : -1))
}
