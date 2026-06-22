'use client'

import { TraderIdentityAnalysis } from '@/components/trader-identity-analysis'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TraderIdentityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/daily-tracker"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Daily Tracker
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">Trader Identity Analysis</h1>
          <p className="text-slate-400">
            AI-powered analysis of your trading behavior, patterns, and personalized goals
          </p>
        </motion.div>

        <TraderIdentityAnalysis />
      </main>
    </div>
  )
}
