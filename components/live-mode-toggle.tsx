"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Shield } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/hooks/use-toast"

interface OnboardingData {
  tradingStyle: "scalper" | "day-trader" | "swing-trader" | ""
  experience: "beginner" | "intermediate" | "advanced" | ""
  tradingYears: string
  mainMarkets: string[]
  riskLevel: "conservative" | "moderate" | "aggressive" | ""
  goals: string
  averageTradesPerWeek: string
}

const LiveModeToggle = () => {
  const { isLiveMode, switchToLive, switchToVirtual } = useData()
  const { toast } = useToast()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    tradingStyle: "",
    experience: "",
    tradingYears: "",
    mainMarkets: [],
    riskLevel: "",
    goals: "",
    averageTradesPerWeek: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("trader-mindset-profile")
      if (savedProfile) {
        setHasCompletedOnboarding(true)
      }
    }
  }, [])

  const resetProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("trader-mindset-profile")
      setHasCompletedOnboarding(false)
      setOnboardingData({
        tradingStyle: "",
        experience: "",
        tradingYears: "",
        mainMarkets: [],
        riskLevel: "",
        goals: "",
        averageTradesPerWeek: "",
      })
      toast({
        title: "Profil resetován",
        description: "Můžeš znovu projít onboarding",
      })
    }
  }

  const handleModeSwitch = () => {
    if (!isLiveMode) {
      switchToLive()
      toast({
        title: "Live Mode aktivován",
        description: "Nyní pracuješ s reálnými daty",
      })
    } else {
      switchToVirtual()
      toast({
        title: "Virtual Mode aktivován",
        description: "Nyní pracuješ s demo daty pro trénink",
      })
    }
  }

  const handleOnboardingNext = () => {
    if (onboardingStep < 5) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleOnboardingBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const completeOnboarding = () => {
    const profileData = {
      tradingStyle: onboardingData.tradingStyle,
      experience: onboardingData.experience,
      tradingYears: onboardingData.tradingYears,
      mainMarkets: onboardingData.mainMarkets,
      riskLevel: onboardingData.riskLevel,
      goals: onboardingData.goals,
      averageTradesPerWeek: onboardingData.averageTradesPerWeek,
      completedAt: new Date().toISOString(),
    }

    localStorage.setItem("trader-mindset-profile", JSON.stringify(profileData))
    setHasCompletedOnboarding(true)

    switchToLive()
    setShowOnboarding(false)

    toast({
      title: "Profil uložen!",
      description: "Live Mode aktivován - začni obchodovat",
    })

    window.dispatchEvent(new Event("profile-updated"))
  }

  const canProceed = () => {
    switch (onboardingStep) {
      case 1:
        return onboardingData.tradingStyle !== "" && onboardingData.experience !== ""
      case 2:
        return onboardingData.tradingYears !== "" && onboardingData.mainMarkets.length > 0
      case 3:
        return onboardingData.riskLevel !== "" && onboardingData.averageTradesPerWeek !== ""
      case 4:
        return true // Trading cíle jsou dobrovolné
      case 5:
        return true // Motivační zpráva
      default:
        return false
    }
  }

  const toggleMarket = (market: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      mainMarkets: prev.mainMarkets.includes(market)
        ? prev.mainMarkets.filter((m) => m !== market)
        : [...prev.mainMarkets, market],
    }))
  }

  return (
    <>
      <Button
        onClick={handleModeSwitch}
        variant="ghost"
        className={`
          relative overflow-hidden group
          ${
            isLiveMode
              ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border-2 border-green-500/50"
              : "bg-gradient-to-r from-red-600/20 to-rose-600/20 hover:from-red-600/30 hover:to-rose-600/30 border-2 border-red-500/50"
          }
          transition-all duration-300 px-4 py-2 rounded-lg
        `}
      >
        <div
          className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isLiveMode ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10" : "bg-gradient-to-r from-red-500/10 to-rose-500/10"}
        `}
        />

        <div className="relative flex items-center gap-2">
          {isLiveMode ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Zap className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-green-300">Live Mode</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <Shield className="w-4 h-4 text-red-400" />
              <span className="font-semibold text-red-300">Virtual Mode</span>
            </>
          )}
        </div>
      </Button>

      {/* Removed Onboarding Dialog as it's no longer needed */}
    </>
  )
}

export default LiveModeToggle
