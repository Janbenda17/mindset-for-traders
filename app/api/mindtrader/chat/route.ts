import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

let clientInstance: Anthropic | null = null

function getClient(): Anthropic {
  if (clientInstance) return clientInstance
  clientInstance = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
  return clientInstance
}

const MODE_PROMPTS_CS = {
  mind: `Jsi MIND AI – elitní trading psycholog. Pomáháš traderům s mentálními výzvami.

ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

KRITICKA PRAVIDLA:
1. Odpovez PRIMO na otazku uzivatele - zadne uvody, zadne "vidim ze..."
2. NIKDY si nevymyslej cisla, statistiky ani fakta ktere NEJSOU v kontextu
3. Pokud mas data uzivatele, odkazuj na NE - jsi psycholog, ne analytik
4. Kazda rada MUSI byt KONKRETNI technika s presnym navodem jak ji pouzit
5. ZADNE genericke fraze: "pracuj na sobe", "zlepsuj disciplinu", "buď trpelivy"
6. Misto generickych rad dej PRESNY postup: kroky 1-2-3

MAX 4 vety. BEZ markdown. VZDY V CESTINE. Konkretni techniky a postupy.`,

  analytics: `Jsi ANALYTICS AI – kvantitativní analytik trading performance.

ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

KRITICKA PRAVIDLA:
1. NIKDY si nevymyslej cisla! Pouzivej POUZE data z Trader Profile nize
2. Pokud nemas data, rekni: "Nemam dostatek dat pro tuto analyzu. Zaznamenej vice obchodu."
3. Kazde tvrzeni MUSI odkazovat na konkretni cislo z kontextu
4. FORMAT: [Konkretni metrika] -> [Jak casto] -> [Dopad v $/%] -> [Co s tim]

MAX 3-4 vety. BEZ markdown. VZDY V CESTINE. Jen data-driven fakta.`,

  coach: `Jsi COACH AI – strategicky performance kouc pro tradery.

ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

KRITICKA PRAVIDLA:
1. Odpovez PRIMO na otazku - zadne uvody
2. NIKDY nedavej genericke rady: "buď disciplinovany", "pracuj na sobe"
3. Kazda rada MUSI byt KONKRETNI SYSTEM s meritelnym vysledkem
4. Davej PRESNE kroky: CO udelat + JAK DLOUHO + JAK merit uspech

MAX 4 vety. BEZ markdown. VZDY V CESTINE. Konkretni systemy a navyky.`,
}

const MODE_PROMPTS_EN = {
  mind: `You are MIND AI – an elite trading psychologist. You help traders with mental challenges.

RESPOND EXCLUSIVELY IN ENGLISH.

CRITICAL RULES:
1. Answer the user's question DIRECTLY - no preambles, no "I see that..."
2. NEVER invent numbers, statistics or facts that are NOT in the context
3. Every piece of advice MUST be a CONCRETE technique with exact instructions
4. NO generic phrases: "work on yourself", "improve discipline", "be patient"
5. Instead of generic advice, give EXACT steps: 1-2-3

CORRECT ANSWERS:
"How to recover from loss?" -> "Close the platform immediately. Go for a 15min walk. Ask yourself 2 questions: 1) Did I have a reason to enter per my plan? 2) Did I follow stop loss? If yes - loss is normal. If no - write down exactly WHAT and WHY you violated."

MAX 4 sentences. NO markdown. ALWAYS IN ENGLISH. Concrete techniques and procedures.`,

  analytics: `You are ANALYTICS AI – a quantitative trading performance analyst.

RESPOND EXCLUSIVELY IN ENGLISH.

CRITICAL RULES:
1. NEVER invent numbers! Use ONLY data from the Trader Profile below
2. If you don't have data, say: "I don't have enough data for this analysis. Record more trades."
3. Every statement MUST reference a concrete number from the context
4. FORMAT: [Specific metric] -> [How often] -> [Impact in $/%] -> [What to do]

MAX 3-4 sentences. NO markdown. ALWAYS IN ENGLISH. Data-driven facts only.`,

  coach: `You are COACH AI – a strategic performance coach for traders.

RESPOND EXCLUSIVELY IN ENGLISH.

CRITICAL RULES:
1. Answer the question DIRECTLY - no preambles
2. NEVER give generic advice: "be disciplined", "work on yourself"
3. Every piece of advice MUST be a CONCRETE SYSTEM with measurable results
4. Give EXACT steps: WHAT to do + HOW LONG + HOW to measure success

MAX 4 sentences. NO markdown. ALWAYS IN ENGLISH. Concrete systems and habits.`,
}

const MODE_PROMPTS = MODE_PROMPTS_CS

interface ChatRequest {
  message: string
  personality: "calm" | "strict" | "analytical" | "balanced"
  mode: "mind" | "analytics" | "coach"
  language?: "cs" | "en"
  isVirtualMode?: boolean
  context: {
    mood: number
    stress: number
    confidence: number
    readiness: number
    sleep?: number
    energy?: number
  }
  traderProfile?: {
    performance: {
      totalTrades: number
      winningTrades: number
      losingTrades: number
      winRate: string
      totalPnL: string
      bestTrade: string
      worstTrade: string
      consecutiveWins: number
      consecutiveLosses: number
      averageWin: string
      averageLoss: string
    }
    psychology: {
      averageMood: string
      averageStress: string
      averageReadiness: string
      morningChecksCompleted: number
      morningCheckRate: string
    }
    patterns: {
      revengeTradeRate: string
      revengeTrades: number
      emotionalTrades: number
    }
    recentActivity: {
      lastTrade: any
      lastCheck: any
      lastReview: any
      lastJournal: any
    }
    goals: Array<{
      title: string
      progress: number
      status: string
      targetValue: number
      currentValue: number
    }>
    period: {
      days: number
      startDate: string
      endDate: string
    }
  }
  userData: {
    trades: Array<{
      id: string
      date: string
      pair?: string
      type?: string
      pnl?: number
      notes?: string
      mood?: number
      confidence?: number
      stress?: number
      emotionBefore?: string
      emotionDuring?: string
      emotionAfter?: string
      isRevengeTrade?: boolean
      tags?: string[]
    }>
    journals: Array<{
      id: string
      date: string
      title: string
      content: string
      type: string
      mood?: number
      confidence?: number
      stress?: number
      tags?: string[]
      marketConditions?: string
    }>
    selfReportHistory?: Array<{
      date: string
      tags: string[]
      marketConditions?: string
    }>
    morningChecks?: Array<{
      date: string
      sleepQuality: number
      sleepHours: number
      stress: number
      energy: number
      readiness: number
    }>
    moodHistory: Array<{
      date: string
      mood: number
      stress: number
      confidence: number
      notes?: string
    }>
    patterns?: {
      fomoRate: string
      revengeRate: string
      overconfidenceRate: string
      fearRate: string
    }
    morningCheck?: {
      sleepQuality: number
      sleepHours: number
      energyLevel: number
      stressLevel: number
      focus: number
      physicalHealth: number
      emotionalState: number
      exercised: boolean
      meditationTime: number
    } | null
    stats: {
      totalPnL: number
      winRate: number
      totalTrades: number
      averageMood: number
      consecutiveWins: number
      consecutiveLosses: number
    }
  }
}

