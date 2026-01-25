'use server'

import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'

const PRICE_ID = 'price_1S59GOL0tgTNaSwwEqyW1brC'

export async function startCheckoutSession(email: string, name: string) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] startCheckoutSession: Not authenticated")
      throw new Error("Not authenticated")
    }

    console.log("[v0] startCheckoutSession: Creating checkout for user:", user.id)

    // Get or create Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[v0] startCheckoutSession: Error fetching profile:", profileError)
      throw new Error("Database error")
    }

    let customerId = profile?.stripe_customer_id
    
    if (!customerId) {
      console.log("[v0] startCheckoutSession: Creating new customer for:", email)
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          user_id: user.id,
          app: "mindtrader",
        },
      })
      customerId = customer.id
      console.log("[v0] startCheckoutSession: New customer created:", customerId)

      // Store customer ID immediately
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] startCheckoutSession: Error storing customer ID:", updateError)
        throw new Error("Failed to store customer")
      }
      console.log("[v0] startCheckoutSession: ✓ Customer ID stored")
    } else {
      console.log("[v0] startCheckoutSession: Using existing customer:", customerId)
    }

    // Create embedded checkout session
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
          user_email: email,
        },
      },
      metadata: {
        plan: "premium",
        user_id: user.id,
        user_email: email,
      },
    })

    console.log("[v0] startCheckoutSession: Session created:", session.id, "client_secret:", session.client_secret ? "✓" : "✗")

    return session.client_secret
  } catch (error) {
    console.error("[v0] startCheckoutSession error:", error instanceof Error ? error.message : String(error))
    throw error
  }
}
