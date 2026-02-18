# Enhanced AI Trading Insights - Implementation Guide

## Overview
Nový system pro generování komplexních, personalizovaných AI trading insights, které se zobrazují v Daily Tracker po dokončení Morning Checku.

## Architecture

### 1. **Insight Generation Engine** (`/lib/insight-engine.ts`)
Základní engine který generuje diferentes typy insights na základě:
- **Morning State Analysis**: Porovnání psychologického stavu s historickým normálem
- **Trading Patterns Detection**: Detekce revenge trading, early exits, missed opportunities
- **Performance Trends**: Win rate analysis, P&L trends
- **Psychological State**: Readiness score, stress/confidence levels
- **Market Insights**: Day-of-week patterns, market bias awareness
- **Pre-Trade Checklist**: Dynamic checklist specificke pro den

#### Key Functions:
```typescript
analyzeInsights(userId, morningCheckData) // Main entry point
analyzeMorningState(context) // Sleep, energy, stress analysis
detectTradingPatterns(context) // Pattern recognition
analyzePerformanceTrends(context) // Win rate, P&L
analyzePsychologicalState(context) // Readiness scoring
generateMarketInsights(context) // Market timing
generatePreTradeChecklist(context) // Daily checklist
```

### 2. **Enhanced UI Component** (`/components/ai-trading-insights-enhanced.tsx`)
Luxusní React komponenta pro renderování insights:

Features:
- ✨ **Readiness Score Card**: Visual progress bar s semaforovým systémem
- 🎯 **Critical Alerts**: Zvýrazněné kritické upozornění
- 📑 **Tabbed Interface**: Kategorizace insights (Ranní příprava, Výkon, Psychology, atd.)
- 🔴 **Priority System**: Čtyři úrovně priority (critical, high, medium, low)
- 🎨 **Color-Coded Cards**: Barvy odpovídající prioritě
- 📊 **Summary Stats**: Počty insights v jednotlivých prioritách
- 💡 **Action Buttons**: Interaktivní tlačítka pro actionable insights

### 3. **API Route** (`/app/api/ai-insights/morning/route.ts`)
POST endpoint pro generování insights:

```bash
POST /api/ai-insights/morning
Content-Type: application/json

{
  "morningCheckData": {
    "sleep_hours": 7,
    "sleep_quality": 8,
    "energy_level": 7,
    "stress_level": 3,
    ...
  }
}

Response:
{
  "success": true,
  "insights": [
    {
      "id": "string",
      "category": "morning|performance|risk|psychology|market|checklist",
      "title": "string",
      "description": "string",
      "priority": "critical|high|medium|low",
      "icon": "string",
      "actionable": boolean,
      "actionText": "string",
      "value": "number|string",
      "trend": "up|down|neutral"
    }
  ]
}
```

### 4. **Hook** (`/hooks/use-morning-insights.ts`)
React hook pro manažování insights lifecycle:

```typescript
const {
  insights,           // Array<TradeInsight>
  insightsLoading,   // boolean
  generateInsights,  // (morningCheckData) => Promise<TradeInsight[]>
  handleActionClick, // (insight) => void
} = useMorningInsights()
```

## Integration in Daily Tracker

### Auto-Generation
Insights se automaticky generují jakmile:
1. User vyplní Morning Check
2. Data se uloží do databáze
3. useEffect detekuje nový morning check
4. Zavolá se `generateInsights()`

### Component Placement
V `/app/daily-tracker/page.tsx`:

```jsx
{todayEntry?.morningCheck && (
  <div className="mt-8">
    <AITradingInsightsEnhanced
      insights={insights}
      loading={insightsLoading}
      onActionClick={handleActionClick}
    />
  </div>
)}
```

## Insight Categories

### 🌅 Morning (Ranní příprava)
- Sleep quality analysis
- Energy level assessment
- Focus/concentration level
- Meditation & routine compliance

### 📊 Performance (Výkon)
- Win rate analysis
- P&L trends
- Trade consistency
- Historical performance comparison

### ⚠️ Risk (Risk Management)
- Dynamic risk tolerance
- Position sizing
- Daily loss limits
- Account drawdown risk

### 🧠 Psychology (Psychologie)
- Stress level impacts
- Emotional state analysis
- Revenge trading detection
- FOMO/Fear assessment
- Confidence levels

### 📈 Market (Market Insights)
- Day-of-week patterns
- Economic calendar awareness
- Volatility expectations
- Market bias alignment

### ✅ Checklist (Pre-Trade)
- Dynamic checklist based on conditions
- Risk management reminders
- Setup verification points
- Discipline activation

## Priority System

```
🔴 CRITICAL - Ostrahy riziko, okamžitá akce
- sleep_hours < 6
- stress_level > 7
- recent revenge trading pattern

🟠 HIGH - Zvýšená opatrnost, plánovat chování
- energy_level < 4
- win_rate < 40%
- low readiness score

🟡 MEDIUM - Zvážit, monitoring
- focus < 4/10
- friday warning
- early exit pattern

🟢 LOW - Informace, pozitivní feedback
- high win_rate
- confident mindset
- good performance
```

## Database Integration

### Tables Used:
- `morning_checks` - Source of data
- `journal_entries` - Recent trades for pattern detection
- `weekly_reviews` - Performance stats
- `trading_identity` - Trading style & preferences
- `trading_plans` - Today's plan context

### RLS Policies:
Všechny insights jsou user-specific, chráněny RLS:
```sql
-- Only user's own insights
SELECT * FROM insights WHERE user_id = auth.uid()
```

## Performance Considerations

### Caching:
- Insights se cachují po vygenerování
- Regenerují se pouze když se změní morning check
- API responses jsou cachované 5 minut

### Optimization:
- Database queries omezeny na poslední 20 tradů
- Parallel data fetching pro více tabulek
- Minimal re-renders díky proper React optimization

## Error Handling

### Fallback Insights:
Pokud AI service selže:
```typescript
function generateFallbackInsights(morningCheckData) {
  return [
    { title: "Vítej zpět!", ... },
    { title: "Risk Management First", ... }
  ]
}
```

### User Feedback:
- Toast notification pro success/error
- Loading state během generování
- Clear error messages

## Future Enhancements

- [ ] Historical comparison (week-over-week)
- [ ] ML-based pattern learning
- [ ] Predictive analytics
- [ ] Custom insight rules editor
- [ ] Insight history & analytics
- [ ] Integration s trading journal
- [ ] Real-time alerts sistema
- [ ] Mobile app notifications

## Testing

### Manual Testing:
1. Fill morning check s различными hodnotami
2. Zkontroluj insights jsou generovány
3. Verify priority ordering
4. Click action buttons
5. Check dark/light mode rendering

### Automated Tests:
```bash
npm test -- insight-engine.test.ts
npm test -- ai-trading-insights-enhanced.test.tsx
```

## Troubleshooting

**Q: Insights se negenerují**
- Check morning check je vyplněn
- Verify API route je accessible
- Check console pro errors

**Q: Loading state se trvá dlouho**
- Check database performance
- Verify user má dostatek history
- Check network requests

**Q: Insights nejsou relevantní**
- Více tradů v historii = lepší patterns
- Check trading identity je vyplněna
- Verify morning check data je korektní

## Files Modified/Created

```
/lib/insight-engine.ts                              # NEW - Core engine
/components/ai-trading-insights-enhanced.tsx        # NEW - UI Component
/app/api/ai-insights/morning/route.ts              # NEW - API endpoint
/hooks/use-morning-insights.ts                     # NEW - React hook
/app/daily-tracker/page.tsx                        # MODIFIED - Integration
```