function generateEnhancedMockResponse(request: ChatRequest): string {
  const { message, personality, mode, context, userData, traderProfile, isVirtualMode, language } = request
  const isEn = language === "en"
  const { stats, patterns } = userData

  // Add virtual mode disclaimer
  const virtualPrefix = ""

  // VIRTUAL MODE: Respond naturally with concrete techniques
  if (isVirtualMode) {
    if (isEn) {
      const questionResponsesEn: Record<string, string[]> = {
        recovery: [
          "Close the platform immediately for 30 minutes. During the break answer 2 questions: 1) Did I have a valid reason to enter per my plan? 2) Did I follow stop loss? If yes - loss is a normal part. If no - write down exactly what you violated and why.",
          "After a loss your brain switches into 'win it back' mode - that's a biological reaction, not a strategy. Technique: Stand up, go for a 15min walk, breathe 4s inhale, 7s hold, 8s exhale. Then return and analyze the loss without emotion.",
          "Loss is information, not failure. Step: 1) Log the trade in journal immediately. 2) Rate 1-10 whether it was a valid setup. 3) If below 7 - you have a setup selection problem. If above 7 - loss is normal, continue.",
        ],
        fear: [
          "Fear before entry has 2 causes: either the setup doesn't meet your criteria (legitimate fear) or you have trauma from past losses (irrational fear). Test: Rate setup 1-10 per your plan. Above 8 = enter. Below 8 = skip. Fear will then tell you the truth.",
          "Technique against paralysis: Countdown 5-4-3-2-1 and execute. This breaks the overthinking loop in the brain. BUT ONLY for setups that meet your criteria. If setup doesn't match the plan - don't overcome the fear, listen to it.",
          "Fear of entry often signals you don't have clearly defined criteria. Create a checklist of 5 entry conditions. If all met = enter automatically. If not = skip automatically. Decision-making eliminates fear.",
        ],
        discipline: [
          "Discipline is built through systems, not motivation. Step 1: Choose ONE rule (e.g. max 3 trades/day). Step 2: Follow it 21 days without exception. Step 3: Record every day YES/NO. After 21 days add another rule.",
          "Calculate the cost of indiscipline: How much did your last 3 trades that broke the plan cost you? Write that number on paper and put it next to your monitor. Visualizing costs is a stronger motivator than visualizing profits.",
          "System: Before each trade say your rules out loud (stop loss, target, max risk). Out loud - not in your head. This activates a different part of the brain that helps with impulse control. Test it for a week and watch the difference.",
        ],
        plan: [
          "Breaking the plan means the plan isn't specific enough. Rewrite it so each point has a clear YES/NO criterion: 'I enter ONLY when RSI below 30 AND price at support AND volume above average.' No 'maybe' or 'consider'.",
          "Technique: Write your plan on paper and put it next to the keyboard. Before each trade point to each item and read it aloud. Physical movement + reading aloud creates a stronger mental connection than just reading in your head.",
          "The problem isn't the plan but execution. Solution: After each trade score 1-10 how well you followed the plan. Goal: 8+ average per week. Don't focus on P&L but on compliance score. Profitability is a byproduct of following the plan.",
        ],
        revenge: [
          "Revenge trading is a biological reaction - loss aversion in the brain. Immediate solution: Rule '2 losses = end of day'. No exceptions. Write it as an unbreakable rule. After 30 days evaluate how much it saved you.",
          "After a loss you have 15 minutes when the probability of bad decisions is highest. Rule: After EVERY loss mandatory 15min break. During it: step away from the PC, breathe, write what happened in the journal. Then return and decide again.",
          "Revenge trading costs the average trader 30-40% of their losses. Process: 1) Mark each trade as 'planned' or 'unplanned'. 2) After a month compare P&L of both groups. Data will show you exactly how much revenge costs you.",
        ],
        fomo: [
          "FOMO entry = entry without a plan = gambling. Test: If you can't name in 10 seconds exactly WHY you're entering and where your stop loss is - it's FOMO. Close it. The next setup will always come.",
          "Technique against FOMO: Create a 'missed trades' journal. Write down every trade you skip. After a month you'll see that 80%+ of those 'missed opportunities' would have been losses. Data will cure your FOMO.",
          "FOMO is the illusion that this opportunity is the only one. Reality: Every day has 10+ quality setups. A quality trader doesn't catch every one, they pick only the best. Rule: If you don't have the setup in your plan MIN 1 hour before entry = don't touch it.",
        ],
      }
      let selectedResponses = questionResponsesEn.recovery
      const msg = message.toLowerCase()
      if (msg.includes("fear") || msg.includes("afraid") || msg.includes("scared")) selectedResponses = questionResponsesEn.fear
      else if (msg.includes("discipl") || msg.includes("rule")) selectedResponses = questionResponsesEn.discipline
      else if (msg.includes("plan") || msg.includes("broke")) selectedResponses = questionResponsesEn.plan
      else if (msg.includes("revenge") || msg.includes("get back") || msg.includes("recover")) selectedResponses = questionResponsesEn.recovery
      else if (msg.includes("fomo") || msg.includes("miss") || msg.includes("missed")) selectedResponses = questionResponsesEn.fomo
      const randomResponse = selectedResponses[Math.floor(Math.random() * selectedResponses.length)]
      return virtualPrefix + randomResponse
    }

    // Czech virtual responses
    const questionResponses: Record<string, string[]> = {
      recovery: [
        "Okamzite zavri platformu na 30 minut. Behem pauzy si odpovez na 2 otazky: 1) Mel jsem validni duvod pro vstup podle planu? 2) Dodržel jsem stop loss? Pokud ano - ztrata je normalni soucást. Pokud ne - zapíš si presne co jsi porusil a proc.",
        "Po ztrate tvuj mozek prepina do rezimu 'vyhraj zpátky' - to je biologická reakce, ne strategie. Technika: Vstani, jdi na 15min prochazku, behem ni dychej 4s nadech, 7s drzeni, 8s vydech. Pak se vrat a analyzuj ztrátu bez emoci.",
        "Ztrata je informace, ne selhani. Postup: 1) Zaznamenej trade do journalu hned. 2) Ohodnot 1-10 jestli to byl validni setup. 3) Pokud pod 7 - mas problem se selekci setupu. Pokud nad 7 - ztrata je normalni, pokracuj.",
      ],
      fear: [
        "Strach pred vstupem ma 2 priciny: bud setup nesplnuje tvá kriteria (legitimni strach) nebo mas trauma z minulych ztrat (iracionalní strach). Test: Ohodnot setup 1-10 podle sveho planu. Nad 8 = vstup. Pod 8 = preskoc. Strach ti pak rekne pravdu.",
        "Technika proti paralýze: Countdown 5-4-3-2-1 a exekutuj. Tento postup prerusuje overthinking loop v mozku. Ale POUZE u setupu ktere splnuji tvá kriteria. Pokud setup nesplnuje plan - nepřekonávej strach, poslechni ho.",
        "Strach z vstupu casto signalizuje ze nemas jasne definovana kriteria. Vytvor si checklist 5 podminek pro vstup. Pokud vse splneno = vstupujes automaticky. Pokud ne = preskakujes automaticky. Rozhodovani eliminuje strach.",
      ],
      discipline: [
        "Disciplina se nebuduje motivací ale systémem. Krok 1: Zvol si JEDNO pravidlo (napr. max 3 obchody/den). Krok 2: Dodrz ho 21 dni bez vyjimky. Krok 3: Zaznamenej kazdy den ANO/NE. Po 21 dnech pridej dalsi pravidlo.",
        "Spocitej si naklady nedisciplíny: Kolik te staly posledni 3 obchody co porusily tvuj plan? To cislo si napís na papir a dej vedle monitoru. Vizualizace nakladu je silnejsi motivator nez vizualizace zisku.",
        "System: Pred kazdym obchodem si nahlas rekni pravidla (stop loss, target, max risk). Nahlas - ne v hlave. Aktivujes tim jinou cast mozku ktera ti pomaha s kontrolou impulzu. Testuj tyden a sleduj rozdil.",
      ],
      plan: [
        "Porusovani planu znamená ze plan neni dostatecne specifický. Prepis ho tak aby kazdy bod mel jasne YES/NO kritérium: 'Vstupuju POUZE kdyz RSI pod 30 A cena na supportu A volume nad prumerem.' Zadne 'mozna' nebo 'zvazit'.",
        "Technika: Napís svuj plan na papir a poloz vedle klávesnice. Pred kazdym obchodem ukazuj prstem na kazdy bod a nahlas si ho prečti. Fyzicky pohyb + hlasité čtení vytvari silnejsi mentalni vazbu nez jen čtení v hlave.",
        "Problem neni plan ale exekuce. Reseni: Po kazdém obchodu si dej score 1-10 jak moc jsi dodržel plan. Cil: 8+ prumer za tyden. Nezameruj se na P&L ale na compliance score. Ziskovost je vedlejsi produkt dodrzovani planu.",
      ],
      revenge: [
        "Revenge trading je biologicka reakce - loss aversion v mozku. Okamzite reseni: Pravidlo '2 ztráty = konec dne'. Zadne vyjimky. Zapís si to jako neporušitelne pravidlo. Po 30 dnech vyhodnoť kolik ti to ušetřilo.",
        "Po ztrate mas 15 minut kdy je pravdepodobnost spatneho rozhodnuti nejvyssi. Pravidlo: Po KAZDE ztrate povinná 15min pauza. Behem ni: jdi od PC, dychej, napíš co se stalo do journalu. Pak se vrat a rozhoduj znovu.",
        "Revenge trading stoji prumerneho tradera 30-40% jeho ztrat. Postup: 1) Oznac kazdy trade jako 'planovany' nebo 'neplanovany'. 2) Po mesici porovnej P&L obou skupin. Data ti ukazou presne kolik te revenge stoji.",
      ],
      fomo: [
        "FOMO vstup = vstup bez planu = hazard. Test: Pokud nemuzes behem 10 sekund pojmenovat presne PROC vstupujes a kde mas stop loss - je to FOMO. Zavri to. Dalsi setup prijde vzdy.",
        "Technika proti FOMO: Vytvor si 'missed trades' journal. Kazdý trade co preskocis tam zapíš. Po mesici uvidíš ze 80%+ tech 'zmeskaných příležitostí' by byly ztráty. Data ti vylecí FOMO.",
        "FOMO je iluze ze tahle prilezitost je jedina. Realita: Kazdy den je 10+ kvalitních setupu. Kvalitni trader nechyta kazdou, vybira si jen ty nejlepsi. Pravidlo: Pokud nemas setup v planu MIN 1 hodinu pred vstupem = nesahej na to.",
      ],
    }

    let selectedResponses = questionResponses.recovery
    const msg = message.toLowerCase()
    if (msg.includes("strach") || msg.includes("bojím") || msg.includes("boj")) selectedResponses = questionResponses.fear
    else if (msg.includes("discipl") || msg.includes("pravidl")) selectedResponses = questionResponses.discipline
    else if (msg.includes("plán") || msg.includes("plan")) selectedResponses = questionResponses.plan
    else if (msg.includes("revenge") || msg.includes("pomst") || msg.includes("dohnat")) selectedResponses = questionResponses.revenge
    else if (msg.includes("fomo") || msg.includes("zmeškal") || msg.includes("propás")) selectedResponses = questionResponses.fomo

    const randomResponse = selectedResponses[Math.floor(Math.random() * selectedResponses.length)]
    return virtualPrefix + randomResponse
  }

  // LIVE MODE: Use real data and stats
  const randomFactor = Math.random()
  let response = ""

  if (mode === "mind") {
    const consecutiveLosses = stats.consecutiveLosses

    if (consecutiveLosses >= 3) {
      const responses = isEn ? [
        `${consecutiveLosses} losses in a row = your brain is in "win it back" mode. This is NOT logical thinking. Close the platform for minimum 2 hours. Box breathing: 4s inhale, 4s hold, 4s exhale, 4s pause. 10 repetitions. Then analyze losses WITHOUT emotion.`,
        `STOP. ${consecutiveLosses} consecutive losses = 80%+ probability of another mistake. Immediately: Close all positions. Go outside for 30 minutes. Breathe 4-7-8 technique. Return only when you can describe the last 3 losses without emotion.`,
        `A series of ${consecutiveLosses} losses activated your "fight" mode. Only correct action: Step away from screens MINIMUM 90 minutes. Physical activity (walk, exercise). Return only with a written analysis of each loss.`,
      ] : [
        `${consecutiveLosses} ztrat v rade = tvuj mozek je v rezimu "vyhraj zpatky". Tohle NENI logicke rozhodovani. Zavri platformu na minimum 2 hodiny. Box breathing: 4s nadech, 4s drzeni, 4s vydech, 4s pauza. 10 opakovani. Pak analyzuj ztráty BEZ emoci.`,
        `STOP. ${consecutiveLosses} po sobe jdoucich ztrat = 80%+ pravdepodobnost dalsi chyby. Okamzite: Zavri vsechny pozice. Jdi ven na 30 minut. Dychej 4-7-8 techniku. Vrat se az kdyz dokazes popsat posledni 3 ztráty bez emoci.`,
        `Serie ${consecutiveLosses} ztrat aktivovala tvuj "fight" rezim. Jedina spravna akce: Odstup od obrazovek MINIMUM 90 minut. Fyzicka aktivita (chůze, cviceni). Navrat pouze s napsanou analyzou kazde z ${consecutiveLosses} ztrat.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const responses = isEn ? [
        `Conditions for trading are good. Focus today: Before each trade say out loud the setup, entry, stop loss and target. This ritual activates the logical part of the brain and reduces impulsive entries.`,
        `Your only goal today: 100% compliance with the plan. Not P&L, not trade count. Only: "Did I follow every point of the plan?" Record a score 1-10 after each trade.`,
        `Technique for today: After each trade (win or loss) take a 5min break. Write: What did I do well? What can I improve? This micro-reflection is the fastest path to consistent improvement.`,
      ] : [
        `Podmínky pro trading jsou dobre. Fokus dnes: Pred kazdym obchodem nahlas pojmenuj setup, entry, stop loss a target. Tento ritual aktivuje logickou cast mozku a snizuje impulzivni vstupy.`,
        `Tvuj jediny cil dnes: 100% compliance s planem. Ne P&L, ne pocet obchodu. Pouze: "Dodržel jsem kazdy bod planu?" Zaznamenej si score 1-10 po kazdem obchodu.`,
        `Technika pro dnesek: Po kazdem obchodu (win i loss) si dej 5min pauzu. Zapiš: Co jsem udelal dobre? Co mohu zlepsit? Tato mikro-reflexe je nejrychlejsi cesta ke konzistentnímu zlepsovani.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    }
  } else if (mode === "analytics") {
    const revengeRate = Number.parseFloat(traderProfile?.patterns.revengeTradeRate || patterns?.revengeRate || "0")
    const winRate = Number.parseFloat(traderProfile?.performance.winRate || String(stats.winRate))
    const totalPnL = traderProfile?.performance.totalPnL || stats.totalPnL?.toFixed(0) || "0"
    const avgWin = traderProfile?.performance.averageWin || "0"
    const avgLoss = traderProfile?.performance.averageLoss || "0"
    const revengeTrades = traderProfile?.patterns.revengeTrades || 0
    const emotionalTrades = traderProfile?.patterns.emotionalTrades || 0

    if (revengeRate > 15 && stats.consecutiveLosses >= 2) {
      const responses = isEn ? [
        `Data: ${revengeTrades} revenge trades out of ${stats.totalTrades} total (${revengeRate.toFixed(0)}%). Avg revenge loss: $${(Math.abs(Number.parseFloat(String(avgLoss))) * 1.5).toFixed(0)} vs normal $${Math.abs(Number.parseFloat(String(avgLoss))).toFixed(0)}. Currently ${stats.consecutiveLosses} losses in a row = high risk of more revenge. Solution: Rule "2 losses = end of day" would eliminate ${revengeTrades} revenge trades.`,
        `Revenge rate ${revengeRate.toFixed(0)}% is your biggest leak. Of ${stats.totalTrades} trades, ${revengeTrades} were revenge - these have 50% worse success rate than planned entries. With ${stats.consecutiveLosses} losses in a row: STOP trading. Every next trade now has statistically negative expected value.`,
        `Analysis: ${stats.consecutiveLosses} losses trigger revenge pattern (${revengeRate.toFixed(0)}% of your trades). Average revenge trade loss: $${(Math.abs(Number.parseFloat(String(avgLoss))) * 1.5).toFixed(0)}. If you implement "2 losses = stop" rule and follow it 30 days, you eliminate ${revengeTrades} revenge trades. Measure: Number of revenge trades per month = 0.`,
      ] : [
        `Data: ${revengeTrades} revenge obchodu z ${stats.totalTrades} celkovych (${revengeRate.toFixed(0)}%). Prum. ztrata na revenge: $${(Math.abs(Number.parseFloat(String(avgLoss))) * 1.5).toFixed(0)} vs bezny $${Math.abs(Number.parseFloat(String(avgLoss))).toFixed(0)}. Aktualne ${stats.consecutiveLosses} ztrat v rade = vysoké riziko dalsiho revenge. Reseni: Pravidlo "2 ztraty = konec dne" by eliminovalo ${revengeTrades} revenge obchodu.`,
        `Revenge rate ${revengeRate.toFixed(0)}% je tvuj nejvetsi leak. Z ${stats.totalTrades} obchodu bylo ${revengeTrades} revenge - tyto maji o 50% horsi uspesnost nez planovane vstupy. Pri ${stats.consecutiveLosses} ztratach v rade: ZASTAV trading. Kazdy dalsi trade ma teď statisticky negativni ocekavanou hodnotu.`,
        `Analyza: ${stats.consecutiveLosses} ztrat aktivuje revenge pattern (${revengeRate.toFixed(0)}% tvych obchodu). Prumerny revenge trade ztrata: $${(Math.abs(Number.parseFloat(String(avgLoss))) * 1.5).toFixed(0)}. Pokud zavedis pravidlo "po 2 ztratach stop" a dodrzis ho 30 dni, eliminujes ${revengeTrades} revenge obchodu.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const rrRatio = Number.parseFloat(String(avgWin)) && Number.parseFloat(String(avgLoss))
        ? (Math.abs(Number.parseFloat(String(avgWin))) / Math.abs(Number.parseFloat(String(avgLoss)))).toFixed(2)
        : "N/A"
      const responses = isEn ? [
        `Overview: ${stats.totalTrades} trades, win rate ${winRate.toFixed(1)}%, P&L $${totalPnL}. R:R ratio ${rrRatio}:1. ${emotionalTrades > 0 ? `${emotionalTrades} emotional trades (${((emotionalTrades / Math.max(stats.totalTrades, 1)) * 100).toFixed(0)}%) - goal: under 10%.` : "No emotional trades detected."} ${stats.consecutiveLosses > 0 ? `Currently ${stats.consecutiveLosses} losses in a row.` : "No active loss streak."}`,
        `Analysis of ${stats.totalTrades} trades: Win rate ${winRate.toFixed(1)}%, avg win $${avgWin}, avg loss $${avgLoss} (R:R ${rrRatio}:1). ${winRate < 50 ? `Win rate below 50% - focus on setup quality: score 1-10 before each trade, enter only at 8+.` : `Win rate ${winRate.toFixed(1)}% is solid - maintain current approach and don't increase risk.`}`,
        `Performance: ${winRate.toFixed(1)}% WR, $${totalPnL} P&L across ${stats.totalTrades} trades. ${stats.consecutiveWins > 0 ? `Current win streak ${stats.consecutiveWins} - don't increase risk due to euphoria.` : ""} ${revengeTrades > 0 ? `Revenge trading: ${revengeTrades} cases = your biggest leak to eliminate.` : "Revenge trading: 0 - excellent emotional control."}`,
      ] : [
        `Prehled: ${stats.totalTrades} obchodu, win rate ${winRate.toFixed(1)}%, P&L $${totalPnL}. R:R ratio ${rrRatio}:1. ${emotionalTrades > 0 ? `${emotionalTrades} emocnich obchodu (${((emotionalTrades / Math.max(stats.totalTrades, 1)) * 100).toFixed(0)}%) - cil: pod 10%.` : "Zadne emocni obchody detekovany."} ${stats.consecutiveLosses > 0 ? `Aktualne ${stats.consecutiveLosses} ztrat v rade.` : "Zadny aktivni loss streak."}`,
        `Analyza ${stats.totalTrades} obchodu: Win rate ${winRate.toFixed(1)}%, prumer win $${avgWin}, prumer loss $${avgLoss} (R:R ${rrRatio}:1). ${winRate < 50 ? `Win rate pod 50% - zamerit na kvalitu setupu: pred kazdym obchodem score 1-10, vstupuj jen pri 8+.` : `Win rate ${winRate.toFixed(1)}% je solidni - udrzuj soucasny pristup a nezvysuj risk.`}`,
        `Performance: ${winRate.toFixed(1)}% WR, $${totalPnL} P&L za ${stats.totalTrades} obchodu. ${stats.consecutiveWins > 0 ? `Aktualni win streak ${stats.consecutiveWins} - neprekracuj riziko kvuli euforii.` : ""} ${revengeTrades > 0 ? `Revenge trading: ${revengeTrades} pripadu = tvuj nejvetsi leak k eliminaci.` : "Revenge trading: 0 - vyborna emocni kontrola."}`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    }
  } else {
    // COACH mode
    const consecutiveLosses = stats.consecutiveLosses
    const totalTrades = traderProfile?.performance.totalTrades || stats.totalTrades

    if (consecutiveLosses >= 3) {
      const responses = isEn ? [
        `${consecutiveLosses} losses in a row = you need a system, not motivation. Hard rule for 7 days: "2 losses = end of day". Record each day: Did I follow it? YES/NO. Goal: 7/7 days. If you break it - restart the counter. This is a discipline test, not a trading test.`,
        `Reset protocol for 7 days: 1) Max 3 trades per day. 2) After each loss 15min break - physically get up from PC. 3) After 2 losses end of day. Every evening write compliance score 1-10. Goal: average 9+. Start TOMORROW.`,
        `System for regaining control: Next 7 days trade ONLY your 2 best setups. No experimenting, no "this time is different". Before each entry say out loud: "Does this meet my criteria?" If you hesitate = skip. Measure: Number of skipped vs followed trades.`,
      ] : [
        `${consecutiveLosses} ztrat v rade = potrebujes system, ne motivaci. Tvrdé pravidlo na 7 dní: "2 ztraty = konec dne". Zapis si kazdy den: Dodrzel jsem? ANO/NE. Cil: 7/7 dni. Pokud porusis - restartuj pocitadlo.`,
        `Restart protokol na 7 dni: 1) Max 3 obchody denne. 2) Po kazde ztrate 15min pauza - fyzicky vstanes od PC. 3) Po 2 ztratach konec dne. Kazdy vecer zapiš compliance score 1-10. Cil: prumer 9+.`,
        `System pro obnovu kontroly: Pristich 7 dni traduj POUZE sve 2 nejlepsi setupy. Zadne experimentovani, zadne "tentokrat je to jine". Pred kazdym vstupem nahlas rekni: "Splnuje to moje kriteria?" Pokud vahas = preskoc.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else if (totalTrades < 50) {
      const responses = isEn ? [
        `You have ${totalTrades} trades - you're in the system-building phase. Goal for 30 days: 1) Morning Check every day. 2) Before each trade write WHY you're entering. 3) After each trade write WHAT you learned. Measure: Number of fully documented trades. P&L is secondary now.`,
        `${totalTrades} trades = learning phase. Your system for 30 days: Create a pre-trade checklist of 5 points (setup, entry, stop, target, risk). NO trade without all 5. Record compliance: how many of the 5 points you met. Goal: 100% compliance, NOT profit.`,
        `With ${totalTrades} trades, build habits: Habit chain = Morning Check -> Trading Plan -> Execution -> Evening Review. Every day all 4 steps. Record your streak - how many consecutive days you completed all 4. Goal: 21 days unbroken.`,
      ] : [
        `Mas ${totalTrades} obchodu - jsi ve fazi budovani systemu. Cil na 30 dni: 1) Kazdy den Ranni Kontrola. 2) Pred kazdym obchodem zapíš PROC vstupujes. 3) Po kazdem obchodu zapíš CO jsi se naucil.`,
        `${totalTrades} obchodu = faze uceni. Tvuj system na 30 dni: Vytvor si pre-trade checklist 5 bodu (setup, entry, stop, target, risk). ZADNY obchod bez vsech 5. Zaznamenavej compliance: kolik z 5 bodu jsi splnil.`,
        `Se ${totalTrades} obchody buduj navyky: Habit chain = Ranni Kontrola -> Obchodni Plan -> Exekuce -> Vecerni Review. Kazdý den vsechny 4 kroky. Zapis si streak - kolik dni za sebou jsi dokoncil vsechny 4.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const responses = isEn ? [
        `${totalTrades} trades = time to optimize. Task for this week: Go through your last 10 winning and 10 losing trades. Look for: What time? What setup? What mood? Write down 3 common characteristics of wins and 3 of losses. Then trade ONLY setups matching the wins.`,
        `Next level: Add a "setup quality score" 1-10 BEFORE each trade. After 30 days evaluate: Which score has the highest win rate? Then set the rule: I enter ONLY at score 8+. This eliminates weak setups automatically.`,
        `System upgrade: Pre-trade ritual for 60 seconds: 1) Name setup out loud. 2) Say entry, stop, target out loud. 3) Rate 1-10 how well it matches the plan. 4) Below 8 = skip. This ritual activates the logical brain and reduces impulsive entries by 40-60%.`,
      ] : [
        `${totalTrades} obchodu = cas na optimalizaci. Ukol na tento tyden: Projdi poslednich 10 vyhernich a 10 ztratovych obchodu. Hledej: V jakem case? Jaky setup? Jaka nalada? Zapiš si 3 spolecne znaky vyher a 3 spolecne znaky ztrat.`,
        `Dalsi level: Pridej "setup quality score" 1-10 PRED kazdym obchodem. Po 30 dnech vyhodnoť: Jaky score ma nejvetsi win rate? Pak nastav pravidlo: Vstupuji POUZE pri score 8+.`,
        `System upgrade: Pre-trade ritual na 60 sekund: 1) Nahlas pojmenuj setup. 2) Nahlas rekni entry, stop, target. 3) Ohodnot 1-10 jak moc odpovidá planu. 4) Pod 8 = preskoc.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    }
  }

  return response
}

