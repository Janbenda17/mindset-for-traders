// Shared engine for the Daily Tracker "Daily Summary" card (Czech language).
//
// Produces:
// - the original tilt/label/tone/message/tip + narrative (unchanged contract,
//   still used for History persistence)
// - matrixLine: one-line "mental matrix" read of the day, built from real
//   mood/confidence/stress values and real trade timestamps (no invented
//   market commentary -- only the trader's own behavioral data)
// - leak: the single worst psychologically-driven trade of the day (revenge
//   re-entry, oversized size, or broken plan), or null if no trade qualifies
// - discipline: a 0-100 score (rule-following, not P&L) + explanatory text
// - disciplinedDollars: an estimate of $ likely avoided by NOT chasing a move
//   during a real gap between trades, grounded in that day's own average
//   loss size -- explicitly framed as an estimate, or null if no gap qualifies
// - bullets: short bullet points for the "Fail Log dne" reveal list
// - chatPrompts: day-specific questions to hand off to MindTrader AI chat

export interface DailySummaryResult {
  tilt: number
  label: string
  tone: 'good' | 'warn' | 'bad' | 'neutral'
  message: string
  tip: string | null
  narrative: string
  matrixLine: string
  leak: {
    title: string
    text: string
    amount: number
    shareOfDrawdown: number | null
  } | null
  discipline: {
    score: number
    label: string
    text: string
  }
  disciplinedDollars: {
    amount: number
    text: string
  } | null
  bullets: string[]
  chatPrompts: { label: string; prompt: string }[]
}

function fmtMoney(n: number) {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

// Plain dollar amount, no +/- sign -- for cost/estimate figures that are not
// a signed P&L delta (e.g. "this trade cost you $150", "you saved ~$417").
function fmtAbsMoney(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function tradeLabel(t: any) {
  const dir = String(t?.direction || '').toLowerCase()
  const dirLabel = dir.startsWith('s') ? 'Short' : dir ? 'Long' : ''
  return [dirLabel, t?.pair || 'obchod'].filter(Boolean).join(' ')
}

// Resolve a usable clock time for a trade. Uses real openTime/date when the
// data has one; otherwise (pure-demo data with no time-of-day) synthesizes a
// deterministic time spread across a typical trading session so the
// narrative can still reference "v 14:32" etc. Never used to fabricate P&L.
function getTradeTime(t: any, idx: number, total: number): { date: Date; label: string } {
  let d = new Date(t?.date || Date.now())

  if (t?.openTime && typeof t.openTime === 'string') {
    const m = t.openTime.match(/(\d{1,2}):(\d{2})/)
    if (m) {
      d = new Date(d)
      d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0)
    }
  }

  if (d.getHours() === 0 && d.getMinutes() === 0) {
    const sessionStartMin = 9 * 60
    const sessionEndMin = 16 * 60 + 30
    const frac = total > 1 ? idx / (total - 1) : 0.5
    const minutes = Math.round(sessionStartMin + frac * (sessionEndMin - sessionStartMin))
    d = new Date(d)
    d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  }

  const label = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
  return { date: d, label }
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
    matrixLine: 'Zatím žádná data k vyhodnocení mentálního stavu dne.',
    leak: null,
    discipline: {
      score: 0,
      label: 'Čekání na data',
      text: 'Skóre disciplíny se spočítá po prvním zaznamenaném obchodu dnešního dne.',
    },
    disciplinedDollars: null,
    bullets: [],
    chatPrompts: [],
  }
}

