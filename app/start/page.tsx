"use client"

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function StartPage() {
  const router = useRouter()

  const handleEnter = () => {
    // Mark that user has seen the start page
    localStorage.setItem("mt_seen_start", "true")
    // Redirect to about page
    router.push("/about")
  }
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated Galaxy Background */}
      <div className="absolute inset-0 z-0">
        {/* Multiple gradient layers for depth */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-blue-600/40 via-blue-600/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-gradient-radial from-purple-600/40 via-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-cyan-500/30 via-cyan-600/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-gradient-radial from-pink-600/25 via-pink-600/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        
        {/* Animated stars - multiple layers for depth */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => {
            const size = Math.random() > 0.8 ? 2 : 1;
            return (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.9 + 0.1,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${Math.random() * 4 + 2}s`,
                  boxShadow: size > 1 ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Nebula clouds */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[400px] bg-gradient-to-l from-purple-500/20 to-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(100,200,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(100,200,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-cyan-500/30 backdrop-blur-md mb-8 animate-pulse">
          <Brain className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            MindTrader AI
          </span>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold mb-8 leading-tight">
          <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            MindTrader
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-slate-300 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
          Trading začíná v hlavě. <br className="hidden sm:block" />
          Nauč se ovládat emoce a staň se konzistentním.
        </p>

        {/* CTA Button - MASSIVE */}
        <div className="relative inline-block group">
          {/* Button glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
          
          {/* Button */}
          <button
            onClick={handleEnter}
            className="relative px-16 py-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-2xl sm:text-3xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/50 flex items-center gap-4 group"
          >
            <span>Vstoupit</span>
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Bottom hint */}
        <p className="mt-12 text-sm text-slate-500 font-medium">
          Žádný login, žádné závazky. Jen se podívej.
        </p>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
