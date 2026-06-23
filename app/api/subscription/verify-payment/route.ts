import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

/**
 * Unified payment verification endpoint
 * This endpoint directly checks Stripe for active subscriptions and updates the database
 * Used after checkout to confirm payment was successful
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: "Email is required" 
      }, { status: 400 })
    }

    console.log("[v0] [VERIFY-PAYMENT] Starting verification for:", email)

    const supabaseAdmin = createAdminClient()

    // Step 1: Find user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError || !users) {
      console.error("[v0] [VERIFY-PAYMENT] Failed to list users:", userError)
      return NextResponse.json({ 
        success: false, 
        error: "User lookup failed" 
      }, { status: 500 })
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error("[v0] [VERIFY-PAYMENT] User not found:", email)
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    console.log("[v0] [VERIFY-PAYMENT] Found user:", user.id)

    // Step 2: Get profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id, is_premium, subscription_status")
      .eq("user_id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("[v0] [VERIFY-PAYMENT] Profile not found:", profileError)
      return NextResponse.json({ 
        success: false, 
        error: "Profile not found" 
      }, { status: 404 })
    }

    // If already premium, return success immediately
    if (profile.is_premium && profile.subscription_status === "active") {
      console.log("[v0] [VERIFY-PAYMENT] Already premium")
      return NextResponse.json({ 
        success: true, 
        isPremium: true,
        alreadyPremium: true
      })
    }

    if (!profile.stripe_customer_id) {
      console.error("[v0] [VERIFY-PAYMENT] No Stripe customer ID")
      return NextResponse.json({ 
        success: false, 
        error: "No Stripe customer ID found" 
      }, { status: 400 })
    }

    console.log("[v0] [VERIFY-PAYMENT] Checking Stripe for customer:", profile.stripe_customer_id)

    // Step 3: Query Stripe for ALL subscriptions (active, trialing, or past_due)
    const subscriptions = await getStripe().subscriptions.list({
      customer: profile.stripe_customer_id,
      limit: 10
    })

    console.log("[v0] [VERIFY-PAYMENT] Found", subscriptions.data.length, "subscription(s)")

    // Find any active, trialing, or past_due subscription
    const activeSubscription = subscriptions.data.find(
      sub => sub.status === "active" || sub.status === "trialing" || sub.status === "past_due"
    )

    if (activeSubscription) {
      console.log("[v0] [VERIFY-PAYMENT] ✓ Active subscription found:", {
        id: activeSubscription.id,
        status: activeSubscription.status
      })

      // Step 4: Update profile to premium
      const updateData = {
        subscription_status: activeSubscription.status,
        subscription_tier: "premium",
        is_premium: true,
        trading_mode: "live", // Automatically switch to live mode
        trial_ends_at: activeSubscription.trial_end 
          ? new Date(activeSubscription.trial_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] [VERIFY-PAYMENT] Failed to update profile:", updateError)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to update profile" 
        }, { status: 500 })
      }

      console.log("[v0] [VERIFY-PAYMENT] ✓ Profile updated to premium")

      return NextResponse.json({ 
        success: true, 
        isPremium: true,
        subscriptionId: activeSubscription.id,
        status: activeSubscription.status
      })
    } else {
      // No active subscription found
      console.log("[v0] [VERIFY-PAYMENT] No active subscription in Stripe")
      
      // Log all subscription statuses for debugging
      if (subscriptions.data.length > 0) {
        console.log("[v0] [VERIFY-PAYMENT] Subscription statuses:", 
          subscriptions.data.map(s => ({ id: s.id, status: s.status }))
        )
      }

      return NextResponse.json({ 
        success: false,
        isPremium: false,
        error: "No active subscription found"
      }, { status: 402 })
    }
  } catch (error) {
    console.error("[v0] [VERIFY-PAYMENT] Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
