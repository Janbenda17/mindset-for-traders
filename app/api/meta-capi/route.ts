import { type NextRequest, NextResponse } from "next/server"
import { sendMetaConversionEvent } from "@/lib/meta-capi"

// Save this file as: app/api/meta-capi/route.ts
//
// The browser calls this endpoint right after a successful signup (see the
// register() function in contexts/auth-context.tsx). It runs server-side so
// the META_CAPI_ACCESS_TOKEN never reaches the client, and the event reaches
// Meta even if the visitor's browser blocked the client-side Pixel request.

export async function POST(req: NextRequest) {
      try {
              const { eventName, eventId, email, fbp, fbc, eventSourceUrl, value, currency } = await req.json()

        if (!eventName || !eventId) {
                  return NextResponse.json({ error: "Missing eventName or eventId" }, { status: 400 })
        }

        const clientIp =
                  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined
              const userAgent = req.headers.get("user-agent") || undefined

        await sendMetaConversionEvent({
                  eventName,
                  eventId,
                  email,
                  fbp,
                  fbc,
                  clientIp,
                  userAgent,
                  value,
                  currency,
                  eventSourceUrl: eventSourceUrl || req.headers.get("referer") || "https://www.mindtrader.cz",
        })

        return NextResponse.json({ ok: true })
      } catch (err) {
              console.error("[api/meta-capi] error:", err)
              return NextResponse.json({ error: "Internal error" }, { status: 500 })
      }
}
