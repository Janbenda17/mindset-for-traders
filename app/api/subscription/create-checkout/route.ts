import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
}
