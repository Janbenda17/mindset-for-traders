import crypto from "crypto"

// Server-side Meta Conversions API helper.
// Save this file as: lib/meta-capi.ts
//
// Sends conversion events directly from the backend, bypassing ad blockers,
// Safari ITP, and any browser privacy protection that silently drops the
// client-side Pixel request (facebook.com/tr).
//
// Requires META_CAPI_ACCESS_TOKEN in Vercel env vars (Settings > Environment
// Variables, on the v0-trader-mindset-software project - that's the one that
// actually serves www.mindtrader.cz).
//
// Generate the token in Meta Events Manager > Data Sources > your pixel
// (1039876665305483) > Settings > Conversions API > "Generate access token".

const PIXEL_ID = "1039876665305483"
const GRAPH_API_VERSION = "v21.0"

function sha256(value: string): string {
return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

interface SendMetaEventParams {
eventName: string
eventId: string
eventSourceUrl: string
email?: string
clientIp?: string
userAgent?: string
fbp?: string
fbc?: string
value?: number
currency?: string
testEventCode?: string
}

export async function sendMetaConversionEvent(params: SendMetaEventParams) {
const accessToken = process.env.META_CAPI_ACCESS_TOKEN

if (!accessToken) {
console.warn("[meta-capi] META_CAPI_ACCESS_TOKEN not set - skipping server-side event")
return null
}

const userData: Record<string, any> = {}
if (params.email) userData.em = [sha256(params.email)]
if (params.clientIp) userData.client_ip_address = params.clientIp
if (params.userAgent) userData.client_user_agent = params.userAgent
if (params.fbp) userData.fbp = params.fbp
if (params.fbc) userData.fbc = params.fbc

const customData: Record<string, any> = {}
if (params.value !== undefined) customData.value = params.value
if (params.currency) customData.currency = params.currency

const body: Record<string, any> = {
data: [
{
event_name: params.eventName,
event_time: Math.floor(Date.now() / 1000),
event_id: params.eventId, // must match the client-side fbq eventID for dedup
event_source_url: params.eventSourceUrl,
action_source: "website",
user_data: userData,
...(Object.keys(customData).length > 0 ? { custom_data: customData } : {}),
},
],
}

// Optional: when set, Meta routes this event into the Test Events tab
// (visible instantly) instead of counting it as live production data.
if (params.testEventCode) {
body.test_event_code = params.testEventCode
}

try {
const res = await fetch(
`https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`,
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
},
)

if (!res.ok) {
const errText = await res.text()
console.error("[meta-capi] Meta API rejected event:", res.status, errText)
return null
}

return await res.json()
} catch (err) {
console.error("[meta-capi] Failed to reach Meta Graph API:", err)
return null
}
}
