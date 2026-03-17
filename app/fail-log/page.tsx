"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  Plus,
  Brain,
  TrendingDown,
  Clock,
  Target,
  Flame,
  Shield,
  Sparkles,
  CheckCircle2,
  XCircle,
  BarChart3,
  Lightbulb,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/data-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { getUserStorageKey } from "@/utils/storage-namespace"

interface FailEntry {
  id: string
  date: string
  type: string
  description: string
  trigger: string
  emotion: string
  consequence: string
  aiAnalysis: string
  actionPlan: string
  resolved: boolean
  resolvedDate?: string
}

const getFailTypes = (isEn: boolean) => [
  { value: "revenge-trade", label: isEn ? "Revenge Trade" : "Revenge Trading", icon: Flame, color: "text-red-400" },
  { value: "overtrading", label: isEn ? "Overtrading" : "Přeobchodování", icon: TrendingDown, color: "text-orange-400" },
  { value: "no-stoploss", label: isEn ? "No Stop-Loss" : "Bez Stop-Loss", icon: Shield, color: "text-yellow-400" },
  { value: "plan-violation", label: isEn ? "Plan Violation" : "Porušení plánu", icon: Target, color: "text-purple-400" },
  { value: "fomo", label: isEn ? "FOMO Entry" : "FOMO vstup", icon: Clock, color: "text-blue-400" },
  { value: "emotional", label: isEn ? "Emotional Decision" : "Emoční rozhodnutí", icon: Brain, color: "text-pink-400" },
  { value: "other", label: isEn ? "Other" : "Jiné", icon: AlertTriangle, color: "text-gray-400" },
]

const getEmotions = (isEn: boolean) => [
  isEn ? "Frustration" : "Frustrace",
  isEn ? "Fear" : "Strach",
  isEn ? "Greed" : "Chamtivost",
  isEn ? "Impatience" : "Netrpělivost",
  isEn ? "Overconfidence" : "Přílišná sebedůvěra",
  isEn ? "Stress" : "Stres",
  isEn ? "Boredom" : "Nuda",
  isEn ? "Desperation" : "Zoufalství",
]

