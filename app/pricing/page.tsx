"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Pricing() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user === undefined) return // Still loading

    if (user === null) {
      // Not authenticated - redirect to signup
      router.push("/signup")
    } else {
      // Authenticated - redirect to upgrade
      router.push("/upgrade")
    }
  }, [user, router])

  return null
}
