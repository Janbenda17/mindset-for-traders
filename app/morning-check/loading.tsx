export default function MorningCheckLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="bg-slate-800/50 h-48 rounded-3xl" />

          {/* Info cards skeleton */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 h-32 rounded-xl" />
            <div className="bg-slate-800/50 h-32 rounded-xl" />
            <div className="bg-slate-800/50 h-32 rounded-xl" />
          </div>

          {/* Assessment form skeleton */}
          <div className="bg-slate-800/50 h-[600px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}
