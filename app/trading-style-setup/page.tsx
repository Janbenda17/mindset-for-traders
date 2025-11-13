"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TradingStyleSelector } from "@/components/trading-style-selector"
import { useTradingStyle } from "@/contexts/trading-style-context"

export default function TradingStyleSetupPage() {
  const router = useRouter()
  const { isConfigured } = useTradingStyle()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (isConfigured) {
      router.push("/")
    }
  }, [isConfigured, router])

  const handleClose = () => {
    setOpen(false)
    router.push("/")
  }

  return <TradingStyleSelector open={open} onClose={handleClose} />
}
