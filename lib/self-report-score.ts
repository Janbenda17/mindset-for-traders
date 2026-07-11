// Self-report onboarding quiz engine — a self-assessment version of the same
// behavioral categories the real trade-data engines detect automatically
// (see lib/discipline-matrix.ts and lib/daily-summary.ts): revenge trading,
// FOMO chasing, early close, oversizing after a loss, overtrading, and plan
// adherence. Reuses the same 0-100 scale and the same 80/50 color thresholds
// as buildDailySummary's discipline score, so a brand new user's
// self-reported profile speaks the same language as the real-data profile
// they'll see later once trades start flowing in.
//
// Diagnosis text is intentionally NOT a single generic sentence per
// category. Each of the 6 scored categories carries two severity-scaled
// variants (severe / moderate), a short "strength" line for when it's the
// trader's best-scoring category, and a one-line "secondary pattern"
// callout. On top of that, 3 unscored style/trait questions (holding time,
// position-size consistency, decision basis) classify a trader archetype
// ("Disciplined Swing Trader", "Impulsive Scalper", ...) and add a
// style-contextualized insight line, so the final read is a multi-part
// profile rather than one generic sentence.

export type SelfReportColor = 'emerald' | 'orange' | 'red'

interface Bilingual {
  cz: string
  en: string
}

export interface SelfReportQuestion {
  id: string
  textCz: string
  textEn: string
  // true = the described behavior is GOOD (e.g. "sticking to your plan"),
  // so higher frequency = higher score. false = the described behavior is
  // BAD (e.g. "revenge trading"), so higher frequency = lower score.
  reversed: boolean
  severe: Bilingual // shown when this category scores at the very bottom (0)
  moderate: Bilingual // shown when this category scores mildly bad (35)
  secondary: Bilingual // short one-liner used when this is the #2 weakest category
  strength: Bilingual // short one-liner used when this is the trader's best category
}

