"use client"

import { toast } from "@/hooks/use-toast"

/**
 * Centralized storage client with localStorage fallback
 * In LIVE mode with user, always prefers Supabase via API
 * In DEMO mode or no user, uses localStorage
 */

export class StorageClient {
  private userId: string | null
  private isLiveMode: boolean

  constructor(userId: string | null = null, isLiveMode: boolean = false) {
    this.userId = userId
    this.isLiveMode = isLiveMode
  }

  private getKey(key: string): string {
    if (!this.userId) {
      console.warn(`[StorageClient] No userId - using global key: ${key}`)
      return key
    }
    return `user-${this.userId}-${key}`
  }

  /**
   * Get data - uses localStorage
   * For API-backed data, components should call APIs directly
   */
  get<T>(key: string, fallback: T): T {
    try {
      const fullKey = this.getKey(key)
      const raw = localStorage.getItem(fullKey)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch (error) {
      console.error(`[StorageClient] Error reading ${key}:`, error)
      return fallback
    }
  }

  /**
   * Set data - stores in localStorage
   * For API-backed data, components should call APIs directly
   */
  set<T>(key: string, value: T): boolean {
    try {
      const fullKey = this.getKey(key)
      localStorage.setItem(fullKey, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`[StorageClient] Error writing ${key}:`, error)
      toast({
        title: "Chyba ukládání",
        description: "Nepodařilo se uložit data lokálně.",
        variant: "destructive",
      })
      return false
    }
  }

  remove(key: string): void {
    try {
      const fullKey = this.getKey(key)
      localStorage.removeItem(fullKey)
    } catch (error) {
      console.error(`[StorageClient] Error removing ${key}:`, error)
    }
  }

  clear(): void {
    if (!this.userId) {
      console.warn("[StorageClient] Cannot clear without userId")
      return
    }

    const prefix = `user-${this.userId}-`
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
    console.log(`[StorageClient] Cleared ${keysToRemove.length} keys for user ${this.userId}`)
  }
}

export function createStorageClient(userId: string | null, isLiveMode: boolean = false): StorageClient {
  return new StorageClient(userId, isLiveMode)
}
