"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  VideoIcon,
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
} from "lucide-react"
import { useData } from "@/contexts/data-context"

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

interface MentorQA {
  id: string
  question: string
  askedBy: string
  answer?: string
  answeredBy?: string
  likes: number
  timestamp: string
  status: "answered" | "pending"
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
      "Po 3 týdnech práce na trpělivosti jsem dnes měla perfektní trade! Čekala jsem 4 hodiny na svůj A+ setup a vyplatilo se to. +$420 🎯",
    type: "win",
    timestamp: "před 2h",
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
      "Dnes jsem udělal chybu - šel jsem do revenge trade po ztrátě. Ztratil jsem další $180. ALE tentokrát jsem to zastavil po 1 tradu, ne po 5 jako dřív.",
    type: "loss",
    timestamp: "před 4h",
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
      "Zjistila jsem, že moje nejlepší obchody dělám mezi 9-11 dopoledne. Po obědě už nemám takovou koncentraci. Začínám si dělat poznámky o tom, kdy traduju nejlíp.",
    type: "insight",
    timestamp: "před 6h",
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
      "Někdo ví, jak se zbavit strachu po sérii ztrát? Mám 3 losing trades za sebou a teď se bojím vstoupit do dalšího, i když vidím dobrý setup.",
    type: "question",
    timestamp: "před 8h",
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
    description: "30 dní bez jediného revenge tradu. Po každé ztrátě povinná 30 min pauza.",
    type: "behavioral",
    category: "intermediate",
    participants: 142,
    daysLeft: 23,
    duration: 30,
    progress: 23,
    reward: "🏆 Revenge-Free Warrior badge + 1000 XP",
    joined: false,
    difficulty: 7,
    xpReward: 1000,
  },
  {
    id: "2",
    title: "Morning Routine Mastery",
    description: "21 dní konzistentní ranní rutiny před tradingem (meditation, journal, prep).",
    type: "routine",
    category: "beginner",
    participants: 89,
    daysLeft: 15,
    duration: 21,
    progress: 0,
    reward: "⭐ Morning Warrior badge + 500 XP",
    joined: false,
    difficulty: 4,
    xpReward: 500,
  },
  {
    id: "3",
    title: "Perfect Journal Streak",
    description: "30 dní bez přerušení journalingu. Každý trade musí mít zápis.",
    type: "routine",
    category: "intermediate",
    participants: 234,
    daysLeft: 28,
    duration: 30,
    progress: 0,
    reward: "📔 Journal Master badge + 800 XP",
    joined: false,
    difficulty: 6,
    xpReward: 800,
  },
  {
    id: "4",
    title: "Mindfulness Meditation - 14 Days",
    description: "14 dní denní meditace min. 10 minut. Prokázaně snižuje impulzivitu o 40%.",
    type: "mental",
    category: "beginner",
    participants: 167,
    daysLeft: 10,
    duration: 14,
    progress: 0,
    reward: "🧘 Zen Trader badge + 400 XP",
    joined: false,
    difficulty: 3,
    xpReward: 400,
  },
  {
    id: "5",
    title: "Risk Management Elite",
    description: "30 dní s max 1% risk per trade. Ani jeden trade s větším riskem.",
    type: "skill",
    category: "advanced",
    participants: 98,
    daysLeft: 25,
    duration: 30,
    progress: 0,
    reward: "💎 Risk Master badge + 1200 XP",
    joined: false,
    difficulty: 9,
    xpReward: 1200,
  },
  {
    id: "6",
    title: "No FOMO - 21 Day Challenge",
    description: "21 dní bez FOMO tradů. Jen plánované setupy podle strategie.",
    type: "behavioral",
    category: "intermediate",
    participants: 201,
    daysLeft: 18,
    duration: 21,
    progress: 0,
    reward: "🎯 Patience Pro badge + 750 XP",
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
    name: "Týdenní Review & Plánování",
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
    host: "Dr. Novák (Psycholog)",
    participants: 0,
    maxParticipants: 75,
    startTime: "19:00",
    duration: "1h",
    type: "q&a",
    status: "scheduled",
  },
]

