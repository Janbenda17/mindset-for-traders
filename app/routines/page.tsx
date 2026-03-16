// Trading Routines component - with proper imports
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  GripVertical,
  type LucideIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserData, saveUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
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
  { value: "Brain", label: "Brain" },
  { value: "Dumbbell", label: "Exercise" },
  { value: "Coffee", label: "Coffee" },
  { value: "TrendingUp", label: "Chart" },
  { value: "Target", label: "Goal" },
  { value: "Eye", label: "Eye" },
  { value: "BookOpen", label: "Book" },
  { value: "Heart", label: "Heart" },
  { value: "Wind", label: "Relaxation" },
  { value: "Moon", label: "Moon" },
  { value: "Sun", label: "Sun" },
  { value: "Sparkles", label: "Sparkles" },
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

const defaultMorningRoutine = (isEn: boolean): RoutineItem[] => [
  {
    id: "m1",
    title: isEn ? "Morning Meditation" : "Ranní meditace",
    description: isEn ? "5-10 minutes of calm breathing" : "5-10 minut klidného dýchání",
    iconName: "Brain",
    completed: false,
    category: "mindset",
    isActive: true,
  },
  {
    id: "m2",
    title: isEn ? "Physical Activity" : "Fyzická aktivita",
    description: isEn ? "Stretching or short exercise" : "Protažení nebo krátké cvičení",
    iconName: "Dumbbell",
    completed: false,
    category: "body",
    isActive: true,
  },
  {
    id: "m3",
    title: isEn ? "Healthy Breakfast" : "Zdravá snídaně",
    description: isEn ? "Quality food for energy" : "Kvalitní jídlo pro energii",
    iconName: "Coffee",
    completed: false,
    category: "body",
    isActive: true,
  },
  {
    id: "m4",
    title: isEn ? "Market Check" : "Kontrola trhu",
    description: isEn ? "Overview of overnight movements" : "Přehled nočních pohybů",
    iconName: "TrendingUp",
    completed: false,
    category: "preparation",
    isActive: true,
  },
  {
    id: "m5",
    title: isEn ? "Daily Goals" : "Denní cíle",
    description: isEn ? "Set a maximum of 3 goals for the day" : "Nastav si max. 3 cíle na den",
    iconName: "Target",
    completed: false,
    category: "preparation",
    isActive: true,
  },
  {
    id: "m6",
    title: isEn ? "Visualization" : "Vizualizace",
    description: isEn ? "Imagine a successful trading day" : "Představ si úspěšný obchodní den",
    iconName: "Eye",
    completed: false,
    category: "mindset",
    isActive: true,
  },
]

