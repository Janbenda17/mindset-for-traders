import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const timestamp = Date.now()
  const marker = `E2E_MARKER_${timestamp}`

  try {
    // STEP 1: Write marker trade
    const { data: writeData, error: writeError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        type: "trade",
        pair: "TEST/USD",
        symbol: "TEST/USD",
        direction: "LONG",
        entry_price: 1.0,
        exit_price: 1.1,
        quantity: 1,
        pnl: 0.1,
        date: new Date().toISOString().split("T")[0],
        notes: marker,
      })
      .select()
      .maybeSingle() // Changed from .single() to .maybeSingle()

    if (writeError) {
      console.error("[v0] E2E WRITE FAILED:", writeError)
      return NextResponse.json({ error: "Write failed", details: writeError.message }, { status: 500 })
    }

    console.log(`[v0] E2E WRITE OK user_id=${user.id}`)

    // STEP 2: Read back filtered by user_id
    const { data: readData, error: readError } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .ilike("notes", `%${marker}%`)

    if (readError) {
      console.error("[v0] E2E READ FAILED:", readError)
      return NextResponse.json({ error: "Read failed", details: readError.message }, { status: 500 })
    }

    const containsMarker = readData && readData.length > 0 && readData.some((t) => t.notes?.includes(marker))

    console.log(`[v0] E2E READ OK rows=${readData?.length || 0} contains marker=${containsMarker}`)

    // STEP 3: Clean up marker
    if (writeData?.id) {
      await supabase.from("journal_entries").delete().eq("id", writeData.id).eq("user_id", user.id)
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      marker,
      writeSuccess: !!writeData,
      readRowCount: readData?.length || 0,
      markerFound: containsMarker,
    })
  } catch (error: any) {
    console.error("[v0] E2E TEST ERROR:", error)
    return NextResponse.json({ error: "Test failed", details: error.message }, { status: 500 })
  }
}
