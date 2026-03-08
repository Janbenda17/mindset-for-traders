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
    dashboard: 'Dashboard',
    dailyTracker: 'Denní Tracker',
    mindtrader: 'MindTrader AI',
    weeklyReview: 'Týdenní Přehled',
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
}

export function getTranslations(language: Language) {
  return language === 'cs' ? cs : en
}
