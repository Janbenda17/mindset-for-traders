// Self-report onboarding quiz engine — a self-assessment version of the same
// behavioral categories the real trade-data engines detect automatically
// (see lib/discipline-matrix.ts and lib/daily-summary.ts): revenge trading,
// FOMO chasing, early close, oversizing after a loss, overtrading, and plan
// adherence. Deliberately reuses the same 0-100 scale and the same 80/50
// color thresholds as buildDailySummary's discipline score, so a brand new
// user's self-reported profile speaks the same language as the real-data
// profile they'll see later once trades start flowing in.
//
// This is NOT a separate "personality quiz" scoring system — it is the same
// rubric, just fed self-reported frequency instead of trade timestamps/P&L.

export type SelfReportColor = 'emerald' | 'orange' | 'red'

export interface SelfReportQuestion {
  id: string
  textCz: string
  textEn: string
  // true = the described behavior is GOOD (e.g. "sticking to your plan"),
  // so higher frequency = higher score. false = the described behavior is
  // BAD (e.g. "revenge trading"), so higher frequency = lower score.
  reversed: boolean
  diagnosisCz: string
  diagnosisEn: string
}

// Answer options are identical for every question: a 4-point frequency
// scale. Index 0 = "Nikdy/Never" ... index 3 = "Skoro pořád/Almost always".
export const SELF_REPORT_OPTIONS: { labelCz: string; labelEn: string }[] = [
  { labelCz: 'Nikdy', labelEn: 'Never' },
  { labelCz: 'Občas', labelEn: 'Sometimes' },
  { labelCz: 'Často', labelEn: 'Often' },
  { labelCz: 'Skoro pořád', labelEn: 'Almost always' },
]

export const SELF_REPORT_QUESTIONS: SelfReportQuestion[] = [
  {
    id: 'revenge',
    textCz: 'Po ztrátě rychle otevřeš další obchod, abys to hned dohnal?',
    textEn: 'After a loss, do you quickly open another trade to win it back right away?',
    reversed: false,
    diagnosisCz:
      'Tvým největším nepřítelem není trh — je to rychlost, s jakou se vrátíš do trhu hned po ztrátě, abys to "dohnal". Přesně tahle reakce ničí účty víc než špatná analýza.',
    diagnosisEn:
      "Your biggest enemy isn't the market — it's how fast you jump back in right after a loss to \"win it back.\" That single reaction destroys more accounts than bad analysis ever does.",
  },
  {
    id: 'fomo',
    textCz: 'Naskočíš do pohybu, který už běží, protože se bojíš, že o něj přijdeš?',
    textEn: "Do you jump into a move that's already running because you're afraid of missing it?",
    reversed: false,
    diagnosisCz:
      'Neztrácíš peníze na špatných setupech. Ztrácíš je na pohybech, které už proběhly a do kterých jsi naskočil ze strachu, že ti utečou.',
    diagnosisEn:
      "You're not losing money on bad setups. You're losing it on moves that already happened, which you chased because you were afraid to miss out.",
  },
  {
    id: 'early_close',
    textCz: 'Zavíráš ziskovou pozici moc brzo, protože se bojíš, že se zisk otočí?',
    textEn: "Do you close a winning position too early because you're afraid it'll turn against you?",
    reversed: false,
    diagnosisCz:
      'Bojíš se vlastního zisku víc než ztráty — zavíráš pozice dřív, než měly, protože nevěříš, že si je necháš doběhnout. Tohle tě stojí víc, než tušíš.',
    diagnosisEn:
      "You're more afraid of your own profit than of a loss — you close positions early because you don't trust yourself to let them run. It's costing you more than you realize.",
  },
  {
    id: 'oversizing',
    textCz: 'Po ztrátě zvětšíš velikost dalšího obchodu, abys to rychleji vyrovnal?',
    textEn: 'After a loss, do you increase your position size on the next trade to make it back faster?',
    reversed: false,
    diagnosisCz:
      'Po ztrátě nezvětšuješ svoji disciplínu, zvětšuješ velikost pozice — a tím i riziko, že jedna špatná série smaže týdny práce.',
    diagnosisEn:
      "After a loss, you don't increase your discipline — you increase your position size, and with it the risk that one bad streak wipes out weeks of work.",
  },
  {
    id: 'overtrading',
    textCz: 'Otevřeš víc obchodů, než jsi na den plánoval, protože se ti nedaří přestat?',
    textEn: "Do you open more trades than you planned for the day because you can't stop?",
    reversed: false,
    diagnosisCz:
      'Neumíš přestat, i když víš, že bys měl. Otevíráš víc obchodů, než plánuješ, a to tě dřív nebo později bude stát účet.',
    diagnosisEn:
      "You can't stop even when you know you should. You keep opening more trades than planned, and sooner or later that will cost you the account.",
  },
  {
    id: 'plan_adherence',
    textCz: 'Držíš se svého vstupního a výstupního plánu, i když se cena obrátí proti tobě?',
    textEn: 'Do you stick to your entry and exit plan even when the price turns against you?',
    reversed: true,
    diagnosisCz:
      'Máš plán — jen se ho nedržíš, když se to nejvíc počítá. Cena se obrátí a plán jde stranou. Přesně tenhle moment rozhoduje o dlouhodobém výsledku.',
    diagnosisEn:
      'You have a plan — you just don\'t follow it when it matters most. The price turns, and the plan goes out the window. That exact moment is what decides your long-term results.',
  },
]

export interface SelfReportProfile {
  score: number
  label: string
  labelEn: string
  color: SelfReportColor
  diagnosisCz: string
  diagnosisEn: string
  categoryScores: number[]
}

const POINTS_FORWARD = [100, 65, 35, 0]
const POINTS_REVERSED = [0, 35, 65, 100]

export function scoreSelfReport(answers: number[]): SelfReportProfile {
  const categoryScores = SELF_REPORT_QUESTIONS.map((q, i) => {
    const ans = answers[i] ?? 1
    const points = q.reversed ? POINTS_REVERSED : POINTS_FORWARD
    return points[ans] ?? 50
  })

  const score = Math.round(categoryScores.reduce((s, v) => s + v, 0) / categoryScores.length)

  let label: string
  let labelEn: string
  let color: SelfReportColor
  if (score >= 80) {
    label = 'Excelentní disciplína'
    labelEn = 'Excellent discipline'
    color = 'emerald'
  } else if (score >= 50) {
    label = 'Smíšený vzorec'
    labelEn = 'Mixed pattern'
    color = 'orange'
  } else {
    label = 'Hazard'
    labelEn = 'High risk'
    color = 'red'
  }

  let worstIdx = 0
  let worstVal = categoryScores[0]
  categoryScores.forEach((v, i) => {
    if (v < worstVal) {
      worstVal = v
      worstIdx = i
    }
  })
  const worstQ = SELF_REPORT_QUESTIONS[worstIdx]

  return {
    score,
    label,
    labelEn,
    color,
    diagnosisCz: worstQ.diagnosisCz,
    diagnosisEn: worstQ.diagnosisEn,
    categoryScores,
  }
}
