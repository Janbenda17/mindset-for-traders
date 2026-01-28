import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ status: "Webhook not configured" }, { status: 200 })
}
