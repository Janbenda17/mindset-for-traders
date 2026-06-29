import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

let anthropicInstance: Anthropic | null = null
function getClient() {
  if (anthropicInstance) return anthropicInstance
  anthropicInstance = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return anthropicInstance
}

// ── Demo data used when no real user data is available ────────────────────────

const DEMO_SCAN_DATA = {
  daysAnalyzed: 10,
  failLogs: [
    { date: "2025-06-20", category: "Revenge Trading",  severity: "high",   loss: 610, symbol: "XAU/USD" },
    { date: "2025-06-20", category: "FOMO Entry",       severity: "medium", loss: 420, symbol: "EUR/USD" },
    { date: "2025-06-22", category: "Overtrading",      severity: "medium", loss: 180, symbol: "GBP/USD" },
    { date: "2025-06-22", category: "Position Sizing",  severity: "medium", loss: 340, symbol: "BTC/USD" },
    { date: "2025-06-28", category: "Panic Exit",       severity: "low",    loss: 0,   symbol: "EUR/USD" },
  ],
  routines: [
    { date: "2025-06-20", completed: false, confidence: 3, notes: "špatný spánek, přeskočil meditaci" },
    { date: "2025-06-21", completed: true,  confidence: 7 },
    { date: "2025-06-22", completed: true,  confidence: 8 },
    { date: "2025-06-23", completed: true,  confidence: 9 },
    { date: "2025-06-24", completed: false, confidence: 4, notes: "únava, přeskočil breathing" },
    { date: "2025-06-25", completed: true,  confidence: 7 },
    { date: "2025-06-26", completed: true,  confidence: 8 },
    { date: "2025-06-27", completed: true,  confidence: 8 },
    { date: "2025-06-28", completed: true,  confidence: 7 },
    { date: "2025-06-29", completed: true,  confidence: 8 },
  ],
  trades: [
    { date: "2025-06-20", symbol: "XAU/USD", pnl: -610, followedPlan: false },
    { date: "2025-06-20", symbol: "EUR/USD", pnl: -420, followedPlan: false },
    { date: "2025-06-21", symbol: "EUR/USD", pnl: 340,  followedPlan: true  },
    { date: "2025-06-21", symbol: "GBP/USD", pnl: 180,  followedPlan: true  },
    { date: "2025-06-22", symbol: "GBP/USD", pnl: -180, followedPlan: false },
    { date: "2025-06-22", symbol: "BTC/USD", pnl: -340, followedPlan: false },
    { date: "2025-06-23", symbol: "EUR/USD", pnl: 520,  followedPlan: true  },
    { date: "2025-06-23", symbol: "XAU/USD", pnl: 210,  followedPlan: true  },
    { date: "2025-06-24", symbol: "EUR/USD", pnl: -90,  followedPlan: false },
    { date: "2025-06-25", symbol: "GBP/USD", pnl: 280,  followedPlan: true  },
    { date: "2025-06-26", symbol: "EUR/USD", pnl: 190,  followedPlan: true  },
    { date: "2025-06-27", symbol: "XAU/USD", pnl: 450,  followedPlan: true  },
    { date: "2025-06-28", symbol: "EUR/USD", pnl: 120,  followedPlan: true  },
    { date: "2025-06-29", symbol: "GBP/USD", pnl: 180,  followedPlan: true  },
  ],
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  let language = "cs"
  try {
    const body = await req.json()
    if (body?.language === "en") language = "en"
  } catch {}

  // ── Try to get real user data ──────────────────────────────────────────────
  let scanData = DEMO_SCAN_DATA
  let isLive = false

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    )

    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id

    if (userId) {
      const since = new Date(Date.now() - 10 * 86400_000).toISOString()

      const [{ data: trades }, { data: fails }, { data: mornings }] = await Promise.all([
        supabase.from("trade_records").select("created_at,symbol,pnl,followed_plan").eq("user_id", userId).gte("created_at", since).order("created_at"),
        supabase.from("fail_logs").select("created_at,category,severity,trade_loss").eq("user_id", userId).gte("created_at", since),
        supabase.from("morning_checks").select("created_at,completed,confidence_level").eq("user_id", userId).gte("created_at", since),
      ])

      const hasData = (trades?.length ?? 0) + (fails?.length ?? 0) + (mornings?.length ?? 0) > 0

      if (hasData) {
        scanData = {
          daysAnalyzed: 10,
          failLogs: (fails ?? []).map((f: any) => ({
            date: f.created_at?.slice(0, 10),
            category: f.category ?? "Unknown",
            severity: f.severity ?? "medium",
            loss: f.trade_loss ?? 0,
            symbol: "—",
          })),
          routines: (mornings ?? []).map((m: any) => ({
            date: m.created_at?.slice(0, 10),
            completed: m.completed ?? false,
            confidence: m.confidence_level ?? 5,
          })),
          trades: (trades ?? []).map((t: any) => ({
            date: t.created_at?.slice(0, 10),
            symbol: t.symbol ?? "—",
            pnl: t.pnl ?? 0,
            followedPlan: t.followed_plan ?? false,
          })),
        }
        isLive = true
      }
    }
  } catch {
    // Silently fall back to demo data
  }

  // ── Build context for Claude ───────────────────────────────────────────────

  const wins    = scanData.trades.filter((t) => t.pnl > 0)
  const losses  = scanData.trades.filter((t) => t.pnl < 0)
  const winRate = scanData.trades.length > 0
    ? Math.round((wins.length / scanData.trades.length) * 100)
    : 0
  const totalPnL    = scanData.trades.reduce((s, t) => s + t.pnl, 0)
  const totalLoss   = scanData.failLogs.reduce((s, f) => s + f.loss, 0)
  const routineDays = scanData.routines.filter((r) => r.completed).length
  const avgConfidence = scanData.routines.length > 0
    ? (scanData.routines.reduce((s, r) => s + r.confidence, 0) / scanData.routines.length).toFixed(1)
    : "—"
  const topCategory = Object.entries(
    scanData.failLogs.reduce((acc: Record<string, number>, f) => {
      acc[f.category] = (acc[f.category] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "žádné incidenty"

  const context = `
DATA ZA POSLEDNÍCH 10 DNÍ:
---
Obchody: ${scanData.trades.length} celkem | Win rate: ${winRate}% | Celkové PnL: ${totalPnL > 0 ? "+" : ""}$${totalPnL}
Vítězné obchody: ${wins.length} | Ztrátové: ${losses.length}
Fail log incidenty: ${scanData.failLogs.length} | Celková ztráta z incidentů: $${totalLoss}
Nejčastější chyba: ${topCategory}
Rutina dokončena: ${routineDays}/${scanData.routines.length} dní
Průměrná sebedůvěra ráno: ${avgConfidence}/10

FAIL LOGY:
${scanData.failLogs.map((f) => `- ${f.date}: ${f.category} [${f.severity}] ${f.loss > 0 ? `ztráta $${f.loss}` : ""}`).join("\n") || "žádné"}

TRADE PŘEHLED:
${scanData.trades.map((t) => `- ${t.date}: ${t.symbol} ${t.pnl > 0 ? "+" : ""}$${t.pnl} | Plán: ${t.followedPlan ? "✓" : "✗"}`).join("\n") || "žádné záznamy"}

RUTINY:
${scanData.routines.map((r) => `- ${r.date}: ${r.completed ? "✓" : "✗"} | Confidence: ${r.confidence}/10`).join("\n") || "žádné záznamy"}
`.trim()

  // ── Call Claude ────────────────────────────────────────────────────────────

  const isEnLang = language === "en"

  const systemPrompt = isEnLang
    ? `You are an elite trading psychologist. Based on 10 days of trading data you generate an accurate psychological profile of a trader.
You respond EXCLUSIVELY with clean JSON without markdown blocks, exactly according to the given structure.
Everything in English. Archetype name always in UPPERCASE ENGLISH.
Be brutally honest — that is the value for the trader.`
    : `Jsi elite trading psycholog. Na základě 10 dní obchodních dat vygeneruješ přesný psychologický profil tradera.
Odpovídáš VÝHRADNĚ čistým JSON bez markdown bloků, přesně podle zadané struktury.
Vše v češtině kromě technických termínů (archetype name vždy ANGLICKY VERZÁLKAMI).
Buď brutálně upřímný — to je hodnota pro tradera.`

  const userPrompt = isEnLang
    ? `Based on this data generate a trader identity profile as JSON:

${context}

Return exactly this JSON (fill in all fields):
{
  "archetypeCode": "2-3 chars + number, e.g. IS-91",
  "archetypeName": "ENGLISH NAME IN UPPERCASE, max 3 words",
  "archetypeTagline": "one dramatic sentence in English",
  "archetypeDescription": "3-4 sentences: what this trader does well, their weakness, their edge",
  "archetypeStats": [
    { "label": "Identity Strength", "value": "XX / 100" },
    { "label": "Archetype Rarity", "value": "Top X %" },
    { "label": "Edge Type", "value": "..." }
  ],
  "dnaAxes": [
    { "label": "Discipline",       "value": 0-100 },
    { "label": "Patience",         "value": 0-100 },
    { "label": "Risk Control",     "value": 0-100 },
    { "label": "Emotional Stability", "value": 0-100 },
    { "label": "Process",          "value": 0-100 },
    { "label": "Adaptability",     "value": 0-100 }
  ],
  "shadowPatterns": [
    {
      "name": "pattern name in English",
      "trigger": "specific situation when it activates",
      "frequency": "X× in 10 days / Every ...",
      "riskLevel": "Critical | High | Medium",
      "description": "1-2 sentences in English, brutally honest"
    }
  ],
  "behavioralFingerprint": [
    { "label": "...", "you": number, "avg": number, "unit": "% | × / month | ...", "invert": false/true }
  ],
  "evolution": [
    { "week": "W-5", "discipline": 0-100, "emotion": 0-100, "process": 0-100 },
    { "week": "W-4", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "W-3", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "W-2", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "W-1", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "Now", "discipline": ..., "emotion": ..., "process": ... }
  ],
  "manifesto": "trader's personal commitment in English, 8-12 lines, format: title\\n\\nsentences\\n→ rules\\n\\nclosing line"
}`
    : `Na základě těchto dat vygeneruj trader identity profil jako JSON:

${context}

Vrať přesně tento JSON (vyplň všechna pole):
{
  "archetypeCode": "2-3 znaky + číslo, např. IS-91",
  "archetypeName": "ANGLICKÝ NÁZEV VERZÁLKAMI, max 3 slova",
  "archetypeTagline": "jedna dramatická věta v češtině",
  "archetypeDescription": "3-4 věty: co tento trader dělá dobře, co je jeho slabina, jeho edge",
  "archetypeStats": [
    { "label": "Identity Strength", "value": "XX / 100" },
    { "label": "Archetype Rarity", "value": "Top X %" },
    { "label": "Edge Type", "value": "..." }
  ],
  "dnaAxes": [
    { "label": "Disciplína",       "value": 0-100 },
    { "label": "Trpělivost",       "value": 0-100 },
    { "label": "Risk Control",     "value": 0-100 },
    { "label": "Emoční stabilita", "value": 0-100 },
    { "label": "Proces",           "value": 0-100 },
    { "label": "Adaptabilita",     "value": 0-100 }
  ],
  "shadowPatterns": [
    {
      "name": "název vzorce anglicky",
      "trigger": "konkrétní situace kdy se aktivuje",
      "frequency": "X× za 10 dní / Každý ...",
      "riskLevel": "Kritické | Vysoké | Střední",
      "description": "1-2 věty česky, brutálně upřímně"
    }
  ],
  "behavioralFingerprint": [
    { "label": "...", "you": číslo, "avg": číslo, "unit": "% | × / měsíc | ...", "invert": false/true }
  ],
  "evolution": [
    { "week": "T-5", "discipline": 0-100, "emotion": 0-100, "process": 0-100 },
    { "week": "T-4", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "T-3", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "T-2", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "T-1", "discipline": ..., "emotion": ..., "process": ... },
    { "week": "Nyní","discipline": ..., "emotion": ..., "process": ... }
  ],
  "manifesto": "osobní závazek tradera v češtině, 8-12 řádků, formát: nadpis\\n\\nvěty\\n→ pravidla\\n\\nzávěrečná věta"
}`

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text.trim()

  // Strip possible markdown fences
  const jsonStr = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "") : raw

  let profile: Record<string, unknown>
  try {
    profile = JSON.parse(jsonStr)
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  return NextResponse.json({
    profile,
    isLive,
    scanSummary: {
      daysAnalyzed: scanData.daysAnalyzed,
      trades: scanData.trades.length,
      failLogs: scanData.failLogs.length,
      routines: scanData.routines.filter((r) => r.completed).length,
      totalRoutines: scanData.routines.length,
      winRate,
      topCategory,
    },
  })
}
