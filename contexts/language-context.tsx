"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations as i18nTranslations, type TranslationKey } from "@/lib/i18n"

type Language = "cs" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isEn: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  cs: {
    // MindTrader AI
    "mindtrader.title": "MindTrader AI",
    "mindtrader.subtitle": "Tvůj osobní psychologický kouč",
    "mindtrader.welcomeMessage":
      "👋 Ahoj! Jsem MindTrader AI, tvůj osobní psychologický kouč pro trading. Jak se dnes cítíš? Můžeme si promluvit o tvém trading mindset, emocích nebo jakémkoli problému, který tě trápí.",
    "mindtrader.recoveryMessage":
      "🧘 Detekoval jsem, že máš náročný den. Pojďme na chvíli zpomalit. Udělej si 5 minut pauzu, zavři oči a zhluboka dýchej. Trading může počkat. Tvoje mentální pohoda je důležitější.\n\nChceš si o tom popovídat?",
    "mindtrader.limitReached": "Limit zpráv dosažen",
    "mindtrader.upgradeForUnlimited": "Upgraduj na Premium pro neomezené konverzace!",
    "mindtrader.responseReceived": "Odpověď přijata",
    "mindtrader.aiResponded": "MindTrader AI odpověděl na tvou zprávu",
    "mindtrader.errorMessage": "Nepodařilo se získat odpověď od AI",
    "mindtrader.premiumRequired": "Premium vyžadováno",
    "mindtrader.upgradeForReports": "Upgraduj na Premium pro generování reportů",
    "mindtrader.reportGenerated": "Report vygenerován",
    "mindtrader.reportDownloaded": "Report byl stažen",
    "mindtrader.thinking": "MindTrader přemýšlí...",
    "mindtrader.inputPlaceholder": "Napiš svou zprávu...",
    "mindtrader.inputHint": "Tip: Shift+Enter pro nový řádek, Enter pro odeslání",
    "mindtrader.recoveryModeActive": "🧘 Recovery Mode aktivní - Zaměřuji se na tvou mentální pohodu",

    // AI Configuration
    "aiConfig.title": "Nastavení AI",
    "aiConfig.mode": "Režim AI",
    "aiConfig.personality": "Osobnost AI",

    // AI Modes
    "aiMode.coach": "🧠 Mind Coach",
    "aiMode.coachDesc": "Psychologická podpora",
    "aiMode.analyst": "📊 Trade Analyst",
    "aiMode.analystDesc": "Analýza obchodů",
    "aiMode.mentor": "👨‍🏫 Mentor Assistant",
    "aiMode.mentorDesc": "Pomoc mentorům",

    // AI Personalities
    "aiPersonality.calm": "🧘 Klidný Mentor",
    "aiPersonality.calmDesc": "Klidný a terapeutický",
    "aiPersonality.strict": "⚡ Přísný Kouč",
    "aiPersonality.strictDesc": "Přímý a výkonnostní",
    "aiPersonality.analytical": "🔬 Analytický Expert",
    "aiPersonality.analyticalDesc": "Datově orientovaný",
    "aiPersonality.balanced": "💬 Vyvážený Kouč",
    "aiPersonality.balancedDesc": "Empatie + výkon",

    // Readiness
    "readiness.score": "Readiness Score",
    "readiness.excellent": "Výborné",
    "readiness.good": "Dobré",
    "readiness.poor": "Špatné",
    "readiness.sleep": "Spánek",
    "readiness.stress": "Stres",
    "readiness.routine": "Rutina",
    "readiness.nutrition": "Výživa",
    "readiness.mood": "Nálada",

    // Quick Actions
    "quickActions.title": "Rychlé akce",
    "quickActions.generateInsights": "Generovat Insights",
    "quickActions.generateReport": "Generovat Report",
    "quickActions.clearChat": "Vymazat chat",

    // Quick Prompts
    "quickPrompts.title": "Rychlé otázky",
    "quickPrompts.lossRecovery": "Jak zvládnout ztrátu?",
    "quickPrompts.fearManagement": "Jak bojovat se strachem?",
    "quickPrompts.disciplineHelp": "Jak zlepšit disciplínu?",
    "quickPrompts.planViolation": "Proč porušuji plán?",
    "quickPrompts.fomoHelp": "Jak se zbavit FOMO?",
    "quickPrompts.riskManagement": "Problémy s risk managementem",
    "quickPrompts.mentalStrength": "Jak zlepšit mentální odolnost?",
    "quickPrompts.revengeTrade": "Revenge trading - jak se vyhnout?",

    // Navigation & Pages
    "nav.overview": "Přehled",
    "nav.mindset": "Mindset",
    "nav.patterns": "Vzorce",
    "nav.actionPlan": "Plán akcí",
    "nav.feed": "Feed",
    "nav.challenges": "Výzvy",
    "nav.studyBuddies": "Study Buddies",
    "nav.topQA": "Top Q&A",
    "nav.leaderboard": "Žebříček",
    "nav.connect": "Připojit",

    // Dashboard Stats
    "stats.successNotifications": "Notifikace úspěchu",
    "stats.avgCommunityMood": "Průměrná nálada komunity",
    "stats.positive": "Pozitivní",
    "stats.avgSuccessRate": "Průměr. Úspěšnost",
    "stats.communityShowingImprovement": "Zlepšování komunity",
    "stats.thisWeek": "Tento týden",
    "stats.feelingFrustrated": "Cítí se frustrací",
    "stats.dueToLosses": "Z důvodu ztrát",
    "stats.aiRecommendation": "AI Doporučení",
    "stats.aiPoweredStudyBuddyMatching": "AI párování Study Buddies",

    // User Profile
    "profile.streak": "Série",
    "profile.days": "dní",
    "profile.timezone": "Časové pásmo",
    "profile.tradingHours": "Obchodní hodiny",
    "profile.aiCompatibility": "AI Kompatibilita",

    // Common
    "common.premium": "Premium",
    "common.free": "Zdarma",
    "common.error": "Chyba",
  },
  en: {
    // MindTrader AI
    "mindtrader.title": "MindTrader AI",
    "mindtrader.subtitle": "Your personal trading psychologist",
    "mindtrader.welcomeMessage":
      "👋 Hi! I'm MindTrader AI, your personal trading psychologist. How are you feeling today? We can talk about your trading mindset, emotions, or any challenge you're facing.",
    "mindtrader.recoveryMessage":
      "🧘 I've detected you're having a tough day. Let's slow down for a moment. Take a 5-minute break, close your eyes, and breathe deeply. Trading can wait. Your mental well-being is more important.\n\nDo you want to talk about it?",
    "mindtrader.limitReached": "Message limit reached",
    "mindtrader.upgradeForUnlimited": "Upgrade to Premium for unlimited conversations!",
    "mindtrader.responseReceived": "Response received",
    "mindtrader.aiResponded": "MindTrader AI responded to your message",
    "mindtrader.errorMessage": "Failed to get AI response",
    "mindtrader.premiumRequired": "Premium required",
    "mindtrader.upgradeForReports": "Upgrade to Premium for report generation",
    "mindtrader.reportGenerated": "Report generated",
    "mindtrader.reportDownloaded": "Report has been downloaded",
    "mindtrader.thinking": "MindTrader is thinking...",
    "mindtrader.inputPlaceholder": "Type your message...",
    "mindtrader.inputHint": "Tip: Shift+Enter for new line, Enter to send",
    "mindtrader.recoveryModeActive": "🧘 Recovery Mode active - Focusing on your mental well-being",

    // AI Configuration
    "aiConfig.title": "AI Settings",
    "aiConfig.mode": "AI Mode",
    "aiConfig.personality": "AI Personality",

    // AI Modes
    "aiMode.coach": "🧠 Mind Coach",
    "aiMode.coachDesc": "Psychological support",
    "aiMode.analyst": "📊 Trade Analyst",
    "aiMode.analystDesc": "Trade analysis",
    "aiMode.mentor": "👨‍🏫 Mentor Assistant",
    "aiMode.mentorDesc": "Help for mentors",

    // AI Personalities
    "aiPersonality.calm": "🧘 Calm Mentor",
    "aiPersonality.calmDesc": "Calm and therapeutic",
    "aiPersonality.strict": "⚡ Strict Coach",
    "aiPersonality.strictDesc": "Direct and performance-focused",
    "aiPersonality.analytical": "🔬 Analytical Expert",
    "aiPersonality.analyticalDesc": "Data-oriented",
    "aiPersonality.balanced": "💬 Balanced Coach",
    "aiPersonality.balancedDesc": "Empathy + performance",

    // Readiness
    "readiness.score": "Readiness Score",
    "readiness.excellent": "Excellent",
    "readiness.good": "Good",
    "readiness.poor": "Poor",
    "readiness.sleep": "Sleep",
    "readiness.stress": "Stress",
    "readiness.routine": "Routine",
    "readiness.nutrition": "Nutrition",
    "readiness.mood": "Mood",

    // Quick Actions
    "quickActions.title": "Quick Actions",
    "quickActions.generateInsights": "Generate Insights",
    "quickActions.generateReport": "Generate Report",
    "quickActions.clearChat": "Clear chat",

    // Quick Prompts
    "quickPrompts.title": "Quick Questions",
    "quickPrompts.lossRecovery": "How to handle a loss?",
    "quickPrompts.fearManagement": "How to overcome fear?",
    "quickPrompts.disciplineHelp": "How to improve discipline?",
    "quickPrompts.planViolation": "Why do I break my plan?",
    "quickPrompts.fomoHelp": "How to avoid FOMO?",
    "quickPrompts.riskManagement": "Risk management issues",
    "quickPrompts.mentalStrength": "How to improve mental strength?",
    "quickPrompts.revengeTrade": "Revenge trading - how to avoid?",

    // Navigation & Pages
    "nav.overview": "Overview",
    "nav.mindset": "Mindset",
    "nav.patterns": "Patterns",
    "nav.actionPlan": "Action Plan",
    "nav.feed": "Feed",
    "nav.challenges": "Challenges",
    "nav.studyBuddies": "Study Buddies",
    "nav.topQA": "Top Q&A",
    "nav.leaderboard": "Leaderboard",
    "nav.connect": "Connect",

    // Dashboard Stats
    "stats.successNotifications": "Success Notifications",
    "stats.avgCommunityMood": "Avg. Community Mood",
    "stats.positive": "Positive",
    "stats.avgSuccessRate": "Avg. Success Rate",
    "stats.communityShowingImprovement": "Community Showing Improvement",
    "stats.thisWeek": "This Week",
    "stats.feelingFrustrated": "Feeling Frustrated",
    "stats.dueToLosses": "Due to Losses",
    "stats.aiRecommendation": "AI Recommendation",
    "stats.aiPoweredStudyBuddyMatching": "AI-Powered Study Buddy Matching",

    // User Profile
    "profile.streak": "Streak",
    "profile.days": "days",
    "profile.timezone": "Timezone",
    "profile.tradingHours": "Trading Hours",
    "profile.aiCompatibility": "AI Compatibility",

    // Common
    "common.premium": "Premium",
    "common.free": "Free",
    "common.error": "Error",
  },
}

function detectLanguage(): Language {
  if (typeof window === "undefined") {
    // Server-side: default to English
    return "en"
  }

  // Client-side: Hostname has priority over env var
  const hostname = window.location.hostname
  
  // .cz domain = Czech
  if (hostname.endsWith(".cz")) {
    return "cs"
  }
  
  // .ai and other domains = English (default)
  return "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectLanguage())

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    window.dispatchEvent(new Event("language-changed"))
  }

  const t = (key: string): string => {
    const oldVal = translations[language][key as keyof (typeof translations)["cs"]]
    if (oldVal) return oldVal
    const newVal = i18nTranslations[language][key as TranslationKey]
    if (newVal) return newVal
    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isEn: language === "en" }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    if (typeof window === "undefined") {
      return {
        language: "cs" as const,
        setLanguage: () => {},
        t: (key: string) => key,
        isEn: false,
      }
    }
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

// Convenience hook that returns translation function for the current language
export function useT() {
  const { language } = useLanguage()
  return (key: TranslationKey): string => {
    return i18nTranslations[language][key] ?? i18nTranslations['cs'][key] ?? key
  }
}
