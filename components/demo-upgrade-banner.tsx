'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

// Shown on demo/virtual-mode pages to push toward a real upgrade. The
// "spots left" figure is fetched from /api/presale-stats - a real count of
// paid accounts against the real 30-slot cap, never a hardcoded number.
export function DemoUpgradeBanner() {
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/presale-stats')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data.spotsLeft === 'number') setSpotsLeft(data.spotsLeft)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Link href="/upgrade">
      <div className="group relative overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 p-5 sm:p-6 cursor-pointer hover:border-fuchsia-500/50 transition-colors">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(217,70,239,0.15),transparent_60%)]"
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-fuchsia-500/20 flex-shrink-0">
              <Zap className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base sm:text-lg leading-snug">
                Chceš analyzovat své vlastní obchody z MT5 a odemknout AI Autopsy?
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Aktivuj si plnou verzi
                {spotsLeft !== null && (
                  <span className="text-fuchsia-300 font-semibold"> — zbývá {spotsLeft} z 30 slotů se zaváděcí cenou</span>
                )}
                .
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 group-hover:from-fuchsia-500 group-hover:to-pink-500 text-white text-sm font-semibold whitespace-nowrap transition-colors">
            Aktivovat Premium
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
