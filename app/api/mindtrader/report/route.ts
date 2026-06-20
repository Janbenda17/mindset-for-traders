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

  // Chování a vzorce
  report.push(`\n## 🔍 Chování a vzorce`)

  const revengeTrades = trades.filter((t) => t.isRevengeTrade).length
  if (revengeTrades > 0) {
    report.push(`- ⚠️ ${revengeTrades} obchodů identifikováno jako revenge trading`)
    report.push(`- **Doporučení:** Zaveď pravidlo "2 ztráty po sobě = konec dne"`)
  } else {
    report.push(`- ✅ Žádné revenge obchody detekovány`)
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

  report.push(`\n---\n`)
  report.push(`*Tento report byl vygenerován MindTrader AI na základě tvých trading dat.*`)

  return report.join("\n")
}
