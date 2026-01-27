"use client"

import { Brain, TrendingUp, Users, Target, Zap, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background with Stars */}
      <div className="fixed inset-0 z-0">
        {/* Gradient galaxy overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-purple-950/30 to-black" />
        
        {/* Animated stars */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>

        {/* Large glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation Links */}
        <div className="fixed top-8 left-0 right-0 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors backdrop-blur-sm bg-slate-900/30 px-4 py-2 rounded-full border border-slate-700/50">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Přihlásit se
            </Link>
          </div>
        </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-semibold">MindTrader AI</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Proč MindTrader AI vznikl
          </h1>
          
          <div className="space-y-4 mb-12">
            <p className="text-xl text-slate-300">
              Většina tradingových nástrojů řeší co obchodovat.
            </p>
            <p className="text-xl text-slate-400">
              Grafy, statistiky, strategie, signály.
            </p>
            <p className="text-2xl font-semibold text-white mt-8">
              Ale realita je jiná.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 sm:px-6 bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lg text-slate-300">
              Většina traderů neprohrává kvůli strategii.
            </p>
            <p className="text-2xl font-bold text-red-400 mt-3">
              Prohrává kvůli sobě.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Zap, label: "impulzivní rozhodnutí", color: "text-yellow-400" },
              { icon: TrendingUp, label: "revenge trading", color: "text-red-400" },
              { icon: Target, label: "nedodržování plánu", color: "text-orange-400" },
              { icon: Brain, label: "špatný mentální stav", color: "text-purple-400" },
              { icon: Users, label: "samota a žádná zpětná vazba", color: "text-blue-400" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center gap-3">
                <item.icon className={`w-6 h-6 flex-shrink-0 ${item.color}`} />
                <span className="text-slate-200">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400 mt-12 text-lg">
            A právě tady <span className="text-red-400 font-semibold">většina nástrojů končí.</span>
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Co MindTrader AI dělá jinak
          </h2>

          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8 mb-12">
            <p className="text-lg text-slate-300 mb-4">
              MindTrader AI <span className="text-white font-semibold">není nástroj na hledání obchodů.</span>
            </p>
            <p className="text-lg text-slate-300">
              Je to <span className="text-cyan-400 font-semibold">systém, který ti pomáhá pochopit vlastní chování.</span>
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-slate-300 text-lg mb-8">
              Místo toho, aby ti říkal co máš obchodovat, ti ukazuje:
            </p>

            {[
              { title: "proč děláš chyby", desc: "Hlubší pohled na příčiny, ne jen následky" },
              { title: "v jakých situacích se opakuješ", desc: "Rozpoznání vzorců a triggeru" },
              { title: "jaký je tvůj mentální vzorec", desc: "Spojitost mezi emocemi a výkonem" },
              { title: "co konkrétně zlepšit, aby ses stal konzistentním", desc: "Konkrétní, měřitelný plán" },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-16 text-center">
            Jak to funguje v praxi
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "🧠 Daily Tracker",
                items: ["soustředění", "stres", "připravenost", "disciplínu"],
                desc: "Ne proto, aby sis psal poznámky. Ale aby systém viděl souvislosti mezi hlavou a výkonem."
              },
              {
                icon: TrendingUp,
                title: "📉 Práce s chybami",
                items: ["opakující se vzorce", "porušování pravidel", "emoční přepadáky"],
                desc: "Pomáhá ti je vědomě měnit, ne potlačovat."
              },
              {
                icon: Zap,
                title: "🤖 AI Insight",
                items: ["srozumitelná zpětná vazba", "upozornění na riziko", "personalizovaná doporučení"],
                desc: "AI analyzuje tebe, ne grafy."
              },
            ].map((section, idx) => (
              <div key={idx} className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2 mb-6">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-slate-400">{section.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white mb-2">👥 Nejseš na to sám</p>
                <p className="text-slate-300">
                  Trading je extrémně osamělá disciplína. MindTrader propojuje tradery s podobnými vzorci, vytváří prostředí pro skutečný růst a nabízí podporu tam, kde ji většina traderů nikdy neměla.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Whom */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Pro koho MindTrader AI je
          </h2>

          <div className="space-y-4">
            {[
              "pro tradery, kteří už vědí, že problém není strategie",
              "pro lidi, kteří chtějí konzistenci, ne náhodné výsledky",
              "pro ty, kteří chtějí pracovat na hlavě stejně systematicky jako na grafech",
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Jak můžeš začít
          </h2>

          <div className="space-y-6 mb-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-white text-lg mb-2">
                  Projdi si software ve virtuálním režimu
                </p>
                <p className="text-slate-400">
                  Uvidíš, jak může vypadat práce s daty a psychikou.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-white text-lg mb-2">
                  Přejdi do LIVE módu
                </p>
                <p className="text-slate-400">
                  Začne systém pracovat s tvými reálnými daty.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">3</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-white text-lg mb-2">
                  Pracuj dlouhodobě
                </p>
                <p className="text-slate-400">
                  Bez tlaku. Bez slibů rychlých výsledků. Jen práce, která dává smysl.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg font-semibold">
                Začít s MindTrader AI
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-slate-400 text-lg mb-4">
            Trading je cesta, kterou musíš projít sám.
          </p>
          <p className="text-2xl font-bold text-white">
            Ale nemusíš být na to sám.
          </p>
        </div>
      </section>
      </div>
    </div>
  )
}
