"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  TrendingUp,
  Brain,
  Target,
  AlertCircle,
  Activity,
  Smile,
  Trophy,
  Flame,
  Bell,
  Shield,
  Sparkles,
  MessageSquare,
  UserPlus,
  Star,
  Telescope,
  Gauge,
  PieChart,
  ArrowUp,
  ArrowDown,
  Send,
  ThumbsUp,
  MessageCircle,
  Share2,
  TrendingDown,
  Lightbulb,
  Plus,
  XCircle,
  CheckCircle,
  Calendar,
  Clock,
  PlayCircle,
  Radio,
  Eye,
  Search,
  Flag,
  Lock,
  Trash2,
  Edit,
  Zap,
  Loader2,
} from "lucide-react"
import { useData } from "@/contexts/data-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context" // ADDED: Import useAuth
import { useLiveMode } from "@/contexts/live-mode-context"

// Types
interface CommunityPost {
  id: string
  author: string
  avatar: string
  content: string
  type: "win" | "loss" | "insight" | "question" | "journal"
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  tags?: string[]
}

interface StudyBuddy {
  id: string
  name: string
  nickname: string
  avatar: string
  traderType: string
  winRate: number
  streak: number
  status: "online" | "offline"
  compatibility: number
  timezone: string
  tradingHours: string
}

interface Challenge {
  id: string
  title: string
  description: string
  type: "behavioral" | "routine" | "mental" | "skill"
  category: "beginner" | "intermediate" | "advanced"
  participants: number
  daysLeft: number
  duration: number
  progress: number
  reward: string
  joined: boolean
  difficulty: number
  xpReward: number
}

interface TradingRoom {
  id: string
  name: string
  host: string
  participants: number
  maxParticipants: number
  startTime: string
  duration: string
  type: "live-trading" | "review" | "strategy" | "q&a"
  status: "live" | "scheduled" | "ended"
}

interface SuccessStory {
  id: string
  author: string
  avatar: string
  title: string
  content: string
  beforeAfter: {
    before: { metric: string; value: string }[]
    after: { metric: string; value: string }[]
  }
  timestamp: string
  likes: number
}

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

// Demo data
const DEMO_POSTS: CommunityPost[] = [
  {
    id: "1",
    author: "Jana Svobodová",
    avatar: "/trader-avatar.png",
    content:
      "After 3 weeks of working on patience, I had the perfect trade today! I waited 4 hours for my A+ setup and it paid off. +$420 🎯",
    type: "win",
    timestamp: "2h ago",
    likes: 34,
    comments: 12,
    isLiked: false,
    tags: ["patience", "discipline", "setup"],
  },
  {
    id: "2",
    author: "Martin Novák",
    avatar: "/trader-avatar.png",
    content:
      "I made a mistake today - I went into revenge trading after a loss. Lost another $180. BUT this time I stopped after 1 trade instead of 5 like before.",
    type: "loss",
    timestamp: "4h ago",
    likes: 56,
    comments: 18,
    isLiked: true,
    tags: ["revenge-trading", "self-awareness", "progress"],
  },
  {
    id: "3",
    author: "Petra Nová",
    avatar: "/trader-avatar.png",
    content:
      "I discovered that my best trades are between 9-11 AM. After lunch my concentration drops. I'm starting to make notes about when I trade best.",
    type: "insight",
    timestamp: "6h ago",
    likes: 42,
    comments: 15,
    isLiked: false,
    tags: ["timing", "self-awareness", "optimization"],
  },
  {
    id: "4",
    author: "Tomáš Dvořák",
    avatar: "/trader-avatar.png",
    content:
      "Does anyone know how to get over fear after a series of losses? I have 3 losing trades in a row and now I'm afraid to enter another, even though I see a good setup.",
    type: "question",
    timestamp: "8h ago",
    likes: 28,
    comments: 24,
    isLiked: false,
    tags: ["psychology", "fear", "losing-streak"],
  },
]

const DEMO_BUDDIES: StudyBuddy[] = [
  {
    id: "1",
    name: "Petra Nováková",
    nickname: "ScalperQueen",
    avatar: "/trader-avatar.png",
    traderType: "Scalper",
    winRate: 68,
    streak: 12,
    status: "online",
    compatibility: 92,
    timezone: "CET (Prague)",
    tradingHours: "8:00 - 12:00",
  },
  {
    id: "2",
    name: "Martin Svoboda",
    nickname: "SwingMaster",
    avatar: "/trader-avatar.png",
    traderType: "Swing Trader",
    winRate: 71,
    streak: 8,
    status: "online",
    compatibility: 85,
    timezone: "CET (Prague)",
    tradingHours: "10:00 - 14:00",
  },
  {
    id: "3",
    name: "Jan Novotný",
    nickname: "DayTraderPro",
    avatar: "/trader-avatar.png",
    traderType: "Day Trader",
    winRate: 64,
    streak: 15,
    status: "offline",
    compatibility: 78,
    timezone: "CET (Prague)",
    tradingHours: "9:00 - 16:00",
  },
]

const DEMO_CHALLENGES: Challenge[] = [
  {
    id: "1",
    title: "Zero Revenge Trading - 30 Day Challenge",
    description: "30 days without a single revenge trade. Mandatory 30 min break after each loss.",
    type: "behavioral",
    category: "intermediate",
    participants: 142,
    daysLeft: 23,
    duration: 30,
    progress: 23,
    reward: "🏆 Brave Warrior Without Revenge + 1000 XP",
    joined: false,
    difficulty: 7,
    xpReward: 1000,
  },
  {
    id: "2",
    title: "Master Morning Routine",
    description: "21 days of consistent morning routine before trading (meditation, journal, prep).",
    type: "routine",
    category: "beginner",
    participants: 89,
    daysLeft: 15,
    duration: 21,
    progress: 0,
    reward: "⭐ Morning Warrior + 500 XP",
    joined: false,
    difficulty: 4,
    xpReward: 500,
  },
  {
    id: "3",
    title: "Perfect Journal Streak",
    description: "30 days without a break in journaling. Every trade must have an entry.",
    type: "routine",
    category: "intermediate",
    participants: 234,
    daysLeft: 28,
    duration: 30,
    progress: 0,
    reward: "📔 Journal Master + 800 XP",
    joined: false,
    difficulty: 6,
    xpReward: 800,
  },
  {
    id: "4",
    title: "Mindfulness Meditation - 14 Days",
    description: "14 days of daily meditation min. 10 minutes. Proven to reduce impulsivity by 40%.",
    type: "mental",
    category: "beginner",
    participants: 167,
    daysLeft: 10,
    duration: 14,
    progress: 0,
    reward: "🧘 Zen Trader + 400 XP",
    joined: false,
    difficulty: 3,
    xpReward: 400,
  },
  {
    id: "5",
    title: "Risk Management Elite",
    description: "30 days with max 1% risk per trade. Not a single trade exceeding the risk.",
    type: "skill",
    category: "advanced",
    participants: 98,
    daysLeft: 25,
    duration: 30,
    progress: 0,
    reward: "💎 Risk Master + 1200 XP",
    joined: false,
    difficulty: 9,
    xpReward: 1200,
  },
  {
    id: "6",
    title: "No FOMO - 21 Day Challenge",
    description: "21 days without FOMO trades. Only planned setups according to strategy.",
    type: "behavioral",
    category: "intermediate",
    participants: 201,
    daysLeft: 18,
    duration: 21,
    progress: 0,
    reward: "🎯 Patience Professional + 750 XP",
    joined: false,
    difficulty: 7,
    xpReward: 750,
  },
]

const DEMO_TRADING_ROOMS: TradingRoom[] = [
  {
    id: "1",
    name: "Morning Market Analysis",
    host: "Mentor Jan",
    participants: 47,
    maxParticipants: 100,
    startTime: "8:00",
    duration: "1h",
    type: "strategy",
    status: "live",
  },
  {
    id: "2",
    name: "Live Scalping Session",
    host: "Petra 'ScalperQueen'",
    participants: 23,
    maxParticipants: 50,
    startTime: "9:30",
    duration: "2h",
    type: "live-trading",
    status: "live",
  },
  {
    id: "3",
    name: "Weekly Review & Planning",
    host: "Mentor Jana",
    participants: 0,
    maxParticipants: 100,
    startTime: "18:00",
    duration: "1.5h",
    type: "review",
    status: "scheduled",
  },
  {
    id: "4",
    name: "Psychology Q&A",
    host: "Dr. Novák (Psychologist)",
    participants: 0,
    maxParticipants: 75,
    startTime: "19:00",
    duration: "1h",
    type: "q&a",
    status: "scheduled",
  },
]

const DEMO_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "1",
    author: "Jana Svobodová",
    avatar: "/trader-avatar.png",
    title: "From -$2,000 to +$5,400 in 3 months",
    content:
      "3 months ago I was deeply frustrated. I had lost $2,000 due to revenge trading and impulsive decisions. Thanks to Team Club challenges, I completely changed my approach. The 'Zero Revenge Trading' challenge helped me set rules and 'Perfect Journal Streak' taught me discipline.",
    beforeAfter: {
      before: [
        { metric: "Win Rate", value: "43%" },
        { metric: "Monthly P/L", value: "-$670" },
        { metric: "Avg. Revenge Trades", value: "5/month" },
      ],
      after: [
        { metric: "Win Rate", value: "68%" },
        { metric: "Monthly P/L", value: "+$1,800" },
        { metric: "Avg. Revenge Trades", value: "0/month" },
      ],
    },
    timestamp: "2 days ago",
    likes: 234,
  },
  {
    id: "2",
    author: "Martin Novák",
    avatar: "/trader-avatar.png",
    title: "Overcame FOMO and tripled profit",
    content:
      "FOMO cost me thousands. I entered every trade out of fear of missing out. After the 'No FOMO Challenge' and work with my mentor, I learned patience. Now I only wait for A+ setups and my profit has tripled.",
    beforeAfter: {
      before: [
        { metric: "Trades/month", value: "120+" },
        { metric: "Win Rate", value: "52%" },
        { metric: "Monthly P/L", value: "+$400" },
      ],
      after: [
        { metric: "Trades/month", value: "45" },
        { metric: "Win Rate", value: "71%" },
        { metric: "Monthly P/L", value: "+$1,200" },
      ],
    },
    timestamp: "1 week ago",
    likes: 189,
  },
]

