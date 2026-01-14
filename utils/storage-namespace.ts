// Storage Namespace Utility
// Ensures each user has completely separate data

import { scopedKey as createScopedKey, getScoped, setScoped, removeScoped } from "@/lib/storage"

export function getUserStorageKey(baseKey: string): string {
  if (typeof window === "undefined") return baseKey

  // This function is deprecated - use scopedKey(userId, key) directly
  console.warn("[storage-namespace] DEPRECATED: Use lib/storage.ts scopedKey() instead")

  const userStr = localStorage.getItem("trader-mindset-user")
  if (!userStr) return baseKey

  try {
    const user = JSON.parse(userStr)
    return createScopedKey(user.id, baseKey)
  } catch {
    return baseKey
  }
}

export function getItem(key: string): string | null {
  if (typeof window === "undefined") return null
  return getScoped(key)
}

export function setItem(key: string, value: string): void {
  if (typeof window === "undefined") return
  setScoped(key, value)
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return
  removeScoped(key)
}

// Clear only data for current user
export function clearCurrentUserData(): void {
  if (typeof window === "undefined") return

  const userStr = localStorage.getItem("trader-mindset-user")
  if (!userStr) return

  try {
    const user = JSON.parse(userStr)
    const userPrefix = `user-${user.id}-`

    // Keys that should NOT be cleared (global settings)
    const keysToKeep = [
      "trader-mindset-user",
      "trader-mindset-registered-users",
      "trader-mindset-subscription",
      "trader-mindset-live-mode",
      "trader-mindset-language",
    ]

    const allKeys = Object.keys(localStorage)

    allKeys.forEach((key) => {
      // Skip global keys
      if (keysToKeep.includes(key)) return

      // Clear only keys for this user
      if (key.startsWith(userPrefix)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error clearing user data:", error)
  }
}
