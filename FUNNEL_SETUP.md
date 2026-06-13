# Trading Psychology Funnel - User Guide

## Co je funnel?

Jednoduchý, logický sled kroků, který vede nového uživatele skrz aplikací. Cíl: porozumění a setup za **2-3 minuty**.

---

## 📊 Struktura funnelu (4 kroky)

### **Krok 1: Welcome (Přivítání)**
- ✓ Krátké vysvětlení co bude následovat (3 kroky)
- ✓ Motivační obsah
- ✓ CTA: "Start Setup"
- ⏱ Čas: 30 sekund

**Cíl:** Vytvořit nadšení, jasně komunikovat co následuje

---

### **Krok 2: Trader Profile (Tvůj profil traderu)**
- ✓ 4 otázky typu traderu: Scalper / Day Trader / Swing / Long-term
- ✓ Vysvětlení pro každou kategorii
- ✓ Back/Next navigace

**Cíl:** Pochopit styl tradingu → AI bude vědět jaké výzvy řešit
⏱ Čas: 45 sekund

---

### **Krok 3: Daily Routine (Tvá denní rutina)**
- ✓ Výběr času na ranní check-in
- ✓ Výběr času na market open
- ✓ Výběr focus areas (min. 2): Discipline, Emotions, Loss Handling, FOMO
- ✓ Vysvětlení proč je to důležité

**Cíl:** Nastavit personalizovanou rutinu → remindery budou přicházet správně
⏱ Čas: 1-2 minuty

---

### **Krok 4: Broker Connection (Připoj svého brokera)**
- ✓ Vysvětlení co se odemkne (real-time analysis, pattern detection)
- ✓ Tlačítko: "Connect MetaTrader 5"
- ✓ Alternativa: "Skip for now"

**Cíl:** Motivovat k připojení brokera, ale nenutit
⏱ Čas: 1 minuta

---

## 🎯 Klíčové vlastnosti

✅ **Progressive disclosure** - Jeden krok najednou, ne všechno najednou
✅ **Mobile-friendly** - Fullscreen kroky, jednoduché vstupy
✅ **Back button** - Uživatel může se vrátit a změnit
✅ **Skip option** - Možnost přeskočit bez trestu
✅ **Data persistence** - Vše se uklád do localStorage
✅ **Beautiful animations** - Framer motion pro smooth transitions

---

## 🔗 Integrace do aplikace

### **1. Kdy se funnel zobrazí?**

```
New User Flow:
Signup → ✓ Email verified → Funnel Start → Dashboard
```

**Možnosti:**
- A) Automaticky po sign-up
- B) Modal na homepage pro nové uživatele
- C) Link v email: "Start setup" → `/funnel`

---

### **2. Kam jít ze signupu?**

**V `/app/auth/sign-up/page.tsx` nebo po callbacku:**

```typescript
// Po úspěšné registraci
router.push('/funnel')

// Nebo s kontrolou
const isNewUser = !user.funnel_completed
if (isNewUser) {
  router.push('/funnel')
} else {
  router.push('/dashboard')
}
```

---

### **3. Data persistence**

Všechna data se ukládají:
1. **localStorage** (klient) - rychlé checkování
2. **Database** (backend) - na /dashboard po přihlášení

```typescript
// V funnel-container.tsx po complete
localStorage.setItem('funnel_data', JSON.stringify({
  profile: 'scalper',
  routine: { morningTime: '06:00', focusAreas: ['discipline'] }
}))

// Pak v API route
// POST /api/user/setup-complete
// Ulož do profiles/user_settings
```

---

## 💡 Potencialní vylepšení

1. **Progress bar** - Ukaž kde je uživatel (1/4 → 2/4, atd.)
2. **Konfirmační obrazovka** - "Perfect! You're all set" se shrnutím
3. **A/B testing** - Test různých otázek
4. **Tooltips** - Hover help u nejasnýchPolí
5. **Conditional skipping** - Přeskoč trader profile pokud je u relevantního zařízení
6. **Email verification** - Ukazuj až když je email verified

---

## 📱 Testing checklist

- [ ] Mobilní responsivnost - všechny kroky
- [ ] Back/Next navigace funguje
- [ ] Skip button funguje
- [ ] Data se uklád do localStorage
- [ ] Animations jsou smooth
- [ ] Input fieldy jsou accessible
- [ ] Tlačítka jsou jasně CTA

---

## 🚀 Launch checklist

1. Přidej `/funnel` route do navigace (jen pro nové uživatele)
2. Integruj funnel do sign-up flow
3. Přidej database field: `users.funnel_completed` (boolean)
4. Vytvoř API endpoint `/api/user/setup-complete`
5. Test na mobile a desktop
6. Monitor completion rate v analytics
7. Iteruj dle feedbacku

---

Hotovo! Funnel je připraven k použití. 🎉
