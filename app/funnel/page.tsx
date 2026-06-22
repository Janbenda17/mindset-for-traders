'use client'

import { FunnelContainer } from '@/components/funnel/funnel-container'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

export default function FunnelPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user already completed funnel
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('funnel_completed')
      if (completed === 'true') {
        router.push('/daily-tracker')
      }
    }
    setIsLoading(false)
  }, [router])

  const handleComplete = () => {
    router.push('/daily-tracker')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <FunnelContainer
      userName={user?.email?.split('@')[0]}
      onComplete={handleComplete}
    />
  )
}
