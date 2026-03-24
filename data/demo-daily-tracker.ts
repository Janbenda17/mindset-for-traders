import { format, subDays } from "date-fns"

export interface DemoMorningCheck {
  id: string
  date: string
  sleepQuality: number
  sleepHours: number
  energyLevel: number
  stressLevel: number
  focus: number
  physicalHealth: number
  emotionalState: number
  exercised: boolean
  exerciseType: string
  exerciseDuration: number
  meditationTime: number
  morningRoutine: boolean
  score: number
  recommendation: string
}

export interface DemoDailyIntention {
  date: string
  goals: string
  maxRiskPercent: number
  emotionalGoal: string
  strategy: string
}

export interface DemoTradingPlan {
  date: string
  primarySetup: string
  pairs: string[]
  timeframe: string
  entryRules: string
  exitRules: string
  keyLevels: string
  maxRisk: number
}

export interface AIInsights {
  keyInsights: string[]
  predictions: string[]
  recommendations: string[]
  riskFactors: string[]
  strengths: string[]
}

export interface DemoDailyTracker {
  date: string
  morningCheck: DemoMorningCheck
  intention: DemoDailyIntention
  plan: DemoTradingPlan
  trades: any[]
  insights: AIInsights
  overallScore: number
  stagesCompleted: number
}

