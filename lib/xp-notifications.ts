export function showXPNotification(xp: number, reason: string) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("xp-gained", {
      detail: {
        amount: xp,
        reason,
        leveledUp: false,
        newLevel: 0,
      },
    })
    window.dispatchEvent(event)
  }
}

export function showLevelUpNotification(level: number) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("xp-gained", {
      detail: {
        amount: 0,
        reason: "",
        leveledUp: true,
        newLevel: level,
      },
    })
    window.dispatchEvent(event)
  }
}
