'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center px-6 md:px-12 relative overflow-hidden">
      {/* Galaxy background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      
      {/* Animated grid */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* Stars */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-[20%] left-[80%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[60%] left-[25%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[70%] left-[70%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] left-[50%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-[85%] left-[40%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[90%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[15%] left-[45%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-[75%] left-[60%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* Nebula clouds with animation */}
      <motion.div
        className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-8 md:mb-12"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mindtrader
          </h2>
        </motion.div>

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-16 md:mb-20"
        >
          <div className="relative group cursor-pointer">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            {/* Orbiting particles */}
            <motion.div
              className="absolute top-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ originX: 0.5, originY: '40px' }}
            />
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="text-center space-y-6 md:space-y-8">
          {/* Main heading with better typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Glow effect behind text */}
            <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
            <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl">
                Mindtrader je nástroj pro každodenní řízení psychiky, disciplíny a rozhodování tradera.
              </span>
            </h1>
          </motion.div>

          {/* Decorative divider with sparkles */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center items-center gap-3"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-2xl text-purple-100 font-light tracking-wide max-w-2xl mx-auto"
          >
            Analýza emocí v reálném čase
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 md:pt-8 flex justify-center"
          >
            <div className="relative group">
              {/* Animated ring around button */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-50 group-hover:opacity-100 blur transition-opacity duration-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Link href="/product-tour">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-base md:text-lg px-8 md:px-12 py-6 md:py-8 rounded-full shadow-2xl shadow-purple-900/50 hover:shadow-purple-900/70 transition-all duration-300"
                  >
                    Spustit demo ZDARMA
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
