"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

interface NotificationSettings {
  morningCheck: boolean
  dailyReview: boolean
  weeklyReview: boolean
  tradingAlerts: boolean
  enabled: boolean
}

interface NotificationsContextType {
  settings: NotificationSettings
  updateSettings: (settings: Partial<NotificationSettings>) => void
  requestPermission: () => Promise<boolean>
  hasPermission: boolean
  scheduleNotification: (title: string, body: string, time: Date) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

const STORAGE_KEY = "trader-mindset-notification-settings"

function getDefaultSettings(): NotificationSettings {
  return {
    morningCheck: true,
    dailyReview: true,
    weeklyReview: true,
    tradingAlerts: false,
    enabled: false,
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(getDefaultSettings())
  const [hasPermission, setHasPermission] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading notification settings:", error)
      }
    }

    // Check notification permission
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted")
    }
  }, [])

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      setHasPermission(true)
      updateSettings({ enabled: true })
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      const granted = permission === "granted"
      setHasPermission(granted)
      updateSettings({ enabled: granted })
      return granted
    }

    return false
  }, [updateSettings])

  const scheduleNotification = useCallback(
    (title: string, body: string, time: Date) => {
      if (!hasPermission || !settings.enabled) return

      const now = new Date()
      const delay = time.getTime() - now.getTime()

      if (delay > 0) {
        setTimeout(() => {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
              body,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              tag: title.toLowerCase().replace(/\s+/g, "-"),
              requireInteraction: false,
            })
          }
        }, delay)
      }
    },
    [hasPermission, settings.enabled],
  )

  // Schedule daily notifications
  useEffect(() => {
    if (!hasPermission || !settings.enabled) return

    const scheduleDaily = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Morning Check - 7:00 AM
      if (settings.morningCheck) {
        const morningTime = new Date(tomorrow)
        morningTime.setHours(7, 0, 0, 0)
        scheduleNotification(
          "Morning Check Reminder",
          "Start your day right! Complete your morning assessment.",
          morningTime,
        )
      }

      // Daily Review - 6:00 PM
      if (settings.dailyReview) {
        const eveningTime = new Date(tomorrow)
        eveningTime.setHours(18, 0, 0, 0)
        scheduleNotification(
          "Daily Review Reminder",
          "Time to review your trading day and journal your thoughts.",
          eveningTime,
        )
      }

      // Weekly Review - Sunday 8:00 PM
      if (settings.weeklyReview) {
        const sunday = new Date(tomorrow)
        const daysUntilSunday = (7 - sunday.getDay()) % 7
        sunday.setDate(sunday.getDate() + daysUntilSunday)
        sunday.setHours(20, 0, 0, 0)
        scheduleNotification(
          "Weekly Review Reminder",
          "Time for your weekly review! Reflect on your progress and plan ahead.",
          sunday,
        )
      }
    }

    scheduleDaily()
    const interval = setInterval(scheduleDaily, 24 * 60 * 60 * 1000) // Re-schedule every 24 hours

    return () => clearInterval(interval)
  }, [hasPermission, settings, scheduleNotification])

  return (
    <NotificationsContext.Provider
      value={{
        settings,
        updateSettings,
        requestPermission,
        hasPermission,
        scheduleNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
