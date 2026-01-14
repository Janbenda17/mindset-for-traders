// User-scoped localStorage to prevent cross-account data mixing

export function scopedKey(userId: string, key: string): string {
  if (!userId) {
    console.warn(`[storage] Attempted to create scoped key without userId for key: ${key}`)
    return "" // Return empty string if userId missing
  }
  return `mindtrader:${userId}:${key}`
}

export function getScoped(userId: string, key: string): string | null {
  if (typeof window === "undefined") return null
  if (!userId) return null // Don't read if no userId

  const fullKey = scopedKey(userId, key)
  const value = localStorage.getItem(fullKey)

  if (value === null) {
    const legacyValue = localStorage.getItem(key)
    if (legacyValue !== null) {
      console.log(`[storage] Migrating legacy key "${key}" to scoped key for user ${userId}`)
      localStorage.setItem(fullKey, legacyValue)
      localStorage.removeItem(key) // Remove legacy key after migration
      return legacyValue
    }
  }

  return value
}

export function setScoped(userId: string, key: string, value: string): void {
  if (typeof window === "undefined") return
  if (!userId) {
    console.warn(`[storage] Attempted to write without userId for key: ${key}`)
    return // No-op if no userId
  }

  const fullKey = scopedKey(userId, key)
  localStorage.setItem(fullKey, value)
}

export function removeScoped(userId: string, key: string): void {
  if (typeof window === "undefined") return
  if (!userId) return

  const fullKey = scopedKey(userId, key)
  localStorage.removeItem(fullKey)
}

export function clearUserScopedData(userId: string): void {
  if (typeof window === "undefined") return
  if (!userId) return

  const prefix = `mindtrader:${userId}:`
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key))
  console.log(`[storage] Cleared ${keysToRemove.length} scoped keys for user ${userId}`)
}
