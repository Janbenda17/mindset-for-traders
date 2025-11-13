export default function DailyIntentionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-800/50 rounded-2xl" />
          <div className="h-64 bg-slate-800/50 rounded-2xl" />
          <div className="h-48 bg-slate-800/50 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
