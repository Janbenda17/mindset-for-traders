'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
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
      router.push('/account')
    }
  }

  // Placeholder slides - uživatel je nahradí skutečnými obrázky
  const slides = [
    {
      id: 1,
      title: 'AI ANALYZUJE EMOCE U KAŽDÉHO OBCHODU',
      description: 'Zjisti, co cítíš před, během a po každém obchodu',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/22trade-wMaPbN2geV7dORJ8pJ5v6w0InDEmOI.png'
    },
    {
      id: 4,
      title: 'AI odhalí tvoje slabá místa',
      description: 'Objev, kde prosakuje tvůj trading mindset - emocí jako FOMO, Revenge, Fear, Greed',
      image: '/slides-4.jpg'
    },
    {
      id: 8,
      title: 'Znáš tě. A radí přímý to být',
      description: 'Psychologický profil a personalizované doporučení na míru tvému stylu',
      image: '/slides-8.jpg'
    },
    {
      id: 9,
      title: 'Ukládá tvoje vzorce chování',
      description: 'Analýza tvého sleep, disciplíny a stress levelu pro personalizované doporučení',
      image: '/slides-9.jpg'
    },
    {
      id: 2,
      title: 'Nebojíš se diagnózy. Chceš vyhrát.',
      description: 'Fail Log s AI analýzou a plánem nápravy pro tvoje obchodní chyby',
      image: '/slides-2.jpg'
    },
    {
      id: 7,
      title: 'Trading není o dnešku. Je o dlouhodobě hře.',
      description: 'Definuj jasné cíle, měř progres a drž disciplínu v čase',
      image: '/slides-7.jpg'
    },
    {
      id: 3,
      title: 'Najde ti nejlepšího buddyho do páru',
      description: 'MindTrader najde tě ideálního trading partnera pro rychlejší růst',
      image: '/slides-3.jpg'
    },
    {
      id: 6,
      title: 'Z -$2,000 na +$5,400 za 3 měsíce',
      description: 'Objev, kde prosakuje tvůj trading mindset - skutečné transformace traderů',
      image: '/slides-6.jpg'
    }
  ]

  const stats = [
    { value: '+600', label: 'Aktivních traderů' },
    { value: '1900+', label: 'Zachráněných impulsivních rozhodnutí' },
    { value: '-42%', label: 'Průměrné snížení emočních chyb' }
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

      {/* Premium Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-yellow-900/80 to-orange-900/80 backdrop-blur-sm border-b border-yellow-500/30 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs md:text-sm">
          <span className="text-yellow-100">
            <span className="font-bold text-white">Premium:</span> Only for <span className="font-bold text-white">1499</span> <span className="line-through text-yellow-200">2499</span> <span className="text-yellow-300 font-semibold">Ending soon</span>
          </span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 pt-48 px-4 md:px-8 lg:px-12 pb-20 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 px-4"
        >
          <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-7xl font-black text-white mb-5 sm:mb-6 md:mb-8 leading-[1.15] max-w-5xl mx-auto">
            <span className="bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent">
              #1 Tool for Psychology<br />in Trading
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-purple-100 leading-snug sm:leading-relaxed max-w-3xl mx-auto font-semibold">
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
          {/* 3D Perspective Carousel */}
          <div className="relative px-2 sm:px-8 md:px-20 lg:px-32 py-8 md:py-12">
            {/* Carousel Container with perspective */}
            <div className="relative h-[300px] sm:h-[350px] md:h-[500px] flex items-center justify-center" style={{ perspective: '2000px' }}>
              
              {/* Previous Slide Preview - Left */}
              <motion.div
                key={`prev-${currentSlide}`}
                initial={{ opacity: 0, x: -100, rotateY: 45, scale: 0.7 }}
                animate={{ opacity: 0.4, x: 0, rotateY: 35, scale: 0.75 }}
                transition={{ duration: 0.5 }}
                className="absolute left-0 md:left-10 z-10 cursor-pointer hidden md:block"
                onClick={prevSlide}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img 
                  src={slides[currentSlide === 0 ? slides.length - 1 : currentSlide - 1].image}
                  alt="Previous"
                  className="w-64 lg:w-80 h-auto rounded-2xl shadow-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all"
                />
              </motion.div>

              {/* Current Slide - Center */}
              <motion.div
                key={`current-${currentSlide}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="relative z-20"
              >
                <div className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl max-w-[90vw] sm:max-w-none">
                  <img 
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-full sm:w-[400px] md:w-[500px] lg:w-[600px] h-auto rounded-xl md:rounded-2xl shadow-2xl"
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl -z-10" />
                </div>
              </motion.div>

              {/* Next Slide Preview - Right */}
              <motion.div
                key={`next-${currentSlide}`}
                initial={{ opacity: 0, x: 100, rotateY: -45, scale: 0.7 }}
                animate={{ opacity: 0.4, x: 0, rotateY: -35, scale: 0.75 }}
                transition={{ duration: 0.5 }}
                className="absolute right-0 md:right-10 z-10 cursor-pointer hidden md:block"
                onClick={nextSlide}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img 
                  src={slides[(currentSlide + 1) % slides.length].image}
                  alt="Next"
                  className="w-64 lg:w-80 h-auto rounded-2xl shadow-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all"
                />
              </motion.div>

              {/* Navigation Buttons - Mobile */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 md:hidden bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl w-12 h-12 rounded-full z-30"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl w-12 h-12 rounded-full z-30"
                onClick={nextSlide}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-10 h-3 shadow-lg shadow-purple-500/50' 
                      : 'bg-white/20 hover:bg-white/40 w-3 h-3'
                  }`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="hidden md:block absolute top-2 right-4 sm:right-8 md:right-24 text-xs sm:text-sm font-bold text-purple-300 bg-gradient-to-r from-purple-900/80 to-pink-900/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md border border-purple-400/30 shadow-lg">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-16 md:mb-20 px-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-8 hover:bg-white/10 transition-all"
            >
              <p className="text-xl sm:text-2xl md:text-4xl font-black text-white text-center mb-1 md:mb-2">{stat.value}</p>
              <p className="text-[10px] sm:text-xs md:text-base text-purple-200 text-center leading-tight md:leading-relaxed">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Two-Step Premium Journey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-8 md:py-12 px-4"
        >
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-400 flex items-center justify-center mb-4 md:mb-6">
              <span className="text-3xl md:text-4xl font-bold text-gray-300">1</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2">
              Prohlédni si software ve virtuálním modu
            </h3>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-400 flex items-center justify-center mb-4 md:mb-6">
              <span className="text-3xl md:text-4xl font-bold text-gray-300">2</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
              Zakup premium a přepni na LIVE režim
            </h3>
          </div>
        </motion.div>

        {/* Get Started CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Připraven začít?</h2>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-base md:text-lg px-8 md:px-12 py-3 md:py-4 rounded-lg"
            onClick={handlePricingClick}
          >
            Get Started
          </Button>
        </motion.div>

        {/* Premium Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-yellow-900/60 via-yellow-800/40 to-orange-900/60 border-2 border-yellow-400/60 p-6 sm:p-8 md:p-12 shadow-2xl shadow-yellow-500/30 mx-4"
        >
          {/* Golden glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5" />
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 text-center">
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-3 md:mb-4">
              Premium: <span className="text-yellow-300">Ending soon</span>
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-yellow-50 mb-6 md:mb-8 font-semibold">
              Jen <span className="text-yellow-300 text-2xl sm:text-2xl md:text-3xl">1499 Kč</span> (místo <span className="text-yellow-200 line-through">2499 Kč</span>)
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
    </div>
  )
}
