'use server'

import { createClient } from '@supabase/supabase-js'
import { buildWeeklyReview, emptyWeeklyReview, type NormalizedTrade, type WeeklyReviewData } from '@/lib/weekly-review-insights'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type WeeklyReview = WeeklyReviewData

export async function generateWeeklyReview(userId: string): Promise<WeeklyReview> {
  try {
    console.log('[v0] Generating weekly review for user:', userId)

    // Real trades live in journal_entries (type = 'trade'), not a 'trade_records'
    // table - that table doesn't exist in the schema, which previously made
    // live-mode weekly review always fall back to an empty/generic review.
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: entries, error: tradesError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'trade')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (tradesError) console.warn('[v0] Trades fetch warning:', tradesError)

    const normalized: NormalizedTrade[] = (entries || [])
      .filter((e: any) => typeof e.pnl === 'number' || typeof e.profit_loss === 'number')
      .map((e: any) => ({
        date: e.date || e.close_date || e.open_date || e.created_at,
        pair: e.pair || e.symbol || null,
        direction: e.direction || e.trade_type || null,
        pnl: (e.pnl ?? e.profit_loss ?? 0) as number,
        mood: e.mood ?? e.mood_after ?? null,
        confidence: e.confidence ?? e.confidence_level ?? e.confidence_before ?? null,
        stress: e.stress ?? e.stress_level ?? null,
        discipline: e.discipline ?? null,
        emotionBefore: e.emotion_before ?? null,
        notes: e.notes ?? null,
        followedPlan: e.followed_plan ?? e.matched_plan ?? null,
      }))

    return buildWeeklyReview(normalized)
  } catch (err) {
    console.error('[v0] Error generating weekly review:', err)
    return emptyWeeklyReview()
  }
}
