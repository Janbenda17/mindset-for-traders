'use client'

import { useSubscription } from '@/contexts/subscription-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TrialStatusBanner() {
  const { plan, isActive } = useSubscription()
  const router = useRouter()

  if (plan !== 'premium' || !isActive) {
    return null
  }

  return (
    <Alert className='border-blue-500 bg-gradient-to-r from-blue-500/10 to-purple-500/10'>
      <Zap className='h-4 w-4 text-blue-600' />
      <AlertDescription className="flex items-center justify-between">
        <div className='text-blue-800'>
          <p className="font-semibold">Testuj naplno zdarma</p>
        </div>
        <Button 
          onClick={() => router.push('/upgrade')}
          size="sm" 
          className='bg-blue-600 hover:bg-blue-700'
        >
          Vyzkousej 14 dní zdarma
        </Button>
      </AlertDescription>
    </Alert>
  )
}
