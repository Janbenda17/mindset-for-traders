import { TradeInsight } from '@/lib/insight-engine'

/**
 * Sample insights for testing and demo purposes
 */
export const sampleInsights: TradeInsight[] = [
  // CRITICAL
  {
    id: 'stress_high',
    category: 'psychology',
    title: '🚨 Vysoký stres',
    description: 'Stres je vysoký (8/10). Tvůj amygdala je hyperaktivní - snižuje to kvalitu výkonného funčování o ~25%.',
    priority: 'critical',
    icon: '😰',
    actionable: true,
    actionText: 'Meditovat 5 minut',
    value: '8/10',
  },

  // HIGH
  {
    id: 'sleep_low',
    category: 'morning',
    title: '⚠️ Nízká kvalita spánku',
    description: 'Slezl si jen 4.5 hodin. Snižuje to tvou schopnost dělat kvalitní rozhodnutí. Zvažte zkrácení obchodování.',
    priority: 'high',
    icon: '😴',
    actionable: true,
    actionText: 'Posunout start obchodování',
    value: '4.5h',
  },

  {
    id: 'revenge_trading',
    category: 'psychology',
    title: '🔥 Revenge Trading Risk',
    description: 'V posledních 5 trades vidím 2 revenge tradů. To je rizikové! Dnes se více soustředěte na disciplínu.',
    priority: 'high',
    icon: '🔥',
    actionable: true,
    actionText: 'Aktivovat striktní disciplínu',
    value: '2',
    trend: 'up',
  },

  {
    id: 'low_win_rate',
    category: 'performance',
    title: '📉 Nízká win rate',
    description: 'Win rate je jen 35%. Udělej si analýzu posledních tradů a vylepši setup.',
    priority: 'high',
    icon: '📉',
    actionable: true,
    actionText: 'Analyzovat selhavé trades',
    value: '35%',
    trend: 'down',
  },

  // MEDIUM
  {
    id: 'early_exits',
    category: 'performance',
    title: '⏱️ Příliš brané profity',
    description: 'Vidím vzor brání profitů příliš brzy (2x). Daj si cíl a drž se ho!',
    priority: 'medium',
    icon: '⏱️',
    actionable: false,
  },

  {
    id: 'friday_caution',
    category: 'market',
    title: '⚠️ Pátek - buď opatrný',
    description: 'Dnes je pátek. Volatilita se zvyšuje. Zvýšené riziko před víkendem.',
    priority: 'medium',
    icon: '📊',
    actionable: false,
  },

  {
    id: 'pre_trade_checklist',
    category: 'checklist',
    title: '✅ Pre-Trade Checklist',
    description:
      '1. Procvičit risk management (%) 2. Zopakovat si svůj setup 3. Zkontrolovat economic calendar 4. Připravit se na emoci',
    priority: 'medium',
    icon: '✅',
    actionable: true,
    actionText: 'Pustit si interaktivní checklist',
  },

  // LOW
  {
    id: 'high_win_rate',
    category: 'performance',
    title: '📈 Výborná win rate',
    description: 'Tvá win rate je 72%! Pokračuj v tom samém. Máš dobrý setup.',
    priority: 'low',
    icon: '📈',
    actionable: false,
    value: '72%',
    trend: 'up',
  },

  {
    id: 'confident_mindset',
    category: 'psychology',
    title: '💪 Sebevědomý mindset',
    description: 'Meditoval si a soustředíš se. Perfektní mentální stav pro trading!',
    priority: 'low',
    icon: '💪',
    actionable: false,
  },
]

/**
 * High priority insights example (when not ready to trade)
 */
export const criticalInsights: TradeInsight[] = [
  {
    id: 'stress_critical',
    category: 'psychology',
    title: '🔴 KRITICKÝ STRES',
    description: 'Stres 9/10 - STOP! Tvůj amygdala má plnou kontrolu. Obchodování nyní je velmi riziková.',
    priority: 'critical',
    icon: '😰',
    actionable: true,
    actionText: 'Meditovat 10 minut nebo jít ven',
    value: '9/10',
  },

  {
    id: 'sleep_critical',
    category: 'morning',
    title: '🔴 NEMÁŠ SÍL OBCHODOVAT',
    description: 'Spánek jen 3 hodiny! Tvůj kognitivní výkon je snížen o 60%. Neobchoduj dnes.',
    priority: 'critical',
    icon: '😴',
    actionable: true,
    actionText: 'Přejít na demo mode',
    value: '3h',
  },

  {
    id: 'readiness_low',
    category: 'morning',
    title: '🔴 NÍZKÁ PŘIPRAVENOST',
    description: 'Tvá připravenost je 25/100. Vše je proti tobě. Možné řešení: 1) Zlepšit stav, 2) Demo trading',
    priority: 'critical',
    icon: '⚠️',
    actionable: true,
    actionText: 'Zvýšit fyzické/mentální zdraví',
    value: '25%',
  },
]

/**
 * Perfect morning example (ready to trade)
 */
export const perfectMorningInsights: TradeInsight[] = [
  {
    id: 'high_readiness',
    category: 'morning',
    title: '🟢 IDEÁLNÍ PODMÍNKY PRO TRADING!',
    description: 'Připravenost 92%. Máš všechno co potřebuješ pro skvělý trading. Toto je okno flow state.',
    priority: 'low',
    icon: '✅',
    actionable: false,
    value: '92%',
  },

  {
    id: 'excellent_sleep',
    category: 'morning',
    title: '😴 Vynikající spánek',
    description: '8.5 hodin kvality spánku. Tvůj mozek je vypočinutý a připravený.',
    priority: 'low',
    icon: '😴',
    actionable: false,
    value: '8.5h',
  },

  {
    id: 'peak_energy',
    category: 'morning',
    title: '⚡ Peak Energy',
    description: 'Energie 10/10! To je maximální fyzické energii pro trading.',
    priority: 'low',
    icon: '⚡',
    actionable: false,
    value: '10/10',
  },

  {
    id: 'perfect_focus',
    category: 'morning',
    title: '🎯 Dokonalý Focus',
    description: 'Focus 10/10. Tvůj prefrontální kůra je dominantní. Ideální pro analytické rozhodnutí.',
    priority: 'low',
    icon: '🎯',
    actionable: false,
    value: '10/10',
  },

  {
    id: 'low_stress',
    category: 'psychology',
    title: '😌 Nízký stres',
    description: 'Stres jen 1/10. Tvůj amygdala není aktivovaná - perfektní pro racionální trading.',
    priority: 'low',
    icon: '😌',
    actionable: false,
    value: '1/10',
  },

  {
    id: 'excellent_mindset',
    category: 'psychology',
    title: '💪 Excelentní Mindset',
    description: 'Nálada 9/10, sebedůvěra 8/10. Perfektní emocional nastavení pro trading.',
    priority: 'low',
    icon: '💪',
    actionable: false,
    value: '9/10',
  },

  {
    id: 'flow_state',
    category: 'psychology',
    title: '🌊 Flow State',
    description: 'Všechny faktory se sjednocují - jsi v ideálním stavu "flow" pro optimální výkon.',
    priority: 'low',
    icon: '🌊',
    actionable: false,
  },
]
