# Registrace a Přihlášení - Vyřešené Problémy

## Jaký Byl Problém?

Supabase má přísné požadavky na hesla, ale aplikace to neuživateli jasně nebylo sdělovat:

**Chyba z debug logů:**
```
❌ SIGNUP ERROR: Password should contain at least one character of each: 
abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789.
```

Uživatel zapsal heslo "TestTest" (které se zdálo správné), ale Supabase to odmítlo,
protože chyběla čísla!

---

## Jak Se To Teď Funguje

### 1. **Validace PŘED Odesláním**

Když napíšeš heslo, vidíš živý checklist s požadavky:

```
✓ Minimálně 6 znaků
✓ Malá písmena (a-z)
✓ Velká písmena (A-Z)
✓ Číslice (0-9)
```

Pokud některé nesplňují, tlačítko "Zaregistrovat se" je zakázáno.

### 2. **Chytrá Chybová Zpráva**

Pokud se přesto registrace nepovede (třeba heslo má speciální znak, který Supabase nechce),
dostaneš jasnou zprávu v češtině:

```
Heslo musí obsahovat: malá + velká písmena + čísla (min. 6 znaků)
Např: Trader2024
```

Místo technické chyby od Supabase.

---

## Příklady Dobrých Hesel

✅ **Správná hesla:**
- `Trader2024`
- `Abc123def`
- `MyPassword99`
- `Crypto2025`

❌ **Špatná hesla (proč):**
- `password123` - chybí VELKÁ písmena
- `PASSWORD123` - chybí malá písmena
- `TestTest` - chybí čísla
- `Test1` - příliš krátké (min. 6 znaků)

---

## Co Se Změnilo v Kódu?

### ✅ Přidáno v `signup-form.tsx` a `/app/auth/sign-up/page.tsx`:

1. **Real-time Validace Hesla**
   - Funkcí `validatePassword()` se kontroluje všechny 4 požadavky
   - Uživatel vidí barevný checklist

2. **Visual Feedback**
   - Zelené tečky = splněno
   - Šedé tečky = nesplněno
   - Tlačítko se automaticky deaktivuje, dokud heslo není OK

3. **Lepší Error Messages**
   - Místo technických chyb dostane uživatel konkrétní instrukce
   - Příklad: `Heslo musí obsahovat: malá + velká písmena + čísla`

### ✅ Zlepšeno v `contexts/auth-context.tsx`:

4. **Server-side Error Handling**
   - Když Supabase vrátí chybu, aplikace ji překládá do češtiny
   - Detectuje specifické chyby (heslo, email, server timeout)

---

## Testing - Co Vyzkoušej

1. **Zkus heslo bez číslic:**
   - Napiš: `TraderAbc`
   - Vidíš: Červená tečka u "Číslice (0-9)"
   - Tlačítko je zakázáno

2. **Zkus heslo bez velkých písmen:**
   - Napiš: `trader123`
   - Vidíš: Červená tečka u "Velká písmena (A-Z)"
   - Tlačítko je zakázáno

3. **Zkus korektní heslo:**
   - Napiš: `Trader123`
   - Vidíš: Všechny tečky zelené
   - Tlačítko je aktivní
   - Klikni → Registrace funguje!

---

## Debug Logy - Co Očekávat

**Při úspěšné Registraci:**
```
[v0] ===== REGISTRACE START =====
[v0] Email: tvuj@email.com
[v0] Supabase URL: ✓
[v0] Supabase Key: ✓
[v0] ✅ User vytvořen: 56660715-...
[v0] ✅ Profil nalezen!
[v0] ✅ Registrace HOTOVA - redirect na /onboarding
```

**Při Chybě v Heslu (DŘÍV):**
```
[v0] ❌ SIGNUP ERROR: Password should contain at least...
```

**Při Chybě v Heslu (TEĎKA):**
```
Formulář zobrazí: "Heslo musí obsahovat: malá + velká písmena + čísla"
+ Checklist ukazuje co chybí
```

---

## Shrnutí - Co Je Lépe?

| Dřív | Teď |
|------|-----|
| Vaguní chyba od Serveru | Jasné instrukce co máš dělat |
| Nezvěděl si co chybí | Vidíš live checklist |
| Tlačítko bylo aktivní | Tlačítko se deaktivuje sám |
| Musel jsi hádat | Příklady správných hesel |

**Výsledek:** Registrace je teď intuitivní a uživatel hned ví co dělat!