const DEMO_MENTOR_QA: MentorQA[] = [
  {
    id: "1",
    question: "Jak poznat, že jsem v revenge trading módu?",
    askedBy: "Martin N.",
    answer:
      "Skvělá otázka! Revenge trading má 3 jasné signály: 1) Trading hned po ztrátě bez pauzy, 2) Zvětšení position size, 3) Ignorování setupu. Nejlepší obrana je mít pravidlo: Po ztrátě minimálně 30 min pauza.",
    answeredBy: "Mentor Jana",
    likes: 124,
    timestamp: "před 5h",
    status: "answered",
  },
  {
    id: "2",
    question: "Je lepší tradovat ráno nebo odpoledne?",
    askedBy: "Petra K.",
    answer:
      "Záleží na tobě! London session (8-12h) má nejvyšší volatilitu, ale vyžaduje rychlé rozhodování. US session (14-20h) je klidnější. Experimentuj a sleduj si, kdy máš nejlepší výsledky.",
    answeredBy: "Mentor Jan",
    likes: 89,
    timestamp: "před 1 den",
    status: "answered",
  },
  {
    id: "3",
    question: "Stačí 50% win rate k profitabilitě?",
    askedBy: "Tomáš D.",
    answer:
      "Absolutně! S dobrým risk/reward ratio (min 1:2) jsi profitable i s 40% win rate. Důležitější než win rate je konzistentnost a risk management.",
    answeredBy: "Mentor Jana",
    likes: 67,
    timestamp: "před 2 dny",
    status: "answered",
  },
  {
    id: "4",
    question: "Jak se vyhnout overtrading?",
    askedBy: "Jan P.",
    timestamp: "před 3h",
    likes: 12,
    status: "pending",
  },
  {
    id: "5",
    question: "Můžu být profitable bez technické analýzy?",
    askedBy: "Lucie M.",
    timestamp: "před 5h",
    likes: 8,
    status: "pending",
  },
]

const DEMO_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "1",
    author: "Jana Svobodová",
    avatar: "/trader-avatar.png",
    title: "Z -$2,000 na +$5,400 za 3 měsíce",
    content:
      "Před 3 měsíci jsem byla v hluboké frustraci. Ztratila jsem $2,000 kvůli revenge tradingu a impulzivním rozhodnutím. Díky Team Club challenges jsem kompletně změnila approach. 'Zero Revenge Trading' mi pomohla nastavit si pravidla a 'Perfect Journal Streak' mě naučila disciplíně.",
    beforeAfter: {
      before: [
        { metric: "Win Rate", value: "43%" },
        { metric: "Monthly P/L", value: "-$670" },
        { metric: "Avg. Revenge Trades", value: "5/měsíc" },
      ],
      after: [
        { metric: "Win Rate", value: "68%" },
        { metric: "Monthly P/L", value: "+$1,800" },
        { metric: "Avg. Revenge Trades", value: "0/měsíc" },
      ],
    },
    timestamp: "před 2 dny",
    likes: 234,
  },
  {
    id: "2",
    author: "Martin Novák",
    avatar: "/trader-avatar.png",
    title: "Překonal jsem FOMO a ztrojnásobil profit",
    content:
      "FOMO mě stálo tisíce. Vstupoval jsem do každého tradu ze strachu, že mi ujede. Po 'No FOMO Challenge' a práci s mentorem jsem se naučil trpělivosti. Teď čekám jen na A+ setupy a moje profit se ztrojnásobil.",
    beforeAfter: {
      before: [
        { metric: "Trades/měsíc", value: "120+" },
        { metric: "Win Rate", value: "52%" },
        { metric: "Monthly P/L", value: "+$400" },
      ],
      after: [
        { metric: "Trades/měsíc", value: "45" },
        { metric: "Win Rate", value: "71%" },
        { metric: "Monthly P/L", value: "+$1,200" },
      ],
    },
    timestamp: "před 1 týden",
    likes: 189,
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
  if (entries.length === 0) return 70
  const recent = entries.slice(-7)
  const avg = recent.reduce((sum, m) => sum + (m.mood || 0), 0) / recent.length
  return Math.round(avg * 10)
}

function generateStudentsFromRealData(trades: any[], journals: any[], moodEntries: any[]): Student[] {
  if (trades.length === 0 && journals.length === 0) {
    return []
  }

  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || t.profitLoss || 0), 0)
  const journalStreak = calculateJournalStreak(journals)
  const discipline = calculateDiscipline(trades, journals)
  const readiness = calculateReadiness(moodEntries)

  return [
    {
      id: "user-1",
      name: "Ty (Student)",
      nickname: "MyTrader",
      avatar: "/trader-avatar.png",
      traderType: "day-trader",
      readiness: readiness,
      readinessHistory: [],
      discipline: discipline,
      pnl: totalPnL,
      pnlHistory: [],
      journalStreak: journalStreak,
      status: readiness < 50 ? "critical" : readiness < 70 ? "warning" : "stable",
      lastActive: "právě teď",
      triggers: [],
      strengths: [],
      weaknesses: [],
      aiDiagnosis: "Analyzujem tvoje data...",
      mentorNotes: [],
      todos: [],
    },
  ]
}