// ADD: Demo students for virtual mode
const DEMO_STUDENTS: Student[] = [
  {
    id: "demo-1",
    name: "Alena Nováková",
    nickname: "ScalperPro",
    avatar: "/trader-avatar.png",
    traderType: "scalper",
    readiness: 85,
    readinessHistory: [80, 82, 85, 83, 88, 90, 85],
    discipline: 92,
    pnl: 1250,
    pnlHistory: [1000, 1100, 1200, 1150, 1300, 1400, 1250],
    journalStreak: 28,
    status: "stable",
    lastActive: "2h ago",
    triggers: ["FOMO", "Overtrading"],
    strengths: ["Risk Management", "Discipline"],
    weaknesses: ["Patience", "Emotional Control"],
    aiDiagnosis:
      "Alena shows high discipline and a strong risk management system. Her consistent journaling keeps her on the right track.",
    mentorNotes: ["Keep focusing on setup quality."],
    todos: ["Review last week's trades.", "Practice 10-minute meditation daily."],
  },
  {
    id: "demo-2",
    name: "Martin Svoboda",
    nickname: "SwingMaster",
    avatar: "/trader-avatar.png",
    traderType: "swing-trader",
    readiness: 70,
    readinessHistory: [65, 70, 72, 75, 73, 70, 70],
    discipline: 78,
    pnl: -300,
    pnlHistory: [-500, -400, -350, -300, -250, -320, -300],
    journalStreak: 10,
    status: "warning",
    lastActive: "1 day ago",
    triggers: ["Revenge Trading", "Impatience"],
    strengths: ["Strategy Development", "Analysis"],
    weaknesses: ["Emotional Control", "Trade Execution"],
    aiDiagnosis:
      "Martin has solid strategies but struggles with emotional control leading to revenge trading. Improving journaling and taking breaks after losses will help.",
    mentorNotes: ["Focus on following the plan.", "Complete the 'No FOMO' challenge."],
    todos: ["Log every trade for the next 7 days.", "Take a 30-minute break after each loss."],
  },
  {
    id: "demo-3",
    name: "Karel Dvořák",
    nickname: "DayTraderJoe",
    avatar: "/trader-avatar.png",
    traderType: "day-trader",
    readiness: 55,
    readinessHistory: [50, 52, 55, 58, 60, 57, 55],
    discipline: 65,
    pnl: 800,
    pnlHistory: [600, 700, 750, 800, 850, 820, 800],
    journalStreak: 5,
    status: "critical",
    lastActive: "3h ago",
    triggers: ["Excessive Leverage", "Sleep Deprivation"],
    strengths: ["Quick Decision Making"],
    weaknesses: ["Risk Management", "Emotional Stability"],
    aiDiagnosis:
      "Karel's low readiness and occasional serious errors suggest issues with emotional stability and risk management. Focus on wellness and trading plan is recommended.",
    mentorNotes: ["Prioritize sleep and healthy habits.", "Strict adherence to risk per trade."],
    todos: ["Track your sleep schedule.", "Limit max risk to 1% per trade.", "Meditate 5 minutes before market open."],
  },
]

