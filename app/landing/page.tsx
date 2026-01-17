"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Brain, Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  const router = useRouter()
  const [showLogo, setShowLogo] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [codeError, setCodeError] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Memoize launch date to prevent infinite re-renders
  const launchDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  }, [])

  // Logo animation sequence
  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 300)
    const contentTimer = setTimeout(() => setShowContent(true), 2000)
    return () => {
      clearTimeout(logoTimer)
      clearTimeout(contentTimer)
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [launchDate])

  const handleAccessCode = () => {
    if (accessCode.toLowerCase() === "mindpreview") {
      router.push("/auth/login")
    } else {
      setCodeError(true)
      setTimeout(() => setCodeError(false), 2000)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Galaxy Background */}
      <div className="absolute inset-0">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d2b] to-[#000010]" />

        {/* Nebula effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-600/10 rounded-full blur-[80px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: Math.random() * 3 + "s",
              }}
            />
          ))}
        </div>

        {/* Shooting stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-1 h-1 bg-white rounded-full shooting-star"
            style={{ top: "20%", left: "80%", animationDelay: "0s" }}
          />
          <div
            className="absolute w-1 h-1 bg-white rounded-full shooting-star"
            style={{ top: "40%", left: "60%", animationDelay: "3s" }}
          />
          <div
            className="absolute w-1 h-1 bg-white rounded-full shooting-star"
            style={{ top: "60%", left: "90%", animationDelay: "6s" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo Animation */}
        <div
          className={`flex flex-col items-center transition-all duration-1000 ease-out ${
            showLogo ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-90"
          }`}
        >
          {/* Glowing Brain Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm">
              <Brain className="w-16 h-16 md:w-20 md:h-20 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
            MindTrader AI
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">The real market is in your head</p>
        </div>

        {/* Countdown Section */}
        <div
          className={`transition-all duration-1000 delay-500 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Countdown Label */}
          <p className="text-center text-sm text-purple-300 uppercase tracking-widest mb-4">Launching In</p>

          {/* Countdown Timer */}
          <div className="flex gap-3 md:gap-6 mb-12">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl blur-lg" />
                  <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                      {String(item.value).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-xs md:text-sm text-gray-500 uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Early Access Section */}
          <div className="w-full max-w-md mx-auto">
            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Early Access</span>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAccessCode()}
                  className={`flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                    codeError ? "border-red-500 animate-shake" : ""
                  }`}
                />
                <Button
                  onClick={handleAccessCode}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0"
                >
                  Enter
                </Button>
              </div>

              {codeError && <p className="mt-2 text-sm text-red-400 animate-fadeIn">Invalid access code</p>}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-200px) translateY(200px);
            opacity: 0;
          }
        }
        
        .shooting-star {
          animation: shooting-star 2s ease-out infinite;
          box-shadow: 0 0 10px 2px white, -100px -50px 20px 2px rgba(255,255,255,0.1);
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
