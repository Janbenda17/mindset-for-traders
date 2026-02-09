import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")
    
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    console.log("[v0] [CHECK-PAYMENT] Checking payment status for:", email)

    const supabaseAdmin = createAdminClient()

    // Get user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError || !users) {
      console.error("[v0] [CHECK-PAYMENT] Error listing users:", userError)
      return NextResponse.json({ success: false, message: "User lookup failed" }, { status: 500 })
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error("[v0] [CHECK-PAYMENT] User not found:", email)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    console.log("[v0] [CHECK-PAYMENT] Found user:", user.id)

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("[v0] [CHECK-PAYMENT] Error fetching profile:", profileError)
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 })
    }

    if (!profile.stripe_customer_id) {
      console.error("[v0] [CHECK-PAYMENT] No Stripe customer ID")
      return NextResponse.json({ success: false, message: "No Stripe customer" }, { status: 400 })
    }

    console.log("[v0] [CHECK-PAYMENT] Checking Stripe for:", profile.stripe_customer_id)

    // Query Stripe directly for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1
    })

    console.log("[v0] [CHECK-PAYMENT] Found subscriptions:", subscriptions.data.length)

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0]
      console.log("[v0] [CHECK-PAYMENT] ✓ Active subscription found:", subscription.id, subscription.status)

      // Update profile in database
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: subscription.status,
          subscription_tier: "premium",
          is_premium: true,
          stripe_subscription_id: subscription.id,
          trading_mode: "live",
          trial_ends_at: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] [CHECK-PAYMENT] Error updating profile:", updateError)
        return NextResponse.json({ success: false, message: "Database update failed" }, { status: 500 })
      }

      console.log("[v0] [CHECK-PAYMENT] ✓ Profile updated to premium")
      return NextResponse.json({ 
        success: true, 
        isPremium: true,
        subscriptionId: subscription.id
      })
    } else {
      // No active subscription found
      console.log("[v0] [CHECK-PAYMENT] No active subscription in Stripe")
      return NextResponse.json({ 
        success: false,
        isPremium: false,
        message: "No active subscription"
      }, { status: 402 })
    }
  } catch (error) {
    console.error("[v0] [CHECK-PAYMENT] Error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    )
  }
}
