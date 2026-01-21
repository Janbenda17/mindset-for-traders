# 🔧 DEBUG REPORT - Autentizace

## Jak Používat Tento Debug Guide

Když máš problém s přihlášením nebo registrací:

### 1. Otevři Developer Tools
```
macOS: Command + Option + I
Windows/Linux: F12 nebo Ctrl + Shift + I
```

### 2. Jdi na Console Tab
```
DevTools → Console
```

### 3. Spusť Registraci/Přihlášení a Sleduj Logy

Měl bys vidět logy jako:
```
[v0] ===== REGISTRACE START =====
[v0] Email: tvuj@email.com
[v0] Name: Jméno
[v0] Password length: 8
[v0] Supabase URL: ✓
[v0] Supabase Key: ✓
[v0] Volání supabase.auth.signUp()...
[v0] Response od signUp: {hasError: false, hasUser: true}
[v0] ✅ User vytvořen: abc123xyz
```

---

## Co Hledat v Logech

### ✅ Úspěšná Registrace - Vypadá Takto:

```
[v0] ===== REGISTRACE START =====
[v0] Email: test@example.com
[v0] Supabase URL: ✓
[v0] Supabase Key: ✓
[v0] Volání supabase.auth.signUp()...
[v0] Response od signUp: {hasError: false, hasUser: true}
[v0] ✅ User vytvořen: 123abc...
[v0] Čekám na profil v databázi...
[v0] Pokus 1/10 - čekání 500ms
[v0] ✅ Profil nalezen!
[v0] Čekám na synchronizaci cookies...
[v0] ✅ Registrace HOTOVA - redirect na /onboarding
```

### ❌ Chyba 1: Chybějící Supabase Proměnné

```
[v0] Supabase URL: ❌
[v0] Supabase Key: ❌
```

**Řešení:**
- Zkontroluj, že jsou nastaveny env variables
- Restartuj dev server
- V produkci zkontroluj Vercel env variables v Settings → Environment Variables

### ❌ Chyba 2: Supabase.auth.signUp Selže

```
[v0] Response od signUp: {hasError: true, hasUser: false}
[v0] ❌ SIGNUP ERROR: {
  message: "User already registered",
  status: 400
}
```

**Řešení:**
- Pokud je `"User already registered"` → Email existuje, zkus se přihlásit
- Pokud je jiná chyba → Zkontroluj Supabase status
- Přebaluji síť requesty v Network tabu

### ❌ Chyba 3: Profil se Nenašel

```
[v0] ✅ User vytvořen: 123abc...
[v0] Čekám na profil v databázi...
[v0] Pokus 1/10 - čekání 500ms
[v0] Pokus 2/10 - čekání 1000ms
[v0] Pokus 3/10 - čekání 1500ms
...
[v0] ⚠️ Profil se nenašel ani po 10 pokusech
```

**Příčiny:**
- Trigger pro vytvoření profilu neběží (databáze)
- Profil je v jiné tabulce
- RLS politiky blokují čtení

**Řešení:**
- Zkontroluj v Supabase → SQL Editor:
  ```sql
  SELECT * FROM profiles WHERE user_id = 'USER_ID_Z_LOGU';
  ```
- Pokud není → Spusť migraci znovu:
  ```bash
  npm run migrate  # nebo ručně spusť scripts
  ```

### ❌ Chyba 4: Přihlášení Selže s "Nesprávné Heslo"

```
[v0] ===== PŘIHLÁŠENÍ START =====
[v0] Email: test@example.com
[v0] Volání supabase.auth.signInWithPassword()...
[v0] Response od signIn: {hasError: true}
[v0] ❌ LOGIN ERROR: {
  message: "Invalid login credentials",
  status: 400
}
```

**Řešení:**
1. Ověř přesný email (malá/velká písmena)
2. Ověř heslo (bez mezer na začátku/konci)
3. Zkus se registrovat znovu (možná účet není oprávdu vytvořený)
4. Resetuj heslo přes "Zapomněli jste heslo?"

---

## Network Tab Debugging

1. Otevři DevTools → Network tab
2. Filtruj na `auth` nebo `signUp`:
   ```
   POST https://<project>.supabase.co/auth/v1/signup
   ```
3. Klikni na request a podívej se na:
   - **Request Headers** - měl by být `Authorization: Bearer ...`
   - **Request Body** - email, password
   - **Response Status** - měl by být `200` (úspěch) nebo `4xx`/`5xx` (chyba)
   - **Response Body** - detaily chyby

**Příklady chyb:**
- `200` ale `error` v response → Chyba v Supabase
- `400` → Bad request (špatný email/heslo/formát)
- `401` → Unauthorized (špatný API key)
- `500` → Server error (Supabase down)
- `504` → Timeout

---

## Cookies a Session

1. DevTools → Application tab
2. Na levé straně: Cookies
3. Hledej: `sb-<PROJECT-ID>-auth-token`

