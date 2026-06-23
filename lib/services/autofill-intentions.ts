import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return supabaseInstance
}

export interface DailyIntention {
  maxDailyLoss: number
  targetTrades: number
  focusAreas: string[]
  keyBehaviors: string[]
  emotionalFocal: string
}

/**
 * Autofill daily intentions using AI analysis
 * This is an alias for generateDailyIntentions with database saving
 */
export async function autofillDailyIntentions(
  userId: string,
  date: string
): Promise<DailyIntention | null> {
  try {
    console.log('[v0] Autofilling daily intentions for user:', userId, 'date:', date)

    // Get morning check for psychological state
    const { data: morningCheck } = await getSupabase()
      .from('morning_checks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    // Generate intentions based on morning state
    const intentions = await generateDailyIntentions(
      userId,
      morningCheck?.emotionalState || 'neutral'
    )

    // Save to database
    const saved = await saveIntentions(userId, intentions)

    if (saved) {
      console.log('[v0] Daily intentions autofilled and saved')
      return intentions
    }

    return null
  } catch (error) {
    console.error('[v0] Autofill daily intentions error:', error)
    return null
  }
}

/**
 * Generate daily intentions based on morning psychological state and trading profile
 */
export async function generateDailyIntentions(
  userId: string,
  morningPsychState: string,
  trainingIdentity?: any
): Promise<DailyIntention> {
  try {
    // Get user's trading profile to understand their edge
    const { data: profile, error: profileError } = await getSupabase()
      .from('trading_identity')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[v0] Error fetching profile:', profileError)
    }

    // Get recent performance to calibrate risk
    const { data: recentTrades, error: tradesError } = await getSupabase()
      .from('mt4_trades')
      .select('profit')
      .eq('user_id', userId)
      .gte('close_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('close_time', { ascending: false })
      .limit(20)

    if (tradesError) {
      console.error('[v0] Error fetching recent trades:', tradesError)
    }

    // Analyze psychological state to determine risk tolerance today
    const riskAdjustment = calculateRiskAdjustment(morningPsychState)
    
    // Determine trading parameters based on profile and psychology
    const accountSize = profile?.account_size || 10000
    const baseRiskPercentage = profile?.risk_per_trade || 1
    const maxDailyLoss = Math.round(accountSize * (baseRiskPercentage / 100) * riskAdjustment)

    // Calibrate trade count based on morning state and recent performance
    const targetTrades = calculateTargetTrades(morningPsychState, recentTrades || [])

    // Generate focus areas specific to user's edge
    const focusAreas = generateFocusAreas(profile, morningPsychState, recentTrades || [])

    // Generate key behaviors to maintain edge
    const keyBehaviors = generateKeyBehaviors(focusAreas)

    // Determine emotional focal point for the day
    const emotionalFocal = generateEmotionalFocal(morningPsychState, profile)

    return {
      maxDailyLoss,
      targetTrades,
      focusAreas,
      keyBehaviors,
      emotionalFocal
    }
  } catch (error) {
    console.error('[v0] Error generating intentions:', error)
    return getDefaultIntentions()
  }
}

/**
 * Calculate risk adjustment based on psychological state
 */
function calculateRiskAdjustment(psychState: string): number {
  const state = psychState.toLowerCase()
  
  // Reduce risk on bad psychological days
  if (state.includes('anxious') || state.includes('tired') || state.includes('frustrated')) {
    return 0.5 // 50% of normal risk
  }
  
  if (state.includes('nervous') || state.includes('uncertain')) {
    return 0.75 // 75% of normal risk
  }
  
  if (state.includes('confident') || state.includes('focused') || state.includes('alert')) {
    return 1.0 // Full risk
  }
  
  if (state.includes('overconfident') || state.includes('aggressive')) {
    return 0.6 // Reduce overconfidence
  }

  return 0.85 // Default slightly conservative
}

/**
 * Calculate appropriate trade count for the day
 */
function calculateTargetTrades(psychState: string, recentTrades: any[]): number {
  const state = psychState.toLowerCase()
  
  // Calculate recent win rate
  const recentWins = recentTrades.filter(t => t.profit > 0).length
  const winRate = recentTrades.length > 0 ? recentWins / recentTrades.length : 0.5

  let baseTarget = 3
  
  // Reduce on bad psychology
  if (state.includes('anxious') || state.includes('frustrated')) {
    baseTarget = 2
  } else if (state.includes('nervous')) {
    baseTarget = 2
  } else if (state.includes('confident')) {
    baseTarget = 4
  }

  // Adjust based on recent performance
  if (winRate > 0.6) {
    baseTarget = Math.max(baseTarget, 5)
  } else if (winRate < 0.3) {
    baseTarget = 2
  }

  return baseTarget
}

/**
 * Generate focus areas based on user's edge and current state
 */
function generateFocusAreas(profile: any, psychState: string, recentTrades: any[]): string[] {
  const areas: string[] = []

  // Always include risk management
  areas.push('Strict 1% per trade risk management')

  // Add edge-specific focus
  if (profile?.edge_type) {
    switch (profile.edge_type) {
      case 'scalping':
        areas.push('Quick execution on support/resistance levels')
        areas.push('Stay in trade max 15 minutes')
        break
      case 'swing':
        areas.push('4H or daily timeframe setup confirmation')
        areas.push('Hold through trend, don\'t exit early')
        break
      case 'news':
        areas.push('Pre-market news alignment check')
        areas.push('Respect news event volatility')
        break
    }
  }

  // Add psychological focus
  if (psychState.toLowerCase().includes('fomo')) {
    areas.push('Wait for YOUR setup - don\'t chase')
  }
  
  if (psychState.toLowerCase().includes('uncertain')) {
    areas.push('Only mechanical setups today, no discretion')
  }

  return areas.length > 0 ? areas : ['Follow your trading plan', 'Manage risk first']
}

/**
 * Generate key behaviors to maintain during the day
 */
function generateKeyBehaviors(focusAreas: string[]): string[] {
  return [
    'No revenge trades after a loss',
    'Check in every 2 hours - are you still following the plan?',
    'Set phone reminder for max daily loss limit',
    'Journal each trade immediately',
    ...focusAreas.slice(0, 2)
  ]
}

/**
 * Determine the emotional focal point for the day
 */
function generateEmotionalFocal(psychState: string, profile: any): string {
  const state = psychState.toLowerCase()
  
  if (state.includes('anxious')) {
    return 'Calm execution - one trade at a time'
  }
  
  if (state.includes('frustrated')) {
    return 'Patience - wait for clear setups, no forcing trades'
  }
  
  if (state.includes('fomo')) {
    return 'Discipline - your edge hasn\'t changed, skip invalid setups'
  }
  
  if (state.includes('overconfident')) {
    return 'Humility - protect capital first, profits follow'
  }

  return 'Focus on process, trust your system'
}

/**
 * Default intentions if generation fails
 */
function getDefaultIntentions(): DailyIntention {
  return {
    maxDailyLoss: 100,
    targetTrades: 3,
    focusAreas: [
      'Strict risk management - 1% per trade',
      'Wait for high-probability setups',
      'Follow trading plan exactly'
    ],
    keyBehaviors: [
      'No revenge trades',
      'Journal each trade',
      'Set daily loss limit alarm'
    ],
    emotionalFocal: 'Process over profits - trust the system'
  }
}

/**
 * Save generated intentions to database
 */
export async function saveIntentions(
  userId: string,
  intentions: DailyIntention
): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from('daily_intentions')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        max_daily_loss: intentions.maxDailyLoss,
        target_trade_count: intentions.targetTrades,
        focus_areas: intentions.focusAreas,
        key_behaviors: intentions.keyBehaviors,
        emotional_focal_point: intentions.emotionalFocal,
        ai_generated: true
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('[v0] Error saving intentions:', error)
    return false
  }
}
