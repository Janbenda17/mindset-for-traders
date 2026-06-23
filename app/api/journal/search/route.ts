// AI-assisted search over the Discipline Matrix / journal history.
//
// Important design constraint: Claude is used ONLY to translate the
// trader's free-text query into a small set of structured filters chosen
// from a fixed, enumerated vocabulary (known self-report tags, the 4
// matrix colors, an optional keyword, an optional P&L sign). Claude never
// sees or invents the actual dates/trades — the structured filter is then
// applied with plain deterministic JS against the real Discipline Matrix
// (lib/discipline-matrix.ts) and the trader's real journal/trade content.
// This guarantees every date returned to the UI is grounded in real data;
// the AI can only narrow the search, never fabricate a result.
import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { buildDisciplineMatrix, type DisciplineDay } from "@/lib/discipline-matrix"

let clientInstance: Anthropic | null = null

function getClient(): Anthropic {
  if (clientInstance) return clientInstance
  clientInstance = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
  return clientInstance
}

const KNOWN_TAGS = ["FOMO_overcome", "FOMO_chased", "REVENGE_TRADING", "EARLY_CLOSE", "CLEAN_DAY"] as const
const KNOWN_COLORS = ["emerald", "orange", "red", "gray"] as const

interface SearchFilter {
  tagFilters: string[]
  colorFilters: string[]
  keyword: string | null
  pnlSign: "positive" | "negative" | null
}

interface SearchRequest {
  query: string
  trades: any[]
  journalEntries: any[]
}

function emptyFilter(): SearchFilter {
  return { tagFilters: [], colorFilters: [], keyword: null, pnlSign: null }
}

// Deterministic fallback parser used when no API key is configured or the
// Claude call fails — simple Czech/English keyword matching against the
// same fixed vocabulary Claude is asked to use, so behavior degrades
// gracefully rather than breaking search entirely.
function fallbackParseQuery(query: string): SearchFilter {
  const q = query.toLowerCase()
  const filter = emptyFilter()

  if (q.includes("revenge") || q.includes("pomst")) filter.tagFilters.push("REVENGE_TRADING")
  if (q.includes("fomo") && (q.includes("naskoč") || q.includes("chytil") || q.includes("podlehl"))) filter.tagFilters.push("FOMO_chased")
  if (q.includes("fomo") && (q.includes("ustál") || q.includes("ustal") || q.includes("zvládl") || q.includes("zvladl"))) filter.tagFilters.push("FOMO_overcome")
  if (q.includes("brzké") || q.includes("brzke") || q.includes("předčasn") || q.includes("predcasn")) filter.tagFilters.push("EARLY_CLOSE")
  if (q.includes("bezchyb") || q.includes("čistý den") || q.includes("cisty den") || q.includes("clean")) filter.tagFilters.push("CLEAN_DAY")

  if (q.includes("červen") || q.includes("cerven") || q.includes("red") || q.includes("porušil") || q.includes("porusil")) filter.colorFilters.push("red")
  if (q.includes("zelen") || q.includes("green") || q.includes("disciplinovan")) filter.colorFilters.push("emerald")
  if (q.includes("oranžov") || q.includes("oranzov") || q.includes("orange")) filter.colorFilters.push("orange")
  if (q.includes("šed") || q.includes("sed") || q.includes("bez obchod") || q.includes("gray") || q.includes("grey")) filter.colorFilters.push("gray")

  if (q.includes("ztrát") || q.includes("ztrat") || q.includes("loss") || q.includes("v minusu")) filter.pnlSign = "negative"
  if (q.includes("zisk") || q.includes("profit") || q.includes("v plusu")) filter.pnlSign = filter.pnlSign === "negative" ? null : "positive"

  // If nothing structured matched, treat the whole query as a free-text
  // keyword search across journal titles/content for that day.
  if (filter.tagFilters.length === 0 && filter.colorFilters.length === 0 && !filter.pnlSign) {
    filter.keyword = query.trim()
  }

  return filter
}

