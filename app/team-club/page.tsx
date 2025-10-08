"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Users,
  TrendingUp,
  Brain,
  MessageCircle,
  Target,
  AlertCircle,
  Activity,
  BarChart3,
  Smile,
  Frown,
  Trophy,
  Send,
  Flame,
  Coffee,
  Moon,
  CheckCircle,
  ArrowRight,
  Plus,
  Bell,
  Settings,
  Eye,
  Search,
  Shield,
  Heart,
  Sparkles,
  VideoIcon,
  Calendar,
  MessageSquare,
  LineChart,
  PhoneCall,
  Download,
  XCircle,
  Edit,
  StickyNote,
  Lightbulb,
  Radio,
  Volume2,
  Wind,
  Sun,
  CloudLightning as Lightning,
} from "lucide-react"
import { useData } from "@/contexts/data-context"

// Types
interface Student {
  id: string
  name: string
  nickname: string
  avatar: string
  traderType: "scalper" | "day-trader" | "swing-trader" | "position-trader"
  readiness: number
  readinessHistory: number[]
  discipline: number
  pnl: number
  pnlHistory: number[]
  journalStreak: number
  status: "stable" | "warning" | "critical"
  lastActive: string
  triggers: string[]
  strengths: string[]
  weaknesses: string[]
  aiDiagnosis: string
  mentorNotes: string[]
  todos: string[]
}

interface GroupChallenge {
  id: string
  title: string
  type: "behavioral" | "routine" | "mental"
  description: string
  startDate: string
  endDate: string
  participants: number
  completed: number
  progress: number
  reward: string
  status: "active" | "completed" | "upcoming"
}

interface MentorAlert {
  id: string
  type: "critical" | "warning" | "info"
  message: string
  studentId?: string
  timestamp: string
  resolved: boolean
}

