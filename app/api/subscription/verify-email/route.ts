import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")
    
    console.log("[v0] [VERIFY-EMAIL] Starting email verification:", email)
    
    if (!email) {
      console.log("[v0] [VERIFY-EMAIL] Error: Email is required")
      return NextResponse.json({ error: "Email je povinný" }, { status: 400 })
    }

    // Use admin client directly to bypass auth issues
    const supabaseAdmin = createAdminClient()

    // Get user by email using auth.users query
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    console.log("[v0] [VERIFY-EMAIL] Listed users, error:", userError ? userError.message : "none")
    
    if (userError) {
      console.error("[v0] [VERIFY-EMAIL] Error listing users:", userError)
      return NextResponse.json({ success: false, message: "Chyba při ověření uživatele" }, { status: 500 })
    }

    const user = users?.find(u => u.email === email)
    
    if (!user) {
      console.error("[v0] [VERIFY-EMAIL] User not found with email:", email)
      return NextResponse.json({ 
        success: false,
        message: "Uživatel nenalezen" 
      }, { status: 404 })
    }

    console.log("[v0] [VERIFY-EMAIL] Found user:", user.id)

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id, subscription_status, is_premium, email")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] [VERIFY-EMAIL] Error fetching profile:", profileError)
      return NextResponse.json({ 
        success: false,
        message: "Profil nenalezen" 
      }, { status: 404 })
    }

    console.log("[v0] [VERIFY-EMAIL] Profile found:", {
      stripe_customer_id: profile?.stripe_customer_id,
      subscription_status: profile?.subscription_status,
      is_premium: profile?.is_premium
    })

    if (!profile?.stripe_customer_id) {
      console.error("[v0] [VERIFY-EMAIL] No Stripe customer ID for user:", user.id)
      return NextResponse.json({ 
        success: false,
        message: "Žádný Stripe zákazník" 
      }, { status: 400 })
    }

    console.log("[v0] [VERIFY-EMAIL] Checking Stripe for customer:", profile.stripe_customer_id)

    // Check Stripe for active subscriptions
    const subscriptions = await getStripe().subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "all",
      limit: 100
    })

    console.log("[v0] [VERIFY-EMAIL] Found subscriptions:", subscriptions.data.map(s => ({ id: s.id, status: s.status })))

    // Find active or trialing subscription
    const activeSubscription = subscriptions.data.find(
      sub => sub.status === "active" || sub.status === "trialing"
    )

    if (activeSubscription) {
      console.log("[v0] [VERIFY-EMAIL] Active subscription found:", activeSubscription.id, activeSubscription.status)

      // Update profile to premium - use admin client
      const updateData: Record<string, unknown> = {
        subscription_status: activeSubscription.status,
        subscription_tier: "premium",
        is_premium: true,
        stripe_subscription_id: activeSubscription.id,
        trading_mode: "live",  // Switch to live mode automatically
        trial_ends_at: activeSubscription.trial_end 
          ? new Date(activeSubscription.trial_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      }

      console.log("[v0] [VERIFY-EMAIL] Updating profile with:", JSON.stringify(updateData))

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id)
        .select()

      if (updateError) {
        console.error("[v0] [VERIFY-EMAIL] Error updating profile:", updateError)
        return NextResponse.json({ 
          success: false,
          message: "Chyba při aktualizaci profilu" 
        }, { status: 500 })
      }

      if (updated && updated.length > 0) {
        console.log("[v0] [VERIFY-EMAIL] Profile updated successfully:", {
          is_premium: updated[0].is_premium,
          trading_mode: updated[0].trading_mode,
          subscription_status: updated[0].subscription_status
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: "Platba ověřena",
        isPremium: true,
        subscriptionStatus: activeSubscription.status
      })
    } else {
      console.log("[v0] [VERIFY-EMAIL] No active subscription found")
      return NextResponse.json({ 
        success: false,
        message: "Žádná aktivní platba nenalezena",
        isPremium: false
      }, { status: 402 })
    }
  } catch (error) {
    console.error("[v0] [VERIFY-EMAIL] Verification error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Chyba při ověření" },
      { status: 500 }
    )
  }
}
