"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Heart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Save,
  Activity,
  Zap,
  Award,
  BookOpen,
  Flame,
  Shield,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Clock,
  BarChart3,
  Wand2,
  PenLine,
  History,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getScoped, setScoped } from "@/lib/storage"
import { getJournalEntries, getMoodEntries, getUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import { useAnalytics } from "@/contexts/analytics-context"
import { useLiveMode } from "@/contexts/live-mode-context"
import { cn } from "@/lib/utils"

interface WeeklyReview {
  id: string
  weekStart: string
  weekEnd: string
  createdAt: string
  variant: "manual" | "ai"
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  bestTrade: number
  worstTrade: number
  avgMood: number
  avgReadiness: number
  whatWorked: string
  whatDidntWork: string
  biggestWin: string
  biggestLoss: string
  emotionalPatterns: string
  mistakesMade: string
  lessonsLearned: string
  weeklyGoals: string[]
  focusAreas: string[]
  tradingPlanAdjustments: string
  riskManagementNotes: string
  mindsetPreparation: string
  actionPlan: { text: string; completed: boolean }[]
  mindPointsGained: number
  currentStreak: number
  lossResets: number
  revengeIncidents: number
  dailyData: any[]
  sleepData: any[]
  aiInsights: any[]
  avgSleep?: number
}

export default function WeeklyReviewPage() {
  const { isLiveMode, trades, morningChecks } = useData()
  const { analytics } = useAnalytics()
  const { user } = useAuth()
  
  const [currentWeekData, setCurrentWeekData] = useState<any>(null)
  const [reviewVariant, setReviewVariant] = useState<"manual" | "ai">("manual")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [review, setReview] = useState<Partial<WeeklyReview>>({
    whatWorked: "",
    whatDidntWork: "",
    biggestWin: "",
    biggestLoss: "",
    emotionalPatterns: "",
    mistakesMade: "",
    lessonsLearned: "",
    weeklyGoals: ["", "", ""],
    focusAreas: ["", "", ""],
    tradingPlanAdjustments: "",
    riskManagementNotes: "",
    mindsetPreparation: "",
  })
  const [savedReviews, setSavedReviews] = useState<any[]>([])
  const [actionPlan, setActionPlan] = useState<{ text: string; completed: boolean }[]>([
    { text: "", completed: false },
    { text: "", completed: false },
    { text: "", completed: false },
  ])
  const [activeTab, setActiveTab] = useState("current")
  const [viewingReview, setViewingReview] = useState<any | null>(null)

  const clearForm = () => {
    setReview({
      whatWorked: "",
      whatDidntWork: "",
      biggestWin: "",
      biggestLoss: "",
      emotionalPatterns: "",
      mistakesMade: "",
      lessonsLearned: "",
      weeklyGoals: ["", "", ""],
      focusAreas: ["", "", ""],
      tradingPlanAdjustments: "",
      riskManagementNotes: "",
      mindsetPreparation: "",
    })
    setActionPlan([
      { text: "", completed: false },
      { text: "", completed: false },
      { text: "", completed: false },
    ])
  }

  const loadVirtualData = () => {
    if (currentWeekData) return;
    
    const demoWeekData = {
      weekStart: new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('cs-CZ'),
      weekEnd: new Date().toLocaleDateString('cs-CZ'),
      totalTrades: 15,
      winningTrades: 12,
      losingTrades: 3,
      winRate: 80,
      totalPnL: 2500,
      bestTrade: 450,
      worstTrade: -250,
      avgMood: 75,
      avgReadiness: 82,
      mindPointsGained: 150,
      currentStreak: 5,
      lossResets: 1,
      revengeIncidents: 0,
      dailyData: [],
      sleepData: [],
      aiInsights: [
        {
          type: "success",
          title: "Vysoká Disciplína",
          description: "Tvoje disciplína je na úrovni 82%. Dodržuješ obchodní plán.",
          action: "Pokračuj v tomto tempu.",
        },
      ],
    };
    
    setCurrentWeekData(demoWeekData);
  }

  const loadSavedReviews = () => {
    if (!user?.id) return;
    const saved = getScoped("live", user.id, "weekly-reviews", []);
    setSavedReviews(saved);
  }

  const saveReview = () => {
    if (!currentWeekData || !user?.id) return;

    const newReview = {
      id: Date.now().toString(),
      weekStart: currentWeekData.weekStart,
      weekEnd: currentWeekData.weekEnd,
      createdAt: new Date().toISOString(),
      variant: reviewVariant,
      totalTrades: currentWeekData.totalTrades,
      winningTrades: currentWeekData.winningTrades,
      losingTrades: currentWeekData.losingTrades,
      winRate: currentWeekData.winRate,
      totalPnL: currentWeekData.totalPnL,
      bestTrade: currentWeekData.bestTrade,
      worstTrade: currentWeekData.worstTrade,
      avgMood: currentWeekData.avgMood,
      avgReadiness: currentWeekData.avgReadiness,
      mindPointsGained: currentWeekData.mindPointsGained,
      currentStreak: currentWeekData.currentStreak,
      lossResets: currentWeekData.lossResets,
      revengeIncidents: currentWeekData.revengeIncidents,
      dailyData: currentWeekData.dailyData,
      sleepData: currentWeekData.sleepData,
      aiInsights: currentWeekData.aiInsights,
      actionPlan: actionPlan,
      ...review,
    };

    const updated = [newReview, ...savedReviews];
    setSavedReviews(updated);
    setScoped("live", user.id, "weekly-reviews", updated);
    alert("Týdenní přehled uložen!");
  }

  useEffect(() => {
    if (isLiveMode) {
      if (analytics?.summary) {
        const weekData = {
          weekStart: new Date().toLocaleDateString('cs-CZ'),
          weekEnd: new Date().toLocaleDateString('cs-CZ'),
          avgMood: 75,
          avgReadiness: analytics.summary.avgReadiness || 75,
          revengeIncidents: analytics.psychology?.revengeIncidents || 0,
          dailyData: [],
          totalTrades: analytics.summary.totalTrades,
          winRate: analytics.summary.winRate,
          totalPnL: analytics.summary.totalPnL,
          weekStartDate: new Date(),
        };
        setCurrentWeekData(weekData);
      }
      return;
    }
    
    if (!currentWeekData) {
      loadVirtualData();
    }
  }, [isLiveMode, analytics]);

  useEffect(() => {
    if (user?.id) {
      loadSavedReviews();
    }
  }, [user?.id]);

  if (!currentWeekData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Načítání dat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <Calendar className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Týdenní Přehled
          </h1>
          <p className="text-gray-400 text-lg">
            {currentWeekData.weekStart} - {currentWeekData.weekEnd}
          </p>

          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <Button
              onClick={saveReview}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Save className="w-5 h-5 mr-2" />
              Uložit Přehled
            </Button>
            <Button
              onClick={() => {
                setReviewVariant("manual");
                clearForm();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              <PenLine className="w-5 h-5 mr-2" />
              Nový Přehled
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="current" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Aktuální Přehled
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Historie ({savedReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6 mt-6">
            {/* Performance Summary */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Výkon Týdne
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Celkem Tradů</p>
                  <p className="text-2xl font-bold text-white">{currentWeekData.totalTrades}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">{currentWeekData.winRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Total PnL</p>
                  <p className="text-2xl font-bold text-green-400">${currentWeekData.totalPnL}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Avg Readiness</p>
                  <p className="text-2xl font-bold text-purple-400">{currentWeekData.avgReadiness}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Review Form */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tvůj Přehled</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Co se povedlo?</Label>
                  <Textarea
                    value={review.whatWorked || ""}
                    onChange={(e) => setReview({ ...review, whatWorked: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Co se nepovedlo?</Label>
                  <Textarea
                    value={review.whatDidntWork || ""}
                    onChange={(e) => setReview({ ...review, whatDidntWork: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                    rows={3}
                  />
                </div>
                <Button onClick={saveReview} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  Uložit Přehled
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            {savedReviews.length === 0 ? (
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                <CardContent className="text-center py-8">
                  <p className="text-gray-400">Zatím žádné uložené přehledy</p>
                </CardContent>
              </Card>
            ) : (
              savedReviews.map((review) => (
                <Card key={review.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{review.weekStart} - {review.weekEnd}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">{review.whatWorked}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
