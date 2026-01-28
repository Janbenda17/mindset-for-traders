import { NextResponse } from "next/server"

// Stripe endpoint temporarily disabled to fix build
export async function POST() {
  return NextResponse.json(
    { error: "Endpoint under maintenance" },
    { status: 503 }
  )
}
