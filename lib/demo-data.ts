// Shared demo trading history generator for Virtual mode.
//
// One realistic "demo trader" used across the app (Journal, Weekly Review, …)
// so every surface tells a consistent story. Every demo trade carries the same
// signals real trades do — followedPlan / matchedPlan / positionSize / openTime
// (with seconds) plus the behavioural flags the analysis engines read
// (revengeTrade / fomo / hasStopLoss) — and a handful of days get self-report
// tags (CLEAN_DAY / REVENGE_TRADING / EARLY_CLOSE / FOMO_overcome) on a paired
// journal note. This is what lets the Discipline Matrix, the Emotional Tax
// Sheet, the Trade Autopsy and the Weekly Review all produce real, grounded
// output in demo instead of empty placeholders.
//
// Returns a flat array of entries (type "trade" | "journal"), newest first.

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "BTC/USD", "EUR/JPY", "GBP/JPY", "AUD/USD"]
const EMOTIONS = ["confident", "calm", "focused", "anxious", "excited", "nervous", "stressed", "disciplined"]
const SESSIONS = ["London", "New York", "Asian", "Overlap"]

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const fmtClock = (totalSec: number) => {
  const s = ((totalSec % 86400) + 86400) % 86400
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = Math.floor(s % 60)
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}

export function generateDemoTradingHistory(days = 30): any[] {
  const demoEntries: any[] = []
  let tradeId = 1
  let journalId = 1
  const now = Date.now()

  const addTaggedJournal = (dateStr: string, tag: string, good: boolean) => {
    const titles: Record<string, string> = {
      CLEAN_DAY: "Bezchybný den – plně podle plánu",
      REVENGE_TRADING: "Revenge trading – ztratil jsem hlavu",
      EARLY_CLOSE: "Zavřel jsem moc brzo ze strachu",
      FOMO_overcome: "Ustál jsem FOMO – nenaskočil jsem",
    }
    demoEntries.push({
      id: `demo-journal-${journalId++}`,
      type: "journal",
      date: dateStr,
      title: titles[tag] || "Poznámka",
      content: titles[tag] || "",
      mood: good ? rnd(70, 92) : rnd(40, 60),
      notes: titles[tag] || "",
      emotion: good ? pick(["calm", "focused", "disciplined"]) : pick(["frustrated", "stressed", "nervous"]),
      tags: [tag],
    })
  }

  // Walk the last N days; trade on weekdays, skip ~25% of them for realism.
  for (let daysAgo = 1; daysAgo <= days; daysAgo++) {
    const dayDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
    const dow = dayDate.getDay()
    if (dow === 0 || dow === 6) continue // no weekend trading
    if (Math.random() < 0.25) continue // some flat days
    const dateStr = dayDate.toISOString().split("T")[0]

    // Day character drives win-rate, plan-adherence and trade count.
    const roll = Math.random()
    const dayKind: "disciplined" | "mixed" | "revenge" =
      roll < 0.55 ? "disciplined" : roll < 0.85 ? "mixed" : "revenge"
    const tradesToday = dayKind === "revenge" ? rnd(2, 3) : rnd(1, 2)

    // Per-day timeline state, so revenge re-entries can sit seconds after the
    // prior loss with an escalated size — exactly what the Trade Autopsy reads.
    let prevSec = 9 * 3600 + rnd(0, 90) * 60 // first entry somewhere 09:00-10:30
    let prevLossMag = 0
    let prevSize = 1
    let prevWasLoss = false

    for (let k = 0; k < tradesToday; k++) {
      let isWin: boolean
      let followedPlan: boolean
      let revengeTrade = false
      let openSec: number
      let positionSize: number

      const isRevengeReentry = dayKind === "revenge" && k >= 1 && prevWasLoss
      if (isRevengeReentry) {
        // Re-entry 35-90s after the previous loss, ~2-3.5× the size, mostly a
        // bigger loss → trips objective revenge detection AND oversizing.
        isWin = Math.random() > 0.8
        followedPlan = false
        revengeTrade = true
        openSec = prevSec + rnd(35, 90)
        positionSize = Number((prevSize * (Math.random() * 1.5 + 2)).toFixed(2))
      } else {
        if (dayKind === "disciplined") {
          isWin = Math.random() > 0.3
          followedPlan = Math.random() > 0.12
        } else if (dayKind === "mixed") {
          isWin = Math.random() > 0.45
          followedPlan = Math.random() > 0.5
        } else {
          isWin = Math.random() > 0.72
          followedPlan = Math.random() > 0.82
        }
        openSec = prevSec + rnd(25, 75) * 60 // 25-75 min after the previous
        positionSize =
          !followedPlan && Math.random() > 0.5
            ? Number((Math.random() * 1.5 + 1.8).toFixed(2)) // 1.8-3.3 (oversized)
            : Number((Math.random() * 0.8 + 0.6).toFixed(2)) // 0.6-1.4 (normal)
      }

      // Loss magnitude: a revenge re-entry loss is at least as big as the
      // previous one (escalation), so countRevengeTrades flags it.
      let profitLoss: number
      if (isWin) {
        profitLoss = rnd(500, 3500)
      } else if (isRevengeReentry && prevLossMag > 0) {
        profitLoss = -rnd(prevLossMag, prevLossMag + 800)
      } else {
        profitLoss = -rnd(200, 1700)
      }

      // FOMO: chasing a late entry (not on revenge re-entries, those are their
      // own category). No stop loss: rare normally, common on revenge days.
      const fomo = !isRevengeReentry && Math.random() < (isWin ? 0.06 : 0.25)
      const hasStopLoss = !(dayKind === "revenge" ? Math.random() < 0.4 : Math.random() < 0.08)

      const pair = pick(PAIRS)
      const direction = Math.random() > 0.5 ? "long" : "short"
      const session = pick(SESSIONS)
      const mood = isWin ? rnd(70, 95) : rnd(40, 70)
      const stressLevel = isWin ? rnd(2, 6) : rnd(6, 10)
      const confidenceBefore = isWin ? rnd(7, 10) : rnd(4, 8)
      const discipline = followedPlan ? rnd(7, 10) : rnd(3, 6)

      demoEntries.push({
        id: `demo-trade-${tradeId++}`,
        type: "trade",
        date: dateStr,
        openTime: fmtClock(openSec),
        title: `${direction.toUpperCase()} ${pair}`,
        content: isWin
          ? `Solid ${session} session setup, followed the plan`
          : revengeTrade
            ? "Revenge re-entry right after the loss"
            : fomo
              ? "Chased a move that already ran"
              : "Entered too early, bad timing",
        pair,
        direction,
        entryPrice: Number((Math.random() * 100 + 1).toFixed(4)),
        exitPrice: Number((Math.random() * 100 + 1).toFixed(4)),
        positionSize,
        profitLoss,
        pnl: profitLoss,
        mood,
        notes: isWin
          ? `Solid ${session} session setup, followed the plan`
          : revengeTrade
            ? "Revenge re-entry right after the loss"
            : fomo
              ? "Chased a move that already ran"
              : "Entered too early, bad timing",
        emotion: pick(EMOTIONS),
        tags: followedPlan ? ["A+ setup", "disciplined"] : ["learning", "improvement needed"],
        emotionBefore: pick(EMOTIONS),
        emotionDuring: pick(EMOTIONS),
        emotionAfter: isWin
          ? pick(["satisfied", "confident", "proud"])
          : pick(["frustrated", "disappointed", "learning"]),
        confidenceBefore,
        confidence: confidenceBefore,
        stressLevel,
        discipline,
        followedPlan,
        matchedPlan: followedPlan,
        revengeTrade,
        fomo,
        hasStopLoss,
      })

      prevSec = openSec
      prevWasLoss = !isWin
      prevLossMag = !isWin ? Math.abs(profitLoss) : 0
      prevSize = positionSize
    }

    // Layer a self-report tag on a few days so the calendar demonstrates the
    // green/red overrides and the AI search / weekly review have something to find.
    if (dayKind === "revenge") {
      addTaggedJournal(dateStr, "REVENGE_TRADING", false)
    } else if (dayKind === "disciplined" && Math.random() < 0.3) {
      addTaggedJournal(dateStr, Math.random() < 0.5 ? "CLEAN_DAY" : "FOMO_overcome", true)
    } else if (dayKind === "mixed" && Math.random() < 0.3) {
      addTaggedJournal(dateStr, "EARLY_CLOSE", false)
    }
  }

  // A couple of plain reflection notes (no scoring tags) for the list view.
  const reflections = [
    "Dobrý týden, držel jsem se rizikového plánu a nehonil jsem ztráty.",
    "Náročný den, pracuji na trpělivosti při čekání na setup.",
    "Hodně jsem se naučil o své reakci po sérii ztrát.",
  ]
  reflections.forEach((content, i) => {
    const dayDate = new Date(now - rnd(1, 28) * 24 * 60 * 60 * 1000)
    demoEntries.push({
      id: `demo-reflection-${journalId++}`,
      type: "journal",
      date: dayDate.toISOString().split("T")[0],
      title: i % 2 === 0 ? "Reflexe – dobrý den" : "Reflexe – výzva",
      content,
      mood: rnd(50, 88),
      notes: content,
      emotion: pick(EMOTIONS),
    })
  })

  return demoEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
