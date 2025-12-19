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
  const { message, personality, mode, context, userData } = request
  const { mood, stress, readiness, sleep, energy } = context
  const { stats, patterns, morningCheck } = userData

  let response = ""

  if (mode === "mind") {
    if (morningCheck && morningCheck.sleepHours < 6) {
      response = `Spánek ${morningCheck.sleepHours}h je pod 6h = vyšší riziko špatných rozhodnutí. ${morningCheck.energyLevel < 5 ? "Nízká energie navíc." : ""} Doporuč: zkrať session nebo menší pozice. Mental clarity first.`
    } else if (message.toLowerCase().includes("strach") || message.toLowerCase().includes("fear")) {
      response = `Strach je normální. ${patterns && Number.parseFloat(patterns.fearRate) > 20 ? `Vidím ${patterns.fearRate}% obchodů má nízkou důvěru.` : ""} Zkus TEĎKA: 4-7-8 dýchání 3x. ${stress > 7 ? "Stres " + stress + "/10 blokuje rozhodování." : ""} Reset, pak zpět.`
    } else if (message.toLowerCase().includes("ztráta") || message.toLowerCase().includes("loss")) {
      response = `Po ztrátě STOP min 2h. ${patterns && Number.parseFloat(patterns.revengeRate) > 15 ? `Máš ${patterns.revengeRate}% revenge trades - nebezpečný pattern.` : ""} Journal: Co jsem cítil PŘED? Emoce ignorovat = chyba. Návrat poloviční pozicí.`
    } else {
      response = `Mood ${mood}/10, stress ${stress}/10${energy ? `, energie ${energy}/10` : ""}. ${stress > 7 ? "Vysoký stres = riziko impulz. 5 min reset." : "Mentál OK."} ${readiness < 60 ? "Readiness <60% = red zone." : "Můžeš pokračovat opatrně."}`
    }
  } else if (mode === "analytics") {
    const sleepNote =
      morningCheck && morningCheck.sleepHours < 6
        ? ` Spánek ${morningCheck.sleepHours}h koreluje s nižším výkonem.`
        : ""
    const patternNote = patterns ? ` FOMO ${patterns.fomoRate}%, Revenge ${patterns.revengeRate}%.` : ""

    response = `Win rate: ${stats.winRate.toFixed(1)}%, P&L: $${stats.totalPnL.toFixed(0)}, Trades: ${stats.totalTrades}.${patternNote}${sleepNote} ${stats.consecutiveLosses > 2 ? `Consecutive losses: ${stats.consecutiveLosses} = high risk zone.` : "Data ukazují stabilitu."}`
  } else {
    const exerciseNote =
      morningCheck && morningCheck.exercised
        ? " Cvičení je pozitivní návyk - keep it."
        : " Zvažte přidat ranní cvičení pro focus."

    response = `${stats.totalTrades < 100 ? "Fáze: Learning. Sbírej data 100+ tradů." : "Máš data - scale now."} ${stats.winRate > 55 ? "Win rate >55% je pro." : "Zlepši edge před scale."} ${patterns && Number.parseFloat(patterns.fomoRate) > 20 ? `FOMO ${patterns.fomoRate}% = pracuj na disciplíně.` : ""}${exerciseNote}`
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

    const { message, personality, mode, context, userData } = body

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

    const { trades, journals, moodHistory, stats, patterns, morningCheck } = userData

    const isAnalyticsMode = mode === "analytics"

    let dataSummary = `USER QUESTION: ${message}

REAL DATA FROM DAILY TRACKER:
- Mood: ${context.mood}/10
- Stress: ${context.stress}/10
- Confidence: ${context.confidence}/10
- Readiness: ${context.readiness}%

TRADING STATS:
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate.toFixed(1)}%
- P&L: $${stats.totalPnL.toFixed(0)}
- Consecutive Losses: ${stats.consecutiveLosses}

RECENT TRADES:
${trades
  .slice(0, 5)
  .map((t, i) => {
    return `${i + 1}. ${t.pair || "N/A"} ${t.type || ""}: $${t.pnl?.toFixed(0) || "0"}`
  })
  .join("\n")}`

    if (isAnalyticsMode) {
      dataSummary += `

REAL DATA FROM MORNING CHECK:
${
  morningCheck
    ? `- Sleep: ${morningCheck.sleepHours}h (quality ${morningCheck.sleepQuality}/10)
- Energy: ${morningCheck.energyLevel}/10
- Stress: ${morningCheck.stressLevel}/10
- Focus: ${morningCheck.focus}/10
- Physical Health: ${morningCheck.physicalHealth}/10
- Emotional State: ${morningCheck.emotionalState}/10
- Exercised: ${morningCheck.exercised ? "Yes" : "No"}
- Meditation: ${morningCheck.meditationTime} min`
    : "- No morning check today"
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
${mode === "mind" ? "- Zaměř se na emoce, psychologii a mentální stav. Pomoz s aktuálními pocity." : ""}
${mode === "analytics" ? "- Zaměř se na čísla, trendy a korelace. Ukážej souvislosti mezi spánkem, náladou a výkonem." : ""}
${mode === "coach" ? "- Zaměř se na dlouhodobý rozvoj a návyky. Navrhuj změny pro zlepšení disciplíny." : ""}

PRAVIDLA:
- MAX 3-4 věty
- BEZ markdown znaků
- BEZ prefixu "Přímá odpověď:"
- Přímo k věci
- Použij data z výše uvedených metrik`

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