// Answer options for the 6 scored questions: identical 4-point frequency
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
    severe: {
      cz: 'Tvůj hlavní problém není špatná analýza trhu — je to rychlost, s jakou se vrátíš do trhu hned po ztrátě, abys to "dohnal". Tohle přestává být o strategii a stává se to o tom, že ztráta ti bere schopnost počkat na další čistý setup. Přesně tahle reakce dokáže za pár minut smazat to, na čem jsi stavěl celé týdny.',
      en: "Your main problem isn't bad market analysis — it's how fast you go back into the market right after a loss to \"win it back.\" At that point it stops being about strategy and becomes about the loss taking away your ability to wait for the next clean setup. That exact reaction can wipe out weeks of work in a few minutes.",
    },
    moderate: {
      cz: 'Není to u tebe každodenní vzorec, ale občas po ztrátě skočíš zpátky do trhu rychleji, než bys měl. To je přesně ten moment, kdy se dá zastavit, než se z jedné špatné ztráty stane série špatných ztrát — a právě tady se pozná, jestli máš proces, nebo jen štěstí.',
      en: "It's not a daily pattern for you, but sometimes you jump back into the market faster than you should after a loss. That's the exact moment where you can still stop it before one bad loss becomes a losing streak — and it's exactly where you find out whether you have a process or just luck.",
    },
    secondary: {
      cz: 'K tomu se přidává sklon vracet se do trhu rychleji, než je zdravé, hned po ztrátě.',
      en: 'On top of that, you tend to re-enter the market faster than is healthy right after a loss.',
    },
    strength: {
      cz: 'Jedna věc ti jde fakt dobře: po ztrátě neděláš unáhlené rozhodnutí a nevracíš se do trhu, dokud nejsi připravený. To je přesně ta disciplína, která odlišuje dlouhodobě úspěšné obchodníky.',
      en: "One thing you genuinely do well: after a loss you don't rush back in until you're actually ready. That's exactly the kind of discipline that separates traders who last from those who don't.",
    },
  },
  {
    id: 'fomo',
    textCz: 'Naskočíš do pohybu, který už běží, protože se bojíš, že o něj přijdeš?',
    textEn: "Do you jump into a move that's already running because you're afraid of missing it?",
    reversed: false,
    severe: {
      cz: 'Neztrácíš peníze na špatných setupech — ztrácíš je na pohybech, které už proběhly a do kterých jsi naskočil ze strachu, že ti utečou. Vstupuješ pozdě, na vrcholu emocí ostatních, ne na začátku vlastní analýzy. Trh tě nepřipravuje o peníze, ty mu je sám dáváš.',
      en: "You're not losing money on bad setups — you're losing it on moves that already happened, which you chased out of fear of missing out. You're entering late, at the peak of everyone else's emotion, not at the start of your own analysis. The market isn't taking your money, you're handing it over.",
    },
    moderate: {
      cz: 'Čas od času naskočíš do rozjetého pohybu, protože se bojíš, že ti uteče — zatím to není hlavní zdroj tvých ztrát, ale je to přesně ten typ chyby, který se s únavou nebo stresem zhoršuje.',
      en: "Every now and then you jump into a move that's already running because you're afraid to miss it — it's not your main source of losses yet, but it's exactly the kind of mistake that gets worse under fatigue or stress.",
    },
    secondary: {
      cz: 'Vidíš u sebe i sklon naskakovat do pohybů, které už běží, ze strachu, že o ně přijdeš.',
      en: 'You also show a tendency to chase moves that are already running, out of fear of missing out.',
    },
    strength: {
      cz: 'FOMO tě netahá tam, kam nepatříš — počkáš si na svůj vlastní setup, i když se kolem tebe trh rozjede bez tebe. To je vzácná forma trpělivosti.',
      en: "FOMO doesn't pull you where you don't belong — you wait for your own setup even when the market runs without you. That's a rare kind of patience.",
    },
  },
  {
    id: 'early_close',
    textCz: 'Zavíráš ziskovou pozici moc brzo, protože se bojíš, že se zisk otočí?',
    textEn: "Do you close a winning position too early because you're afraid it'll turn against you?",
    reversed: false,
    severe: {
      cz: 'Bojíš se vlastního zisku víc než ztráty. Zavíráš pozice dřív, než měly, protože nevěříš, že si je necháš doběhnout — a to tě systematicky připravuje o tu část zisku, kvůli které má obchodování vůbec smysl. Tvůj risk management možná funguje, ale tvůj profit management ti utíká mezi prsty.',
      en: "You're more afraid of your own profit than of a loss. You close positions early because you don't trust yourself to let them run — and that's systematically costing you the part of the profit that makes trading worthwhile in the first place. Your risk management might be fine, but your profit management is slipping through your fingers.",
    },
    moderate: {
      cz: 'Někdy zavřeš zisk dřív, než jsi plánoval, protože tě přepadne strach, že se otočí. Malý efekt na jednom obchodě, ale sečteno za měsíc to dokáže ukrojit citelnou část tvého výsledku.',
      en: "Sometimes you close a profit earlier than planned because you get scared it'll turn. Small effect on a single trade, but summed over a month it can eat a noticeable chunk of your result.",
    },
    secondary: {
      cz: 'Taky se u tebe objevuje sklon zavírat zisky moc brzo ze strachu, že se otočí.',
      en: 'You also show a tendency to close profits too early out of fear they will reverse.',
    },
    strength: {
      cz: 'Umíš nechat zisk běžet, i když je to psychicky těžké. To je přesně ta dovednost, která z dobrého tradera dělá zisková tradera.',
      en: "You know how to let a winner run, even though it's psychologically hard. That's exactly the skill that turns a good trader into a profitable one.",
    },
  },
  {
    id: 'oversizing',
    textCz: 'Po ztrátě zvětšíš velikost dalšího obchodu, abys to rychleji vyrovnal?',
    textEn: 'After a loss, do you increase your position size on the next trade to make it back faster?',
    reversed: false,
    severe: {
      cz: 'Po ztrátě nezvětšuješ svoji disciplínu, zvětšuješ velikost pozice — a s ní i riziko, že jedna špatná série smaže týdny nebo měsíce práce najednou. Tohle je jeden z nejrychlejších způsobů, jak vyhodit funkční účet, protože matematika velikosti pozice pracuje proti tobě přesně v momentě, kdy jsi nejvíc zranitelný.',
      en: "After a loss, you don't increase your discipline — you increase your position size, and with it the risk that one bad streak wipes out weeks or months of work at once. This is one of the fastest ways to blow up an otherwise working account, because position-size math works against you exactly when you're most vulnerable.",
    },
    moderate: {
      cz: 'Občas si po ztrátě vezmeš o něco větší pozici, abys to dohnal rychleji. Zatím to nejsou dramatické skoky, ale je to signál, že rozhodování o velikosti pozice u tebe někdy řídí emoce, ne plán.',
      en: 'Occasionally you take a somewhat larger position after a loss to make it back faster. Not dramatic jumps yet, but it signals that your position sizing is sometimes driven by emotion rather than plan.',
    },
    secondary: {
      cz: 'Po ztrátě máš i sklon zvětšovat velikost dalšího obchodu, což zvyšuje riziko přesně v nejhorší chvíli.',
      en: 'You also tend to increase your size after a loss, which raises risk at exactly the worst moment.',
    },
    strength: {
      cz: 'Velikost pozice ti po ztrátě zůstává stabilní — neřídíš risk emocemi. Tohle je jeden z nejsilnějších ochranných mechanismů, jaké trader může mít.',
      en: "Your position size stays stable after a loss — you don't let emotion drive your risk. This is one of the strongest protective mechanisms a trader can have.",
    },
  },
  {
    id: 'overtrading',
    textCz: 'Otevřeš víc obchodů, než jsi na den plánoval, protože se ti nedaří přestat?',
    textEn: "Do you open more trades than you planned for the day because you can't stop?",
    reversed: false,
    severe: {
      cz: 'Neumíš přestat, i když víš, že bys měl. Otevíráš víc obchodů, než plánuješ, a každý další obchod nad rámec plánu má statisticky horší kvalitu než ty první — protože už nevybíráš nejlepší setupy, ale cokoliv, co ti dá záminku zůstat u obrazovky. Tohle dřív nebo později bude stát účet.',
      en: "You can't stop even when you know you should. You open more trades than planned, and every trade beyond your plan is statistically worse than the first ones — because you're no longer picking the best setups, just anything that gives you an excuse to stay at the screen. Sooner or later, this will cost you the account.",
    },
    moderate: {
      cz: 'Někdy otevřeš víc obchodů, než sis na den naplánoval. Zatím to nevypadá jako nekontrolovaný vzorec, ale stojí za to si všímat, kdy přesně se to stává — obvykle je to signál nudy nebo frustrace, ne příležitosti.',
      en: "Sometimes you open more trades than you planned for the day. It doesn't look like an uncontrolled pattern yet, but it's worth noticing exactly when it happens — usually it's a signal of boredom or frustration, not opportunity.",
    },
    secondary: {
      cz: 'Objevuje se u tebe i sklon otevírat víc obchodů, než sis naplánoval, protože se ti nedaří přestat.',
      en: "You also show a tendency to open more trades than planned because you can't stop.",
    },
    strength: {
      cz: 'Držíš se svého plánovaného počtu obchodů, i když se ti nabízí pokušení otevřít další. To je přesně ta sebekontrola, kterou většina traderů nemá.',
      en: 'You stick to your planned trade count even when tempted to open more. That is exactly the self-control most traders lack.',
    },
  },
  {
    id: 'plan_adherence',
    textCz: 'Držíš se svého vstupního a výstupního plánu, i když se cena obrátí proti tobě?',
    textEn: 'Do you stick to your entry and exit plan even when the price turns against you?',
    reversed: true,
    severe: {
      cz: 'Máš plán — jen se ho nedržíš přesně v momentě, kdy se to nejvíc počítá. Cena se obrátí proti tobě a plán jde stranou, rozhoduješ se za pochodu, v emocích. Tenhle přesný okamžik — plán vs. realita pod tlakem — je to, co dlouhodobě rozhoduje o výsledku víc než jakákoli strategie.',
      en: "You have a plan — you just don't follow it exactly when it matters most. The price turns against you and the plan goes out the window; you start deciding on the fly, emotionally. That exact moment — plan versus reality under pressure — decides your long-term results more than any strategy does.",
    },
    moderate: {
      cz: 'Plán se ti občas rozpadne přesně ve chvíli, kdy se cena obrátí proti tobě. Není to u tebe pravidlo, ale je to přesně ten scénář, kde se testuje, jestli je tvůj plán opravdu plán, nebo jen přání.',
      en: 'Your plan sometimes falls apart exactly when the price turns against you. It is not the rule for you, but it is exactly the scenario where you find out whether your plan is really a plan, or just a wish.',
    },
    secondary: {
      cz: 'Přidává se k tomu i to, že se svého plánu úplně nedržíš, když se cena obrátí proti tobě.',
      en: 'On top of that, you do not fully stick to your plan when the price turns against you.',
    },
    strength: {
      cz: 'Držíš se plánu i pod tlakem, když se cena obrátí proti tobě — to je jádro obchodní disciplíny a většina traderů se tomu roky neumí naučit.',
      en: 'You stick to your plan even under pressure, when the price turns against you — that is the core of trading discipline, and most traders spend years failing to learn it.',
    },
  },
]

