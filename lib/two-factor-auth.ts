// Two-Factor Authentication service
import { createClient } from "@/lib/supabase/client"

export type TwoFactorMethod = "email" | "sms" | "totp"

export interface TwoFactorSettings {
  enabled: boolean
  method: TwoFactorMethod
  phoneNumber?: string
  email?: string
  factorId?: string
  verifiedAt?: string
}

// Get 2FA settings from localStorage
export function getTwoFactorSettings(): TwoFactorSettings {
  if (typeof window === "undefined") {
    return { enabled: false, method: "email" }
  }

  try {
    const userData = localStorage.getItem("user-data")
    if (userData) {
      const parsed = JSON.parse(userData)
      return parsed.settings?.twoFactor || { enabled: false, method: "email" }
    }
  } catch (error) {
    console.error("Error loading 2FA settings:", error)
  }

  return { enabled: false, method: "email" }
}

// Save 2FA settings to localStorage
export function saveTwoFactorSettings(settings: TwoFactorSettings): void {
  if (typeof window === "undefined") return

  try {
    const userData = JSON.parse(localStorage.getItem("user-data") || "{}")
    if (!userData.settings) {
      userData.settings = {}
    }
    userData.settings.twoFactor = settings
    localStorage.setItem("user-data", JSON.stringify(userData))
    window.dispatchEvent(new Event("settings-updated"))
  } catch (error) {
    console.error("Error saving 2FA settings:", error)
  }
}

// Send verification code via email
export async function sendEmailVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code temporarily (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    localStorage.setItem("2fa-pending-code", JSON.stringify({ code, email, expiresAt }))

    // In production, you would send this via Supabase Edge Function or email service
    // For now, we'll simulate by showing the code in console (dev only)
    console.log(`[DEV] 2FA Code for ${email}: ${code}`)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Error sending email verification:", error)
    return { success: false, error: "Nepodařilo se odeslat ověřovací kód" }
  }
}

// Send verification code via SMS
export async function sendSMSVerificationCode(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code temporarily (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    localStorage.setItem("2fa-pending-code", JSON.stringify({ code, phoneNumber, expiresAt }))

    // In production, you would use Twilio, Supabase Phone Auth, or similar
    // For now, we'll simulate by showing the code in console (dev only)
    console.log(`[DEV] 2FA SMS Code for ${phoneNumber}: ${code}`)

    // Simulate SMS sending delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return { success: true }
  } catch (error) {
    console.error("Error sending SMS verification:", error)
    return { success: false, error: "Nepodařilo se odeslat SMS kód" }
  }
}

// Verify the code
export function verifyCode(inputCode: string): { success: boolean; error?: string } {
  try {
    const pending = localStorage.getItem("2fa-pending-code")
    if (!pending) {
      return { success: false, error: "Žádný kód nebyl odeslán" }
    }

    const { code, expiresAt } = JSON.parse(pending)

    // Check if expired
    if (new Date() > new Date(expiresAt)) {
      localStorage.removeItem("2fa-pending-code")
      return { success: false, error: "Kód vypršel, požádejte o nový" }
    }

    // Check if code matches
    if (code !== inputCode) {
      return { success: false, error: "Nesprávný kód" }
    }

    // Success - remove pending code
    localStorage.removeItem("2fa-pending-code")
    return { success: true }
  } catch (error) {
    console.error("Error verifying code:", error)
    return { success: false, error: "Chyba při ověřování kódu" }
  }
}

// Enable 2FA for user
export async function enableTwoFactor(
  method: TwoFactorMethod,
  contact: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  // Verify the code first
  const verification = verifyCode(code)
  if (!verification.success) {
    return verification
  }

  // Save 2FA settings
  const settings: TwoFactorSettings = {
    enabled: true,
    method,
    verifiedAt: new Date().toISOString(),
  }

  if (method === "email") {
    settings.email = contact
  } else if (method === "sms") {
    settings.phoneNumber = contact
  }

  saveTwoFactorSettings(settings)

  return { success: true }
}

// Disable 2FA for user
export function disableTwoFactor(): void {
  saveTwoFactorSettings({ enabled: false, method: "email" })
}

// Check if 2FA is required for login
export function isTwoFactorRequired(): boolean {
  const settings = getTwoFactorSettings()
  return settings.enabled
}

// Challenge 2FA during login
export async function challengeTwoFactor(): Promise<{ success: boolean; method: TwoFactorMethod; contact: string }> {
  const settings = getTwoFactorSettings()

  if (!settings.enabled) {
    return { success: false, method: "email", contact: "" }
  }

  const contact = settings.method === "email" ? settings.email || "" : settings.phoneNumber || ""

  if (settings.method === "email" && settings.email) {
    await sendEmailVerificationCode(settings.email)
  } else if (settings.method === "sms" && settings.phoneNumber) {
    await sendSMSVerificationCode(settings.phoneNumber)
  }

  return { success: true, method: settings.method, contact }
}
