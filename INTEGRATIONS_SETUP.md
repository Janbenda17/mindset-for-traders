# 🔧 MindTrader - Integrations Setup Guide

Kompletní průvodce nastavením integrací MetaTrader a Apple Health.

## 📋 Požadované Proměnné Prostředí

### Pro Supabase (již nakonfigurováno)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Pro MetaTrader (Encryption)
```env
ENCRYPTION_KEY=your-64-char-hex-string
```

**Jak vygenerovat ENCRYPTION_KEY:**
```bash
# V Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Výstup bude např:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Pro Apple Health (Terra API)
```env
TERRA_CLIENT_ID=your-terra-client-id
TERRA_API_KEY=your-terra-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.com  # nebo http://localhost:3000 v dev
```

**Jak Získat Terra API Credentials:**
1. Jdi na https://www.terraapi.com/
2. Zaregistruj se nebo se přihlaš
3. Vytvoř novou aplikaci v developer dashboard
4. Zkopíruj Client ID a API Key
5. V Apple Developer Account nakonfiguruj callback URL

## 🔄 Tok Integrace MetaTrader

```
1. Uživatel navštíví: /settings/integrations
2. Vybere brokera (MT5, IC Markets, atd.)
3. Vyplní login a heslo
4. Klikne "Connect Account"
   ↓
5. POST /api/profile/credentials
   - Šifruje login + heslo pomocí ENCRYPTION_KEY
   - Uloží zašifrované údaje do profiles.mt4_api_key
   - Zapne trades_sync_enabled
   ↓
6. Přihlášený uživatel vidí "Connected: MetaTrader 5"
7. Trades se budou synchronizovat automaticky
```

## 🍎 Tok Integrace Apple Health

```
1. Uživatel navštíví: /settings/integrations
2. Klikne "Connect Apple Health"
   ↓
3. GET /api/auth/apple-health
   - Generuje OAuth state token
   - Uloží do cookie: terra_oauth_state
   - Přesměrovává na Terra API OAuth
   ↓
4. Apple Health OAuth (terra.api.com)
   - Uživatel se přihlásí do Apple
   - Povolí přístup k zdravotním datům
   ↓
5. GET /api/auth/apple-health/callback
   - Ověří state token (bezpečnost)
   - Vyměňuje authorization code za Terra token
   - Uloží terra_id do profiles
   - Zapne sleep_sync_enabled
   ↓
6. Přesměrování na /settings/integrations?success=apple_health_connected
7. Zdravotní data se budou synchronizovat každý den
```

## ✅ Checklist - Co Nastavit

### V Kódu
- [ ] ENCRYPTION_KEY - vygenerován a uložen v env
- [ ] TERRA_CLIENT_ID - z Terra API dashboard
- [ ] TERRA_API_KEY - z Terra API dashboard
- [ ] NEXT_PUBLIC_APP_URL - správná URL

### V Supabase
- [ ] profiles tabulka má sloupce:
  - [ ] `mt4_api_key` (text)
  - [ ] `trades_sync_enabled` (boolean)
  - [ ] `terra_id` (varchar)
  - [ ] `sleep_sync_enabled` (boolean)
  - [ ] `last_trades_sync` (timestamp)
  - [ ] `last_health_sync` (timestamp)

### V Terra API (Apple Health)
- [ ] Aplikace je vytvořena
- [ ] Client ID je nakonfigurován
- [ ] API Key je nakonfigurován
- [ ] Callback URL je nastavena na: `{NEXT_PUBLIC_APP_URL}/api/auth/apple-health/callback`
- [ ] OAuth je povoleno

### V Apple Developer Account
- [ ] App je zaregistrována
- [ ] HealthKit capability je povolena
- [ ] Privacy policy je nastavena
- [ ] Testovací uživatel má Apple Health data

## 🧪 Testování

### Test 1: MetaTrader Connection
```bash
# 1. Jdi na /settings/integrations
# 2. Vyber "MetaTrader 5"
# 3. Vyplň:
#    Login: testuser@example.com
#    Password: testpassword123
# 4. Klikni "Connect Account"
# 5. Měl by ses vidět: "Connected: MetaTrader 5"
```

**Debug (F12 → Console):**
```
[v0] Saving MetaTrader credentials...
[v0] MetaTrader credentials saved successfully
```

### Test 2: Apple Health Connection
```bash
# 1. Jdi na /settings/integrations
# 2. Klikni "Connect Apple Health"
# 3. Měl by se otevřít Apple Health login
# 4. Přihlaš se a povolí přístup
# 5. Měl by se vrátit s: "Apple Health Connected"
```

**Debug (F12 → Console):**
```
[v0] Initiating Apple Health OAuth flow...
[v0] Apple Health callback - origin: ...
[v0] Saving Terra integration for user: ...
[v0] Apple Health integration successful
```

## 🐛 Řešení Problémů

### ❌ Error: "ENCRYPTION_KEY not configured"
**Řešení:**
1. Vygeneruj: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Ulož do `.env.local` (dev) nebo Vercel Settings (produkce)
3. Restartuj dev server

### ❌ Error: "Failed to save credentials"
**Řešení:**
1. Zkontroluj F12 → Network → POST /api/profile/credentials
2. Podívej se na response status
3. Pokud `500` → Zkontroluj server logy
4. Pokud `400` → Zkontroluj payload (userId, broker, login, password)

### ❌ Apple Health: "Cannot read properties of undefined (reading 'origin')"
**Řešení:**
- Už jsme to opravili!
- Teď se používá: `request.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL`
- Pokud stále chybí → Zkontroluj NEXT_PUBLIC_APP_URL

### ❌ Apple Health: "invalid_state"
**Řešení:**
1. Možná vypršel state token (600 sekund timeout)
2. Zkus znovu kliknout na "Connect Apple Health"
3. Pokud problém trvá → Vymažete cookies a zkuste znovu

### ❌ Apple Health: Callback ne vrátí tokeny
**Řešení:**
1. Zkontroluj, že je TERRA_API_KEY správně nakonfigurován
2. Zkontroluj v Network tabu → POST na terraapi.com
3. Pokud `401` → Špatný API Key
4. Pokud `400` → Špatný authorization code (vypršel?)

## 📊 Databáze - Schema

### Profiles Tabulka
```sql
-- MetaTrader Integration
mt4_api_key: varchar  -- Format: "broker:IV:ENCRYPTED_DATA"
trades_sync_enabled: boolean
last_trades_sync: timestamp

-- Apple Health Integration
terra_id: varchar
terra_reference_id: varchar
sleep_sync_enabled: boolean
last_health_sync: timestamp
```

## 🔐 Bezpečnost

### MetaTrader Hesla
✅ Šifrovaná pomocí AES-256-CBC  
✅ IV (Initialization Vector) je náhodný pro každý zašifrovaný text  
✅ Nikdy se neukládá v plain textu  
✅ Dešifrování probíhá jen na serveru  

### Apple Health Data
✅ Terra API tokenů nejsou ukládány (jen user_id)  
✅ Health data je synchronizováno denně přes Terra API  
✅ Session cookies jsou HttpOnly a Secure  

## 📚 Užitečné Linky

- [Terra API Docs](https://www.terraapi.com/docs)
- [Apple Health Integration](https://developer.apple.com/healthkit/)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Poslední aktualizace:** 2026-04-12
