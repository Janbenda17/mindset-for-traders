import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "ráno"
  else if (hour < 17) return "odpoledne"
  else return "večer"
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0
  return (wins / total) * 100
}

export function calculateProfitFactor(grossProfit: number, grossLoss: number): number {
  if (grossLoss === 0) return grossProfit > 0 ? Number.POSITIVE_INFINITY : 0
  return Math.abs(grossProfit / grossLoss)
}

export function calculateSharpeRatio(returns: number[], riskFreeRate = 0): number {
  if (returns.length === 0) return 0

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return 0
  return (avgReturn - riskFreeRate) / stdDev
}

export function generateChartData(days = 30) {
  const data = []
  const startValue = 10000
  let currentValue = startValue

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.45) * 200 // Slight positive bias
    currentValue += change

    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      value: Math.round(currentValue),
      change: change,
      percentage: ((currentValue - startValue) / startValue) * 100,
    })
  }

  return data
}

export function generateMoodData(days = 30) {
  const data = []

  for (let i = 0; i < days; i++) {
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      mood: Math.floor(Math.random() * 4) + 6, // 6-9
      confidence: Math.floor(Math.random() * 4) + 6, // 6-9
      stress: Math.floor(Math.random() * 4) + 2, // 2-5
      discipline: Math.floor(Math.random() * 3) + 7, // 7-9
    })
  }

  return data
}

export function isLiveMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("trader-mindset-live-mode") === "true"
}

export function toggleLiveMode(): void {
  if (typeof window === "undefined") return
  const currentMode = isLiveMode()
  localStorage.setItem("trader-mindset-live-mode", (!currentMode).toString())
  window.location.reload()
}