const defaultEveningRoutine = (isEn: boolean): RoutineItem[] => [
  {
    id: "e1",
    title: isEn ? "Trade Review" : "Přehledy obchodů",
    description: isEn ? "Evaluation of today's trades" : "Vyhodnocení dnešních obchodů",
    iconName: "BookOpen",
    completed: false,
    category: "review",
    isActive: true,
  },
  {
    id: "e2",
    title: isEn ? "Journal Update" : "Aktualizace deníku",
    description: isEn ? "Write in trading journal" : "Zapiš do obchodního deníku",
    iconName: "BookOpen",
    completed: false,
    category: "review",
    isActive: true,
  },
  {
    id: "e3",
    title: isEn ? "Gratitude" : "Vděčnost",
    description: isEn ? "3 things I'm grateful for" : "3 věci za které jsem vděčný/á",
    iconName: "Heart",
    completed: false,
    category: "mindset",
    isActive: true,
  },
  {
    id: "e4",
    title: isEn ? "Prepare for Tomorrow" : "Příprava na zítřek",
    description: isEn ? "Watchlist and plan for next day" : "Watchlist a plán na příští den",
    iconName: "Target",
    completed: false,
    category: "preparation",
    isActive: true,
  },
  {
    id: "e5",
    title: isEn ? "Relaxation" : "Relaxace",
    description: isEn ? "Screen-free time" : "Čas bez obrazovky",
    iconName: "Wind",
    completed: false,
    category: "body",
    isActive: true,
  },
  {
    id: "e6",
    title: isEn ? "Quality Sleep" : "Kvalitní spánek",
    description: isEn ? "Prepare for 7-8 hours of sleep" : "Příprava na 7-8 hodin spánku",
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
      morningNotes: i % 3 === 0 ? "I felt well prepared for trading." : "",
      eveningNotes: i % 4 === 0 ? "Good day, I stuck to the plan." : "",
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
  const { language } = useLanguage()
  const isEn = language === "en"

  const storage = createStorageClient(user?.id || null)

  const [morningRoutine, setMorningRoutine] = useState<RoutineItem[]>(defaultMorningRoutine(isEn))
  const [eveningRoutine, setEveningRoutine] = useState<RoutineItem[]>(defaultEveningRoutine(isEn))
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
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]

  const txt = {
    back: isEn ? "Back" : "Zpět",
    routines: isEn ? "Trading Routines" : "Obchodní rutiny",
    subtitle: isEn ? "Consistency in routines = Consistency in results" : "Konzistentní rutiny = konzistentní výsledky",
    demoMode: isEn ? "Demo Mode" : "Demo režim",
    addCustomItem: isEn ? "Add Custom Item" : "Přidat vlastní položku",
    createCustom: isEn ? "Create your own routine item" : "Vytvoř si vlastní položku do rutiny",
    name: isEn ? "Name" : "Název",
    enterName: isEn ? "e.g. Cold shower" : "Např. Studená sprcha",
    description: isEn ? "Description (optional)" : "Popis (volitelný)",
    shortDescription: isEn ? "Short description" : "Krátký popis",
    icon: isEn ? "Icon" : "Ikona",
    routine: isEn ? "Routine" : "Rutina",
    morning: isEn ? "Morning" : "Ráno",
    evening: isEn ? "Evening" : "Večer",
    category: isEn ? "Category" : "Kategorie",
    mindset: isEn ? "Mindset" : "Mindset",
    body: isEn ? "Body" : "Tělo",
    preparation: isEn ? "Preparation" : "Příprava",
    review: isEn ? "Review" : "Přehledy",
    addItem: isEn ? "Add Item" : "Přidat položku",
    enterItemName: isEn ? "Enter item name" : "Zadej název položky",
    itemAdded: isEn ? "Item added" : "Položka přidána",
    itemDeleted: isEn ? "Item deleted" : "Položka smazána",
    noCustomItems: isEn ? "In demo mode, items cannot be added" : "V demo režimu nelze přidávat položky",
    editMode: isEn ? "Edit" : "Upravit",
    saveHistory: isEn ? "Save to History" : "Uložit do historii",
    savedToHistory: isEn ? "Saved to history" : "Uloženo do historii",
    morningRoutine: isEn ? "Morning Routine" : "Ranní rutina",
    eveningRoutine: isEn ? "Evening Routine" : "Večerní rutina",
    progress: isEn ? "Progress" : "Pokrok",
    history: isEn ? "History" : "Historie",
    custom: isEn ? "Custom" : "Vlastní",
    stats: isEn ? "Your Stats" : "Tvoje statistiky",
    streak: isEn ? "Streak" : "Série",
    averageCompletion: isEn ? "Average Completion" : "Průměrné dokončení",
  }

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
        title: "Demo Mode",
        description: "In demo mode, changes cannot be saved. Switch to Live mode.",
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
    toast({ title: "Item deleted" })
  }

  const addCustomItem = () => {
    if (!isLiveMode) {
      toast({
        title: "Demo Mode",
        description: "In demo mode, items cannot be added.",
        variant: "destructive",
      })
      return
    }

    if (!newItem.title.trim()) {
      toast({ title: "Enter item name", variant: "destructive" })
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
    toast({ title: "Item added" })
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

    toast({ title: "Saved to history" })
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

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
      setDraggedItemId(itemId)
      e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent, itemId: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDragOverItemId(itemId)
    }

    const handleDrop = (e: React.DragEvent, targetItemId: string) => {
      e.preventDefault()
      if (!draggedItemId || draggedItemId === targetItemId) {
        setDraggedItemId(null)
        setDragOverItemId(null)
        return
      }

      const draggedIndex = items.findIndex((i) => i.id === draggedItemId)
      const targetIndex = items.findIndex((i) => i.id === targetItemId)

      if (draggedIndex === -1 || targetIndex === -1) return

      const newItems = [...items]
      const [removed] = newItems.splice(draggedIndex, 1)
      newItems.splice(targetIndex, 0, removed)

      if (routineType === "morning") {
        setMorningRoutine(newItems)
      } else {
        setEveningRoutine(newItems)
      }

      setDraggedItemId(null)
      setDragOverItemId(null)
    }

    const handleDragEnd = () => {
      setDraggedItemId(null)
      setDragOverItemId(null)
    }

    return (
      <div className="space-y-3">
        {activeItems.map((item) => {
          const IconComponent = iconMap[item.iconName] || Brain
          return (
            <div
              key={item.id}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                isEditMode && "cursor-move",
                draggedItemId === item.id && "opacity-50 bg-slate-700/50",
                dragOverItemId === item.id && draggedItemId !== item.id && "border-blue-500/50 bg-blue-500/5",
                item.completed && !isEditMode
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50",
                !item.isActive && isEditMode && "opacity-50",
              )}
            >
              {isEditMode ? (
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <Checkbox
                    checked={item.isActive}
                    onCheckedChange={() => toggleItemActive(routineType, item.id)}
                    className="mt-1"
                  />
                </div>
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
                      Custom
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
            <span className="text-sm text-gray-400">{txt.back}</span>
          </div>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl">
                <Sun className="w-6 h-6 text-white" />
              </div>
              {txt.routines}
            </h1>
            <p className="text-gray-400 mt-1">{txt.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            {!isLiveMode && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{txt.demoMode}</Badge>}
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
                  <DialogTitle className="text-white">{txt.addCustomItem}</DialogTitle>
                  <DialogDescription className="text-gray-400">{txt.createCustom}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-gray-300">{txt.name}</Label>
                    <Input
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder={txt.enterName}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">{txt.description}</Label>
                    <Input
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder={txt.shortDescription}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">{txt.icon}</Label>
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
                      <Label className="text-gray-300">{txt.routine}</Label>
                      <Select
                        value={newItem.routine}
                        onValueChange={(v: "morning" | "evening") => setNewItem({ ...newItem, routine: v })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="morning" className="text-white">
                            {txt.morning}
                          </SelectItem>
                          <SelectItem value="evening" className="text-white">
                            {txt.evening}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Category</Label>
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
                    <p className="text-xs text-gray-400">Streak (days)</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{avgCompletion}%</span>
              </div>
                    <p className="text-xs text-gray-400">Average Completion</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">{history.length}</span>
              </div>
                    <p className="text-xs text-gray-400">Days in History</p>
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
              Morning
            </TabsTrigger>
            <TabsTrigger
              value="evening"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              <Moon className="w-4 h-4 mr-2" />
              Evening
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <History className="w-4 h-4 mr-2" />
              History
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
                      <CardTitle className="text-white">Morning Routine</CardTitle>
                      <CardDescription>Prepare yourself for a successful trading day</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{Math.round(getProgress(morningRoutine))}%</p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                </div>
                <Progress value={getProgress(morningRoutine)} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {renderRoutineItems(morningRoutine, "morning")}

                <div className="pt-4 border-t border-slate-700/50">
                  <Label className="text-gray-300 text-sm">Notes (optional)</Label>
                  <Textarea
                    value={morningNotes}
                    onChange={(e) => setMorningNotes(e.target.value)}
                    placeholder="How do you feel in the morning? What are your expectations for the day?"
                    className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[80px]"
                    disabled={!isLiveMode}
                  />
                </div>

                {isLiveMode && (
                  <Button onClick={saveToHistory} className="w-full bg-orange-600 hover:bg-orange-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save to History
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
                      <CardTitle className="text-white">Evening Routine</CardTitle>
                      <CardDescription>Close your day and prepare for tomorrow</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{Math.round(getProgress(eveningRoutine))}%</p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                </div>
                <Progress value={getProgress(eveningRoutine)} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {renderRoutineItems(eveningRoutine, "evening")}

                <div className="pt-4 border-t border-slate-700/50">
                  <Label className="text-gray-300 text-sm">Notes (optional)</Label>
                  <Textarea
                    value={eveningNotes}
                    onChange={(e) => setEveningNotes(e.target.value)}
                    placeholder="How was the trading day? What would you do differently?"
                    className="bg-slate-800/50 border-slate-700 text-white mt-2 min-h-[80px]"
                    disabled={!isLiveMode}
                  />
                </div>

                {isLiveMode && (
                  <Button onClick={saveToHistory} className="w-full bg-blue-600 hover:bg-blue-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save to History
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
                    <CardTitle className="text-white">Routine History</CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No history yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start completing routines and see your progress here</p>
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
                                <span className="text-xs text-gray-400">Morning</span>
                                <span className="text-xs text-white ml-auto">
                                  {day.morningCompleted}/{day.morningTotal}
                                </span>
                              </div>
                              <Progress value={morningPercent} className="h-1.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Moon className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-gray-400">Evening</span>
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
                                  <span className="text-orange-400">Morning:</span> {day.morningNotes}
                                </p>
                              )}
                              {day.eveningNotes && (
                                <p className="text-xs text-gray-400 mt-1">
                                  <span className="text-blue-400">Evening:</span> {day.eveningNotes}
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
