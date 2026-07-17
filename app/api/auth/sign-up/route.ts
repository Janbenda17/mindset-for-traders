import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, trialWaitingEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email a heslo jsou povinné" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: undefined,
      },
    })

    if (error) {
      console.error("[v0] Signup error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Vytváření uživatele selhalo" }, { status: 400 })
    }

    console.log("[v0] User registered successfully:", data.user.id)

    let profile = null
    let attempts = 0
    const maxAttempts = 8

    while (!profile && attempts < maxAttempts) {
      attempts++
      const delay = Math.min(300 * attempts, 1500)
      await new Promise((resolve) => setTimeout(resolve, delay))

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle()

      if (profileData) {
        profile = profileData
        console.log("[v0] Profile created by trigger:", profile)
        break
      }
    }

    if (!profile) {
      // The auth user was created successfully even if the profile trigger hasn't
      // caught up yet - don't fail the whole signup over this, just log it.
      console.warn("[v0] Profile not confirmed after", maxAttempts, "attempts - proceeding anyway")
    }

    // Signup funnel email #0 (see lib/email.ts trialWaitingEmail) - sent
    // synchronously here rather than waiting for the daily cron, so the
    // user gets it within seconds of registering instead of up to 24h
    // later. Awaited (not truly fire-and-forget) because Vercel serverless
    // functions can be frozen/killed once the response is sent, so an
    // un-awaited send could simply never go out. Wrapped in its own
    // try/catch so a Resend outage or missing API key never fails the
    // signup itself - the daily cron's email #1 is a fallback if this one
    // doesn't land anyway. No *_sent_at tracking column needed: signUp only
    // succeeds once per email address, so this can only fire once per real
    // registration.
    try {
      if (data.user.email) {
        const { subject, html } = trialWaitingEmail({ displayName: name || undefined })
        const result = await sendEmail({ to: data.user.email, subject, html })
        if (!result.success) {
          console.error("[v0] trialWaitingEmail send failed:", result.error)
        }
      }
    } catch (emailErr) {
      console.error("[v0] Exception sending trialWaitingEmail:", emailErr)
    }

    const response = NextResponse.json(
      {
        user: data.user,
        session: data.session,
        message: "Účet byl úspěšně vytvořen",
      },
      { status: 200 },
    )

    // Copy auth cookies if session exists
    if (data.session) {
      const supabaseResponse = await supabase.auth.setSession(data.session)
      if (supabaseResponse.data.session) {
        const cookiesList = supabaseResponse.data.session ? Object.entries(request.cookies.getAll()) : []
        cookiesList.forEach(([name, cookie]) => {
          if (typeof cookie === "object" && "value" in cookie) {
            response.cookies.set(name, cookie.value, cookie)
          }
        })
      }
    }

    return response
  } catch (error) {
    console.error("[v0] Signup API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
