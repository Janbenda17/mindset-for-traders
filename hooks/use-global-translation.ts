'use client'

import { useEffect } from 'react'
import { isEnglishDomain, czechToEnglishMap } from '@/lib/translation-map'

/**
 * Global translation hook that translates all Czech text to English
 * when accessed from .ai, .au, or .com domains
 * 
 * For .cz domain: keeps all text in Czech (no translation)
 */
export function useGlobalTranslation() {
  useEffect(() => {
    if (!isEnglishDomain()) {
      console.log('[v0] Czech domain detected (.cz), keeping text in Czech')
      return
    }

    console.log('[v0] English domain detected, starting text translation')

    // Helper function to escape special regex characters
    const escapeRegex = (str: string) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    // Function to translate all text nodes in the DOM
    const translateDOM = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )

      let node
      let translatedCount = 0

      while ((node = walker.nextNode())) {
        const originalText = node.nodeValue || ''
        let translatedText = originalText

        // Replace each Czech phrase with English equivalent
        Object.entries(czechToEnglishMap).forEach(([czech, english]) => {
          if (translatedText.includes(czech)) {
            const escapedCzech = escapeRegex(czech)
            translatedText = translatedText.replace(new RegExp(escapedCzech, 'g'), english)
            translatedCount++
          }
        })

        // Update node if translation occurred
        if (translatedText !== originalText) {
          node.nodeValue = translatedText
        }
      }

      console.log(`[v0] Translation complete: ${translatedCount} text nodes translated`)
    }

    // Initial translation
    setTimeout(() => {
      translateDOM()
    }, 0)

    // Observe DOM changes and re-translate
    const observer = new MutationObserver((mutations) => {
      // Only translate new nodes that were added
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const originalText = node.nodeValue || ''
              let translatedText = originalText

              Object.entries(czechToEnglishMap).forEach(([czech, english]) => {
                if (translatedText.includes(czech)) {
                  const escapedCzech = escapeRegex(czech)
                  translatedText = translatedText.replace(new RegExp(escapedCzech, 'g'), english)
                }
              })

              if (translatedText !== originalText) {
                node.nodeValue = translatedText
              }
            }
          })
        }
      })
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
}
