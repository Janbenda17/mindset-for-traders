export default function TradingPlanLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Loading Trading Plan...</h3>
          <p className="text-muted-foreground">Preparing your trading strategy form</p>
        </div>
      </div>
    </div>
  )
}