export default function TeamClubPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [challenges, setChallenges] = useState<GroupChallenge[]>([])
  const [alerts, setAlerts] = useState<MentorAlert[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "stable" | "warning" | "critical">("all")
  const [groupMood, setGroupMood] = useState(75)
  const [focusMode, setFocusMode] = useState<string | null>(null)
  const { isLiveMode } = useData()

  useEffect(() => {
    loadData()
  }, [isLiveMode])

  const loadData = () => {
    // Sample Students Data
    const sampleStudents: Student[] = [
      {
        id: "1",
        name: "Martin Novák",
        nickname: "ScalperPro",
        avatar: "/trader-avatar.png",
        traderType: "scalper",
        readiness: 45,
        readinessHistory: [65, 62, 58, 52, 48, 45, 43],
        discipline: 58,
        pnl: -450,
        pnlHistory: [200, -150, 300, -200, -300, -100, -200],
        journalStreak: 2,
        status: "critical",
        lastActive: "před 2h",
        triggers: ["revenge-trading", "late-night-trading", "FOMO"],
        strengths: ["rychlé rozhodování", "analýza"],
        weaknesses: ["impulzivita", "nedostatek spánku", "emocionální reakce"],
        aiDiagnosis:
          "Martin prochází fází frustrace. 7 z 10 posledních ztrát bylo při readiness <60. Hlavní problém: nedostatek spánku (průměr 5.2h) + trading po 22:00. Doporučení: 2 týdny bez večerního tradingu + focus na rutinu.",
        mentorNotes: [
          "Dnes jsme mluvili o spánku - slíbil, že zkusí chodit spát o 2h dříve",
          "Má problém s FOMO po ztrátě - pracovat na pauze systému",
        ],
        todos: ["7 dní bez tradingu po 22:00", "Spánek min. 7h", "Journaling každý den", "30 min meditace ráno"],
      },
      {
        id: "2",
        name: "Jana Svobodová",
        nickname: "PatientTrader",
        avatar: "/trader-avatar.png",
        traderType: "swing-trader",
        readiness: 82,
        readinessHistory: [78, 79, 80, 81, 82, 83, 82],
        discipline: 89,
        pnl: 1250,
        pnlHistory: [150, 200, -50, 300, 250, 200, 200],
        journalStreak: 34,
        status: "stable",
        lastActive: "před 15 min",
        triggers: [],
        strengths: ["disciplína", "trpělivost", "risk management", "rutina"],
        weaknesses: ["příliš konzervativní"],
        aiDiagnosis:
          "Jana je vzorový příklad disciplinovaného tradera. Jediná oblast ke zlepšení: občas nechává zisky běžet příliš dlouho a přichází o část. Doporučení: trailing stop optimalizace.",
        mentorNotes: ["Role model pro skupinu", "Může mentorovat začátečníky"],
        todos: ["Sdílet své postupy se skupinou", "Experimentovat s trailing stops"],
      },
      {
        id: "3",
        name: "Petr Dvořák",
        nickname: "DayTraderPete",
        avatar: "/trader-avatar.png",
        traderType: "day-trader",
        readiness: 68,
        readinessHistory: [72, 70, 69, 68, 67, 68, 68],
        discipline: 72,
        pnl: 320,
        pnlHistory: [100, 50, -30, 80, 60, 40, 20],
        journalStreak: 12,
        status: "warning",
        lastActive: "před 1h",
        triggers: ["early-exit", "hesitation"],
        strengths: ["analýza", "risk management"],
        weaknesses: ["váhání při vstupu", "předčasné exity"],
        aiDiagnosis:
          "Petr má solidní základ, ale trpí strachem ze ztráty. Často exituje předčasně nebo váhá při vstupu. Výsledek: menší zisky než by mohl. Doporučení: psychology coaching + simulace.",
        mentorNotes: ["Pracovat na sebedůvěře", "Cvičit visualizaci úspěšných tradů"],
        todos: ["Vizualizace 10 min denně", "Review předčasných exitů", "Mental rehearsal před tradingem"],
      },
      {
        id: "4",
        name: "Lukáš Černý",
        nickname: "ConsistentLuke",
        avatar: "/trader-avatar.png",
        traderType: "day-trader",
        readiness: 76,
        readinessHistory: [74, 75, 76, 77, 76, 75, 76],
        discipline: 81,
        pnl: 890,
        pnlHistory: [120, 130, 140, 150, 140, 130, 120],
        journalStreak: 21,
        status: "stable",
        lastActive: "před 30 min",
        triggers: [],
        strengths: ["konzistence", "journaling", "rutina"],
        weaknesses: ["může být monotónní"],
        aiDiagnosis:
          "Lukáš je stabilní trader s dobrou konzistencí. Nemá dramatické zisky, ale ani ztráty. Ideální pro long-term růst. Jediné doporučení: občas zkusit větší pozice při A+ setupech.",
        mentorNotes: ["Velmi spolehlivý", "Může být 'buddy' pro začátečníky"],
        todos: ["Pokračovat v rutině", "Zkusit 1 větší pozici týdně"],
      },
    ]
    setStudents(sampleStudents)

    // Sample Challenges
    const sampleChallenges: GroupChallenge[] = [
      {
        id: "1",
        title: "Zero Revenge Trading",
        type: "behavioral",
        description: "7 dní bez jediného revenge tradu. Po každé ztrátě min. 15 min pauza.",
        startDate: "2024-01-15",
        endDate: "2024-01-21",
        participants: 4,
        completed: 2,
        progress: 71,
        reward: "🏆 Revenge-Free Warrior badge + 500 XP",
        status: "active",
      },
      {
        id: "2",
        title: "Morning Routine Challenge",
        type: "routine",
        description: "21 dní s ranní rutinou: meditace + visualizace + plán před tradingem.",
        startDate: "2024-01-01",
        endDate: "2024-01-21",
        participants: 4,
        completed: 1,
        progress: 43,
        reward: "🧘 Zen Master badge + AI Advanced Insights unlock",
        status: "active",
      },
      {
        id: "3",
        title: "Sleep Optimization",
        type: "mental",
        description: "14 nocí s min. 7h spánku. Tracking přes Fitbit/Apple Health.",
        startDate: "2024-01-08",
        endDate: "2024-01-21",
        participants: 3,
        completed: 0,
        progress: 29,
        reward: "💤 Sleep Champion + Wellbeing Premium unlock",
        status: "active",
      },
    ]
    setChallenges(sampleChallenges)

    // Sample Alerts
    const sampleAlerts: MentorAlert[] = [
      {
        id: "1",
        type: "critical",
        message: "Martin Novák - Readiness pod 50 po dobu 3 dnů. Doporučuji okamžitý 1:1 call.",
        studentId: "1",
        timestamp: "před 2h",
        resolved: false,
      },
      {
        id: "2",
        type: "warning",
        message: "Petr Dvořák - 5 předčasných exitů za poslední 3 dny. Možný strach ze ztráty.",
        studentId: "3",
        timestamp: "před 5h",
        resolved: false,
      },
      {
        id: "3",
        type: "warning",
        message: "Skupina: Revenge trading +35% tento týden vs minulý. Naplánuj group call o disciplíně.",
        timestamp: "před 1 den",
        resolved: false,
      },
      {
        id: "4",
        type: "info",
        message: "Jana Svobodová dosáhla 30-denního journaling streak! 🎉 Možnost sdílení best practices.",
        studentId: "2",
        timestamp: "před 2 dny",
        resolved: true,
      },
    ]
    setAlerts(sampleAlerts)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "warning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "stable":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      case "critical":
        return <XCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getTraderTypeLabel = (type: string) => {
    switch (type) {
      case "scalper":
        return "Scalper"
      case "day-trader":
        return "Day Trader"
      case "swing-trader":
        return "Swing Trader"
      case "position-trader":
        return "Position Trader"
      default:
        return type
    }
  }

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case "behavioral":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "routine":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "mental":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case "behavioral":
        return "Behavioral"
      case "routine":
        return "Routine"
      case "mental":
        return "Mental"
      default:
        return type
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || student.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const groupStats = {
    avgReadiness: Math.round(students.reduce((acc, s) => acc + s.readiness, 0) / students.length),
    avgDiscipline: Math.round(students.reduce((acc, s) => acc + s.discipline, 0) / students.length),
    totalPnL: students.reduce((acc, s) => acc + s.pnl, 0),
    inProfit: students.filter((s) => s.pnl > 0).length,
    criticalCount: students.filter((s) => s.status === "critical").length,
    warningCount: students.filter((s) => s.status === "warning").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                MindTrader Team Club
              </h1>
              <p className="text-slate-400 text-lg">AI-Powered Mentoring & Community Center</p>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 rounded-xl"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 rounded-xl"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Broadcast
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 rounded-xl"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Critical Alerts Banner */}
          {alerts.filter((a) => !a.resolved && a.type === "critical").length > 0 && (
            <Card className="bg-gradient-to-r from-red-600/90 via-red-700/90 to-red-600/90 border-red-400 rounded-2xl mb-6 shadow-2xl shadow-red-500/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5 animate-pulse" />
                      Critical Alerts ({alerts.filter((a) => !a.resolved && a.type === "critical").length})
                    </h4>
                    <div className="space-y-2">
                      {alerts
                        .filter((a) => !a.resolved && a.type === "critical")
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                          >
                            <p className="text-white text-sm font-medium">{alert.message}</p>
                            <div className="flex gap-2">
                              {alert.studentId && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const student = students.find((s) => s.id === alert.studentId)
                                    if (student) setSelectedStudent(student)
                                    setActiveTab("students")
                                  }}
                                  className="bg-white text-red-600 hover:bg-white/90 rounded-lg text-xs h-7 font-bold"
                                >
                                  View Student
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white hover:text-white hover:bg-white/20 rounded-lg text-xs h-7"
                              >
                                Resolve
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 p-1.5 h-auto rounded-2xl flex-wrap">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl px-4 py-2.5 text-sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl px-4 py-2.5 text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Students
              {groupStats.criticalCount + groupStats.warningCount > 0 && (
                <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1.5 py-0">
                  {groupStats.criticalCount + groupStats.warningCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl px-4 py-2.5 text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl px-4 py-2.5 text-sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger
              value="wellbeing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl px-4 py-2.5 text-sm"
            >
              <Heart className="w-4 h-4 mr-2" />
              Wellbeing
            </TabsTrigger>
            <TabsTrigger
              value="communication"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl px-4 py-2.5 text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Communication
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl px-4 py-2.5 text-sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              Mentor Tools
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl">
                      <Activity className="h-5 w-5 text-purple-400" />
                    </div>
                    <Badge
                      className={
                        groupStats.avgReadiness >= 70
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : groupStats.avgReadiness >= 50
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {groupStats.avgReadiness >= 70 ? "Skvělé" : groupStats.avgReadiness >= 50 ? "OK" : "Pozor"}
                    </Badge>
                  </div>
                  <h3 className="text-white text-3xl font-black mb-1">{groupStats.avgReadiness}%</h3>
                  <p className="text-slate-400 text-sm">Avg. Readiness</p>
                  <p className="text-slate-500 text-xs mt-2">7-day průměr skupiny</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    <Badge
                      className={
                        groupStats.avgDiscipline >= 70
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : groupStats.avgDiscipline >= 50
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {groupStats.avgDiscipline >= 70 ? "Výborná" : groupStats.avgDiscipline >= 50 ? "OK" : "Nízká"}
                    </Badge>
                  </div>
                  <h3 className="text-white text-3xl font-black mb-1">{groupStats.avgDiscipline}%</h3>
                  <p className="text-slate-400 text-sm">Disciplína</p>
                  <p className="text-slate-500 text-xs mt-2">Mental Health Index</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <Badge
                      className={
                        groupStats.totalPnL > 0
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {groupStats.inProfit}/{students.length} v profitu
                    </Badge>
                  </div>
                  <h3
                    className={`text-3xl font-black mb-1 ${groupStats.totalPnL > 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {groupStats.totalPnL > 0 ? "+" : ""}${groupStats.totalPnL.toLocaleString()}
                  </h3>
                  <p className="text-slate-400 text-sm">Total P/L (7 dní)</p>
                  <p className="text-slate-500 text-xs mt-2">Performance snapshot</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                      <Target className="h-5 w-5 text-amber-400" />
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      {challenges.filter((c) => c.status === "active").length} aktivní
                    </Badge>
                  </div>
                  <h3 className="text-white text-3xl font-black mb-1">
                    {Math.round(
                      challenges.filter((c) => c.status === "active").reduce((acc, c) => acc + c.progress, 0) /
                        challenges.filter((c) => c.status === "active").length,
                    )}
                    %
                  </h3>
                  <p className="text-slate-400 text-sm">Avg. Challenge Progress</p>
                  <p className="text-slate-500 text-xs mt-2">Skupinové výzvy</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Alert Box */}
            <Card className="bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-600/90 border-blue-400 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Group Insights
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                        <p className="text-white font-semibold text-sm mb-1">⚠️ Critical Alert</p>
                        <p className="text-white/90 text-sm">
                          1 student (Martin) má readiness pod 50 po 3 dny. Riziko burnoutu nebo velkých ztrát.
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                        <p className="text-white font-semibold text-sm mb-1">📊 Trend Warning</p>
                        <p className="text-white/90 text-sm">
                          Revenge trading ve skupině +35% vs minulý týden. Doporučuji group call o disciplíně.
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                        <p className="text-white font-semibold text-sm mb-1">✨ Positive</p>
                        <p className="text-white/90 text-sm">
                          Jana má 34-denní journaling streak a je v profitu. Může sdílet best practices!
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                        <p className="text-white font-semibold text-sm mb-1">💡 AI Recommendation</p>
                        <p className="text-white/90 text-sm">
                          Skupiny s ranní rutinou mají o 23% vyšší readiness. Zkus zavést Morning Challenge pro celý
                          tým.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Challenges */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-400" />
                      Active Challenges
                    </CardTitle>
                    <Button size="sm" variant="outline" className="bg-transparent border-slate-700 rounded-xl text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Nová výzva
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {challenges
                    .filter((c) => c.status === "active")
                    .map((challenge) => (
                      <div
                        key={challenge.id}
                        className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm mb-1">{challenge.title}</h4>
                            <p className="text-slate-400 text-xs mb-2">{challenge.description}</p>
                            <Badge className={getChallengeTypeColor(challenge.type)}>
                              {getChallengeTypeLabel(challenge.type)}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white font-bold">
                              {challenge.completed}/{challenge.participants} completed
                            </span>
                          </div>
                          <Progress value={challenge.progress} className="h-2 rounded-full" />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              {challenge.endDate} • {challenge.participants} účastníků
                            </span>
                            <span className="text-amber-400 font-semibold">{challenge.reward}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Discipline Leaderboard */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    Discipline Leaderboard
                  </CardTitle>
                  <CardDescription className="text-slate-400">Podle disciplíny, ne zisku</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[...students]
                    .sort((a, b) => b.discipline - a.discipline)
                    .map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 hover:bg-slate-700/30 rounded-xl transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedStudent(student)
                          setActiveTab("students")
                        }}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? "bg-amber-500/20 text-amber-400"
                              : index === 1
                                ? "bg-slate-400/20 text-slate-300"
                                : index === 2
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <Avatar className="w-9 h-9 ring-2 ring-purple-500/20">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{student.nickname}</p>
                          <p className="text-slate-500 text-xs">{student.journalStreak} dní streak</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-sm">{student.discipline}%</p>
                          <p className="text-slate-500 text-xs">disciplína</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* STUDENTS TAB - keeping existing implementation */}
          <TabsContent value="students" className="space-y-6">
            {!selectedStudent ? (
              <>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Hledat studenta..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl h-11 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["all", "stable", "warning", "critical"] as const).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={filterStatus === status ? "default" : "outline"}
                        onClick={() => setFilterStatus(status)}
                        className={`rounded-xl ${
                          filterStatus === status
                            ? "bg-gradient-to-r from-purple-600 to-pink-600"
                            : "bg-transparent border-slate-700"
                        }`}
                      >
                        {status === "all"
                          ? "Všichni"
                          : status === "stable"
                            ? "Stabilní"
                            : status === "warning"
                              ? "Pozor"
                              : "Kritický"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student) => (
                    <Card
                      key={student.id}
                      className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer group"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 ring-2 ring-purple-500/20">
                              <AvatarImage src={student.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-white font-bold text-sm">{student.name}</h3>
                              <p className="text-slate-400 text-xs">{student.nickname}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(student.status)}>
                            {getStatusIcon(student.status)}
                            <span className="ml-1 capitalize">{student.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-700/30 rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Readiness</p>
                            <p
                              className={`text-xl font-bold ${
                                student.readiness >= 70
                                  ? "text-emerald-400"
                                  : student.readiness >= 50
                                    ? "text-amber-400"
                                    : "text-red-400"
                              }`}
                            >
                              {student.readiness}%
                            </p>
                          </div>
                          <div className="bg-slate-700/30 rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Disciplína</p>
                            <p className="text-white text-xl font-bold">{student.discipline}%</p>
                          </div>
                          <div className="bg-slate-700/30 rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">P/L (7d)</p>
                            <p className={`text-xl font-bold ${student.pnl > 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {student.pnl > 0 ? "+" : ""}${student.pnl}
                            </p>
                          </div>
                          <div className="bg-slate-700/30 rounded-xl p-3">
                            <p className="text-slate-400 text-xs mb-1">Streak</p>
                            <p className="text-orange-400 text-xl font-bold flex items-center gap-1">
                              <Flame className="h-4 w-4" />
                              {student.journalStreak}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                            {getTraderTypeLabel(student.traderType)}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-xs h-8"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Detail
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-slate-700 rounded-xl text-xs h-8"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <p className="text-slate-500 text-xs text-center mt-3">{student.lastActive}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                  className="mb-4 bg-transparent border-slate-700 rounded-xl"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Zpět na seznam
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-6">
                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-purple-500/20">
                            <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{selectedStudent.name[0]}</AvatarFallback>
                          </Avatar>
                          <h2 className="text-white text-xl font-bold mb-1">{selectedStudent.name}</h2>
                          <p className="text-slate-400 text-sm mb-3">{selectedStudent.nickname}</p>
                          <Badge className={getStatusColor(selectedStudent.status)}>
                            {getStatusIcon(selectedStudent.status)}
                            <span className="ml-1 capitalize">{selectedStudent.status}</span>
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                            <span className="text-slate-400 text-sm">Typ tradera</span>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                              {getTraderTypeLabel(selectedStudent.traderType)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                            <span className="text-slate-400 text-sm">Journal streak</span>
                            <span className="text-orange-400 font-bold flex items-center gap-1">
                              <Flame className="h-4 w-4" />
                              {selectedStudent.journalStreak} dní
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                            <span className="text-slate-400 text-sm">Poslední aktivita</span>
                            <span className="text-white text-sm">{selectedStudent.lastActive}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent border-slate-700 rounded-xl"
                          >
                            <PhoneCall className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Klíčové metriky</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-xs">Readiness</span>
                            <span
                              className={`font-bold text-sm ${
                                selectedStudent.readiness >= 70
                                  ? "text-emerald-400"
                                  : selectedStudent.readiness >= 50
                                    ? "text-amber-400"
                                    : "text-red-400"
                              }`}
                            >
                              {selectedStudent.readiness}%
                            </span>
                          </div>
                          <Progress value={selectedStudent.readiness} className="h-2 rounded-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-xs">Disciplína</span>
                            <span className="text-white font-bold text-sm">{selectedStudent.discipline}%</span>
                          </div>
                          <Progress value={selectedStudent.discipline} className="h-2 rounded-full" />
                        </div>
                        <div className="pt-3 border-t border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs">P/L (7 dní)</span>
                            <span
                              className={`font-bold text-lg ${selectedStudent.pnl > 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {selectedStudent.pnl > 0 ? "+" : ""}${selectedStudent.pnl}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20 border-purple-500/20 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          size="sm"
                          className="w-full justify-start bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-xs"
                        >
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          Přidat poznámku
                        </Button>
                        <Button
                          size="sm"
                          className="w-full justify-start bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-xs"
                        >
                          <Target className="h-3.5 w-3.5 mr-2" />
                          Přidat úkol
                        </Button>
                        <Button
                          size="sm"
                          className="w-full justify-start bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-xs"
                        >
                          <Calendar className="h-3.5 w-3.5 mr-2" />
                          Naplánovat call
                        </Button>
                        <Button
                          size="sm"
                          className="w-full justify-start bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-xs"
                        >
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Export dat
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-600/90 border-blue-400 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          AI Diagnostika
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                          <p className="text-white text-sm leading-relaxed mb-4">{selectedStudent.aiDiagnosis}</p>
                          <div className="flex gap-2">
                            <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Insight
                            </Badge>
                            <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                              Poslední update: dnes
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            Silné stránky
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {selectedStudent.strengths.map((strength, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="text-slate-300 text-xs">{strength}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            Slabiny
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {selectedStudent.weaknesses.map((weakness, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20"
                            >
                              <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                              <span className="text-slate-300 text-xs">{weakness}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    {selectedStudent.triggers.length > 0 && (
                      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <Lightning className="h-4 w-4 text-amber-400" />
                            Emocionální triggery
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.triggers.map((trigger, index) => (
                              <Badge key={index} className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <StickyNote className="h-4 w-4 text-blue-400" />
                            Mentor Notes
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-slate-700 rounded-lg text-xs h-7"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Přidat
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedStudent.mentorNotes.map((note, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 text-slate-300 text-xs"
                          >
                            • {note}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-400" />
                            Úkoly pro studenta
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-slate-700 rounded-lg text-xs h-7"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Přidat
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedStudent.todos.map((todo, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                          >
                            <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <span className="text-slate-300 text-xs flex-1">{todo}</span>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-700/50 rounded-lg">
                              <Edit className="h-3 w-3 text-slate-400" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-blue-400" />
                          Readiness & P/L Timeline (7 dní)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-7 gap-2">
                          {selectedStudent.readinessHistory.map((readiness, index) => (
                            <div key={index} className="text-center">
                              <div className="mb-2">
                                <div
                                  className={`h-16 rounded-lg flex items-end justify-center ${
                                    readiness >= 70
                                      ? "bg-emerald-500/20"
                                      : readiness >= 50
                                        ? "bg-amber-500/20"
                                        : "bg-red-500/20"
                                  }`}
                                >
                                  <div
                                    className={`w-full rounded-t-lg ${
                                      readiness >= 70
                                        ? "bg-emerald-400"
                                        : readiness >= 50
                                          ? "bg-amber-400"
                                          : "bg-red-400"
                                    }`}
                                    style={{ height: `${readiness}%` }}
                                  ></div>
                                </div>
                                <p className="text-slate-400 text-xs mt-1">{readiness}%</p>
                              </div>
                              <div
                                className={`text-xs font-bold ${
                                  selectedStudent.pnlHistory[index] > 0 ? "text-emerald-400" : "text-red-400"
                                }`}
                              >
                                {selectedStudent.pnlHistory[index] > 0 ? "+" : ""}${selectedStudent.pnlHistory[index]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Readiness Heatmap */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    Readiness Heatmap
                  </CardTitle>
                  <CardDescription className="text-slate-400">7-denní přehled skupiny</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div key={student.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300 text-xs font-medium">{student.nickname}</span>
                          <span className="text-slate-400 text-xs">{student.readiness}%</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {student.readinessHistory.map((value, index) => (
                            <div
                              key={index}
                              className={`h-8 rounded ${
                                value >= 70 ? "bg-emerald-500/30" : value >= 50 ? "bg-amber-500/30" : "bg-red-500/30"
                              }`}
                              title={`${value}%`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Readiness vs P/L Correlation */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Readiness vs P/L
                  </CardTitle>
                  <CardDescription className="text-slate-400">Korelace výkonu a připravenosti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center gap-4">
                        <div className="w-32">
                          <p className="text-slate-300 text-xs font-medium mb-1">{student.nickname}</p>
                          <p className="text-slate-500 text-xs">R: {student.readiness}%</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-700/30 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full ${student.pnl > 0 ? "bg-emerald-400" : "bg-red-400"}`}
                                style={{
                                  width: `${Math.min(Math.abs(student.pnl) / 20, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span
                              className={`text-xs font-bold w-20 text-right ${
                                student.pnl > 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {student.pnl > 0 ? "+" : ""}${student.pnl}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-400 font-semibold text-xs mb-1">💡 AI Insight</p>
                    <p className="text-slate-300 text-xs">
                      Students s readiness &gt;70 mají průměrně o 43% vyšší P/L než ti s readiness &lt;50.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Trigger Distribution */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightning className="h-5 w-5 text-amber-400" />
                    Distribuce triggerů
                  </CardTitle>
                  <CardDescription className="text-slate-400">Nejčastější problémy ve skupině</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Revenge trading", count: 2, color: "red" },
                      { label: "FOMO vstupy", count: 2, color: "orange" },
                      { label: "Předčasné exity", count: 1, color: "amber" },
                      { label: "Váhání", count: 1, color: "yellow" },
                      { label: "Večerní trading", count: 1, color: "blue" },
                    ].map((trigger, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300 text-sm">{trigger.label}</span>
                          <span className="text-amber-400 font-bold text-sm">{trigger.count} studentů</span>
                        </div>
                        <Progress value={(trigger.count / students.length) * 100} className="h-2 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Commentary */}
              <Card className="bg-gradient-to-br from-indigo-600/90 via-indigo-700/90 to-indigo-600/90 border-indigo-400 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Commentary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white font-semibold text-xs mb-2">📊 Hlavní zjištění</p>
                    <p className="text-white/90 text-xs leading-relaxed">
                      Nejčastější problém ve skupině = nedostatek spánku a pozdní trading. 75% ztrát u Martina bylo po
                      22:00 při spánku &lt;6h.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white font-semibold text-xs mb-2">✅ Pozitiva</p>
                    <p className="text-white/90 text-xs leading-relaxed">
                      Když skupina dodržuje journaling (Jana, Lukáš), P/L stoupá průměrně o 18%. Doporučuji gamifikovat
                      streaky.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white font-semibold text-xs mb-2">💡 Doporučení</p>
                    <p className="text-white/90 text-xs leading-relaxed">
                      Zavést Morning Routine Challenge pro celou skupinu. Data ukazují, že ranní příprava zvyšuje
                      readiness o průměrných 12 bodů.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CHALLENGES TAB */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Skupinové výzvy</h2>
                <p className="text-slate-400 text-sm">Motivace, růst a gamifikace</p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Nová výzva
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getChallengeTypeColor(challenge.type)}>
                          {getChallengeTypeLabel(challenge.type)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            challenge.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }
                        >
                          {challenge.status === "active" ? "Aktivní" : "Completed"}
                        </Badge>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{challenge.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{challenge.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs">Pokrok</span>
                        <span className="text-white font-bold text-sm">
                          {challenge.completed}/{challenge.participants}
                        </span>
                      </div>
                      <Progress value={challenge.progress} className="h-2.5 rounded-full" />
                      <p className="text-slate-500 text-xs mt-1.5">{challenge.progress}% dokončeno</p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-amber-400 font-semibold text-xs">Odměna</span>
                      </div>
                      <p className="text-slate-300 text-xs">{challenge.reward}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <span className="text-slate-500 text-xs">
                        {challenge.startDate} - {challenge.endDate}
                      </span>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-xl text-xs h-7">
                        <Eye className="h-3 w-3 mr-1.5" />
                        Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Insight */}
            <Card className="bg-gradient-to-br from-emerald-600/90 via-emerald-700/90 to-emerald-600/90 border-emerald-400 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">AI Insight o výzvách</h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-3">
                      Skupiny, které splní alespoň 1 behavioral challenge měsíčně, mají o 23% vyšší disciplínu a o 15%
                      lepší win rate. Doporučuji pokračovat ve výzvách zaměřených na rutinu a spánek.
                    </p>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                      Založeno na datech z 127 mentorských skupin
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WELLBEING TAB */}
          <TabsContent value="wellbeing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Mood Radar */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    AI Mood Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="w-32 h-32 mx-auto mb-4 relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="rgb(71, 85, 105)"
                          strokeWidth="8"
                          opacity="0.2"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="rgb(52, 211, 153)"
                          strokeWidth="8"
                          strokeDasharray={`${(groupMood / 100) * 351.86} 351.86`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <p className="text-4xl font-black text-emerald-400">{groupMood}%</p>
                          <p className="text-slate-400 text-xs">mood</p>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Pozitivní nálada</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Smile className="h-3.5 w-3.5 text-emerald-400" />
                        Optimističtí
                      </span>
                      <span className="text-white font-bold">75%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-blue-400" />
                        Neutrální
                      </span>
                      <span className="text-white font-bold">15%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Frown className="h-3.5 w-3.5 text-red-400" />
                        Frustrovaní
                      </span>
                      <span className="text-white font-bold">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Focus Mode */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    Focus Mode
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Týdenní téma skupiny</CardDescription>
                </CardHeader>
                <CardContent>
                  {focusMode ? (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
                      <p className="text-purple-400 font-bold text-sm mb-1">🎯 Aktuální focus</p>
                      <p className="text-white text-lg font-bold mb-2">{focusMode}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFocusMode(null)}
                        className="w-full bg-transparent border-slate-700 rounded-lg text-xs"
                      >
                        Ukončit focus
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {["Trpělivost", "Disciplína", "Risk Management", "Žádné impulzy"].map((topic) => (
                        <Button
                          key={topic}
                          size="sm"
                          onClick={() => setFocusMode(topic)}
                          className="w-full justify-start bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-xs text-white"
                        >
                          <Target className="h-3.5 w-3.5 mr-2" />
                          {topic}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                    <p className="text-blue-400 text-xs font-semibold mb-1">💡 Tip</p>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Focus Mode nastaví týdenní téma. AI pak sleduje, jak se skupina v daném aspektu zlepšuje.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Mode */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    Recovery Mode
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Pro únavu a stress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-xl text-sm h-12">
                      <Wind className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold">Dýchací cvičení</p>
                        <p className="text-xs opacity-80">5 min guided breathing</p>
                      </div>
                    </Button>

                    <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-sm h-12">
                      <Coffee className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold">Pauza 15 min</p>
                        <p className="text-xs opacity-80">Mandatory break timer</p>
                      </div>
                    </Button>

                    <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-sm h-12">
                      <Moon className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <p className="font-semibold">Sleep tips</p>
                        <p className="text-xs opacity-80">Optimalizace spánku</p>
                      </div>
                    </Button>
                  </div>

                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <p className="text-amber-400 text-xs font-semibold mb-1">⚠️ Upozornění</p>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      1 student má readiness pod 50 po 3 dny. Doporučuji aktivovat Recovery Mode pro Martina.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Wellbeing Sync */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  Wellbeing Sync Status
                </CardTitle>
                <CardDescription className="text-slate-400">Automatické sledování zdraví a rutiny</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:border-slate-500/50 transition-all">
                    <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-3">
                      <Moon className="h-5 w-5 text-purple-400" />
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-2">Auto Sleep Tracking</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">2/4 studentů</span>
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">50%</Badge>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:border-slate-500/50 transition-all">
                    <div className="p-3 bg-amber-500/10 rounded-xl w-fit mb-3">
                      <Sun className="h-5 w-5 text-amber-400" />
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-2">Počasí Sync</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">4/4 studentů</span>
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">100%</Badge>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:border-slate-500/50 transition-all">
                    <div className="p-3 bg-pink-500/10 rounded-xl w-fit mb-3">
                      <Heart className="h-5 w-5 text-pink-400" />
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-2">Meditace & Sport</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">1/4 studentů</span>
                      <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20 text-xs">25%</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-300 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-300 font-semibold text-sm mb-1">💤 AI Korelace: Spánek</p>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        Studenti s průměrným spánkem 7+ hodin mají o 23% vyšší readiness a o 19% lepší win rate.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMMUNICATION TAB */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Group Chat */}
              <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-400" />
                    Skupinový chat
                  </CardTitle>
                  <CardDescription className="text-slate-400">AI-moderovaný, bez toxicity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] bg-slate-900/50 rounded-xl p-4 mb-4 overflow-y-auto">
                    <p className="text-slate-500 text-center text-sm py-12">Chat bude brzy k dispozici...</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Napiš zprávu skupině..."
                      className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl"
                    />
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Communication Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-sm">
                      <Radio className="h-4 w-4 mr-2" />
                      Mentor Broadcast
                    </Button>
                    <Button className="w-full justify-start bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-sm">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Voice Message
                    </Button>
                    <Button className="w-full justify-start bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-sm">
                      <VideoIcon className="h-4 w-4 mr-2" />
                      Video Update
                    </Button>
                    <Button className="w-full justify-start bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Weekly Check-in
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-600/90 via-violet-700/90 to-violet-600/90 border-violet-400 rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Reflection Wall</CardTitle>
                    <CardDescription className="text-white/80 text-xs">Anonymní sdílení</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white text-xs italic">
                          "Dneska jsem revenge tradoval, ale uvědomil jsem si to včas a zastavil se."
                        </p>
                        <p className="text-white/60 text-xs mt-1">před 2h</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-white text-violet-600 hover:bg-white/90 rounded-lg text-xs font-bold"
                    >
                      <Plus className="h-3 w-3 mr-1.5" />
                      Přidat reflexi
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* MENTOR TOOLS TAB */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentor's Notebook */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <StickyNote className="h-5 w-5 text-blue-400" />
                    Mentor's Notebook
                  </CardTitle>
                  <CardDescription className="text-slate-400">Poznámky a připomínky</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Napiš poznámky o skupině, studentech nebo nápadech..."
                    className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 min-h-[200px] rounded-xl mb-4"
                  />
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl">
                    <Download className="h-4 w-4 mr-2" />
                    Uložit poznámku
                  </Button>
                </CardContent>
              </Card>

              {/* Group Alerts */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="h-5 w-5 text-amber-400" />
                      Group Alerts
                    </CardTitle>
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                      {alerts.filter((a) => !a.resolved).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border ${
                        alert.resolved
                          ? "bg-slate-700/20 border-slate-600/20 opacity-50"
                          : alert.type === "critical"
                            ? "bg-red-500/10 border-red-500/20"
                            : alert.type === "warning"
                              ? "bg-amber-500/10 border-amber-500/20"
                              : "bg-blue-500/10 border-blue-500/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-slate-300 text-xs mb-1">{alert.message}</p>
                          <p className="text-slate-500 text-xs">{alert.timestamp}</p>
                        </div>
                        {!alert.resolved && (
                          <Button size="sm" variant="ghost" className="h-6 text-xs hover:bg-slate-700/50 rounded-lg">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Mentor Performance */}
              <Card className="bg-gradient-to-br from-amber-600/90 via-amber-700/90 to-amber-600/90 border-amber-400 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Tvoje Performance jako Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <p className="text-white text-3xl font-black mb-1">{students.length}</p>
                      <p className="text-white/80 text-xs">Aktivní studenti</p>
                    </div>
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <p className="text-white text-3xl font-black mb-1">+{groupStats.avgDiscipline}%</p>
                      <p className="text-white/80 text-xs">Avg. zlepšení</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-2">🎯 AI Insight</p>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Tvoje skupiny se zlepšují o 15% rychleji než průměr. Nejefektivnější challenge: disciplína
                      streaky.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <span className="text-slate-400 text-sm">Stabilní studenti</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {students.filter((s) => s.status === "stable").length}/{students.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <span className="text-slate-400 text-sm">Vyžadují pozornost</span>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                      {groupStats.warningCount + groupStats.criticalCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <span className="text-slate-400 text-sm">Aktivní výzvy</span>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      {challenges.filter((c) => c.status === "active").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <span className="text-slate-400 text-sm">Avg. journal streak</span>
                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                      <Flame className="h-3 w-3 mr-1" />
                      {Math.round(students.reduce((acc, s) => acc + s.journalStreak, 0) / students.length)} dní
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
