import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { trades, journals, moodHistory, readinessFactors } = await request.json()

    const insights = generateInsights(trades, journals, moodHistory, readinessFactors)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

function generateInsights(trades: any[], journals: any[], moodHistory: any[], readinessFactors: any) {
  const insights = []

  const totalTrades = trades?.length || 0
  const winningTrades = trades?.filter((t: any) => (t.pnl || 0) > 0).length || 0
  const losingTrades = trades?.filter((t: any) => (t.pnl || 0) < 0).length || 0
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  const totalPnL = trades?.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) || 0

  // Revenge trades detection
  const revengeTrades = trades?.filter((t: any) => t.isRevengeTrade).length || 0
  const revengeRate = totalTrades > 0 ? (revengeTrades / totalTrades) * 100 : 0

  // High stress trades
  const highStressTrades = trades?.filter((t: any) => (t.stress || 0) >= 7).length || 0

  // ---- CO SE DEJE ----
  insights.push(`Co se deje:`)
  if (totalTrades === 0) {
    insights.push(`Zatim nemas zadne zaznamenane obchody. Zacni zaznamenavat pro detailni analyzu.`)
  } else {
    insights.push(`Za poslednich ${totalTrades} obchodu mas win rate ${winRate.toFixed(1)}% (${winningTrades} viteznych, ${losingTrades} ztratovych). Celkove P&L: $${totalPnL.toFixed(0)}.`)
  }

  // ---- PROC SE TO DEJE ----
  if (totalTrades > 0) {
    insights.push(`\nProc se to deje:`)

    if (revengeTrades > 0) {
      insights.push(`${revengeTrades} z ${totalTrades} obchodu (${revengeRate.toFixed(0)}%) bylo revenge tradu - obchody po ztrate bez planu. Toto je tvuj nejvetsi leak.`)
    }

    if (highStressTrades > 0) {
      insights.push(`${highStressTrades} obchodu bylo otevreno pri stresu 7+/10. Vysoko-stresove obchody maji statisticky nizsi win rate.`)
    }
  }

  // ---- CO UDELAT ----
  insights.push(`\nCo udelat:`)
  if (totalTrades === 0) {
    insights.push(`- Zaznamenej svuj prvni obchod vcetne emoci pred/behem/po`)
    insights.push(`- Vyplnuj Ranni Kontrolu kazdy den pred tradingem`)
    insights.push(`- Nastav si max pocet obchodu na den (doporuceni: 3)`)
  } else if (winRate < 50) {
    insights.push(`- Sniz pocet obchodu - kvalita nad kvantitu. Max 2-3 denne.`)
    insights.push(`- Po kazde ztrate povinná 15min pauza - zadne vyjimky`)
    if (revengeTrades > 0) {
      insights.push(`- Eliminuj revenge trading (${revengeTrades} pripadu): Po 2 ztratach = konec dne`)
    }
    insights.push(`- Pred kazdym obchodem ohodnot setup 1-10. Vstupuj jen pri 8+.`)
  } else {
    insights.push(`- Win rate ${winRate.toFixed(1)}% je solidni. Udrzuj soucasny pristup.`)
    insights.push(`- Zaznamenavej CO presne funguje - ktere setupy, v jakem case, pri jake nalade`)
    insights.push(`- Nezvysuj risk - konzistence > agrese`)
    if (highStressTrades > 0) {
      insights.push(`- Eliminuj ${highStressTrades} vysoko-stresovych obchodu: Netraduj pri stresu 7+/10`)
    }
  }

  return insights.join("\n")
}