// MENTOR VIEW
function MentorTeamClubView() {
  const { getAllTrades, getAllJournalEntries, isLiveMode } = useData()
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    const trades = getAllTrades()
    const journals = getAllJournalEntries()
    const moodEntries = JSON.parse(localStorage.getItem("user-mood-entries") || "[]")

    if (isLiveMode) {
      const realStudents = generateStudentsFromRealData(trades, journals, moodEntries)
      setStudents(realStudents)
    } else {
      setStudents([])
    }
  }, [isLiveMode, getAllTrades, getAllJournalEntries])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
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
function StudentTeamClubView() {
  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()
  const [activeTab, setActiveTab] = useState("overview")
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [buddies, setBuddies] = useState<StudyBuddy[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [rooms, setRooms] = useState<TradingRoom[]>([])
  const [mentorQA, setMentorQA] = useState<MentorQA[]>([])
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([])
  const [newPost, setNewPost] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [challengeFilter, setChallengeFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all")
  const [postFilter, setPostFilter] = useState<"all" | "win" | "loss" | "insight" | "question">("all")

  useEffect(() => {
    if (isLiveMode) {
      setPosts([])
      setBuddies([])
      setChallenges([])
      setRooms([])
      setMentorQA([])
      setSuccessStories([])
    } else {
      setPosts(DEMO_POSTS)
      setBuddies(DEMO_BUDDIES)
      setChallenges(DEMO_CHALLENGES)
      setRooms(DEMO_TRADING_ROOMS)
      setMentorQA(DEMO_MENTOR_QA)
      setSuccessStories(DEMO_SUCCESS_STORIES)
    }
  }, [isLiveMode])

  const trades = getAllTrades()
  const journals = getAllJournalEntries()
  const moodEntries = JSON.parse(localStorage.getItem("user-mood-entries") || "[]")

  const userStats = {
    totalTrades: trades.length,
    winRate:
      trades.length > 0
        ? Math.round((trades.filter((t) => (t.pnl || t.profitLoss || 0) > 0).length / trades.length) * 100)
        : 0,
    journalStreak: calculateJournalStreak(journals),
    activeChallenges: challenges.filter((c) => c.joined).length,
    weeklyPnL: trades.slice(-7).reduce((sum, t) => sum + (t.pnl || t.profitLoss || 0), 0),
    avgMood:
      moodEntries.length > 0
        ? Math.round(moodEntries.reduce((sum, m) => sum + (m.mood || 0), 0) / moodEntries.length)
        : 70,
    totalXP: challenges
      .filter((c) => c.joined)
      .reduce((sum, c) => sum + Math.round((c.progress / 100) * c.xpReward), 0),
  }

  const communityStats = {
    onlineMembers: isLiveMode ? 1 : 487,
    totalMembers: isLiveMode ? 1 : 1243,
    activeChallenges: challenges.length,
    liveRooms: rooms.filter((r) => r.status === "live").length,
    todayPosts: posts.length,
    avgCommunityMood: 68,
    frustrationRate: 32,
    improvementRate: 73,
    avgWinRate: 64,
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

  const handleLikeQA = (qaId: string) => {
    setMentorQA(mentorQA.map((qa) => (qa.id === qaId ? { ...qa, likes: qa.likes + 1 } : qa)))
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
        return "Behavioral"
      case "routine":
        return "Routine"
      case "mental":
        return "Mental"
      case "skill":
        return "Skill"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              <span className="gradient-text">MindTrader Team Club</span>
              <Badge
                className={
                  isLiveMode
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                }
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isLiveMode ? "Live Mode" : "Virtual Mode"}
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/80 backdrop-blur-xl border border-slate-600 p-1.5 grid grid-cols-4 lg:grid-cols-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <Telescope className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <Activity className="w-4 h-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <Target className="w-4 h-4 mr-2" />
              Výzvy
            </TabsTrigger>
            <TabsTrigger
              value="rooms"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <VideoIcon className="w-4 h-4 mr-2" />
              Rooms
            </TabsTrigger>
            <TabsTrigger
              value="buddies"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Buddies
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Top
            </TabsTrigger>
            <TabsTrigger
              value="mentor-qa"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Q&A
            </TabsTrigger>
            <TabsTrigger
              value="success"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 text-gray-300"
            >
              <Star className="w-4 h-4 mr-2" />
              Success
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Community Health Dashboard */}
            <Card className="psyche-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-400" />
                  Community Health Dashboard
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
                            <p className="text-gray-400 text-xs font-medium mb-2">Avg. Community Mood</p>
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
                            <p className="text-gray-400 text-xs font-medium mb-2">Avg. Win Rate</p>
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
                            <p className="text-gray-400 text-xs font-medium mb-2">Showing Improvement</p>
                            <p className="text-4xl font-bold text-white mb-1">{communityStats.improvementRate}%</p>
                            <p className="text-cyan-400 text-sm font-semibold flex items-center gap-1">
                              <ArrowUp className="w-4 h-4" />
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
                            <p className="text-gray-400 text-xs font-medium mb-2">Feeling Frustrated</p>
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
                        {userStats.journalStreak} dní
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
            </div>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-600/90 border-blue-400 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Community Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">💡 AI Recommendation</p>
                      <p className="text-white/90 text-sm">
                        {userStats.winRate >= communityStats.avgWinRate
                          ? "Tvoje win rate je nad průměrem! Sdílej své postupy v Community Feed."
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                {/* Create Post */}
                {!isLiveMode && (
                  <Card className="psyche-card">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                          <AvatarImage src="/trader-avatar.png" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <Textarea
                          placeholder="Sdílej svůj win, loss lesson, insight nebo se zeptej komunity... 💬"
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl min-h-[100px] resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-slate-700 rounded-lg text-xs hover:bg-emerald-500/10 hover:border-emerald-500/30"
                          >
                            <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                            Win
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-slate-700 rounded-lg text-xs hover:bg-red-500/10 hover:border-red-500/30"
                          >
                            <TrendingDown className="h-3.5 w-3.5 mr-1.5 text-red-400" />
                            Loss
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-slate-700 rounded-lg text-xs hover:bg-amber-500/10 hover:border-amber-500/30"
                          >
                            <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                            Insight
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                          disabled={!newPost.trim()}
                        >
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Sdílet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                    Wins
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
                    Losses
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
                    Insights
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
                    Questions
                  </Button>
                </div>

                {/* Posts */}
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="psyche-card">
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

                      <div className="flex items-center gap-4 pt-3 border-t border-slate-700/50">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLikePost(post.id)}
                          className={`rounded-xl text-xs h-8 ${post.isLiked ? "text-pink-400" : "text-slate-400"}`}
                        >
                          <ThumbsUp className={`h-3.5 w-3.5 mr-1.5 ${post.isLiked ? "fill-current" : ""}`} />
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Trending Topics */}
                <Card className="psyche-card">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      Trending Topics
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

                {/* Top Contributors */}
                <Card className="psyche-card">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-400" />
                      Top Contributors
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
              </div>
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
              <div className="flex gap-2">
                {(["all", "beginner", "intermediate", "advanced"] as const).map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={challengeFilter === filter ? "default" : "outline"}
                    onClick={() => setChallengeFilter(filter)}
                    className={`rounded-xl text-xs ${
                      challengeFilter === filter
                        ? "bg-gradient-to-r from-purple-600 to-pink-600"
                        : "bg-transparent border-slate-700"
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
              </div>
            </div>

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
                              <p className="text-slate-400 text-xs">
                                {challenge.duration} dní · Zbývá {challenge.daysLeft} dní
                              </p>
                            </div>
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
                        Náš AI algoritmus najde tradeře s podobným stylem, cíli, časovou zónou a úrovní. Společně se
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
                        <span className="text-slate-400">Win Rate</span>
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
                        <span className="text-slate-400">Timezone</span>
                        <span className="text-white text-xs">{buddy.timezone}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Trading Hours</span>
                        <span className="text-white text-xs">{buddy.tradingHours}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs">AI Compatibility</span>
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
                        Connect
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
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Disciplína Leaderboard
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Top tradeři podle disciplíny, streaks a dodržování rutiny
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "Jana Svobodová", discipline: 94, streak: 28, xp: 4850 },
                    { rank: 2, name: "Martin Novák", discipline: 91, streak: 25, xp: 4200 },
                    { rank: 3, name: "Petra Nová", discipline: 88, streak: 21, xp: 3900 },
                    { rank: 4, name: "Tomáš Dvořák", discipline: 85, streak: 19, xp: 3650 },
                    { rank: 5, name: "Jan Novotný", discipline: 82, streak: 17, xp: 3400 },
                  ].map((trader) => (
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
                        <AvatarImage src="/trader-avatar.png" />
                        <AvatarFallback>{trader.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{trader.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {trader.discipline}% disciplína
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-400" />
                            {trader.streak} dní
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">{trader.xp} XP</p>
                        <p className="text-slate-500 text-xs">Total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MENTOR Q&A TAB */}
          <TabsContent value="mentor-qa" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Mentor Q&A</h2>
                <p className="text-slate-400 text-sm">
                  {mentorQA.filter((q) => q.status === "pending").length} čekajících otázek · Ptej se anything!
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Položit otázku
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {mentorQA.map((qa) => (
                  <Card
                    key={qa.id}
                    className={`backdrop-blur-xl border rounded-2xl overflow-hidden ${
                      qa.status === "answered"
                        ? "bg-slate-800/50 border-slate-700/50"
                        : "bg-amber-500/10 border-amber-500/30"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-semibold text-sm">{qa.askedBy}</h4>
                            <span className="text-slate-500 text-xs">{qa.timestamp}</span>
                            <Badge
                              className={
                                qa.status === "answered"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }
                            >
                              {qa.status === "answered" ? "Answered" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-white text-sm leading-relaxed mb-3">{qa.question}</p>

                          {qa.answer && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src="/trader-avatar.png" />
                                  <AvatarFallback>{qa.answeredBy?.[0]}</AvatarFallback>
                                </Avatar>
                                <p className="text-blue-400 font-semibold text-xs">{qa.answeredBy}</p>
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed">{qa.answer}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleLikeQA(qa.id)}
                              className="text-slate-400 rounded-xl text-xs h-7"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1.5" />
                              {qa.likes}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-400 rounded-xl text-xs h-7">
                              <MessageCircle className="h-3 w-3 mr-1.5" />
                              Diskuze
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-400 rounded-xl text-xs h-7">
                              <Share2 className="h-3 w-3 mr-1.5" />
                              Sdílet
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card className="psyche-card">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Jak to funguje?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-slate-300 text-xs leading-relaxed">
                    <p>1️⃣ Polož otázku (cokoliv o tradingu, psychologii, strategii)</p>
                    <p>2️⃣ AI analyzuje a přiřadí nejlepšího mentora</p>
                    <p>3️⃣ Mentor odpoví (většinou do 24h)</p>
                    <p>4️⃣ Komunita může diskutovat a lajkovat</p>
                    <p className="pt-2 border-t border-slate-700">
                      💡 Nejlepší otázky jsou konkrétní a obsahují kontext!
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-600/20 via-amber-700/20 to-amber-600/20 border-amber-500/30 rounded-2xl overflow-hidden backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Top Questions Tento Týden</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { question: "Jak poznat revenge trading?", likes: 124 },
                      { question: "Lepší ráno nebo odpoledne?", likes: 89 },
                      { question: "50% win rate je dost?", likes: 67 },
                    ].map((q, index) => (
                      <div key={index} className="p-2 hover:bg-slate-700/30 rounded-lg cursor-pointer transition-all">
                        <p className="text-white text-xs mb-1">{q.question}</p>
                        <span className="text-amber-400 text-xs font-bold">{q.likes} likes</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SUCCESS STORIES TAB */}
          <TabsContent value="success" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Success Stories</h2>
              <p className="text-slate-400 text-sm">
                Inspirace od komunity · Reálné transformace · Dokázali to, dokážeš to taky
              </p>
            </div>

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
                          Před (3 měsíce)
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
                          Po (Teď)
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
                        Komentáře
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 rounded-xl text-xs h-8">
                        <Share2 className="h-3.5 w-3.5 mr-1.5" />
                        Sdílet
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

function isMentor(): boolean {
  if (typeof window === "undefined") return false
  const userData = JSON.parse(localStorage.getItem("user-settings") || "{}")
  return userData.accountType === "mentor"
}

export default function TeamClubPage() {
  const [userIsMentor, setUserIsMentor] = useState<boolean | null>(null)

  useEffect(() => {
    setUserIsMentor(isMentor())
  }, [])

  if (userIsMentor === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400">Načítám Team Club...</p>
        </div>
      </div>
    )
  }

  return userIsMentor ? <MentorTeamClubView /> : <StudentTeamClubView />
}
