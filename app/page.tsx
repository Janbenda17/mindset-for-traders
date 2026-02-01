import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-center px-6 md:px-12">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-orange-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl text-center space-y-8">
        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-neutral-900 leading-tight">
          Mindtrader je nástroj pro každodenní řízení psychiky, disciplíny a rozhodování tradera.
        </h1>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-neutral-600 font-light tracking-wide">
          Analýza emocí v reálném čase
        </p>

        {/* CTA Button */}
        <div className="pt-8 flex justify-center">
          <Link href="/product-tour">
            <Button
              size="lg"
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Spustit demo ZDARMA
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
