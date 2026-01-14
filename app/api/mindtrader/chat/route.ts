import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const MODE_PROMPTS = {
  mind: `Jsi MIND AI – psychologický parťák pro tradery. Zaměř se POUZE na EMOCE a MENTÁLNÍ STAV.

TVŮJ ÚKOL:
- Řešit aktuální emoce (strata, frustrace, strach, FOMO)
- Uklidnit během ztráty
- Vysvětlit, co se děje v hlavě a proč
- Poradit, jak se vrátit do klidu
- Připravit před obchodováním (pre-trade mindset check)
- Dát krátké mentální cvičení (dýchání, grounding, vizualizace)

IGNORUJ: Čísla, statistiky, data analysis, dlouhodobé plány

PRAVIDLA:
- MAX 3-4 věty
- Praktické techniky TEĎKA
- Empatie a podpora
- BEZ markdown (#, *, **)
- Pomoz neudělat špatné rozhodnutí`,

  analytics: `Jsi ANALYTICS AI – výkonnostní analytik pro tradery. Zaměř se POUZE na DATA a ČÍSLA.

TVŮJ ÚKOL:
- Spojit data ze spánku, nálady, počasí, rutiny, obchodů
- Najít souvislosti ("Když spíš pod 6h, máš o 22% horší výsledky")
- Upozornit na risk behavior (revenge trading, overtrading)
- Analyzovat vývoj za týden, měsíc, kvartál
- Ukázat silné a slabé stránky
- Předpovědět jaké trading podmínky má dnes
- Navrhnout kroky ke zlepšení výkonu

IGNORUJ: Emoce, pocity, psychologii, dlouhodobé cíle

PRAVIDLA:
- MAX 3-4 věty
- Konkrétní čísla a trendy
- Data-driven insights
- BEZ markdown (#, *, **)
- Objektivní fakta`,

  coach: `Jsi COACH AI – osobní trenér disciplíny a růstu. Zaměř se na DLOUHODOBÝ ROZVOJ.

TVŮJ ÚKOL:
- Nastavit cíle (týdenní, měsíční)
- Hlídat disciplínu
- Pomáhat budovat dlouhodobé návyky
- Učit pravidla, která bude dodržovat
- Dávat výzvy ("7 dní bez overtradingu")
- Přinášet vzdělávání o trading psychologii
- Pomoci nastavit plán po velké ztrátě
- Zhodnotit progress a upozornit, pokud padá

IGNORUJ: Krátkodobé emoce, daily metrics

PRAVIDLA:
- MAX 3-4 věty
- Akční kroky pro růst
- Long-term perspektiva
- BEZ markdown (#, *, **)
- Mentor mindset`,
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
    if (morningCheck && morningCheck.sleepHours < 6) {
      response = `Spánek ${morningCheck.sleepHours}h je pod 6h = vyšší riziko špatných rozhodnutí. ${morningCheck.energyLevel < 5 ? "Nízká energie navíc." : ""} Doporuč: zkrať session nebo menší pozice. Mental clarity first.`
    } else if (message.toLowerCase().includes("strach") || message.toLowerCase().includes("fear")) {
      response = `Strach je normální. ${traderProfile ? `Vidím ${traderProfile.psychology.averageMood} průměrnou náladu.` : ""} Zkus TEĎKA: 4-7-8 dýchání 3x. ${stress > 7 ? "Stres " + stress + "/10 blokuje rozhodování." : ""} Reset, pak zpět.`
    } else if (message.toLowerCase().includes("ztráta") || message.toLowerCase().includes("loss")) {
      response = `Po ztrátě STOP min 2h. ${traderProfile ? `Máš ${traderProfile.patterns.revengeTradeRate}% revenge trades - ${Number.parseFloat(traderProfile.patterns.revengeTradeRate) > 15 ? "nebezpečný pattern." : "pod kontrolou."}` : ""} Journal: Co jsem cítil PŘED? Emoce ignorovat = chyba. Návrat poloviční pozicí.`
    } else {
      response = `Mood ${mood}/10, stress ${stress}/10${energy ? `, energie ${energy}/10` : ""}. ${traderProfile ? `Za ${traderProfile.period.days} dní: ${traderProfile.performance.totalTrades} obchodů, ${traderProfile.performance.winRate}% win rate.` : ""} ${stress > 7 ? "Vysoký stres = riziko impulz. 5 min reset." : "Mentál OK."}`
    }
  } else if (mode === "analytics") {
    const sleepNote =
      morningCheck && morningCheck.sleepHours < 6
        ? ` Spánek ${morningCheck.sleepHours}h koreluje s nižším výkonem.`
        : ""
    const patternNote = traderProfile
      ? ` Revenge: ${traderProfile.patterns.revengeTradeRate}%, Emoční obchody: ${traderProfile.patterns.emotionalTrades}.`
      : ""
    const goalsNote =
      traderProfile && traderProfile.goals.length > 0
        ? ` Cíl: ${traderProfile.goals[0].title} - ${traderProfile.goals[0].progress.toFixed(0)}% hotovo.`
        : ""

    response = `Win rate: ${traderProfile?.performance.winRate || stats.winRate.toFixed(1)}%, P&L: $${traderProfile?.performance.totalPnL || stats.totalPnL.toFixed(0)}.${patternNote}${sleepNote}${goalsNote} ${stats.consecutiveLosses > 2 ? `Consecutive losses: ${stats.consecutiveLosses} = high risk zone.` : "Data ukazují stabilitu."}`
  } else {
    const exerciseNote =
      morningCheck && morningCheck.exercised
        ? " Cvičení je pozitivní návyk - keep it."
        : " Zvažte přidat ranní cvičení pro focus."
    const goalsNote =
      traderProfile && traderProfile.goals.length > 0
        ? ` Tvůj cíl "${traderProfile.goals[0].title}": ${traderProfile.goals[0].progress.toFixed(0)}% - ${traderProfile.goals[0].progress > 75 ? "skoro tam!" : traderProfile.goals[0].progress > 50 ? "dobře na tom." : "potřebuje pozornost."}`
        : ""

    response = `${stats.totalTrades < 100 ? "Fáze: Learning. Sbírej data 100+ tradů." : "Máš data - scale now."} ${Number.parseFloat(traderProfile?.performance.winRate || "0") > 55 ? "Win rate >55% je pro." : "Zlepši edge před scale."}${goalsNote}${exerciseNote}`
  }

  return response
}

