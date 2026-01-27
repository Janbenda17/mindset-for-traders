# 🔐 MindTrader - Kompletní Průvodce Autentizací a Routingem

## 📋 Obsah
1. [Jak to všechno funguje - Přehled](#přehled)
2. [Toky přihlášení a registrace](#toky-přihlášení-a-registrace)
3. [Routovací systém](#routovací-systém)
4. [Middleware a zabezpečení](#middleware-a-zabezpečení)
5. [Problémům řešení](#řešení-problémů-při-přihlášení-a-registraci)

---

## Přehled

Aplikace MindTrader používá **Supabase** pro autentizaci a **Next.js middleware** pro řízení přístupu. Zde je vizuální tok:

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        UŽIVATEL SE PŘIPOJÍ                       │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │     MIDDLEWARE - updateSession()     │
        │  (lib/supabase/middleware.ts)        │
        └─────────────┬──────────────────────┘
                      ↓
        ┌─────────────────────────────────────────┐
        │ Je přihlášen? Má cookies se sessionem? │
        └─────────────┬──────────────────────┘
                  /         \
               ANO/          \NE
              /               \
           ↓                   ↓
    [Jde na chráněné        [Kontrola veřejných cest]
     stránky]                └─────────────┬──────────┘
                                      /         \
                                  ANO/           \NE
                                 /               \
                              ↓                   ↓
                       [Pokračuj]      [Přesměruj na /auth/login]
\`\`\`

---

## Toky Přihlášení a Registrace

### 1️⃣ REGISTRACE - Tok Nového Uživatele

\`\`\`
UŽIVATEL NAVŠTÍVÍ: /auth/sign-up nebo /signup
              ↓
    [SignUpPage komponenta]
              ↓
   [Vyplní email, heslo, jméno]
              ↓
    [Klikne "Zaregistrovat se"]
              ↓
    contexts/auth-context.tsx → register()
         ├─ Volání: supabase.auth.signUp()
         │  └─ Vytvoření uživatele v Supabase Auth
         │
         ├─ Čekání: Na profil v databázi
         │  └─ SQL Trigger automaticky vytvoří profil
         │     (scripts/021_verify_profile_trigger.sql)
         │
         ├─ Nastavení: User state v kontextu
         │
         └─ Přesměrování: window.location.href = "/onboarding"
              ↓
         [/onboarding stránka]
         - Výběr stylu tradingu
         - Nastavení účtu
\`\`\`

**Klíčový soubor:** `/app/auth/sign-up/page.tsx`
\`\`\`typescript
const { register } = useAuth()  // z auth-contextu

// Registrace vrací True/False
const success = await register({ 
  email, 
  password, 
  name: name || "Trader" 
})

// Po úspěchu -> přesměrování na /onboarding
\`\`\`

---

### 2️⃣ PŘIHLÁŠENÍ - Tok Stávajícího Uživatele

\`\`\`
UŽIVATEL NAVŠTÍVÍ: /auth/login nebo /login
              ↓
    [LoginForm komponenta]
              ↓
   [Vyplní email a heslo]
              ↓
    [Klikne "Přihlásit se"]
              ↓
    contexts/auth-context.tsx → login()
         ├─ Volání: supabase.auth.signInWithPassword()
         │
         ├─ Ověření: Email + heslo v Supabase
         │
         ├─ Vytvoření: Session (cookies s auth tokeny)
         │
         ├─ Nastavení: User state v kontextu
         │
         ├─ Čekání: 500ms na synchronizaci cookies
         │
         └─ Přesměrování: window.location.href = "/"
              ↓
         [Hard redirect - obnoví browser]
              ↓
         [Middleware znovu pracuje s cookies]
              ↓
         [Jde na /landing nebo do aplikace]
\`\`\`

**Klíčový soubor:** `/components/login-form.tsx`
\`\`\`typescript
const { login } = useAuth()

const success = await login(email, password)

// Po úspěchu -> window.location.href = "/"
// To vynutí refresh a middleware znovu zkontroluje cookies
\`\`\`

---

### 3️⃣ ODHLÁŠENÍ - Logout Tok

\`\`\`
UŽIVATEL KLIKNE: Na logout tlačítko
              ↓
    contexts/auth-context.tsx → logout()
         ├─ Vymazání: Všechna data konkrétního uživatele
         ├─ Odhlášení: supabase.auth.signOut()
         ├─ Vyčištění: User state
         └─ Přesměrování: window.location.href = "/auth/login"
\`\`\`

---

## Routovací Systém

### Soubor: `/lib/supabase/middleware.ts`

Middleware kontroluje KAŽDÝ request na tyto věci:

#### 1. Je to veřejná cesta?
\`\`\`typescript
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup", 
  "/auth/callback",
  "/signup",
  "/login",
  "/pricing",
  "/terms",
  "/privacy",
  "/teaser",
  "/intro",
  "/landing",
]

// Pokud je na seznamu → Pokračuj bez ověření
\`\`\`

#### 2. Cesta "/" (Home page)
\`\`\`typescript
if (pathname === "/") {
  if (!user) {
    // Bez cookies se seen_landing -> redirect na /landing
    const hasSeenLanding = request.cookies.get("mt_seen_landing")
    if (!hasSeenLanding) {
      return redirect("/landing")
    }
  } else {
    // Přihlášený uživatel na "/" -> redirect na /auth/login
    return redirect("/auth/login")
  }
}
\`\`\`

#### 3. Všechny ostatní cesty (chráněné)
\`\`\`typescript
// Pokud NENÍ přihlášen a NENÍ na veřejné cestě:
if (!user) {
  const url = request.nextUrl.clone()
  url.pathname = "/auth/login"
  url.searchParams.set("redirectedFrom", pathname)
  return NextResponse.redirect(url)
}

// Pokud je přihlášen -> Pokračuj
return supabaseResponse
\`\`\`

---

## Middleware a Zabezpečení

### Jak Middleware Pracuje

\`\`\`
                    REQUEST PŘIJDE
                         ↓
        ┌────────────────────────────────┐
        │ Je to API route? (/api/*)      │
        │ → Pokračuj dál (skip kontrola)  │
        └────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ Je to statický soubor?         │
        │ (.svg, .png, .css, atd.)       │
        │ → Pokračuj dál (skip kontrola)  │
        └────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ Vytvoř Supabase client         │
        │ s cookies handlry              │
        └────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ Zavolej: getUser()             │
        │ - Zkontroluje session cookies  │
        │ - Vrátí user data nebo null    │
        └────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ Zkontroluj pravidla routingu:  │
        │ 1. Veřejná cesta?              │
        │ 2. Home page?                  │
        │ 3. Chráněná cesta?             │
        └────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ Vrať Response:                 │
        │ - NextResponse.next()          │
        │ - NextResponse.redirect()      │
        └────────────────────────────────┘
\`\`\`

### Session & Cookies

Když se uživatel přihlásí:
1. **Supabase vytvoří session** s auth tokeny
2. **Middleware si vezme cookies** a předá je v Response
3. **Browser uloží cookies** s `Set-Cookie` header
4. **Při dalších requestech** middleware čte cookies a autentifikuje uživatele

\`\`\`typescript
// Middleware čte cookies:
request.cookies.getAll()

// A zapisuje je do odpovědi:
supabaseResponse.cookies.set(name, value, options)
\`\`\`

---

## Řešení Problémů při Přihlášení a Registraci

### ❌ Problém 1: "Nemohu se zaregistrovat"

**Příčiny:**
- ❌ Email není validní
- ❌ Heslo je kratší než 6 znaků
- ❌ Email je již registrován
- ❌ Supabase není dostupný

**Řešení:**
1. Ověř email formát (musí obsahovat @)
2. Heslo minimálně 6 znaků
3. Pokud jsi už registrován → Zkus se přihlásit
4. Zkontroluj debug logy v konzoli

\`\`\`typescript
// Debug log v auth-context.tsx:
console.log("[v0] Starting registration for:", email)

// Hlédej v konzoli na:
// ✅ "[v0] Starting registration for: tvuj@email.com"
// ❌ "[v0] Supabase registration error: ..."
\`\`\`

---

### ❌ Problém 2: "Nemohu se přihlásit"

**Příčiny:**
- ❌ Špatné heslo
- ❌ Špatný email
- ❌ Účet neexistuje
- ❌ Cookies nejsou nastaveny

**Řešení:**
1. Ověř přesné zadání emailu a hesla
2. Zkus se registrovat, pokud účet neexistuje
3. Vymažte cookies aplikace:
   \`\`\`javascript
   // V konzoli:
   document.cookie.split(";").forEach(c => {
     const cookieName = c.split("=")[0].trim();
     document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
   });
   location.reload();
   \`\`\`

---

### ❌ Problém 3: "Jsem přihlášen, ale middleware mě vrací na login"

**Příčiny:**
- ❌ Cookies nejsou uloženy
- ❌ Session vypršela
- ❌ Middleware nečte cookies

**Řešení - Zkontroluj v DevTools (F12)**:

1. **Application → Cookies** - hledej:
   \`\`\`
   sb-<project-id>-auth-token  (měl by existovat)
   \`\`\`

2. **Application → LocalStorage** - hledej:
   \`\`\`
   supabase.auth.token (backup auth data)
   \`\`\`

3. Pokud cookies chybí:
   - Vymažte Application data a zkuste znovu

---

### ❌ Problém 4: "Registrace proběhla, ale nevím kam jít"

**Co se má stát:**
\`\`\`
Registrace úspěšná
        ↓
Zpráva: "Registrace úspěšná! Vítejte v MindTrader!"
        ↓
Automatické přesměrování na: /onboarding
        ↓
[Setup stránka - výběr stylu tradingu]
\`\`\`

**Pokud se nepřesměrovává:**
1. Zkontroluj developer tools console (F12 → Console)
2. Hledej: `[v0] Performing hard redirect to /onboarding`
3. Pokud tam není → Zastaví se na registraci

**Ručné řešení:**
\`\`\`javascript
// V konzoli napíšeš:
window.location.href = "/onboarding"
\`\`\`

---

## Kompletní Diagram - Uživatelský Životní Cyklus

\`\`\`
        ┌─────────────────────────┐
        │  NOVÝ UŽIVATEL          │
        └───────────┬─────────────┘
                    ↓
    ┌───────────────────────────────────┐
    │ Navštíví: /landing nebo /pricing  │
    │ (Veřejné stránky)                 │
    └───────────┬─────────────────────┬─┘
                │                     │
            "Registrace"          "Přihlášení"
                │                     │
                ↓                     ↓
    ┌────────────────────┐  ┌──────────────────┐
    │ /auth/sign-up      │  │ /auth/login      │
    │ Nový účet          │  │ Existující účet  │
    └────────┬───────────┘  └────────┬─────────┘
             ↓                       ↓
    [Výplnění formuláře]   [Výplnění formuláře]
             ↓                       ↓
    [Supabase signUp]      [Supabase signIn]
             ↓                       ↓
    [Vytvoření profilu]    [Ověření hesla]
             ↓                       ↓
    ✅ Úspěch              ✅ Úspěch
             ↓                       ↓
    [Redirect /onboarding] [Redirect /]
             ↓                       ↓
    [Setup střecha]        [Middleware ↓
             ↓               Kontrola]
    ✅ Běžný uživatel              ↓
    - Maže všechny data       ✅ V aplikaci
    - Jde na dashboard            - Analytics
                                   - Trading tracker
                                   atd.
             ↓                      ↓
    ┌────────────────────────────────────┐
    │ Když se odhlásí (logout):          │
    │ 1. Vymazání dat                    │
    │ 2. signOut() v Supabase            │
    │ 3. Vrátí se na /auth/login         │
    └────────────────────────────────────┘
\`\`\`

---

## 🔍 Debug Checklist

Pokud něco nefunguje, postupně projdi:

- [ ] Otevřu DevTools (F12)
- [ ] Jdu na Console - hledám `[v0]` logy
- [ ] V Application → Cookies vidím `sb-*-auth-token`
- [ ] Ověřím, že email/heslo jsou správně
- [ ] Vymažu cookies a zkusím znovu
- [ ] Zkontroluju, že Supabase je spuštěný (integrations)
- [ ] V Network tabu vidím POST na `/auth/sign-in` nebo `/auth/sign-up`
- [ ] Odpověď má `access_token` a `refresh_token`

---

## 📝 Důležité Soubory

| Soubor | Účel |
|--------|------|
| `/middleware.ts` | Hlavní routing kontrola |
| `/lib/supabase/middleware.ts` | updateSession logika |
| `/contexts/auth-context.tsx` | Auth state & login/register funkce |
| `/components/login-form.tsx` | Login formulář UI |
| `/app/auth/sign-up/page.tsx` | Signup formulář UI |
| `/app/auth/callback/route.ts` | OAuth callback handler |
| `/lib/supabase/browser.ts` | Supabase client pro browser |

---

## 🎯 Klíčové Learningy

1. **Middleware běží na KAŽDÉM requestu** - kontroluje cookies a uživatele
2. **Hard redirect po login/registraci** - vynutí refresh a middleware znovu pracuje
3. **Session v cookies** - bez nich nemůžeš být přihlášen
4. **Public paths jsou vždy dostupné** - nemusíš být přihlášen
5. **Protected paths vrací login** - bez uživatele nemůžeš jít dál

---

**Poslední aktualizace:** 2026-01-21
