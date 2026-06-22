'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page has been consolidated into /account/integrations (single unified
// MetaTrader connect flow). Keep this route alive as a redirect so old links
// and bookmarks still work.
export default function SettingsIntegrationsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/account/integrations')
  }, [router])

  return null
}
