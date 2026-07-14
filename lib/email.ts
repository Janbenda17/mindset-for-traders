// Server-side transactional email helper, built on the Resend REST API.
// Save this file as: lib/email.ts
//
// Requires RESEND_API_KEY in Vercel env vars (Settings > Environment
// Variables, on the v0-trader-mindset-software project). Sign up at
// https://resend.com, verify the mindtrader.ai (or mindtrader.cz) domain
// under Domains, then generate an API key under API Keys.
//
// Optional: set EMAIL_FROM to override the sender, e.g.
// "MindTrader <hello@mindtrader.ai>". Falls back to a sensible default
// below - but note that default will only actually deliver once the
// domain is verified in Resend, so update it to match whatever domain
// gets verified.
//
// Uses plain fetch() rather than the `resend` npm package to avoid adding
// a new dependency, mirroring the pattern already used in lib/meta-capi.ts.

const RESEND_API_URL = "https://api.resend.com/emails"
const DEFAULT_FROM = "MindTrader <hello@mindtrader.ai>"

interface SendEmailParams {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set - skipping email send to", params.to)
    return { success: false, error: "RESEND_API_KEY not configured" }
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: params.from || process.env.EMAIL_FROM || DEFAULT_FROM,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "")
      console.error("[email] Resend API error:", res.status, errorBody)
      return { success: false, error: `Resend API error ${res.status}: ${errorBody}` }
    }

    console.log("[email] ✓ Sent:", params.subject, "->", params.to)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[email] Exception sending email:", message)
    return { success: false, error: message }
  }
}

