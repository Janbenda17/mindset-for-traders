import { supabase } from "@/lib/supabase/client"

export const ensureOwnerLiveMode = async () => {
  try {
    // Find honza.newage@gmail.com and set to LIVE mode
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, email, trading_mode, role")
      .eq("email", "honza.newage@gmail.com")
      .single()

    if (error || !data) {
      console.log("[v0] Owner account not found or error:", error)
      return false
    }

    // If owner is in virtual mode, switch to live
    if (data.trading_mode !== "live" && data.role === "owner") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ trading_mode: "live" })
        .eq("user_id", data.user_id)

      if (updateError) {
        console.error("[v0] Failed to set owner to live mode:", updateError)
        return false
      }

      console.log("[v0] ✅ Owner (honza.newage@gmail.com) set to LIVE mode")
      return true
    }

    console.log("[v0] Owner is already in LIVE mode")
    return true
  } catch (error) {
    console.error("[v0] Error in ensureOwnerLiveMode:", error)
    return false
  }
}
