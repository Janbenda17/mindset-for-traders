// Notification service for browser push notifications

export interface NotificationSettings {
  email: boolean
  push: boolean
  weeklyReport: boolean
  tradingAlerts: boolean
  dailyReminder: boolean
  psychologyInsights: boolean
}

// Request permission for browser notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false

  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

// Check if notifications are supported and permitted
export function canSendNotifications(): boolean {
  if (typeof window === "undefined") return false
  return "Notification" in window && Notification.permission === "granted"
}

// Send a browser notification
export function sendNotification(
  title: string,
  options?: {
    body?: string
    icon?: string
    tag?: string
    requireInteraction?: boolean
  },
): Notification | null {
  if (!canSendNotifications()) {
    return null
  }

  const notification = new Notification(title, {
    icon: options?.icon || "/icon-192.png",
    body: options?.body,
    tag: options?.tag,
    requireInteraction: options?.requireInteraction,
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  return notification
}

// Get notification settings from localStorage
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return {
      email: true,
      push: true,
      weeklyReport: true,
      tradingAlerts: true,
      dailyReminder: false,
      psychologyInsights: true,
    }
  }

  try {
    const userData = localStorage.getItem("user-data")
    if (userData) {
      const parsed = JSON.parse(userData)
      return (
        parsed.settings?.notifications || {
          email: true,
          push: true,
          weeklyReport: true,
          tradingAlerts: true,
          dailyReminder: false,
          psychologyInsights: true,
        }
      )
    }
  } catch (error) {
    console.error("Error loading notification settings:", error)
  }

  return {
    email: true,
    push: true,
    weeklyReport: true,
    tradingAlerts: true,
    dailyReminder: false,
    psychologyInsights: true,
  }
}

// Send trading alert notification
export function sendTradingAlert(message: string): void {
  const settings = getNotificationSettings()
  if (settings.tradingAlerts && settings.push) {
    sendNotification("Trading Alert", {
      body: message,
      tag: "trading-alert",
    })
  }
}

// Send psychology insight notification
export function sendPsychologyInsight(insight: string): void {
  const settings = getNotificationSettings()
  if (settings.psychologyInsights && settings.push) {
    sendNotification("Psychologický tip", {
      body: insight,
      tag: "psychology-insight",
    })
  }
}