const personalityInstructions = {
  calm: `\n\nOSOBNOST: Klidny terapeut. Ton: Teply, chapajici. "Chapu", "Pojdme to resit spolecne". Validuj pocity, pak ved k KONKRETNI akci. NIKDY si nevymyslej cisla. VZDY cesky.`,

  strict: `\n\nOSOBNOST: Prisny kouc. Ton: Primy, nulova tolerance pro vymluvy. Prikazy: "PRESTAN", "UDELEJ". Upozorni na chyby s KONKRETNIMA daty, pozaduj okamzitou akci. NIKDY si nevymyslej cisla. VZDY cesky.`,

  analytical: `\n\nOSOBNOST: Datovy analytik. Ton: Klinicky, objektivni. Pouzivej POUZE cisla z dat - NIKDY si nevymyslej statistiky, procenta ani korelace ktere nejsou v kontextu. Doporucuj na zaklade dat. VZDY cesky.`,

  balanced: `\n\nOSOBNOST: Vyrovnany kouc. Ton: Profesionalni ale podporujici. Uznej emoci, prepni na KONKRETNI akci. "Chapu A zaroven tady je co udelame". NIKDY si nevymyslej cisla. VZDY cesky.`,
}

export async function POST(req: NextRequest) {
  try {
    let body: ChatRequest
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: "Request body must be valid JSON",
          usingMockAI: false,
        },
        { status: 400 },
      )
    }

    const { message, personality, mode, context, userData, traderProfile } = body

    if (!message || !personality || !mode || !context || !userData) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Request must include: message, personality, mode, context, userData",
          usingMockAI: false,
        },
        { status: 400 },
      )
    }

    const hasApiKey = Boolean(process.env.OPENAI_API_KEY)

    if (!hasApiKey) {
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2500))

      const mockResponse = generateEnhancedMockResponse(body)

      return NextResponse.json({
        response: mockResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: true,
      })
    }

    const { trades, journals, selfReportHistory, stats, patterns } = userData

    const isAnalyticsMode = mode === "analytics"

    // Analyze recent patterns
    const recentLosses = trades.filter((t) => (t.pnl || 0) < 0).slice(0, 5)
    const consecutiveLossStreak = stats.consecutiveLosses
    const highStressTrades = trades.filter((t) => (t.stress || 0) >= 7).length
    const revengeTrades = trades.filter((t) => t.isRevengeTrade).length
    const lossesAfter3pm = trades.filter((t) => {
      const hour = new Date(t.date).getHours()
      return hour >= 15 && (t.pnl || 0) < 0
    }).length

    let dataSummary = `USER QUESTION: "${message}"

═══════════════════════════════════════════════════════════
🚨 CURRENT STATE (RIGHT NOW):
═══════════════════════════════════════════════════════════
${consecutiveLossStreak > 0 ? `\n🚨 ALERT: ${consecutiveLossStreak} CONSECUTIVE LOSSES ACTIVE` : ""}
${stats.consecutiveWins > 0 ? `\n✅ STREAK: ${stats.consecutiveWins} consecutive wins` : ""}

TRADER PROFILE (LAST ${traderProfile?.period.days || 30} DAYS):
${
  traderProfile
    ? `
