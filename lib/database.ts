import { createClient } from "@/lib/supabase/client"

export type DatabaseTable =
  | "profiles"
  | "journal_entries"
  | "morning_checks"
  | "daily_tracker_entries"
  | "weekly_reviews"
  | "trading_routines"
  | "trading_goals"
  | "fail_log"
  | "trading_identity"
  | "rewards"
  | "team_club_posts"
  | "team_club_comments"
  | "team_club_likes"
  | "daily_stages"
  | "xp_progress"
  | "daily_intentions"
  | "trading_plans"
  | "mindtrader_sessions"

// Generic database operations with user_id enforcement
export const db = {
  // SELECT - always filtered by user_id (RLS handles this, but explicit is safer)
  async select<T>(
    table: DatabaseTable,
    userId: string,
    options?: {
      columns?: string
      filter?: Record<string, unknown>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
    },
  ): Promise<{ data: T[] | null; error: Error | null }> {
    const supabase = createClient()

    let query = supabase
      .from(table)
      .select(options?.columns || "*")
      .eq("user_id", userId)

    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? false,
      })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    return { data: data as T[] | null, error }
  },

  // SELECT ONE
  async selectOne<T>(
    table: DatabaseTable,
    userId: string,
    filter: Record<string, unknown>,
  ): Promise<{ data: T | null; error: Error | null }> {
    const supabase = createClient()

    let query = supabase.from(table).select("*").eq("user_id", userId)

    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query.maybeSingle()
    return { data: data as T | null, error }
  },

  // INSERT - always includes user_id
  async insert<T>(
    table: DatabaseTable,
    userId: string,
    data: Omit<T, "id" | "user_id" | "created_at" | "updated_at">,
  ): Promise<{ data: T | null; error: Error | null }> {
    const supabase = createClient()

    const { data: result, error } = await supabase
      .from(table)
      .insert({
        ...data,
        user_id: userId,
      })
      .select()
      .maybeSingle()

    return { data: result as T | null, error }
  },

  // UPSERT - insert or update based on conflict
  async upsert<T>(
    table: DatabaseTable,
    userId: string,
    data: Partial<T>,
    conflictColumns: string[],
  ): Promise<{ data: T | null; error: Error | null }> {
    const supabase = createClient()

    const { data: result, error } = await supabase
      .from(table)
      .upsert(
        {
          ...data,
          user_id: userId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: conflictColumns.join(","),
        },
      )
      .select()
      .maybeSingle()

    return { data: result as T | null, error }
  },

  // UPDATE - filtered by user_id + id
  async update<T>(
    table: DatabaseTable,
    userId: string,
    id: string,
    data: Partial<T>,
  ): Promise<{ data: T | null; error: Error | null }> {
    const supabase = createClient()

    const { data: result, error } = await supabase
      .from(table)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .maybeSingle()

    return { data: result as T | null, error }
  },

  // DELETE - filtered by user_id + id
  async delete(table: DatabaseTable, userId: string, id: string): Promise<{ error: Error | null }> {
    const supabase = createClient()

    const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", userId)

    return { error }
  },

  // Team Club special methods (can read all, but write own)
  teamClub: {
    async getPosts(limit = 50): Promise<{ data: unknown[] | null; error: Error | null }> {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("team_club_posts")
        .select("*, author:profiles(name)")
        .order("created_at", { ascending: false })
        .limit(limit)
      return { data, error }
    },

    async getComments(postId: string): Promise<{ data: unknown[] | null; error: Error | null }> {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("team_club_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
      return { data, error }
    },
  },

  // Analytics helpers - computed from real data only
  analytics: {
    async getTradeStats(userId: string, dateRange?: { start: string; end: string }) {
      const supabase = createClient()

      let query = supabase.from("journal_entries").select("*").eq("user_id", userId).eq("type", "trade")

      if (dateRange) {
        query = query.gte("date", dateRange.start).lte("date", dateRange.end)
      }

      const { data: trades, error } = await query

      if (error || !trades || trades.length === 0) {
        return {
          data: null,
          error: error || new Error("insufficient_data"),
          insufficientData: true,
        }
      }

      // Compute real stats only
      const stats = {
        totalTrades: trades.length,
        winningTrades: trades.filter((t) => (t.pnl || 0) > 0).length,
        losingTrades: trades.filter((t) => (t.pnl || 0) < 0).length,
        totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
      }

      stats.winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0

      const wins = trades.filter((t) => (t.pnl || 0) > 0)
      const losses = trades.filter((t) => (t.pnl || 0) < 0)

      stats.averageWin = wins.length > 0 ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length : 0

      stats.averageLoss =
        losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length) : 0

      return { data: stats, error: null, insufficientData: false }
    },
  },
}