// Helper functions
function calculateJournalStreak(journals: any[]): number {
  if (journals.length === 0) return 0
  let streak = 0
  const today = new Date()
  const sortedJournals = [...journals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  for (let i = 0; i < sortedJournals.length; i++) {
    const journalDate = new Date(sortedJournals[i].date)
    const daysDiff = Math.floor((today.getTime() - journalDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff === i) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function calculateDiscipline(trades: any[], journals: any[]): number {
  if (trades.length === 0) return 70
  const plannedTrades = trades.filter((t) => t.tags?.includes("plan") || t.tags?.includes("setup"))
  const journalRate = journals.length / Math.max(trades.length, 1)
  return Math.min(100, Math.round((plannedTrades.length / trades.length) * 50 + journalRate * 50))
}

function calculateReadiness(entries: any[]): number {
  if (entries.length === 0) {
    // Try to get from morning checks
    try {
      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      if (morningChecks.length > 0) {
        const recent = morningChecks.slice(-7)
        const avgReadiness =
          recent.reduce((sum: number, check: any) => {
            const readiness = check.readinessScore || check.readiness || 0
            return sum + readiness
          }, 0) / recent.length
        return Math.round(avgReadiness)
      }
    } catch (e) {
      console.error("Error reading morning checks", e)
    }
    return 0 // Return 0 if no data, not fake 70
  }
  const recent = entries.slice(-7)
  const avg = recent.reduce((sum, m) => sum + (m.mood || 0), 0) / recent.length
  return Math.round(avg * 10)
}

// Helper function to get scoped data from localStorage
const getScoped = (userId: string, key: string): string | null => {
  return localStorage.getItem(`user-${userId}-${key}`)
}

// Helper function to set scoped data in localStorage
const setScoped = (userId: string, key: string, value: string): void => {
  localStorage.setItem(`user-${userId}-${key}`, value)
}

function generateStudentsFromRealData(trades: any[], journals: any[], moodEntries: any[], userId: string): Student[] {
  // In LIVE mode, only show the current user's data
  if (trades.length === 0 && journals.length === 0 && moodEntries.length === 0) {
    // No data yet - return empty array
    return []
  }

  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || t.profitLoss || 0), 0)
  const journalStreak = calculateJournalStreak(journals)
  const discipline = calculateDiscipline(trades, journals)
  const readiness = calculateReadiness(moodEntries)

  return [
    {
      id: userId,
      name: "Ty",
      nickname: "My Profile",
      avatar: "/trader-avatar.png",
      traderType: "day-trader",
      readiness: readiness,
      readinessHistory: moodEntries.slice(-7).map((m: any) => (m.mood || 0) * 10),
      discipline: discipline,
      pnl: totalPnL,
      pnlHistory: trades.slice(-7).map((t: any) => t.pnl || t.profitLoss || 0),
      journalStreak: journalStreak,
      status: readiness < 50 ? "critical" : readiness < 70 ? "warning" : "stable",
      lastActive: "just now",
      triggers: [],
      strengths: [],
      weaknesses: [],
      aiDiagnosis:
        trades.length > 0 ? "Analyzing your data..." : "Start trading and adding journal entries for AI analysis.",
      mentorNotes: [],
      todos: [],
    },
  ]
}

// MENTOR VIEW
function MentorTeamClubView({
  communityUsers,
  setCommunityUsers,
  loadingCommunity,
  setLoadingCommunity,
}: {
  communityUsers: any[]
  setCommunityUsers: (users: any[]) => void
  loadingCommunity: boolean
  setLoadingCommunity: (loading: boolean) => void
}) {
  const { getAllTrades, getAllJournalEntries, isLiveMode } = useData()
  const { user } = useAuth() // ADDED: Get user from AuthContext
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    const trades = getAllTrades()
    const journals = getAllJournalEntries()

    const moodEntries: any[] = [] // TODO: Get from DataContext once morning_checks are exposed

    if (isLiveMode) {
      const realStudents = generateStudentsFromRealData(trades, journals, moodEntries, user?.id || "unknown")
      setStudents(realStudents)
      console.log("[v0] Team Club: Generated LIVE student data for user:", user?.id)
      
      // Load community users
      loadCommunityUsers()
    } else {
      // In virtual mode, show demo students
      setStudents(DEMO_STUDENTS)
      console.log("[v0] Team Club: Using DEMO students in virtual mode")
    }
  }, [isLiveMode, user?.id]) // Only depend on mode and user ID, not functions

  const loadCommunityUsers = async () => {
    setLoadingCommunity(true)
    try {
      const response = await fetch("/api/team-club/users", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[v0] Loaded ${data.users.length} community users`)
        setCommunityUsers(data.users)
      } else {
        console.error("[v0] Failed to load community users:", response.status)
        setCommunityUsers([])
      }
    } catch (error) {
      console.error("[v0] Error loading community users:", error)
      setCommunityUsers([])
    } finally {
      setLoadingCommunity(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto p-6 space-y-6 pt-20">
        <div className="text-center py-20">
          <Shield className="w-20 h-20 text-purple-400 mx-auto mb-6 float-animation" />
          <h2 className="text-4xl font-bold text-white mb-4 gradient-text">Mentor Dashboard</h2>
          <p className="text-slate-400 text-lg">
            {isLiveMode
              ? students.length > 0
                ? `Sledujete ${students.length} studenta v Live režimu`
                : "Zatím žádní studenti s daty"
              : "Pro mentory - kompletní dashboard v Live režimu"}
          </p>

        {/* Virtual Mode Banner */}
        {!isLiveMode && (
          <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-3 px-4 flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-xs md:text-sm text-amber-100">
              <span className="font-bold text-white">Momentálně si prohlížíš data ve Virtual modu</span> – jak mohou vypadat během používání softwaru
            </span>
          </div>
        )}

          {isLiveMode && students.length > 0 && (
            <div className="mt-8 max-w-4xl mx-auto">
              {students.map((student) => (
                <Card key={student.id} className="psyche-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white">{student.name}</h3>
                          <p className="text-sm text-slate-400">{student.nickname}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          student.status === "critical"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : student.status === "warning"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                        }
                      >
                        {student.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Readiness</p>
                        <p className="text-2xl font-bold text-white">{student.readiness}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Discipline</p>
                        <p className="text-2xl font-bold text-white">{student.discipline}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">P&L</p>
                        <p className={`text-2xl font-bold ${student.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          ${student.pnl}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Journal Streak</p>
                        <p className="text-2xl font-bold text-yellow-400">{student.journalStreak} dní</p>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">AI Diagnosis</h4>
                      <p className="text-slate-300 text-sm">{student.aiDiagnosis}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// STUDENT VIEW
// STUDENT VIEW
function StudentTeamClubView({
  communityUsers,
  loadingCommunity,
}: {
  communityUsers: any[]
  loadingCommunity: boolean
}) {
  const { getAllTrades, getAllJournalEntries, isLiveMode } = useData()
  const { user } = useAuth() // ADDED: Get user from AuthContext
  const [activeTab, setActiveTab] = useState("overview")
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [buddies, setBuddies] = useState<StudyBuddy[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [rooms, setRooms] = useState<TradingRoom[]>([])
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([])
  const [newPost, setNewPost] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [challengeFilter, setChallengeFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all")
  const [postFilter, setPostFilter] = useState<"all" | "win" | "loss" | "insight" | "question">("all")
  // Leaderboard state
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"weekly" | "monthly" | "alltime">("weekly")
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)

  const [dailyLimits, setDailyLimits] = useState<{
    feed: { date: string; count: number }
    success: { date: string; count: number }
  }>({
    feed: { date: "", count: 0 },
    success: { date: "", count: 0 },
  })
  const [newStoryTitle, setNewStoryTitle] = useState("")
  const [newStoryContent, setNewStoryContent] = useState("")
  // ADD: Month selection state for success stories
  const [selectedMonth1, setSelectedMonth1] = useState("")
  const [selectedMonth2, setSelectedMonth2] = useState("")
  const [postError, setPostError] = useState("")
  const [reportedPosts, setReportedPosts] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState("") // Added for chat functionality

  // Add admin password dialog and new challenge form states
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "behavioral" as "behavioral" | "routine" | "mental" | "skill",
    category: "beginner" as "beginner" | "intermediate" | "advanced",
    duration: 7,
    difficulty: 5,
    xpReward: 100,
    reward: "",
  })

  // ADD: Get monthly stats from localStorage
  const getMonthlyStats = (year: number, month: number) => {
    try {
      // Adjusted to get data based on user ID in live mode
      const journalData =
        isLiveMode && user?.id ? getScoped(user.id, "journal-entries") : localStorage.getItem("trader-mindset-journal")
      const readinessData =
        isLiveMode && user?.id
          ? getScoped(user.id, "mood-entries")
          : localStorage.getItem("trader-mindset-readiness-history")

      let winRate = 0
      let pnl = 0
      let avgReadiness = 0
      let trades = 0
      // Add revengeTrades counter
      let revengeTrades = 0

      if (journalData) {
        const journal = JSON.parse(journalData)
        const monthEntries = journal.filter((entry: any) => {
          const entryDate = new Date(entry.date)
          return entryDate.getFullYear() === year && entryDate.getMonth() === month
        })

        if (monthEntries.length > 0) {
          const winningTrades = monthEntries.filter((e: any) => e.outcome === "win" || e.pnl > 0).length
          trades = monthEntries.length
          winRate = trades > 0 ? Math.round((winningTrades / trades) * 100) : 0
          pnl = monthEntries.reduce((sum: number, e: any) => sum + (e.pnl || 0), 0)
          revengeTrades = monthEntries.filter(
            (e: any) =>
              e.tags?.includes("revenge") ||
              e.emotion === "frustrated" ||
              e.emotion === "angry" ||
              e.notes?.toLowerCase().includes("revenge"),
          ).length
        }
      }

      if (readinessData) {
        const readinessEntries = JSON.parse(readinessData)
        const monthReadiness = readinessEntries.filter((entry: any) => {
          const entryDate = new Date(entry.date)
          return entryDate.getFullYear() === year && entryDate.getMonth() === month
        })

        if (monthReadiness.length > 0) {
          avgReadiness = Math.round(
            monthReadiness.reduce((sum: number, e: any) => sum + (e.mood || 0), 0) / monthReadiness.length,
          )
        }
      }

      // Return revengeTrades
      return { winRate, pnl, readiness: avgReadiness, trades, revengeTrades }
    } catch (e) {
      console.error("Error getting monthly stats:", e)
      // Return revengeTrades in error case
      return { winRate: 0, pnl: 0, readiness: 0, trades: 0, revengeTrades: 0 }
    }
  }

  // ADD: Month names for success story selector
  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // ADD: Get available months (last 12 months)
  const getAvailableMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        value: `${date.getFullYear()}-${date.getMonth()}`,
        label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
        year: date.getFullYear(),
        month: date.getMonth(),
      })
    }
    return months
  }

  // ADD: Load data in live mode from localStorage
  useEffect(() => {
    if (isLiveMode) {
      // Load SHARED data from localStorage (NOT scoped to user)
      // This ensures ALL users see the SAME team club data
      const savedPosts = localStorage.getItem("team-club-posts")
      const savedStories = localStorage.getItem("team-club-stories")
      const savedBuddies = localStorage.getItem("team-club-buddies")
      const savedChallenges = localStorage.getItem("team-club-challenges")

      if (savedPosts && posts.length === 0) setPosts(JSON.parse(savedPosts))
      if (savedStories && successStories.length === 0) setSuccessStories(JSON.parse(savedStories))
      if (savedBuddies && buddies.length === 0) setBuddies(JSON.parse(savedBuddies))
      if (savedChallenges && challenges.length === 0) {
        const parsedChallenges = JSON.parse(savedChallenges)
        setChallenges(parsedChallenges)
      } else if (!savedChallenges) {
        // If no saved challenges, initialize with demo challenges for now, but consider fetching from backend
        setChallenges(DEMO_CHALLENGES)
      }

      // Clear demo rooms in live mode
      setRooms([])
    } else {
      setPosts(DEMO_POSTS)
      setBuddies(DEMO_BUDDIES)
      setChallenges(DEMO_CHALLENGES)
      setRooms(DEMO_TRADING_ROOMS)
      setSuccessStories(DEMO_SUCCESS_STORIES)
    }
  }, [isLiveMode, posts.length, successStories.length, buddies.length, challenges.length]) // Removed user?.id to ensure shared data

  useEffect(() => {
    if (isLiveMode) {
      // Save SHARED data to localStorage (NOT scoped to user)
      // This ensures ALL users save to the SAME shared data store
      if (posts.length > 0) localStorage.setItem("team-club-posts", JSON.stringify(posts))
      if (successStories.length > 0) localStorage.setItem("team-club-stories", JSON.stringify(successStories))
      if (buddies.length > 0) localStorage.setItem("team-club-buddies", JSON.stringify(buddies))
      if (challenges.length > 0) localStorage.setItem("team-club-challenges", JSON.stringify(challenges))
    }
  }, [posts, successStories, buddies, isLiveMode, challenges]) // Removed user?.id to ensure shared data

  useEffect(() => {
    const savedLimits = localStorage.getItem("teamclub-daily-limits")
    if (savedLimits) {
      setDailyLimits(JSON.parse(savedLimits))
    }
    const savedReports = localStorage.getItem("teamclub-reported-posts")
    if (savedReports) {
      setReportedPosts(JSON.parse(savedReports))
    }
  }, [])

  // Load leaderboard data when period changes
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLeaderboardLoading(true)
      try {
        const data = await getLeaderboardData()
        setLeaderboardData(data)
      } catch (error) {
        console.error("[v0] Error loading leaderboard:", error)
        setLeaderboardData(getDemoLeaderboardData())
      } finally {
        setLeaderboardLoading(false)
      }
    }
    loadLeaderboard()
  }, [leaderboardPeriod])

  const trades = getAllTrades()
  const journals = getAllJournalEntries()
  const moodEntries: any[] = user?.id ? JSON.parse(getScoped(user.id, "mood-entries") || "[]") : []

  const gamificationData =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("gamification-data") || "{}") : {}

  const userStats = {
    totalTrades: trades.length,
    winRate:
      trades.length > 0
        ? Math.round((trades.filter((t) => (t.pnl || t.profitLoss || 0) > 0).length / trades.length) * 100)
        : 0,
    journalStreak: calculateJournalStreak(journals),
    activeChallenges: isLiveMode
      ? challenges.filter((c) => c.joined).length
      : challenges.filter((c) => c.joined).length,
    weeklyPnL: trades.slice(-7).reduce((sum, t) => sum + (t.pnl || t.profitLoss || 0), 0),
    avgMood:
      moodEntries.length > 0
        ? Math.round(moodEntries.reduce((sum, m) => sum + (m.mood || 0), 0) / moodEntries.length)
        : 0, // Return 0 instead of fake 70
    totalXP: isLiveMode
      ? gamificationData.xp || 0
      : challenges.filter((c) => c.joined).reduce((sum, c) => sum + Math.round((c.progress / 100) * c.xpReward), 0),
    discipline: isLiveMode
      ? gamificationData.discipline || calculateDiscipline(trades, journals)
      : calculateDiscipline(trades, journals),
    streak: isLiveMode ? gamificationData.streak || calculateJournalStreak(journals) : calculateJournalStreak(journals),
    xp: isLiveMode
      ? gamificationData.xp || 0
      : challenges.filter((c) => c.joined).reduce((sum, c) => sum + Math.round((c.progress / 100) * c.xpReward), 0),
  }

  const communityStats = {
    onlineMembers: isLiveMode ? (buddies ? buddies.filter((b: any) => b.status === "online").length : 1) : 487,
    totalMembers: isLiveMode ? (buddies ? buddies.length : 1) : 1243,
    activeChallenges: challenges.filter((c) => c.joined).length,
    liveRooms: rooms.filter((r) => r.status === "live").length,
    todayPosts: posts.length,
    avgCommunityMood: isLiveMode ? userStats.avgMood : 68,
    frustrationRate: isLiveMode ? 0 : 32,
    improvementRate: isLiveMode
      ? trades.length > 0
        ? Math.round((trades.filter((t) => (t.pnl || t.profitLoss || 0) > 0).length / trades.length) * 100)
        : 0
      : 73,
    avgWinRate: isLiveMode ? userStats.winRate : 64,
    activeStreaks: isLiveMode ? userStats.journalStreak : 892,
  }

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === challengeId
          ? {
              ...challenge,
              joined: !challenge.joined,
              participants: challenge.joined ? challenge.participants - 1 : challenge.participants + 1,
            }
          : challenge,
      ),
    )
  }

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    )
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  const handleLikeStory = (storyId: string) => {
    setSuccessStories(
      successStories.map((story) => (story.id === storyId ? { ...story, likes: story.likes + 1 } : story)),
    )
  }

  const filteredPosts = postFilter === "all" ? posts : posts.filter((p) => p.type === postFilter)
  const filteredChallenges =
    challengeFilter === "all" ? challenges : challenges.filter((c) => c.category === challengeFilter)
  const filteredBuddies = searchQuery
    ? buddies.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.traderType.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : buddies

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case "win":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">🎯 Win</Badge>
      case "loss":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">📉 Loss Lesson</Badge>
      case "insight":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">💡 Insight</Badge>
      case "question":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">❓ Question</Badge>
      case "journal":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">📔 Journal</Badge>
      default:
        return null
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
      case "skill":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case "behavioral":
        return "Chování"
      case "routine":
        return "Rutina"
      case "mental":
        return "Mentální"
      case "skill":
        return "Dovednost"
      default:
        return type
    }
  }

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "live-trading":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "review":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "strategy":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "q&a":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  // Leaderboard helper functions
  const getLeaderboardData = async () => {
    try {
      // Use API endpoint which bypasses RLS by using service role key
      const response = await fetch("/api/leaderboard", { cache: "no-store" })

      if (!response.ok) {
        console.error("[v0] Error loading leaderboard from API:", response.statusText)
        return getDemoLeaderboardData()
      }

      const { leaderboard } = await response.json()

      if (!leaderboard || leaderboard.length === 0) {
        console.log("[v0] No leaderboard data from API, using demo data")
        return getDemoLeaderboardData()
      }

      console.log(`[v0] Loaded ${leaderboard.length} traders for leaderboard`)

      // Apply period filtering (adjust XP for display purposes)
      if (leaderboardPeriod === "weekly") {
        return leaderboard.map((d: any) => ({ ...d, xp: Math.round(d.xp * 0.15) }))
      } else if (leaderboardPeriod === "monthly") {
        return leaderboard.map((d: any) => ({ ...d, xp: Math.round(d.xp * 0.4) }))
      }

      return leaderboard
    } catch (error) {
      console.error("[v0] Error loading leaderboard:", error)
      return getDemoLeaderboardData()
    }
  }

  const getDemoLeaderboardData = () => {
    // Demo mode with bigger numbers (thousands $)
    const demoData = [
      {
        rank: 1,
        name: "Jana Svobodová",
        discipline: 96,
        streak: 45,
        xp: 12850,
        pnl: 8420,
        avatar: "/trader-avatar.png",
      },
      { rank: 2, name: "Martin Novák", discipline: 94, streak: 38, xp: 11200, pnl: 6890, avatar: "/trader-avatar.png" },
      { rank: 3, name: "Petra Nová", discipline: 91, streak: 32, xp: 9900, pnl: 5340, avatar: "/trader-avatar.png" },
      { rank: 4, name: "Tomáš Dvořák", discipline: 89, streak: 28, xp: 8650, pnl: 4120, avatar: "/trader-avatar.png" },
      { rank: 5, name: "Jan Novotný", discipline: 86, streak: 24, xp: 7400, pnl: 3560, avatar: "/trader-avatar.png" },
      {
        rank: 6,
        name: "Lucie Martínková",
        discipline: 84,
        streak: 21,
        xp: 6100,
        pnl: 2890,
        avatar: "/trader-avatar.png",
      },
      { rank: 7, name: "Petr Kovář", discipline: 82, streak: 19, xp: 5450, pnl: 2340, avatar: "/trader-avatar.png" },
      { rank: 8, name: "Eva Dvořáková", discipline: 79, streak: 16, xp: 4800, pnl: 1780, avatar: "/trader-avatar.png" },
      { rank: 9, name: "David Horváth", discipline: 77, streak: 14, xp: 4200, pnl: 1420, avatar: "/trader-avatar.png" },
      {
        rank: 10,
        name: "Markéta Veselá",
        discipline: 75,
        streak: 12,
        xp: 3600,
        pnl: 980,
        avatar: "/trader-avatar.png",
      },
      { rank: 11, name: "Ondřej Krčál", discipline: 73, streak: 11, xp: 3200, pnl: 750, avatar: "/trader-avatar.png" },
      { rank: 12, name: "Zuzana Kučerová", discipline: 71, streak: 9, xp: 2850, pnl: 620, avatar: "/trader-avatar.png" },
      { rank: 13, name: "Pavel Sedláček", discipline: 69, streak: 8, xp: 2500, pnl: 480, avatar: "/trader-avatar.png" },
      { rank: 14, name: "Michaela Pokorná", discipline: 67, streak: 7, xp: 2200, pnl: 350, avatar: "/trader-avatar.png" },
      { rank: 15, name: "Dominik Vlášek", discipline: 65, streak: 6, xp: 1900, pnl: 220, avatar: "/trader-avatar.png" },
      { rank: 16, name: "Alena Čermáková", discipline: 63, streak: 5, xp: 1600, pnl: 150, avatar: "/trader-avatar.png" },
      { rank: 17, name: "Rostislav Junek", discipline: 61, streak: 4, xp: 1400, pnl: 100, avatar: "/trader-avatar.png" },
      { rank: 18, name: "Lenka Beranová", discipline: 59, streak: 3, xp: 1100, pnl: 80, avatar: "/trader-avatar.png" },
      { rank: 19, name: "Stanislav Bláha", discipline: 57, streak: 2, xp: 900, pnl: 60, avatar: "/trader-avatar.png" },
      { rank: 20, name: "Věra Filipová", discipline: 55, streak: 1, xp: 700, pnl: 40, avatar: "/trader-avatar.png" },
      { rank: 21, name: "Jiří Pilný", discipline: 53, streak: 0, xp: 550, pnl: 30, avatar: "/trader-avatar.png" },
      { rank: 22, name: "Miriam Hladká", discipline: 51, streak: 0, xp: 450, pnl: 20, avatar: "/trader-avatar.png" },
      { rank: 23, name: "František Varga", discipline: 49, streak: 0, xp: 350, pnl: 10, avatar: "/trader-avatar.png" },
      { rank: 24, name: "Helena Svobodová", discipline: 47, streak: 0, xp: 280, pnl: 5, avatar: "/trader-avatar.png" },
      { rank: 25, name: "Václav Horák", discipline: 45, streak: 0, xp: 200, pnl: 0, avatar: "/trader-avatar.png" },
    ]

    // Filter based on period for demo variation
    if (leaderboardPeriod === "weekly") {
      return demoData.slice(0, 5).map((d) => ({ ...d, xp: Math.round(d.xp * 0.15), pnl: Math.round(d.pnl * 0.25) }))
    } else if (leaderboardPeriod === "monthly") {
      return demoData.slice(0, 5).map((d) => ({ ...d, xp: Math.round(d.xp * 0.4), pnl: Math.round(d.pnl * 0.5) }))
    }
    return demoData.slice(0, 5)
  }

  const getUserStats = () => {
    if (isLiveMode) {
      const gamificationData = JSON.parse(localStorage.getItem("gamification-data") || "{}")
      const allTrades = getAllTrades()
      const totalPnL = allTrades.reduce((sum, t) => sum + (t.pnl || t.profitLoss || 0), 0)
      const journalStreak = calculateJournalStreak(getAllJournalEntries())
      const discipline = gamificationData.discipline || calculateDiscipline(allTrades, getAllJournalEntries())

      return {
        rank: 0, // No rank in live mode (no community)
        name: "Ty",
        discipline: discipline,
        streak: journalStreak,
        xp: gamificationData.xp || 0,
        pnl: totalPnL,
        avatar: "/trader-avatar.png",
      }
    }

    return {
      rank: 15,
      name: "Ty",
      discipline: userStats.discipline,
      streak: userStats.streak,
      xp: userStats.xp,
      pnl: 2450, // Demo PNL
      avatar: "/trader-avatar.png",
    }
  }

  const getUserPosition = () => {
    // Get user's position in leaderboard by finding by userId
    if (!user?.id || !leaderboardData || leaderboardData.length === 0) {
      return "?"
    }

    // Find user in leaderboard by userId
    const userIndex = leaderboardData.findIndex((trader) => trader.userId === user.id)

    if (userIndex !== -1) {
      return leaderboardData[userIndex].rank
    }

    // Fallback: user is not in loaded leaderboard (not in profiles table)
    return "?"
  }

  // Function to get today's date string for daily limits
  const getTodayString = (): string => {
    return new Date().toISOString().split("T")[0]
  }

  const canPostToday = (type: "feed" | "success"): boolean => {
    const today = getTodayString()
    const limit = dailyLimits[type]
    if (!limit || limit.date !== today) return true
    return limit.count < 1
  }

  const updateDailyLimit = (type: "feed" | "success") => {
    const today = getTodayString()
    const currentLimit = dailyLimits[type]
    const newLimits = {
      ...dailyLimits,
      [type]: {
        date: today,
        count: currentLimit && currentLimit.date === today ? currentLimit.count + 1 : 1,
      },
    }
    setDailyLimits(newLimits)
    localStorage.setItem("teamclub-daily-limits", JSON.stringify(newLimits))
  }

  const handleAddPost = (type: "win" | "loss" | "insight" | "question") => {
    setPostError("")

    if (!canPostToday("feed")) {
      setPostError("Dosáhl jsi denního limitu. Můžeš přidat max 1 příspěvek denně.")
      return
    }

    if (containsVulgarWords(newPost)) {
      setPostError("Tvůj příspěvek obsahuje nevhodná slova. Uprav ho prosím.")
      return
    }

    if (!newPost.trim()) return

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: "Já",
      avatar: "/trader-avatar.png",
      content: newPost,
      type,
      timestamp: "Právě teď",
      likes: 0,
      comments: 0,
      isLiked: false,
    }

    setPosts([post, ...posts])
    setNewPost("")
    updateDailyLimit("feed")
  }

  // ADD: Updated handleAddStory with month selection
  const handleAddStory = () => {
    setPostError("")

    if (!canPostToday("success")) {
      setPostError("Dosáhl jsi denního limitu. Můžeš sdílet max 1 příběh denně.")
      return
    }

    if (containsVulgarWords(newStoryTitle) || containsVulgarWords(newStoryContent)) {
      setPostError("Tvůj příběh obsahuje nevhodná slova. Uprav ho prosím.")
      return
    }

    if (!newStoryTitle.trim() || !newStoryContent.trim()) return

    if (!selectedMonth1 || !selectedMonth2) {
      setPostError("Vyber prosím oba měsíce pro srovnání.")
      return
    }

    // Get stats for both months
    const [year1, month1] = selectedMonth1.split("-").map(Number)
    const [year2, month2] = selectedMonth2.split("-").map(Number)
    const stats1 = getMonthlyStats(year1, month1)
    const stats2 = getMonthlyStats(year2, month2)

    const availableMonths = getAvailableMonths()
    const month1Label = availableMonths.find((m) => m.value === selectedMonth1)?.label || ""
    const month2Label = availableMonths.find((m) => m.value === selectedMonth2)?.label || ""

    // Update beforeAfter to include revenge trades
    const story: SuccessStory = {
      id: Date.now().toString(),
      author: "Já",
      avatar: "/trader-avatar.png",
      title: newStoryTitle,
      content: newStoryContent,
      beforeAfter: {
        before: [
          { metric: `Win Rate (${month1Label})`, value: `${stats1.winRate}%` },
          { metric: `P&L (${month1Label})`, value: `$${stats1.pnl}` },
          { metric: `Readiness (${month1Label})`, value: `${stats1.readiness}%` },
          { metric: `Trades (${month1Label})`, value: `${stats1.trades}` },
          // Add revenge trades to beforeAfter
          { metric: `Revenge Trades (${month1Label})`, value: `${stats1.revengeTrades}` },
        ],
        after: [
          { metric: `Win Rate (${month2Label})`, value: `${stats2.winRate}%` },
          { metric: `P&L (${month2Label})`, value: `$${stats2.pnl}` },
          { metric: `Readiness (${month2Label})`, value: `${stats2.readiness}%` },
          { metric: `Trades (${month2Label})`, value: `${stats2.trades}` },
          // Add revenge trades to beforeAfter
          { metric: `Revenge Trades (${month2Label})`, value: `${stats2.revengeTrades}` },
        ],
      },
      timestamp: "Právě teď",
      likes: 0,
    }

    setSuccessStories([story, ...successStories])
    setNewStoryTitle("")
    setNewStoryContent("")
    setSelectedMonth1("")
    setSelectedMonth2("")
    updateDailyLimit("success")
  }

  const handleReport = (postId: string, type: string) => {
    if (reportedPosts.includes(postId)) return

    const newReported = [...reportedPosts, postId]
    setReportedPosts(newReported)
    localStorage.setItem("teamclub-reported-posts", JSON.stringify(newReported))

    // Save report for admin
    const reports = JSON.parse(localStorage.getItem("teamclub-reports") || "[]")
    reports.push({
      id: Date.now().toString(),
      postId,
      type,
      reportedAt: new Date().toISOString(),
      status: "pending",
    })
    localStorage.setItem("teamclub-reports", JSON.stringify(reports))
  }

  // Admin functions for managing challenges
  const verifyAdminPassword = () => {
    if (adminPassword === "trademind123") {
      // Replace with a secure password mechanism
      setIsAdmin(true)
      setShowAdminDialog(false)
      setAdminPassword("")
    } else {
      alert("Nesprávné heslo!")
      setAdminPassword("")
    }
  }

  const handleAddChallenge = () => {
    if (!newChallenge.title || !newChallenge.description) {
      alert("Prosím vyplňte název a popis výzvy.")
      return
    }
    const challengeToAdd: Challenge = {
      id: Date.now().toString(),
      ...newChallenge,
      participants: 0,
      daysLeft: newChallenge.duration,
      progress: 0,
      joined: false,
    }
    setChallenges([challengeToAdd, ...challenges])
    setNewChallenge({
      title: "",
      description: "",
      type: "behavioral",
      category: "beginner",
      duration: 7,
      difficulty: 5,
      xpReward: 100,
      reward: "",
    })
    setShowChallengeForm(false)
    // Save challenges to localStorage if in live mode
    if (isLiveMode && user?.id) {
      setScoped(user.id, "team-club-challenges", JSON.stringify([...challenges, challengeToAdd]))
    } else {
      localStorage.setItem("team-club-challenges", JSON.stringify([...challenges, challengeToAdd]))
    }
  }

  const handleUpdateChallenge = () => {
    if (!editingChallenge) return
    if (!editingChallenge.title || !editingChallenge.description) {
      alert("Prosím vyplňte název a popis výzvy.")
      return
    }

    setChallenges(
      challenges.map((c) =>
        c.id === editingChallenge.id ? { ...editingChallenge, daysLeft: editingChallenge.duration } : c,
      ),
    )
    setEditingChallenge(null)
    setShowChallengeForm(false)
    // Save challenges to localStorage if in live mode
    if (isLiveMode && user?.id) {
      setScoped(user.id, "team-club-challenges", JSON.stringify(challenges))
    } else {
      localStorage.setItem("team-club-challenges", JSON.stringify(challenges))
    }
  }

  const handleDeleteChallenge = (challengeId: string) => {
    if (confirm("Opravdu chcete tuto výzvu smazat?")) {
      const updatedChallenges = challenges.filter((c) => c.id !== challengeId)
      setChallenges(updatedChallenges)
      // Save challenges to localStorage if in live mode
      if (isLiveMode && user?.id) {
        setScoped(user.id, "team-club-challenges", JSON.stringify(updatedChallenges))
      } else {
        localStorage.setItem("team-club-challenges", JSON.stringify(updatedChallenges))
      }
    }
  }

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setShowChallengeForm(true)
  }

  // ADD: handleSendMessage function
  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg = {
      id: Date.now().toString(),
      sender: "Já",
      message: newMessage,
      timestamp: new Date().toISOString(),
    }
    // Placeholder for actual message sending logic
    console.log("Sending message:", newMsg)
    setNewMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto p-6 space-y-6 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              <span className="gradient-text">MindTrader - Tým</span>
              <Badge
                className={
                  isLiveMode
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                }
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isLiveMode ? "Live Režim" : "Virtuální Režim"}
              </Badge>
            </h1>
            <p className="text-gray-300 text-lg">
              {isLiveMode ? (
                <>Tvoje reálná data · Community support</>
              ) : (
                <>
                  {communityStats.onlineMembers} / {communityStats.totalMembers} členů online
                </>
              )}
            </p>
          </div>

          {!isLiveMode && (
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700 neon-button"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifikace
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700 neon-button"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Pozvat přítele
              </Button>
            </div>
          )}
        </div>

        {/* Virtual Mode Banner */}
        {!isLiveMode && (
          <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-3 px-4 flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-xs md:text-sm text-amber-100">
              <span className="font-bold text-white">Momentálně si prohlížíš data ve Virtual modu</span> – jak mohou vypadat během používání softwaru
            </span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/80 backdrop-blur-xl border border-slate-600 p-1.5 flex lg:grid lg:grid-cols-6 overflow-x-auto scrollbar-hide">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300 flex-shrink-0 px-3 lg:px-4 text-xs lg:text-sm"
            >
              <Telescope className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
              <span className="hidden sm:inline">Přehled</span>
              <span className="sm:hidden">Over</span>
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300 flex-shrink-0 px-3 lg:px-4 text-xs lg:text-sm"
            >
              <Activity className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300 flex-shrink-0 px-3 lg:px-4 text-xs lg:text-sm"
            >
              <Target className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
              <span className="hidden sm:inline">Výzvy</span>
              <span className="sm:hidden">Výz</span>
            </TabsTrigger>
            <TabsTrigger
              value="buddies"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300 flex-shrink-0 px-3 lg:px-4 text-xs lg:text-sm"
            >
              <Users className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
              <span className="hidden sm:inline">Study Buddies</span>
              <span className="sm:hidden">Bud</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300 flex-shrink-0 px-3 lg:px-4 text-xs lg:text-sm"
            >
              <Trophy className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
              Top
            </TabsTrigger>
            <TabsTrigger
              value="success"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300 flex-shrink-0 px-3 lg:px-4 text-xs lg:text-sm"
            >
              <Star className="w-3 h-3 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
              <span className="hidden sm:inline">Success</span>
              <span className="sm:hidden">Succ</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Přehled zdraví komunity */}
            <Card className="psyche-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-400" />
                  Přehled zdraví komunity
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Real-time přehled jak se daří celé komunitě
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Community Mood */}
                  <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-gray-400 text-xs font-medium mb-2">Průměrná nálada komunity</p>
                            <p className="text-4xl font-bold text-white mb-1">{communityStats.avgCommunityMood}%</p>
                            <p className="text-amber-400 text-sm font-semibold">Pozitivní</p>
                          </div>
                          <div className="p-4 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
                            <Smile className="w-8 h-8 text-amber-400" />
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                          style={{ width: `${communityStats.avgCommunityMood}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Win Rate */}
                  <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-gray-400 text-xs font-medium mb-2">Průměr. Úspěšnost</p>
                            <p className="text-4xl font-bold text-white mb-1">{communityStats.avgWinRate}%</p>
                            <p className="text-emerald-400 text-sm font-semibold">Community</p>
                          </div>
                          <div className="p-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                            <Target className="w-8 h-8 text-emerald-400" />
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
                          style={{ width: `${communityStats.avgWinRate}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Improvement Rate */}
                  <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-gray-400 text-xs font-medium mb-2">Zlepšování komunity</p>
                            <p className="text-4xl font-bold text-white mb-1">{communityStats.improvementRate}%</p>
                            <p className="text-cyan-400 text-sm font-semibold flex items-center gap-1">
                              <ArrowUp className="h-4 w-4" />
                              Tento týden
                            </p>
                          </div>
                          <div className="p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                            <TrendingUp className="w-8 h-8 text-cyan-400" />
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                          style={{ width: `${communityStats.improvementRate}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Frustration Rate */}
                  <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-gray-400 text-xs font-medium mb-2">Cítí se frustrací</p>
                            <p className="text-4xl font-bold text-white mb-1">{communityStats.frustrationRate}%</p>
                            <p className="text-red-400 text-sm font-semibold">Z důvodu ztrát</p>
                          </div>
                          <div className="p-4 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all"
                          style={{ width: `${communityStats.frustrationRate}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Your Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="psyche-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-400" />
                    Tvoje Stats vs Komunita
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Win Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">Ty: {userStats.winRate}%</span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-slate-400">Avg: {communityStats.avgWinRate}%</span>
                      </div>
                    </div>
                    <Progress value={userStats.winRate} className="h-2 mb-1" />
                    {userStats.winRate > communityStats.avgWinRate ? (
                      <p className="text-emerald-400 text-xs flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" />
                        {userStats.winRate - communityStats.avgWinRate}% nad průměrem!
                      </p>
                    ) : (
                      <p className="text-amber-400 text-xs flex items-center gap-1">
                        <ArrowDown className="h-3 w-3" />
                        {communityStats.avgWinRate - userStats.winRate}% pod průměrem
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Journal Streak</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-400" />
                        {userStats.streak} dní
                      </span>
                    </div>
                    <Progress value={Math.min((userStats.journalStreak / 30) * 100, 100)} className="h-2 mb-1" />
                    <p className="text-slate-500 text-xs">Top 15% komunity! 🔥</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Týdenní P/L</span>
                      <span className={`font-bold ${userStats.weeklyPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {userStats.weeklyPnL >= 0 ? "+" : ""}${userStats.weeklyPnL}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(Math.abs(userStats.weeklyPnL / 10), 100)}
                      className={`h-2 ${userStats.weeklyPnL >= 0 ? "" : "bg-red-500/20"}`}
                    />
                  </div>
                </CardContent>
              </Card>

              {!isLiveMode && (
                <Card className="psyche-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-400" />
                      Týdenní Cíle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 rounded-xl border border-slate-600/30 bg-slate-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-sm">Splnit 5 trades podle plánu</h4>
                        <span className="text-white font-bold text-sm">3/5</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div className="p-4 rounded-xl border border-slate-600/30 bg-slate-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-sm">7 dní journalingu</h4>
                        <span className="text-white font-bold text-sm">5/7</span>
                      </div>
                      <Progress value={(5 / 7) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* AI Poznatky */}
            <Card className="bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-600/90 border-blue-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Poznatky komunity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">💡 AI Doporučení</p>
                      <p className="text-white/90 text-sm">
                        {userStats.winRate >= communityStats.avgWinRate
                          ? "Tvoje úspěšnost je nad průměrem! Sdílej své postupy v Community Feed."
                          : "Top performers mají journal streak 25+ dní. Zkus se zaměřit na konzistentní journaling!"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMMUNITY FEED TAB */}
          <TabsContent value="community" className="space-y-6">
            <div className={`grid grid-cols-1 gap-6 ${!isLiveMode ? "lg:grid-cols-3" : ""}`}>
              {/* Hlavní Feed */}
              <div className={`space-y-4 ${!isLiveMode ? "lg:col-span-2" : ""}`}>
                {/* Create Post */}
                <Card className="psyche-card">
                  <CardContent className="p-5">
                    {postError && (
                      <Alert className="mb-4 bg-red-500/10 border-red-500/30">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-400">{postError}</AlertDescription>
                      </Alert>
                    )}

                    {!canPostToday("feed") && (
                      <Alert className="mb-4 bg-amber-500/10 border-amber-500/30">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <AlertDescription className="text-amber-400">
                          Dnes jsi již přidal příspěvek. Další můžeš přidat zítra.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                        <AvatarImage src="/trader-avatar.png" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <Textarea
                        placeholder="Sdílej svůj win, loss lesson, insight nebo se zeptej komunity... 💬"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        disabled={!canPostToday("feed")}
                        className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl min-h-[100px] resize-none disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddPost("win")}
                          disabled={!canPostToday("feed") || !newPost.trim()}
                          className="bg-transparent border-slate-700 rounded-lg text-xs hover:bg-emerald-500/10 hover:border-emerald-500/30 disabled:opacity-50"
                        >
                          <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                          Win
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddPost("loss")}
                          disabled={!canPostToday("feed") || !newPost.trim()}
                          className="bg-transparent border-slate-700 rounded-lg text-xs hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-50"
                        >
                          <TrendingDown className="h-3.5 w-3.5 mr-1.5 text-red-400" />
                          Loss
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddPost("insight")}
                          disabled={!canPostToday("feed") || !newPost.trim()}
                          className="bg-transparent border-slate-700 rounded-lg text-xs hover:bg-amber-500/10 hover:border-amber-500/30 disabled:opacity-50"
                        >
                          <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                          Insight
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl disabled:opacity-50"
                        disabled={!newPost.trim() || !canPostToday("feed")}
                        onClick={() => handleAddPost("insight")} // Defaulting to insight type, could be made selectable
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Sdílet
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => setPostFilter("all")}
                    className={`rounded-xl text-xs ${
                      postFilter === "all"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600"
                        : "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Všechny
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPostFilter("win")}
                    className={`rounded-xl text-xs ${
                      postFilter === "win"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600"
                        : "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 mr-1.5" />
                    Výhry
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPostFilter("loss")}
                    className={`rounded-xl text-xs ${
                      postFilter === "loss"
                        ? "bg-gradient-to-r from-red-600 to-rose-600"
                        : "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <TrendingDown className="h-3 w-3 mr-1.5" />
                    Ztráty
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPostFilter("insight")}
                    className={`rounded-xl text-xs ${
                      postFilter === "insight"
                        ? "bg-gradient-to-r from-amber-600 to-yellow-600"
                        : "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Lightbulb className="h-3 w-3 mr-1.5" />
                    Poznatky
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPostFilter("question")}
                    className={`rounded-xl text-xs ${
                      postFilter === "question"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                        : "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <MessageSquare className="h-3 w-3 mr-1.5" />
                    Otázky
                  </Button>
                </div>

                {/* Posts */}
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="psyche-card hover:border-slate-600/50 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                          <AvatarImage src={post.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold text-sm">{post.author}</h4>
                            {getPostTypeBadge(post.type)}
                          </div>
                          <p className="text-slate-500 text-xs">{post.timestamp}</p>
                        </div>
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed mb-3">{post.content}</p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLikePost(post.id)}
                          className={`rounded-xl text-xs h-8 ${post.isLiked ? "text-pink-400" : "text-slate-400"}`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                          {post.likes}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 rounded-xl text-xs h-8">
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                          {post.comments}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 rounded-xl text-xs h-8">
                          <Share2 className="h-3.5 w-3.5 mr-1.5" />
                          Sdílet
                        </Button>
                        {post.author === "Já" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePost(post.id)}
                            className="ml-auto rounded-xl text-xs h-8 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Smazat
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReport(post.id, "feed")}
                            disabled={reportedPosts.includes(post.id)}
                            className={`ml-auto rounded-xl text-xs h-8 ${
                              reportedPosts.includes(post.id) ? "text-amber-400" : "text-slate-500 hover:text-red-400"
                            }`}
                          >
                            <Flag className="h-3.5 w-3.5 mr-1.5" />
                            {reportedPosts.includes(post.id) ? "Nahlášeno" : "Nahlásit"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              {!isLiveMode && (
              <div className="space-y-4">
                {!isLiveMode && (
                  <Card className="psyche-card">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-400" />
                        Trendy témata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { tag: "revenge-trading", posts: 23 },
                        { tag: "patience", posts: 18 },
                        { tag: "win-rate", posts: 15 },
                        { tag: "discipline", posts: 12 },
                        { tag: "FOMO", posts: 11 },
                      ].map((topic, index) => (
                        <div key={index} className="p-2 hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-purple-400 text-sm font-medium">#{topic.tag}</span>
                            <span className="text-slate-500 text-xs">{topic.posts} postů</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {!isLiveMode && (
                  <Card className="psyche-card">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-400" />
                        Nejlepší přispěvatelé
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { name: "Jana S.", helpful: 89, posts: 45 },
                        { name: "Martin N.", helpful: 76, posts: 38 },
                        { name: "Lukáš Č.", helpful: 71, posts: 32 },
                      ].map((user, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 hover:bg-slate-700/30 rounded-lg transition-all cursor-pointer"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                              index === 0
                                ? "bg-amber-500/20 text-amber-400"
                                : index === 1
                                  ? "bg-slate-400/20 text-slate-300"
                                  : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <Avatar className="w-7 h-7">
                            <AvatarImage src="/trader-avatar.png" />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{user.name}</p>
                            <p className="text-slate-500 text-xs">{user.posts} příspěvků</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 text-xs font-bold">{user.helpful}%</p>
                            <p className="text-slate-500 text-xs">helpful</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              )}
            </div>
          </TabsContent>

          {/* CHALLENGES TAB */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Výzvy · Gamifikace · Růst</h2>
                <p className="text-slate-400 text-sm">
                  {userStats.activeChallenges} aktivních výzev · {userStats.totalXP} XP získáno
                </p>
              </div>
              <div className="flex gap-2 items-center">
                {/* Filter buttons */}
                {(["all", "beginner", "intermediate", "advanced"] as const).map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant="outline"
                    onClick={() => setChallengeFilter(filter)}
                    className={`rounded-xl text-xs ${
                      challengeFilter === filter
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent"
                        : "bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {filter === "all"
                      ? "Všechny"
                      : filter === "beginner"
                        ? "Začátečník"
                        : filter === "intermediate"
                          ? "Pokročilý"
                          : "Expert"}
                  </Button>
                ))}

                {!isAdmin ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAdminDialog(true)}
                    className="text-slate-600 hover:text-slate-400 hover:bg-transparent"
                  >
                    <Lock className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowChallengeForm(true)}
                    className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Přidat
                  </Button>
                )}
              </div>
            </div>

            {/* Admin Password Dialog */}
            {showAdminDialog && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="bg-slate-900 border-slate-700 w-full max-w-sm">
                  <CardContent className="p-6">
                    <h3 className="text-white font-bold text-lg mb-4">Admin přístup</h3>
                    <Input
                      type="password"
                      placeholder="Zadej heslo..."
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && verifyAdminPassword()}
                      className="bg-slate-800 border-slate-700 text-white mb-4"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAdminDialog(false)
                          setAdminPassword("")
                        }}
                        className="flex-1 bg-transparent border-slate-700"
                      >
                        Zrušit
                      </Button>
                      <Button
                        onClick={verifyAdminPassword}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        Potvrdit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Add/Edit Challenge Form */}
            {(showChallengeForm || editingChallenge) && isAdmin && (
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4">
                      {editingChallenge ? "Upravit Výzvu" : "Přidat Novou Výzvu"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-slate-400 text-sm mb-1 block">Název</label>
                      <Input
                        placeholder="Název výzvy..."
                        value={editingChallenge?.title || newChallenge.title}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({ ...editingChallenge, title: e.target.value })
                            : setNewChallenge({ ...newChallenge, title: e.target.value })
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-slate-400 text-sm mb-1 block">Popis</label>
                      <Textarea
                        placeholder="Popis výzvy..."
                        value={editingChallenge?.description || newChallenge.description}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({ ...editingChallenge, description: e.target.value })
                            : setNewChallenge({ ...newChallenge, description: e.target.value })
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-1 block">Typ</label>
                      <select
                        value={editingChallenge?.type || newChallenge.type}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({ ...editingChallenge, type: e.target.value as any })
                            : setNewChallenge({ ...newChallenge, type: e.target.value as any })
                        }
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                      >
                        <option value="behavioral">Behavioral</option>
                        <option value="routine">Routine</option>
                        <option value="mental">Mental</option>
                        <option value="skill">Skill</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-1 block">Kategorie</label>
                      <select
                        value={editingChallenge?.category || newChallenge.category}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({ ...editingChallenge, category: e.target.value as any })
                            : setNewChallenge({ ...newChallenge, category: e.target.value as any })
                        }
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                      >
                        <option value="beginner">Začátečník</option>
                        <option value="intermediate">Pokročilý</option>
                        <option value="advanced">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-1 block">Doba trvání (dny)</label>
                      <Input
                        type="number"
                        value={editingChallenge?.duration || newChallenge.duration}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({
                                ...editingChallenge,
                                duration: Number.parseInt(e.target.value),
                                daysLeft: Number.parseInt(e.target.value),
                              })
                            : setNewChallenge({ ...newChallenge, duration: Number.parseInt(e.target.value) })
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-1 block">Obtížnost (1-10)</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={editingChallenge?.difficulty || newChallenge.difficulty}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({ ...editingChallenge, difficulty: Number.parseInt(e.target.value) })
                            : setNewChallenge({ ...newChallenge, difficulty: Number.parseInt(e.target.value) })
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-1 block">XP odměna</label>
                      <Input
                        type="number"
                        value={editingChallenge?.xpReward || newChallenge.xpReward}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({ ...editingChallenge, xpReward: Number.parseInt(e.target.value) })
                            : setNewChallenge({ ...newChallenge, xpReward: Number.parseInt(e.target.value) })
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-1 block">Odměna (text)</label>
                      <Input
                        placeholder="🏆 Badge + bonus..."
                        value={editingChallenge?.reward || newChallenge.reward}
                        onChange={(e) =>
                          editingChallenge
                            ? setEditingChallenge({ ...editingChallenge, reward: e.target.value })
                            : setNewChallenge({ ...newChallenge, reward: e.target.value })
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowChallengeForm(false)
                        setEditingChallenge(null)
                      }}
                      className="bg-transparent border-slate-700"
                    >
                      Zrušit
                    </Button>
                    <Button
                      onClick={editingChallenge ? handleUpdateChallenge : handleAddChallenge}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {editingChallenge ? "Uložit změny" : "Přidat výzvu"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Your Active Challenges */}
            {challenges.filter((c) => c.joined).length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  Tvoje Aktivní Výzvy ({challenges.filter((c) => c.joined).length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges
                    .filter((c) => c.joined)
                    .map((challenge) => (
                      <Card
                        key={challenge.id}
                        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl overflow-hidden backdrop-blur-sm"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getChallengeTypeColor(challenge.type)}>
                                  {getChallengeTypeLabel(challenge.type)}
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                  {challenge.category}
                                </Badge>
                              </div>
                              <h3 className="text-white font-bold text-base mb-1">{challenge.title}</h3>
                              <p className="text-slate-400 text-sm">
                                {challenge.duration} days · {challenge.daysLeft} days remaining
                              </p>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => handleEditChallenge(challenge)}>
                                  <Edit className="h-4 w-4 text-blue-400" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteChallenge(challenge.id)}>
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <Progress value={challenge.progress} className="h-3 rounded-full mb-3" />
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-white font-bold">{challenge.progress}% hotovo</span>
                            <span className="text-slate-400 text-xs">
                              {Math.round((challenge.progress / 100) * challenge.xpReward)} / {challenge.xpReward} XP
                            </span>
                          </div>

                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                            <p className="text-amber-400 text-xs font-semibold mb-1">🏆 Odměna:</p>
                            <p className="text-slate-300 text-xs">{challenge.reward}</p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleJoinChallenge(challenge.id)}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Opustit výzvu
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Available Challenges */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Dostupné Výzvy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges
                  .filter((c) => !c.joined)
                  .map((challenge) => (
                    <Card key={challenge.id} className="psyche-card">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getChallengeTypeColor(challenge.type)}>
                              {getChallengeTypeLabel(challenge.type)}
                            </Badge>
                            <Badge
                              className={
                                challenge.category === "beginner"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : challenge.category === "intermediate"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                              }
                            >
                              {challenge.category === "beginner"
                                ? "Začátečník"
                                : challenge.category === "intermediate"
                                  ? "Pokročilý"
                                  : "Expert"}
                            </Badge>
                          </div>
                          <h3 className="text-white font-bold text-base mb-2">{challenge.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-3">{challenge.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {challenge.participants}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {challenge.duration} dní
                            </span>
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3 w-3" />
                              {challenge.difficulty}/10
                            </span>
                          </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-amber-400 font-semibold text-xs">Odměna</span>
                          </div>
                          <p className="text-slate-300 text-xs">{challenge.reward}</p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Připojit se ({challenge.xpReward} XP)
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* TRADING ROOMS TAB */}
          <TabsContent value="rooms" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Live Trading Rooms</h2>
                <p className="text-slate-400 text-sm">
                  {communityStats.liveRooms} LIVE právě teď · Učte se společně v real-time
                </p>
              </div>
            </div>

            {/* Live Rooms */}
            {rooms.filter((r) => r.status === "live").length > 0 && (
              <div className="mb-8">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Radio className="h-5 w-5 text-red-400 animate-pulse" />
                  LIVE Právě Teď
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms
                    .filter((r) => r.status === "live")
                    .map((room) => (
                      <Card
                        key={room.id}
                        className="bg-gradient-to-br from-red-600/20 via-red-700/20 to-red-600/20 border-red-500/40 rounded-2xl overflow-hidden backdrop-blur-sm"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-red-500/30 text-red-200 border-red-500/50 animate-pulse">
                                  🔴 LIVE
                                </Badge>
                                <Badge className={getRoomTypeColor(room.type)}>
                                  {room.type === "live-trading"
                                    ? "Live Trading"
                                    : room.type === "review"
                                      ? "Review"
                                      : room.type === "strategy"
                                        ? "Strategy"
                                        : "Q&A"}
                                </Badge>
                              </div>
                              <h3 className="text-white font-bold text-lg mb-1">{room.name}</h3>
                              <p className="text-slate-400 text-sm mb-2">Host: {room.host}</p>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {room.participants}/{room.maxParticipants}
                                </span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {room.duration}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Progress
                            value={(room.participants / room.maxParticipants) * 100}
                            className="h-2 rounded-full mb-4"
                          />

                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl"
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Vstoupit do Roomu
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Scheduled Rooms */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Naplánované Roomsy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms
                  .filter((r) => r.status === "scheduled")
                  .map((room) => (
                    <Card key={room.id} className="psyche-card">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <Badge className={getRoomTypeColor(room.type)}>
                            {room.type === "live-trading"
                              ? "Live Trading"
                              : room.type === "review"
                                ? "Review"
                                : room.type === "strategy"
                                  ? "Strategy"
                                  : "Q&A"}
                          </Badge>
                          <h3 className="text-white font-bold text-base mt-2 mb-1">{room.name}</h3>
                          <p className="text-slate-400 text-sm mb-3">Host: {room.host}</p>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {room.startTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              Max {room.maxParticipants}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent border-slate-700 rounded-xl text-xs"
                        >
                          <Bell className="h-3.5 w-3.5 mr-1.5" />
                          Připomenout mi
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* STUDY BUDDIES TAB */}
          <TabsContent value="buddies" className="space-y-6">
            <div className="mb-6">
              <Card className="bg-gradient-to-br from-purple-600/90 via-purple-700/90 to-purple-600/90 border-purple-400 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">AI-Powered Study Buddy Matching</h3>
                      <p className="text-white/90 text-sm leading-relaxed mb-3">
                        Náš AI algoritmus najde tradera s podobným stylem, cílem, časovou zónou a úrovní. Společně se
                        učte, rostěte, motivujte a sdílejte zkušenosti. Study buddies mají o 34% vyšší success rate!
                      </p>
                      <div className="flex gap-2">
                        <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                          <Sparkles className="h-3 w-3 mr-1" />
                          92% compatibility matching
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                          {buddies.filter((b) => b.status === "online").length} online teď
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Hledat podle jména, stylu, země nebo timezone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 rounded-2xl h-12 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuddies.map((buddy) => (
                <Card key={buddy.id} className="psyche-card">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="relative inline-block mb-3">
                        <Avatar className="w-20 h-20 ring-4 ring-purple-500/20">
                          <AvatarImage src={buddy.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{buddy.name[0]}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-slate-800 ${
                            buddy.status === "online" ? "bg-emerald-500" : "bg-slate-600"
                          }`}
                        ></div>
                      </div>
                      <h3 className="text-white font-bold text-sm mb-1">{buddy.name}</h3>
                      <p className="text-slate-400 text-xs mb-2">{buddy.nickname}</p>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                        {buddy.traderType}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Úspěšnost</span>
                        <span className="text-white font-bold">{buddy.winRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Streak</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {buddy.streak} dní
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Časové pásmo</span>
                        <span className="text-white text-xs">{buddy.timezone}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Obchodní hodiny</span>
                        <span className="text-white text-xs">{buddy.tradingHours}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs">AI Kompatibilita</span>
                        <span className="text-purple-400 font-bold text-sm">{buddy.compatibility}%</span>
                      </div>
                      <Progress value={buddy.compatibility} className="h-2 rounded-full" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-xs h-9"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        Připojit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-slate-700 rounded-xl text-xs h-9"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-slate-700 rounded-xl text-xs h-9"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* LEADERBOARD TAB */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="psyche-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      Disciplína Leaderboard
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Top tradeři podle disciplíny, streaks a dodržování rutiny
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Period Selector */}
                <div className="flex gap-2 mb-6">
                  {[
                    { id: "weekly", label: "Týdenní" },
                    { id: "monthly", label: "Měsíční" },
                    { id: "alltime", label: "Celkový" },
                  ].map((period) => (
                    <Button
                      key={period.id}
                      variant="outline"
                      size="sm"
                      className={`rounded-xl ${
                        leaderboardPeriod === period.id
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent"
                          : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                      }`}
                      onClick={() => setLeaderboardPeriod(period.id as "weekly" | "monthly" | "alltime")}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>

                {/* Leaderboard - All Users Sorted by XP */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {leaderboardLoading ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">Načítám leaderboard...</p>
                    </div>
                  ) : leaderboardData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">Žádní tradeři v leaderboardu</p>
                    </div>
                  ) : (
                    leaderboardData.slice(0, 5).map((trader) => (
                        <div
                          key={trader.rank}
                          className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                              trader.rank === 1
                                ? "bg-gradient-to-br from-amber-500 to-yellow-500 text-white"
                                : trader.rank === 2
                                  ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white"
                                  : trader.rank === 3
                                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                                    : "bg-slate-600 text-white"
                            }`}
                          >
                            {trader.rank}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={trader.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{trader.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="text-white font-bold">{trader.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Flame className="h-3 w-3 text-orange-400" />
                                Level {trader.level}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-purple-400 font-bold">{trader.xp} XP</p>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* User Position - below Top 5 */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <p className="text-slate-500 text-xs mb-3">Tvoje pozice</p>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center font-bold text-lg text-white">
                      {getUserPosition()}
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getUserStats().avatar || "/placeholder.svg"} />
                      <AvatarFallback>TY</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-white font-bold">{getUserStats().name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {getUserStats().discipline}% disciplína
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {getUserStats().streak} dní
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-bold">{getUserStats().xp} XP</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* SUCCESS STORIES TAB */}
          <TabsContent value="success" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Success Stories</h2>
              <p className="text-slate-400 text-sm">
                Inspiration from community · Real transformations · They did it, you can too
              </p>
            </div>

            <Card className="psyche-card">
              <CardContent className="p-5">
                {postError && (
                  <Alert className="mb-4 bg-red-500/10 border-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">{postError}</AlertDescription>
                  </Alert>
                )}

                {!canPostToday("success") && (
                  <Alert className="mb-4 bg-amber-500/10 border-amber-500/30">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <AlertDescription className="text-amber-400">
                      You've already shared a story today. You can share another tomorrow.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Input
                    placeholder="Your story title..."
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    disabled={!canPostToday("success")}
                    className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl disabled:opacity-50"
                  />
                  <Textarea
                    placeholder="Describe your journey, what helped you, what obstacles you overcame..."
                    value={newStoryContent}
                    onChange={(e) => setNewStoryContent(e.target.value)}
                    disabled={!canPostToday("success")}
                    className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl min-h-[100px] resize-none disabled:opacity-50"
                  />

                  {/* ADD: Month selection for before/after comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Month "Before"</label>
                      <Select
                        value={selectedMonth1}
                        onValueChange={setSelectedMonth1}
                        disabled={!canPostToday("success")}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-white rounded-xl">
                          <SelectValue placeholder="Select month..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {getAvailableMonths().map((month) => (
                            <SelectItem key={month.value} value={month.value} className="text-white hover:bg-slate-800">
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Month "After"</label>
                      <Select
                        value={selectedMonth2}
                        onValueChange={setSelectedMonth2}
                        disabled={!canPostToday("success")}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-white rounded-xl">
                          <SelectValue placeholder="Select month..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {getAvailableMonths().map((month) => (
                            <SelectItem key={month.value} value={month.value} className="text-white hover:bg-slate-800">
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preview selected months stats */}
                  {selectedMonth1 && selectedMonth2 && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Month "Before"</p>
                        {(() => {
                          const [y, m] = selectedMonth1.split("-").map(Number)
                          const stats = getMonthlyStats(y, m)
                          return (
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-300">
                                Success Rate: <span className="text-white">{stats.winRate}%</span>
                              </p>
                              <p className="text-slate-300">
                                P&L:{" "}
                                <span className={stats.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                                  ${stats.pnl}
                                </span>
                              </p>
                              <p className="text-slate-300">
                                Readiness: <span className="text-white">{stats.readiness}%</span>
                              </p>
                              <p className="text-slate-300">
                                Trades: <span className="text-white">{stats.trades}</span>
                              </p>
                              {/* Show revenge trades in preview */}
                              <p className="text-slate-300">
                                Revenge Trades: <span className="text-red-400">{stats.revengeTrades}</span>
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Month "After"</p>
                        {(() => {
                          const [y, m] = selectedMonth2.split("-").map(Number)
                          const stats = getMonthlyStats(y, m)
                          return (
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-300">
                                Success Rate: <span className="text-white">{stats.winRate}%</span>
                              </p>
                              <p className="text-slate-300">
                                P&L:{" "}
                                <span className={stats.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                                  ${stats.pnl}
                                </span>
                              </p>
                              <p className="text-slate-300">
                                Readiness: <span className="text-white">{stats.readiness}%</span>
                              </p>
                              <p className="text-slate-300">
                                Trades: <span className="text-white">{stats.trades}</span>
                              </p>
                              {/* Show revenge trades in preview */}
                              <p className="text-slate-300">
                                Revenge Trades: <span className="text-red-400">{stats.revengeTrades}</span>
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAddStory}
                    disabled={
                      !newStoryTitle.trim() ||
                      !newStoryContent.trim() ||
                      !selectedMonth1 ||
                      !selectedMonth2 ||
                      !canPostToday("success")
                    }
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl w-full disabled:opacity-50"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Share My Story
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {successStories.map((story) => (
                <Card key={story.id} className="psyche-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-12 h-12 ring-2 ring-emerald-500/20">
                        <AvatarImage src={story.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{story.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">{story.title}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-slate-400 text-sm">{story.author}</p>
                          <span className="text-slate-500 text-xs">{story.timestamp}</span>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        <Star className="h-3 w-3 mr-1" />
                        Success Story
                      </Badge>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6">{story.content}</p>

                    {/* Before / After Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                        <h4 className="text-red-400 font-bold text-sm mb-4 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Before (3 months ago)
                        </h4>
                        <div className="space-y-3">
                          {story.beforeAfter.before.map((stat, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-slate-400 text-xs">{stat.metric}</span>
                              <span className="text-white font-bold text-sm">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                        <h4 className="text-emerald-400 font-bold text-sm mb-4 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          After (Now)
                        </h4>
                        <div className="space-y-3">
                          {story.beforeAfter.after.map((stat, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-slate-400 text-xs">{stat.metric}</span>
                              <span className="text-emerald-400 font-bold text-sm">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLikeStory(story.id)}
                        className="text-slate-400 rounded-xl text-xs h-8"
                      >
                        <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                        {story.likes}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 rounded-xl text-xs h-8">
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Comments
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 rounded-xl text-xs h-8">
                        <Share2 className="h-3.5 w-3.5 mr-1.5" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReport(story.id, "success")}
                        disabled={reportedPosts.includes(story.id)}
                        className={`ml-auto rounded-xl text-xs h-8 ${
                          reportedPosts.includes(story.id) ? "text-amber-400" : "text-slate-500 hover:text-red-400"
                        }`}
                      >
                        <Flag className="h-3.5 w-3.5 mr-1.5" />
                        {reportedPosts.includes(story.id) ? "Nahlášeno" : "Nahlásit"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-purple-600/90 via-purple-700/90 to-purple-600/90 border-purple-400 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">Máš svůj success story?</h3>
                    <p className="text-white/90 text-sm leading-relaxed mb-4">
                      Sdílej svou cestu s komunitou! Inspiruj ostatní a ukaž jim, že je to možné. Success stories jsou
                      nejsilnější motivace pro začátečníky.
                    </p>
                    <Button className="bg-white text-purple-600 hover:bg-white/90 rounded-xl font-bold">
                      <Plus className="h-4 w-4 mr-2" />
                      Sdílet můj příběh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Filter function
const VULGAR_WORDS = [
  // Czech vulgar words
  "kurva",
  "píča",
  "čurák",
  "kokot",
  "debil",
  "idiot",
  "kretén",
  "vole",
  "hovno",
  "sráč",
  "zmrd",
  "prdel",
  "hajzl",
  "šulin",
  "mamrd",
  "buzerant",
  "buzna",
  "coura",
  "děvka",
  "šlapka",
  "chcát",
  "srát",
  "pičus",
  "piča",
  "curak",
  "kozy",
  "čůrák",
  "chuj",
  "mrdka",
  "posrat",
  // English vulgar words
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "crap",
  "dick",
  "cock",
  "pussy",
  "asshole",
  "bastard",
  "whore",
  "slut",
  "nigger",
  "faggot",
  "retard",
  "cunt",
  "twat",
  "wanker",
  // Variations
  "f*ck",
  "sh*t",
  "a$$",
  "b!tch",
  "d!ck",
  "fuk",
  "fck",
  "sht",
]

const containsVulgarWords = (text: string): boolean => {
  const lowerText = text.toLowerCase()
  return VULGAR_WORDS.some((word) => lowerText.includes(word))
}

// Moved isMentor definition outside of the component to avoid re-declaration
function isMentor(): boolean {
  if (typeof window === "undefined") return false
  const userData = JSON.parse(localStorage.getItem("user-settings") || "{}")
  return userData.accountType === "mentor"
}

function TeamClubPage() {
  const [userIsMentor, setUserIsMentor] = useState<boolean | null>(null)
  const { user, isLoading } = useAuth() // Added isLoading from auth
  const { isLiveMode } = useLiveMode()
  const [communityUsers, setCommunityUsers] = useState<any[]>([])
  const [loadingCommunity, setLoadingCommunity] = useState(false)

  useEffect(() => {
    // Check if user data is available before determining mentor status
    if (user) {
      setUserIsMentor(isMentor())
    } else {
      // If user is not logged in, assume not a mentor for now, or handle accordingly
      setUserIsMentor(false)
    }
  }, [user]) // Depend on the user object

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400">Načítám Tým...</p>
        </div>
      </div>
    )
  }

  // Render based on mentor status, ensuring userIsMentor is not null
  return userIsMentor !== null ? (
    userIsMentor ? (
      <MentorTeamClubView 
        communityUsers={communityUsers} 
        setCommunityUsers={setCommunityUsers} 
        loadingCommunity={loadingCommunity} 
        setLoadingCommunity={setLoadingCommunity} 
      />
    ) : (
      <StudentTeamClubView communityUsers={communityUsers} loadingCommunity={loadingCommunity} />
    )
  ) : null
}

export default TeamClubPage
