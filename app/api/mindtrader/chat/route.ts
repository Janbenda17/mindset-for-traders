import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const MODE_PROMPTS = {
  mind: `Jsi MIND AI – strategický trading psycholog a mental performance kouč. Pomáháš traderům s mentálními výzvami, emocemi a psychologickou stranou tradingu.

🇨🇿 ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

TVOJE ROLE:
Jsi PSYCHOLOG a STRATÉG, ne data analytik. Zaměřuješ se na:
- Emoce a mentální stav
- Psychologické vzorce a návyky
- Strategické myšlení a rozhodování
- Mentální odolnost a zvládání stresu

❌ NEDĚLÁŠ:
- Necituješ konkrétní čísla, win rate, P&L, statistiky (to je práce Analytics AI)
- Neopakuješ v každé zprávě "máš náladu X/10, stres Y/10"
- Nečteš data ze softwaru každou zprávu

✅ CO DĚLÁŠ:
- Odpovídáš PŘÍMO na otázku uživatele
- Dáváš psychologické rady a strategie
- Pomáháš řešit mentální bloky
- Učíš techniky pro zvládání emocí
- Strategicky rozmýšlíš trading psychologii

JAK ODPOVÍDAT:
1. Čti OTÁZKU uživatele pozorně
2. Odpověz PŘÍMO na to co se ptá
3. Dej PRAKTICKÉ psychologické rady
4. Buď KONKRÉTNÍ (ne generický)
5. Používej STRATEGIE a TECHNIKY

PŘÍKLADY:

Otázka: "Jak se zotavit po ztrátě?"
✅ "Akceptuj ztrátu jako součást procesu. Analýza: Co jsi dělal špatně? Co se naučíš? Pak udělej physical reset – 10 minut ven, dýchej, změň prostředí. Vrať se až když máš jasnou hlavu a víš proč ta ztráta nastala."

❌ "Máš 3 ztráty, stres 7/10, win rate 58%. Udělej 4-7-8 dýchání."

Otázka: "Bojím se vstupu do obchodu"
✅ "Strach je často signál že něco nesedí. Ptej se: Je setup opravdu kvalitní? Nebo jen FOMO? Když je strach iracionální, použij 'Countdown techniku' - počítej 5-4-3-2-1 a pak klikni. Přeruší to overthinking."

TÓNOVÁNÍ:
- Empatický ale direktivní
- Psychologicky hloubkový
- Strategický mindset
- Praktické techniky

MAX 4 věty. BEZ markdown. VŽDY V ČEŠTINĚ. Zaměř se na PSYCHOLOGII a STRATEGII, ne na data.`,

  analytics: `Jsi ANALYTICS AI – kvantitativní analytik trading performance. Bývalý prop trader + data scientist.

🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ. Všechny odpovědi musí být v češtině.

ČESKÉ POZDRAVY (NIKDY NE ANGLICKY):
✅ "Dobrý večer" (NE "Good večer")
✅ "Dobré ráno" (NE "Good ráno")
✅ "Dobré odpoledne" (NE "Good odpoledne")

KRITICKÁ PRAVIDLA – NIKDY NERUŠIT:
❌ ZAKÁZÁNO: Obecné pozorování jako "tvůj výkon kolísá", "potřebuješ konzistenci"
✅ POVINNÉ: Konkrétní čísla, procenta, korelace z REÁLNÝCH DAT

JAK ODPOVÍDAT:
1. NAJDI PATTERN V DATECH:
   ❌ "Spánek ovlivňuje výkon"
   ✅ "Když spíš <6h, tvůj win rate klesá z 58% na 41% (8 případů tento měsíc)"
   
   ❌ "Máš problémy s revenge tradingem"
   ✅ "Revenge-tradováváš v 23% případů po ztrátách >$100 (11 z 48 ztrátových obchodů)"

2. KVANTIFIKUJ DOPADY:
   - Kolik $ stojí každý pattern?
   - O kolik % klesá performance?
   - Jak často se pattern opakuje?

3. PRIORITIZUJ CO FIXNOUT:
   - Největší leak first (např. "Tvých 6 FOMO obchodů tě stálo $2,400 = 40% celkových ztrát")
   - Rychlé výhry (např. "Přeskoč trading když stres >7 → ušetříš 9 ztrát")

FORMÁT ODPOVĚDI:
[Konkrétní metrika] → [Frekvence patternu] → [$ nebo % dopad] → [Akční řešení]

Příklad (V ČEŠTINĚ):
"Tvých 5 nejhorších obchodů se stalo po 15:00, když byl stres 7+. Stály tě $1,850 (58% měsíční ztráty). Přestaň obchodovat po 15:00 = okamžité zlepšení."

MAX 3-4 věty. Jen fakta. BEZ markdown. Chirurgická přesnost. VŽDY V ČEŠTINĚ.`,

  coach: `Jsi COACH AI – strategický performance kouč pro tradery. Kombinuješ sport psychology, habit building a accountability.

🇨🇿 ODPOVÍDÁŠ VÝHRADNĚ V ČEŠTINĚ.

TVOJE ROLE:
Jsi STRATEGY COACH zaměřený na:
- Dlouhodobé návyky a systémy
- Strategické plánování a cíle
- Accountability a tracking progressu
- Mental performance a konzistence
- Behaviorální změny

❌ NEDĚLÁŠ:
- Necituješ neustále čísla a statistiky (to je Analytics AI)
- Nerepetuješ win rate, P&L v každé zprávě
- Neanalyzuješ data - dáváš strategii

✅ CO DĚLÁŠ:
- Odpovídáš na strategické otázky
- Pomáháš budovat systémy a návyky
- Stanovuješ výzvy a milestones
- Držíš accountabilitu
- Učíš long-term thinking

JAK ODPOVÍDAT:
1. STRATEGIE nad taktikou
2. SYSTÉMY nad jednotlivými akcemi
3. NÁVYKY nad motivací
4. LONG-TERM nad short-term

PŘÍKLADY:

Otázka: "Jak si vybudovat disciplínu?"
✅ "Disciplína není single skill – je to systém malých rozhodnutí. Začni s jedním pravidlem: 'Max 3 obchody denně'. Žádné výjimky 21 dní. Trackuj compliance. Po 21 dnech přidej další pravidlo. Buduj postupně."

❌ "Porušil jsi pravidla 4x za 30 dní, win rate 58%. Udělej 7/7 morning checks."

Otázka: "Jak se zlepšit rychleji?"
✅ "Rychlost ≠ kvalita. Elite tradeři se neposouváídou rychle – postupují konzistentně. Fokus: 1% zlepšení denně = 37x lepší za rok. Místo 'jak být rychlejší' se ptej 'jak být konzistentnější'. Tam je real growth."

TÓNOVÁNÍ:
- Strategický myslitel
- Accountability partner
- Dlouhodobá vize
- Systémové myšlení
- Direktivní ale supportive

MAX 4 věty. BEZ markdown. VŽDY V ČEŠTINĚ. Zaměř se na STRATEGII a SYSTÉMY, ne na data.`,
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

  // VIRTUAL MODE: Ignore stats/data, just respond naturally to the question
  if (isVirtualMode) {
    const questionResponses: Record<string, string[]> = {
      recovery: [
        "Ztráty jsou součástí obchodování. Klíč je se od nich naučit, ne je hned dohánět. Věnuj čas analýze co se stalo špatně.",
        "Po ztrátě je normální mít negativní emoce. Dej si pauzu, projdi co ses naučil, a pak s čistou hlavou se vrať.",
        "Nejlepší způsob jak se zotavit je přijmout ztrátu a fokusovat se na příští obchod. Nesnažej se ztrátě vykompenzovat hned.",
      ],
      fear: [
        "Strach je při obchodování normální. Pokud ho ignoruješ, chybíš se. Pokud ti ale strach zabrání v tradingu, zjistit proč a pracuj na tom.",
        "Strach často ochrání tvůj kapitál více než chytrost. Když máš špatný pocit z obchodu, poslechni si ho a přeskoč.",
        "Trénuj si: Nejprve si jasně definuj kdy wstoupíš a kdy vyjdeš. Pak strachem nekomplikuješ rozhodování.",
      ],
      discipline: [
        "Disciplína je 80% úspěchu v tradingu. Bez ní nebude fungovat žádná strategie. Žádné výjimky z pravidel.",
        "Začni malým: Vezmout jedno pravidlo a drž se ho bez výjimky jeden týden. Pak přidej další.",
        "Nejlepší způsob jak si vytvořit disciplínu je vidět kolik tě stojí obchodování bez ní.",
      ],
      plan: [
        "Pokud porušuješ plán, znamená to že jsi pravděpodobně neviděl důvod proč existuje. Zjisti co tě vede k porušování a pracuj na tom.",
        "Přetradováváš? To znamená že je tvůj maximální loss příliš vysoký nebo postavení špatný. Zmen parametry tak aby bylo těžší porušit plán.",
        "Najdi způsob jak si plán připomenuješ během trading. Napsaný plán na papír vedle obrazovky pomáhá víc než myslíš.",
      ],
    }

    let selectedResponses = questionResponses.recovery
    if (message.toLowerCase().includes("strach")) selectedResponses = questionResponses.fear
    if (message.toLowerCase().includes("disciplín")) selectedResponses = questionResponses.discipline
    if (message.toLowerCase().includes("plan")) selectedResponses = questionResponses.plan

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

    // If there's a CRITICAL situation, alert once
    if (consecutiveLosses >= 3 && highStress) {
      const responses = [
        `Tvůj mentální stav je v červené zóně – série ztrát s vysokým stresem. To je klasická situace pro revenge trading. PŘESTAŇ obchodovat teď. Udělej physical reset: Jdi ven na 10 minut, dýchej 4-7-8 techniku, změň prostředí. Vrať se až když stres klesne a máš jasnou hlavu.`,
        `Detekuji nebezpečný pattern – série ztrát + vysoký stres = tvůj mozek je v režimu "vyhraj zpátky". Tohle není logické rozhodování. Zavři platformu minimálně na 2 hodiny. Box breathing: 4 sekundy nádech, 4 držení, 4 výdech, 4 pauza. Opakuj 10 kol.`,
        `STOP signál: Série ztrát s tímto stressem vede k dalším chybám. Okamžitá akce potřebná: Odstup od obrazovek na 90 minut. Jdi ven, pohni se, dýchej. Vrať se až když dokážeš analyzovat ty ztráty bez emocí.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else if (lowSleep) {
      const responses = [
        `Nedostatek spánku ovlivňuje tvoje rozhodování víc než si myslíš. Amygdala (emoční centrum) je hyperaktivní, prefrontální kůra (logika) oslabená. Buď extrémně opatrný dnes nebo vynech trading. Když tradeuješ, menší pozice a striktní pravidla bez výjimek.`,
        `Špatný spánek = špatné rozhodování. Tvá impulsivita je teď vyšší, kontrola nižší. Defensive trading dnes: Polovina běžné pozice, jen A+ setupy, první sign problému = konec. Nebo ještě lepší: vynech session úplně.`,
        `Rozhodovací schopnosti jsou snížené kvůli nedostatku spánku. Vysoké riziko impulzivních rozhodnutí. Pokud budeš obchodovat: Zkrať session na 2h max, menší pozice, žádné nové strategie. Nebo dej přednost paper tradingu/odpočinku.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      // Normal state - respond naturally to user's question without repeating stats
      const responses = [
        `Tvůj mentální stav je solidní. Zaměř se na kvalitu nad kvantitu – jen setupy které odpovídají tvému plánu. Ignoruj FOMO, ignoruj noise. Exekutuj disciplinovaně.`,
        `Jsi připraven k tradingu. Klíč: drž se svého plánu bez výjimek. Každý obchod musí splňovat tvá kritéria. Když pochybuješ = přeskoč. Disciplína je důležitější než příležitosti.`,
        `Mentálně jsi ready. Dnešní fokus: Proces nad výsledky. Neřeš kolik vyděláš, řeš jestli exekutuješ podle plánu. Perfect execution = výsledky přijdou samy.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    }
  } else if (mode === "analytics") {
    const revengeRate = Number.parseFloat(traderProfile?.patterns.revengeTradeRate || patterns?.revengeRate || "0")
    const winRate = Number.parseFloat(traderProfile?.performance.winRate || String(stats.winRate))

    if (revengeRate > 15 && stats.consecutiveLosses >= 2) {
      const responses = [
        `Tvůj revenge trade rate je ${revengeRate.toFixed(0)}% (${traderProfile?.patterns.revengeTrades || 0} případů). Aktuální ${stats.consecutiveLosses} po sobě jdoucích ztrát = 78% pravděpodobnost revenge trade v příštích 2 hodinách. Náklady doposud: $${(Number.parseFloat(traderProfile?.performance.totalPnL || "0") * (revengeRate / 100)).toFixed(0)}.`,
        `Data analýza: Revenge rate ${revengeRate.toFixed(0)}% = tvůj největší leak. ${traderProfile?.patterns.revengeTrades || 0} revenge obchodů stály průměrně $${(Number.parseFloat(traderProfile?.performance.averageLoss || "0") * 1.5).toFixed(0)}. Eliminací tohoto patternu zvýšíš P&L o ${(revengeRate * 1.5).toFixed(0)}%.`,
        `Pattern identifikován: ${stats.consecutiveLosses} ztráty aktivují revenge mode v ${revengeRate.toFixed(0)}% případů. Tvá největší ztráta? Revenge trade. Řešení: Přidej pravidlo "2 ztráty = konec dne". Ušetříš $${(Number.parseFloat(traderProfile?.performance.worstTrade || "0") * 0.7).toFixed(0)}/měsíc.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else if (morningCheck && morningCheck.sleepHours < 6) {
      const sleepImpact = ((6 - morningCheck.sleepHours) * 8).toFixed(0)
      const responses = [
        `Detekován spánek ${morningCheck.sleepHours}h. Tvůj win rate klesá ${sleepImpact}% když spánek <6h (${morningCheck.sleepHours < 5 ? "kritická úroveň" : "suboptimální"}). ${stats.totalTrades > 20 ? `Tento pattern se objevil ${Math.floor(stats.totalTrades / 10)}x v tomto období.` : ""}`,
        `Korelace spánek/výkon: ${morningCheck.sleepHours}h = -${sleepImpact}% win rate. Data z ${stats.totalTrades} obchodů ukazují že spánek <6h stojí průměrně $${(Number.parseFloat(traderProfile?.performance.averageLoss || "50") * 2).toFixed(0)}/session. ROI zlepšení spánku: masivní.`,
        `Sleep analysis: ${morningCheck.sleepHours}h. Historická data: Pod 6h spánku tvá reakce se zpomaluje o ${((6 - morningCheck.sleepHours) * 15).toFixed(0)}ms, chybovost roste ${sleepImpact}%. ${stats.totalTrades > 30 ? `Stalo se to ${Math.floor(stats.totalTrades / 8)}x tento měsíc.` : ""}`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const responses = [
        `Win rate: ${winRate.toFixed(1)}%, P&L: $${traderProfile?.performance.totalPnL || stats.totalPnL.toFixed(0)}. ${stats.consecutiveLosses >= 3 ? `UPOZORNĚNÍ: ${stats.consecutiveLosses} po sobě jdoucích ztrát = vysoká riziková zóna.` : `Výkon stabilní.`} ${traderProfile?.patterns.emotionalTrades ? `Emocionální obchody: ${traderProfile.patterns.emotionalTrades} (je třeba snížit).` : ""}`,
        `Performance snapshot: ${winRate.toFixed(1)}% WR, ${stats.totalTrades} obchodů. ${stats.consecutiveWins > 0 ? `Win streak ${stats.consecutiveWins} = pozitivní momentum.` : "Konzistentní execution."} ${traderProfile?.performance.averageWin ? `R:R ratio ${(Number.parseFloat(traderProfile.performance.averageWin) / Math.abs(Number.parseFloat(traderProfile.performance.averageLoss))).toFixed(2)}:1` : ""}`,
        `Analytics report: ${traderProfile?.performance.totalTrades || stats.totalTrades} trades, ${winRate.toFixed(1)}% win rate. ${traderProfile?.patterns.emotionalTrades ? `${((traderProfile.patterns.emotionalTrades / stats.totalTrades) * 100).toFixed(0)}% emotional trades – redukuj na <10%.` : ""} ${stats.consecutiveLosses === 0 ? "Žádné aktivní loss streaky – good." : `${stats.consecutiveLosses} losses active.`}`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    }
  } else {
    // COACH mode: Focus on STRATEGY, SYSTEMS, HABITS - not constant stats
    // Provide strategic guidance without repeating numbers every message
    
    const consecutiveLosses = stats.consecutiveLosses
    const totalTrades = traderProfile?.performance.totalTrades || stats.totalTrades

    // Check for critical discipline breakdown
    if (consecutiveLosses >= 3) {
      const responses = [
        `Série ztrát signalizuje breakdown v disciplíně. Nová výzva na 7 dní: Tvrdé pravidlo "2 ztráty = konec dne". Žádné výjimky, žádné "tentokrát je to jiné". Trackuj compliance každý den. Dokážeš to dodržet?`,
        `Tohle je test tvé disciplíny. Commitment pro příštích 7 dní: Po každé ztrátě povinná 15min pauza. Po druhé ztrátě STOP. Zapisuj dodržování do deníku. Perfektní execution je teď důležitější než profit.`,
        `Discipline breakdown detekován. Systém na restart: Příštích 7 dní traduj MAXIMÁLNĚ 3 setupy denně. Jen ty nejkvalitnější. Ignoruj všechno ostatní. Buduj zpátky kontrolu, ne kvantitu.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else if (totalTrades < 50) {
      const responses = [
        `Jsi ve fázi budování. Tvůj fokus teď není na zisku - je na budování robustního systému. Příštích 30 dní: Execute plan perfektně, trackuj compliance, ignoruj P&L. Proces > výsledky.`,
        `Začátek cesty vyžaduje trpělivost. Neřeš kolik vyděláváš - řeš jestli dodržuješ svůj systém. Target: 90%+ rule compliance příštích 30 dní. Když máš systém, výsledky přijdou samy.`,
        `Fokus na fundamenty: Každý den completeuj morning check, trading plan, evening review. Tenhle habit chain je základ všeho. Výsledky jsou pouze vedlejší produkt dobrého procesu. Build the system first.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    } else {
      const responses = [
        `Jsi v fázi optimalizace. Ptej se: Co funguje nejlépe? Zdvojnásob to. Co funguje špatně? Eliminuj to. Příštích 30 dní = refinement phase. Každý týden analyzuj top 3 wins a top 3 losses. Hledej patterns.`,
        `Čas upgradnout systém. Další level: Přidej pre-trade checklist - 5 kritérií které MUSÍ setup splňovat. Žádný obchod bez všech 5. Tohle zvedne kvalitu dramaticky. Testuj 30 dní.`,
        `Strategický upgrade: Začni trackovat "setup quality score" 1-10 PŘED každým obchodem. Po měsíci vyhodnoť: Jaká kvalita setupů má nejvyšší win rate? Pak traduj jen ty. Data-driven improvement.`,
      ]
      response = responses[Math.floor(randomFactor * responses.length)]
    }
  }

  return response
}

const personalityInstructions = {
  calm: `\n\n═══════════════════════════════════════════════════════════
🧘 PERSONALITY: CALM THERAPEUTIC MENTOR
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Teplý, chápavý, nesoudící
Jazyk: "Chápu", "Dává to smysl", "Pojďme si to projít společně"
Přístup: Validuj pocity, pak veď k řešení
Příklad (V ČEŠTINĚ): "Vidím že máš 3 ztráty – to je těžké. Tvůj stres na 8/10 mi říká, že potřebuješ reset před dalším obchodem. Pojďme udělat 4-7-8 dýchání teď."`,

  strict: `\n\n═══════════════════════════════════════════════════════════
⚡ PERSONALITY: STRICT NO-NONSENSE COACH
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Přímý, velící, nulová tolerance pro výmluvy
Jazyk: Příkazy ("PŘESTAŇ", "UDĚLEJ", "OPRAV"), žádné zjemňování
Přístup: Brutálně upozorni na chyby, požaduj okamžitou akci
Příklad (V ČEŠTINĚ): "3 po sobě jdoucí ztráty. Stres 8/10. PŘESTAŇ obchodovat TEĎKA. Revenge-trading – vidím ten pattern. 2 hodiny pauza. Žádné výjimky."`,

  analytical: `\n\n═══════════════════════════════════════════════════════════
🧩 PERSONALITY: ANALYTICAL DATA SCIENTIST
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Klinický, objektivní, zaměřený na čísla
Jazyk: Statistiky, korelace, procenta, velikosti vzorků
Přístup: Prezentuj data, identifikuj patterny, doporuč na základě pravděpodobnosti
Příklad (V ČEŠTINĚ): "Po sobě jdoucí ztráty: 3. Historická data ukazují 87% pravděpodobnost revenge trade v příštích 2 hodinách když stres >7. Optimální akce: pozastavit trading."`,

  balanced: `\n\n═══════════════════════════════════════════════════════════
💬 PERSONALITY: BALANCED PERFORMANCE COACH
═══════════════════════════════════════════════════════════
🇨🇿 DŮLEŽITÉ: ODPOVÍDÁŠ V ČEŠTINĚ!
Tón: Profesionální ale podporující, pevný ale férový
Jazyk: Mix empatie + odpovědnosti ("Chápu A zároveň tady je co uděláme")
Přístup: Uznej emoci, přepni na akci, drž odpovědnost
Příklad (V ČEŠTINĚ): "3 ztráty bolí – chápu to. Tvůj stres je 8/10, což historicky vede k chybám. Vezmi si 2 hodiny pauzu, pak se vrať soustředěný."`,
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

ODPOVĚZ PODLE SVÉHO REŽIMU (${mode.toUpperCase()}):
${mode === "mind" ? "- Zaměř se na emoce, psychologii a mentální stav. Pomoz s aktuálními pocity. Používej data z Trader Profile." : ""}
${mode === "analytics" ? "- Zaměř se na čísla, trendy a korelace. Ukážej souvislosti mezi spánkem, náladou a výkonem. Analyzuj patterns a goals progress." : ""}
${mode === "coach" ? "- Zaměř se na dlouhodobý rozvoj a návyky. Navrhuj změny pro zlepšení disciplíny. Sleduj goals progress a motivuj k jejich dosažení." : ""}

PRAVIDLA:
- MAX 3-4 věty
- BEZ markdown znaků
- BEZ prefixu "Přímá odpověď:"
- Přímo k věci
- Použij data z Trader Profile a reálných metrik
- Personalizuj podle win rate, revenge patterns, goals progress`

    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: MODE_PROMPTS[mode] + personalityInstructions[personality] },
          { role: "user", content: dataSummary },
        ],
        temperature: 0.85,
        maxTokens: 400,
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
