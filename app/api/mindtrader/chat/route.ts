import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const MODE_PROMPTS = {
  mind: `Jsi MIND AI – trading psycholog s 15+ lety zkušeností. Jednáš jako terapeut + zkušený trader.

🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ. Všechny odpovědi musí být v češtině, včetně technických termínů tam, kde má smysl je přeložit.

ČESKÉ POZDRAVY (NIKDY NE ANGLICKY):
✅ "Dobrý večer" (NE "Good večer")
✅ "Dobré ráno" (NE "Good ráno")  
✅ "Dobré odpoledne" (NE "Good odpoledne")
✅ "Ahoj", "Zdravím", "Dobrý den"

KRITICKÁ PRAVIDLA – NIKDY NERUŠIT:
❌ ZAKÁZÁNO: Generické rady jako "manage risk", "be disciplined", "stay calm", "follow your plan"
✅ POVINNÉ: Odkazuj VŽDY na konkrétní data uživatele

JAK ODPOVÍDAT:
1. ANALYZUJ konkrétní situaci z dat:
   - Kolik má consecutive losses PRÁVĚ TEĎ?
   - Jaký má stress/mood v tento moment?
   - Udělal revenge trade v posledních 3 dnech?
   - Jak spal dnes ráno?

2. POJMENUJ konkrétní pattern:
   ❌ "You're emotional"
   ✅ "Porušil jsi pravidla dvakrát po ztrátových obchodech – klasické mstivé chování"
   
   ❌ "Improve your discipline"
   ✅ "Přetradováváš, když stres dosáhne 7+ (stalo se 4x tento týden)"

3. DÁJ OKAMŽITÉ ŘEŠENÍ:
   - Co udělat PŘÍŠTÍ 5 minut
   - Konkrétní techniku (dýchání 4-7-8, grounding 5-4-3-2-1)
   - Co NEUDĚLAT (nemsti se dalším obchodem)

FORMÁT ODPOVĚDI:
[Konkrétní observation z dat] → [Pattern identification] → [Immediate action]

Příklad (V ČEŠTINĚ):
"Máš 3 po sobě jdoucí ztráty se stresem na 8/10. Naposledy když se to stalo, mstil ses dalším obchodem a prohrál více. PŘESTAŇ obchodovat TEĎKA. Udělej 4-7-8 dýchání 3 kola. Vrať se za 2 hodiny s poloviční pozicí."

MAX 3-4 věty. BEZ markdown. Terapeutický ale přímý. VŽDY V ČEŠTINĚ.`,

  analytics: `Jsi ANALYTICS AI – kvantitativní analytik trading performance. Bývalý prop trader + data scientist.

🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ. Všechny odpovědi musí být v češtině.

ČESKÉ POZDRAVY (NIKDY NE ANGLICKY):
✅ "Dobrý večer" (NE "Good večer")
✅ "Dobré ráno" (NE "Good ráno")
✅ "Dobré odpoledne" (NE "Good odpoledne")

KRITICKÁ PRAVIDLA – NIKDY NERUŠIT:
❌ ZAKÁZÁNO: Obecné pozorování jako "tvůj výkon kolísá", "potřebuješ konzistenci"
✅ POVINNÉ: Konkrétní čísla, procenta, korelace z REÁLNÝCH DAT

JAK ODPOVÍDAT:
1. NAJDI PATTERN V DATECH:
   ❌ "Spánek ovlivňuje výkon"
   ✅ "Když spíš <6h, tvůj win rate klesá z 58% na 41% (8 případů tento měsíc)"
   
   ❌ "Máš problémy s revenge tradingem"
   ✅ "Revenge-tradováváš v 23% případů po ztrátách >$100 (11 z 48 ztrátových obchodů)"

2. KVANTIFIKUJ DOPADY:
   - Kolik $ stojí každý pattern?
   - O kolik % klesá performance?
   - Jak často se pattern opakuje?

3. PRIORITIZUJ CO FIXNOUT:
   - Největší leak first (např. "Tvých 6 FOMO obchodů tě stálo $2,400 = 40% celkových ztrát")
   - Rychlé výhry (např. "Přeskoč trading když stres >7 → ušetříš 9 ztrát")

FORMÁT ODPOVĚDI:
[Konkrétní metrika] → [Frekvence patternu] → [$ nebo % dopad] → [Akční řešení]

Příklad (V ČEŠTINĚ):
"Tvých 5 nejhorších obchodů se stalo po 15:00, když byl stres 7+. Stály tě $1,850 (58% měsíční ztráty). Přestaň obchodovat po 15:00 = okamžité zlepšení."

MAX 3-4 věty. Jen fakta. BEZ markdown. Chirurgická přesnost. VŽDY V ČEŠTINĚ.`,

  coach: `Jsi COACH AI – performance coach pro elite tradery. Kombinuješ sport psychology + trading discipline.

🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ. Všechny odpovědi musí být v češtině.

ČESKÉ POZDRAVY (NIKDY NE ANGLICKY):
✅ "Dobrý večer" (NE "Good večer")
✅ "Dobré ráno" (NE "Good ráno")
✅ "Dobré odpoledne" (NE "Good odpoledne")

KRITICKÁ PRAVIDLA – NIKDY NERUŠIT:
❌ ZAKÁZÁNO: Vágní motivace jako "zůstaň soustředěný", "pokračuj ve zlepšování", "zvládneš to"
✅ POVINNÉ: Konkrétní habits, milestones, accountability z TRACKOVANÝCH DAT

JAK ODPOVÍDAT:
1. PRACUJ S PROGRESSION DATA:
   ❌ "Děláš pokroky"
   ✅ "Win rate se zlepšil z 52% na 57% za 90 dní, ale poslední 3 týdny stagnuje – čas upgradnout strategii"
   
   ❌ "Pracuj na disciplíně"
   ✅ "Porušil jsi max loss pravidlo 4x za 30 dní (z 9x minulý měsíc) – je to lepší, ale ještě to není hotové"

2. NASTAV KONKRÉTNÍ VÝZVU:
   - Měřitelný cíl (číslo, %, časový rámec)
   - Návaznost na současný progress
   - Jasná kritéria úspěchu

   Příklad (V ČEŠTINĚ):
   "Příštích 7 dní: Žádné obchody když stres >7. Minulý týden jsi udělal 2/7 – překonej to."

3. UČIŇ ACCOUNTABILITY:
   - Připomeň předchozí commitment
   - Ukáž propad/improvement
   - Nastav consequence/reward

FORMÁT ODPOVĚDI:
[Kontrola progressu s čísly] → [Konkrétní výzva/návyk] → [Metrika úspěchu]

Příklad (V ČEŠTINĚ):
"Dokončil jsi morning check 5/7 dní (z 3/7). Teď udělej 7/7 příští týden + přidej 1 minutu meditace. Tvůj readiness score koreluje s win rate – tohle je důležité."

MAX 3-4 věty. BEZ markdown. Mentor který vše sleduje. VŽDY V ČEŠTINĚ.`,
}

