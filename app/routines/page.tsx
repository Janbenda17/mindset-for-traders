"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Sun,
  Moon,
  CheckCircle2,
  Brain,
  Target,
  Coffee,
  TrendingUp,
  Heart,
  Wind,
  BookOpen,
  Dumbbell,
  Eye,
  Flame,
  Plus,
  Trash2,
  History,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserData, saveUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { createStorageClient } from "@/lib/storage-client"

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Dumbbell,
  Coffee,
  TrendingUp,
  Target,
  Eye,
  BookOpen,
  Heart,
  Wind,
  Moon,
  Sun,
  Sparkles,
}

const iconOptions = [
  { value: "Brain", label: "Mozek" },
  { value: "Dumbbell", label: "Cvičení" },
  { value: "Coffee", label: "Káva" },
  { value: "TrendingUp", label: "Graf" },
  { value: "Target", label: "Cíl" },
  { value: "Eye", label: "Oko" },
  { value: "BookOpen", label: "Kniha" },
  { value: "Heart", label: "Srdce" },
  { value: "Wind", label: "Relaxace" },
  { value: "Moon", label: "Měsíc" },
  { value: "Sun", label: "Slunce" },
  { value: "Sparkles", label: "Jiskry" },
]

interface RoutineItem {
  id: string
  title: string
  description: string
  iconName: string
  completed: boolean
  category: "mindset" | "body" | "preparation" | "review"
  isCustom?: boolean
  isActive: boolean
}

interface RoutineHistory {
  date: string
  morningCompleted: number
  morningTotal: number
  eveningCompleted: number
  eveningTotal: number
  morningNotes: string
  eveningNotes: string
  morningItems: { id: string; title: string; completed: boolean }[]
  eveningItems: { id: string; title: string; completed: boolean }[]
}

const defaultMorningRoutine: RoutineItem[] = [
  {
    id: "m1",
    title: "Ranní meditace",
    description: "5-10 minut klidného dýchání",
    iconName: "Brain",
    completed: false,
    category: "mindset",
    isActive: true,
  },
  {
    id: "m2",
    title: "Fyzická aktivita",
    description: "Protažení nebo krátké cvičení",
    iconName: "Dumbbell",
    completed: false,
    category: "body",
    isActive: true,
  },
  {
    id: "m3",
    title: "Zdravá snídaně",
    description: "Kvalitní jídlo pro energii",
    iconName: "Coffee",
    completed: false,
    category: "body",
    isActive: true,
  },
  {
    id: "m4",
    title: "Kontrola trhů",
    description: "Přehled overnight pohybů",
    iconName: "TrendingUp",
    completed: false,
    category: "preparation",
    isActive: true,
  },
  {
    id: "m5",
    title: "Denní cíle",
    description: "Stanovení max. 3 cílů na den",
    iconName: "Target",
    completed: false,
    category: "preparation",
    isActive: true,
  },
  {
    id: "m6",
    title: "Vizualizace",
    description: "Představ si úspěšný trading den",
    iconName: "Eye",
    completed: false,
    category: "mindset",
    isActive: true,
  },
]

const defaultEveningRoutine: RoutineItem[] = [
  {
    id: "e1",
    title: "Review obchodů",
    description: "Zhodnocení dnešních tradů",
    iconName: "BookOpen",
    completed: false,
    category: "review",
    isActive: true,
  },
  {
    id: "e2",
    title: "Aktualizace deníku",
    description: "Zápis do trading deníku",
    iconName: "BookOpen",
    completed: false,
    category: "review",
    isActive: true,
  },
  {
    id: "e3",
    title: "Vděčnost",
    description: "3 věci za které jsem vděčný",
    iconName: "Heart",
    completed: false,
    category: "mindset",
    isActive: true,
  },
  {
    id: "e4",
    title: "Příprava na zítra",
    description: "Watchlist a plán na další den",
    iconName: "Target",
    completed: false,
    category: "preparation",
    isActive: true,
  },
  {
    id: "e5",
    title: "Relaxace",
    description: "Odpočinek od obrazovek",
    iconName: "Wind",
    completed: false,
    category: "body",
    isActive: true,
  },
  {
    id: "e6",
    title: "Kvalitní spánek",
    description: "Příprava na 7-8 hodin spánku",
    iconName: "Moon",
    completed: false,
    category: "body",
    isActive: true,
  },
]

