'use client'

import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export function TrialStatusBanner() {
  const router = useRouter()

  return (
    <Alert className='border-blue-500 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg'>
      <Zap className='h-4 w-4 text-blue-600' />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className='text-blue-800'>
          <p className="font-semibold text-sm md:text-base">Vyzkousej naplno zdarma</p>
        </div>
        <Button 
          onClick={() => router.push('/upgrade')}
          size="sm" 
          className='bg-blue-600 hover:bg-blue-700 text-white'
        >
          Vyzkousej 14 dní zdarma
        </Button>
      </AlertDescription>
    </Alert>
  )
}