// Demo data for virtual mode
const generateDemoFails = (isEn: boolean): FailEntry[] => {
  const demoTexts = {
    desc1: isEn ? "After losing 2%, I immediately entered another trade without analysis." : "Po ztrátě 2% jsem okamžitě vstoupil do dalšího obchodu bez analýzy.",
    trigger1: isEn ? "Previous loss threw me off" : "Předchozí ztráta mě vyvrgla z rovnováhy",
    consequence1: isEn ? "Another loss of 1.5%, total -3.5% for the day" : "Další ztráta 1,5%, celkem -3,5% za den",
    analysis1: isEn ? "Revenge trading is one of the most common patterns of destructive behavior. Your brain tries to 'even the score', but you're only increasing risk. The key is to accept the loss as part of trading and take a break." : "Revenge trading je jedním z nejčastějších vzorců destruktivního chování. Tvůj mozek se snaží 'vyrovnat skóre', ale jen zvyšuješ riziko. Klíčem je přijmout ztrátu jako součást obchodování a dát si pauzu.",
    plan1: isEn ? "After each loss over 1%, I'll take at least 30 minutes away from the screen." : "Po každé ztrátě přesahující 1% si vezmu alespoň 30 minut od obrazovky.",
    
    desc2: isEn ? "I saw a big move on BTC and entered late into the trend." : "Viděl jsem velký pohyb na BTC a vstoupil jsem pozdě do trendu.",
    trigger2: isEn ? "I was watching Twitter and seeing others making money" : "Koukal jsem na Twitter a viděl jsem ostatní vydělávat peníze",
    consequence2: isEn ? "Entered at the top, loss of 2%" : "Vstoupil jsem na vrcholu, ztráta 2%",
    analysis2: isEn ? "FOMO is a powerful emotion amplified by social media. Remember, you only see others' successful trades. Your plan is more important than chasing movements." : "FOMO je silná emoce zesílená sociálními médii. Pamatuj si, vidíš jen úspěšné obchody ostatních. Tvůj plán je důležitější než honění pohybů.",
    plan2: isEn ? "I will only trade setups from my watchlist, not reactions to social media." : "Budu obchodovat pouze setupy z mého watchlistu, ne reaktivně na sociálních médiích.",
    
    desc3: isEn ? "I made too many trades instead of waiting for quality setups." : "Udělal jsem příliš mnoho obchodů místo čekání na kvalitní setupy.",
    trigger3: isEn ? "I was bored and wanted to 'do something'" : "Nuudil jsem se a chtěl jsem 'něco udělat'",
    consequence3: isEn ? "Commissions ate the profits, ended at -0.5%" : "Provize sní zisky, skončil jsem na -0,5%",
    analysis3: isEn ? "Overtrading often stems from the need for action, not quality opportunities. Less is more. Quality traders wait for their setups." : "Přeobchodování často vychází z potřeby akce, nikoli z kvalitních příležitostí. Méně je více. Kvalitní obchodníci čekají na své setupy.",
    plan3: isEn ? "I'll focus only on A+ setups. Take a 15-minute break after each trade." : "Zaměřím se pouze na A+ setupy. Vezmu si 15minutovou pauzu po každém obchodě.",
  }
  
  return [
    {
      id: "demo-1",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: "revenge-trade",
      description: demoTexts.desc1,
      trigger: demoTexts.trigger1,
      emotion: isEn ? "Frustration" : "Frustrace",
      consequence: demoTexts.consequence1,
      aiAnalysis: demoTexts.analysis1,
      actionPlan: demoTexts.plan1,
      resolved: false,
    },
    {
      id: "demo-2",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: "fomo",
      description: demoTexts.desc2,
      trigger: demoTexts.trigger2,
      emotion: isEn ? "Greed" : "Chamtivost",
      consequence: demoTexts.consequence2,
      aiAnalysis: demoTexts.analysis2,
      actionPlan: demoTexts.plan2,
      resolved: true,
      resolvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-3",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      type: "overtrading",
      description: demoTexts.desc3,
      trigger: demoTexts.trigger3,
      emotion: isEn ? "Boredom" : "Nuda",
      consequence: demoTexts.consequence3,
      aiAnalysis: demoTexts.analysis3,
      actionPlan: demoTexts.plan3,
      resolved: true,
      resolvedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

const generateAIAnalysis = (type: string, description: string, emotion: string): string => {
  const analyses: Record<string, string> = {
    "revenge-trade": `Revenge trading is a natural but destructive response to a loss. Your brain tries to "even the score", but you're only increasing risk. The key is to accept the loss as a normal part of trading. Try taking 5 deep breaths after a loss and reminding yourself that one loss doesn't define your overall performance.`,
    overtrading: `Overtrading often signals boredom or a need for action rather than quality opportunities. Remember: the best traders wait most of the time. Quality > quantity. Try setting a daily trade limit and stick to it.`,
    "no-stoploss": `Trading without a stop-loss is like driving without a seatbelt. One bad situation can wipe out weeks of work. A stop-loss isn't admitting defeat, it's professional risk management.`,
    "plan-violation": `Plan violations show a conflict between what you know is right and what you feel in the moment. Try telling yourself out loud before each trade: "Is this trade aligned with my plan?"`,
    fomo: `FOMO (fear of missing out) is a powerful emotion amplified by social media. Remember: there will always be another opportunity. Markets will be here tomorrow. Your plan is more important than chasing movements.`,
    emotional: `Emotional decisions in trading lead to inconsistent results. Your emotions tell you important information - but they shouldn't drive your trades. Try creating a checklist you must go through before each trade.`,
    other: `Every failure is an opportunity to learn. The important thing is to identify the pattern and create a specific plan to avoid it next time.`,
  }

  return analyses[type] || analyses["other"]
}

export default function FailLogPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()
  const { language } = useLanguage()
  const isEn = language === "en"

  const txt = {
    back: isEn ? "Back" : "Zpět",
    failLog: isEn ? "Fail Log" : "Záznam chyb",
    learningFromMistakes: isEn ? "Learning from mistakes is the key to growth" : "Učení se z chyb je klíčem k růstu",
    demoMode: isEn ? "Demo Mode" : "Demo režim",
    recordFailure: isEn ? "Record Failure" : "Zaznamenat chybu",
    resolved: isEn ? "Resolved" : "Vyřešeno",
    unresolved: isEn ? "Unresolved" : "Nevyřešeno",
    revengeTradeLabel: isEn ? "Revenge Trade" : "Revenge Trading",
    overtradingLabel: isEn ? "Overtrading" : "Přeobchodování",
    noStopLossLabel: isEn ? "No Stop-Loss" : "Bez Stop-Loss",
    planViolationLabel: isEn ? "Plan Violation" : "Porušení plánu",
    fomoLabel: isEn ? "FOMO Entry" : "FOMO vstup",
    emotionalDecisionLabel: isEn ? "Emotional Decision" : "Emoční rozhodnutí",
    otherLabel: isEn ? "Other" : "Jiné",
    frustration: isEn ? "Frustration" : "Frustrace",
    fear: isEn ? "Fear" : "Strach",
    greed: isEn ? "Greed" : "Chamtivost",
    impatience: isEn ? "Impatience" : "Netrpělivost",
    overconfidence: isEn ? "Overconfidence" : "Přílišná sebedůvěra",
    stress: isEn ? "Stress" : "Stres",
    boredom: isEn ? "Boredom" : "Nuda",
    desperation: isEn ? "Desperation" : "Zoufalství",
    requiredFieldsMissing: isEn ? "Required fields missing" : "Chybějící povinná pole",
    fillInFailure: isEn ? "Fill in the failure type and description." : "Vyplň typ chyby a popis.",
    failureRecorded: isEn ? "Failure recorded" : "Chyba zaznamenána",
    aiAnalyzed: isEn ? "AI analyzed your failure and added recommendations." : "AI analyzovala tvou chybu a přidala doporučení.",
    unresolved: isEn ? "Unresolved" : "Nevyřešeno",
    failureType: isEn ? "Failure Type" : "Typ chyby",
    description: isEn ? "Description" : "Popis",
    trigger: isEn ? "Trigger" : "Spouštěč",
    emotion: isEn ? "Emotion" : "Emoce",
    consequence: isEn ? "Consequence" : "Důsledek",
    aiAnalysis: isEn ? "AI Analysis" : "Analýza AI",
    recoveryPlan: isEn ? "Recovery Plan" : "Plán obnovy",
    actionPlan: isEn ? "Action Plan" : "Akční plán",
    addNew: isEn ? "Add New" : "Přidat",
    markResolved: isEn ? "Mark Resolved" : "Označit jako vyřešeno",
    activeFailures: isEn ? "Active Failures" : "Aktivní chyby",
    completedLessons: isEn ? "Completed Lessons" : "Dokončené lekce",
  }

  const [entries, setEntries] = useState<FailEntry[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<FailEntry | null>(null)

  const [newEntry, setNewEntry] = useState({
    type: "",
    description: "",
    trigger: "",
    emotion: "",
    consequence: "",
    actionPlan: "",
  })

  useEffect(() => {
    if (isLiveMode) {
      const failLogKey = getUserStorageKey("fail-log-entries")
      const saved = localStorage.getItem(failLogKey)
      if (saved) {
        try {
          setEntries(JSON.parse(saved))
        } catch (e) {
          console.error("Error loading fail log:", e)
          setEntries([])
        }
      } else {
        setEntries([])
      }
    } else {
      setEntries(generateDemoFails(isEn))
    }
  }, [isLiveMode, isEn])

  useEffect(() => {
    if (isLiveMode && entries.length > 0) {
      const failLogKey = getUserStorageKey("fail-log-entries")
      localStorage.setItem(failLogKey, JSON.stringify(entries))
    }
  }, [entries, isLiveMode])

  const addEntry = () => {
    if (!newEntry.type || !newEntry.description) {
      toast({
        title: txt.requiredFieldsMissing,
        description: txt.fillInFailure,
        variant: "destructive",
      })
      return
    }

    const aiAnalysis = generateAIAnalysis(newEntry.type, newEntry.description, newEntry.emotion)

    const entry: FailEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: newEntry.type,
      description: newEntry.description,
      trigger: newEntry.trigger,
      emotion: newEntry.emotion,
      consequence: newEntry.consequence,
      aiAnalysis,
      actionPlan: newEntry.actionPlan,
      resolved: false,
    }

    setEntries([entry, ...entries])
    setNewEntry({
      type: "",
      description: "",
      trigger: "",
      emotion: "",
      consequence: "",
      actionPlan: "",
    })
    setIsAddDialogOpen(false)

    toast({
      title: txt.failureRecorded,
      description: txt.aiAnalyzed,
    })
  }

  const toggleResolved = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, resolved: !e.resolved, resolvedDate: !e.resolved ? new Date().toISOString() : undefined }
          : e,
      ),
    )

    if (isLiveMode) {
      setTimeout(() => {
        const failLogKey = getUserStorageKey("fail-log-entries")
        const updated = entries.map((e) =>
          e.id === id
            ? { ...e, resolved: !e.resolved, resolvedDate: !e.resolved ? new Date().toISOString() : undefined }
            : e,
        )
        localStorage.setItem(failLogKey, JSON.stringify(updated))
      }, 0)
    }
  }

  const getTypeInfo = (type: string) => {
    const failTypes = getFailTypes(isEn)
    return failTypes.find((t) => t.value === type) || failTypes[failTypes.length - 1]
  }

  const unresolvedCount = entries.filter((e) => !e.resolved).length
  const resolvedCount = entries.filter((e) => e.resolved).length
  
  // Calculate most common fail type
  const typeCounts = entries.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  
  const mostCommonTypeValue = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
  const mostCommonType = mostCommonTypeValue
    ? getFailTypes(isEn).find((t) => t.value === mostCommonTypeValue)
    : null
    },
    {} as Record<string, number>,
  )

  const topFailType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-10">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Back Button */}
        <Link href="/bonus" className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{txt.back}</span>
          </div>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              {txt.failLog}
            </h1>
            <p className="text-gray-400 mt-1">{txt.learningFromMistakes}</p>
          </div>

          <div className="flex items-center gap-2">
            {!isLiveMode && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{txt.demoMode}</Badge>}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {txt.recordFailure}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">{isEn ? "New Failure Entry" : "Nová chyba"}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {isEn ? "Honestly analyze what happened. That's the first step to fix it." : "Poctivě analyzuj, co se stalo. To je první krok k nápravě."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <Label className="text-gray-300">{isEn ? "Failure Type *" : "Typ chyby *"}</Label>
                    <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                        <SelectValue placeholder={isEn ? "Select type..." : "Vyber typ..."} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {getFailTypes(isEn).map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white">
                            <div className="flex items-center gap-2">
                              <type.icon className={cn("w-4 h-4", type.color)} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">{isEn ? "What Happened? *" : "Co se stalo? *"}</Label>
                    <Textarea
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      placeholder={isEn ? "Describe the situation..." : "Popiš situaci..."}
                      className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">{isEn ? "What Triggered It?" : "Co to spustilo?"}</Label>
                    <Input
                      value={newEntry.trigger}
                      onChange={(e) => setNewEntry({ ...newEntry, trigger: e.target.value })}
                      placeholder={isEn ? "e.g. big loss, work stress..." : "např. velká ztráta, práce stres..."}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">{isEn ? "What Emotion Dominated?" : "Jaká emoce dominovala?"}</Label>
                    <Select value={newEntry.emotion} onValueChange={(v) => setNewEntry({ ...newEntry, emotion: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                        <SelectValue placeholder={isEn ? "Select emotion..." : "Vyber emoci..."} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {getEmotions(isEn).map((emotion) => (
                          <SelectItem key={emotion} value={emotion} className="text-white">
                            {emotion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">{isEn ? "What Were the Consequences?" : "Jaké byly důsledky?"}</Label>
                    <Input
                      value={newEntry.consequence}
                      onChange={(e) => setNewEntry({ ...newEntry, consequence: e.target.value })}
                      placeholder={isEn ? "e.g. loss 2%, missed opportunity..." : "např. ztráta 2%, zmešknutá příležitost..."}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">{isEn ? "My Recovery Plan" : "Můj plán obnovy"}</Label>
                    <Textarea
                      value={newEntry.actionPlan}
                      onChange={(e) => setNewEntry({ ...newEntry, actionPlan: e.target.value })}
                      placeholder={isEn ? "What will I do differently next time?" : "Co budu příště dělat jinak?"}
                      className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[60px]"
                    />
                  </div>

                  <Button onClick={addEntry} className="w-full bg-red-600 hover:bg-red-700">
                    {isEn ? "Save Entry" : "Uložit záznam"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-white">{unresolvedCount}</span>
              </div>
              <p className="text-xs text-gray-400">{txt.unresolved}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{resolvedCount}</span>
              </div>
              <p className="text-xs text-gray-400">{txt.resolved}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              {topFailType ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {(() => {
                      const info = getTypeInfo(topFailType[0])
                      const Icon = info.icon
                      return <Icon className={cn("w-5 h-5", info.color)} />
                    })()}
                    <span className="text-lg font-bold text-white">{topFailType[1]}x</span>
                  </div>
                  <p className="text-xs text-gray-400">{getTypeInfo(topFailType[0]).label}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BarChart3 className="w-5 h-5 text-gray-400 mx-auto mb-4" />
                    <span className="text-2xl font-bold text-white">-</span>
                  </div>
                  <p className="text-xs text-gray-400">Most Common Type</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No entries yet</p>
                <p className="text-sm text-gray-500 mt-1">Every failure is an opportunity to learn</p>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => {
              const typeInfo = getTypeInfo(entry.type)
              const Icon = typeInfo.icon

              return (
                <Card key={entry.id} className={cn("bg-slate-900/50 border-slate-800 transition-all")}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-xl", entry.resolved ? "bg-green-500/10" : "bg-red-500/10")}>
                        <Icon className={cn("w-6 h-6", entry.resolved ? "text-green-400" : typeInfo.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={cn(
                              "text-xs",
                              entry.resolved
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30",
                            )}
                          >
                            {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString("cs-CZ")}
                          </span>
                          {entry.resolved && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>

                        <p className="text-white font-medium mb-2">{entry.description}</p>

                        {entry.emotion && (
                          <p className="text-sm text-gray-400 mb-2">
                            <span className="text-pink-400">Emotion:</span> {entry.emotion}
                          </p>
                        )}

                        {entry.consequence && (
                          <p className="text-sm text-gray-400 mb-3">
                            <span className="text-orange-400">Consequences:</span> {entry.consequence}
                          </p>
                        )}

                        {/* AI Analysis */}
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-400">AI Analysis</span>
                          </div>
                          <p className="text-sm text-gray-300">{entry.aiAnalysis}</p>
                        </div>

                        {entry.actionPlan && (
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-400">Recovery Plan</span>
                            </div>
                            <p className="text-sm text-gray-300">{entry.actionPlan}</p>
                          </div>
                        )}
                      </div>

                      {!entry.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleResolved(entry.id)}
                          className="border-slate-700 text-green-400 hover:text-green-300 hover:border-green-500/50"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
