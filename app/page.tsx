'use client'

import { useState } from 'react'
import { TopNavigation } from '@/components/top-navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Users, TrendingUp, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()
  const { user } = useAuth()

  const handlePricingClick = () => {
    if (!user) {
      router.push('/signup')
    } else {
      router.push('/pricing')
    }
  }

  // Placeholder slides - uživatel je nahradí skutečnými obrázky
  const slides = [
    {
      id: 1,
      title: 'Kontrola nad hlavou',
      description: 'MindTrader sleduje tvůj stav drží, než riskneš kapitál',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1trad-LQpvd53448ZGJKO9CkDq0ywkPOmCeO.png'
    },
    {
      id: 2,
      title: 'Success Stories',
      description: 'Z -$2,000 na +$5,400 za 3 měsíce - objev, kde prosakuje tvůj trading mindset',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2trad-Qb6D802DGrceTr3vwX8rHuVKNdYIRR.png'
    },
    {
      id: 3,
      title: 'AI odhalí tvoje slabá místa',
      description: 'Objev, kde prosakuje tvůj trading mindset - FOMO, Revenge, Fear, Greed a další',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3trad-SNNNBZUkAvOhrGjkH7BPJ0XIqykqal.png'
    },
    {
      id: 4,
      title: 'Nebojíš se diagnózy. Chceš vyhrát.',
      description: 'Fail Log s AI analýzou a plánem nápravy pro tvoje obchodní chyby',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4trad-MuXi3HW1wwXJsxB8Ugt4aci1PfCHUU.png'
    },
    {
      id: 5,
      title: 'Trading není o dnešku',
      description: 'Definuj jasné cíle, měř progres a drž disciplínu v čase',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5trad-i8UVSQQzNAvkgE4FE5ykgz2VYSjfLL.png'
    },
    {
      id: 6,
      title: 'Víš, jak si vedeš. Každý den.',
      description: 'Dashboard s kalendářem, statistikami a všemi tvojimi trading daty na jednom místě',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6trad-JwhkzN3lvXZnMxeOjyrLep3OZRjlHP.png'
    },
    {
      id: 7,
      title: 'Máš kontrolu nad hlavou?',
      description: 'MindTrader sleduje tvůj stav drží, než vstoupíš do trhu',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7trad-lOEHhB1QY9LQFgAc3cmdNIrsPPuhDQ.png'
    },
    {
      id: 8,
      title: 'Ukládá tvoje vzorce chování',
      description: 'Personalizované zpětné vazby - Sleep, Disciplína, Stress level s doporučeními',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8trad-ajaJJwZ6WZFvYuVLUfHtjNrDodRMcX.png'
    }
  ]

  const stats = [
    { value: '+600', label: 'Aktivních traderů', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { value: '1900+', label: 'Zachráněných impulsivních rozhodnutí', icon: Target, color: 'from-green-500 to-emerald-500' },
    { value: '-42%', label: 'Průměrné snížení emočních chyb', icon: TrendingUp, color: 'from-purple-500 to-indigo-500' }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Galaxy background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      
      {/* Stars */}
      <div className="fixed inset-0 opacity-60">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <TopNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 pt-32 px-4 md:px-8 lg:px-12 pb-20 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent">
              #1 Tool for Psychology<br />in Trading
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 leading-relaxed max-w-4xl mx-auto">
            Analyzes your emotions in real time and stops you before you burn your account
          </p>
        </motion.div>

        {/* Image Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
            <CardContent className="p-0 relative">
              {/* Carousel Container */}
              <div className="relative w-full h-auto flex items-center justify-center">
                {/* Current Slide */}
                <div className="w-full flex items-center justify-center">
                  <img 
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-full h-auto max-h-[600px] object-cover rounded-2xl"
                  />
                </div>

                {/* Navigation Buttons */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 hover:bg-black/70 text-white"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 hover:bg-black/70 text-white"
                  onClick={nextSlide}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              {/* Slide Indicators */}
              <div className="flex items-center justify-center gap-2 py-4 bg-black/20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-purple-400 w-8' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 mx-auto`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-black text-white text-center mb-2">{stat.value}</p>
              <p className="text-purple-200 text-center leading-relaxed">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-900/60 via-yellow-800/40 to-orange-900/60 border-2 border-yellow-400/60 p-8 md:p-12 shadow-2xl shadow-yellow-500/30"
        >
          {/* Golden glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5" />
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 text-center">
            <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
              Premium: <span className="text-yellow-300">Ending soon</span>
            </h3>
            <p className="text-xl text-yellow-50 mb-8 font-semibold">
              Jen <span className="text-yellow-300 text-3xl">1499 Kč</span> (místo <span className="text-yellow-200 line-through">2499 Kč</span>)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-black text-lg px-10 py-7 rounded-xl shadow-lg shadow-yellow-500/50"
                onClick={handlePricingClick}
              >
                Aktivovat LIVE
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-900/40 font-bold text-lg px-10 py-7 rounded-xl"
                onClick={handlePricingClick}
              >
                Více informací
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
