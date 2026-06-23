import { redirect } from "next/navigation"

// Analytics byla sloučena do /journal (záložky Mindset, Vzorce, Akční plán).
export default function AnalyticsRedirect() {
  redirect("/journal")
}
