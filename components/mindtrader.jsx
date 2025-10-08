"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  ArrowRight,
  BarChart2,
  LineChartIcon,
  PieChartIcon,
  TrendingUp,
  TrendingDown,
  Brain,
  Lightbulb,
  Target,
  Zap,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUpIcon,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Star,
  Heart,
  Shield,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Pause,
} from "lucide-react"
import { useData } from "@/contexts/data-context"

export function MindTrader() {
  const [activeTab, setActiveTab] = useState("overview")
  const [moodData, setMoodData] = useState([])
  const [tradeData, setTradeData] = useState([])
  const [correlationData, setCorrelationData] = useState([])
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [aiPersonality, setAiPersonality] = useState("supportive") // supportive, analytical, motivational
  const [sessionMode, setSessionMode] = useState("chat") // chat, therapy, analysis
  const [userMood, setUserMood] = useState(7)
  const [userStress, setUserStress] = useState(4)
  const [userEnergy, setUserEnergy] = useState(7)

  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()

  const [quickPrompts] = useState([
    "Jak zvládnout ztrátu po špatném obchodu?",
    "Mám strach z dalšího obchodu, co dělat?",
    "Jak si udržet disciplínu při tradingu?",
    "Proč pořád porušuji svůj trading plán?",
    "Jak se zbavit FOMO při tradingu?",
    "Mám problém s risk managementem",
    "Jak zlepšit svou psychickou odolnost?",
    "Revenge trading - jak se tomu vyhnout?",
    "Jak správně nastavit stop loss?",
    "Kdy zvýšit velikost pozice?",
    "Jak analyzovat své chyby?",
    "Strategie pro stresové situace",
    "Jak překonat strach z velkých zisků?",
    "Proč zavírám ziskové pozice příliš brzy?",
    "Jak se připravit mentálně na trading den?",
    "Co dělat když se trh chová nepředvídatelně?",
  ])

  // Advanced AI personalities
  const aiPersonalities = {
    supportive: {
      name: "🤗 Podporující kouč",
      description: "Empatický a povzbuzující přístup",
      color: "from-blue-500 to-indigo-500",
      icon: Heart,
    },
    analytical: {
      name: "🔬 Analytický expert",
      description: "Datově orientovaný a logický",
      color: "from-purple-500 to-pink-500",
      icon: BarChart2,
    },
    motivational: {
      name: "🚀 Motivační trenér",
      description: "Energický a cílevědomý",
      color: "from-orange-500 to-red-500",
      icon: Zap,
    },
  }

  const sessionModes = {
    chat: {
      name: "💬 Běžný chat",
      description: "Volná konverzace o tradingu",
      icon: MessageSquare,
    },
    therapy: {
      name: "🧠 Terapeutická session",
      description: "Hluboká psychologická analýza",
      icon: Brain,
    },
    analysis: {
      name: "📊 Analýza výkonnosti",
      description: "Detailní rozbor obchodů",
      icon: BarChart2,
    },
  }

  // Load data from localStorage or use demo data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)

      try {
        const allTrades = getAllTrades()
        const allJournalEntries = getAllJournalEntries()

        if (isLiveMode && allTrades.length === 0) {
          // Live mode with no data
          setMoodData([
            { date: "Pon", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Úte", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Stř", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Čtv", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Pát", mood: 0, confidence: 0, stress: 0, energy: 0 },
          ])

          setTradeData([
            { date: "Pon", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Úte", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Stř", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Čtv", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Pát", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
          ])

          setInsights([
            "Zatím nemáte dostatek dat pro analýzu. Začněte zaznamenávat své obchody a náladu.",
            "Sledujte své obchodní vzorce pro získání přehledů.",
            "Zaznamenávejte svou náladu a sebedůvěru pro korelační analýzu.",
            "Používejte analytiky pro zlepšení svých obchodních rozhodnutí.",
          ])
        } else {
          // Virtual mode or live mode with data - use demo data
          const moodDataSample = [
            { date: "Pon", mood: 8, confidence: 7, stress: 3, energy: 8 },
            { date: "Úte", mood: 6, confidence: 5, stress: 6, energy: 6 },
            { date: "Stř", mood: 4, confidence: 3, stress: 8, energy: 4 },
            { date: "Čtv", mood: 7, confidence: 6, stress: 4, energy: 7 },
            { date: "Pát", mood: 9, confidence: 8, stress: 2, energy: 9 },
          ]

          const tradeDataSample = [
            { date: "Pon", profit: 250, trades: 5, winRate: 80, avgHold: 2.5 },
            { date: "Úte", profit: 150, trades: 8, winRate: 62, avgHold: 1.8 },
            { date: "Stř", profit: -200, trades: 10, winRate: 40, avgHold: 0.9 },
            { date: "Čtv", profit: 180, trades: 6, winRate: 67, avgHold: 3.2 },
            { date: "Pát", profit: 320, trades: 4, winRate: 75, avgHold: 4.1 },
          ]

          const insightsSample = [
            "Vaše úspěšnost je o 25% vyšší v dny, kdy je vaše nálada nad 7 body",
            "Máte tendenci k přetradování (více než 8 obchodů denně), když je vaše sebedůvěra pod 5 body",
            "Vaše nejvyšší zisky korelují s vysokou náladou (8+) a střední sebedůvěrou (6-7)",
            "Zvažte pauzu, když vaše nálada klesne pod 5 bodů - historická data ukazují 70% ztrátových obchodů v tyto dny",
            "Vaše nejlepší obchody mají průměrnou dobu držení 3+ hodin",
            "Stres nad 6 bodů snižuje vaši úspěšnost o průměrně 15%",
          ]

          setMoodData(moodDataSample)
          setTradeData(tradeDataSample)
          setInsights(insightsSample)
        }

        const correlationData = moodData.map((item, index) => ({
          date: item.date,
          mood: item.mood,
          confidence: item.confidence,
          stress: item.stress,
          energy: item.energy,
          profit: tradeData[index]?.profit || 0,
          trades: tradeData[index]?.trades || 0,
          winRate: tradeData[index]?.winRate || 0,
        }))

        setCorrelationData(correlationData)
      } catch (error) {
        console.error("Error loading MindTrader data:", error)
        setMoodData([])
        setTradeData([])
        setCorrelationData([])
        setInsights([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    // window.addEventListener("storage", loadData) // Removed as data context handles updates
    // return () => window.removeEventListener("storage", loadData) // Removed as data context handles updates
  }, [isLiveMode, getAllTrades, getAllJournalEntries]) // Added dependencies

  // Calculate summary metrics
  const averageMood =
    moodData.length > 0 ? (moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length).toFixed(1) : "0.0"
  const totalProfit = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.profit, 0) : 0
  const averageWinRate =
    tradeData.length > 0
      ? (tradeData.reduce((sum, item) => sum + item.winRate, 0) / tradeData.length).toFixed(1)
      : "0.0"
  const totalTrades = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.trades, 0) : 0
  const averageStress =
    moodData.length > 0
      ? (moodData.reduce((sum, item) => sum + (item.stress || 0), 0) / moodData.length).toFixed(1)
      : "0.0"

  // Voice functionality
  const startListening = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "cs-CZ"

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setPrompt(transcript)
      }

      recognition.start()
    }
  }

  const speakResponse = (text) => {
    if (voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "cs-CZ"
      utterance.rate = 0.9
      utterance.pitch = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)

      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)

    const userMessage = {
      type: "user",
      content: prompt,
      timestamp: new Date(),
      mood: userMood,
      stress: userStress,
      energy: userEnergy,
      sessionMode,
      personality: aiPersonality,
    }
    setConversationHistory((prev) => [...prev, userMessage])

    await new Promise((resolve) => setTimeout(resolve, 2500))

    const aiResponse = generateAdvancedResponse(prompt, userMessage)

    const aiMessage = {
      type: "ai",
      content: aiResponse,
      timestamp: new Date(),
      personality: aiPersonality,
      sessionMode,
    }
    setConversationHistory((prev) => [...prev, aiMessage])
    setResponse(aiResponse)
    setPrompt("")
    setIsGenerating(false)

    // Speak response if voice is enabled
    if (voiceEnabled) {
      setTimeout(() => speakResponse(aiResponse), 500)
    }
  }

  const generateAdvancedResponse = (prompt, userContext) => {
    const { mood, stress, energy, sessionMode, personality } = userContext

    // Personality-based response prefixes
    const personalityPrefixes = {
      supportive: "Rozumím tvým pocitům a jsem tu pro tebe. ",
      analytical: "Na základě analýzy tvých dat a současného stavu: ",
      motivational: "Pojďme na to! Máš v sobě sílu to zvládnout. ",
    }

    // Session mode adjustments
    const sessionAdjustments = {
      chat: "",
      therapy: "Pojďme se podívat hlouběji na to, co cítíš. ",
      analysis: "Podívejme se na tvá data a najděme vzorce. ",
    }

    let baseResponse = personalityPrefixes[personality] + sessionAdjustments[sessionMode]

    // Mood-based adjustments
    if (mood < 4) {
      baseResponse += "Vidím, že se necítíš nejlépe. To je v pořádku - každý má horší dny. "
    } else if (mood > 7) {
      baseResponse += "Skvělé, že máš dobrou náladu! Využijme této pozitivní energie. "
    }

    // Stress-based adjustments
    if (stress > 7) {
      baseResponse += "⚠️ Všímám si vysoké úrovně stresu. To může výrazně ovlivnit tvé rozhodování. "
    }

    // Generate contextual response based on prompt content
    if (prompt.toLowerCase().includes("ztráta") || prompt.toLowerCase().includes("loss")) {
      return (
        baseResponse +
        `
🎯 **Analýza tvé situace:**
- Aktuální nálada: ${mood}/10 ${mood < 5 ? "⚠️ Nízká" : mood > 7 ? "✅ Dobrá" : "🟡 Střední"}
- Stres: ${stress}/10 ${stress > 7 ? "🚨 Vysoký" : stress > 4 ? "⚠️ Střední" : "✅ Nízký"}
- Energie: ${energy}/10

**Okamžité kroky:**
1. 🛑 **STOP trading na 24 hodin** - tvůj mozek potřebuje reset
2. 📊 **Objektivní analýza** - co bylo správně, co ne?
3. 🔍 **Risk management check** - dodržel jsi pravidla?

**Na základě tvých dat:**
- Průměrná nálada: ${averageMood}/10
- Win rate: ${averageWinRate}%
- Celkový P&L: ${totalProfit >= 0 ? "+" : ""}$${totalProfit}

**Personalizovaný plán:**
${mood < 5 ? "- Nejdřív si zlepši náladu - cvičení, procházka, oblíbená aktivita" : ""}
${stress > 6 ? "- Relaxační techniky - dýchání 4-7-8, meditace 10 minut" : ""}
- Sniž velikost pozic o 75% na příštích 5 obchodů
- Pouze A+ setupy podle tvé strategie

**Psychologická podpora:**
${personality === "supportive" ? "- Pamatuj, že ztráty jsou součástí hry - i Warren Buffett má špatné dny" : ""}
${personality === "analytical" ? "- Statisticky, 68% profesionálních traderů má win rate 55-65%" : ""}
${personality === "motivational" ? "- Toto je příležitost ukázat svou mentální sílu!" : ""}

💡 **Klíčové pozorování:** Tvoje data ukazují, že po ztrátách máš tendenci ${averageWinRate < 50 ? "k revenge tradingu" : "k opatrnějšímu přístupu"}.

🔄 **Návrat k tradingu:** Až budeš připraven, začni micro pozicemi a postupně zvyšuj.`
      )
    } else if (prompt.toLowerCase().includes("strach") || prompt.toLowerCase().includes("fear")) {
      return (
        baseResponse +
        `
🧠 **Psychologická analýza strachu:**

**Tvůj aktuální stav:**
- Nálada: ${mood}/10 ${mood < 5 ? "📉" : "📈"}
- Stres: ${stress}/10 ${stress > 6 ? "🚨 Vysoký - to zesiluje strach!" : "✅"}
- Energie: ${energy}/10

**Zdroje strachu v tradingu:**
1. 💸 Strach ze ztráty (Loss Aversion)
2. 🎯 Strach z úspěchu (Fear of Success)
3. 🔄 Strach z opakování chyb
4. 📊 Nejistota v analýze

**Tvoje specifická situace:**
- Win rate ${averageWinRate}% ${Number(averageWinRate) > 60 ? "je solidní - strach není oprávněný" : "potřebuje zlepšení - strach je pochopitelný"}
- ${totalProfit >= 0 ? "Celkově jsi v zisku - důvěřuj svým schopnostem" : "Ztráty zesilují strach - čas na reset"}

**Anti-strach protokol:**
1. 🧘 **Breathing 4-7-8** před každým obchodem
2. 📝 **Confidence journal** - zapiš 3 důvody, proč věříš tomuto obchodu
3. 💰 **Micro pozice** - začni s 0.01 loty
4. 🎯 **Vizualizace úspěchu** - 5 minut denně

${
  sessionMode === "therapy"
    ? `
**Hluboká analýza:**
Strach často pramení z dětství nebo minulých traumat. V tradingu se projevuje jako:
- Paralýza při rozhodování
- Předčasné zavírání ziskových pozic
- Vyhýbání se obchodování

**Terapeutické techniky:**
- EFT tapping na strach
- Kognitivní restrukturalizace
- Postupná expozice (gradual exposure)
`
    : ""
}

🚀 **Akční plán na příštích 7 dní:**
- Den 1-2: Pouze demo + analýza
- Den 3-4: Micro pozice (0.01)
- Den 5-6: Malé pozice (0.05)
- Den 7: Normální velikost (pokud se cítíš připraven)

💪 **Afirmace:** "Jsem disciplinovaný trader. Mám kontrolu nad svými emocemi. Každý obchod je příležitost k učení."`
      )
    } else if (prompt.toLowerCase().includes("disciplína") || prompt.toLowerCase().includes("plán")) {
      return (
        baseResponse +
        `
🎯 **Disciplinární audit:**

**Tvoje aktuální metriky:**
- Průměrná nálada: ${averageMood}/10
- Celkové obchody: ${totalTrades}
- Disciplína skóre: ${Math.round((Number(averageWinRate) + (10 - Number(averageStress))) / 2)}/10

**Disciplinární framework:**

**🌅 RANNÍ RUTINA (5:30-8:00):**
1. ☕ Káva + 10 min meditace
2. 📊 Přečti svůj trading plán
3. 📈 Zkontroluj ekonomický kalendář
4. 🎯 Nastav denní risk limit (max ${Math.round(totalProfit * 0.02)}$)
5. 📝 Zapiš svůj mentální stav

**📈 BĚHEM TRADINGU:**
- ✅ Checklist před každým obchodem
- 🛑 Stop loss VŽDY před vstupem
- 📱 Vypni sociální sítě
- ⏰ Max ${Math.max(3, Math.floor(totalTrades / 5))} obchodů denně
- 🚫 Žádné "jen se podívám" pozice

**🌙 VEČERNÍ REVIEW (19:00-20:00):**
1. 📊 Zhodnoť dodržení pravidel (1-10)
2. 💭 Zapiš emoce a ponaučení
3. 🎯 Připrav se na zítra
4. 📚 15 min vzdělávání

**Tvoje personalizované pravidla:**
- Risk max 1% účtu na obchod
- Trading pouze při náladě ${mood > 6 ? "6+" : "7+"}
- Pauza po 2 ztrátových obchodech v řadě
- Žádný trading při stresu ${stress > 6 ? "6+" : "7+"}

**🏆 Motivační systém:**
- 5 disciplinovaných dní = odměna (${personality === "motivational" ? "nové trading kniha" : personality === "analytical" ? "premium indikátor" : "relaxační den"})
- Porušení pravidla = 1 den pauzy
- Týdenní disciplína 8+ = bonus obchod

**📱 Nástroje pro disciplínu:**
- Alarm pro konec session
- Automatické SL/TP
- Trading journal s hodnocením
- Accountability partner

${
  sessionMode === "analysis"
    ? `
**Analýza tvých vzorců:**
- Nejlepší výsledky máš při náladě ${Math.max(...moodData.map((d) => d.mood))}/10
- Nejhorší při stresu ${Math.max(...moodData.map((d) => d.stress || 0))}/10
- Optimální počet obchodů: ${Math.round(totalTrades / 5)} denně
`
    : ""
}

🔥 **Challenge:** Příštích 21 dní dodržuj VŠECHNA pravidla. Disciplína = svoboda od emocí!`
      )
    } else {
      // Generic advanced response
      return (
        baseResponse +
        `
📊 **Komplexní analýza tvého stavu:**

**Aktuální metriky:**
- 😊 Nálada: ${mood}/10 ${mood > 7 ? "🟢 Výborná" : mood > 5 ? "🟡 Dobrá" : "🔴 Potřebuje pozornost"}
- 😰 Stres: ${stress}/10 ${stress < 4 ? "🟢 Nízký" : stress < 7 ? "🟡 Střední" : "🔴 Vysoký"}
- ⚡ Energie: ${energy}/10 ${energy > 7 ? "🟢 Vysoká" : energy > 5 ? "🟡 Střední" : "🔴 Nízká"}

**Historická data:**
- 📈 Win rate: ${averageWinRate}% ${Number(averageWinRate) > 60 ? "🎯 Skvělé!" : Number(averageWinRate) > 45 ? "📈 Slušné" : "📉 Potřebuje práci"}
- 💰 P&L: ${totalProfit >= 0 ? "+" : ""}$${totalProfit} ${totalProfit >= 0 ? "💚" : "❤️‍🩹"}
- 📊 Obchody: ${totalTrades} ${totalTrades > 50 ? "⚡ Aktivní" : "🎯 Konzervativní"}

**AI doporučení na základě ${personality} přístupu:**

${
  personality === "supportive"
    ? `
💙 **Emocionální podpora:**
- Jsi na správné cestě, každý den se učíš něco nového
- Tvoje pokroky jsou viditelné, i když to možná necítíš
- Pamatuj, že i nejlepší tradeři mají špatné dny
`
    : personality === "analytical"
      ? `
🔬 **Datová analýza:**
- Tvoje korelace nálada vs. výkonnost je ${Number(averageMood) > 6 && Number(averageWinRate) > 50 ? "pozitivní" : "potřebuje optimalizaci"}
- Optimální trading okno: když nálada > ${Math.round(Number(averageMood))} a stres < ${Math.round(Number(averageStress))}
- Doporučená velikost pozice: ${totalProfit > 0 ? "můžeš mírně zvýšit" : "zůstaň konzervativní"}
`
      : `
🚀 **Motivační boost:**
- Máš v sobě potenciál být skvělým traderem!
- Každá ztráta tě posouvá blíž k úspěchu
- Tvoje disciplína a vytrvalost tě dovedou k cíli
`
}

**Akční kroky pro ${sessionMode === "therapy" ? "terapeutickou práci" : sessionMode === "analysis" ? "analýzu výkonnosti" : "zlepšení"}:**

1. 🎯 **Okamžitě:** ${stress > 6 ? "Sniž stres - dýchací cvičení" : mood < 5 ? "Zlepši náladu - oblíbená aktivita" : "Využij pozitivní energie"}

2. 📅 **Dnes:** 
   - Zapiš si 3 věci, za které jsi vděčný
   - Zanalyzuj svůj nejlepší obchod z minulého týdne
   - Nastav si realistický cíl na zítra

3. 📈 **Tento týden:**
   - Zaměř se na kvalitu, ne kvantitu obchodů
   - Veď si detailní emocionální deník
   - Praktikuj risk management

🤖 **Personalizovaný tip:** Na základě tvých dat doporučuji ${
          Number(averageWinRate) < 50
            ? "zaměřit se na zlepšení vstupů - méně obchodů, vyšší kvalita"
            : totalProfit < 0
              ? "přehodnotit risk management - možná příliš velké pozice"
              : Number(averageStress) > 6
                ? "pracovat na stress managementu - meditace, cvičení"
                : "pokračovat v současném přístupu a postupně optimalizovat"
        }.

💬 **Otázka pro tebe:** Co je právě teď tvoje největší výzva v tradingu? Řekni mi více a společně najdeme řešení!`
      )
    }
  }

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt)
  }

  const clearConversation = () => {
    setConversationHistory([])
    setResponse("")
    stopSpeaking()
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response)
    }
  }

  const exportConversation = () => {
    const conversationText = conversationHistory
      .map((msg) => `${msg.type === "user" ? "Vy" : "MindTrader AI"}: ${msg.content}`)
      .join("\n\n")

    const blob = new Blob([conversationText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindtrader-conversation-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mood distribution for pie chart
  const moodDistribution = [
    { name: "Výborná (8-10)", value: moodData.filter((d) => d.mood >= 8).length, color: "#10B981" },
    { name: "Dobrá (6-7)", value: moodData.filter((d) => d.mood >= 6 && d.mood < 8).length, color: "#F59E0B" },
    { name: "Špatná (1-5)", value: moodData.filter((d) => d.mood < 6).length, color: "#EF4444" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Enhanced KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">😊 Průměrná nálada</CardTitle>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">{averageMood}/10</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={Number.parseFloat(averageMood) * 10} className="flex-1 h-2" />
                  <Badge
                    variant={
                      Number.parseFloat(averageMood) > 7
                        ? "default"
                        : Number.parseFloat(averageMood) > 5
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {Number.parseFloat(averageMood) > 7
                      ? "Výborná"
                      : Number.parseFloat(averageMood) > 5
                        ? "Dobrá"
                        : "Potřebuje práci"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? "Načítání..." : "Posledních 5 obchodních dní"}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">💰 Celkový P&L</CardTitle>
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  {totalProfit >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-white" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-white" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalProfit >= 0 ? "+" : ""}${totalProfit}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={totalProfit >= 0 ? "default" : "destructive"}>
                    {totalProfit >= 0 ? "Zisk" : "Ztráta"}
                  </Badge>
                  {totalProfit >= 0 && (
                    <Badge variant="outline" className="text-green-600">
                      <TrendingUpIcon className="w-3 h-3 mr-1" />
                      Rostoucí
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? "Načítání..." : "Posledních 5 obchodních dní"}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">🎯 Win Rate</CardTitle>
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">{averageWinRate}%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={Number.parseFloat(averageWinRate)} className="flex-1 h-2" />
                  <Badge
                    variant={
                      Number.parseFloat(averageWinRate) > 60
                        ? "default"
                        : Number.parseFloat(averageWinRate) > 45
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {Number.parseFloat(averageWinRate) > 60
                      ? "Výborný"
                      : Number.parseFloat(averageWinRate) > 45
                        ? "Dobrý"
                        : "Slabý"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading ? "Načítání..." : "Posledních 5 obchodních dní"}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">😰 Průměrný stres</CardTitle>
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">{averageStress}/10</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={Number.parseFloat(averageStress) * 10} className="flex-1 h-2" />
                  <Badge
                    variant={
                      Number.parseFloat(averageStress) < 4
                        ? "default"
                        : Number.parseFloat(averageStress) < 7
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {Number.parseFloat(averageStress) < 4
                      ? "Nízký"
                      : Number.parseFloat(averageStress) < 7
                        ? "Střední"
                        : "Vysoký"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{isLoading ? "Načítání..." : "Nižší je lepší"}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="overview">📊 Přehled</TabsTrigger>
              <TabsTrigger value="mood">🧠 Analýza nálady</TabsTrigger>
              <TabsTrigger value="correlation">📈 Korelace</TabsTrigger>
              <TabsTrigger value="ai" className="relative">
                <Sparkles className="w-4 h-4 mr-2" />🤖 AI Kouč
                {conversationHistory.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">{conversationHistory.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChartIcon className="w-5 h-5" />📈 Obchodní výkonnost
                    </CardTitle>
                    <CardDescription>Vaše obchodní výkonnost za posledních 5 obchodních dní</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <p>Načítání dat grafů...</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={tradeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="profit"
                            name="Zisk/Ztráta ($)"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line type="monotone" dataKey="winRate" name="Win Rate (%)" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5" />😊 Rozložení nálady
                    </CardTitle>
                    <CardDescription>Jak často máte dobrou náladu</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {moodDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Alert className="border-blue-200 bg-blue-50 border-0 shadow-lg">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">💡 Personalizovaný insight</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {isLoading ? "Analyzuji vaše obchodní vzorce..." : insights[0]}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="mood" className="space-y-4">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />🧠 Sledování nálady a psychického stavu
                  </CardTitle>
                  <CardDescription>Váš psychologický stav během obchodních sezení</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <p>Načítání dat grafů...</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          name="Nálada (1-10)"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line type="monotone" dataKey="confidence" name="Sebedůvěra (1-10)" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="stress" name="Stres (1-10)" stroke="#ff7300" />
                        <Line type="monotone" dataKey="energy" name="Energie (1-10)" stroke="#ffc658" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Alert className="border-orange-200 bg-orange-50 border-0 shadow-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">🧠 Psychologický insight</AlertTitle>
                <AlertDescription className="text-orange-700">
                  {isLoading ? "Analyzuji vaše nálady..." : insights[1]}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />📊 Korelace nálady a výkonnosti
                  </CardTitle>
                  <CardDescription>Jak váš psychologický stav ovlivňuje obchodní výsledky</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <p>Načítání dat grafů...</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={correlationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="profit" name="Zisk/Ztráta ($)" fill="#8884d8" />
                        <Line yAxisId="right" type="monotone" dataKey="mood" name="Nálada (1-10)" stroke="#ff7300" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Alert className="border-green-200 bg-green-50 border-0 shadow-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">📈 Korelační insight</AlertTitle>
                  <AlertDescription className="text-green-700">
                    {isLoading ? "Analyzuji korelace..." : insights[2]}
                  </AlertDescription>
                </Alert>

                <Alert className="border-purple-200 bg-purple-50 border-0 shadow-lg">
                  <Target className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800">🎯 Doporučení k akci</AlertTitle>
                  <AlertDescription className="text-purple-700">
                    {isLoading ? "Generuji doporučení..." : insights[3]}
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />🤖 MindTrader AI Kouč Pro
                  </CardTitle>
                  <CardDescription>
                    Váš pokročilý AI kouč pro obchodní psychologii s hlubokým porozuměním vašim datům a emocím.
                  </CardDescription>

                  {/* AI Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">🎭 Personalita AI</Label>
                      <div className="space-y-2">
                        {Object.entries(aiPersonalities).map(([key, personality]) => (
                          <Button
                            key={key}
                            variant={aiPersonality === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAiPersonality(key)}
                            className={`w-full justify-start text-left h-auto p-3 ${
                              aiPersonality === key
                                ? `bg-gradient-to-r ${personality.color} text-white border-0`
                                : "bg-white/80"
                            }`}
                          >
                            <personality.icon className="w-4 h-4 mr-2" />
                            <div>
                              <div className="font-medium">{personality.name}</div>
                              <div className="text-xs opacity-80">{personality.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">🎯 Režim session</Label>
                      <div className="space-y-2">
                        {Object.entries(sessionModes).map(([key, mode]) => (
                          <Button
                            key={key}
                            variant={sessionMode === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSessionMode(key)}
                            className={`w-full justify-start text-left h-auto p-3 ${
                              sessionMode === key
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                                : "bg-white/80"
                            }`}
                          >
                            <mode.icon className="w-4 h-4 mr-2" />
                            <div>
                              <div className="font-medium">{mode.name}</div>
                              <div className="text-xs opacity-80">{mode.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">😊 Aktuální nálada: {userMood}/10</Label>
                        <Slider
                          value={[userMood]}
                          onValueChange={(value) => setUserMood(value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">😰 Aktuální stres: {userStress}/10</Label>
                        <Slider
                          value={[userStress]}
                          onValueChange={(value) => setUserStress(value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">⚡ Aktuální energie: {userEnergy}/10</Label>
                        <Slider
                          value={[userEnergy]}
                          onValueChange={(value) => setUserEnergy(value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Voice Controls */}
                  <div className="flex items-center justify-between mt-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={voiceEnabled ? "bg-green-100 text-green-700" : ""}
                      >
                        {voiceEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                        {voiceEnabled ? "🔊 Hlas zapnut" : "🔇 Hlas vypnut"}
                      </Button>

                      {isSpeaking && (
                        <Button variant="outline" size="sm" onClick={stopSpeaking} className="bg-red-100 text-red-700">
                          <Pause className="w-4 h-4 mr-2" />
                          ⏸️ Zastavit řeč
                        </Button>
                      )}
                    </div>

                    {conversationHistory.length > 0 && (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={exportConversation}>
                          <Download className="w-4 h-4 mr-2" />📥 Export
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearConversation}>
                          <RefreshCw className="w-4 h-4 mr-2" />🔄 Nová session
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* AI Features Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <Brain className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-800">🧠 Pokročilá AI</h4>
                        <p className="text-xs text-blue-600">Hluboké porozumění emocím</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <Target className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">🎯 Personalizace</h4>
                        <p className="text-xs text-green-600">Na základě vašich dat</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <Star className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-purple-800">⭐ Hlasové ovládání</h4>
                        <p className="text-xs text-purple-600">Mluvte s AI přirozeně</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Prompts */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />⚡ Rychlé otázky pro začátek:
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {quickPrompts.slice(0, 8).map((quickPrompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2 px-3 bg-transparent hover:bg-blue-50 border-blue-200"
                          onClick={() => handleQuickPrompt(quickPrompt)}
                          disabled={isGenerating}
                        >
                          <Zap className="w-3 h-3 mr-2 flex-shrink-0 text-blue-500" />
                          <span className="text-xs">{quickPrompt}</span>
                        </Button>
                      ))}
                    </div>

                    {quickPrompts.length > 8 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {quickPrompts.slice(8).map((quickPrompt, index) => (
                          <Button
                            key={index + 8}
                            variant="outline"
                            size="sm"
                            className="justify-start text-left h-auto py-2 px-3 bg-transparent hover:bg-purple-50 border-purple-200"
                            onClick={() => handleQuickPrompt(quickPrompt)}
                            disabled={isGenerating}
                          >
                            <Brain className="w-3 h-3 mr-2 flex-shrink-0 text-purple-500" />
                            <span className="text-xs">{quickPrompt}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conversation History */}
                  {conversationHistory.length > 0 && (
                    <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                      {conversationHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${
                              message.type === "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                : "bg-white border border-gray-200 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {message.type === "ai" && <Brain className="w-4 h-4 text-purple-500" />}
                              {message.type === "user" && <Heart className="w-4 h-4 text-blue-200" />}
                              <span className="text-xs font-medium">
                                {message.type === "user"
                                  ? "Vy"
                                  : `MindTrader AI (${aiPersonalities[message.personality || aiPersonality].name})`}
                              </span>
                              <span
                                className={`text-xs ${message.type === "user" ? "text-blue-200" : "text-gray-500"}`}
                              >
                                {message.timestamp.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                            {message.type === "user" && (
                              <div className="flex items-center space-x-2 mt-2 text-xs text-blue-200">
                                <span>😊 {message.mood}</span>
                                <span>😰 {message.stress}</span>
                                <span>⚡ {message.energy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />💬 Zeptejte se MindTrader AI Pro
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="prompt"
                          placeholder="Popište svou obchodní situaci, emocionální stav, nebo se zeptejte na konkrétní radu... Čím více detailů, tím lepší odpověď dostanete! 🚀"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          rows={4}
                          disabled={isGenerating}
                          className="resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={startListening}
                          disabled={isGenerating || isListening}
                          className="absolute bottom-2 right-2"
                        >
                          {isListening ? (
                            <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
                          ) : (
                            <Mic className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>💡 Tip: Buďte konkrétní pro nejlepší rady</span>
                        <span>{prompt.length}/1000</span>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isGenerating || !prompt.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />🤖 Analyzuji a generuji odpověď...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />🚀 Získat personalizovanou radu od AI
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Latest Response */}
                  {response && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-500" />🤖 Nejnovější odpověď od MindTrader AI Pro
                        </Label>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={copyResponse}>
                            <Copy className="w-4 h-4 mr-2" />📋 Kopírovat
                          </Button>
                          {voiceEnabled && (
                            <Button variant="ghost" size="sm" onClick={() => speakResponse(response)}>
                              <Volume2 className="w-4 h-4 mr-2" />🔊 Přečíst
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-6 border rounded-lg bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200 shadow-sm">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{response}</div>
                      </div>
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>🔒 Bezpečné a soukromé</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span>🤖 AI poháněné</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>⭐ Personalizované</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Volume2 className="w-4 h-4 text-purple-500" />
                      <span>🎤 Hlasové ovládání</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <a href="/analytics/advanced">
                <Sparkles className="mr-2 h-4 w-4" />🚀 Pokročilé analytiky
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