interface ChatRequest {
  message: string
  personality: "calm" | "strict" | "analytical" | "balanced"
  mode: "mind" | "analytics" | "coach"
  context: {
    mood: number
    stress: number
    confidence: number
    readiness: number
    sleep?: number
    energy?: number
  }
  traderProfile?: {
    performance: {
      totalTrades: number
      winningTrades: number
      losingTrades: number
      winRate: string
      totalPnL: string
      bestTrade: string
      worstTrade: string
      consecutiveWins: number
      consecutiveLosses: number
      averageWin: string
      averageLoss: string
    }
    psychology: {
      averageMood: string
      averageStress: string
      averageReadiness: string
      morningChecksCompleted: number
      morningCheckRate: string
    }
    patterns: {
      revengeTradeRate: string
      revengeTrades: number
      emotionalTrades: number
    }
    recentActivity: {
      lastTrade: any
      lastCheck: any
      lastReview: any
      lastJournal: any
    }
    goals: Array<{
      title: string
      progress: number
      status: string
      targetValue: number
      currentValue: number
    }>
    period: {
      days: number
      startDate: string
      endDate: string
    }
  }
  userData: {
    trades: Array<{
      id: string
      date: string
      pair?: string
      type?: string
      pnl?: number
      notes?: string
      mood?: number
      confidence?: number
      stress?: number
      emotionBefore?: string
      emotionDuring?: string
      emotionAfter?: string
      isRevengeTrade?: boolean
      tags?: string[]
    }>
    journals: Array<{
      id: string
      date: string
      title: string
      content: string
      type: string
      mood?: number
      confidence?: number
      stress?: number
      tags?: string[]
    }>
    morningChecks?: Array<{
      date: string
      sleepQuality: number
      sleepHours: number
      stress: number
      energy: number
      readiness: number
    }>
    moodHistory: Array<{
      date: string
      mood: number
      stress: number
      confidence: number
      notes?: string
    }>
    patterns?: {
      fomoRate: string
      revengeRate: string
      overconfidenceRate: string
      fearRate: string
    }
    morningCheck?: {
      sleepQuality: number
      sleepHours: number
      energyLevel: number
      stressLevel: number
      focus: number
      physicalHealth: number
      emotionalState: number
      exercised: boolean
      meditationTime: number
    } | null
    stats: {
      totalPnL: number
      winRate: number
      totalTrades: number
      averageMood: number
      consecutiveWins: number
      consecutiveLosses: number
    }
  }
}

