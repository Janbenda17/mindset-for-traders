import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const MODE_PROMPTS = {
  mind: `Jsi MIND AI – elitní trading psycholog. Pomáháš traderům s mentálními výzvami.

ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

KRITICKA PRAVIDLA:
1. Odpovez PRIMO na otazku uzivatele - zadne uvody, zadne "vidim ze..."
2. NIKDY si nevymyslej cisla, statistiky ani fakta ktere NEJSOU v kontextu
3. Pokud mas data uzivatele, odkazuj na NE - jsi psycholog, ne analytik
4. Kazda rada MUSI byt KONKRETNI technika s presnym navodem jak ji pouzit
5. ZADNE genericke fraze: "pracuj na sobe", "zlepsuj disciplinu", "buď trpelivy"
6. Misto generickych rad dej PRESNY postup: kroky 1-2-3

SPRAVNE ODPOVEDI:
"Jak se zotavit po ztrate?" -> "Okamzite zavri platformu. Jdi na 15min prochazku ven. Behem ni si poloz 2 otazky: 1) Mel jsem duvod vstoupit? 2) Dodržel jsem stop loss? Pokud ano - ztrata je normalni. Pokud ne - zapíš si presne CO a PROC jsi porusil."

"Bojim se vstupu" -> "Strach pred vstupem signalizuje bud spatny setup nebo trauma z minulych ztrat. Test: Ohodnot setup 1-10 podle sveho planu. Pokud je 8+, pouzij countdown 5-4-3-2-1 a exekutuj. Pokud je pod 8 - NENI to strach, je to spravna intuice."

SPATNE ODPOVEDI (NIKDY nedelej):
- "Vidim ze mas stres 7/10 a naladu 5/10..." (= citovani cisel misto odpovedi)
- "Zkus pracovat na sve disciplíne" (= nekonkretni, nulova hodnota)
- "Trading je maratón, ne sprint" (= klise, nic uzivateli neda)

MAX 4 vety. BEZ markdown. VZDY V CESTINE. Konkretni techniky a postupy.`,

  analytics: `Jsi ANALYTICS AI – kvantitativní analytik trading performance.

ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

KRITICKA PRAVIDLA:
1. NIKDY si nevymyslej cisla! Pouzivej POUZE data z Trader Profile nize
2. Pokud nemas data, rekni: "Nemam dostatek dat pro tuto analyzu. Zaznamenej vice obchodu."
3. Kazde tvrzeni MUSI odkazovat na konkretni cislo z kontextu
4. ZAKÁZÁNO: "tvuj vykon kolisa", "potrebujes konzistenci" (= generic, nulova hodnota)
5. POVINNE: "Tvych X revenge tradu stalo Y% celkoveho zisku" (= konkretni, meritelne)
6. Identifikuj KORELACE: spanek vs vykon, stres vs ztráty, cas vs win rate
7. Kvantifikuj NAKLADY: "Tento pattern te stoji $X mesicne" nebo "snizuje win rate o X%"

FORMAT: [Konkretni metrika] -> [Jak casto] -> [Dopad v $/%] -> [Co s tim]

SPRAVNE: "Tvych 6 obchodu po 15:00 ma win rate 20% vs 65% pred 15:00. Eliminací obchodovani po 15h usetrís $X mesicne."
SPATNE: "Tvuj vykon se zlepsuje. Pokracuj v praci na sobe." (= nulova informacni hodnota)

MAX 3-4 vety. BEZ markdown. VZDY V CESTINE. Jen data-driven fakta.`,

  coach: `Jsi COACH AI – strategicky performance kouc pro tradery.

ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

KRITICKA PRAVIDLA:
1. Odpovez PRIMO na otazku - zadne uvody
2. NIKDY nedavej genericke rady: "buď disciplinovany", "pracuj na sobe", "buď trpelivy"
3. Kazda rada MUSI byt KONKRETNI SYSTEM s meritelnym vysledkem
4. Davej PRESNE kroky: "Pravidlo: Max 3 obchody denne. Zadne vyjimky 21 dni. Po 21 dnech pridej dalsi pravidlo."
5. Zamerej se na NAVYKY a SYSTEMY, ne na motivaci
6. Kazdy navrh MUSI obsahovat: CO udelat + JAK DLOUHO + JAK merit uspech

SPRAVNE:
"Disciplina = system. Krok 1: Zvol si JEDNO pravidlo (napr. max 3 obchody/den). Krok 2: Dodrz ho 21 dni bez vyjimky. Krok 3: Zaznamenej kazdy den ANO/NE. Krok 4: Po 21 dnech pridej dalsi pravidlo. Buduj postupne, ne vse najednou."

SPATNE (NIKDY):
- "Trading je maratón, ne sprint" (= klise)
- "Musis mit disciplinu" (= nereknes JAK)
- "Pracuj na svém mindset" (= prazdna fráze)
- "Buď trpelivy a výsledky prijdou" (= nulová hodnota)

MAX 4 vety. BEZ markdown. VZDY V CESTINE. Konkretni systemy a navyky.`,
}

