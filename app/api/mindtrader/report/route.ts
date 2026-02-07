import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { trades, journals, moodHistory, period } = await request.json()

    const report = generateReport(trades, journals, moodHistory, period)

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Nepodařilo se vygenerovat report" }, { status: 500 })
  }
}

function generateReport(trades: any[], journals: any[], moodHistory: any[], period: string) {
  const report = []

  report.push(`# MindTrader AI ${period === "weekly" ? "Týdenní" : "Měsíční"} Report`)
  report.push(`Generated: ${new Date().toLocaleDateString()}`)
  report.push(`\n---\n`)

  // Přehled výkonu
  report.push(`## 📊 Přehled výkonu`)
  const totalTrades = trades.length
  const winningTrades = trades.filter((t) => (t.pnl || 0) > 0).length
  const losingTrades = trades.filter((t) => (t.pnl || 0) < 0).length
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  report.push(`- **Celkem obchodů:** ${totalTrades}`)
  report.push(`- **Vyhrané obchody:** ${winningTrades}`)
  report.push(`- **Prohraté obchody:** ${losingTrades}`)
  report.push(`- **Úspěšnost:** ${winRate.toFixed(1)}%`)
  report.push(`- **Celkem P&L:** ${totalPnL.toFixed(2)}`)

  // Psychologické poznatky
  report.push(`\n## 🧠 Psychologické poznatky`)
  const avgMood = moodHistory.reduce((sum, m) => sum + m.mood, 0) / (moodHistory.length || 1)
  const avgConfidence = moodHistory.reduce((sum, m) => sum + m.confidence, 0) / (moodHistory.length || 1)
  const avgStress = moodHistory.reduce((sum, m) => sum + m.stress, 0) / (moodHistory.length || 1)

  report.push(`- **Průměrná nálada:** ${avgMood.toFixed(1)}/10`)
  report.push(`- **Průměrná sebevědomost:** ${avgConfidence.toFixed(1)}/10`)
  report.push(`- **Průměrný stres:** ${avgStress.toFixed(1)}/10`)

  // Chování a vzorce
  report.push(`\n## 🔍 Chování a vzorce`)

  if (avgMood < 6 && winRate < 50) {
    report.push(`- ⚠️ Nízká nálada koreluje s nižší úspěšností`)
    report.push(`- **Doporučení:** Zaměř se na řízení nálady před obchodováním`)
  }

  if (avgStress > 7) {
    report.push(`- ⚠️ Vysoké úrovně stresu detekované po dobu celého období`)
    report.push(`- **Doporučení:** Implementuj techniky na snížení stresu`)
  }

  // Poznatky z deníku
  if (journals.length > 0) {
    report.push(`\n## 📝 Aktivita deníku`)
    report.push(`- **Celkem záznamů v deníku:** ${journals.length}`)
    const tradeEntries = journals.filter((j) => j.type === "trade").length
    const reflectionEntries = journals.filter((j) => j.type === "journal").length
    report.push(`- **Záznamy o obchodech:** ${tradeEntries}`)
    report.push(`- **Záznamy zamyšlení:** ${reflectionEntries}`)
  }

  // Plán činnosti
  report.push(`\n## 🎯 Plán činnosti pro další období`)
  if (winRate < 50) {
    report.push(`1. Sniž frekvenci obchodování - zaměř se pouze na nejlepší setupy`)
    report.push(`2. Přezkoumat a aktualizovat tvůj trading plán`)
    report.push(`3. Procvičuj paper trading abys znovu vybudoval sebevědomost`)
  } else if (winRate >= 70) {
    report.push(`1. Udržuj stávající disciplínu - funguje!`)
    report.push(`2. Dokumentuj tvůj proces pro konzistenci`)
    report.push(`3. Zvažuj postupné zvýšení velikosti pozice`)
  } else {
    report.push(`1. Pokračuj stávajícím přístupem s drobným vylepšením`)
    report.push(`2. Zaměř se na risk management a sizing pozic`)
    report.push(`3. Vést podrobné deníky obchodů`)
  }

  if (avgMood < 6) {
    report.push(`4. Nastav v prioritu mentální zdraví a pohodu`)
    report.push(`5. Zvažuj konzultaci s trading psychologem`)
  }

  report.push(`\n---\n`)
  report.push(`*Tento report byl vygenerován MindTrader AI na základě tvých trading dat a psychologických metrik.*`)

  return report.join("\n")
}
