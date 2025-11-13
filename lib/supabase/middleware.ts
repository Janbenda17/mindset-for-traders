import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Simply pass through - auth is handled client-side
  return NextResponse.next({
    request,
  })
}