// Shared HTML wrapper so every transactional email looks consistent without
// pulling in react-email or any templating dependency. Keep markup simple -
// this needs to render correctly in Gmail/Seznam/Outlook's stripped-down
// HTML support, not a modern browser.
function emailShell(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="cs">
  <body style="margin:0;padding:0;background-color:#0f1115;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1115;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#161a22;border-radius:16px;overflow:hidden;border:1px solid #262b36;">
            <tr>
              <td style="padding:32px 32px 24px 32px;">
                <div style="font-size:20px;font-weight:700;color:#facc15;margin-bottom:24px;">MindTrader</div>
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <div style="max-width:480px;margin-top:16px;color:#4b5563;font-size:12px;text-align:center;">
            MindTrader &middot; mindtrader.ai
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function ctaButton(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:linear-gradient(90deg,#eab308,#f97316);color:#0f1115;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;">${text}</a>`
}

const UPGRADE_URL = "https://mindtrader.cz/upgrade"
const ACCOUNT_URL = "https://mindtrader.cz/account"

/**
 * Trial ending soon (fires from customer.subscription.trial_will_end,
 * which Stripe sends ~3 days before the trial converts or lapses).
 *
 * IMPORTANT: the checkout flow (app/api/subscription/create-checkout/route.ts)
 * requires a card up front and Stripe's default trial_settings are in
 * effect (no trial_settings.end_behavior override anywhere in this repo),
 * so when the trial ends Stripe automatically charges the card on file and
 * converts the subscription to active - there is NO automatic revert to
 * Free. The previous version of this email said the opposite ("nic ti
 * nebudeme účtovat"), which was false and could have caused disputed
 * charges. Cancelling only happens if the user explicitly cancels from
 * /account (cancelSubscription(), which sets cancel_at_period_end).
 */
export function trialEndingEmail(params: { daysLeft: number; displayName?: string }): { subject: string; html: string } {
  const name = params.displayName ? params.displayName : "ahoj"
  const dayWord = params.daysLeft === 1 ? "den" : "dny"

  const subject =
    params.daysLeft <= 1
      ? "Tvoje zkušební verze MindTrader končí zítra"
      : `Tvoje zkušební verze MindTrader končí za ${params.daysLeft} ${dayWord}`

  const html = emailShell(`
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">${name.charAt(0).toUpperCase() + name.slice(1)},</p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">
      za <strong>${params.daysLeft} ${dayWord}</strong> ti končí zkušební verze Premium. Pokud nic neuděláš,
      <strong>automaticky se strhne platba</strong> z karty, kterou jsi zadal/a při registraci, a předplatné
      pokračuje na placené verzi Premium.
    </p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 24px 0;">
      Chceš pokračovat v reálném obchodování bez přerušení? Nemusíš dělat nic. Pokud pokračovat nechceš,
      zruš předplatné ve svém účtu ještě před koncem zkušební doby.
    </p>
    <div style="margin:0 0 24px 0;">${ctaButton("Spravovat předplatné", ACCOUNT_URL)}</div>
    <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:0;">
      Předplatné můžeš kdykoliv zrušit v nastavení účtu - stačí to udělat před koncem zkušební doby, aby ti
      nebyla naúčtovaná žádná platba.
    </p>
  `)

  return { subject, html }
}

/**
 * Payment failed on an active/renewing subscription (invoice.payment_failed).
 */
export function paymentFailedEmail(params: { displayName?: string }): { subject: string; html: string } {
  const name = params.displayName ? params.displayName : "ahoj"

  const subject = "Nepodařilo se nám stáhnout platbu za MindTrader Premium"

  const html = emailShell(`
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">${name.charAt(0).toUpperCase() + name.slice(1)},</p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">
      nepodařilo se nám stáhnout platbu za tvoje Premium předplatné - obvykle to bývá vypršelá karta nebo
      nedostatek prostředků. Účet ti teď běží ve Free (Virtual Mode).
    </p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 24px 0;">
      Aktualizuj platební metodu a pokračuj tam, kde jsi skončil/a.
    </p>
    <div style="margin:0 0 24px 0;">${ctaButton("Aktualizovat platbu", UPGRADE_URL)}</div>
  `)

  return { subject, html }
}

/**
 * Signup funnel email #1 - sent ~24h after registration to users who have
 * not started the free trial (profiles.subscription_status is still the
 * default 'inactive', i.e. they never completed Stripe checkout).
 * Triggered by the daily cron at app/api/cron/signup-funnel-emails/route.ts.
 */
export function trialNotStartedEmail(params: { displayName?: string }): { subject: string; html: string } {
  const name = params.displayName ? params.displayName : "ahoj"

  const subject = "Ještě sis nevyzkoušel/a MindTrader Premium naživo"

  const html = emailShell(`
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">${name.charAt(0).toUpperCase() + name.slice(1)},</p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">
      všiml jsem si, že sis založil/a účet, ale zatím jsi nezačal/a 14denní zkušební verzi Premium. Zatím
      vidíš jen Virtual Mode - náhled na ukázkových datech.
    </p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 24px 0;">
      S Premium získáš Live Mode s vlastními obchody, AI Report Builder a pokročilou analytiku a risk
      kalkulačku - 14 dní zdarma, zrušit můžeš kdykoliv.
    </p>
    <div style="margin:0 0 24px 0;">${ctaButton("Vyzkoušet Premium zdarma", UPGRADE_URL)}</div>
  `)

  return { subject, html }
}

/**
 * Signup funnel email #2 - reminder sent ~3 days after registration to
 * users who still have not started the free trial.
 */
export function trialNotStartedReminderEmail(params: { displayName?: string }): { subject: string; html: string } {
  const name = params.displayName ? params.displayName : "ahoj"

  const subject = "Poslední připomínka: 14 dní Premium zdarma na tebe čeká"

  const html = emailShell(`
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">${name.charAt(0).toUpperCase() + name.slice(1)},</p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 16px 0;">
      pár dní zpátky ses zaregistroval/a do MindTrader, ale ještě jsi nezačal/a zkušební verzi Premium.
      Naposledy ti chci připomenout, co s ní získáš: Live Mode s vlastními obchody, sledování nálady a
      disciplíny, AI Report Builder a risk kalkulačku.
    </p>
    <p style="color:#e5e7eb;font-size:16px;line-height:1.5;margin:0 0 24px 0;">
      14 dní zdarma, platební karta se strhne až po skončení zkušební doby a zrušit můžeš kdykoliv
      v nastavení účtu.
    </p>
    <div style="margin:0 0 24px 0;">${ctaButton("Vyzkoušet Premium zdarma", UPGRADE_URL)}</div>
  `)

  return { subject, html }
}
