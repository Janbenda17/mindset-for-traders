export type Language = 'cs' | 'en'

export function getLanguageFromHost(host: string): Language {
  // Remove port if present
  const domain = host.split(':')[0]
  
  if (domain.endsWith('.cz') || domain === 'localhost') {
    return 'cs'
  }
  
  if (domain.endsWith('.ai')) {
    return 'en'
  }
  
  // Default to Czech for local development
  return 'cs'
}

export function getLanguageFromBrowser(): Language {
  if (typeof window === 'undefined') return 'cs'
  
  const lang = navigator.language.split('-')[0]
  return lang === 'cs' ? 'cs' : 'en'
}

// Czech translations
export const cs = {
  // Navigation
  nav: {
    home: 'Domů',
    dashboard: 'Nástěnka',
    dailyTracker: 'Daily Tracker',
    mindtrader: 'MindTrader AI',
    weeklyReview: 'Týdenní Review',
    failLog: 'Fail Log',
    teamClub: 'Team Club',
    login: 'Přihlášení',
    signup: 'Registrace',
    logout: 'Odhlášení',
  },
  
  // Common
  common: {
    loading: 'Načítání...',
    error: 'Chyba',
    success: 'Úspěšně',
    cancel: 'Zrušit',
    save: 'Uložit',
    delete: 'Smazat',
    edit: 'Upravit',
    back: 'Zpět',
  },

  // Home page
  home: {
    title: 'Tvůj Trading Psycholog',
    subtitle: 'Pro tradery co chtějí opravdu vydělávat',
    stats1: '9/10 - Obchodníků má psychické problémy',
    stats2: '↓42% - Méně revenge tradingu',
    stats3: '24/7 - AI analýza tvého mindetu',
    
    feature1Title: 'Daily Tracker',
    feature1Desc: 'Každé ráno zaznamenáš svůj psychologický stav v 30 sekund. AI detekuje tvoje podmínky na obchodování. Vidíš patterny kdy máš edge a kdy bys měl sedět. Výsledek? Méně ztracených dní a 5x přesnější rozhodnutí. Jsme oba věděli že psychika rozhoduje. Teď ji máš pod kontrolou.',
    feature1Highlight: '5x přesnější rozhodnutí',
    
    feature2Title: 'MindTrader AI',
    feature2Desc: 'Tvůj 24/7 personal trading coach. Máš FOMO ? Revenge trading tě láká? Ptej se. AI analyzuje tvůj psychologický stav v reálném čase a dáva ti konkrétní, science-based rady. Nejde o motivační hlášky - jde o to zastavit tě než uděláš katastrofální chybu z emocí.',
    feature2Highlight: 'Realtime psychologické rady',
    
    feature3Title: 'Weekly Review',
    feature3Desc: 'Každý pátek se podíváš zpět. AI ti ukáže tvá slabá místa, win rate, psychologické vzorce. Vidíš kde konkrétně padáš - zda je to strategické nebo psychologické selhání. Pak dostaneš konkrétní, akční plán co změnit příští týden.',
    feature3Highlight: 'AI poznatky + akční plán',
    
    feature4Title: 'Fail Log',
    feature4Desc: 'Zaznamenáš všechny své prohry. AI analyzuje jestli to byla strategie, psychika, nebo hloupá chyba. Učíš se z každé ztráty. Fail Log tě učí být lepším traderem - bez stejných chyb znovu. Sem patří všechny prohry. Nechraň si ego.',
    feature4Highlight: 'Nechraň si ego - nauč se ze ztrát!',
    
    feature5Title: 'Team Club',
    feature5Desc: 'Elitní komunita top traderů. Sdílení obchodů, diskuse, accountability. Když selžeš – někdo tě vytáhne. Když vyhraješ – slavíme spolu. Tady se nestydíš za fail. Tady se z něj stáváš lepší.',
    feature5Highlight: 'Komunita > Solo trading',
    
    ctaText: 'Zbývá ti jen psychika. Strategii už máš. Počítej s tím že prvních 30 dní bude tvrdých. Pak už to popluje na autopilota.',
    ctaButton: 'Začít zdarma - 14 dní',
    moreInfo: 'Více informací',
  },

  // Dashboard
  dashboard: {
    title: 'Nástěnka',
    totalCapital: 'Celkový kapitál',
    monthlyPL: 'Měsíční P/L',
    readiness: 'Aktuální Readiness',
    xp: 'Tvůj XP',
    tools: 'Nástroje',
    tradeNow: 'Obchodovat teď',
  },

  // Daily Tracker
  dailyTracker: {
    title: 'Daily Tracker',
    morningCheck: 'Ranní Check',
    howFeel: 'Jak se cítíš dnes?',
    focusLevel: 'Úroveň Fokus',
    stressLevel: 'Úroveň Stresu',
    confidence: 'Sebevědomí',
    energyLevel: 'Energetická Úroveň',
    submit: 'Odeslat',
    tradingStatus: 'Tvůj Trading Status Dnes',
    detailedAnalysis: 'Detailní Trading Analýza',
  },
}

