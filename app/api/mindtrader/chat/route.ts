import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const MODE_PROMPTS = {
  coach: `Jsi PSYCHOLOG pro tradery. Zaměř se POUZE na EMOCE a MENTÁLNÍ ZDRAVÍ.

TVŮJ FOKUS:
- Emocionální stav a jak ho zlepšit
- Strach, anxieta, FOMO
- Mindfulness a meditace
- Jak se vrátit po ztrátě
- Budování sebevědomí

IGNORUJ: Čísla, statistiky, data analysis

Styl odpovědi: 3-4 věty MAX, praktické techniky, empatie
NEPIŠ markdown (#, *, **), jen čistý text`,

  analyst: `Jsi DATA ANALYST pro trading. Zaměř se POUZE na ČÍSLA a STATISTIKY.

TVŮJ FOKUS:
- Win rate, P&L, profit factor
- Patterns v datech (kdy vítězí/prohrává)
- Korelace mezi metrics
- Konkrétní čísla a trendy
- Objektiv ní fakta

IGNORUJ: Emoce, pocity, psychologii

Styl odpovědi: 3-4 věty MAX, konkrétní čísla, data-driven
NEPIŠ markdown (#, *, **), jen čistý text`,

  mentor: `Jsi SENIOR TRADER mentor. Zaměř se POUZE na DLOUHODOBÝ ROZVOJ.

TVŮJ FOKUS:
- Kariérní cíle (kde být za 6-12 měsíců)
- Systémy a rutiny pro růst
- Co dělat jinak pro lepší výsledky
- Strategic thinking
- Wisdom z experience

IGNORUJ: Krátkodobé emoce a daily metrics

Styl odpovědi: 3-4 věty MAX, akční kroky, long-term perspektiva
NEPIŠ markdown (#, *, **), jen čistý text`,
}

interface ChatRequest {
  message: string
  personality: "calm" | "strict" | "analytical" | "balanced"
  mode: "coach" | "analyst" | "mentor"
  context: {
    mood: number
    stress: number
    confidence: number
    readiness: number
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
  const { mood, stress, readiness } = context
  const { stats } = userData

  let response = ""

  if (mode === "coach") {
    // PSYCHOLOG - pure emotions, NO numbers
    if (message.toLowerCase().includes("strach") || message.toLowerCase().includes("fear")) {
      response = `Strach je normální. Zkus TEĎKA: Zavři oči, dýchej 4s in-7s hold-8s out, 3x opakuj. Tvůj stres ${stress}/10 říká že potřebuješ reset. Pauza 30 min, pak zpět s čistou hlavou.`
    } else if (message.toLowerCase().includes("ztráta") || message.toLowerCase().includes("loss")) {
      response = `Po ztrátě STOP min 2h. Zapiš do journalu: Co jsem cítil před tradedem? Emoce nejsou nepřítel, ignorování je. Návrat s poloviční pozicí. One loss ≠ bad trader.`
    } else {
      response = `Vidím mood ${mood}/10, stress ${stress}/10. ${stress > 7 ? "Vysoký stres blokuje jasné myšlení. 5 min deep breathing." : "Mentál je OK."} ${readiness < 60 ? "Readiness <60% = nebezpečí zone. Rest first." : "Můžeš pokračovat, ale opatrně."}`
    }
  } else if (mode === "analyst") {
    // ANALYTIK - pure data, NO emotions
    response = `Win rate: ${stats.winRate.toFixed(1)}%, P&L: $${stats.totalPnL.toFixed(0)}, Trades: ${stats.totalTrades}. ${stats.consecutiveLosses > 0 ? `Consecutive losses: ${stats.consecutiveLosses} = vysoké riziko revenge trading.` : "Data ukazují stabilitu."} ${stats.winRate < 50 ? "Win rate <50% = přehodnoť strategy." : "Čísla jsou solid."}`
  } else {
    // MENTOR - long-term development
    response = `${stats.totalTrades < 100 ? "Fáze: Learning. Sbírej data 100+ tradů před optimalizací." : "Máš dostatek dat - čas na scale."} ${stats.winRate > 55 ? "Win rate >55% je profesionální úroveň." : "Zlepši edge před zvětšováním pozic."} Každý top trader byl tam kde jsi teď. Focus na proces 12 měsíců = transformation.`
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

    const { trades, journals, moodHistory, stats } = userData

    const dataSummary = `USER QUESTION: ${message}

REAL DATA FROM DAILY TRACKER:
- Mood: ${context.mood}/10 (from today's tracker)
- Stress: ${context.stress}/10 (from today's tracker)
- Confidence: ${context.confidence}/10 (from today's tracker)
- Readiness: ${context.readiness}% (calculated from tracker)

TRADING STATS:
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate.toFixed(1)}%
- P&L: $${stats.totalPnL.toFixed(0)}
- Consecutive Losses: ${stats.consecutiveLosses}

RECENT TRADES:
${trades
  .slice(0, 5)
  .map((t, i) => `${i + 1}. ${t.pair || "N/A"} ${t.type || ""}: $${t.pnl?.toFixed(0) || "0"}`)
  .join("\n")}

ODPOVĚZ PODLE SVÉHO REŽIMU (${mode.toUpperCase()}):
${mode === "coach" ? "- Zaměř se na emoce a psychologii" : ""}
${mode === "analyst" ? "- Zaměř se na čísla a data" : ""}
${mode === "mentor" ? "- Zaměř se na dlouhodobý rozvoj" : ""}

PRAVIDLA:
- MAX 4 věty
- BEZ markdown znaků
- BEZ prefixu "Přímá odpověď:"
- Přímo k věci`

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
