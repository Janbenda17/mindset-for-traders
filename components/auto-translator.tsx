'use client'

import { useEffect } from 'react'
import { isEnglishDomain, czechToEnglishMap } from '@/lib/translation-map'

export function AutoTranslator() {
  useEffect(() => {
    if (!isEnglishDomain()) return

    const translate = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )

      let node
      while ((node = walker.nextNode())) {
        const text = node.nodeValue || ''
        
        // Check each czech phrase and replace
        Object.entries(czechToEnglishMap).forEach(([czech, english]) => {
          if (text.includes(czech)) {
            node.nodeValue = text.replace(new RegExp(czech, 'g'), english)
          }
        })
      }
    }

    // Run on mount
    translate()

    // Watch for DOM changes and re-run
    const observer = new MutationObserver(() => {
      translate()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