// English translations
export const en = {
  // Navigation
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    dailyTracker: 'Daily Tracker',
    mindtrader: 'MindTrader AI',
    weeklyReview: 'Weekly Review',
    failLog: 'Fail Log',
    teamClub: 'Team Club',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
  },
  
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
  },

  // Home page
  home: {
    title: 'Your Trading Psychologist',
    subtitle: 'For traders who actually want to make money',
    stats1: '9/10 - Traders have psychological issues',
    stats2: '↓42% - Less revenge trading',
    stats3: '24/7 - AI analysis of your mindset',
    
    feature1Title: 'Daily Tracker',
    feature1Desc: 'Every morning record your psychological state in 30 seconds. AI detects your trading conditions. See patterns when you have edge and when you should sit. Result? Fewer losing days and 5x more precise decisions. We both knew psychology decides. Now you have it under control.',
    feature1Highlight: '5x more precise decisions',
    
    feature2Title: 'MindTrader AI',
    feature2Desc: 'Your 24/7 personal trading coach. Got FOMO? Tempted by revenge trading? Ask. AI analyzes your psychological state in real-time and gives you concrete, science-based advice. Not about motivational talk - it\'s about stopping you before you make a catastrophic emotional mistake.',
    feature2Highlight: 'Real-time psychological guidance',
    
    feature3Title: 'Weekly Review',
    feature3Desc: 'Every Friday you look back. AI shows you your weak spots, win rate, psychological patterns. You see exactly where you fail - whether it\'s strategic or psychological. Then you get a concrete, actionable plan for what to change next week.',
    feature3Highlight: 'AI insights + action plan',
    
    feature4Title: 'Fail Log',
    feature4Desc: 'Record all your losses. AI analyzes whether it was strategy, psychology, or just a stupid mistake. You learn from every loss. Fail Log teaches you to be a better trader - no repeating the same mistakes. All losses go here. Don\'t protect your ego.',
    feature4Highlight: 'Don\'t protect your ego - learn from losses!',
    
    feature5Title: 'Team Club',
    feature5Desc: 'Elite community of top traders. Share trades, discuss strategies, accountability. When you fail – someone pulls you up. When you win – we celebrate together. Here you\'re not ashamed of failure. Here you become better because of it.',
    feature5Highlight: 'Community > Solo trading',
    
    ctaText: 'All that\'s left is psychology. You have the strategy. Expect the first 30 days to be tough. After that it runs on autopilot.',
    ctaButton: 'Start Free - 14 Days',
    moreInfo: 'More Info',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    totalCapital: 'Total Capital',
    monthlyPL: 'Monthly P/L',
    readiness: 'Current Readiness',
    xp: 'Your XP',
    tools: 'Tools',
    tradeNow: 'Trade Now',
  },

  // Daily Tracker
  dailyTracker: {
    title: 'Daily Tracker',
    morningCheck: 'Morning Check',
    howFeel: 'How are you feeling today?',
    focusLevel: 'Focus Level',
    stressLevel: 'Stress Level',
    confidence: 'Confidence',
    energyLevel: 'Energy Level',
    submit: 'Submit',
    tradingStatus: 'Your Trading Status Today',
    detailedAnalysis: 'Detailed Trading Analysis',
  },
}

export function getTranslations(language: Language) {
  return language === 'cs' ? cs : en
}
