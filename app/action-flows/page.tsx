"use client"

import { ActionFlowGuide } from "@/components/action-flow-guide"
import { useSearchParams } from "next/navigation"

export default function ActionFlowsPage() {
  const searchParams = useSearchParams()
  const flowId = searchParams.get("flow")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6 pt-20">
        <ActionFlowGuide flowId={flowId || undefined} />
      </div>
    </div>
  )
}
