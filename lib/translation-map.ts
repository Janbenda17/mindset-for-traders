// Complete Czech to English translations mapping
export const czechToEnglishMap: Record<string, string> = {
  // Dashboard
  'Nástěnka': 'Dashboard',
  'Celkový kapitál': 'Total Capital',
  'Měsíční P/L': 'Monthly P/L',
  'Aktuální Readiness': 'Current Readiness',
  'Tvůj XP': 'Your XP',
  'Tvoje XP Skóre': 'Your XP Score',
  'Nástroje': 'Tools',
  'Tvoje nástroje': 'Your Tools',
  'Vyzkoušet teď': 'Try Now',
  'Otevřít': 'Open',
  'Sleduj svůj trading progres a optimalizuj svůj mindset': 'Track your trading progress and optimize your mindset',
  'Jsi v Live Mode!': 'You are in Live Mode!',
  'Tvoje reálná data jsou nyní aktivní': 'Your real data is now active',

  // Daily Tracker
  'Daily Tracker': 'Daily Tracker',
  'Denní Tracker': 'Daily Tracker',
  'Ranní Check': 'Morning Check',
  'Odeslat': 'Submit',
  'Jak se cítíš dnes?': 'How are you feeling today?',
  'Úroveň Fokus': 'Focus Level',
  'Úroveň Stresu': 'Stress Level',
  'Sebevědomí': 'Confidence',
  'Energetická Úroveň': 'Energy Level',
  'Tvůj Trading Status Dnes': 'Your Trading Status Today',
  'Detailní Trading Analýza': 'Detailed Trading Analysis',
  'Nastavíš si pravidla dne – AI tě hlídá, abys je dodržel': 'Set your daily rules - AI watches to ensure you follow them',

  // MindTrader AI
  'MindTrader AI': 'MindTrader AI',
  'Varuje tě v reálném čase před emočními chybami': 'Warns you in real-time about emotional mistakes',
  'MindTrader analyzuje tvoje emoce v reálném čase, detekuje tvá slabá místa a zastaví tě, než uděláš katastrofální chybu.': 'MindTrader analyzes your emotions in real-time, detects your weaknesses and stops you before you make a catastrophic mistake.',

  // Weekly Review
  'Weekly Review': 'Weekly Review',
  'Týdenní Review': 'Weekly Review',
  'Týdenní Přehled': 'Weekly Review',
  'Shrne týden a řekne, co změnit příště': 'Summarizes the week and tells you what to change next',

  // Fail Log
  'Fail Log': 'Fail Log',
  'Zaznamenáš všechny své prohry s kontextem. AI analyzuje jestli to byla strategie, psychika, nebo hloupá chyba.': 'Record all your losses with context. AI analyzes whether it was strategy, psychology, or just a stupid mistake.',

  // Loss Reset
  'Loss Reset': 'Loss Reset',
  'Rychlý reset po ztrátě – zpět do hry bez revenge': 'Quick reset after loss - back in the game without revenge',

  // Team Club
  'Team Club': 'Team Club',
  'Najdi partnera': 'Find Partner',
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
  'Zavřít': 'Close',
  'Ano': 'Yes',
  'Ne': 'No',

  // Readiness
  'Výborné': 'Excellent',
  'Dobré': 'Good',
  'Špatné': 'Poor',
  'Spánek': 'Sleep',
  'Stres': 'Stress',
  'Rutina': 'Routine',
  'Výživa': 'Nutrition',
  'Nálada': 'Mood',
  'Readiness': 'Readiness',

  // Common phrases
  'Nejsou žádná data': 'No data available',
  'Není zde žádná data': 'No data available',
  'Něco se pokazilo': 'Something went wrong',
  'Zkus znovu': 'Try again',
  'Zdá se, že na tomto zařízení není nic k zobrazení.': 'It looks like there\'s nothing to display on this device.',

  // Home page
  'Tvůj Trading Psycholog': 'Your Trading Psychologist',
  'Pro tradery co chtějí opravdu vydělávat': 'For traders who actually want to make money',
  '9/10 - Obchodníků má psychické problémy': '9/10 - Traders have psychological issues',
  '↓42% - Méně revenge tradingu': '↓42% - Less revenge trading',
  '24/7 - AI analýza tvého mindetu': '24/7 - AI analysis of your mindset',

  'Zbývá ti jen psychika. Strategii už máš. Počítej s tím že prvních 30 dní bude tvrdých. Pak už to popluje na autopilota.': 'All that\'s left is psychology. You have the strategy. Expect the first 30 days to be tough. After that it runs on autopilot.',
  'Začít zdarma - 14 dní': 'Start Free - 14 Days',
  'Více informací': 'More Info',

  // Auth
  'Tvůj email': 'Your email',
  'Heslo': 'Password',
  'Potvrdit heslo': 'Confirm Password',
  'Celé jméno': 'Full Name',
  'Přijímám podmínky používání': 'I accept the terms of service',
  'Přihlásit se': 'Login',
  'Registrovat se': 'Sign Up',
  'Zapomenuté heslo?': 'Forgot password?',

  // Stats
  'XP': 'XP',
  'Úroveň': 'Level',
  'Streaky': 'Streaks',
  'Rank': 'Rank',

  // Messages
  'Vitej!': 'Welcome!',
  'Vítejte zpět!': 'Welcome back!',
  'Načítáme vaše data...': 'Loading your data...',
}

export function getEnglishText(czechText: string, isEnglishDomain: boolean): string {
  if (!isEnglishDomain) return czechText
  return czechToEnglishMap[czechText] || czechText
}

export function isEnglishDomain(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  // Check for .ai, .au, .com domains, Vercel preview, or localhost
  const isEnglish = hostname.endsWith('.ai') || hostname.endsWith('.au') || hostname.endsWith('.com') || hostname.includes('vusercontent.net') || hostname === 'localhost' || hostname === '127.0.0.1'
  console.log('[v0] Domain detection - hostname:', hostname, 'isEnglish:', isEnglish)
  return isEnglish
}
