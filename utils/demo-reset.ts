// Demo Account Reset Utility
// This function resets all localStorage data to default demo state

export function resetDemoAccount() {
  // Clear all existing data
  const keysToKeep = ["trader-mindset-user", "trader-mindset-registered-users"]
  const allKeys = Object.keys(localStorage)

  allKeys.forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key)
    }
  })

  // Set virtual mode
  localStorage.setItem("trader-mindset-mode", "virtual")

  // Set onboarding as completed
  localStorage.setItem("trader-mindset-onboarding-completed", "true")

  // Initialize demo daily tracker
  localStorage.setItem("daily-tracker-entries", JSON.stringify([]))

  // Initialize demo journal
  localStorage.setItem("journal-entries", JSON.stringify([]))

  // Initialize demo gamification
  const demoGamification = {
    xp: 0,
    level: 1,
    achievements: [],
    dailyXPLog: {},
  }
  localStorage.setItem("trader-mindset-gamification", JSON.stringify(demoGamification))

  // Initialize demo team club
  localStorage.setItem("teamclub-feed", JSON.stringify([]))
  localStorage.setItem("teamclub-questions", JSON.stringify([]))
  localStorage.setItem("teamclub-success", JSON.stringify([]))
  localStorage.setItem("teamclub-challenges", JSON.stringify([]))
  localStorage.setItem("teamclub-buddies", JSON.stringify([]))

  // Initialize demo fail log
  localStorage.setItem("fail-log-entries", JSON.stringify([]))

  // Initialize demo trading goals
  localStorage.setItem("trading-goals", JSON.stringify([]))

  // Initialize demo routines
  localStorage.setItem("routine-history", JSON.stringify([]))

  // Initialize demo weekly reviews
  localStorage.setItem("weekly-reviews", JSON.stringify([]))

  console.log("[v0] Demo account reset complete")
}
