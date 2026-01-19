/**
 * CRITICAL INITIALIZER FOR VIRTUAL MODE DEMO TRADES
 * 
 * This function ensures demo trades ALWAYS exist in localStorage
 * when a user is in VIRTUAL mode.
 * 
 * NO EXCEPTIONS. NO FALLBACKS. NO FAILURES.
 */

import { generateDemoTradesForMonth, type DemoTrade } from "./demo-trades"
import { type SimpleDemoTrade } from "./types" // Declare the SimpleDemoTrade variable

export function initVirtualTradingData(userId: string): boolean {
  console.log("[DEMO INIT] Running initialization...")
  console.log(`[DEMO INIT] isLiveMode=false, userId=${userId}`)

  if (typeof window === "undefined") {
    console.log("[DEMO INIT] FAILED - Server side render detected")
    return false
  }

  if (!userId) {
    console.log("[DEMO INIT] FAILED - No userId provided")
    return false
  }

  const storageKey = `virtual:${userId}:trades`
  const seedKey = `virtual:${userId}:trades-seed`

  try {
    const now = new Date()
    const currentSeed = `${now.getFullYear()}-${now.getMonth()}`
    
    // Check if trades already exist for current month
    const existing = localStorage.getItem(storageKey)
    const storedSeed = localStorage.getItem(seedKey)
    
    if (existing && storedSeed === currentSeed) {
      const parsed = JSON.parse(existing)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[DEMO INIT] ✓ Trades already exist (${parsed.length} trades)`)
        return true
      }
    }

    // Generate complete demo trades using existing generator
    console.log("[DEMO INIT] Generating new demo trades for current month...")
    
    const trades = generateDemoTradesForMonth(userId, now.getFullYear(), now.getMonth())

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(trades))
    localStorage.setItem(seedKey, currentSeed)
    
    console.log(`[DEMO INIT] ✓ Generated and saved ${trades.length} trades`)
    console.log(`[DEMO INIT] ✓ Storage key: ${storageKey}`)
    
    // Verify it was saved
    const verification = localStorage.getItem(storageKey)
    if (!verification) {
      console.error("[DEMO INIT] CRITICAL ERROR - Failed to save to localStorage!")
      return false
    }

    console.log("[DEMO INIT] ✓ Verification passed - trades successfully persisted")
    return true

  } catch (error) {
    console.error("[DEMO INIT] FAILED with error:", error)
    return false
  }
}

/**
 * Load demo trades from localStorage
 */
export function loadVirtualTrades(userId: string): DemoTrade[] {
  if (typeof window === "undefined") return []
  
  const storageKey = `virtual:${userId}:trades`
  const stored = localStorage.getItem(storageKey)
  
  if (!stored) {
    console.warn(`[DEMO LOAD] No trades found in localStorage for key: ${storageKey}`)
    return []
  }
  
  try {
    const parsed = JSON.parse(stored)
    console.log(`[DEMO LOAD] ✓ Loaded ${parsed.length} trades from localStorage`)
    return parsed
  } catch (error) {
    console.error("[DEMO LOAD] Failed to parse trades:", error)
    return []
  }
}
