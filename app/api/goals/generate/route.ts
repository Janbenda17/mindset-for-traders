import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const today = new Date()

    // Weekly: Monday to Sunday
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    // Monthly: first to last day of current month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `Jsi elitní trading coach a psycholog se 20 lety zkušeností. 
Specializuješ se na mentální odolnost, disciplínu a systematické obchodování. 
Tvoříš konkrétní, inspirující a dosažitelné cíle které skutečně mění obchodníky.
Odpovídáš VŽDY pouze čistým JSON bez jakéhokoli markdown nebo textu navíc.`,
      prompt: `Vygeneruj jeden silný týdenní a jeden ambiciózní měsíční trading goal.

Aktuální týden: ${weekStart.toLocaleDateString('cs-CZ')} – ${weekEnd.toLocaleDateString('cs-CZ')}
Aktuální měsíc: ${monthStart.toLocaleDateString('cs-CZ')} – ${monthEnd.toLocaleDateString('cs-CZ')}

Pravidla:
- Cíle musí být SMART: konkrétní čísla, procenta, nebo počty dní
- Střídej různé oblasti: disciplína, risk management, win rate, psychologie, konzistence
- Milníky = jasné kroky jak cíle dosáhnout, ne jen popis cíle
- Piš inspirativně, jako by šlo o životní změnu

Příklady kvalitních cílů:
- "Dosáhnout win rate 65 % – vstupovat pouze do A+ setupů s R:R minimálně 1:2"
- "Nula revenge trades po ztrátě – dodržet 30minutovou pauzu po každé ztrátové pozici"
- "Snížit průměrnou ztrátu na trade o 20 % – nikdy neriskovat více než 1 % kapitálu"

Odpověz POUZE tímto JSON:
{
  "weeklyGoal": {
    "goal": "konkrétní cíl s čísly (max 130 znaků)",
    "focusArea": "Disciplína | Risk Management | Psychologie | Konzistence | Win Rate",
    "why": "Proč je tento cíl důležitý (1 věta)",
    "milestones": ["konkrétní krok 1", "konkrétní krok 2", "konkrétní krok 3"],
    "startDate": "${weekStart.toISOString().split('T')[0]}",
    "endDate": "${weekEnd.toISOString().split('T')[0]}"
  },
  "monthlyGoal": {
    "goal": "ambiciózní cíl s čísly (max 130 znaků)",
    "focusArea": "Disciplína | Risk Management | Psychologie | Konzistence | Win Rate",
    "why": "Proč je tento cíl důležitý (1 věta)",
    "milestones": ["konkrétní krok 1", "konkrétní krok 2", "konkrétní krok 3", "konkrétní krok 4"],
    "startDate": "${monthStart.toISOString().split('T')[0]}",
    "endDate": "${monthEnd.toISOString().split('T')[0]}"
  }
}`
    })

    let parsed: any
    try {
      parsed = JSON.parse(result.text.trim())
    } catch {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('AI nevrátilo validní JSON')
      parsed = JSON.parse(jsonMatch[0])
    }

    const goals = [
      {
        id: `weekly-${Date.now()}`,
        period: 'weekly',
        goal: parsed.weeklyGoal.goal,
        focusArea: parsed.weeklyGoal.focusArea,
        why: parsed.weeklyGoal.why,
        startDate: parsed.weeklyGoal.startDate,
        endDate: parsed.weeklyGoal.endDate,
        milestones: parsed.weeklyGoal.milestones,
        aiGenerated: true,
        createdAt: new Date().toISOString()
      },
      {
        id: `monthly-${Date.now()}`,
        period: 'monthly',
        goal: parsed.monthlyGoal.goal,
        focusArea: parsed.monthlyGoal.focusArea,
        why: parsed.monthlyGoal.why,
        startDate: parsed.monthlyGoal.startDate,
        endDate: parsed.monthlyGoal.endDate,
        milestones: parsed.monthlyGoal.milestones,
        aiGenerated: true,
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({ success: true, goals })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Neznámá chyba'
    console.error('[v0] Goals generation error:', errorMsg)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