// --- Style/trait questions: NOT scored into the 0-100 discipline score.
// They classify the trader archetype (holding time -> noun) and add
// style-contextualized insight lines, so the final read combines a
// behavioral score with an actual trading-style profile, closer to "you are
// an Inconsistent Swing Trader" than a plain percentage.

export interface StyleQuestion {
  id: string
  textCz: string
  textEn: string
  optionsCz: string[]
  optionsEn: string[]
}

export const STYLE_QUESTIONS: StyleQuestion[] = [
  {
    id: 'holding_time',
    textCz: 'Jak dlouho obvykle držíš otevřenou pozici?',
    textEn: 'How long do you usually hold an open position?',
    optionsCz: ['Pár minut', 'Pár hodin, zavírám do konce dne', 'Několik dní', 'Týdny i déle'],
    optionsEn: ['A few minutes', 'A few hours, closed by end of day', 'Several days', 'Weeks or longer'],
  },
  {
    id: 'risk_consistency',
    textCz: 'Jak konzistentní je velikost tvých pozic mezi jednotlivými obchody?',
    textEn: 'How consistent is your position size from trade to trade?',
    optionsCz: ['Vždy stejná, podle pravidel', 'Většinou stejná', 'Dost kolísá', 'Mění se podle nálady'],
    optionsEn: ['Always the same, rule-based', 'Mostly the same', 'Fluctuates a lot', 'Changes with my mood'],
  },
  {
    id: 'decision_basis',
    textCz: 'Na čem nejvíc stavíš svoje rozhodnutí o vstupu?',
    textEn: 'What do you base your entry decisions on most?',
    optionsCz: ['Pevný plán a pravidla', 'Technická analýza', 'Instinkt / pocit z trhu', 'Co dělají ostatní / sociální sítě'],
    optionsEn: ['A fixed plan and rules', 'Technical analysis', 'Instinct / gut feel for the market', 'What others are doing / social media'],
  },
]