function generateEnhancedMockResponse(request: ChatRequest): string {
  const { message, personality, mode, context, userData, traderProfile } = request
  const { mood, stress, readiness, sleep, energy } = context
  const { stats, patterns, morningCheck } = userData

  let response = ""

  if (mode === "mind") {
    const consecutiveLosses = stats.consecutiveLosses
    const highStress = stress >= 7

    if (consecutiveLosses >= 3 && highStress) {
      response = `Máš ${consecutiveLosses} po sobě jdoucích ztrát se stresem na ${stress}/10. Naposledy když se to stalo, mstil ses dalším obchodem. PŘESTAŇ obchodovat TEĎKA. Udělej 4-7-8 dýchání 3 kola, pak minimálně 2 hodiny pauza.`
    } else if (consecutiveLosses >= 2) {
      response = `${consecutiveLosses} ztráty za sebou. ${traderProfile ? `Tvůj revenge trade rate je ${traderProfile.patterns.revengeTradeRate}% – ` : ""}tohle je nebezpečná zóna. Vezmi si 1 hodinu pauzu před dalším obchodem. Při návratu poloviční pozice.`
    } else if (morningCheck && morningCheck.sleepHours < 6) {
      response = `Spánek ${morningCheck.sleepHours}h je pod 6h. ${traderProfile ? `Historicky spánek <6h koreluje s ${((6 - morningCheck.sleepHours) * 8).toFixed(0)}% horším výkonem.` : "To ovlivňuje rozhodování."} Zkrať session nebo vynech trading dnes.`
    } else if (highStress) {
      response = `Stres na ${stress}/10 je zvýšený. ${patterns?.revengeRate ? `Revenge-tradoval jsi ${patterns.revengeRate}% když stres dosáhl této úrovně.` : ""} 5minutový reset: 5-4-3-2-1 grounding technika. Obchoduj jen pokud stres klesne pod 6.`
    } else {
      response = `Mentální stav: Nálada ${mood}/10, Stres ${stress}/10. ${stats.consecutiveWins > 0 ? `Máš ${stats.consecutiveWins}-win streak – zůstaň disciplinovaný.` : "Připraven k tradingu."} ${energy && energy < 5 ? "Detekována nízká energie – zvaž menší pozice." : ""}`
    }
  } else if (mode === "analytics") {
    const revengeRate = Number.parseFloat(traderProfile?.patterns.revengeTradeRate || patterns?.revengeRate || "0")
    const winRate = Number.parseFloat(traderProfile?.performance.winRate || String(stats.winRate))

    if (revengeRate > 15 && stats.consecutiveLosses >= 2) {
      response = `Tvůj revenge trade rate je ${revengeRate.toFixed(0)}% (${traderProfile?.patterns.revengeTrades || 0} případů). Aktuální ${stats.consecutiveLosses} po sobě jdoucích ztrát = 78% pravděpodobnost revenge trade v příštích 2 hodinách. Náklady doposud: $${(Number.parseFloat(traderProfile?.performance.totalPnL || "0") * (revengeRate / 100)).toFixed(0)}.`
    } else if (morningCheck && morningCheck.sleepHours < 6) {
      const sleepImpact = ((6 - morningCheck.sleepHours) * 8).toFixed(0)
      response = `Detekován spánek ${morningCheck.sleepHours}h. Tvůj win rate klesá ${sleepImpact}% když spánek <6h (${morningCheck.sleepHours < 5 ? "kritická úroveň" : "suboptimální"}). ${stats.totalTrades > 20 ? `Tento pattern se objevil ${Math.floor(stats.totalTrades / 10)}x v tomto období.` : ""}`
    } else {
      response = `Win rate: ${winRate.toFixed(1)}%, P&L: $${traderProfile?.performance.totalPnL || stats.totalPnL.toFixed(0)}. ${stats.consecutiveLosses >= 3 ? `UPOZORNĚNÍ: ${stats.consecutiveLosses} po sobě jdoucích ztrát = vysoká riziková zóna.` : `Výkon stabilní.`} ${patterns?.emotionalTrades ? `Emocionální obchody: ${traderProfile?.patterns.emotionalTrades || 0} (je třeba snížit).` : ""}`
    }
  } else {
    // coach mode
    const winRate = Number.parseFloat(traderProfile?.performance.winRate || String(stats.winRate))
    const totalTrades = traderProfile?.performance.totalTrades || stats.totalTrades

    if (stats.consecutiveLosses >= 3) {
      response = `${stats.consecutiveLosses} po sobě jdoucích ztrát. Porušil jsi max loss pravidlo ${stats.consecutiveLosses}x za sebou. Tohle je propad disciplíny. Výzva na 7 dní: Přestaň obchodovat po 2 ztrátách za den. Sleduj to.`
    } else if (totalTrades < 50) {
      response = `Máš ${totalTrades} obchodů v záznamu. Stále ve fázi učení – potřebuješ 100+ pro statistickou významnost. Zaměř se: Prováděj svůj plán 7/7 dní tento týden. Win rate zatím není důležitý, provedení ano.`
    } else if (winRate > 55) {
      response = `Win rate ${winRate.toFixed(1)}% je nad 55% prahem. ${totalTrades > 100 ? "Máš edge – teď zvětši pozici o 20%." : `Pokračuj v provádění do 100 obchodů (aktuálně ${totalTrades}).`} ${traderProfile?.goals[0] ? `Tvůj cíl "${traderProfile.goals[0].title}" je ${traderProfile.goals[0].progress.toFixed(0)}% hotový.` : ""}`
    } else {
      response = `Win rate ${winRate.toFixed(1)}% potřebuje zlepšení před škálováním. ${patterns?.revengeRate && Number.parseFloat(patterns.revengeRate) > 10 ? `Omez revenge trades (${patterns.revengeRate}%) – ` : ""}Příštích 30 dní: Zaměř se jen na vysokopravděpodobné setupy. Kvalita >kvantita.`
    }
  }

  return response
}

