"use client"

import { toast } from "@/hooks/use-toast"

/**
 * Centralized localStorage client with proper error handling and user isolation
 * ALL localStorage access should go through this client
 */

export class StorageClient {
  private userId: string | null

  constructor(userId: string | null = null) {
    this.userId = userId
  }

  private getKey(key: string): string {
    if (!this.userId) {
      console.warn(`[StorageClient] No userId - using global key: ${key}`)
      return key
    }
    return `user-${this.userId}-${key}`
  }

  get<T>(key: string, fallback: T): T {
    try {
      const fullKey = this.getKey(key)
      const raw = localStorage.getItem(fullKey)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch (error) {
      console.error(`[StorageClient] Error reading ${key}:`, error)
      toast({
        title: "Chyba načítání dat",
        description: "Nepodařilo se načíst uložená data. Používáme výchozí hodnoty.",
        variant: "destructive",
      })
      return fallback
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      const fullKey = this.getKey(key)
      localStorage.setItem(fullKey, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`[StorageClient] Error writing ${key}:`, error)
      toast({
        title: "Chyba ukládání",
        description: "Nepodařilo se uložit data. Zkontrolujte volné místo v prohlížeči.",
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

export function createStorageClient(userId: string | null): StorageClient {
  return new StorageClient(userId)
}
