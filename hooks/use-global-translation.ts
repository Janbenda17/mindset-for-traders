'use client'

import { useEffect } from 'react'

/**
 * Global translation hook - DISABLED
 * All text is now in English, no translation needed
 * This hook was used to translate Czech to English for .ai/.au/.com domains
 * but is no longer needed as the application is fully in English
 */
export function useGlobalTranslation() {
  useEffect(() => {
    // Translation disabled - application is fully in English
    console.log('[v0] Global translation disabled - application is fully in English')
    return () => {
      // Cleanup
    }
  }, [])
}