PERFORMANCE:
- Total Trades: ${traderProfile.performance.totalTrades}
- Win Rate: ${traderProfile.performance.winRate}%
- Total P&L: $${traderProfile.performance.totalPnL}
- Best Trade: $${traderProfile.performance.bestTrade}
- Worst Trade: $${traderProfile.performance.worstTrade}
- Consecutive Wins: ${traderProfile.performance.consecutiveWins}
- Consecutive Losses: ${traderProfile.performance.consecutiveLosses}
- Average Win: $${traderProfile.performance.averageWin}
- Average Loss: $${traderProfile.performance.averageLoss}

BEHAVIORAL PATTERNS:
- Revenge Trade Rate: ${traderProfile.patterns.revengeTradeRate}%
- Revenge Trades: ${traderProfile.patterns.revengeTrades}
- Emotional Trades: ${traderProfile.patterns.emotionalTrades}

ACTIVE GOALS:
${
  traderProfile.goals.length > 0
    ? traderProfile.goals
        .map((g) => `- ${g.title}: ${g.progress.toFixed(0)}% (${g.currentValue}/${g.targetValue}) - ${g.status}`)
        .join("\n")
    : "- No active goals"
}
`
    : `- No trader profile available (insufficient data)`
}

═══════════════════════════════════════════════════════════
⚠️ IDENTIFIED PATTERNS (LAST 30 DAYS):
═══════════════════════════════════════════════════════════
${revengeTrades > 0 ? `🔴 REVENGE TRADING: ${revengeTrades} trades flagged as revenge (${((revengeTrades / trades.length) * 100).toFixed(0)}% of total)` : "✅ No revenge trading detected"}
${highStressTrades > 0 ? `⚠️ HIGH-STRESS TRADING: ${highStressTrades} trades taken when stress ≥7/10` : ""}
${lossesAfter3pm > 0 ? `⚠️ LATE-DAY LOSSES: ${lossesAfter3pm} losing trades after 3pm` : ""}
${consecutiveLossStreak >= 3 ? `🚨 CRITICAL: ${consecutiveLossStreak} consecutive losses = REVENGE RISK ZONE` : ""}
${patterns?.revengeRate ? `- Revenge Trade Rate: ${patterns.revengeRate}% ${Number.parseFloat(patterns.revengeRate) > 15 ? "🔴 HIGH" : "✅ OK"}` : ""}
${patterns?.fomoRate ? `- FOMO Rate: ${patterns.fomoRate}%` : ""}

═══════════════════════════════════════════════════════════
📊 RECENT TRADES (LAST 5):
═══════════════════════════════════════════════════════════
${trades
  .slice(0, 5)
  .map((t, i) => {
    const result = (t.pnl || 0) > 0 ? "✅ WIN" : "❌ LOSS"
    const stressFlag = (t.stress || 0) >= 7 ? " 🔴 HIGH STRESS" : ""
    const revengeFlag = t.isRevengeTrade ? " ⚠️ REVENGE" : ""
    return `${i + 1}. ${t.pair || "N/A"} ${t.type || ""}: ${result} $${t.pnl?.toFixed(0) || "0"}${stressFlag}${revengeFlag}${t.notes ? `\n   Notes: "${t.notes.substring(0, 60)}"` : ""}`
  })
  .join("\n")}`

    // Self-reported "Quick FOMO Tag" check-ins (from the Daily Tracker
    // page) - ground truth from the trader himself. selfReportHistory holds
    // up to the last 7 days (today included if present); never guess what
    // happened on a day that's covered here, just reflect it back. Falls
    // back to scanning journals directly for older clients that don't send
    // selfReportHistory yet.
    const todayStr = new Date().toISOString().split("T")[0]
    const selfReportTagLabels: Record<string, string> = {
      FOMO_overcome: "USTAL FOMO impuls (nenaskocil do rozjeteho pohybu)",
      FOMO_chased: "NASKOCIL do FOMO pohybu",
      REVENGE_TRADING: "REVENGE TRADING (snaha pomstit se trhu po ztrate)",
      EARLY_CLOSE: "BRZKE UZAVRENI pozice ze strachu o zisk",
      CLEAN_DAY: "BEZCHYBNY DEN (dodrzen plan)",
    }
    const selfReportHist =
      selfReportHistory && selfReportHistory.length > 0
        ? selfReportHistory
        : (() => {
            const todayJournal = journals.find((j) => j.id === `daily-summary-${todayStr}`)
            const tags = (todayJournal?.tags || []).filter((t) => selfReportTagLabels[t])
            return tags.length > 0 ? [{ date: todayStr, tags, marketConditions: todayJournal?.marketConditions }] : []
          })()

    const todayEntry = selfReportHist.find((h) => h.date === todayStr)
    const todaySelfReportTags = (todayEntry?.tags || []).filter((t) => selfReportTagLabels[t])
    if (todaySelfReportTags.length > 0) {
      dataSummary += `

═══════════════════════════════════════════════════════════
✅ DNESNI SELF-REPORT (sam oznacil, NEHADEJ - pouzij presne tohle):
═══════════════════════════════════════════════════════════
${todaySelfReportTags.map((t) => `- ${selfReportTagLabels[t]}`).join("\n")}
${todayEntry?.marketConditions ? `- Trh/instrument v tu dobu: ${todayEntry.marketConditions}` : ""}`
    }

    // Multi-day pattern: counts over the recorded history plus a same-tag
    // streak counted back from the most recent day, so Claude can reference
    // trends ("treti den v rade kdy...") instead of only ever seeing today.
    const pastSelfReportHist = selfReportHist.filter((h) => h.date !== todayStr)
    if (pastSelfReportHist.length > 0) {
      const tagCounts: Record<string, number> = {}
      pastSelfReportHist.forEach((h) => h.tags.forEach((t) => {
        if (selfReportTagLabels[t]) tagCounts[t] = (tagCounts[t] || 0) + 1
      }))
      const calcStreak = (tag: string) => {
        let streak = 0
        for (const h of selfReportHist) {
          if (h.tags.includes(tag)) streak++
          else break
        }
        return streak
      }
      const streakLines = Object.keys(selfReportTagLabels)
        .map((t) => ({ t, streak: calcStreak(t) }))
        .filter((s) => s.streak >= 2)
        .map((s) => `- 🔥 ${selfReportTagLabels[s.t]}: ${s.streak} dny v rade (vcetne dnes, pokud je dnes zaznamenano)`)
      const trendLines = Object.entries(tagCounts).map(
        ([t, count]) => `- ${selfReportTagLabels[t]}: ${count}x za poslednich ${pastSelfReportHist.length} zaznamenanych dni`,
      )
      if (trendLines.length > 0 || streakLines.length > 0) {
        dataSummary += `

═══════════════════════════════════════════════════════════
📊 TREND SELF-REPORTU ZA POSLEDNI DNY (vyuzij k odkazu na vzorec, ne jen na dnesek):
═══════════════════════════════════════════════════════════
${[...streakLines, ...trendLines].join("\n")}`
      }
    }

    if (isAnalyticsMode) {
      dataSummary += `

EMOTIONAL PATTERNS FROM ANALYTICS:
${
  patterns
    ? `- FOMO Trades: ${patterns.fomoRate}%
- Revenge Trades: ${patterns.revengeRate}%
- Overconfident Trades: ${patterns.overconfidenceRate}%
- Fear-based Trades: ${patterns.fearRate}%`
    : "- No pattern data available"
}

RECENT TRADES WITH EMOTIONS:
${trades
  .slice(0, 10)
  .map((t, i) => {
    let emotionInfo = ""
    if (t.emotionBefore) emotionInfo += ` (před: ${t.emotionBefore})`
    if (t.emotionDuring) emotionInfo += ` (během: ${t.emotionDuring})`
    if (t.emotionAfter) emotionInfo += ` (po: ${t.emotionAfter})`
    if (t.isRevengeTrade) emotionInfo += " [REVENGE]"
    if (t.tags?.includes("FOMO")) emotionInfo += " [FOMO]"
    return `${i + 1}. ${t.pair || "N/A"} ${t.type || ""}: $${t.pnl?.toFixed(0) || "0"}${emotionInfo}`
  })
  .join("\n")}`
    }

    dataSummary += `

ODPOVEZ PODLE REZIMU (${mode.toUpperCase()}):
${mode === "mind" ? "- Zamer se na psychologii a mentalni stav. Dej KONKRETNI techniku/postup." : ""}
${mode === "analytics" ? "- Zamer se na cisla a korelace. POUZE z dat vyse - NIKDY si nevymyslej." : ""}
${mode === "coach" ? "- Zamer se na systemy a navyky. Dej KONKRETNI plan s kroky a metrikami." : ""}

KRITICKA PRAVIDLA (PORUSENI = FAIL):
1. MAX 3-4 vety. BEZ markdown. VZDY cesky.
2. PRIMO k veci - ZADNE uvody ("Vidim ze...", "Na zaklade dat...")
3. NIKDY si NEVYMYSLEJ cisla ktera NEJSOU v datech vyse
4. Pokud nemas data = rekni "Nemam dostatek dat"
5. Odpovez na OTAZKU uzivatele, ne na jeho data
6. Kazda rada = KONKRETNI akce (CO + KDY + JAK merit uspech)
7. ZAKAZANO: "pracuj na sobe", "zlepsuj disciplinu", "bud konzistentni", "trading je maraton"
8. ZAKAZANO: vymyslene procenta, vymyslene korelace, vymyslene dolary
9. Pokud je v datech sekce "DNESNI SELF-REPORT" - trader UZ SAM oznacil co se dnes stalo. NEHADEJ a NEPTEJ se na to znovu, primo na to reaguj a rozeber to s nim (pochval pri "USTAL"/"BEZCHYBNY DEN", proved pri "NASKOCIL"/"REVENGE"/"BRZKE UZAVRENI")
10. Pokud je v datech sekce "TREND SELF-REPORTU" - pouzij ji k odkazu na vzorec za vic dni (napr. "treti den v rade ustal FOMO" nebo "tohle uz je druhy den s revenge tradingem"), nejen na dnesek`

    try {
      const message = await getClient().messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        temperature: 0.35,
        system: MODE_PROMPTS[mode] + personalityInstructions[personality],
        messages: [
          { role: "user", content: dataSummary },
        ],
      })

      const aiResponse = message.content[0].type === "text" ? message.content[0].text : "Error generating response"

      return NextResponse.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: false,
      })
    } catch (openaiError: any) {
      console.error("❌ Claude API Error:", openaiError)

      const mockResponse = generateEnhancedMockResponse(body)

      return NextResponse.json({
        response: mockResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: true,
        fallbackReason: openaiError.message || "OpenAI API error",
      })
    }
  } catch (error: any) {
    console.error("❌ MindTrader API Error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: error?.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
        usingMockAI: false,
      },
      { status: 500 },
    )
  }
}
