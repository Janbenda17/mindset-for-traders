"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [showLogo, setShowLogo] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [codeError, setCodeError] = useState(false)
  const router = useRouter()

  const launchDate = new Date()
  launchDate.setDate(launchDate.getDate() + 7)

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogo(false)
      setTimeout(() => setShowContent(true), 500)
    }, 3000)

    return () => clearTimeout(logoTimer)
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, []) // Removed launchDate from dependencies to prevent infinite loop

  const handleEarlyAccess = () => {
    if (accessCode.toLowerCase() === "mindpreview") {
      router.push("/auth/login")
    } else {
      setCodeError(true)
      setTimeout(() => setCodeError(false), 2000)
    }
  }

  if (showLogo) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Galaxy background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
          {/* Animated stars */}
          <div className="stars" />
          <div className="stars2" />
          <div className="stars3" />
        </div>

        {/* Logo animation */}
        <div className="relative z-10 animate-in fade-in zoom-in duration-1000">
          <div className="flex flex-col items-center gap-8">
            {/* Brain icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full animate-pulse" />
              <div className="relative p-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border-2 border-purple-400/40 backdrop-blur-sm shadow-2xl shadow-purple-500/50">
                <Brain className="w-32 h-32 text-purple-300 animate-pulse" />
              </div>
            </div>

            {/* Logo text with gradient */}
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-1000">
              MindTrader AI
            </h1>

            <p className="text-gray-300 text-2xl md:text-3xl animate-in fade-in duration-1000 delay-500">
              Transform Your Trading Psychology
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes moveStars {
            from {
              transform: translateY(0px);
            }
            to {
              transform: translateY(-2000px);
            }
          }

          .stars,
          .stars2,
          .stars3 {
            position: absolute;
            width: 100%;
            height: 200vh;
            background: transparent;
          }

          .stars {
            background-image: radial-gradient(2px 2px at 20px 30px, white, rgba(0, 0, 0, 0)),
              radial-gradient(2px 2px at 60px 70px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 50px 50px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 130px 80px, white, rgba(0, 0, 0, 0)),
              radial-gradient(2px 2px at 90px 10px, white, rgba(0, 0, 0, 0));
            background-size: 200px 200px;
            animation: moveStars 100s linear infinite;
          }

          .stars2 {
            background-image: radial-gradient(1px 1px at 40px 60px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 110px 90px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 160px 40px, white, rgba(0, 0, 0, 0));
            background-size: 200px 200px;
            animation: moveStars 150s linear infinite;
          }

          .stars3 {
            background-image: radial-gradient(1px 1px at 75px 125px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 145px 75px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 185px 155px, white, rgba(0, 0, 0, 0));
            background-size: 250px 250px;
            animation: moveStars 200s linear infinite;
          }
        `}</style>
      </div>
    )
  }

  if (showContent) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
        {/* Galaxy background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
          <div className="stars" />
          <div className="stars2" />
          <div className="stars3" />
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-4xl w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center mb-16">
            {/* Small logo */}
            <div className="inline-flex items-center gap-3 mb-8 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MindTrader AI
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Launching Soon</h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12">The real market is in your head</p>

            {/* Countdown timer */}
            <div className="grid grid-cols-4 gap-4 md:gap-8 mb-16 max-w-2xl mx-auto">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((unit, index) => (
                <div
                  key={unit.label}
                  className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-500/20"
                >
                  <div className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent mb-2">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">{unit.label}</div>
                </div>
              ))}
            </div>

            {/* Early access section */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8 md:p-12 max-w-md mx-auto shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Early Access</h2>
              <p className="text-gray-400 mb-6">Have an early access code? Enter it below</p>

              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEarlyAccess()}
                  className={`bg-slate-800 border-2 ${
                    codeError ? "border-red-500" : "border-purple-500/30"
                  } text-white placeholder:text-gray-500 h-12 text-center text-lg transition-colors`}
                />
                <Button
                  onClick={handleEarlyAccess}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-12 text-lg shadow-lg shadow-purple-500/30"
                >
                  Access Now
                </Button>
                {codeError && (
                  <p className="text-red-400 text-sm animate-in fade-in duration-300">
                    Invalid access code. Try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes moveStars {
            from {
              transform: translateY(0px);
            }
            to {
              transform: translateY(-2000px);
            }
          }

          .stars,
          .stars2,
          .stars3 {
            position: absolute;
            width: 100%;
            height: 200vh;
            background: transparent;
          }

          .stars {
            background-image: radial-gradient(2px 2px at 20px 30px, white, rgba(0, 0, 0, 0)),
              radial-gradient(2px 2px at 60px 70px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 50px 50px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 130px 80px, white, rgba(0, 0, 0, 0)),
              radial-gradient(2px 2px at 90px 10px, white, rgba(0, 0, 0, 0));
            background-size: 200px 200px;
            animation: moveStars 100s linear infinite;
          }

          .stars2 {
            background-image: radial-gradient(1px 1px at 40px 60px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 110px 90px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 160px 40px, white, rgba(0, 0, 0, 0));
            background-size: 200px 200px;
            animation: moveStars 150s linear infinite;
          }

          .stars3 {
            background-image: radial-gradient(1px 1px at 75px 125px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 145px 75px, white, rgba(0, 0, 0, 0)),
              radial-gradient(1px 1px at 185px 155px, white, rgba(0, 0, 0, 0));
            background-size: 250px 250px;
            animation: moveStars 200s linear infinite;
          }
        `}</style>
      </div>
    )
  }

  return null
}
