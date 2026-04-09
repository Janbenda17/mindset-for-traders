import { format, subDays } from "date-fns"

export interface DemoMorningCheck {
  id: string
  date: string
  sleepQuality: number
  sleepHours: number
  energyLevel: number
  stressLevel: number
  focus: number
  physicalHealth: number
  emotionalState: number
  exercised: boolean
  exerciseType: string
  exerciseDuration: number
  meditationTime: number
  morningRoutine: boolean
  score: number
  recommendation: string
}

export interface DemoDailyIntention {
  date: string
  goals: string
  maxRiskPercent: number
  emotionalGoal: string
  strategy: string
}

export interface DemoTradingPlan {
  date: string
  primarySetup: string
  pairs: string[]
  timeframe: string
  entryRules: string
  exitRules: string
  keyLevels: string
  maxRisk: number
}

export interface AIInsights {
  keyInsights: string[]
  predictions: string[]
  recommendations: string[]
  riskFactors: string[]
  strengths: string[]
}

export interface DemoDailyTracker {
  date: string
  morningCheck: DemoMorningCheck
  intention: DemoDailyIntention
  plan: DemoTradingPlan
  trades: any[]
  insights: AIInsights
  overallScore: number
  stagesCompleted: number
}

// Generuje 7 dní realistických demo dat
export function generateDemoDailyTrackerData(): DemoDailyTracker[] {
  const today = new Date()
  const data: DemoDailyTracker[] = []

  // Den 1 - Skvělý den (85%)
  data.push({
    date: format(subDays(today, 0), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-1",
      date: format(subDays(today, 0), "yyyy-MM-dd"),
      sleepQuality: 8,
      sleepHours: 8,
      energyLevel: 9,
      stressLevel: 3,
      focus: 9,
      physicalHealth: 8,
      emotionalState: 9,
      exercised: true,
      exerciseType: "gym",
      exerciseDuration: 45,
      meditationTime: 15,
      morningRoutine: true,
      score: 78,
      recommendation: "Excellent readiness! Perfect day for trading with high confidence.",
    },
    intention: {
      date: format(subDays(today, 0), "yyyy-MM-dd"),
      goals: "Take only A+ setups, stick to 2% risk rule, focus on patience",
      maxRiskPercent: 2,
      emotionalGoal: "confident",
      strategy: "Trend following on EUR/USD, waiting for breakout confirmations",
    },
    plan: {
      date: format(subDays(today, 0), "yyyy-MM-dd"),
      primarySetup: "Breakout Strategy",
      pairs: ["EUR/USD", "GBP/JPY"],
      timeframe: "4H",
      entryRules: "Wait for close above resistance + volume confirmation",
      exitRules: "Take profit at 2:1 RR or trailing stop",
      keyLevels: "EUR/USD: 1.0950 resistance, 1.0900 support",
      maxRisk: 2,
    },
    trades: [
      {
        id: "demo-t1",
        pair: "EUR/USD",
        type: "Long",
        entry: 1.095,
        exit: 1.098,
        pnl: 300,
        mood: 9,
        confidence: 9,
      },
    ],
    insights: {
      keyInsights: [
        "Kvalita spánku a soustředění jsou na maximální úrovni - ideální podmínky pro obchodování",
        "Ranní rutina s cvičením a meditací zvýšila tvou mentální jasnost",
        "Aktuální emoční stav ukazuje sebedůvěru bez přehnání - ideální rovnováha pro realizaci",
      ],
      predictions: [
        "Vysoká pravděpodobnost ziskových obchodů pokud budeš brát pouze A+ setupy",
        "Tvůj disciplinovaný přístup by měl vést k lepší kvalitě výběru obchodů",
      ],
      recommendations: [
        "Využij svého peak stavu - ideální den pro přijatá vypočítaná rizika",
        "Zdokumentuj svůj úspěšný proces rozhodování jako referenci pro nižší energetické dny",
        "Vyhni se pokušení přeobchodování - kvalita přebíjí kvantitu",
      ],
      riskFactors: [
        "Riziko přílišné sebedůvěry - zachovej disciplínu velikosti pozic i v high-energy dnech",
        "FOMO riziko - drž se svého watchlistu a neháněj pohyby",
      ],
      strengths: [
        "Výjimečná mentální čistota a soustředění",
        "Dobře vykoupený a fyzicky připravený",
        "Silná emoční stabilita",
      ],
    },
    overallScore: 78,
    stagesCompleted: 5,
  })

  // Den 2 - Dobrý den (75%)
  data.push({
    date: format(subDays(today, 1), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-2",
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      sleepQuality: 7,
      sleepHours: 7.5,
      energyLevel: 8,
      stressLevel: 4,
      focus: 8,
      physicalHealth: 7,
      emotionalState: 8,
      exercised: true,
      exerciseType: "cardio",
      exerciseDuration: 30,
      meditationTime: 10,
      morningRoutine: true,
      score: 75,
      recommendation: "Good readiness. Stay disciplined and follow your plan.",
    },
    intention: {
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      goals: "Focus on quality over quantity, max 3 trades today",
      maxRiskPercent: 1.5,
      emotionalGoal: "calm",
      strategy: "Support/resistance bounces on GBP/JPY",
    },
    plan: {
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      primarySetup: "Reversal at Key Levels",
      pairs: ["GBP/JPY", "USD/CAD"],
      timeframe: "1H",
      entryRules: "Rejection candle at support/resistance + RSI confirmation",
      exitRules: "First target at previous swing, let runner go to next level",
      keyLevels: "GBP/JPY: 185.50 resistance, 184.00 support",
      maxRisk: 1.5,
    },
    trades: [
      {
        id: "demo-t2",
        pair: "GBP/JPY",
        type: "Short",
        entry: 185.5,
        exit: 184.8,
        pnl: 350,
        mood: 8,
        confidence: 8,
      },
    ],
    insights: {
      keyInsights: [
        "Dobrá rovnováha mezi spánkem a aktivitou - udržuješ konzistenci",
        "Splnění ranní rutiny ukazuje že disciplína se stává zvykem",
        "Energetické hladiny zůstávají silné navzdory nižšímu spánku než včera",
      ],
      predictions: [
        "Pokračování pozitivní obchodní výkonnosti s o něco přísnější disciplínou",
        "Tvoje konzistentnost ti pomůže udržet win rate nad 60%",
      ],
      recommendations: [
        "Udržuj současnou rutinu - konzistentnost buduje pozitivní zvyky",
        "Zvažuj zvýšení meditace o 5 minut pro snížení stresu",
        "Tvůj klidný emoční stav je souprava - použij jej pro trpělivý výběr obchodů",
      ],
      riskFactors: [
        "Mírný nárůst stresu - ujistěte se, že nespěcháte při rozhodování",
        "Energie mírně nižší - vyhni se prodlužování obchodních hodin",
      ],
      strengths: [
        "Konzistentní provedení rutiny",
        "Udržované soustředění navzdory snížení spánku",
        "Dobrá emoční kontrola",
      ],
    },
    overallScore: 75,
    stagesCompleted: 5,
  })

  // Den 3 - Slabší den (72%)
  data.push({
    date: format(subDays(today, 2), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-3",
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      sleepQuality: 6,
      sleepHours: 6.5,
      energyLevel: 7,
      stressLevel: 5,
      focus: 7,
      physicalHealth: 6,
      emotionalState: 7,
      exercised: false,
      exerciseType: "none",
      exerciseDuration: 0,
      meditationTime: 5,
      morningRoutine: false,
      score: 72,
      recommendation: "Moderate readiness. Be extra cautious and reduce position sizes.",
    },
    intention: {
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      goals: "Trade only if A++ setup appears, otherwise take day off",
      maxRiskPercent: 1,
      emotionalGoal: "patient",
      strategy: "Wait for perfect setups, no FOMO",
    },
    plan: {
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      primarySetup: "High Probability Only",
      pairs: ["EUR/USD"],
      timeframe: "4H",
      entryRules: "Only trade with all confirmations aligned",
      exitRules: "Quick exit if setup invalidated",
      keyLevels: "EUR/USD: 1.0900 key support",
      maxRisk: 1,
    },
    trades: [],
    insights: {
      keyInsights: [
        "Kvalita spánku klesá - to ovlivňuje přesnost tvého rozhodování",
        "Nižší soustředění a energetické hladiny zaznamenány - high-risk prostředí pro obchodování",
        "Nedostatek splnění ranní rutiny koreluje se sníženým skórem připravenosti",
      ],
      predictions: [
        "Pravděpodobnost přeobchodování nebo špatného výběru obchodů se zvyšuje o 35%",
        "Doporučuje se snížení velikostí pozic nebo přerušení aktivního obchodování",
      ],
      recommendations: [
        "Zvažuj DEN BEZ OBCHODŮ nebo pouze papírový obchod pro zachování kapitálu",
        "Prioritizuj zotavení - dnes noc 8+ hodin spánku a obnovení rutiny",
        "Pokud budeš obchodovat, sniž velikosti pozic o 50% a zaměř se pouze na A+ setupy",
        "Extra meditace nebo relaxace by pomohla zvládnout úrovně stresu",
      ],
      riskFactors: [
        "Výrazně snížená kvalita spánku ovlivňuje schopnost posuzování rizika",
        "Zvýšení úrovně stresu v kombinaci s nižším soustředěním je znepokojující vzorem",
        "Žádná ranní rutina zvyšuje riziko emočního rozhodování",
      ],
      strengths: [
        "Uvědomuješ si svůj stav - povědomí je první krok k zotavení",
        "Ochota ke konzervativnímu přístupu ukazuje zralost",
      ],
    },
    overallScore: 72,
    stagesCompleted: 4,
  })

  // Den 4 - Recovery den (70%)
  data.push({
    date: format(subDays(today, 3), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-4",
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      sleepQuality: 5,
      sleepHours: 6,
      energyLevel: 6,
      stressLevel: 6,
      focus: 6,
      physicalHealth: 5,
      emotionalState: 6,
      exercised: false,
      exerciseType: "none",
      exerciseDuration: 0,
      meditationTime: 0,
      morningRoutine: false,
      score: 70,
      recommendation: "Low readiness. Consider taking a break or paper trading only.",
    },
    intention: {
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      goals: "Focus on recovery, no pressure to trade",
      maxRiskPercent: 0.5,
      emotionalGoal: "calm",
      strategy: "Observation day - watch markets, no trades unless perfect",
    },
    plan: {
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      primarySetup: "Observation Mode",
      pairs: ["EUR/USD", "GBP/USD"],
      timeframe: "Daily",
      entryRules: "Only if absolutely perfect setup",
      exitRules: "Quick exit at first sign of trouble",
      keyLevels: "Market observation only",
      maxRisk: 0.5,
    },
    trades: [
      {
        id: "demo-t4",
        pair: "USD/CAD",
        type: "Long",
        entry: 1.342,
        exit: 1.338,
        pnl: -200,
        mood: 5,
        confidence: 6,
      },
    ],
    insights: {
      keyInsights: [
        "Den zotavení zahájen - připravenost na minimální přijatelné prahové hodnotě",
        "Ztráta dnes je připisována nízkému psychickému stavu, ne selhání strategie",
        "Vzor detekován: nedostatečný spánek vždy koreluje se ztrátovými dny",
      ],
      predictions: [
        "S 8+ hodinami dnes v noci by se zítřejší připravenost měla dramaticky zlepšit",
        "Protokol zotavení dnes nastaví výborné obchodní podmínky zítra",
      ],
      recommendations: [
        "DŮLEŽITÉ: Vezmi si dnes plný den odpočinku - prioritizuj zotavení spánku",
        "Implementuj přísnou ranní rutinu zítra bez ohledu na únavu",
        "Toto je dočasné zastavení - psychické zotavení je investice do budoucích vítězství",
        "Dnes ztrátu neposuzuj jako selhání ale jako datový bod vědy o zotavení",
      ],
      riskFactors: [
        "Vážně kompromitovaný psychický a fyzický stav",
        "Riziko revenge tradingu zítra pokud dnes ztráta psychicky nezpracuješ",
        "Pokračování v obchodování navzdory nízkému stavu bude zesílovat ztráty",
      ],
      strengths: [
        "Chytil jsi se dříve než by došlo k větším ztrátám",
        "Observační přístup ukazuje moudrost",
        "Malá ztráta je přijatelná cena za učení",
      ],
    },
    overallScore: 70,
    stagesCompleted: 5,
  })

  // Den 5 - Silný comeback (80%)
  data.push({
    date: format(subDays(today, 4), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-5",
      date: format(subDays(today, 4), "yyyy-MM-dd"),
      sleepQuality: 9,
      sleepHours: 8.5,
      energyLevel: 9,
      stressLevel: 3,
      focus: 9,
      physicalHealth: 9,
      emotionalState: 9,
      exercised: true,
      exerciseType: "gym",
      exerciseDuration: 60,
      meditationTime: 20,
      morningRoutine: true,
      score: 80,
      recommendation: "Outstanding readiness! Perfect mental state for high-performance trading.",
    },
    intention: {
      date: format(subDays(today, 4), "yyyy-MM-dd"),
      goals: "Execute flawlessly, trust the process, maximum 4 trades",
      maxRiskPercent: 2,
      emotionalGoal: "focused",
      strategy: "Momentum trades on major pairs, ride the trends",
    },
    plan: {
      date: format(subDays(today, 4), "yyyy-MM-dd"),
      primarySetup: "Trend Continuation",
      pairs: ["AUD/USD", "NZD/USD"],
      timeframe: "4H",
      entryRules: "Enter on pullbacks to moving average with momentum confirmation",
      exitRules: "Trail stops, let winners run",
      keyLevels: "AUD/USD: 0.6650 support, 0.6720 target",
      maxRisk: 2,
    },
    trades: [
      {
        id: "demo-t5",
        pair: "AUD/USD",
        type: "Long",
        entry: 0.665,
        exit: 0.672,
        pnl: 840,
        mood: 9,
        confidence: 9,
      },
    ],
    insights: {
      keyInsights: [
        "Zotavení úspěšné! Všechny metriky ukazují významné zlepšení od včera",
        "Peak performance den - zotavení spánku kombinované s plnou rutinou vytvořilo ideální podmínky",
        "Silné zotavení ukazuje že disciplína vítězí nad aktuálními tržními podmínkami",
      ],
      predictions: [
        "Moment z dnešního dne by měl pokračovat zítra pokud rutinu udržíš",
        "Obchod zotavení $840 více než kompenzuje včerejší ztrátu $200",
        "Win rate by měl vzrůst jak se psychický stav zlepšuje",
      ],
      recommendations: [
        "Zdokumentuj dnešní úspěšnou realizaci jako referenci pro podobné budoucí situace",
        "Udržuj spánek a rutinu disciplínu která vedla k tomuto zotavení",
        "Dnešní sebedůvěru využij moudře - škáluj pozice konzervativně ne agresivně",
        "Toto je důkaz že funguje protokol zotavení - aplikuj stejný postup příště",
      ],
      riskFactors: [
        "Lehké riziko přílišné sebedůvěry po silném comebacku - vyhni se revenge tradům",
        "Nepředpokládej že zítřek bude stejně silný - udržuj disciplínu",
      ],
      strengths: [
        "Výjimečné psychické zotavení a disciplína",
        "Dosažen peak fyzický a psychický výkon",
        "Výborná realizace obchodu - plně využil možnost setupu",
        "Prokázaná odolnost skrze cyklus zotavení",
      ],
    },
    overallScore: 80,
    stagesCompleted: 5,
  })

  // Den 6 - Dobrý den (80%)
  data.push({
    date: format(subDays(today, 5), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-6",
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      sleepQuality: 8,
      sleepHours: 8,
      energyLevel: 8,
      stressLevel: 3,
      focus: 8,
      physicalHealth: 8,
      emotionalState: 8,
      exercised: true,
      exerciseType: "walk",
      exerciseDuration: 30,
      meditationTime: 15,
      morningRoutine: true,
      score: 80,
      recommendation: "Great readiness! Maintain consistency and stick to your rules.",
    },
    intention: {
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      goals: "Stay patient, quality over quantity, respect risk limits",
      maxRiskPercent: 1.5,
      emotionalGoal: "patient",
      strategy: "Scalp on London open, quick in and out",
    },
    plan: {
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      primarySetup: "London Open Volatility",
      pairs: ["GBP/USD", "EUR/GBP"],
      timeframe: "15M",
      entryRules: "Quick entries on initial volatility spike",
      exitRules: "Take quick profits, don't overstay",
      keyLevels: "GBP/USD: 1.2700 pivot",
      maxRisk: 1.5,
    },
    trades: [
      {
        id: "demo-t6",
        pair: "GBP/USD",
        type: "Short",
        entry: 1.272,
        exit: 1.268,
        pnl: 280,
        mood: 8,
        confidence: 8,
      },
    ],
    insights: {
      keyInsights: [
        "Konzistentnost se buduje - dosažen druhý po sobě následující den vysoké připravenosti",
        "Optimalizace spánku se nyní připraví jako nový standard",
        "Ranní rutina je nyní automatická - formování zvyku je hotovo",
      ],
      predictions: [
        "Konzistentnost jako je tato obvykle vede k +3% měsíčnímu zlepšení win rate",
        "Další ztráta bude jednodušší na zotavení kvůli zavedenému protokolu zotavení",
      ],
      recommendations: [
        "Pokračuj v 8hodinovém spánku - je to nyní tvoje konkurenční výhoda",
        "Udržuj rutinu i o víkendech pro optimální dlouhodobý výkon",
        "Dnešní scalp obchod ukazuje dobrou adaptabilitu - hezká session",
        "Zdokumentuj tuto 2denní silnou sérii do svého trader journálu",
      ],
      riskFactors: [
        "Jediné riziko: udržení disciplíny pokud se séria přeruší",
        "Samozřejmost o zavedené rutině",
      ],
      strengths: [
        "Silná konzistentnost v provedení",
        "Výborná adaptabilita napříč různými obchodními sessions",
        "Udržovaná vysoká energie a mentální jasnost",
        "Budování silného základu zvyků",
      ],
    },
    overallScore: 80,
    stagesCompleted: 5,
  })

  // Den 7 - Solid den (73%)
  data.push({
    date: format(subDays(today, 6), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-7",
      date: format(subDays(today, 6), "yyyy-MM-dd"),
      sleepQuality: 7,
      sleepHours: 7,
      energyLevel: 7,
      stressLevel: 4,
      focus: 7,
      physicalHealth: 7,
      emotionalState: 7,
      exercised: false,
      exerciseType: "none",
      exerciseDuration: 0,
      meditationTime: 10,
      morningRoutine: true,
      score: 73,
      recommendation: "Solid readiness. Stick to your A-setups and follow the plan.",
    },
    intention: {
      date: format(subDays(today, 6), "yyyy-MM-dd"),
      goals: "Trade with discipline, no overtrading, journal everything",
      maxRiskPercent: 1.5,
      emotionalGoal: "analytical",
      strategy: "Technical setups on major pairs, clean entries only",
    },
    plan: {
      date: format(subDays(today, 6), "yyyy-MM-dd"),
      primarySetup: "Technical Patterns",
      pairs: ["USD/JPY", "EUR/JPY"],
      timeframe: "1H",
      entryRules: "Pattern completion + volume + momentum alignment",
      exitRules: "Target previous swing highs/lows",
      keyLevels: "USD/JPY: 148.00 key level",
      maxRisk: 1.5,
    },
    trades: [
      {
        id: "demo-t7",
        pair: "USD/JPY",
        type: "Long",
        entry: 148.2,
        exit: 148.9,
        pnl: 700,
        mood: 7,
        confidence: 7,
      },
    ],
    insights: {
      keyInsights: [
        "Týdenní souhrn: 7denní průměr připravenosti 75,3 - výborný základ",
        "Pouze 2 ztráty (Dny 3-4) během období nízké připravenosti - prokázalo se že řízení rizika funguje",
        "Cyklus zotavení úspěšně hotov - úplné resetování portfólia dosaženo",
      ],
      predictions: [
        "Příští týden by měl ukazovat 65%+ win rate na základě vzoru připravenosti",
        "Udržování rutiny bude mít za následek kumulativní +5-8% měsíční zlepšení výkonu",
      ],
      recommendations: [
        "Naplánuj týdenní schůzku zotavení pro přezkoumání korelace připravenosti vs výkonu",
        "Zaměření týdne 2: Stavba na základu konzistentnosti, zvýšení velikostí pozic na vysoké připravené dny",
        "Prioritizuj soulad rutiny nade vše - je to tvoje primární výhoda",
        "Uvažuj tento týden jako svůj baseline připravenosti pro budoucí srovnání",
      ],
      riskFactors: [
        "Příští týden samozřejmost - udržuj disciplínu navzdory pozitivním výsledkům",
        "Nezvyšuj velikosti pozic příliš agresivně",
      ],
      strengths: [
        "Demonstrace efektivnosti protokolu zotavení",
        "Silný týden celkově s 5 vítězstvími, 2 ztrátami = 71% win rate",
        "Celkový týdenní P&L: +$2,669 zisk s výborným řízením rizika",
        "Vytvoření zvyků v oblasti spánku, rutiny a meditace",
      ],
    },
    overallScore: 73,
    stagesCompleted: 5,
  })

  return data
}

export const generateVirtualDailyTrackerData = generateDemoDailyTrackerData