const personalityInstructions = {
  calm: "\n\nStyle: 🧘 Calm Mentor - Be therapeutic, supportive, empathetic. Use soft language.",
  strict: "\n\nStyle: ⚡ Strict Coach - Be direct, performance-focused, use commands. Military style.",
  analytical: "\n\nStyle: 🧩 Analytical Advisor - Be data-driven, scientific, use numbers and correlations.",
  balanced: "\n\nStyle: 💬 Balanced Coach - Mix empathy with performance. Universal approach.",
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

    let dataSummary = `USER QUESTION: ${message}

REAL DATA FROM DAILY TRACKER:
- Mood: ${context.mood}/10
- Stress: ${context.stress}/10
- Confidence: ${context.confidence}/10
- Readiness: ${context.readiness}%
${context.sleep ? `- Sleep: ${context.sleep}h` : ""}
${context.energy ? `- Energy: ${context.energy}/10` : ""}

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

RECENT TRADES:
${trades
  .slice(0, 5)
  .map((t, i) => {
    return `${i + 1}. ${t.pair || "N/A"} ${t.type || ""}: $${t.pnl?.toFixed(0) || "0"}${t.notes ? ` - ${t.notes.substring(0, 50)}` : ""}`
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
        maxOutputTokens: 300,
      })

      const aiResponse = result.text || "Error generating response"

      return NextResponse.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: false,
      })
    } catch (openaiError: any) {
      console.error("OpenAI API Error:", openaiError)

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
