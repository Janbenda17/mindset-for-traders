"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Timer, Coffee, Brain, Volume2, VolumeX, Settings, Maximize2 } from "lucide-react"

interface FocusTimerProps {
  onComplete?: () => void
}

export function FocusTimer({ onComplete }: FocusTimerProps) {
  const [mode, setMode] = useState<"focus" | "break">("focus")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessions] = useState(0)
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/notification.mp3")
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {})
      }

      if (mode === "focus") {
        setSessions((prev) => prev + 1)
        setMode("break")
        setTimeLeft(breakDuration * 60)
        onComplete?.()
      } else {
        setMode("focus")
        setTimeLeft(focusDuration * 60)
      }
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode, focusDuration, breakDuration, soundEnabled, onComplete])

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(mode === "focus" ? focusDuration * 60 : breakDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress =
    mode === "focus"
      ? ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100
      : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100

  const TimerContent = () => (
    <>
      {/* Mode Indicator */}
      <div className="flex justify-center gap-2 mb-4">
        <Badge
          className={`${
            mode === "focus"
              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
              : "bg-slate-700/50 text-gray-400 border-slate-600"
          }`}
          variant="outline"
        >
          <Brain className="w-3 h-3 mr-1" />
          Focus
        </Badge>
        <Badge
          className={`${
            mode === "break"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-slate-700/50 text-gray-400 border-slate-600"
          }`}
          variant="outline"
        >
          <Coffee className="w-3 h-3 mr-1" />
          Break
        </Badge>
      </div>

      {/* Timer Circle */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-700" />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
            strokeLinecap="round"
            className={`${mode === "focus" ? "text-purple-500" : "text-green-500"} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white font-mono">{formatTime(timeLeft)}</span>
          <span className="text-gray-400 text-sm mt-1">{mode === "focus" ? "Focus Time" : "Break Time"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="border-slate-600 hover:bg-slate-700 bg-transparent"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="lg"
          onClick={toggleTimer}
          className={`${
            mode === "focus" ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"
          } px-8`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="border-slate-600 hover:bg-slate-700"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sessions Counter */}
      <div className="text-center text-sm text-gray-400">
        Sessions: <span className="text-white font-medium">{sessionsCompleted}</span>
      </div>
    </>
  )

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Focus Timer</h3>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Timer Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Focus Duration</span>
                        <span className="text-white font-medium">{focusDuration} min</span>
                      </div>
                      <Slider
                        value={[focusDuration]}
                        onValueChange={([v]) => {
                          setFocusDuration(v)
                          if (mode === "focus" && !isRunning) setTimeLeft(v * 60)
                        }}
                        min={5}
                        max={60}
                        step={5}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Break Duration</span>
                        <span className="text-white font-medium">{breakDuration} min</span>
                      </div>
                      <Slider
                        value={[breakDuration]}
                        onValueChange={([v]) => {
                          setBreakDuration(v)
                          if (mode === "break" && !isRunning) setTimeLeft(v * 60)
                        }}
                        min={1}
                        max={30}
                        step={1}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(true)}>
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>

          <TimerContent />
        </CardContent>
      </Card>

      {/* Expanded Modal */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-purple-400" />
              Focus Timer
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <TimerContent />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