const personalityInstructions = {
  calm: `\n\n═══════════════════════════════════════════════════════════
🧘 PERSONALITY: CALM THERAPEUTIC MENTOR
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Teplý, chápavý, nesoudící
Jazyk: "Chápu", "Dává to smysl", "Pojďme si to projít společně"
Přístup: Validuj pocity, pak veď k řešení
Příklad (V ČEŠTINĚ): "Vidím že máš 3 ztráty – to je těžké. Tvůj stres na 8/10 mi říká, že potřebuješ reset před dalším obchodem. Pojďme udělat 4-7-8 dýchání teď."`,

  strict: `\n\n═══════════════════════════════════════════════════════════
⚡ PERSONALITY: STRICT NO-NONSENSE COACH
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Přímý, velící, nulová tolerance pro výmluvy
Jazyk: Příkazy ("PŘESTAŇ", "UDĚLEJ", "OPRAV"), žádné zjemňování
Přístup: Brutálně upozorni na chyby, požaduj okamžitou akci
Příklad (V ČEŠTINĚ): "3 po sobě jdoucí ztráty. Stres 8/10. PŘESTAŇ obchodovat TEĎKA. Revenge-trading – vidím ten pattern. 2 hodiny pauza. Žádné výjimky."`,

  analytical: `\n\n═══════════════════════════════════════════════════════════
🧩 PERSONALITY: ANALYTICAL DATA SCIENTIST
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Klinický, objektivní, zaměřený na čísla
Jazyk: Statistiky, korelace, procenta, velikosti vzorků
Přístup: Prezentuj data, identifikuj patterny, doporuč na základě pravděpodobnosti
Příklad (V ČEŠTINĚ): "Po sobě jdoucí ztráty: 3. Historická data ukazují 87% pravděpodobnost revenge trade v příštích 2 hodinách když stres >7. Optimální akce: pozastavit trading."`,

  balanced: `\n\n═══════════════════════════════════════════════════════════
💬 PERSONALITY: BALANCED PERFORMANCE COACH
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Profesionální ale podporující, pevný ale férový
Jazyk: Mix empatie + odpovědnosti ("Chápu A zároveň tady je co uděláme")
Přístup: Uznej emoci, přepni na akci, drž odpovědnost
Příklad (V ČEŠTINĚ): "3 ztráty bolí – chápu to. Tvůj stres je 8/10, což historicky vede k chybám. Vezmi si 2 hodiny pauzu, pak se vrať soustředěný."`,
}

