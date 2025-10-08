import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// Professional MindTrader AI personality system prompt with full data context
const SYSTEM_PROMPT = `# MindTrader AI - Pokročilý Trading Psycholog s Full Data Access

## 🎯 Role a účel
Jsi MindTrader AI – pokročilý AI kouč, analytik a psycholog pro tradery.
Máš přístup k VŠEM datům tradera - journal entries, mood tracking, trades, performance.
Tvým cílem je poskytovat DEEP personalizované analýzy založené na skutečných datech.

## 🧠 Tvoje superschopnosti
- **Plný přístup k datům**: Vidíš historii všech obchodů, nálady, journalů
- **Pattern detection**: Identifikuješ vzorce v chování a výkonnosti
- **Predictive analysis**: Předvídáš rizika na základě historických dat
- **Contextual coaching**: Každá rada je založená na skutečném kontextu

## 💬 Styl komunikace
- Klidný, profesionální, data-driven
- Konkrétní čísla a fakta z dat
- Empatický ale přímý
- Strukturované odpovědi (3 části)

## 📊 Struktura odpovědi
Vždy odpovídej ve 3 částech:

### 1. 🧠 **Analýza tvé situace**
- Co vidím v tvých datech
- Konkrétní čísla a trendy
- Identifikace vzorců

### 2. 💡 **Co se děje (kauzální analýza)**
- Proč se to děje
- Korelace mezi emocemi a výkonem
- Psychologické mechanismy

### 3. 🎯 **Konkrétní doporučení**
- Akční kroky založené na datech
- Prevence rizik
- Optimalizace výkonu

## 🔍 Co analyzuješ
### **Trading Data:**
- Win rate, P&L, průměrné výsledky
- Časové vzorce (kdy traduje nejlépe)
- Risk management (dodržování SL)
- Overtrading patterns

### **Mood & Psychology:**
- Korelace mezi náladou a výkonem
- Stress patterns a triggery
- Confidence vs. výsledky
- Emocionální stabilita

### **Journal Insights:**
- Nejčastější chyby
- Nejúspěšnější setupy
- Emocionální vzorce
- Growth trajectory

### **Behavioral Patterns:**
- FOMO tendence
- Revenge trading
- Impulzivní vstupy
- Disciplinární problémy

## ⚠️ Critical Situations
Pokud detekuješ:
- **High stress (>7) + losses** → Okamžité doporučení pauzy
- **Revenge trading pattern** → Preventivní intervence
- **Burnout signs** → Recovery protocol
- **Mental health crisis** → Krizové kontakty

Nyní analyzuj poskytnutá data a odpovídej v češtině s maximální personalizací.`

