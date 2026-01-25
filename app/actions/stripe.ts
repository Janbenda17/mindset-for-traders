'use server'

import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'

const PRICE_ID = 'price_1S59GOL0tgTNaSwwEqyW1brC'

export async function startCheckoutSession(email: string, name: string) {
  try {
    console.log("[v0] startCheckoutSession: START - email:", email)
    
    // Get authenticated user
    const supabase = await createServerClient()
    console.log("[v0] startCheckoutSession: Supabase created")
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log("[v0] startCheckoutSession: getUser - error:", authError, "user:", user?.id)

    if (authError) {
      console.error("[v0] startCheckoutSession: Auth error:", authError)
      throw new Error("Autentizace selhala: " + authError.message)
    }
    
    if (!user) {
      console.error("[v0] startCheckoutSession: No user found")
      throw new Error("Uživatel není přihlášen")
    }

    console.log("[v0] startCheckoutSession: User authenticated:", user.id, "email:", user.email)

    // Get or create Stripe customer
    let customerId = null
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log("[v0] startCheckoutSession: Profile lookup - error:", profileError, "stripe_customer_id:", profile?.stripe_customer_id)

    if (profileError) {
      console.error("[v0] startCheckoutSession: Profile error:", profileError)
      throw profileError
    }

    customerId = profile?.stripe_customer_id
    
    if (customerId) {
      console.log("[v0] startCheckoutSession: Using existing customer:", customerId)
    } else {
      console.log("[v0] startCheckoutSession: Creating new Stripe customer for email:", email)
      
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
      console.log("[v0] startCheckoutSession: Stripe customer created:", customerId)

      // Store customer ID in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] startCheckoutSession: Failed to store customer ID:", updateError)
        throw new Error("Nelze uložit customer ID: " + updateError.message)
      }
      console.log("[v0] startCheckoutSession: Customer ID uložen v Supabase")
    }

    // Create checkout session
    console.log("[v0] startCheckoutSession: Creating Stripe checkout session")
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan: "premium",
          user_id: user.id,
        },
      },
    })

    console.log("[v0] startCheckoutSession: Stripe session vytvořena:", session.id)
    
    if (!session.client_secret) {
      console.error("[v0] startCheckoutSession: Stripe session nemá client_secret!")
      throw new Error("Chyba Stripe: chybí client_secret")
    }
    
    console.log("[v0] startCheckoutSession: SUCCESS - client_secret je připravena")
    return session.client_secret
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] startCheckoutSession: CHYBA -", errorMsg)
    if (error instanceof Error && error.stack) {
      console.error("[v0] startCheckoutSession: Stack trace:", error.stack)
    }
    throw error
  }
}