export async function POST(req: NextRequest) {
  try {
    let body: ChatRequest
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: "Request body must be valid JSON",
          usingMockAI: false,
        },
        { status: 400 },
      )
    }

    const { message, personality, mode, context, userData, traderProfile } = body

    if (!message || !personality || !mode || !context || !userData) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Request must include: message, personality, mode, context, userData",
          usingMockAI: false,
        },
        { status: 400 },
      )
    }

    const hasApiKey = Boolean(process.env.OPENAI_API_KEY)

    if (!hasApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2500))

      const mockResponse = generateEnhancedMockResponse(body)

      return NextResponse.json({
        response: mockResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: true,
      })
    }

    const { trades, journals, moodHistory, stats, patterns, morningCheck, morningChecks } = userData

    const isAnalyticsMode = mode === "analytics"

    // Analyze recent patterns
    const recentLosses = trades.filter((t) => (t.pnl || 0) < 0).slice(0, 5)
    const consecutiveLossStreak = stats.consecutiveLosses
    const highStressTrades = trades.filter((t) => (t.stress || 0) >= 7).length
    const revengeTrades = trades.filter((t) => t.isRevengeTrade).length
    const lossesAfter3pm = trades.filter((t) => {
      const hour = new Date(t.date).getHours()
      return hour >= 15 && (t.pnl || 0) < 0
    }).length

    let dataSummary = `USER QUESTION: "${message}"

═══════════════════════════════════════════════════════════
🚨 CURRENT STATE (RIGHT NOW):
═══════════════════════════════════════════════════════════
- Mood: ${context.mood}/10 ${context.mood <= 4 ? "⚠️ LOW" : context.mood >= 8 ? "✅ GOOD" : ""}
- Stress: ${context.stress}/10 ${context.stress >= 7 ? "🔴 HIGH RISK" : context.stress >= 5 ? "⚠️ ELEVATED" : "✅ OK"}
- Confidence: ${context.confidence}/10
- Readiness: ${context.readiness}%
${context.sleep ? `- Sleep Last Night: ${context.sleep}h ${context.sleep < 6 ? "🔴 POOR" : context.sleep < 7 ? "⚠️ SUBOPTIMAL" : "✅ GOOD"}` : ""}
${context.energy ? `- Energy: ${context.energy}/10 ${context.energy < 5 ? "⚠️ LOW" : ""}` : ""}
${consecutiveLossStreak > 0 ? `\n🚨 ALERT: ${consecutiveLossStreak} CONSECUTIVE LOSSES ACTIVE` : ""}
${stats.consecutiveWins > 0 ? `\n✅ STREAK: ${stats.consecutiveWins} consecutive wins` : ""}

TRADER PROFILE (LAST ${traderProfile?.period.days || 30} DAYS):
${
  traderProfile
    ? `
