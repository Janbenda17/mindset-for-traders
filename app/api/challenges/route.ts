import { NextResponse } from "next/server"

// Mock community challenges data
const MOCK_CHALLENGES = [
  {
    id: "challenge-1",
    title: "Zero Revenge Trading Week",
    description: "Complete a full week without any revenge trades",
    type: "weekly",
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    reward: 500,
    participants: 127,
    completed: 43,
    difficulty: "hard",
    category: "discipline",
  },
  {
    id: "challenge-2",
    title: "Morning Check Consistency",
    description: "Complete morning check 7 days in a row",
    type: "weekly",
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    reward: 300,
    participants: 234,
    completed: 89,
    difficulty: "medium",
    category: "consistency",
  },
  {
    id: "challenge-3",
    title: "Perfect Readiness Streak",
    description: "Maintain 75%+ readiness for 5 consecutive days",
    type: "weekly",
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    reward: 400,
    participants: 156,
    completed: 67,
    difficulty: "hard",
    category: "performance",
  },
  {
    id: "challenge-4",
    title: "Journal Every Trade",
    description: "Document all trades with detailed journal entries",
    type: "weekly",
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    reward: 250,
    participants: 198,
    completed: 112,
    difficulty: "easy",
    category: "journaling",
  },
]

const MOCK_LEADERBOARD = [
  { rank: 1, username: "TraderPro_2024", points: 2450, challengesCompleted: 12, avatar: "🏆" },
  { rank: 2, username: "MindfulTrader", points: 2180, challengesCompleted: 11, avatar: "🎯" },
  { rank: 3, username: "DisciplineKing", points: 1950, challengesCompleted: 10, avatar: "👑" },
  { rank: 4, username: "ZenTrader88", points: 1820, challengesCompleted: 9, avatar: "🧘" },
  { rank: 5, username: "FocusedMind", points: 1650, challengesCompleted: 8, avatar: "🎓" },
  { rank: 6, username: "PatientTrader", points: 1480, challengesCompleted: 8, avatar: "⏳" },
  { rank: 7, username: "ConsistentWins", points: 1320, challengesCompleted: 7, avatar: "📈" },
  { rank: 8, username: "NoRevengeZone", points: 1150, challengesCompleted: 6, avatar: "🛡️" },
  { rank: 9, username: "MorningRitual", points: 980, challengesCompleted: 5, avatar: "☀️" },
  { rank: 10, username: "JournalMaster", points: 850, challengesCompleted: 5, avatar: "📝" },
]

export async function GET() {
  return NextResponse.json({
    challenges: MOCK_CHALLENGES,
    leaderboard: MOCK_LEADERBOARD,
  })
}
