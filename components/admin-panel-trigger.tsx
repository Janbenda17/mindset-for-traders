"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminTradersOverview } from "@/components/admin-traders-overview"
import { Shield } from "lucide-react"

export function AdminPanelTrigger() {
  const [clickCount, setClickCount] = useState(0)
  const [showButton, setShowButton] = useState(false)

  const handleClick = () => {
    setClickCount((prev) => prev + 1)

    if (clickCount >= 4) {
      setShowButton(true)
    }

    // Reset after 5 seconds
    setTimeout(() => {
      if (clickCount < 5) {
        setClickCount(0)
      }
    }, 5000)
  }

  if (!showButton) {
    return (
      <div
        className="fixed bottom-4 right-4 w-2 h-2 bg-transparent cursor-pointer z-50"
        onClick={handleClick}
        title="Admin Access"
      />
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AdminTradersOverview>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-900/90 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/90 backdrop-blur-sm shadow-lg"
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </AdminTradersOverview>
    </div>
  )
}