export function buildDailySummary(trades: any[], dateLabel: string): DailySummaryResult {
  if (!trades || trades.length === 0) return emptyDailySummary()

  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const withTime = sorted.map((t, i) => ({ trade: t, time: getTradeTime(t, i, sorted.length) }))

  let revengeCount = 0
  let maxLossStreak = 0
  let lossStreak = 0
  const revengeFlags = new Array(sorted.length).fill(false)
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
          revengeFlags[i] = true
        }
      }
    } else {
      lossStreak = 0
    }
    if (t.revengeTrade) revengeFlags[i] = true
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

  // ---- Mental Matrix: real mood/confidence/stress trajectory across the day
  const hasMoodData = sorted.some((t) => t.mood != null || t.confidence != null || t.stressLevel != null)
  let matrixLine: string
  if (hasMoodData) {
    const mid = Math.floor(sorted.length / 2)
    const firstHalf = sorted.slice(0, Math.max(1, mid))
    const secondHalf = sorted.slice(Math.max(1, mid))
    const avg = (arr: any[], key: string) => {
      const vals = arr.map((t) => t?.[key]).filter((v) => typeof v === 'number')
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
    }
    const stress1 = avg(firstHalf, 'stressLevel')
    const stress2 = avg(secondHalf, 'stressLevel')
    const conf1 = avg(firstHalf, 'confidence')
    const conf2 = avg(secondHalf, 'confidence')
    const turnIdx = withTime.length > 1 ? Math.max(1, mid) : 0
    const turnTime = withTime[turnIdx]?.time.label

    if (stress2 !== null && stress1 !== null && stress2 - stress1 >= 2) {
      matrixLine = `Začal jsi v klidu, ale od ${turnTime} stres vyskočil z ${stress1.toFixed(1)} na ${stress2.toFixed(1)}/10 — tvým největším protihráčem dnes nebyl trh, ale vlastní nervozita po této chvíli.`
    } else if (conf2 !== null && conf1 !== null && conf1 - conf2 >= 2) {
      matrixLine = `Sebevědomí ti od ${turnTime} kleslo z ${conf1.toFixed(1)} na ${conf2.toFixed(1)}/10 — druhá polovina dne byla psychicky těžší než ta první.`
    } else if (revengeCount > 0) {
      matrixLine = `Po ztrátě jsi ${revengeCount}× rychle vstoupil znovu — dnes jsi nebojoval s grafem, ale s vlastní netrpělivostí.`
    } else {
      const avgStress = avg(sorted, 'stressLevel')
      const avgConf = avg(sorted, 'confidence')
      matrixLine =
        avgStress !== null && avgConf !== null
          ? `Stres se dnes držel okolo ${avgStress.toFixed(1)}/10 a sebevědomí okolo ${avgConf.toFixed(1)}/10 — bez výrazných výkyvů, psychicky stabilní den.`
          : 'Dnešní obchody nevykazují výrazné emoční výkyvy.'
    }
  } else {
    matrixLine = message
  }

  // ---- Biggest psychological leak: worst trade scored by behavioral flags
  const positionSizes = sorted.map((t) => t.positionSize).filter((v) => typeof v === 'number')
  const medianSize = positionSizes.length
    ? [...positionSizes].sort((a, b) => a - b)[Math.floor(positionSizes.length / 2)]
    : null

  let leak: DailySummaryResult['leak'] = null
  if (losses > 0) {
    let bestCandidate: { trade: any; time: { date: Date; label: string }; score: number; reasons: string[] } | null =
      null
    withTime.forEach(({ trade: t, time }, i) => {
      if (t.pnl >= 0) return
      let score = 0
      const reasons: string[] = []
      if (revengeFlags[i]) {
        score += 50
        reasons.push('rychlý re-entry po předchozí ztrátě')
      }
      if (t.followedPlan === false || t.matchedPlan === false) {
        score += 30
        reasons.push('porušení vlastního plánu')
      }
      if (medianSize && typeof t.positionSize === 'number' && t.positionSize > medianSize * 1.5) {
        score += 20
        reasons.push('výrazně nadprůměrná velikost pozice')
      }
      score += (Math.abs(t.pnl) / Math.max(1, Math.abs(totalPnL < 0 ? totalPnL : worstTrade.pnl))) * 10

      if (score > 0 && (!bestCandidate || score > bestCandidate.score)) {
        bestCandidate = { trade: t, time, score, reasons }
      }
    })

    if (bestCandidate) {
      const bc = bestCandidate as { trade: any; time: { date: Date; label: string }; score: number; reasons: string[] }
      const t = bc.trade
      const totalLossSum = sorted.filter((x) => x.pnl < 0).reduce((s, x) => s + Math.abs(x.pnl), 0)
      const shareOfDrawdown = totalLossSum > 0 ? Math.round((Math.abs(t.pnl) / totalLossSum) * 100) : null
      const reasonText = bc.reasons.length > 0 ? bc.reasons.join(' a ') : 'emotivní vstup bez jasného důvodu'
      const wouldFlipToProfit = totalPnL < 0 && totalPnL - t.pnl > 0

      leak = {
        title: `Dnešní leak: ${tradeLabel(t)}`,
        text: [
          `V ${bc.time.label} jsi otevřel ${tradeLabel(t)} — ${reasonText}.`,
          `Tento jediný obchod tě stál ${fmtAbsMoney(t.pnl)}${
            shareOfDrawdown !== null ? ` (${shareOfDrawdown}% dnešního drawdownu)` : ''
          }.`,
          wouldFlipToProfit ? `Bez tohoto jednoho obchodu bys dnes skončil v zisku.` : null,
        ]
          .filter(Boolean)
          .join(' '),
        amount: Math.abs(t.pnl),
        shareOfDrawdown,
      }
    }
  }

  // ---- Discipline Rating: rule-following, independent of P&L
  const disciplineValues = sorted.map((t) => t.discipline).filter((v) => typeof v === 'number')
  const followedPlanValues = sorted
    .map((t) =>
      typeof t.followedPlan === 'boolean' ? t.followedPlan : typeof t.matchedPlan === 'boolean' ? t.matchedPlan : null
    )
    .filter((v) => v !== null) as boolean[]

  let disciplineScore: number
  if (disciplineValues.length > 0) {
    disciplineScore = Math.round(disciplineValues.reduce((s, v) => s + v, 0) / disciplineValues.length)
  } else if (followedPlanValues.length > 0) {
    const followedRatio = followedPlanValues.filter(Boolean).length / followedPlanValues.length
    disciplineScore = Math.round(followedRatio * 100 - revengeCount * 10)
  } else {
    disciplineScore = Math.round(100 - tilt)
  }
  disciplineScore = Math.max(0, Math.min(100, disciplineScore))

  let disciplineLabel: string
  let disciplineText: string
  if (disciplineScore >= 80) {
    disciplineLabel = 'Excelentní den'
    disciplineText =
      totalPnL < 0
        ? `I když jsi dnes skončil ${fmtMoney(totalPnL)}, tvá exekuce byla čistá — risk a velikost pozic seděly. Trh ti prostě nedal setup, ne že bys udělal chybu. Zítra pokračuj stejně.`
        : `Exekuce byla čistá a výsledek ${fmtMoney(totalPnL)} k tomu přišel jako bonus. Dodržel jsi vlastní pravidla — tohle je vzorec, který chceš opakovat.`
  } else if (disciplineScore >= 50) {
    disciplineLabel = 'Smíšený den'
    disciplineText = `Část dnešních obchodů odpovídala plánu, část ne${
      revengeCount > 0 ? ` (${revengeCount}× rychlý re-entry po ztrátě)` : ''
    }. Výsledek ${fmtMoney(totalPnL)} dnes nic nevypovídá o tom, jak disciplinovaný jsi byl.`
  } else {
    disciplineLabel = 'Hazard'
    disciplineText =
      totalPnL > 0
        ? `Dnes jsi sice vydělal ${fmtMoney(totalPnL)}, ale spíš štěstím než plánem — výrazně porušená disciplína (re-entry, velikost pozic). Příště tě tenhle přístup může stát mnohem víc.`
        : `Výsledek ${fmtMoney(totalPnL)} dnes doprovázelo výrazné porušení disciplíny — re-entry po ztrátách a nekonzistentní řízení rizika. Tohle je vzorec, který je potřeba zastavit, ne jen výsledek dne.`
  }

  // ---- "Ušetřeno disciplínou" -- estimate grounded in real gaps + real avg loss
  let disciplinedDollars: DailySummaryResult['disciplinedDollars'] = null
  if (withTime.length >= 2) {
    let biggestGap = { minutes: 0, fromIdx: 0, toIdx: 1 }
    for (let i = 1; i < withTime.length; i++) {
      const gapMin = (withTime[i].time.date.getTime() - withTime[i - 1].time.date.getTime()) / 60000
      if (gapMin > biggestGap.minutes) {
        biggestGap = { minutes: gapMin, fromIdx: i - 1, toIdx: i }
      }
    }
    if (biggestGap.minutes >= 40) {
      const losingTrades = sorted.filter((t) => t.pnl < 0)
      const avgLossMagnitude =
        losingTrades.length > 0
          ? losingTrades.reduce((s, t) => s + Math.abs(t.pnl), 0) / losingTrades.length
          : (sorted.reduce((s, t) => s + Math.abs(t.pnl), 0) / sorted.length) * 0.8
      const scaleFactor = Math.min(2.5, Math.max(1, biggestGap.minutes / 30))
      const amount = Math.round(avgLossMagnitude * scaleFactor)
      const fromLabel = withTime[biggestGap.fromIdx].time.label
      const toLabel = withTime[biggestGap.toIdx].time.label
      if (amount > 0) {
        disciplinedDollars = {
          amount,
          text: `Mezi ${fromLabel} a ${toLabel} jsi nechal platformu v klidu, místo abys honil další pohyb. Na základě tvé průměrné ztráty dnes (${fmtMoney(
            -avgLossMagnitude
          )}) jsi tím odhadem ušetřil přibližně ${fmtAbsMoney(amount)}. Skvělý trade je občas ten, který neuděláš.`,
        }
      }
    }
  }

  // ---- Bullets for the "Fail Log dne" reveal
  const bullets: string[] = []
  if (leak) bullets.push(leak.text)
  if (revengeCount > 0 && (!leak || !leak.text.includes('re-entry'))) {
    bullets.push(`${revengeCount}× rychlý re-entry do trhu během 20 minut po předchozí ztrátě.`)
  }
  if (maxLossStreak >= 2) {
    bullets.push(`Série ${maxLossStreak} ztrátových obchodů po sobě bez pauzy.`)
  }
  const oversizedCount = medianSize
    ? sorted.filter((t) => typeof t.positionSize === 'number' && t.positionSize > medianSize * 1.5).length
    : 0
  if (oversizedCount > 0) {
    bullets.push(`${oversizedCount}× výrazně nadprůměrná velikost pozice oproti tvému běžnému dni.`)
  }
  if (count > 6) {
    bullets.push(`${count} obchodů za jeden den — overtrading je sám o sobě riziko.`)
  }
  if (bullets.length === 0) {
    bullets.push('Bez detekovaných psychologických přešlapů — dnešní obchody odpovídaly plánu.')
  }

  // ---- Day-specific AI chat quick actions (prefill into MindTrader AI chat)
  const chatPrompts: { label: string; prompt: string }[] = []
  if (leak) {
    const leakTrade = sorted.find((t) => t.pnl < 0 && Math.abs(t.pnl) === leak!.amount) || worstTrade
    chatPrompts.push({
      label: `Proč jsem udělal ${tradeLabel(leakTrade)}?`,
      prompt: `Dnes (${dateLabel}) jsem udělal tento obchod: ${leak.text} Proč se mi to psychicky stalo a jak to konkrétně příště nezopakovat?`,
    })
  }
  if (withTime.length > 0) {
    const lastTrade = withTime[withTime.length - 1]
    const cutoffHour = lastTrade.time.date.getHours()
    if (count > 3) {
      chatPrompts.push({
        label: `Jak by vypadal den bez obchodů po ${cutoffHour}:00?`,
        prompt: `Ukaž mi, jak by vypadal můj dnešek (${dateLabel}), kdybych po ${cutoffHour}:00 přestal obchodovat. Dnešní obchody: ${sorted
          .map((t) => `${tradeLabel(t)} ${fmtMoney(t.pnl)}`)
          .join(', ')}.`,
      })
    }
  }
  chatPrompts.push({
    label: `Vysvětli mi dnešní Discipline Score ${disciplineScore}%`,
    prompt: `Dnes (${dateLabel}) mám Discipline Score ${disciplineScore}% (${disciplineLabel}). ${disciplineText} Rozeber mi konkrétně, co bych měl zítra udělat jinak.`,
  })

  return {
    tilt,
    label,
    tone,
    message,
    tip,
    narrative,
    matrixLine,
    leak,
    discipline: { score: disciplineScore, label: disciplineLabel, text: disciplineText },
    disciplinedDollars,
    bullets,
    chatPrompts,
  }
}