const ARCHETYPE_NOUNS: Bilingual[] = [
  { cz: 'Scalper', en: 'Scalper' },
  { cz: 'Day Trader', en: 'Day Trader' },
  { cz: 'Swing Trader', en: 'Swing Trader' },
  { cz: 'Position Trader', en: 'Position Trader' },
]

const ARCHETYPE_STYLE_CONTEXT: Bilingual[] = [
  {
    cz: 'Při tvém rychlém stylu obchodování, kde jde o minuty, se každá emocionální reakce znásobí — nemáš čas ji rozmyslet, jen ji rovnou prožiješ v otevřené pozici.',
    en: "With your fast, minutes-long trading style, every emotional reaction gets amplified — you don't have time to think it through, you just live it out in an open position.",
  },
  {
    cz: 'Protože obchoduješ v rámci jednoho dne, každá emocionální chyba se ti může zopakovat hned znovu tentýž den, bez pauzy na to si od trhu odpočinout.',
    en: 'Because you trade within a single day, every emotional mistake can repeat itself again the same day, with no break to reset from the market.',
  },
  {
    cz: 'Protože pozice držíš i několik dní, jedno emocionální rozhodnutí u vstupu nebo výstupu dokáže ovlivnit výsledek celého obchodu, ne jen jednoho tiku.',
    en: 'Because you hold positions for several days, one emotional decision at entry or exit can shape the outcome of the whole trade, not just a single tick.',
  },
  {
    cz: 'Protože držíš pozice týdny i déle, jedno impulzivní rozhodnutí uprostřed trendu dokáže zvrátit výsledek, který jsi budoval celé týdny dopředu.',
    en: 'Because you hold positions for weeks or longer, one impulsive decision in the middle of a trend can undo results you spent weeks building.',
  },
]

const HERD_BONUS: Bilingual = {
  cz: 'K tomu si sám všímáš, že se často necháš ovlivnit tím, co dělají ostatní nebo co vidíš na sociálních sítích — v kombinaci s výše uvedeným vzorcem je to obzvlášť riziková kombinace, protože přestáváš obchodovat svůj vlastní plán.',
  en: "On top of that, you notice you're often influenced by what others are doing or by what you see on social media — combined with the pattern above, that's a particularly risky mix, because you stop trading your own plan.",
}