const generateDemoHistory = (): RoutineHistory[] => {
  const history: RoutineHistory[] = []
  const now = new Date()

  for (let i = 14; i >= 1; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const morningCompleted = Math.floor(Math.random() * 3) + 4 // 4-6
    const eveningCompleted = Math.floor(Math.random() * 3) + 3 // 3-5

    history.push({
      date: date.toISOString().split("T")[0],
      morningCompleted,
      morningTotal: 6,
      eveningCompleted,
      eveningTotal: 6,
      morningNotes: i % 3 === 0 ? "Cítil jsem se dobře připravený na trading." : "",
      eveningNotes: i % 4 === 0 ? "Dobrý den, dodržel jsem plán." : "",
      morningItems: defaultMorningRoutine.map((item, idx) => ({
        id: item.id,
        title: item.title,
        completed: idx < morningCompleted,
      })),
      eveningItems: defaultEveningRoutine.map((item, idx) => ({
        id: item.id,
        title: item.title,
        completed: idx < eveningCompleted,
      })),
    })
  }

  return history
}

export default function RoutinesPage() {
  const { isLiveMode } = useData()
  const { user } = useAuth()
  const { toast } = useToast()

  const storage = createStorageClient(user?.id || null)

  const [morningRoutine, setMorningRoutine] = useState<RoutineItem[]>(defaultMorningRoutine)
  const [eveningRoutine, setEveningRoutine] = useState<RoutineItem[]>(defaultEveningRoutine)
  const [morningNotes, setMorningNotes] = useState("")
  const [eveningNotes, setEveningNotes] = useState("")
  const [history, setHistory] = useState<RoutineHistory[]>([])
  const [activeTab, setActiveTab] = useState("morning")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    iconName: "Brain",
    category: "mindset" as const,
    routine: "morning" as "morning" | "evening",
  })

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (!isLiveMode) {
      setHistory(generateDemoHistory())
      setMorningRoutine((prev) =>
        prev.map((item, idx) => ({
          ...item,
          completed: idx < 3,
        })),
      )
      setEveningRoutine((prev) =>
        prev.map((item, idx) => ({
          ...item,
          completed: idx < 2,
        })),
      )
      return
    }

    const savedData = storage.get("trading-routines", null)
    if (savedData) {
      if (savedData.lastDate !== today) {
        const resetMorning = (savedData.morningRoutine || defaultMorningRoutine).map((item: RoutineItem) => ({
          ...item,
          completed: false,
        }))
        const resetEvening = (savedData.eveningRoutine || defaultEveningRoutine).map((item: RoutineItem) => ({
          ...item,
          completed: false,
        }))
        setMorningRoutine(resetMorning)
        setEveningRoutine(resetEvening)
        setMorningNotes("")
        setEveningNotes("")
      } else {
        if (savedData.morningRoutine) setMorningRoutine(savedData.morningRoutine)
        if (savedData.eveningRoutine) setEveningRoutine(savedData.eveningRoutine)
        if (savedData.morningNotes) setMorningNotes(savedData.morningNotes)
        if (savedData.eveningNotes) setEveningNotes(savedData.eveningNotes)
      }

      if (savedData.history) setHistory(savedData.history)
    }
  }, [today, isLiveMode, user?.id])

  useEffect(() => {
    if (!isLiveMode) return

    const dataToSave = {
      morningRoutine,
      eveningRoutine,
      morningNotes,
      eveningNotes,
      history,
      lastDate: today,
    }
    storage.set("trading-routines", dataToSave)

    const userData = getUserData()
    saveUserData({
      ...userData,
      routineAnalytics: {
        lastUpdated: new Date().toISOString(),
        morningCompletion: morningRoutine.filter((i) => i.isActive && i.completed).length,
        eveningCompletion: eveningRoutine.filter((i) => i.isActive && i.completed).length,
        streak: calculateStreak(),
      },
    })
  }, [morningRoutine, eveningRoutine, morningNotes, eveningNotes, history, today, isLiveMode])

  const calculateStreak = () => {
    let streak = 0
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    for (const day of sortedHistory) {
      const morningPercent = day.morningTotal > 0 ? day.morningCompleted / day.morningTotal : 0
      const eveningPercent = day.eveningTotal > 0 ? day.eveningCompleted / day.eveningTotal : 0
      if (morningPercent >= 0.5 || eveningPercent >= 0.5) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const toggleItem = (routineType: "morning" | "evening", itemId: string) => {
    if (!isLiveMode) {
      toast({
        title: "Demo režim",
        description: "V demo režimu nelze ukládat změny. Přepni do Live režimu.",
        variant: "destructive",
      })
      return
    }

    if (routineType === "morning") {
      setMorningRoutine((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
      )
    } else {
      setEveningRoutine((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
      )
    }
  }

  const toggleItemActive = (routineType: "morning" | "evening", itemId: string) => {
    if (!isLiveMode) return

    if (routineType === "morning") {
      setMorningRoutine((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, isActive: !item.isActive } : item)),
      )
    } else {
      setEveningRoutine((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, isActive: !item.isActive } : item)),
      )
    }
  }

  const deleteCustomItem = (routineType: "morning" | "evening", itemId: string) => {
    if (!isLiveMode) return

    if (routineType === "morning") {
      setMorningRoutine((prev) => prev.filter((item) => item.id !== itemId))
    } else {
      setEveningRoutine((prev) => prev.filter((item) => item.id !== itemId))
    }
    toast({ title: "Položka smazána" })
  }

  const addCustomItem = () => {
    if (!isLiveMode) {
      toast({
        title: "Demo režim",
        description: "V demo režimu nelze přidávat položky.",
        variant: "destructive",
      })
      return
    }

    if (!newItem.title.trim()) {
      toast({ title: "Zadej název položky", variant: "destructive" })
      return
    }

    const item: RoutineItem = {
      id: `custom-${Date.now()}`,
      title: newItem.title,
      description: newItem.description,
      iconName: newItem.iconName,
      completed: false,
      category: newItem.category,
      isCustom: true,
      isActive: true,
    }

    if (newItem.routine === "morning") {
      setMorningRoutine((prev) => [...prev, item])
    } else {
      setEveningRoutine((prev) => [...prev, item])
    }

    setNewItem({
      title: "",
      description: "",
      iconName: "Brain",
      category: "mindset",
      routine: "morning",
    })
    setIsAddDialogOpen(false)
    toast({ title: "Položka přidána" })
  }

  const saveToHistory = () => {
    if (!isLiveMode) return

    const activeMorning = morningRoutine.filter((i) => i.isActive)
    const activeEvening = eveningRoutine.filter((i) => i.isActive)

    const todayEntry: RoutineHistory = {
      date: today,
      morningCompleted: activeMorning.filter((i) => i.completed).length,
      morningTotal: activeMorning.length,
      eveningCompleted: activeEvening.filter((i) => i.completed).length,
      eveningTotal: activeEvening.length,
      morningNotes,
      eveningNotes,
      morningItems: activeMorning.map((i) => ({ id: i.id, title: i.title, completed: i.completed })),
      eveningItems: activeEvening.map((i) => ({ id: i.id, title: i.title, completed: i.completed })),
    }

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.date !== today)
      return [...filtered, todayEntry].slice(-30)
    })

    toast({ title: "Uloženo do historie" })
  }

  const getProgress = (routine: RoutineItem[]) => {
    const active = routine.filter((i) => i.isActive)
    const completed = active.filter((i) => i.completed).length
    return active.length > 0 ? (completed / active.length) * 100 : 0
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "mindset":
        return "text-purple-400"
      case "body":
        return "text-green-400"
      case "preparation":
        return "text-blue-400"
      case "review":
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  const renderRoutineItems = (items: RoutineItem[], routineType: "morning" | "evening") => {
    const activeItems = isEditMode ? items : items.filter((i) => i.isActive)

    return (
      <div className="space-y-3">
        {activeItems.map((item) => {
          const IconComponent = iconMap[item.iconName] || Brain
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                item.completed && !isEditMode
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50",
                !item.isActive && isEditMode && "opacity-50",
              )}
            >
              {isEditMode ? (
                <Checkbox
                  checked={item.isActive}
                  onCheckedChange={() => toggleItemActive(routineType, item.id)}
                  className="mt-1"
                />
              ) : (
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(routineType, item.id)}
                  className="mt-1"
                />
              )}
              <div
                className={cn("p-2 rounded-lg", item.completed && !isEditMode ? "bg-green-500/20" : "bg-slate-700/50")}
              >
                <IconComponent className={cn("w-4 h-4", getCategoryColor(item.category))} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      item.completed && !isEditMode ? "text-green-400 line-through" : "text-white",
                    )}
                  >
                    {item.title}
                  </p>
                  {item.isCustom && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 border-purple-500/30 text-purple-400"
                    >
                      Vlastní
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
              </div>
              {isEditMode && item.isCustom && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCustomItem(routineType, item.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const streak = calculateStreak()
  const avgCompletion =
    history.length > 0
      ? Math.round(
          history.reduce((acc, h) => {
            const mPercent = h.morningTotal > 0 ? (h.morningCompleted / h.morningTotal) * 100 : 0
            const ePercent = h.eveningTotal > 0 ? (h.eveningCompleted / h.eveningTotal) * 100 : 0
            return acc + (mPercent + ePercent) / 2
          }, 0) / history.length,
        )
      : 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-10">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Back Button */}
        <Link href="/bonus" className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Zpět</span>
          </div>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl">
                <Sun className="w-6 h-6 text-white" />
              </div>
              Trading Rutiny
            </h1>
            <p className="text-gray-400 mt-1">Konzistentní rutiny = konzistentní výsledky</p>
          </div>

          <div className="flex items-center gap-2">
            {!isLiveMode && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Demo režim</Badge>}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-700 hover:bg-slate-800 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Přidat vlastní položku</DialogTitle>
                  <DialogDescription className="text-gray-400">Vytvoř si vlastní položku do rutiny</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-gray-300">Název</Label>
                    <Input
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="Např. Studená sprcha"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Popis (volitelný)</Label>
                    <Input
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Krátký popis"
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Ikona</Label>
                      <Select value={newItem.iconName} onValueChange={(v) => setNewItem({ ...newItem, iconName: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value} className="text-white">
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Rutina</Label>
                      <Select
                        value={newItem.routine}
                        onValueChange={(v: "morning" | "evening") => setNewItem({ ...newItem, routine: v })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="morning" className="text-white">
                            Ranní
                          </SelectItem>
                          <SelectItem value="evening" className="text-white">
                            Večerní
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Kategorie</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(v: "mindset" | "body" | "preparation" | "review") =>
                        setNewItem({ ...newItem, category: v })
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="mindset" className="text-white">
                          Mindset
                        </SelectItem>
                        <SelectItem value="body" className="text-white">
                          Tělo
                        </SelectItem>
                        <SelectItem value="preparation" className="text-white">
                          Příprava
                        </SelectItem>
                        <SelectItem value="review" className="text-white">
                          Review
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addCustomItem} className="w-full bg-purple-600 hover:bg-purple-700">
                    Přidat položku
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="icon"
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "h-9 w-9",
                isEditMode ? "bg-purple-600 hover:bg-purple-700" : "border-slate-700 hover:bg-slate-800",
              )}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">{streak}</span>
              </div>
              <p className="text-xs text-gray-400">Streak (dny)</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{avgCompletion}%</span>
              </div>
              <p className="text-xs text-gray-400">Průměr plnění</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">{history.length}</span>
              </div>
              <p className="text-xs text-gray-400">Dní v historii</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-slate-900/50 border border-slate-800 mb-6">
            <TabsTrigger
              value="morning"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
            >
              <Sun className="w-4 h-4 mr-2" />
              Ranní
            </TabsTrigger>
            <TabsTrigger
              value="evening"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              <Moon className="w-4 h-4 mr-2" />
              Večerní
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <History className="w-4 h-4 mr-2" />
              Historie
            </TabsTrigger>
          </TabsList>

          {/* Morning Tab */}
          <TabsContent value="morning">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Sun className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Ranní rutina</CardTitle>
                      <CardDescription>Připrav se na úspěšný trading den</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{Math.round(getProgress(morningRoutine))}%</p>
                    <p className="text-xs text-gray-400">Hotovo</p>
                  </div>
                </div>
                <Progress value={getProgress(morningRoutine)} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {renderRoutineItems(morningRoutine, "morning")}

                <div className="pt-4 border-t border-slate-700/50">
                  <Label className="text-gray-300 text-sm">Poznámky (volitelné)</Label>
                  <Textarea
                    value={morningNotes}
                    onChange={(e) => setMorningNotes(e.target.value)}
                    placeholder="Jak se cítíš ráno? Jaké máš očekávání od dne?"
                    className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[80px]"
                    disabled={!isLiveMode}
                  />
                </div>

                {isLiveMode && (
                  <Button onClick={saveToHistory} className="w-full bg-orange-600 hover:bg-orange-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Uložit do historie
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evening Tab */}
          <TabsContent value="evening">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Moon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Večerní rutina</CardTitle>
                      <CardDescription>Uzavři den a připrav se na zítřek</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{Math.round(getProgress(eveningRoutine))}%</p>
                    <p className="text-xs text-gray-400">Hotovo</p>
                  </div>
                </div>
                <Progress value={getProgress(eveningRoutine)} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {renderRoutineItems(eveningRoutine, "evening")}

                <div className="pt-4 border-t border-slate-700/50">
                  <Label className="text-gray-300 text-sm">Poznámky (volitelné)</Label>
                  <Textarea
                    value={eveningNotes}
                    onChange={(e) => setEveningNotes(e.target.value)}
                    placeholder="Jak proběhl trading den? Co bys udělal jinak?"
                    className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[80px]"
                    disabled={!isLiveMode}
                  />
                </div>

                {isLiveMode && (
                  <Button onClick={saveToHistory} className="w-full bg-blue-600 hover:bg-blue-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Uložit do historie
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <History className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Historie rutin</CardTitle>
                    <CardDescription>Posledních 30 dní</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Zatím žádná historie</p>
                    <p className="text-sm text-gray-500 mt-1">Začni plnit rutiny a uvidíš zde svůj pokrok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...history].reverse().map((day) => {
                      const morningPercent =
                        day.morningTotal > 0 ? Math.round((day.morningCompleted / day.morningTotal) * 100) : 0
                      const eveningPercent =
                        day.eveningTotal > 0 ? Math.round((day.eveningCompleted / day.eveningTotal) * 100) : 0
                      const avgPercent = Math.round((morningPercent + eveningPercent) / 2)

                      return (
                        <div key={day.date} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-white font-medium">
                                {new Date(day.date).toLocaleDateString("cs-CZ", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                            <Badge
                              className={cn(
                                "text-xs",
                                avgPercent >= 80
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : avgPercent >= 50
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30",
                              )}
                            >
                              {avgPercent}%
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Sun className="w-3 h-3 text-orange-400" />
                                <span className="text-xs text-gray-400">Ranní</span>
                                <span className="text-xs text-white ml-auto">
                                  {day.morningCompleted}/{day.morningTotal}
                                </span>
                              </div>
                              <Progress value={morningPercent} className="h-1.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Moon className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-gray-400">Večerní</span>
                                <span className="text-xs text-white ml-auto">
                                  {day.eveningCompleted}/{day.eveningTotal}
                                </span>
                              </div>
                              <Progress value={eveningPercent} className="h-1.5" />
                            </div>
                          </div>

                          {(day.morningNotes || day.eveningNotes) && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              {day.morningNotes && (
                                <p className="text-xs text-gray-400">
                                  <span className="text-orange-400">Ráno:</span> {day.morningNotes}
                                </p>
                              )}
                              {day.eveningNotes && (
                                <p className="text-xs text-gray-400 mt-1">
                                  <span className="text-blue-400">Večer:</span> {day.eveningNotes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
