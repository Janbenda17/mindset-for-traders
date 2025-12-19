"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Shield } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

const LiveModeToggle = () => {
  const { isLiveMode, switchToLive, switchToVirtual } = useData()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [supabase] = useState(() =>
    createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  )

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_status, subscription_tier, trial_ends_at")
          .eq("user_id", user.id)
          .maybeSingle()

        if (error) {
          console.error("[v0] Premium check error:", error.message)
          setIsPremium(false)
        } else if (!data) {
          console.log("[v0] No profile data found for user:", user.id)
          setIsPremium(false)
        } else {
          const hasActiveSub = data.subscription_status === "active"
          const hasActiveTrial = data.trial_ends_at && new Date(data.trial_ends_at) > new Date()

          setIsPremium(hasActiveSub || hasActiveTrial)
        }
      } catch (error) {
        console.error("[v0] Exception checking premium:", error)
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPremiumStatus()
  }, [user, supabase])

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

  if (isLoading) {
    return null
  }

  return (
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
  )
}

export default LiveModeToggle
