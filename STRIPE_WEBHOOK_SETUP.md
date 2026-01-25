## STRIPE WEBHOOK SETUP - Checklist

### 1. Webhook Endpoint URL v Stripe Dashboard

**Musí být nakonfigurován:**

\`\`\`
POST https://tvoje-domena.vercel.app/api/subscription/webhook
\`\`\`

**Kroky:**
1. Jdi do https://dashboard.stripe.com/
2. Settings → Webhooks
3. "Add endpoint"
4. URL: `https://tvoje-domena.vercel.app/api/subscription/webhook`
5. Events: Vyberi:
   - checkout.session.completed ✓
   - customer.subscription.created ✓
   - customer.subscription.updated ✓
   - customer.subscription.deleted ✓
   - invoice.payment_succeeded ✓
   - invoice.payment_failed ✓
6. Create endpoint

### 2. Webhook Secret v Env Variables

**Zkopíruj z Stripe:**
- Jdi na webhook endpoint
- Klikni "Reveal" u "Signing secret"
- Zkopíruj: `whsec_xxx...`

**Nastav v Vercel:**
\`\`\`
STRIPE_WEBHOOK_SECRET=whsec_xxx...
\`\`\`

### 3. Ověření, že webhook funguje

**V Stripe Dashboard:**
1. Jdi na Settings → Webhooks
2. Klikni na tvůj endpoint
3. Podívej se na "Recent Events"
4. Měly by tam být eventy:
   - checkout.session.completed ✓
   - customer.subscription.created ✓

**Pokud vidíš "Failed":**
- Klikni na event
- Podívej se na Response
- Tam bude error

### 4. Local Testing (dev)

Aby to fungovalo lokálně, potřebuješ Stripe CLI:

\`\`\`bash
# 1. Nainstaluj Stripe CLI
# https://stripe.com/docs/stripe-cli

# 2. Spusť forward na tvůj webhook
stripe listen --forward-to localhost:3000/api/subscription/webhook

# 3. Zkopíruj webhook secret, který vypíše:
# whsec_test_yyy...

# 4. Nastav v .env.local:
STRIPE_WEBHOOK_SECRET=whsec_test_yyy...

# 5. Testuj checkout:
stripe trigger checkout.session.completed
\`\`\`

### 5. Co se stane po zaplacení

**Pořádí eventů:**
1. User zaplatí v Stripe checkout
2. Stripe pošle webhook: `checkout.session.completed`
3. Náš backend přečte `user_id` z metadata
4. Backend aktualizuje DB: `subscription_status = "active"`
5. Frontend zavolá `/api/subscription/status`
6. Frontend vidí `isPremium = true`
7. Live Mode toggle se aktivuje ✓

### 6. Production Checklist

\`\`\`
☐ Webhook secret nastavený v Vercel
☐ Webhook endpoint URL je https (NIKDY http)
☐ Webhook endpoint je v /api/subscription/webhook
☐ Events vybrány: checkout.session, subscription.*, invoice.*
☐ Test: Zaplacení test kartou "4242 4242 4242 4242"
☐ Ověřit: V Stripe Dashboard vidím "successful delivery"
☐ Ověřit: V DB je aktualizován subscription_status
\`\`\`

### 7. Testovací karta

\`\`\`
Číslo: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
\`\`\`

Tato karta:
- Vždy projde platbu ✓
- Je pro testing ✓
- Nepůsobí skutečné transakce ✓

### 8. Troubleshooting

**Problem: Webhook se neobjeví v Recent Events**

- ✓ Zkontroluj že URL je správná (https!)
- ✓ Zkontroluj STRIPE_WEBHOOK_SECRET env var
- ✓ Reloadni Vercel deployment
- ✓ Koukni na Vercel logs

**Problem: Event dorazí ale DB se neaktualizuje**

- ✓ Zkontroluj Vercel Function logs
- ✓ Zkontroluj že user_id je v metadata
- ✓ Zkontroluj že DB je přístupná (RLS policies)
- ✓ Zkontroluj SQL query

**Problem: Frontend pořád vidí isPremium=false**

- ✓ Zkontroluj GET /api/subscription/status endpoint
- ✓ Zkontroluj že DB se aktualizovala
- ✓ Zkontroluj useSubscription hook cache
- ✓ Zkontroluj že user je refreshil stránku

### 9. Monitoring

**Ověř že webhook běží každý den:**

\`\`\`sql
-- V Supabase, koukej na profiles kde se mění subscription_status
SELECT 
  user_id, 
  subscription_status, 
  updated_at
FROM profiles
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;
\`\`\`

Měl by tam být minimálně jeden záznam ze včerejšku (z testování nebo skutečné platby).