PERFORMANCE:
- Total Trades: ${traderProfile.performance.totalTrades}
- Win Rate: ${traderProfile.performance.winRate}%
- Total P&L: $${traderProfile.performance.totalPnL}
- Best Trade: $${traderProfile.performance.bestTrade}
- Worst Trade: $${traderProfile.performance.worstTrade}
- Consecutive Wins: ${traderProfile.performance.consecutiveWins}
- Consecutive Losses: ${traderProfile.performance.consecutiveLosses}
- Average Win: $${traderProfile.performance.averageWin}
- Average Loss: $${traderProfile.performance.averageLoss}

PSYCHOLOGY:
- Average Mood: ${traderProfile.psychology.averageMood}/10
- Average Stress: ${traderProfile.psychology.averageStress}/10
- Average Readiness: ${traderProfile.psychology.averageReadiness}%
- Morning Checks Completed: ${traderProfile.psychology.morningChecksCompleted}
- Morning Check Rate: ${traderProfile.psychology.morningCheckRate}%

BEHAVIORAL PATTERNS:
- Revenge Trade Rate: ${traderProfile.patterns.revengeTradeRate}%
- Revenge Trades: ${traderProfile.patterns.revengeTrades}
- Emotional Trades: ${traderProfile.patterns.emotionalTrades}