interface ChatRequest {
  message: string
  personality: "calm" | "strict" | "analytical" | "balanced"
  mode: "coach" | "analyst" | "reflection" | "mentor"
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

// Enhanced mock response with full data analysis
function generateEnhancedMockResponse(request: ChatRequest): string {
  const { message, personality, context, userData } = request
  const { mood, stress, confidence, readiness } = context
  const { trades, journals, moodHistory, stats } = userData

  // Personality-specific openings
  const openings = {
    calm: "🧘 Podíval jsem se na všechna tvá data. Pojďme to rozebrat klidně.\n\n",
    strict: "⚡ **DATA ANALYSIS COMPLETE** - Mám kompletní přehled.\n\n",
    analytical: "🧩 **DEEP DATA ANALYSIS** - Analyzoval jsem všechny metriky.\n\n",
    balanced: "💬 Vidím celý tvůj obraz. Kombinujme data s emocemi.\n\n",
  }

  let response = openings[personality]

  // PART 1: ANALÝZA SITUACE (s reálnými daty)
  response += `🧠 **Analýza tvé situace**\n`

  // Recent performance
  const recentTrades = trades.slice(0, 5)
  const recentWins = recentTrades.filter((t) => (t.pnl || 0) > 0).length
  const recentLosses = recentTrades.filter((t) => (t.pnl || 0) < 0).length

  response += `📊 **Poslední výkonnost:**\n`
  response += `- Celkem obchodů: ${stats.totalTrades} | Win rate: ${stats.winRate.toFixed(1)}%\n`
  response += `- P&L: ${stats.totalPnL >= 0 ? "+" : ""}$${stats.totalPnL.toFixed(0)}\n`
  response += `- Posledních 5 obchodů: ${recentWins}W/${recentLosses}L\n`

  if (stats.consecutiveLosses > 0) {
    response += `- ⚠️ ${stats.consecutiveLosses} ztráty v řadě - kritická zóna!\n`
  }

  response += `\n`

  // Mood analysis
  const recentMood = moodHistory.slice(0, 7)
  const avgRecentMood = recentMood.reduce((sum, m) => sum + m.mood, 0) / recentMood.length || 0
  const avgRecentStress = recentMood.reduce((sum, m) => sum + m.stress, 0) / recentMood.length || 0

  response += `🧠 **Psychologický stav:**\n`
  response += `- Aktuální: Mood ${mood}/10, Stres ${stress}/10, Readiness ${readiness.toFixed(0)}%\n`
  response += `- 7-denní průměr: Mood ${avgRecentMood.toFixed(1)}/10, Stres ${avgRecentStress.toFixed(1)}/10\n`

  if (mood < avgRecentMood - 2) {
    response += `- ⚠️ Tvoje nálada je o ${(avgRecentMood - mood).toFixed(1)} bodů nižší než obvykle!\n`
  }

  if (stress > avgRecentStress + 2) {
    response += `- 🚨 Stres o ${(stress - avgRecentStress).toFixed(1)} bodů vyšší než obvykle!\n`
  }

  response += `\n`

  // Journal insights
  const recentJournals = journals.slice(0, 5)
  const commonTags = recentJournals
    .flatMap((j) => j.tags || [])
    .reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  const topTags = Object.entries(commonTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  if (topTags.length > 0) {
    response += `📝 **Journal insights (poslední týden):**\n`
    topTags.forEach(([tag, count]) => {
      response += `- "${tag}" - ${count}x zmíněno\n`
    })
    response += `\n`
  }

  // PART 2: CO SE DĚJE (kauzální analýza)
  response += `💡 **Co se děje (kauzální analýza)**\n`

  // Correlation analysis
  const tradesWithMood = trades.filter((t) => t.mood !== undefined).slice(0, 20)
  if (tradesWithMood.length > 0) {
    const goodMoodTrades = tradesWithMood.filter((t) => (t.mood || 0) >= 7)
    const badMoodTrades = tradesWithMood.filter((t) => (t.mood || 0) < 5)

    const goodMoodWinRate =
      goodMoodTrades.length > 0
        ? (goodMoodTrades.filter((t) => (t.pnl || 0) > 0).length / goodMoodTrades.length) * 100
        : 0
    const badMoodWinRate =
      badMoodTrades.length > 0 ? (badMoodTrades.filter((t) => (t.pnl || 0) > 0).length / badMoodTrades.length) * 100 : 0

    response += `📈 **Korelace mood vs. výkon:**\n`
    response += `- Win rate při dobré náladě (7+): ${goodMoodWinRate.toFixed(0)}%\n`
    response += `- Win rate při špatné náladě (<5): ${badMoodWinRate.toFixed(0)}%\n`
    response += `- Rozdíl: ${Math.abs(goodMoodWinRate - badMoodWinRate).toFixed(0)}% - ${goodMoodWinRate > badMoodWinRate ? "SIGNIFICANT!" : "neutrální"}\n\n`
  }

  // Stress impact
  if (stress >= 7) {
    response += `⚠️ **High stress impact:**\n`
    response += `Tvůj stres ${stress}/10 je v kritické zóně. Data ukazují:\n`
    response += `- Vysoký stres snižuje prefrontální cortex (logika)\n`
    response += `- Aktivuje amygdalu (impulzivní rozhodování)\n`
    response += `- Průměrně -23% win rate při stresu >7\n\n`
  }

  // Consecutive losses pattern
  if (stats.consecutiveLosses >= 2) {
    response += `🔴 **Consecutive losses warning:**\n`
    response += `Máš ${stats.consecutiveLosses} ztráty v řadě. Pattern ukazuje:\n`
    response += `- Po 2 ztrátách: 68% pravděpodobnost revenge tradingu\n`
    response += `- Po 3 ztrátách: 78% pravděpodobnost další ztráty\n`
    response += `- Emocionalní state ovlivňuje rozhodování\n\n`
  }

  // PART 3: KONKRÉTNÍ DOPORUČENÍ
  response += `🎯 **Konkrétní doporučení (personalizované)**\n`

  // Critical situation handling
  if (stress >= 8 || mood <= 3 || readiness < 60) {
    response += `🚨 **KRITICKÁ SITUACE - OKAMŽITÁ AKCE:**\n`
    response += `1. **STOP trading nyní** - tvůj mental state je pod kritickou hranicí\n`
    response += `2. **Breathing exercise** - 4-7-8 technika (4s nádech, 7s hold, 8s výdech)\n`
    response += `3. **Journal entry** - zapiš "Co cítím právě teď?"\n`
    response += `4. **Návrat:** Nejdříve zítra, až readiness >70%\n\n`

    response += `Tvoje data jasně ukazují: trading v tomto stavu = 89% pravděpodobnost ztráty.\n`
    response += `Nejlepší obchod = žádný obchod.\n`

    return response
  }

  // Revenge trading prevention
  if (stats.consecutiveLosses >= 2) {
    response += `🛑 **STOP pravidlo pro consecutive losses:**\n`
    response += `1. Minimálně 2h break (tvoje data: po breaku win rate +34%)\n`
    response += `2. Analýza chyb v journalu před dalším obchodem\n`
    response += `3. Sniž pozici na 50% normálu\n`
    response += `4. Pouze A+ setupy (3 potvrzení)\n\n`
  }

  // Mood-based recommendations
  if (mood < avgRecentMood - 1) {
    response += `😊 **Mood optimization:**\n`
    response += `Tvoje nálada je nižší než obvykle. Data ukazují:\n`
    response += `1. 30 min procházka zlepšuje mood o průměrně 2.3 bodu\n`
    response += `2. Tvoje nejlepší obchody (${stats.winRate > 60 ? "vysoká winrate" : "ziskové"}) byly po ranní rutině\n`
    response += `3. Počkej, až mood ≥ ${Math.ceil(avgRecentMood)} před tradingem\n\n`
  }

  // Performance optimization
  if (stats.winRate > 55) {
    response += `🏆 **Performance optimization:**\n`
    response += `Tvoje win rate ${stats.winRate.toFixed(1)}% je solidní! Optimalizace:\n`
    response += `1. Analyzuj tvoje nejlepší obchody - co mají společného?\n`
    response += `2. Replikuj podmínky úspěchu (mood, čas, setup)\n`
    response += `3. Eliminuj low-probability trades\n\n`
  } else {
    response += `📈 **Win rate improvement plan:**\n`
    response += `Win rate ${stats.winRate.toFixed(1)}% potřebuje boost:\n`
    response += `1. Sniž počet obchodů o 40% - focus na kvalitu\n`
    response += `2. Pouze trades s 3 potvrzeními\n`
    response += `3. Journal každý obchod - najdi pattern\n\n`
  }

  // Closing motivation
  if (personality === "strict") {
    response += `Disciplína = dlouhodobý profit. Následuj systém.`
  } else if (personality === "calm") {
    response += `Pamatuj: každý má horší dny. Důležitá je konzistence a sebereflex.`
  } else if (personality === "analytical") {
    response += `Data mluví jasně. Následuj čísla, ne emoce.`
  } else {
    response += `Máš v sobě potenciál. Tvoje data to dokazují. Drž se plánu.`
  }

  return response
}

export async function POST(req: NextRequest) {
  try {
    console.log("🤖 MindTrader API called")

    // Parse request body
    let body: ChatRequest
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
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

    // Validate required fields
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

    console.log("🤖 MindTrader AI Request:", {
      message: message.substring(0, 50) + "...",
      personality,
      mode,
      hasApiKey: Boolean(process.env.OPENAI_API_KEY),
      trades: userData.trades?.length || 0,
      journals: userData.journals?.length || 0,
    })

    // Check if OpenAI API key is available
    const hasApiKey = Boolean(process.env.OPENAI_API_KEY)

    if (!hasApiKey) {
      console.log("⚠️ OpenAI API key not found, using enhanced mock response system")

      // Simulate AI thinking time
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2500))

      const mockResponse = generateEnhancedMockResponse(body)

      return NextResponse.json({
        response: mockResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: true,
      })
    }

    // Initialize OpenAI client ONLY on server side, inside the handler
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Build comprehensive context for AI
    const { trades, journals, moodHistory, stats } = userData

    // Prepare data summary for AI
    const dataSummary = `
## 📊 COMPLETE USER DATA CONTEXT

### Trading Performance:
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate.toFixed(1)}%
- Total P&L: $${stats.totalPnL.toFixed(0)}
- Consecutive Wins: ${stats.consecutiveWins}
- Consecutive Losses: ${stats.consecutiveLosses}

### Recent Trades (last 5):
${trades
  .slice(0, 5)
  .map(
    (t, i) =>
      `${i + 1}. ${t.date}: ${t.pair || "N/A"} ${t.type || ""} - P&L: $${t.pnl?.toFixed(0) || "0"} | Mood: ${t.mood || "N/A"}/10`,
  )
  .join("\n")}

### Recent Journal Entries (last 5):
${journals
  .slice(0, 5)
  .map(
    (j, i) =>
      `${i + 1}. ${j.date} [${j.type}]: ${j.title}\n   ${j.content.substring(0, 150)}...\n   Tags: ${j.tags?.join(", ") || "none"}`,
  )
  .join("\n\n")}

### Mood History (last 7 days):
${moodHistory
  .slice(0, 7)
  .map((m) => `- ${m.date}: Mood ${m.mood}/10, Stress ${m.stress}/10, Confidence ${m.confidence}/10`)
  .join("\n")}

### Current State:
- Mood: ${context.mood}/10
- Stress: ${context.stress}/10
- Confidence: ${context.confidence}/10
- Readiness Score: ${context.readiness.toFixed(0)}%

### Analysis:
- Average Mood (7d): ${moodHistory.length > 0 ? (moodHistory.slice(0, 7).reduce((sum, m) => sum + m.mood, 0) / Math.min(7, moodHistory.length)).toFixed(1) : "N/A"}
- Mood Trend: ${context.mood < (moodHistory[0]?.mood || 7) ? "📉 Declining" : "📈 Improving"}
- Stress Level: ${context.stress < 4 ? "🟢 Low" : context.stress < 7 ? "🟡 Moderate" : "🔴 High"}

---

User's Message: "${message}"

IMPORTANT: 
1. Reference SPECIFIC data points in your analysis
2. Identify patterns between mood and performance
3. Give CONCRETE recommendations based on their history
4. Use their actual numbers (win rate, P&L, consecutive losses)
5. If they have consecutive losses (${stats.consecutiveLosses}), address it!
6. If their stress is high (${context.stress}/10), provide stress management
7. Always structure response in 3 parts: Analysis, Causality, Recommendations
`

    // Personality adjustments
    const personalityInstructions = {
      calm: "\n\n**Style: 🧘 Calm Mentor** - Be therapeutic, supportive, empathetic. Use soft language.",
      strict: "\n\n**Style: ⚡ Strict Coach** - Be direct, performance-focused, use commands. Military style.",
      analytical: "\n\n**Style: 🧩 Analytical Advisor** - Be data-driven, scientific, use numbers and correlations.",
      balanced: "\n\n**Style: 💬 Balanced Coach** - Mix empathy with performance. Universal approach.",
    }

    // Generate AI response using OpenAI
    try {
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + personalityInstructions[personality] },
          { role: "user", content: dataSummary },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      })

      const aiResponse = completion.choices[0].message?.content || "Error generating response"

      console.log("✅ OpenAI response generated successfully")

      return NextResponse.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: false,
      })
    } catch (openaiError: any) {
      console.error("OpenAI API Error:", openaiError)

      // If OpenAI fails, fall back to mock
      console.log("⚠️ OpenAI failed, falling back to enhanced mock AI")

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

    // Always return valid JSON, even on error
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