// Generuje 7 dní realistických demo dat
export function generateDemoDailyTrackerData(): DemoDailyTracker[] {
  const today = new Date()
  const data: DemoDailyTracker[] = []

  // Den 1 - Skvělý den (85%)
  data.push({
    date: format(subDays(today, 0), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-1",
      date: format(subDays(today, 0), "yyyy-MM-dd"),
      sleepQuality: 8,
      sleepHours: 8,
      energyLevel: 9,
      stressLevel: 3,
      focus: 9,
      physicalHealth: 8,
      emotionalState: 9,
      exercised: true,
      exerciseType: "gym",
      exerciseDuration: 45,
      meditationTime: 15,
      morningRoutine: true,
      score: 78,
      recommendation: "Excellent readiness! Perfect day for trading with high confidence.",
    },
    intention: {
      date: format(subDays(today, 0), "yyyy-MM-dd"),
      goals: "Take only A+ setups, stick to 2% risk rule, focus on patience",
      maxRiskPercent: 2,
      emotionalGoal: "confident",
      strategy: "Trend following on EUR/USD, waiting for breakout confirmations",
    },
    plan: {
      date: format(subDays(today, 0), "yyyy-MM-dd"),
      primarySetup: "Breakout Strategy",
      pairs: ["EUR/USD", "GBP/JPY"],
      timeframe: "4H",
      entryRules: "Wait for close above resistance + volume confirmation",
      exitRules: "Take profit at 2:1 RR or trailing stop",
      keyLevels: "EUR/USD: 1.0950 resistance, 1.0900 support",
      maxRisk: 2,
    },
    trades: [
      {
        id: "demo-t1",
        pair: "EUR/USD",
        type: "Long",
        entry: 1.095,
        exit: 1.098,
        pnl: 300,
        mood: 9,
        confidence: 9,
      },
    ],
    insights: {
      keyInsights: [
        "Your sleep quality and focus are at peak levels today - optimal conditions for trading",
        "Morning routine completed with exercise and meditation has elevated your mental clarity",
        "Current emotional state shows confidence without overconfidence - perfect balance for execution",
      ],
      predictions: [
        "High probability of profitable trades if you stick to your A+ setups only",
        "Your disciplined approach today should result in better trade selection quality",
      ],
      recommendations: [
        "Take advantage of your peak state - this is an ideal day for taking calculated risks",
        "Document your successful decision-making process for reference on lower-energy days",
        "Avoid the temptation to overtrade - quality over quantity remains the priority",
      ],
      riskFactors: [
        "Overconfidence risk - maintain strict position size discipline even on high-energy days",
        "FOMO risk - stick to your watchlist and don't chase moves",
      ],
      strengths: [
        "Exceptional mental clarity and focus",
        "Well-rested and physically prepared",
        "Strong emotional stability",
      ],
    },
    overallScore: 78,
    stagesCompleted: 5,
  })

  // Den 2 - Dobrý den (75%)
  data.push({
    date: format(subDays(today, 1), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-2",
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      sleepQuality: 7,
      sleepHours: 7.5,
      energyLevel: 8,
      stressLevel: 4,
      focus: 8,
      physicalHealth: 7,
      emotionalState: 8,
      exercised: true,
      exerciseType: "cardio",
      exerciseDuration: 30,
      meditationTime: 10,
      morningRoutine: true,
      score: 75,
      recommendation: "Good readiness. Stay disciplined and follow your plan.",
    },
    intention: {
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      goals: "Focus on quality over quantity, max 3 trades today",
      maxRiskPercent: 1.5,
      emotionalGoal: "calm",
      strategy: "Support/resistance bounces on GBP/JPY",
    },
    plan: {
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      primarySetup: "Reversal at Key Levels",
      pairs: ["GBP/JPY", "USD/CAD"],
      timeframe: "1H",
      entryRules: "Rejection candle at support/resistance + RSI confirmation",
      exitRules: "First target at previous swing, let runner go to next level",
      keyLevels: "GBP/JPY: 185.50 resistance, 184.00 support",
      maxRisk: 1.5,
    },
    trades: [
      {
        id: "demo-t2",
        pair: "GBP/JPY",
        type: "Short",
        entry: 185.5,
        exit: 184.8,
        pnl: 350,
        mood: 8,
        confidence: 8,
      },
    ],
    insights: {
      keyInsights: [
        "Good balance between sleep and activity - you're maintaining consistency",
        "Morning routine completion shows discipline is becoming a habit",
        "Energy levels remain strong despite lower sleep hours than yesterday",
      ],
      predictions: [
        "Continuation of positive trading performance with slightly tighter discipline",
        "Your consistency will help maintain win rate above 60%",
      ],
      recommendations: [
        "Maintain current routine - consistency is building positive habits",
        "Consider increasing meditation time by 5 minutes for stress reduction",
        "Your calm emotional state is an asset - use it for patient trade selection",
      ],
      riskFactors: [
        "Minor stress increase - ensure you're not rushing decision-making",
        "Energy slightly lower - avoid extending trading hours",
      ],
      strengths: [
        "Consistent routine execution",
        "Maintained focus despite reduced sleep",
        "Good emotional control",
      ],
    },
    overallScore: 75,
    stagesCompleted: 5,
  })

  // Den 3 - Slabší den (72%)
  data.push({
    date: format(subDays(today, 2), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-3",
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      sleepQuality: 6,
      sleepHours: 6.5,
      energyLevel: 7,
      stressLevel: 5,
      focus: 7,
      physicalHealth: 6,
      emotionalState: 7,
      exercised: false,
      exerciseType: "none",
      exerciseDuration: 0,
      meditationTime: 5,
      morningRoutine: false,
      score: 72,
      recommendation: "Moderate readiness. Be extra cautious and reduce position sizes.",
    },
    intention: {
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      goals: "Trade only if A++ setup appears, otherwise take day off",
      maxRiskPercent: 1,
      emotionalGoal: "patient",
      strategy: "Wait for perfect setups, no FOMO",
    },
    plan: {
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      primarySetup: "High Probability Only",
      pairs: ["EUR/USD"],
      timeframe: "4H",
      entryRules: "Only trade with all confirmations aligned",
      exitRules: "Quick exit if setup invalidated",
      keyLevels: "EUR/USD: 1.0900 key support",
      maxRisk: 1,
    },
    trades: [],
    insights: {
      keyInsights: [
        "Sleep quality declining - this impacts your decision-making accuracy",
        "Lower focus and energy levels detected - high-risk environment for trading",
        "Lack of morning routine execution is correlated with reduced readiness score",
      ],
      predictions: [
        "Probability of overtrading or poor trade selection increases by 35% today",
        "Recommend reducing position sizes or taking a break from active trading",
      ],
      recommendations: [
        "Consider NO-TRADE day or paper trading only to preserve capital",
        "Prioritize recovery - get 8+ hours of sleep tonight and resume routine",
        "If trading, reduce position sizes by 50% and focus on A+ setups only",
        "Extra meditation or relaxation would help manage stress levels",
      ],
      riskFactors: [
        "Significantly reduced sleep quality impacts risk assessment ability",
        "Stress level elevation combined with lower focus is concerning pattern",
        "No morning routine increases emotional decision-making risk",
      ],
      strengths: [
        "You're aware of your condition - awareness is first step to recovery",
        "Willingness to take cautious approach shows maturity",
      ],
    },
    overallScore: 72,
    stagesCompleted: 4,
  })

  // Den 4 - Recovery den (70%)
  data.push({
    date: format(subDays(today, 3), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-4",
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      sleepQuality: 5,
      sleepHours: 6,
      energyLevel: 6,
      stressLevel: 6,
      focus: 6,
      physicalHealth: 5,
      emotionalState: 6,
      exercised: false,
      exerciseType: "none",
      exerciseDuration: 0,
      meditationTime: 0,
      morningRoutine: false,
      score: 70,
      recommendation: "Low readiness. Consider taking a break or paper trading only.",
    },
    intention: {
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      goals: "Focus on recovery, no pressure to trade",
      maxRiskPercent: 0.5,
      emotionalGoal: "calm",
      strategy: "Observation day - watch markets, no trades unless perfect",
    },
    plan: {
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      primarySetup: "Observation Mode",
      pairs: ["EUR/USD", "GBP/USD"],
      timeframe: "Daily",
      entryRules: "Only if absolutely perfect setup",
      exitRules: "Quick exit at first sign of trouble",
      keyLevels: "Market observation only",
      maxRisk: 0.5,
    },
    trades: [
      {
        id: "demo-t4",
        pair: "USD/CAD",
        type: "Long",
        entry: 1.342,
        exit: 1.338,
        pnl: -200,
        mood: 5,
        confidence: 6,
      },
    ],
    insights: {
      keyInsights: [
        "Recovery day initiated - readiness at minimum acceptable threshold",
        "Loss taken today is attributed to low mental state, not strategy failure",
        "Pattern detected: insufficient sleep always correlates with losing days",
      ],
      predictions: [
        "With 8+ hours tonight, tomorrow readiness should improve dramatically",
        "Recovery protocol today will set up excellent trading conditions tomorrow",
      ],
      recommendations: [
        "IMPORTANT: Take full rest day today - prioritize sleep recovery",
        "Implement strict morning routine tomorrow regardless of tiredness",
        "This is temporary setback - mental recovery is investment in future wins",
        "Review today's loss not as failure but as data point for recovery science",
      ],
      riskFactors: [
        "Severely compromised mental and physical state",
        "Risk of revenge trading tomorrow if loss isn't mentally processed",
        "Continued trading despite low readiness will compound losses",
      ],
      strengths: [
        "You caught yourself before bigger losses occurred",
        "Taking observation approach shows wisdom",
        "Small loss is acceptable price for learning",
      ],
    },
    overallScore: 70,
    stagesCompleted: 5,
  })

  // Den 5 - Silný comeback (80%)
  data.push({
    date: format(subDays(today, 4), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-5",
      date: format(subDays(today, 4), "yyyy-MM-dd"),
      sleepQuality: 9,
      sleepHours: 8.5,
      energyLevel: 9,
      stressLevel: 3,
      focus: 9,
      physicalHealth: 9,
      emotionalState: 9,
      exercised: true,
      exerciseType: "gym",
      exerciseDuration: 60,
      meditationTime: 20,
      morningRoutine: true,
      score: 80,
      recommendation: "Outstanding readiness! Perfect mental state for high-performance trading.",
    },
    intention: {
      date: format(subDays(today, 4), "yyyy-MM-dd"),
      goals: "Execute flawlessly, trust the process, maximum 4 trades",
      maxRiskPercent: 2,
      emotionalGoal: "focused",
      strategy: "Momentum trades on major pairs, ride the trends",
    },
    plan: {
      date: format(subDays(today, 4), "yyyy-MM-dd"),
      primarySetup: "Trend Continuation",
      pairs: ["AUD/USD", "NZD/USD"],
      timeframe: "4H",
      entryRules: "Enter on pullbacks to moving average with momentum confirmation",
      exitRules: "Trail stops, let winners run",
      keyLevels: "AUD/USD: 0.6650 support, 0.6720 target",
      maxRisk: 2,
    },
    trades: [
      {
        id: "demo-t5",
        pair: "AUD/USD",
        type: "Long",
        entry: 0.665,
        exit: 0.672,
        pnl: 840,
        mood: 9,
        confidence: 9,
      },
    ],
    insights: {
      keyInsights: [
        "Recovery successful! All metrics show significant improvement from yesterday",
        "Peak performance day - sleep recovery combined with full routine created ideal conditions",
        "Strong recovery demonstrates that discipline trumps current market conditions",
      ],
      predictions: [
        "Momentum from today should carry into tomorrow if routine maintained",
        "Recovery trade of $840 more than compensates for yesterday's $200 loss",
        "Win rate should tick up as mental state improves",
      ],
      recommendations: [
        "Document today's successful execution as reference for similar future situations",
        "Maintain the sleep and routine discipline that led to this recovery",
        "Use today's confidence wisely - scale positions conservatively, not aggressively",
        "This is proof that recovery protocol works - apply same method next time",
      ],
      riskFactors: [
        "Slight overconfidence risk after strong comeback - avoid revenge trades",
        "Don't assume tomorrow will be equally strong - maintain discipline",
      ],
      strengths: [
        "Outstanding mental recovery and discipline",
        "Peak physical and mental performance achieved",
        "Excellent trade execution - took full advantage of setup",
        "Proved resilience through recovery cycle",
      ],
    },
    overallScore: 80,
    stagesCompleted: 5,
  })

  // Den 6 - Dobrý den (80%)
  data.push({
    date: format(subDays(today, 5), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-6",
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      sleepQuality: 8,
      sleepHours: 8,
      energyLevel: 8,
      stressLevel: 3,
      focus: 8,
      physicalHealth: 8,
      emotionalState: 8,
      exercised: true,
      exerciseType: "walk",
      exerciseDuration: 30,
      meditationTime: 15,
      morningRoutine: true,
      score: 80,
      recommendation: "Great readiness! Maintain consistency and stick to your rules.",
    },
    intention: {
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      goals: "Stay patient, quality over quantity, respect risk limits",
      maxRiskPercent: 1.5,
      emotionalGoal: "patient",
      strategy: "Scalp on London open, quick in and out",
    },
    plan: {
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      primarySetup: "London Open Volatility",
      pairs: ["GBP/USD", "EUR/GBP"],
      timeframe: "15M",
      entryRules: "Quick entries on initial volatility spike",
      exitRules: "Take quick profits, don't overstay",
      keyLevels: "GBP/USD: 1.2700 pivot",
      maxRisk: 1.5,
    },
    trades: [
      {
        id: "demo-t6",
        pair: "GBP/USD",
        type: "Short",
        entry: 1.272,
        exit: 1.268,
        pnl: 280,
        mood: 8,
        confidence: 8,
      },
    ],
    insights: {
      keyInsights: [
        "Consistency building - second consecutive day of high readiness achieved",
        "Sleep pattern optimization is now establishing as baseline",
        "Morning routine has become automatic - habit formation complete",
      ],
      predictions: [
        "Consistency like this typically leads to +3% monthly improvement in win rate",
        "Next loss will be easier to recover from due to established recovery protocol",
      ],
      recommendations: [
        "Continue 8-hour sleep schedule - it's now your competitive advantage",
        "Maintain routine even on weekends for optimal long-term performance",
        "Scalp trade execution today shows good adaptability - nice session",
        "Document this 2-day strong streak in your trader journal",
      ],
      riskFactors: [
        "Only risk: maintaining discipline if streak breaks",
        "Complacency about established routine",
      ],
      strengths: [
        "Strong consistency in execution",
        "Excellent adaptability across different trading sessions",
        "Sustained high energy and mental clarity",
        "Building strong habit foundation",
      ],
    },
    overallScore: 80,
    stagesCompleted: 5,
  })

  // Den 7 - Solid den (73%)
  data.push({
    date: format(subDays(today, 6), "yyyy-MM-dd"),
    morningCheck: {
      id: "demo-mc-7",
      date: format(subDays(today, 6), "yyyy-MM-dd"),
      sleepQuality: 7,
      sleepHours: 7,
      energyLevel: 7,
      stressLevel: 4,
      focus: 7,
      physicalHealth: 7,
      emotionalState: 7,
      exercised: false,
      exerciseType: "none",
      exerciseDuration: 0,
      meditationTime: 10,
      morningRoutine: true,
      score: 73,
      recommendation: "Solid readiness. Stick to your A-setups and follow the plan.",
    },
    intention: {
      date: format(subDays(today, 6), "yyyy-MM-dd"),
      goals: "Trade with discipline, no overtrading, journal everything",
      maxRiskPercent: 1.5,
      emotionalGoal: "analytical",
      strategy: "Technical setups on major pairs, clean entries only",
    },
    plan: {
      date: format(subDays(today, 6), "yyyy-MM-dd"),
      primarySetup: "Technical Patterns",
      pairs: ["USD/JPY", "EUR/JPY"],
      timeframe: "1H",
      entryRules: "Pattern completion + volume + momentum alignment",
      exitRules: "Target previous swing highs/lows",
      keyLevels: "USD/JPY: 148.00 key level",
      maxRisk: 1.5,
    },
    trades: [
      {
        id: "demo-t7",
        pair: "USD/JPY",
        type: "Long",
        entry: 148.2,
        exit: 148.9,
        pnl: 700,
        mood: 7,
        confidence: 7,
      },
    ],
    insights: {
      keyInsights: [
        "Weekly summary: 7-day average readiness of 75.3 - excellent baseline",
        "Only 2 losses (Days 3-4) during low readiness period - proved risk management works",
        "Recovery cycle completed successfully - full portfolio reset achieved",
      ],
      predictions: [
        "Next week should show 65%+ win rate based on readiness pattern",
        "Maintaining routine will result in cumulative +5-8% monthly performance boost",
      ],
      recommendations: [
        "Schedule weekly recovery meeting to review readiness vs performance correlation",
        "Week 2 focus: Build on consistency foundation, increase position sizes on high-readiness days",
        "Prioritize routine compliance above all else - it's your primary edge",
        "Consider this week as your readiness baseline for future comparison",
      ],
      riskFactors: [
        "Next week complacency - maintain discipline despite positive results",
        "Don't increase position sizes too aggressively",
      ],
      strengths: [
        "Demonstrated recovery protocol effectiveness",
        "Strong week overall with 5 wins, 2 losses = 71% win rate",
        "Total weekly P&L: +$2,669 profit with excellent risk management",
        "Habit formation across sleep, routine, and meditation established",
      ],
    },
    overallScore: 73,
    stagesCompleted: 5,
  })

  return data
}

export const generateVirtualDailyTrackerData = generateDemoDailyTrackerData
