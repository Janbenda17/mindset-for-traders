import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { xai } from '@ai-sdk/xai'

export async function POST(request: NextRequest) {
  try {
    // Demo neúspěšné trades - v reálné aplikaci by se načítaly z MT4 databáze
    const demoFailLogs = [
      {
        symbol: 'EURUSD',
        entry: 1.0850,
        exit: 1.0820,
        loss: 150,
        timeInTrade: '45 minut'
      },
      {
        symbol: 'GBPUSD',
        entry: 1.2650,
        exit: 1.2600,
        loss: 250,
        timeInTrade: '2 hodiny'
      }
    ]

    const tradesText = demoFailLogs.map(t => 
      `${t.symbol}: Entry ${t.entry} → Exit ${t.exit} | Ztráta: $${t.loss} | Doba: ${t.timeInTrade}`
    ).join('\n')

    const today = new Date().toISOString().split('T')[0]

    const result = await generateText({
      model: xai('grok-4'),
      system: `Jsi trading psycholog a analytik se specializací na analýzu chyb v obchodování.
Tvé analýzy jsou důkladné, konkrétní a vedou k reálnému zlepšení.
Vždy hledáš opravdovou příčinu, ne jen povrchní symptomy.
Odpovídáš POUZE čistým JSON bez markdown.`,
      prompt: `Analyzuj tyto neúspěšné trades dnešního dne a vytvoř hlubokou analýzu pro každý:

Datum: ${new Date(today).toLocaleDateString('cs-CZ')}

Neúspěšné trades:
${tradesText}

Pro každý trade poskytni:
1. **Kořenová příčina** - co SKUTEČNĚ šlo špatně (ne jen "špatný entry")
2. **Lekce** - co se z toho naučit do budoucna
3. **Akční plán** - konkrétní preventivní opatření

Možné příčiny (inspirace, ne omezení):
- Předčasný vstup bez potvrzení
- Porušení risk managementu (příliš velká pozice)
- Revenge trading po předchozí ztrátě
- Obchodování v nevhodnou dobu (nízká volatilita, novinky)
- Emocionální rozhodování místo podle plánu
- Ignorování stop loss signálů

Odpověz POUZE tímto JSON:
{
  "logs": [
    {
      "title": "SYMBOL + stručný popis problému (max 80 znaků)",
      "rootCause": "Hlavní příčina selhání - konkrétně co se stalo",
      "category": "Entry Error | Exit Error | Risk Management | Emotional | Timing",
      "lessonLearned": "Klíčová lekce - co si z toho odnést",
      "actionPlan": "3 konkrétní kroky jak tomu příště zabránit",
      "severity": "high | medium | low"
    }
  ]
}

Každý fail log musí být unikátní analýza konkrétního tradu, ne obecné fráze.`
    })

    let parsed: any
    try {
      parsed = JSON.parse(result.text.trim())
    } catch {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('AI nevrátilo validní JSON')
      parsed = JSON.parse(jsonMatch[0])
    }

    if (!parsed?.logs) {
      throw new Error('AI odpověď nemá očekávaný formát')
    }

    const logs = parsed.logs.map((log: any, i: number) => ({
      id: `fail-${Date.now()}-${i}`,
      date: today,
      title: log.title || `${demoFailLogs[i].symbol} - Neanalyzováno`,
      rootCause: log.rootCause || 'Příčina nebyla určena',
      category: log.category || 'Other',
      actionPlan: log.actionPlan || 'Zlepšit analýzu před vstupem',
      lessonLearned: log.lessonLearned || 'Dodržovat obchodní plán',
      severity: log.severity || 'medium',
      trade: demoFailLogs[i],
      aiGenerated: true
    }))

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Neznámá chyba'
    console.error('[v0] Fail log generation error:', errorMsg)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
