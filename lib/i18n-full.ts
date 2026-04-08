export type TranslationKey = string

export const translations = {
  cs: {
    // Dashboard
    'dashboard.title': 'Nástěnka',
    'dashboard.totalCapital': 'Celkový kapitál',
    'dashboard.monthlyPL': 'Měsíční P/L',
    'dashboard.readiness': 'Aktuální Readiness',
    'dashboard.xp': 'Tvůj XP',
    'dashboard.tools': 'Nástroje',
    'dashboard.tryNow': 'Vyzkoušet teď',

    // Daily Tracker
    'dailyTracker.title': 'Daily Tracker',
    'dailyTracker.morningCheck': 'Ranní Check',
    'dailyTracker.submit': 'Odeslat',

    // Team Club
    'teamClub.title': 'Team Club',
    'teamClub.leaderboard': 'Žebříček',
    'teamClub.disciplineLeaderboard': 'Disciplína Leaderboard',

    // Navigation
    'nav.home': 'Domů',
    'nav.dashboard': 'Nástěnka',
    'nav.dailyTracker': 'Daily Tracker',
    'nav.mindtrader': 'MindTrader AI',
    'nav.weeklyReview': 'Weekly Review',
    'nav.failLog': 'Fail Log',
    'nav.teamClub': 'Team Club',

    // Common
    'common.loading': 'Načítání...',
    'common.error': 'Chyba',
    'common.success': 'Úspěšně',
  },
  
  en: {
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalCapital': 'Total Capital',
    'dashboard.monthlyPL': 'Monthly P/L',
    'dashboard.readiness': 'Current Readiness',
    'dashboard.xp': 'Your XP',
    'dashboard.tools': 'Tools',
    'dashboard.tryNow': 'Try Now',

    // Daily Tracker
    'dailyTracker.title': 'Daily Tracker',
    'dailyTracker.morningCheck': 'Morning Check',
    'dailyTracker.submit': 'Submit',

    // Team Club
    'teamClub.title': 'Team Club',
    'teamClub.leaderboard': 'Leaderboard',
    'teamClub.disciplineLeaderboard': 'Discipline Leaderboard',

    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.dailyTracker': 'Daily Tracker',
    'nav.mindtrader': 'MindTrader AI',
    'nav.weeklyReview': 'Weekly Review',
    'nav.failLog': 'Fail Log',
    'nav.teamClub': 'Team Club',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  }
} as const
