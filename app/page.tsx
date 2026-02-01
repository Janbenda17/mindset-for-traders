import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center px-6 md:px-12 relative overflow-hidden">
      {/* Galaxy background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      
      {/* Stars */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-[20%] left-[80%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[60%] left-[25%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[70%] left-[70%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] left-[50%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-[85%] left-[40%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[90%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* Nebula clouds */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl text-center space-y-8">
        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
          Mindtrader je nástroj pro každodenní řízení psychiky, disciplíny a rozhodování tradera.
        </h1>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-purple-200 font-light tracking-wide">
          Analýza emocí v reálném čase
        </p>

        {/* CTA Button */}
        <div className="pt-8 flex justify-center">
          <Link href="/product-tour">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-lg px-10 py-7 rounded-full shadow-2xl shadow-purple-900/50 hover:shadow-purple-900/70 transition-all duration-300 hover:scale-105"
            >
              Spustit demo ZDARMA
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
