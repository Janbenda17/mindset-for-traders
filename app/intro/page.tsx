"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Brain, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function IntroPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    const introShown = localStorage.getItem("mindtrader-intro-shown")
    if (introShown === "true") {
      router.push("/teaser")
      return
    }

    const skipTimer = setTimeout(() => {
      setCanSkip(true)
    }, 3000)

    return () => clearTimeout(skipTimer)
  }, [router])

  const handleVideoEnd = () => {
    localStorage.setItem("mindtrader-intro-shown", "true")
    router.push("/teaser")
  }

  const handleSkip = () => {
    if (canSkip) {
      localStorage.setItem("mindtrader-intro-shown", "true")
      router.push("/teaser")
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
      {/* Logo overlay */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
          MindTrader
        </span>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted={isMuted}
        playsInline
        onEnded={handleVideoEnd}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/copy_102977E5-8E17-4B2F-87BE-77858414A3AF-JNhS5zdKAtz3GEQARBUDNLmu5hbELb.mov"
      />

      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 z-10">
        {/* Mute/Unmute button */}
        <Button
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>

        {/* Skip button */}
        {canSkip && (
          <Button
            onClick={handleSkip}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6"
          >
            Přeskočit
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {!canSkip && <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm">Načítání...</div>}
    </div>
  )
}
