"use client"

import { supabase } from "@/lib/supabase/browser"
import { toast } from "@/hooks/use-toast"

/**
 * Migrates virtual (demo) data to LIVE database when user switches modes
 */

export async function migrateVirtualDataToLive(userId: string): Promise<boolean> {
  try {
    console.log("[Migration] Starting virtual → live data migration for user:", userId)

    // Read virtual data from localStorage
    const virtualTrades = JSON.parse(localStorage.getItem(`user-${userId}-mindtrader-trades`) || "[]")
    const virtualChecks = JSON.parse(localStorage.getItem(`user-${userId}-mindtrader-morning-checks`) || "[]")
    const virtualJournal = JSON.parse(localStorage.getItem(`user-${userId}-journal-entries`) || "[]")
    const virtualGoals = JSON.parse(localStorage.getItem(`user-${userId}-trading-goals`) || "[]")

    let migratedCount = 0

    // Migrate trades (as journal_entries with type: "trade")
    if (virtualTrades.length > 0) {
      const tradesToInsert = virtualTrades.map((trade: any) => ({
        user_id: userId,
        type: "trade",
        title: `${trade.pair || trade.symbol} ${trade.direction}`,
        date: trade.date,
        pair: trade.pair,
        direction: trade.direction,
        entry_price: trade.entryPrice,
        exit_price: trade.exitPrice,
        pnl: trade.pnl,
        mood: trade.mood,
        confidence: trade.confidence,
        notes: trade.notes,
        created_at: new Date().toISOString(),
      }))

      const { error: tradesError } = await supabase.from("journal_entries").insert(tradesToInsert)

      if (tradesError) {
        console.error("[Migration] Error migrating trades:", tradesError)
      } else {
        migratedCount += tradesToInsert.length
        console.log(`[Migration] Migrated ${tradesToInsert.length} trades`)
      }
    }

    // Migrate morning checks
    if (virtualChecks.length > 0) {
      const checksToInsert = virtualChecks.map((check: any) => ({
        user_id: userId,
        date: check.date,
        sleep_quality: check.sleepQuality,
        sleep_hours: check.sleepHours,
        energy_level: check.energyLevel,
        stress_level: check.stressLevel,
        focus: check.focus,
        score: check.score,
        created_at: new Date().toISOString(),
      }))

      const { error: checksError } = await supabase.from("morning_checks").insert(checksToInsert)

      if (checksError) {
        console.error("[Migration] Error migrating morning checks:", checksError)
      } else {
        migratedCount += checksToInsert.length
        console.log(`[Migration] Migrated ${checksToInsert.length} morning checks`)
      }
    }

    // Migrate journal entries
    if (virtualJournal.length > 0) {
      const journalToInsert = virtualJournal
        .filter((entry: any) => entry.type === "journal")
        .map((entry: any) => ({
          user_id: userId,
          type: "journal",
          title: entry.title || "Journal Entry",
          date: entry.date,
          content: entry.content || entry.notes,
          mood: entry.mood,
          created_at: new Date().toISOString(),
        }))

      if (journalToInsert.length > 0) {
        const { error: journalError } = await supabase.from("journal_entries").insert(journalToInsert)

        if (journalError) {
          console.error("[Migration] Error migrating journal:", journalError)
        } else {
          migratedCount += journalToInsert.length
          console.log(`[Migration] Migrated ${journalToInsert.length} journal entries`)
        }
      }
    }

    // Migrate goals
    if (virtualGoals.length > 0) {
      const goalsToInsert = virtualGoals.map((goal: any) => ({
        user_id: userId,
        title: goal.title,
        description: goal.description,
        target_value: goal.targetValue,
        current_value: goal.currentValue,
        deadline: goal.deadline,
        status: goal.status,
        created_at: new Date().toISOString(),
      }))

      const { error: goalsError } = await supabase.from("trading_goals").insert(goalsToInsert)

      if (goalsError) {
        console.error("[Migration] Error migrating goals:", goalsError)
      } else {
        migratedCount += goalsToInsert.length
        console.log(`[Migration] Migrated ${goalsToInsert.length} goals`)
      }
    }

    console.log(`[Migration] ✅ Successfully migrated ${migratedCount} items`)

    toast({
      title: "Migrace dokončena!",
      description: `Bylo úspěšně migrováno ${migratedCount} položek z demo režimu.`,
    })

    return true
  } catch (error) {
    console.error("[Migration] Fatal error:", error)
    toast({
      title: "Chyba migrace",
      description: "Nepodařilo se migrovat demo data. Kontaktujte podporu.",
      variant: "destructive",
    })
    return false
  }
}

export function offerMigration(userId: string): boolean {
  // Check if user has any virtual data worth migrating
  const virtualTrades = JSON.parse(localStorage.getItem(`user-${userId}-mindtrader-trades`) || "[]")
  const virtualChecks = JSON.parse(localStorage.getItem(`user-${userId}-mindtrader-morning-checks`) || "[]")
  const virtualJournal = JSON.parse(localStorage.getItem(`user-${userId}-journal-entries`) || "[]")

  const totalItems = virtualTrades.length + virtualChecks.length + virtualJournal.length

  return totalItems > 5 // Only offer if user has meaningful data
}
