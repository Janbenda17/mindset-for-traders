// Google Analytics tracking utility
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, eventData || {})
  }
}

export const trackPageView = (path: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      page_path: path,
      page_title: document.title,
    })
  }
}

// Track specific events
export const trackWaitlistSignup = (email: string) => {
  trackEvent("waitlist_signup", {
    email: email,
    timestamp: new Date().toISOString(),
  })
}

export const trackWaitlistClick = () => {
  trackEvent("waitlist_cta_click", {
    timestamp: new Date().toISOString(),
  })
}

export const trackDiscountCodeCopy = (code: string) => {
  trackEvent("discount_code_copy", {
    code: code,
    timestamp: new Date().toISOString(),
  })
}
