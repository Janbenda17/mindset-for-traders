'use client'

import { useState } from 'react'
import { FunnelWelcome } from './funnel-welcome'
import { FunnelTraderProfile } from './funnel-trader-profile'
import { FunnelDailyRoutine } from './funnel-daily-routine'
import { FunnelBrokerConnect } from './funnel-broker-connect'

type FunnelStep = 'welcome' | 'profile' | 'routine' | 'broker' | 'complete'

interface FunnelContainerProps {
  userName?: string
  onComplete?: () => void
}

export function FunnelContainer({ userName, onComplete }: FunnelContainerProps) {
  const [step, setStep] = useState<FunnelStep>('welcome')
  const [data, setData] = useState<any>({})

  const handleProfileNext = (profile: string) => {
    setData(prev => ({ ...prev, profile }))
    setStep('routine')
  }

  const handleRoutineNext = (routine: any) => {
    setData(prev => ({ ...prev, routine }))
    setStep('broker')
  }

  const handleBrokerNext = () => {
    // Save to localStorage or send to backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('funnel_data', JSON.stringify(data))
      localStorage.setItem('funnel_completed', 'true')
    }
    onComplete?.()
  }

  const handleBack = () => {
    if (step === 'profile') setStep('welcome')
    else if (step === 'routine') setStep('profile')
    else if (step === 'broker') setStep('routine')
  }

  return (
    <>
      {step === 'welcome' && (
        <FunnelWelcome
          userName={userName}
          onNext={() => setStep('profile')}
        />
      )}
      {step === 'profile' && (
        <FunnelTraderProfile
          onNext={handleProfileNext}
          onBack={handleBack}
        />
      )}
      {step === 'routine' && (
        <FunnelDailyRoutine
          onNext={handleRoutineNext}
          onBack={handleBack}
        />
      )}
      {step === 'broker' && (
        <FunnelBrokerConnect
          onNext={handleBrokerNext}
          onBack={handleBack}
        />
      )}
    </>
  )
}
