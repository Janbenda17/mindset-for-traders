export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return `${formatShortDate(d)} ${formatTime(d)}`
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function isYesterday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

export function getRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  if (isToday(d)) {
    return "Dnes"
  }

  if (isYesterday(d)) {
    return "Včera"
  }

  const daysDiff = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff < 7) {
    return `Před ${daysDiff} dny`
  }

  if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7)
    return `Před ${weeks} ${weeks === 1 ? "týdnem" : "týdny"}`
  }

  return formatShortDate(d)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1
  const d2 = typeof date2 === "string" ? new Date(date2) : date2
  return d1.toDateString() === d2.toDateString()
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(d.setDate(diff))
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  return addDays(weekStart, 6)
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

export function getDateString(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function parseDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00")
}

export function isWeekend(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date
  const day = d.getDay()
  return day === 0 || day === 6
}

export function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    if (!isWeekend(current)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate

  if (isSameDay(start, end)) {
    return formatDate(start)
  }

  return `${formatShortDate(start)} - ${formatShortDate(end)}`
}
