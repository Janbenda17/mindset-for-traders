export function exportData() {
  const data = {
    trades: JSON.parse(localStorage.getItem("mindtrader-trades") || "[]"),
    morningChecks: JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]"),
    dailyEntries: JSON.parse(localStorage.getItem("mindtrader-daily-entries") || "[]"),
    journalEntries: JSON.parse(localStorage.getItem("journal-entries") || "[]"),
    profile: JSON.parse(localStorage.getItem("trader-mindset-profile") || "null"),
    initialCapital: localStorage.getItem("initial-capital"),
    exportedAt: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `mindtrader-backup-${new Date().toISOString().split("T")[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
