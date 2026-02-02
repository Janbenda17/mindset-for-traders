'use client'

import { useState } from 'react'
import Link from 'next/link'
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
      title: 'AI Coach vždy vedle tebe',
      description: 'Profesionální AI asistent, který tě provádí každým obchodem a učí tě lepší rozhodování',
      image: '/mindtrader-slide-1.jpg'
    },
    {
      id: 2,
      title: 'Skutečné transformace traderů',
      description: 'Od ztrát k ziskům - vidíš přesné výsledky, které dosahují naši uživatelé',
      image: '/mindtrader-slide-2.jpg'
    },
    {
      id: 3,
      title: 'Rozpozná tvoje emoce',
      description: 'AI detekuje FOMO, strach, chamtivost a další emocí, které sabotují tvé obchody',
      image: '/mindtrader-slide-3.jpg'
    },
    {
      id: 4,
      title: 'Sleduj svůj pokrok každý den',
      description: 'Denní journal, tracker nálady a analýza - vše v jednom místě',
      image: '/mindtrader-slide-4.jpg'
    },
    {
      id: 5,
      title: 'Pokročilé analytiky na dosah',
      description: 'Komplexní statistiky, výkonnost a metriky pro lepší rozhodování',
      image: '/mindtrader-slide-5.jpg'
    },
    {
      id: 6,
      title: 'Najdi si ideálního trading partnera',
      description: 'AI matching s kompatibilními tradery pro společný růst a motivaci',
      image: '/mindtrader-slide-6.jpg'
    },
    {
      id: 7,
      title: 'AI vykomunikuje tvoje chyby',
      description: 'Detailní rozbor každého neúspěšného obchodu s konkrétním plánem nápravy',
      image: '/mindtrader-slide-7.jpg'
    },
    {
      id: 8,
      title: 'Postav si cíle a měř pokrok',
      description: 'Jaké máš cíle? MindTrader tě motivuje a sleduje tvůj postup',
      image: '/mindtrader-slide-8.jpg'
    },
    {
      id: 9,
      title: 'Poznaj své chování v obchodování',
      description: 'Psychologický profil tvého trading stylu - zjisti, co tě limituje',
      image: '/mindtrader-slide-9.jpg'
    },
    {
      id: 10,
      title: 'Nespělíš z chyb. Učíš se z nich.',
      description: 'Fail log s AI analýzou - každá chyba je oportunita pro zlepšení',
      image: '/mindtrader-slide-10.jpg'
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
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent">
              #1 Tool for Psychology<br />in Trading
            </span>
          </h1>
          <p className="text-base md:text-2xl text-purple-100 leading-relaxed max-w-4xl mx-auto">
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
          {/* Carousel Title */}
          <motion.div
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-xl md:text-4xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
              {slides[currentSlide].title}
            </h2>
            <p className="text-purple-200/80 text-sm md:text-lg">{slides[currentSlide].description}</p>
          </motion.div>

          {/* Carousel Card */}
          <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 overflow-hidden group">
            {/* Gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Carousel Container */}
            <div className="relative w-full flex items-center justify-center">
              {/* Current Slide */}
              <motion.div
                key={`slide-${currentSlide}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full flex items-center justify-center"
              >
                <img 
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-auto max-h-[450px] object-contain rounded-2xl shadow-2xl"
                />
              </motion.div>

              {/* Navigation Buttons */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                onClick={nextSlide}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-purple-500/20">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all rounded-full ${
                    index === currentSlide 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-8 h-3' 
                      : 'bg-white/20 hover:bg-white/40 w-2 h-2'
                  }`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute top-6 right-6 text-xs font-semibold text-purple-300 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-purple-500/20">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 mb-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-8 hover:bg-white/10 transition-all"
            >
              <p className="text-2xl md:text-4xl font-black text-white text-center mb-2">{stat.value}</p>
              <p className="text-xs md:text-base text-purple-200 text-center leading-relaxed">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Two-Step Premium Journey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-12 py-12"
        >
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center mb-6">
              <span className="text-4xl font-bold text-gray-300">1</span>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
              Prohlédni si software ve virtuálním modu
            </h3>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center mb-6">
              <span className="text-4xl font-bold text-gray-300">2</span>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-white">
              Zakup premium a přepni na LIVE režim
            </h3>
          </div>
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