async function parseQueryWithClaude(query: string): Promise<SearchFilter> {
  const system = `Jsi parser vyhledávacích dotazů pro trading deník. Tvůj JEDINÝ úkol je převést dotaz uživatele na strukturovaný JSON filtr. NIKDY nevymýšlej data, data, čísla ani konkrétní dny - pouze rozpoznej, JAKÝ typ dne uživatel hledá.

Můžeš použít POUZE tyto hodnoty:
- tagFilters: podmnožina z [${KNOWN_TAGS.join(", ")}]
- colorFilters: podmnožina z [${KNOWN_COLORS.join(", ")}] (emerald=disciplína dodržena, orange=mírné porušení/bez signálu, red=revenge/porušený plán, gray=žádné obchody)
- keyword: volný text k fulltextovému vyhledání v deníku, nebo null
- pnlSign: "positive", "negative", nebo null

Odpověz POUZE validním JSON objektem s těmito 4 klíči, nic jiného (žádné markdown, žádné vysvětlení).`

  const msg = await getClient().messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    temperature: 0,
    system,
    messages: [{ role: "user", content: query }],
  })

  const text = msg.content[0].type === "text" ? msg.content[0].text : "{}"
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return fallbackParseQuery(query)

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      tagFilters: Array.isArray(parsed.tagFilters) ? parsed.tagFilters.filter((t: string) => KNOWN_TAGS.includes(t as any)) : [],
      colorFilters: Array.isArray(parsed.colorFilters) ? parsed.colorFilters.filter((c: string) => KNOWN_COLORS.includes(c as any)) : [],
      keyword: typeof parsed.keyword === "string" && parsed.keyword.trim() ? parsed.keyword.trim() : null,
      pnlSign: parsed.pnlSign === "positive" || parsed.pnlSign === "negative" ? parsed.pnlSign : null,
    }
  } catch {
    return fallbackParseQuery(query)
  }
}

function dayMatchesFilter(
  day: DisciplineDay,
  filter: SearchFilter,
  journalText: string,
  dayPnl: number | null,
): boolean {
  if (filter.tagFilters.length > 0 && !filter.tagFilters.some((t) => day.tags.includes(t))) return false
  if (filter.colorFilters.length > 0 && !filter.colorFilters.includes(day.color)) return false
  if (filter.pnlSign && dayPnl !== null) {
    if (filter.pnlSign === "positive" && dayPnl <= 0) return false
    if (filter.pnlSign === "negative" && dayPnl >= 0) return false
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase()
    if (!journalText.toLowerCase().includes(kw)) return false
  }
  return true
}

export async function POST(req: NextRequest) {
  try {
    let body: SearchRequest
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { query, trades, journalEntries } = body
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 })
    }

    const days = buildDisciplineMatrix(trades || [], journalEntries || [])

    const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY)
    let filter: SearchFilter
    let usingMockAI = false
    if (hasApiKey) {
      try {
        filter = await parseQueryWithClaude(query)
      } catch (e) {
        filter = fallbackParseQuery(query)
        usingMockAI = true
      }
    } else {
      filter = fallbackParseQuery(query)
      usingMockAI = true
    }

    // Build per-day text + P&L from the real journal entries / trades so
    // keyword and P&L-sign filters are grounded in actual content.
    const textByDay = new Map<string, string>()
    for (const j of journalEntries || []) {
      const key = (j?.date || "").toString().slice(0, 10)
      if (!key) continue
      const existing = textByDay.get(key) || ""
      textByDay.set(key, `${existing} ${j?.title || ""} ${j?.content || ""}`.trim())
    }
    const pnlByDay = new Map<string, number>()
    for (const t of trades || []) {
      const key = (t?.date || "").toString().slice(0, 10)
      if (!key) continue
      pnlByDay.set(key, (pnlByDay.get(key) || 0) + (Number(t?.pnl) || 0))
    }

    const matchedDays = days.filter((d) =>
      dayMatchesFilter(d, filter, textByDay.get(d.date) || "", pnlByDay.has(d.date) ? pnlByDay.get(d.date)! : null),
    )

    const matchedDates = matchedDays.map((d) => d.date)

    const summary =
      matchedDays.length === 0
        ? "Pro tento dotaz jsem nenašel žádný odpovídající den ve tvé historii."
        : `Nalezeno ${matchedDays.length} ${matchedDays.length === 1 ? "den" : matchedDays.length < 5 ? "dny" : "dní"} odpovídajících dotazu "${query}".`

    return NextResponse.json({
      matchedDates,
      matchedDays: matchedDays.map((d) => ({ date: d.date, color: d.color, score: d.score, reason: d.reason, tags: d.tags })),
      summary,
      filter,
      usingMockAI,
    })
  } catch (error: any) {
    console.error("❌ Journal search API error:", error)
    return NextResponse.json({ error: "Failed to search journal", details: error?.message || "Unknown error" }, { status: 500 })
  }
}