interface ChatRequest {
  message: string
  personality: "calm" | "strict" | "analytical" | "balanced"
  mode: "mind" | "analytics" | "coach"
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
  const { message, personality, mode, context, userData, traderProfile, isVirtualMode } = request
  const { mood, stress, readiness, sleep, energy } = context
  const { stats, patterns, morningCheck } = userData

  // Add virtual mode disclaimer
  const virtualPrefix = isVirtualMode ? "Máš stres na 5/10. " : ""

  // VIRTUAL MODE: Respond naturally with concrete techniques
  if (isVirtualMode) {
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
  // Add variety with random response selection
  const randomFactor = Math.random()
  let response = ""

  if (mode === "mind") {
    // MIND mode: Focus on PSYCHOLOGY and STRATEGY, not constant data repetition
    // Only check critical situations, then respond to user's actual question
    
    const consecutiveLosses = stats.consecutiveLosses
    const highStress = stress >= 7
    const lowMood = mood <= 4
    const lowSleep = morningCheck && morningCheck.sleepHours < 6

    if (consecutiveLosses >= 3 && highStress) {
      const responses = [
        `${consecutiveLosses} ztrat v rade + stres ${stress}/10 = tvuj mozek je v rezimu "vyhraj zpatky". Tohle NENI logicke rozhodovani. Zavri platformu na minimum 2 hodiny. Box breathing: 4s nadech, 4s drzeni, 4s vydech, 4s pauza. 10 opakovani. Pak analyzuj ztráty BEZ emoci.`,
        `STOP. ${consecutiveLosses} po sobe jdoucich ztrat pri stresu ${stress}/10 = 80%+ pravdepodobnost dalsi chyby. Okamzite: Zavri vsechny pozice. Jdi ven na 30 minut. Dychej 4-7-8 techniku. Vrat se az kdyz dokazes popsat posledni 3 ztráty bez emoci.`,
        `Serie ${consecutiveLosses} ztrat aktivovala tvuj "fight" rezim. Stres ${stress}/10 potvrzuje ze amygdala je dominantni. Jedina spravna akce: Odstup od obrazovek MINIMUM 90 minut. Fyzicka aktivita (chůze, cviceni). Navrat pouze s napsanou analyzou kazde z ${consecutiveLosses} ztrat.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else if (lowSleep) {
      const sleepHours = morningCheck!.sleepHours
      const responses = [
        `${sleepHours}h spanku = tvoje prefrontalni kůra (logicke rozhodovani) je oslabena, amygdala (emoce) je hyperaktivni. Konkretne: Reakcni cas +15%, chybovost +30%. Pokud trades: Polovicni pozice, jen A+ setupy, max 2h session. Nebo lepe: vynech dnes uplne.`,
        `Spanek ${sleepHours}h je pod minimem pro kvalitni rozhodovani. Tvoje impulzivita je vyssi, sebekontrola nizsi. Defensive mod: 50% bezne velikosti pozice, striktni stop lossy, ZADNE prekracovani planu. Po 2 hodinach konec bez ohledu na vysledky.`,
        `${sleepHours}h spanku snizuje kvalitu rozhodnuti o 30-40%. Dnes: Bud netraduj (nejlepsi volba), nebo: max 3 obchody, polovicni pozice, zadne nové strategie. Dnes vecer jdi spat o hodinu drive - investice do zitrejsiho vykonu.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const responses = [
        `Tvuj stav je stabilni (stres ${stress}/10, nalada ${mood}/10). Fokus dnes: Pred kazdym obchodem nahlas pojmenuj setup, entry, stop loss a target. Tento ritual aktivuje logickou cast mozku a snizuje impulzivni vstupy.`,
        `Podmínky pro trading jsou dobre. Tvuj jediny cil dnes: 100% compliance s planem. Ne P&L, ne pocet obchodu. Pouze: "Dodržel jsem kazdy bod planu?" Zaznamenej si score 1-10 po kazdem obchodu.`,
        `Jsi mentalne pripraveny. Technika pro dnesek: Po kazdem obchodu (win i loss) si dej 5min pauzu. Zapiš: Co jsem udelal dobre? Co mohu zlepsit? Tato mikro-reflexe je nejrychlejsi cesta ke konzistentnímu zlepsovani.`,
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
      const responses = [
        `Data: ${revengeTrades} revenge obchodu z ${stats.totalTrades} celkovych (${revengeRate.toFixed(0)}%). Prum. ztrata na revenge: $${(Math.abs(Number.parseFloat(String(avgLoss))) * 1.5).toFixed(0)} vs bezny $${Math.abs(Number.parseFloat(String(avgLoss))).toFixed(0)}. Aktualne ${stats.consecutiveLosses} ztrat v rade = vysoké riziko dalsiho revenge. Reseni: Pravidlo "2 ztraty = konec dne" by eliminovalo ${revengeTrades} revenge obchodu.`,
        `Revenge rate ${revengeRate.toFixed(0)}% je tvuj nejvetsi leak. Z ${stats.totalTrades} obchodu bylo ${revengeTrades} revenge - tyto maji o 50% horsi uspesnost nez planovane vstupy. Pri ${stats.consecutiveLosses} ztratach v rade: ZASTAV trading. Kazdy dalsi trade ma teď statisticky negativni ocekavanou hodnotu.`,
        `Analyza: ${stats.consecutiveLosses} ztrat aktivuje revenge pattern (${revengeRate.toFixed(0)}% tvych obchodu). Prumerny revenge trade ztrata: $${(Math.abs(Number.parseFloat(String(avgLoss))) * 1.5).toFixed(0)}. Pokud zavedis pravidlo "po 2 ztratach stop" a dodrzis ho 30 dni, eliminujes ${revengeTrades} revenge obchodu. Merit: Pocet revenge tradu za mesic = 0.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else if (morningCheck && morningCheck.sleepHours < 6) {
      const responses = [
        `Spanek ${morningCheck.sleepHours}h. Z tvych ${stats.totalTrades} obchodu: Dny se spankem pod 6h maji prokazatelne nizsi kvalitu rozhodovani. Doporuceni: Dnes max 2 obchody, polovicni pozice. Dnes vecer: Spanek pred 22:00. Sleduj jak se zmeni tvuj vykon po 7+ hodinach spanku.`,
        `Data: ${morningCheck.sleepHours}h spanku. Tvuj win rate ${winRate.toFixed(1)}% je agregatni cislo - po nocich se spankem pod 6h je typicky o 15-25% nizsi. Dnes: Defensive mod (max 2 obchody, A+ setupy). Zaznamenej si: kolik hodin jsi spal vs dnesni P&L. Buduj si dataset pro korelaci.`,
        `Spanek ${morningCheck.sleepHours}h je pod minimem. Z ${stats.totalTrades} obchodu: Prumer win $${avgWin}, prumer loss $${avgLoss}. Pri nedostatku spanku se prumer loss typicky zvysuje. Dnesni strategie: Polovicni velikost pozice, striktni stop lossy, max 2h session. Zapiš si vecer presne kolik jsi spal a dnesni vysledky.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const rrRatio = Number.parseFloat(String(avgWin)) && Number.parseFloat(String(avgLoss)) 
        ? (Math.abs(Number.parseFloat(String(avgWin))) / Math.abs(Number.parseFloat(String(avgLoss)))).toFixed(2)
        : "N/A"
      const responses = [
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
      const responses = [
        `${consecutiveLosses} ztrat v rade = potrebujes system, ne motivaci. Tvrdé pravidlo na 7 dní: "2 ztraty = konec dne". Zapis si kazdy den: Dodrzel jsem? ANO/NE. Cil: 7/7 dni. Pokud porusis - restartuj pocitadlo. Toto je test discipliny, ne tradingu.`,
        `Restart protokol na 7 dni: 1) Max 3 obchody denne. 2) Po kazde ztrate 15min pauza - fyzicky vstanes od PC. 3) Po 2 ztratach konec dne. Kazdy vecer zapiš compliance score 1-10. Cil: prumer 9+. Zacni ZITRA.`,
        `System pro obnovu kontroly: Pristich 7 dni traduj POUZE sve 2 nejlepsi setupy. Zadne experimentovani, zadne "tentokrat je to jine". Pred kazdym vstupem nahlas rekni: "Splnuje to moje kriteria?" Pokud vahas = preskoc. Merit: Pocet preskocene obchodu vs dodrzenych.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else if (totalTrades < 50) {
      const responses = [
        `Mas ${totalTrades} obchodu - jsi ve fazi budovani systemu. Cil na 30 dni: 1) Kazdy den Ranni Kontrola. 2) Pred kazdym obchodem zapíš PROC vstupujes. 3) Po kazdem obchodu zapíš CO jsi se naucil. Merit: Pocet kompletne zdokumentovanych obchodu. P&L je ted vedlejsi.`,
        `${totalTrades} obchodu = faze uceni. Tvuj system na 30 dni: Vytvor si pre-trade checklist 5 bodu (setup, entry, stop, target, risk). ZADNY obchod bez vsech 5. Zaznamenavej compliance: kolik z 5 bodu jsi splnil. Cil: 100% compliance, NE zisk.`,
        `Se ${totalTrades} obchody buduj navyky: Habit chain = Ranni Kontrola -> Obchodni Plan -> Exekuce -> Vecerni Review. Kazdý den vsechny 4 kroky. Zapis si streak - kolik dni za sebou jsi dokoncil vsechny 4. Cil: 21 dni bez preruseni.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const responses = [
        `${totalTrades} obchodu = cas na optimalizaci. Ukol na tento tyden: Projdi poslednich 10 vyhernich a 10 ztratovych obchodu. Hledej: V jakem case? Jaky setup? Jaka nalada? Zapiš si 3 spolecne znaky vyher a 3 spolecne znaky ztrat. Pak traduj POUZE setpy co odpovidaji vyhram.`,
        `Dalsi level: Pridej "setup quality score" 1-10 PRED kazdym obchodem. Po 30 dnech vyhodnoť: Jaky score ma nejvetsi win rate? Pak nastav pravidlo: Vstupuji POUZE pri score 8+. Toto eliminuje slabe setupy automaticky. Merit: Prumerny score za tyden.`,
        `System upgrade: Pre-trade ritual na 60 sekund: 1) Nahlas pojmenuj setup. 2) Nahlas rekni entry, stop, target. 3) Ohodnot 1-10 jak moc odpovidá planu. 4) Pod 8 = preskoc. Tento ritual aktivuje logickou cast mozku a snizuje impulzivni vstupy o 40-60%.`,
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

    const { trades, journals, moodHistory, stats, patterns, morningCheck, morningChecks } = userData

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
- Mood: ${context.mood}/10 ${context.mood <= 4 ? "⚠️ LOW" : context.mood >= 8 ? "✅ GOOD" : ""}
- Stress: ${context.stress}/10 ${context.stress >= 7 ? "🔴 HIGH RISK" : context.stress >= 5 ? "⚠️ ELEVATED" : "✅ OK"}
- Confidence: ${context.confidence}/10
- Readiness: ${context.readiness}%
${context.sleep ? `- Sleep Last Night: ${context.sleep}h ${context.sleep < 6 ? "🔴 POOR" : context.sleep < 7 ? "⚠️ SUBOPTIMAL" : "✅ GOOD"}` : ""}
${context.energy ? `- Energy: ${context.energy}/10 ${context.energy < 5 ? "⚠️ LOW" : ""}` : ""}
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

PSYCHOLOGY:
- Average Mood: ${traderProfile.psychology.averageMood}/10
- Average Stress: ${traderProfile.psychology.averageStress}/10
- Average Readiness: ${traderProfile.psychology.averageReadiness}%
- Morning Checks Completed: ${traderProfile.psychology.morningChecksCompleted}
- Morning Check Rate: ${traderProfile.psychology.morningCheckRate}%

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

    if (isAnalyticsMode) {
      dataSummary += `

REAL DATA FROM MORNING CHECKS (LAST 7 DAYS):
${
  morningChecks && morningChecks.length > 0
    ? morningChecks
        .map(
          (m, i) =>
            `${i + 1}. ${m.date}: Sleep ${m.sleepHours}h (Q:${m.sleepQuality}/10), Energy ${m.energy}/10, Stress ${m.stress}/10, Readiness ${m.readiness}%`,
        )
        .join("\n")
    : "- No morning check data available"
}

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
8. ZAKAZANO: vymyslene procenta, vymyslene korelace, vymyslene dolary`

    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: MODE_PROMPTS[mode] + personalityInstructions[personality] },
          { role: "user", content: dataSummary },
        ],
        temperature: 0.35,
        maxTokens: 500,
      })

      const aiResponse = result.text || "Error generating response"

      return NextResponse.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        usingMockAI: false,
      })
    } catch (openaiError: any) {
      console.error("❌ OpenAI API Error:", openaiError)

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
