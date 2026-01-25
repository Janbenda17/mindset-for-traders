// STRIPE WEBHOOK FLOW - Komplní dokumentace

// ============================================================================
// 1. CHECKOUT SESSION CREATED - User klikne "Upgradovat na Live Mode"
// ============================================================================

POST /api/subscription/create-checkout
├─ User musí být authenticated
├─ Backend vytvoří nebo najde Stripe customer
├─ KLÍČOVÉ: user_id uložen v metadata checkout session!
└─ Vrátí Stripe checkout URL

// Metadata v checkout session:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",  // ← KRITICKÉ!
  "user_email": "user@example.com",
  "plan": "premium"
}

// ============================================================================
// 2. USER PAYS IN STRIPE
// ============================================================================

Stripe Portal
├─ User zaplatí payment method
├─ Stripe vytvoří subscription
└─ Stripe pošle webhook event

// ============================================================================
// 3. WEBHOOK EVENT: checkout.session.completed
// ============================================================================

POST /api/subscription/webhook
└─ Stripe pošle event s podpisem

handleCheckoutCompleted(session)
├─ Přečte user_id z session.metadata ← ZDROJ PRAVDY!
├─ Najde user v DB pomocí user_id
├─ Aktualizuje profiles tabulku:
│  ├─ stripe_customer_id = session.customer
│  ├─ subscription_status = "premium" (pending actual subscription)
│  └─ subscription_tier = "premium"
└─ ✅ HOTOVO

// ============================================================================
// 4. WEBHOOK EVENT: customer.subscription.created
// ============================================================================

handleSubscriptionCreated(subscription)
├─ Najde user v DB pomocí stripe_customer_id
├─ Zkontroluje subscription.status
├─ Aktualizuje profiles:
│  ├─ stripe_subscription_id = subscription.id
│  ├─ subscription_status = "trialing" | "active"
│  ├─ subscription_tier = "premium" | "trialing"
│  └─ subscription_current_period_end = timestamp
└─ ✅ Subscription je aktivní!

// ============================================================================
// 5. WEBHOOK EVENT: customer.subscription.updated
// ============================================================================

handleSubscriptionUpdated(subscription)
├─ Zjistí nový status (active, trialing, canceled, past_due, etc.)
├─ Aktualizuje profiles:
│  ├─ subscription_status = nový_status
│  ├─ subscription_tier = "premium" | "free" (závis na statuse)
│  └─ subscription_current_period_end = nový_datum
└─ UI se automaticky obnoví

// ============================================================================
// 6. WEBHOOK EVENT: customer.subscription.deleted
// ============================================================================

handleSubscriptionDeleted(subscription)
├─ Najde user v DB
├─ DŮLEŽITÉ: Nezmaže LIVE data!
├─ Pouze aktualizuje:
│  ├─ subscription_status = "canceled"
│  ├─ subscription_tier = "free"
│  └─ stripe_subscription_id = null
├─ LIVE trades zůstávají v DB
└─ User se vrátí do VIRTUAL modu při příštím loginu

// ============================================================================
// 7. UI - LIVE MODE TOGGLE (komponenta)
// ============================================================================

components/live-mode-toggle.tsx

handleModeSwitch()
├─ Zavolá useSubscription() hook
├─ Hook volá: GET /api/subscription/status
├─ Status vrátí: { isPremium: true/false, tier: "..." }
├─ Logika:
│  ├─ isPremium === true → přepne do LIVE modu
│  ├─ isPremium === false → redirectuje na /pricing
│  └─ isLoadingCheckout → zobrazí loading
└─ ✅ Bez redirect loopu!

// ============================================================================
// 8. STATUS ENDPOINT - Jednotný zdroj pravdy
// ============================================================================

GET /api/subscription/status
├─ Ověří authenticated user
├─ Přečte profiles tabulku:
│  ├─ subscription_status
│  ├─ subscription_tier
│  └─ stripe_customer_id
├─ Vrátí:
│  {
│    "isPremium": true/false,           ← Jen toto se počítá v UI!
│    "status": "active|trialing|...",
│    "tier": "premium|trialing|free",
│    "customerId": "cus_xxx"
│  }
└─ ✅ Zdroj absolutní pravdy!

// ============================================================================
// 9. FLOW: Po zaplacení a webhoooku
// ============================================================================

Seq: Webhook zpracovává → DB aktualizuje → Frontend refetches

1. Stripe webhook dorazí
   └─ updateProfile(isPremium=true)

2. Frontend zavolá GET /api/subscription/status
   └─ Backend vrátí isPremium=true

3. useSubscription hook si uloží: isPremium=true

4. Live-mode-toggle se re-rendruje
   ├─ isPremium=true
   ├─ Uživatel NEMUSÍ refreshovat!
   └─ Tlačítko nyní umožní Live Mode switch

// ============================================================================
// 10. BEZPEČNOST - Zdroj pravdy
// ============================================================================

NIKDY SE NEŘÍDÍME:
❌ Stripe redirect - user ho může zavolat ručně
❌ Frontend localStorage - user ho může změnit
❌ HTTP headers - hacker by mohl falsifikovat

JEDINY ZDROJ PRAVDY:
✅ profiles.subscription_status v Supabase

Webhook → DB aktualizuje → API endpoint čte → UI se řídí

// ============================================================================
// 11. RESTART SUBSCRIPTION - Re-subscribe
// ============================================================================

User chce znovu předplatit po zrušení:

1. Klikne "Upgradovat" opět
2. Frontend volá POST /api/subscription/create-checkout
3. Backend NAJDE existing Stripe customer
4. Vytvoří nový checkout session
5. Webhook opět aktualizuje DB
6. subscription_status se změní na "active"
7. Všechna LIVE data zůstála v DB!
8. User si je může znovu načíst

// ============================================================================
// 12. DEBUGGING - Co kontrolovat
// ============================================================================

Pokud nefunguje:

1. Zkontroluj webhook v Stripe Dashboard
   - Settings → Webhooks
   - Hledej: Failed deliveries
   - Mělo by být: delivered

2. Zkontroluj logs v produkci:
   - Supabase logs
   - Stripe webhook logs
   - aplikace logs

3. Zkontroluj metadata v checkout session:
   - Musí obsahovat user_id!
   - Webhook to čte z session.metadata.user_id

4. Zkontroluj DB status:
   - SELECT * FROM profiles WHERE user_id = 'xxx';
   - Hledej: subscription_status, subscription_tier

5. Zkontroluj API endpoint:
   - GET /api/subscription/status
   - Vrátí ispremium=true/false?

// ============================================================================
