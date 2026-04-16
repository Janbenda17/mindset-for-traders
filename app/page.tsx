"use client"

import Link from "next/link"
import { TopNavigation } from "@/components/top-navigation"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  Shield,
  BarChart3,
  Target,
  Zap,
  CheckCircle2,
  Star,
  LineChart,
  Clock,
  Trophy,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const isEn = language === "en"

  const handleCTAClick = () => {
    if (!user) {
      router.push("/signup")
    } else {
      router.push("/dashboard")
    }
  }

  const handleSecondaryClick = () => {
    router.push("/intro")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Subtle galaxy background - much more refined */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-black" />

        {/* Subtle stars */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px]" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10">
        <TopNavigation />

        {/* ============ HERO ============ */}
        <section className="relative pt-32 md:pt-40 pb-20 md:pb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Announcement badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <Link
                href="/bonus"
                className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all backdrop-blur-xl"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm text-white/80 font-medium">
                  {isEn ? "New: AI Trade Coach is live" : "Novinka: AI Trade Coach je živý"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold tracking-tight leading-[1.05] mb-6 text-balance"
            >
              <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
                {isEn ? "Master your mind." : "Ovládni svou mysl."}
              </span>
              <br />
              <span className="bg-gradient-to-br from-purple-300 via-pink-200 to-cyan-300 bg-clip-text text-transparent">
                {isEn ? "Master the markets." : "Ovládni trhy."}
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
            >
              {isEn
                ? "The AI-powered trading psychology platform that helps serious traders eliminate emotional decisions and compound consistent results."
                : "AI platforma pro trading psychologii, která pomáhá vážným traderům eliminovat emoční rozhodnutí a dosahovat konzistentních výsledků."}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10"
            >
              <Button
                size="lg"
                onClick={handleCTAClick}
                className="group bg-white text-slate-950 hover:bg-white/90 font-semibold text-base px-6 h-12 rounded-full min-w-[200px]"
              >
                {isEn ? "Start free trial" : "Začít trial zdarma"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={handleSecondaryClick}
                className="text-white hover:bg-white/10 font-semibold text-base px-6 h-12 rounded-full border border-white/20 hover:border-white/40 min-w-[200px]"
              >
                {isEn ? "See how it works" : "Jak to funguje"}
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/50"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
                <span>{isEn ? "14-day free trial" : "14 dní zdarma"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
                <span>{isEn ? "No credit card required" : "Bez platební karty"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
                <span>{isEn ? "Cancel anytime" : "Zrušit kdykoliv"}</span>
              </div>
            </motion.div>
          </div>

          {/* Product preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24"
          >
            <div className="relative">
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-cyan-500/10 blur-3xl" />

              {/* Mockup frame */}
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-purple-500/10">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10 bg-slate-900/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  <div className="ml-4 text-xs text-white/30 font-mono">mindtrader.com/dashboard</div>
                </div>

                {/* Mockup content */}
                <div className="p-4 sm:p-6 md:p-8">
                  {/* Top stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    {[
                      { label: isEn ? "Win Rate" : "Úspěšnost", value: "67%", color: "from-emerald-500 to-teal-500", trend: "+4.2%" },
                      { label: isEn ? "P&L Week" : "Zisk týden", value: "+$2,847", color: "from-cyan-500 to-blue-500", trend: "+12.8%" },
                      { label: isEn ? "Discipline" : "Disciplína", value: "92", color: "from-purple-500 to-pink-500", trend: "+8 pts" },
                      { label: isEn ? "Emotion Score" : "Emoce", value: "A+", color: "from-amber-500 to-orange-500", trend: "Stable" },
                    ].map((stat, i) => (
                      <div key={i} className="p-3 md:p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                        <div className="text-xs text-white/50 mb-1">{stat.label}</div>
                        <div className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-emerald-400/70 mt-1">{stat.trend}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-4 md:p-6 rounded-lg bg-white/[0.02] border border-white/[0.08] min-h-[200px] md:min-h-[280px]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {isEn ? "Performance Overview" : "Přehled výkonu"}
                          </div>
                          <div className="text-xs text-white/40">{isEn ? "Last 30 days" : "Posledních 30 dní"}</div>
                        </div>
                        <LineChart className="w-4 h-4 text-white/40" />
                      </div>
                      {/* Fake chart bars */}
                      <div className="flex items-end gap-1 h-32 md:h-48">
                        {[40, 55, 30, 65, 50, 75, 60, 85, 70, 90, 80, 95, 85, 100].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.8, delay: 0.8 + i * 0.04 }}
                            className="flex-1 rounded-t bg-gradient-to-t from-purple-500/60 to-cyan-400/80"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="p-4 md:p-6 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <div className="text-sm font-semibold text-white">
                          {isEn ? "AI Insights" : "AI Poznatky"}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { text: isEn ? "You trade best before 11 AM" : "Nejlépe obchoduješ před 11h" },
                          { text: isEn ? "Stop trading after 2 losses" : "Po 2 ztrátách zastavit" },
                          { text: isEn ? "Focus on EUR/USD setups" : "Zaměř se na EUR/USD" },
                        ].map((insight, i) => (
                          <div key={i} className="flex gap-2 text-xs text-white/70">
                            <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span>{insight.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============ STATS BAR ============ */}
        <section className="py-12 md:py-20 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            >
              {[
                { value: "12,000+", label: isEn ? "Active traders" : "Aktivních traderů" },
                { value: "$48M+", label: isEn ? "Trades analyzed" : "Analyzovaných obchodů" },
                { value: "94%", label: isEn ? "Improve discipline" : "Zlepší disciplínu" },
                { value: "4.9/5", label: isEn ? "User rating" : "Hodnocení uživatelů" },
              ].map((stat, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="text-3xl md:text-5xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section className="py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                  {isEn ? "Built for professionals" : "Pro profesionály"}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                {isEn ? "Everything you need to trade like a pro" : "Vše co potřebuješ, abys obchodoval profesionálně"}
              </h2>
              <p className="text-lg text-white/60 text-pretty">
                {isEn
                  ? "From daily psychology tracking to AI-powered coaching, MindTrader gives you the complete toolkit to build lasting trading success."
                  : "Od denního sledování psychiky po AI kouče – MindTrader ti dává kompletní sadu nástrojů pro trvalý obchodní úspěch."}
              </p>
            </motion.div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  icon: Brain,
                  title: isEn ? "Daily Psychology Tracker" : "Denní sledování psychiky",
                  description: isEn
                    ? "Track your mental state, energy, and confidence before every trading session."
                    : "Sleduj svůj mentální stav, energii a sebevědomí před každou relací.",
                  gradient: "from-purple-500/20 to-pink-500/20",
                  iconColor: "text-purple-300",
                  borderGlow: "hover:border-purple-500/30",
                },
                {
                  icon: Zap,
                  title: isEn ? "Real-time AI Coach" : "AI Kouč v reálném čase",
                  description: isEn
                    ? "Get instant AI feedback to prevent emotional trades before they destroy your account."
                    : "Okamžitá AI zpětná vazba zabrání emočním obchodům dříve, než zničí účet.",
                  gradient: "from-cyan-500/20 to-blue-500/20",
                  iconColor: "text-cyan-300",
                  borderGlow: "hover:border-cyan-500/30",
                },
                {
                  icon: BarChart3,
                  title: isEn ? "Deep Analytics" : "Hluboká analýza",
                  description: isEn
                    ? "Discover patterns in your trading psychology that you never knew existed."
                    : "Objev vzory ve své obchodní psychice, o kterých jsi neměl tušení.",
                  gradient: "from-emerald-500/20 to-teal-500/20",
                  iconColor: "text-emerald-300",
                  borderGlow: "hover:border-emerald-500/30",
                },
                {
                  icon: Target,
                  title: isEn ? "Goal Setting" : "Stanovení cílů",
                  description: isEn
                    ? "Set meaningful goals, track progress, and build discipline through micro-commitments."
                    : "Nastav smysluplné cíle, sleduj pokrok a buduj disciplínu přes malé závazky.",
                  gradient: "from-amber-500/20 to-orange-500/20",
                  iconColor: "text-amber-300",
                  borderGlow: "hover:border-amber-500/30",
                },
                {
                  icon: TrendingUp,
                  title: isEn ? "Trade Journal" : "Obchodní deník",
                  description: isEn
                    ? "Log every trade with context, screenshots, and emotional state for deeper learning."
                    : "Zaznamenej každý obchod s kontextem, screenshoty a emocemi pro hlubší učení.",
                  gradient: "from-blue-500/20 to-indigo-500/20",
                  iconColor: "text-blue-300",
                  borderGlow: "hover:border-blue-500/30",
                },
                {
                  icon: Users,
                  title: isEn ? "Trader Community" : "Komunita traderů",
                  description: isEn
                    ? "Join a private community of serious traders who hold each other accountable."
                    : "Připoj se k privátní komunitě vážných traderů, kteří se navzájem motivují.",
                  gradient: "from-pink-500/20 to-rose-500/20",
                  iconColor: "text-pink-300",
                  borderGlow: "hover:border-pink-500/30",
                },
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className={`group relative p-6 md:p-7 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm transition-all ${feature.borderGlow}`}
                  >
                    <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5`}>
                      <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="py-20 md:py-32 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs font-semibold text-cyan-200 uppercase tracking-wider">
                  {isEn ? "Daily routine" : "Denní rutina"}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
                {isEn ? "A simple 3-step daily process" : "Jednoduchý 3krokový denní proces"}
              </h2>
              <p className="text-lg text-white/60 text-pretty">
                {isEn
                  ? "Just 10 minutes a day to transform your trading mindset permanently."
                  : "Jen 10 minut denně pro trvalou transformaci tvé obchodní mysli."}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {[
                {
                  step: "01",
                  title: isEn ? "Morning check-in" : "Ranní check-in",
                  description: isEn
                    ? "Rate your energy, mindset, and set intentions. AI flags risky states before you trade."
                    : "Ohodnoť svou energii, mysl a nastav záměr. AI upozorní na rizikové stavy před obchodem.",
                  time: isEn ? "3 min" : "3 min",
                },
                {
                  step: "02",
                  title: isEn ? "Trade with AI guardrails" : "Obchoduj s AI ochranou",
                  description: isEn
                    ? "Get real-time warnings when your emotions compromise your strategy. Stay disciplined."
                    : "Získej varování v reálném čase, když emoce narušují strategii. Zůstaň disciplinovaný.",
                  time: isEn ? "Real-time" : "V reálném čase",
                },
                {
                  step: "03",
                  title: isEn ? "Evening review" : "Večerní přezkum",
                  description: isEn
                    ? "Log trades, reflect on decisions, and let AI identify patterns to improve tomorrow."
                    : "Zaznamenej obchody, reflektuj rozhodnutí a nech AI najít vzory pro zítřek.",
                  time: isEn ? "5 min" : "5 min",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/10 h-full">
                    <div className="text-6xl font-bold bg-gradient-to-br from-white/10 to-white/5 bg-clip-text text-transparent mb-4">
                      {step.step}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">{step.description}</p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/50">{step.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className="py-20 md:py-32 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                  {isEn ? "Trusted by traders" : "Důvěřují nám tradeři"}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
                {isEn ? "Real results from real traders" : "Skutečné výsledky od skutečných traderů"}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  quote: isEn
                    ? "I went from blowing accounts every 2 months to consistent 15%+ monthly returns. The AI coach stopped my revenge trades dead in their tracks."
                    : "Z každých 2 měsíců blown účtu jsem přešel na konzistentních 15%+ měsíčně. AI kouč okamžitě zastavil moje revenge obchody.",
                  author: "Michal K.",
                  role: isEn ? "Day Trader, 3 years" : "Day Trader, 3 roky",
                  rating: 5,
                },
                {
                  quote: isEn
                    ? "The psychology tracker showed me I trade my worst after 10 hours of sleep loss. Changed my whole routine and my P&L jumped 40%."
                    : "Sledování psychiky mi ukázalo, že po 10 hodinách špatného spánku obchoduji nejhůř. Změnil jsem rutinu a P&L skočilo o 40%.",
                  author: "Sarah T.",
                  role: isEn ? "Swing Trader, 5 years" : "Swing Trader, 5 let",
                  rating: 5,
                },
                {
                  quote: isEn
                    ? "Best investment I made this year. Seriously. I finally understand why I was self-sabotaging my best setups."
                    : "Nejlepší investice letošního roku. Konečně chápu, proč jsem sabotoval své nejlepší setupy.",
                  author: "Tomáš R.",
                  role: isEn ? "Forex Trader, 2 years" : "Forex Trader, 2 roky",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 md:p-7 rounded-2xl bg-white/[0.02] border border-white/10"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-6 text-sm md:text-base">{testimonial.quote}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{testimonial.author}</div>
                      <div className="text-xs text-white/50">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="py-20 md:py-32 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-8 md:p-16 rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-cyan-600/20 border border-white/10 backdrop-blur-sm overflow-hidden"
            >
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

              <div className="relative text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                  <Shield className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    {isEn ? "Start today" : "Začni dnes"}
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                  {isEn ? "Ready to trade your best?" : "Připraven obchodovat nejlépe?"}
                </h2>

                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 text-pretty">
                  {isEn
                    ? "Join thousands of traders who are already compounding their results with MindTrader."
                    : "Připoj se k tisícům traderů, kteří už dnes skládají své výsledky s MindTrader."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button
                    size="lg"
                    onClick={handleCTAClick}
                    className="group bg-white text-slate-950 hover:bg-white/90 font-semibold text-base px-8 h-12 rounded-full min-w-[220px]"
                  >
                    {isEn ? "Start 14-day free trial" : "Spustit 14denní trial"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                  <Link href="/upgrade">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-white hover:bg-white/10 font-semibold text-base px-8 h-12 rounded-full border border-white/20 hover:border-white/40 min-w-[220px]"
                    >
                      {isEn ? "View pricing" : "Zobrazit ceník"}
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-white/40 mt-8">
                  {isEn ? "No credit card required • Cancel anytime" : "Bez platební karty • Zrušit kdykoliv"}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