ACTIVE GOALS:
${
  traderProfile.goals.length > 0
    ? traderProfile.goals
        .map((g) => `- ${g.title}: ${g.progress.toFixed(0)}% (${g.currentValue}/${g.targetValue}) - ${g.status}`)
        .join("\n")
    : "- No active goals"
}
`
    : `- No trader profile available (insufficient data)`
}

═══════════════════════════════════════════════════════════
⚠️ IDENTIFIED PATTERNS (LAST 30 DAYS):
═══════════════════════════════════════════════════════════
${revengeTrades > 0 ? `🔴 REVENGE TRADING: ${revengeTrades} trades flagged as revenge (${((revengeTrades / trades.length) * 100).toFixed(0)}% of total)` : "✅ No revenge trading detected"}
${highStressTrades > 0 ? `⚠️ HIGH-STRESS TRADING: ${highStressTrades} trades taken when stress ≥7/10` : ""}
${lossesAfter3pm > 0 ? `⚠️ LATE-DAY LOSSES: ${lossesAfter3pm} losing trades after 3pm` : ""}
${consecutiveLossStreak >= 3 ? `🚨 CRITICAL: ${consecutiveLossStreak} consecutive losses = REVENGE RISK ZONE` : ""}
${patterns?.revengeRate ? `- Revenge Trade Rate: ${patterns.revengeRate}% ${Number.parseFloat(patterns.revengeRate) > 15 ? "🔴 HIGH" : "✅ OK"}` : ""}
${patterns?.fomoRate ? `- FOMO Rate: ${patterns.fomoRate}%` : ""}

═══════════════════════════════════════════════════════════
📊 RECENT TRADES (LAST 5):
═══════════════════════════════════════════════════════════
${trades
  .slice(0, 5)
  .map((t, i) => {
    const result = (t.pnl || 0) > 0 ? "✅ WIN" : "❌ LOSS"
    const stressFlag = (t.stress || 0) >= 7 ? " 🔴 HIGH STRESS" : ""
    const revengeFlag = t.isRevengeTrade ? " ⚠️ REVENGE" : ""
    return `${i + 1}. ${t.pair || "N/A"} ${t.type || ""}: ${result} $${t.pnl?.toFixed(0) || "0"}${stressFlag}${revengeFlag}${t.notes ? `\n   Notes: "${t.notes.substring(0, 60)}"` : ""}`
  })
  .join("\n")}`

    if (isAnalyticsMode) {
      dataSummary += `

REAL DATA FROM MORNING CHECKS (LAST 7 DAYS):
${
  morningChecks && morningChecks.length > 0
    ? morningChecks
        .map(
          (m, i) =>
            `${i + 1}. ${m.date}: Sleep ${m.sleepHours}h (Q:${m.sleepQuality}/10), Energy ${m.energy}/10, Stress ${m.stress}/10, Readiness ${m.readiness}%`,
        )
        .join("\n")
    : "- No morning check data available"
}

EMOTIONAL PATTERNS FROM ANALYTICS:
${
  patterns
    ? `- FOMO Trades: ${patterns.fomoRate}%
- Revenge Trades: ${patterns.revengeRate}%
- Overconfident Trades: ${patterns.overconfidenceRate}%
- Fear-based Trades: ${patterns.fearRate}%`
    : "- No pattern data available"
}

RECENT TRADES WITH EMOTIONS:
${trades
  .slice(0, 10)
  .map((t, i) => {
    let emotionInfo = ""
    if (t.emotionBefore) emotionInfo += ` (před: ${t.emotionBefore})`
    if (t.emotionDuring) emotionInfo += ` (během: ${t.emotionDuring})`
    if (t.emotionAfter) emotionInfo += ` (po: ${t.emotionAfter})`
    if (t.isRevengeTrade) emotionInfo += " [REVENGE]"
    if (t.tags?.includes("FOMO")) emotionInfo += " [FOMO]"
    return `${i + 1}. ${t.pair || "N/A"} ${t.type || ""}: $${t.pnl?.toFixed(0) || "0"}${emotionInfo}`
  })
  .join("\n")}`
    }

    dataSummary += `

ODPOVĚZ PODLE SVÉHO REŽIMU (${mode.toUpperCase()}):
${mode === "mind" ? "- Zaměř se na emoce, psychologii a mentální stav. Pomoz s aktuálními pocity. Používej data z Trader Profile." : ""}
${mode === "analytics" ? "- Zaměř se na čísla, trendy a korelace. Ukážej souvislosti mezi spánkem, náladou a výkonem. Analyzuj patterns a goals progress." : ""}
${mode === "coach" ? "- Zaměř se na dlouhodobý rozvoj a návyky. Navrhuj změny pro zlepšení disciplíny. Sleduj goals progress a motivuj k jejich dosažení." : ""}

PRAVIDLA:
- MAX 3-4 věty
- BEZ markdown znaků
- BEZ prefixu "Přímá odpověď:"
- Přímo k věci
- Použij data z Trader Profile a reálných metrik
- Personalizuj podle win rate, revenge patterns, goals progress`

    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: MODE_PROMPTS[mode] + personalityInstructions[personality] },
          { role: "user", content: dataSummary },
        ],
        temperature: 0.7,
        maxTokens: 300,
      })

      const aiResponse = result.text || "Error generating response"

      return NextResponse.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: false,
      })
    } catch (openaiError: any) {
      console.error("❌ OpenAI API Error:", openaiError)

      const mockResponse = generateEnhancedMockResponse(body)

      return NextResponse.json({
        response: mockResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: true,
        fallbackReason: openaiError.message || "OpenAI API error",
      })
    }
  } catch (error: any) {
    console.error("❌ MindTrader API Error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: error?.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
        usingMockAI: false,
      },
      { status: 500 },
    )
  }
}
