"use client"

import { useState, useEffect } from "react"
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
import { cn } from "@/lib/utils"

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

const failTypes = [
  { value: "revenge-trade", label: "Revenge Trade", icon: Flame, color: "text-red-400" },
  { value: "overtrading", label: "Overtrading", icon: TrendingDown, color: "text-orange-400" },
  { value: "no-stoploss", label: "Bez Stop-Loss", icon: Shield, color: "text-yellow-400" },
  { value: "plan-violation", label: "Porušení plánu", icon: Target, color: "text-purple-400" },
  { value: "fomo", label: "FOMO vstup", icon: Clock, color: "text-blue-400" },
  { value: "emotional", label: "Emocionální rozhodnutí", icon: Brain, color: "text-pink-400" },
  { value: "other", label: "Jiné", icon: AlertTriangle, color: "text-gray-400" },
]

const emotions = [
  "Frustrace",
  "Strach",
  "Chamtivost",
  "Netrpělivost",
  "Přílišná sebedůvěra",
  "Stres",
  "Nuda",
  "Zoufalství",
]

// Demo data for virtual mode
const generateDemoFails = (): FailEntry[] => {
  return [
    {
      id: "demo-1",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: "revenge-trade",
      description: "Po ztrátě 2% jsem okamžitě vstoupil do dalšího obchodu bez analýzy.",
      trigger: "Předchozí ztráta mě rozhodila",
      emotion: "Frustrace",
      consequence: "Další ztráta 1.5%, celkem -3.5% za den",
      aiAnalysis:
        "Revenge trading je jedním z nejčastějších vzorců destruktivního chování. Tvůj mozek se snaží 'vyrovnat' ztrátu, ale tím pouze zvětšuješ riziko. Klíčové je přijmout ztrátu jako součást tradingu a dát si pauzu.",
      actionPlan: "Po každé ztrátě nad 1% si dám minimálně 30 minut pauzu od obrazovky.",
      resolved: false,
    },
    {
      id: "demo-2",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: "fomo",
      description: "Viděl jsem velký pohyb na BTC a vstoupil jsem pozdě do trendu.",
      trigger: "Sledoval jsem Twitter a viděl jak ostatní vydělávají",
      emotion: "Chamtivost",
      consequence: "Vstup na vrcholu, ztráta 2%",
      aiAnalysis:
        "FOMO je mocná emoce, kterou sociální média zesilují. Pamatuj, že vidíš pouze úspěšné obchody ostatních. Tvůj plán je důležitější než honba za pohybem.",
      actionPlan: "Budu obchodovat pouze setupy z mého watchlistu, ne reakce na sociální média.",
      resolved: true,
      resolvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-3",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      type: "overtrading",
      description: "Udělal jsem příliš mnoho obchodů místo čekání na kvalitní setupy.",
      trigger: "Nudil jsem se a chtěl jsem 'něco dělat'",
      emotion: "Nuda",
      consequence: "Komisní poplatky sežraly zisky, nakonec -0.5%",
      aiAnalysis:
        "Overtrading často pramení z potřeby akce, ne z kvalitních příležitostí. Méně je více. Kvalitní trader čeká na své setupy.",
      actionPlan: "Zaměřím se pouze na A+ setupy. Po každém obchodu 15 min pauza.",
      resolved: true,
      resolvedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

const generateAIAnalysis = (type: string, description: string, emotion: string): string => {
  const analyses: Record<string, string> = {
    "revenge-trade": `Revenge trading je přirozená, ale destruktivní reakce na ztrátu. Tvůj mozek se snaží "vyrovnat" skóre, ale tím jen zvyšuješ riziko. Klíčové je přijmout ztrátu jako běžnou součást tradingu. Zkus po ztrátě udělat 5 hlubokých nádechů a připomenout si, že jedna ztráta nedefinuje tvůj celkový výkon.`,
    overtrading: `Overtrading často signalizuje nudu nebo potřebu akce místo kvalitních příležitostí. Pamatuj: nejlepší tradeři většinu času čekají. Kvalita > kvantita. Zkus si stanovit denní limit obchodů a dodržuj ho.`,
    "no-stoploss": `Trading bez stop-lossu je jako jízda bez bezpečnostního pásu. Jedna špatná situace může zničit týdny práce. Stop-loss není přiznání porážky, je to profesionální risk management.`,
    "plan-violation": `Porušení plánu ukazuje na konflikt mezi tím, co víš že je správné, a tím co cítíš v momentu. Zkus si před každým obchodem nahlas říct: "Je tento obchod v souladu s mým plánem?"`,
    fomo: `FOMO (strach z promeškání) je mocná emoce zesílená sociálními médii. Pamatuj: vždy bude další příležitost. Trhy tu budou i zítra. Tvůj plán je důležitější než honba za pohybem.`,
    emotional: `Emocionální rozhodnutí v tradingu vedou k nekonzistentním výsledkům. Tvé emoce ti říkají důležité informace - ale neměly by řídit tvé obchody. Zkus si vytvořit checklist, který musíš projít před každým obchodem.`,
    other: `Každé selhání je příležitost k učení. Důležité je identifikovat vzorec a vytvořit konkrétní plán, jak se mu příště vyhnout.`,
  }

  return analyses[type] || analyses["other"]
}

export default function FailLogPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()

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
    if (!isLiveMode) {
      setEntries(generateDemoFails())
      return
    }

    const saved = localStorage.getItem("fail-log-entries")
    if (saved) {
      try {
        setEntries(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading fail log:", e)
        setEntries([])
      }
    }
  }, [isLiveMode])

  useEffect(() => {
    if (isLiveMode && entries.length > 0) {
      localStorage.setItem("fail-log-entries", JSON.stringify(entries))
    }
  }, [entries, isLiveMode])

  const addEntry = () => {
    if (!newEntry.type || !newEntry.description) {
      toast({
        title: "Chybí povinná pole",
        description: "Vyplň typ selhání a popis.",
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
      title: "Selhání zaznamenáno",
      description: "AI analyzovala tvé selhání a přidala doporučení.",
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

    // Save to localStorage in live mode
    if (isLiveMode) {
      setTimeout(() => {
        const updated = entries.map((e) =>
          e.id === id
            ? { ...e, resolved: !e.resolved, resolvedDate: !e.resolved ? new Date().toISOString() : undefined }
            : e,
        )
        localStorage.setItem("fail-log-entries", JSON.stringify(updated))
      }, 0)
    }
  }

  const getTypeInfo = (type: string) => {
    return failTypes.find((t) => t.value === type) || failTypes[failTypes.length - 1]
  }

  const unresolvedCount = entries.filter((e) => !e.resolved).length
  const resolvedCount = entries.filter((e) => e.resolved).length
  const mostCommonType =
    entries.length > 0
      ? failTypes.find(
          (t) =>
            t.value ===
            entries
              .reduce(
                (acc, e) => {
                  acc[e.type] = (acc[e.type] || 0) + 1
                  return acc
                },
                {} as Record<string, number>,
              )
              .toString(),
        )
      : null

  // Calculate most common fail type
  const typeCounts = entries.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1
      return acc
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              Fail Log
            </h1>
            <p className="text-gray-400 mt-1">Učení z chyb je klíčem k růstu</p>
          </div>

          <div className="flex items-center gap-2">
            {!isLiveMode && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Demo režim</Badge>}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Zaznamenat selhání
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">Nový záznam selhání</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Poctivě analyzuj, co se stalo. To je první krok k nápravě.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <Label className="text-gray-300">Typ selhání *</Label>
                    <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                        <SelectValue placeholder="Vyber typ..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {failTypes.map((type) => (
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
                    <Label className="text-gray-300">Co se stalo? *</Label>
                    <Textarea
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      placeholder="Popiš situaci..."
                      className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Co to spustilo?</Label>
                    <Input
                      value={newEntry.trigger}
                      onChange={(e) => setNewEntry({ ...newEntry, trigger: e.target.value })}
                      placeholder="Např. velká ztráta, stres z práce..."
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Jaká emoce převládala?</Label>
                    <Select value={newEntry.emotion} onValueChange={(v) => setNewEntry({ ...newEntry, emotion: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                        <SelectValue placeholder="Vyber emoci..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {emotions.map((emotion) => (
                          <SelectItem key={emotion} value={emotion} className="text-white">
                            {emotion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Jaké byly následky?</Label>
                    <Input
                      value={newEntry.consequence}
                      onChange={(e) => setNewEntry({ ...newEntry, consequence: e.target.value })}
                      placeholder="Např. ztráta 2%, propásnutá příležitost..."
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Můj plán nápravy</Label>
                    <Textarea
                      value={newEntry.actionPlan}
                      onChange={(e) => setNewEntry({ ...newEntry, actionPlan: e.target.value })}
                      placeholder="Co udělám příště jinak?"
                      className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[60px]"
                    />
                  </div>

                  <Button onClick={addEntry} className="w-full bg-red-600 hover:bg-red-700">
                    Uložit záznam
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
              <p className="text-xs text-gray-400">Nevyřešených</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{resolvedCount}</span>
              </div>
              <p className="text-xs text-gray-400">Vyřešených</p>
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
                  <p className="text-xs text-gray-400">Nejčastější typ</p>
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
                <p className="text-gray-400">Zatím žádné záznamy</p>
                <p className="text-sm text-gray-500 mt-1">Každé selhání je příležitost k učení</p>
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
                              Vyřešeno
                            </Badge>
                          )}
                        </div>

                        <p className="text-white font-medium mb-2">{entry.description}</p>

                        {entry.emotion && (
                          <p className="text-sm text-gray-400 mb-2">
                            <span className="text-pink-400">Emoce:</span> {entry.emotion}
                          </p>
                        )}

                        {entry.consequence && (
                          <p className="text-sm text-gray-400 mb-3">
                            <span className="text-orange-400">Následky:</span> {entry.consequence}
                          </p>
                        )}

                        {/* AI Analysis */}
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-400">AI Analýza</span>
                          </div>
                          <p className="text-sm text-gray-300">{entry.aiAnalysis}</p>
                        </div>

                        {entry.actionPlan && (
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-blue-400">Plán nápravy</span>
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
                          Označit vyřešené
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
