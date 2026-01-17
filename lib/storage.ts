// User-scoped localStorage to prevent cross-account data mixing
// VIRTUAL mode: "virtual:<userId>:<key>"
// LIVE mode cache: "live:<userId>:<key>"

export type StorageScope = "virtual" | "live"

export function buildKey(scope: StorageScope, userId: string, key: string): string {
  if (!userId) {
    console.warn(`[storage] Attempted to create scoped key without userId for key: ${key}`)
    return ""
  }
  return `${scope}:${userId}:${key}`
}

export function scopedKey(userId: string, key: string): string {
  return buildKey("virtual", userId, key)
}

export function getScoped<T>(scope: StorageScope, userId: string, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  if (!userId) return fallback

  const fullKey = buildKey(scope, userId, key)
  if (!fullKey) return fallback

  try {
    const value = localStorage.getItem(fullKey)
    if (value === null) return fallback
    return JSON.parse(value) as T
  } catch (e) {
    console.warn(`[storage] Error parsing ${fullKey}:`, e)
    return fallback
  }
}

export function setScoped<T>(scope: StorageScope, userId: string, key: string, value: T): void {
  if (typeof window === "undefined") return
  if (!userId) {
    console.warn(`[storage] Attempted to write without userId for key: ${key}`)
    return
  }

  const fullKey = buildKey(scope, userId, key)
  if (!fullKey) return

  try {
    localStorage.setItem(fullKey, JSON.stringify(value))
  } catch (e) {
    console.warn(`[storage] Error writing ${fullKey}:`, e)
  }
}

export function removeScoped(scope: StorageScope, userId: string, key: string): void {
  if (typeof window === "undefined") return
  if (!userId) return

  const fullKey = buildKey(scope, userId, key)
  if (!fullKey) return

  localStorage.removeItem(fullKey)
}

export function clearUserScoped(userId: string): void {
  if (typeof window === "undefined") return
  if (!userId) return

  const prefixes = [`virtual:${userId}:`, `live:${userId}:`]
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      for (const prefix of prefixes) {
        if (key.startsWith(prefix)) {
          keysToRemove.push(key)
          break
        }
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key))
  console.log(`[storage] Cleared ${keysToRemove.length} scoped keys for user ${userId}`)
}

// Legacy compatibility - remove old non-scoped keys
export function migrateLegacyKeys(userId: string): void {
  if (typeof window === "undefined") return
  if (!userId) return

  const legacyKeys = ["trades", "journal-entries", "morning-checks", "weekly-reviews", "gamification-data"]
  let migratedCount = 0

  for (const key of legacyKeys) {
    const legacyValue = localStorage.getItem(key)
    if (legacyValue !== null) {
      // Migrate to virtual scope (safer default)
      const newKey = buildKey("virtual", userId, key)
      if (newKey) {
        localStorage.setItem(newKey, legacyValue)
        localStorage.removeItem(key)
        migratedCount++
        console.log(`[storage] Migrated legacy key "${key}" to "${newKey}"`)
      }
    }
  }

  if (migratedCount > 0) {
    console.log(`[storage] Migrated ${migratedCount} legacy keys for user ${userId}`)
  }
}