**Co Vidět:**
```
Cookie Name: sb-bctenuyfrkhdxbhgkvlz-auth-token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (dlouhý token)
Domain: localhost nebo tvoje doména
Path: /
HttpOnly: ✓ (mělo by být zaškrtnuto)
Secure: ✓ (na produkci) nebo - (na localhost)
SameSite: Lax
```

**Pokud Cookie Chybí:**
1. Možná se login nepodařil
2. Zkontroluj Response v Network tabu - měl by mít `Set-Cookie` header
3. Vymažte všechny cookies a zkuste znovu

---

## LocalStorage Debugging

1. DevTools → Application → LocalStorage
2. Hledej pro každý z těchto klíčů:
   ```
   supabase.auth.token
   supabase.auth.token.currentSession
   supabase.auth.token.expiresAt
   ```

**Mělo by tam být:**
```json
{
  "currentSession": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "user": {
      "id": "...",
      "email": "...",
      "user_metadata": { "name": "..." }
    }
  }
}
```

Pokud je prázdné → Session se neuloženě

---

## Middleware Debugging

1. DevTools → Console
2. Hledej logy z middleware.ts:
   ```
   [v0] Middleware - path: /login user: none
   [v0] Middleware - path: / user: test@example.com
   ```

**Co Vidět:**
- ✅ `user: none` na `/auth/login` → OK, veřejná cesta
- ✅ `user: test@example.com` na `/dashboard` → OK, přihlášený
- ❌ `user: none` na `/dashboard` → Chyba! Měl bys být na `/auth/login`

---

## Klíčové Věci k Ověření

Pokud Something Doesn't Work, Postupně Zkontroluj:

- [ ] **Console logy** - jsou tam `[v0]` zprávy?
- [ ] **Supabase URL a Key** - vidím `✓` u obou?
- [ ] **Cookies** - existuje `sb-*-auth-token`?
- [ ] **Network requests** - vidím POST na `/auth/v1/signup` nebo `/auth/v1/token`?
- [ ] **Response status** - je `200` nebo `4xx`/`5xx`?
- [ ] **Error message** - co přesně říká chyba?
- [ ] **Profil v DB** - existuje v `profiles` tabulce?
- [ ] **Middleware** - vidím správné redirect logy?

---

## Když Nic Nefunguje

1. **Otevři konzoli** (F12 → Console)
2. **Zkopíruj všechny logy** které vidíš
3. **Zkopíruj error message** (nebo chybu z Network tabu)
4. **Zkontroluj Network tab** - jaký je status kódu?
5. **Podívej se na Supabase dashboard**:
   - Jdou do "Auth" → "Users" a vidíš svého uživatele?
   - V "Profiles" tabulce vidíš svůj profil?

---

## Příklad - Jak Vypadá Úspěšný Login

### 1. Console Logy
```
[v0] ===== PŘIHLÁŠENÍ START =====
[v0] Email: test@example.com
[v0] Password length: 8
[v0] Supabase URL: ✓
[v0] Supabase Key: ✓
[v0] Volání supabase.auth.signInWithPassword()...
[v0] Response od signIn: {hasError: false, hasUser: true, hasSession: true}
[v0] ✅ Login úspěšný - session vytvořena
[v0] User ID: 123-456-789
[v0] Token (first 10 chars): eyJhbGciOi...
[v0] Čekám 500ms na synchronizaci cookies...
[v0] Ověření session: {hasSession: true, sessionError: null}
[v0] ✅ Session ověřena - hard redirect na /
```

### 2. Network
```
POST /auth/v1/token → Status 200
Response Body: {
  "access_token": "eyJ...",
  "refresh_token": "...",
  "user": { "id": "...", "email": "..." }
}
Set-Cookie: sb-...-auth-token=...
```

### 3. Cookies
```
sb-bctenuyfrkhdxbhgkvlz-auth-token = eyJ... (dlouhý token)
```

### 4. Redirect
```
[v0] Middleware - path: / user: test@example.com
→ Middleware vidí uživatele
→ Nechá tě pokračovat na / nebo na /onboarding
```

---

## Rychlý Test - Ověř Supabase Konfiguraci

V konzoli (Console tab) spusť:

```javascript
// Test 1: Zkontroluj env variables
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Test 2: Zkontroluj Supabase client
import { getBrowserSupabase } from "@/lib/supabase/browser"
const supabase = getBrowserSupabase()
console.log("Supabase client:", supabase)

// Test 3: Zkontroluj session
const { data } = await supabase.auth.getSession()
console.log("Current session:", data.session)

// Test 4: Zkontroluj uživatele
const { data: user } = await supabase.auth.getUser()
console.log("Current user:", user.user)
```

**Výstupy:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` není `undefined` → OK
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` není `undefined` → OK
- ✅ `Supabase client` existuje → OK
- ✅ `Current session` není `null` → Už jsi přihlášen
- ✅ `Current user` má `id` a `email` → OK

---

**Poslední Aktualizace:** 2026-01-21