const RISK_MOOD_BONUS: Bilingual = {
  cz: 'Velikost tvých pozic se navíc mění podle nálady, ne podle plánu — to je samo o sobě jeden z nejsilnějších varovných signálů, protože znamená, že řízení rizika u tebe není systém, ale reakce.',
  en: "On top of that, your position size changes with your mood, not your plan — that alone is one of the strongest warning signs, because it means your risk management isn't a system, it's a reaction.",
}

export interface ArchetypeResult {
  titleCz: string
  titleEn: string
  styleContextCz: string
  styleContextEn: string
  bonusCz: string | null
  bonusEn: string | null
}

export function buildArchetype(styleAnswers: number[], disciplineScore: number): ArchetypeResult {
  const holdingIdx = styleAnswers[0] ?? 2
  const riskIdx = styleAnswers[1] ?? 0
  const decisionIdx = styleAnswers[2] ?? 0

  const noun = ARCHETYPE_NOUNS[holdingIdx] ?? ARCHETYPE_NOUNS[2]
  const context = ARCHETYPE_STYLE_CONTEXT[holdingIdx] ?? ARCHETYPE_STYLE_CONTEXT[2]

  const adjective =
    disciplineScore >= 80
      ? { cz: 'Disciplinovaný', en: 'Disciplined' }
      : disciplineScore >= 50
        ? { cz: 'Nevyrovnaný', en: 'Inconsistent' }
        : { cz: 'Impulzivní', en: 'Impulsive' }

  const bonus = decisionIdx === 3 ? HERD_BONUS : riskIdx === 3 ? RISK_MOOD_BONUS : null

  return {
    titleCz: `${adjective.cz} ${noun.cz}`,
    titleEn: `${adjective.en} ${noun.en}`,
    styleContextCz: context.cz,
    styleContextEn: context.en,
    bonusCz: bonus?.cz ?? null,
    bonusEn: bonus?.en ?? null,
  }
}

export interface SelfReportProfile {
  score: number
  label: string
  labelEn: string
  color: SelfReportColor
  primaryCz: string
  primaryEn: string
  secondaryCz: string | null
  secondaryEn: string | null
  strengthCz: string | null
  strengthEn: string | null
  categoryScores: number[]
}

const POINTS_FORWARD = [100, 65, 35, 0]
const POINTS_REVERSED = [0, 35, 65, 100]

const EXCELLENT_CZ =
  'Podle tvých odpovědí nemáš žádný výrazně slabý vzorec — žádnou z těchto šesti oblastí sám neoznačuješ jako problém. To je dobrá zpráva, ale sebehodnocení má jeden limit: většina traderů podceňuje vlastní chyby, dokud je nevidí černé na bílém v reálných datech. Skutečná otázka je, jestli tohle drží i pod tlakem, když jsou peníze živě v ohrožení.'
const EXCELLENT_EN =
  "Based on your answers, you don't show a strongly weak pattern — you don't flag any of these six areas as a real problem for yourself. That's good news, but self-assessment has one limit: most traders underestimate their own mistakes until they see them in black and white in real data. The real question is whether this holds up under pressure, when real money is on the line."

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

  const ranked = categoryScores
    .map((v, i) => ({ score: v, idx: i }))
    .sort((a, b) => a.score - b.score)

  const worst = ranked[0]

  if (worst.score >= 65) {
    return {
      score,
      label,
      labelEn,
      color,
      primaryCz: EXCELLENT_CZ,
      primaryEn: EXCELLENT_EN,
      secondaryCz: null,
      secondaryEn: null,
      strengthCz: null,
      strengthEn: null,
      categoryScores,
    }
  }

  const primaryQ = SELF_REPORT_QUESTIONS[worst.idx]
  const primaryVariant = worst.score <= 17 ? primaryQ.severe : primaryQ.moderate

  const second = ranked.find((r) => r.idx !== worst.idx && r.score < 65)
  const secondaryQ = second ? SELF_REPORT_QUESTIONS[second.idx] : null

  const best = ranked[ranked.length - 1]
  const strengthQ = best.score >= 65 && best.idx !== worst.idx ? SELF_REPORT_QUESTIONS[best.idx] : null

  return {
    score,
    label,
    labelEn,
    color,
    primaryCz: primaryVariant.cz,
    primaryEn: primaryVariant.en,
    secondaryCz: secondaryQ ? secondaryQ.secondary.cz : null,
    secondaryEn: secondaryQ ? secondaryQ.secondary.en : null,
    strengthCz: strengthQ ? strengthQ.strength.cz : null,
    strengthEn: strengthQ ? strengthQ.strength.en : null,
    categoryScores,
  }
}
