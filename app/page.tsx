import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-black">
          Mindtrader je nástroj pro každodenní řízení psychiky, disciplíny a rozhodování tradera.
        </h1>
        
        <p className="text-lg text-gray-600">
          Analýza emocí v reálném čase
        </p>

        <div className="pt-4">
          <Link href="/product-tour">
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white font-semibold text-base px-8 py-6"
            >
              Spustit demo ZDARMA
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
