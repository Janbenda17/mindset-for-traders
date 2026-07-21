import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { syncMetaApiAccount } from '@/lib/integrations/sync-account'

/**
 * GET /api/cron/mt5-sync
 * Vercel Cron Job - runs once a day. Vercel's Hobby plan rejects any cron
 * schedule that would fire more than once per day, so sub-daily scheduling
 * (e.g. every minute) isn't available unless the project is on a paid plan.
 * Syncs live MT5 trades and account data for all connected users.
 *
 * This previously lived at the repo-root `api/cron/mt5-sync.ts`, which is
 * NOT a route the Next.js App Router serves (only files under `app/api/**`
 * are), so this job never actually ran in production - connected accounts
 * never got their trades/balance synced after the initial connect.
 */
export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.headers.get('authorization')
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Create Supabase admin client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      },
    )

    // Get all users with MT5 integration enabled
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      // profiles' primary key is `user_id` - the table has no `id` column
      // at all (see scripts/001_create_users_and_profiles.sql), so selecting
      // `id` made Postgres reject this whole query with "column profiles.id
      // does not exist", which is why this cron job always 500'd.
      .select('user_id, metaapi_token, metaapi_account_id, metaapi_broker')
      .eq('trades_sync_enabled', true)
      .not('metaapi_account_id', 'is', null)

    if (profileError) {
      console.error('[v0] Failed to fetch profiles:', profileError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 },
      )
    }

    if (!profiles || profiles.length === 0) {
      console.log('[v0] No users with MT5 sync enabled')
      return NextResponse.json(
        { message: 'No users to sync', count: 0 },
        { status: 200 },
      )
    }

    console.log(`[v0] Syncing MT5 data for ${profiles.length} users...`)

    let syncedCount = 0
    let errorCount = 0

    // Process each user's MT5 data. Shared with the connect flow (see
    // confirmBrokerConnection in app/account/integrations/actions.ts) via
    // syncMetaApiAccount - that one runs once immediately on connect to
    // backfill history right away, this cron keeps everyone's data current
    // afterwards. Uses a wider history window than the connect-time sync
    // since this isn't blocking a user-facing request.
    for (const profile of profiles) {
      const userId = profile.user_id
      const accountId = profile.metaapi_account_id

      const result = await syncMetaApiAccount(supabase, userId, accountId, {
        closedTradesDaysBack: 730,
        closedTradesLimit: 1000,
      })

      if (!result.success) {
        console.error(`[v0] Failed to sync user ${userId}:`, result.error)
        errorCount++
        continue
      }

      syncedCount++
      console.log(`[v0] Synced MT5 data for user ${userId}: ${result.importedCount} closed trades`)
    }

    return NextResponse.json(
      {
        message: 'MT5 sync completed',
        synced: syncedCount,
        errors: errorCount,
        total: profiles.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[v0] MT5 sync cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 },
    )
  }
}
