// Complete Czech to English translations mapping
export const czechToEnglishMap: Record<string, string> = {
  // Dashboard
  'Nástěnka': 'Dashboard',
  'Celkový kapitál': 'Total Capital',
  'Měsíční P/L': 'Monthly P/L',
  'Aktuální Readiness': 'Current Readiness',
  'Tvůj XP': 'Your XP',
  'Nástroje': 'Tools',
  'Vyzkoušet teď': 'Try Now',
  'Otevřít': 'Open',
  'Sleduj svůj trading progres a optimalizuj svůj mindset': 'Track your trading progress and optimize your mindset',
  'Jsi v Live Mode!': 'You are in Live Mode!',
  'Tvoje reálná data jsou nyní aktivní': 'Your real data is now active',

  // Daily Tracker
  'Daily Tracker': 'Daily Tracker',
  'Ranní Check': 'Morning Check',
  'Odeslat': 'Submit',
  'Nastavíš si pravidla dne – AI tě hlídá, abys je dodržel': 'Set your daily rules - AI watches to ensure you follow them',

  // MindTrader AI
  'MindTrader AI': 'MindTrader AI',
  'Varuje tě v reálném čase před emočními chybami': 'Warns you in real-time about emotional mistakes',

  // Weekly Review
  'Weekly Review': 'Weekly Review',
  'Shrne týden a řekne, co změnit příště': 'Summarizes the week and tells you what to change next',
  'TrendingUp': 'TrendingUp',

  // Loss Reset
  'Loss Reset': 'Loss Reset',
  'Rychlý reset po ztrátě – zpět do hry bez revenge': 'Quick reset after loss - back in the game without revenge',

  // Team Club
  'Team Club': 'Team Club',
  'Žebříček': 'Leaderboard',
  'Disciplína Leaderboard': 'Discipline Leaderboard',
  'Diskuse': 'Discussion',
  'Obchodníci': 'Traders',

  // Navigation
  'Domů': 'Home',
  'Přihlášení': 'Login',
  'Registrace': 'Sign Up',
  'Odhlášení': 'Logout',
  'Můj Účet': 'My Account',
  'Nastavení': 'Settings',
  'Pomoc': 'Help',

  // Common
  'Načítání...': 'Loading...',
  'Chyba': 'Error',
  'Úspěšně': 'Success',
  'Zrušit': 'Cancel',
  'Uložit': 'Save',
  'Smazat': 'Delete',
  'Upravit': 'Edit',
  'Zpět': 'Back',
  'Pokračovat': 'Continue',
  'Potvrzit': 'Confirm',

  // Readiness
  'Výborné': 'Excellent',
  'Dobré': 'Good',
  'Špatné': 'Poor',
  'Spánek': 'Sleep',
  'Stres': 'Stress',
  'Rutina': 'Routine',
  'Výživa': 'Nutrition',
  'Nálada': 'Mood',

  // Common phrases
  'Nejsou žádná data': 'No data available',
  'Něco se pokazilo': 'Something went wrong',
  'Zkus znovu': 'Try again',
  'Zavřít': 'Close',
}

export function getEnglishText(czechText: string, isEnglishDomain: boolean): string {
  if (!isEnglishDomain) return czechText
  return czechToEnglishMap[czechText] || czechText
}

export function isEnglishDomain(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  const isEnglish = hostname.endsWith('.ai') || hostname.endsWith('.au') || hostname.endsWith('.com') || hostname.includes('mindtrader') || hostname.includes('localhost')
  console.log('[v0] Domain detection - hostname:', hostname, 'isEnglish:', isEnglish)
  return isEnglish
}
