import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")
    
    if (!email) {
      return NextResponse.json({ error: "Email je povinný" }, { status: 400 })
    }

    console.log(`[v0] Verifying payment for email: ${email}`)

    // Create service client for admin operations
    const supabase = await createServiceClient()

    // Get user from Supabase by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error("[v0] Error listing users:", userError)
      return NextResponse.json({ error: "Chyba při ověření uživatele" }, { status: 500 })
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error("[v0] User not found with email:", email)
      return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 })
    }

    console.log(`[v0] Found user: ${user.id}`)

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_status")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError)
      return NextResponse.json({ error: "Profil nenalezen" }, { status: 404 })
    }

    if (!profile?.stripe_customer_id) {
      console.error("[v0] No Stripe customer ID for user:", user.id)
      return NextResponse.json({ error: "Žádný Stripe zákazník" }, { status: 400 })
    }

    console.log(`[v0] Checking Stripe for customer: ${profile.stripe_customer_id}`)

    // Check Stripe for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "all",
      limit: 100
    })

    console.log(`[v0] Found ${subscriptions.data.length} subscriptions for customer`)

    // Find active or trialing subscription
    const activeSubscription = subscriptions.data.find(
      sub => sub.status === "active" || sub.status === "trialing"
    )

    if (activeSubscription) {
      console.log(`[v0] ✓ Found active subscription: ${activeSubscription.id} (status: ${activeSubscription.status})`)

      // Update profile to premium
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: activeSubscription.status,
          subscription_tier: "premium",
          is_premium: true,
          stripe_subscription_id: activeSubscription.id,
          trial_ends_at: activeSubscription.trial_end 
            ? new Date(activeSubscription.trial_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] Error updating profile:", updateError)
        return NextResponse.json({ error: "Chyba při aktualizaci profilu" }, { status: 500 })
      }

      console.log(`[v0] ✓ Profile updated to premium for user: ${user.id}`)
      return NextResponse.json({ 
        success: true, 
        message: "Platba ověřena",
        isPremium: true,
        subscriptionStatus: activeSubscription.status
      })
    } else {
      console.log("[v0] No active subscription found in Stripe")
      return NextResponse.json({ 
        success: false,
        message: "Žádná aktivní platba nenalezena",
        isPremium: false,
        subscriptions: subscriptions.data.map(sub => ({ id: sub.id, status: sub.status }))
      }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chyba při ověření" },
      { status: 500 }
    )
  }
}
