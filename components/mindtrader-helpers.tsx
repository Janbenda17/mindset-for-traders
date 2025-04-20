"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Brain, Clock, Pause, Play, RefreshCw, Timer, Volume2, VolumeX, Download } from "lucide-react"

export function MindTraderHelpers() {
  const [activeTab, setActiveTab] = useState("emergency")
  const [breathingProgress, setBreathingProgress] = useState(0)
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(300) // 5 minutes

  // Sample affirmations
  const affirmations = [
    "Jsem disciplinovaný obchodník a dodržuji svůj plán.",
    "Obchoduji s klidem a trpělivostí.",
    "Ztráty jsou součástí procesu a přijímám je.",
    "Obchoduji trh takový, jaký je, ne jaký bych chtěl, aby byl.",
    "Udržuji emocionální rovnováhu bez ohledu na zisk nebo ztrátu.",
    "Soustředím se na proces, ne na výsledek každého obchodu.",
    "Jsem odpoutaný od peněz při obchodních rozhodnutích.",
  ]

  // Get random affirmation
  const getRandomAffirmation = () => {
    return affirmations[Math.floor(Math.random() * affirmations.length)]
  }

  // Start/stop breathing exercise
  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false)
      setBreathingProgress(0)
      setBreathingPhase("inhale")
    } else {
      setBreathingActive(true)
      startBreathingCycle()
    }
  }

  // Breathing cycle logic
  const startBreathingCycle = () => {
    let progress = 0
    let phase: "inhale" | "hold" | "exhale" = "inhale"
    let phaseLength = 0

    const interval = setInterval(() => {
      if (!breathingActive) {
        clearInterval(interval)
        return
      }

      // Update progress
      progress += 1

      // Determine phase
      if (phase === "inhale" && progress >= 40) {
        phase = "hold"
        phaseLength = 0
      } else if (phase === "hold" && phaseLength >= 40) {
        phase = "exhale"
        phaseLength = 0
      } else if (phase === "exhale" && phaseLength >= 60) {
        phase = "inhale"
        phaseLength = 0
        progress = 0
      }

      phaseLength += 1
      setBreathingProgress(phase === "inhale" ? progress * 2.5 : phase === "hold" ? 100 : 100 - phaseLength * 1.67)
      setBreathingPhase(phase)
    }, 100)

    return () => clearInterval(interval)
  }

  // Toggle audio
  const toggleAudio = () => {
    setAudioPlaying(!audioPlaying)
    // In a real app, this would play/pause an audio file
  }

  // Toggle timer
  const toggleTimer = () => {
    setTimerRunning(!timerRunning)

    if (!timerRunning) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }

  // Reset timer
  const resetTimer = () => {
    setTimerRunning(false)
    setTimerSeconds(300)
  }

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mentální pomocníci</h2>
          <p className="text-muted-foreground">Nástroje pro zvládání emocí a zlepšení mentálního stavu</p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emergency">Nouzový režim</TabsTrigger>
          <TabsTrigger value="meditation">Meditace</TabsTrigger>
          <TabsTrigger value="affirmations">Afirmace</TabsTrigger>
        </TabsList>

        <TabsContent value="emergency" className="space-y-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nouzový režim aktivován</AlertTitle>
            <AlertDescription>
              Tento režim vám pomůže zvládnout stresové situace během obchodování. Následujte tyto kroky.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Krok 1: Zastavte se a dýchejte</CardTitle>
              <CardDescription>Hluboké dýchání aktivuje parasympatický nervový systém a snižuje stres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pt-1">
                <div className="text-center mb-2">
                  <span className="text-lg font-medium">
                    {breathingPhase === "inhale" ? "Nádech" : breathingPhase === "hold" ? "Zadržte dech" : "Výdech"}
                  </span>
                </div>
                <Progress value={breathingProgress} className="h-4" />
              </div>

              <div className="flex justify-center">
                <Button onClick={toggleBreathing} className="w-40">
                  {breathingActive ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Zastavit
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Začít dýchat
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Krok 2: Odstupte se od obrazovky</CardTitle>
              <CardDescription>Fyzický odstup pomáhá získat mentální odstup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-2xl font-bold">{formatTime(timerSeconds)}</span>
                <p className="text-sm text-muted-foreground">Doporučený čas: 5 minut</p>
              </div>

              <div className="flex justify-center gap-2">
                <Button onClick={toggleTimer} variant="outline">
                  {timerRunning ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pauza
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>

                <Button onClick={resetTimer} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Krok 3: Přehodnoťte situaci</CardTitle>
              <CardDescription>Položte si tyto otázky</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Je tato situace tak důležitá, jak se mi teď zdá?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Dodržuji svůj obchodní plán?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Jaké emoce právě teď cítím a ovlivňují mé rozhodování?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Co by mi poradil můj mentor nebo já sám v klidném stavu?</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Krok 4: Rozhodněte se</CardTitle>
              <CardDescription>Vyberte jednu z těchto možností</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col">
                  <span className="font-medium">Ukončit obchodování na dnes</span>
                  <span className="text-xs text-muted-foreground mt-1">Doporučeno při silných emocích</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col">
                  <span className="font-medium">Snížit velikost pozic</span>
                  <span className="text-xs text-muted-foreground mt-1">Doporučeno při mírných emocích</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col">
                  <span className="font-medium">Přehodnotit strategii</span>
                  <span className="text-xs text-muted-foreground mt-1">Doporučeno při nejistotě</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col">
                  <span className="font-medium">Pokračovat dle plánu</span>
                  <span className="text-xs text-muted-foreground mt-1">Pouze pokud jste zcela klidní</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meditation" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Meditace pro obchodníky</CardTitle>
              <CardDescription>Krátké meditace pro zlepšení soustředění a klidu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Ranní příprava (5 min)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground">Ideální před začátkem obchodního dne</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={toggleAudio}>
                      {audioPlaying ? (
                        <>
                          <VolumeX className="mr-2 h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-2 h-4 w-4" />
                          Přehrát
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Stáhnout
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Reset po ztrátě (3 min)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground">Pomáhá zvládnout emoce po ztrátovém obchodu</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={toggleAudio}>
                      {audioPlaying ? (
                        <>
                          <VolumeX className="mr-2 h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-2 h-4 w-4" />
                          Přehrát
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Stáhnout
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Soustředění (7 min)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground">Zlepšuje schopnost soustředit se na trh</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={toggleAudio}>
                      {audioPlaying ? (
                        <>
                          <VolumeX className="mr-2 h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-2 h-4 w-4" />
                          Přehrát
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Stáhnout
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Večerní uzavření (10 min)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground">Pomáhá uzavřít obchodní den a odpočinout si</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={toggleAudio}>
                      {audioPlaying ? (
                        <>
                          <VolumeX className="mr-2 h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-2 h-4 w-4" />
                          Přehrát
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Stáhnout
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dýchací cvičení</CardTitle>
              <CardDescription>Jednoduché dýchací techniky pro rychlé zklidnění</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Box Breathing (4-4-4-4)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground">Nádech 4s, zadržení 4s, výdech 4s, pauza 4s</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={toggleBreathing}>
                      {breathingActive ? "Zastavit" : "Začít"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">4-7-8 Technika</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground">Nádech 4s, zadržení 7s, výdech 8s</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={toggleBreathing}>
                      {breathingActive ? "Zastavit" : "Začít"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affirmations" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Denní afirmace</CardTitle>
              <CardDescription>Posilte svou mysl pozitivními afirmacemi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 border rounded-lg bg-muted/30">
                <blockquote className="text-xl font-serif italic text-center">"{getRandomAffirmation()}"</blockquote>
              </div>

              <div className="flex justify-center">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Nová afirmace
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Obchodní mantry</CardTitle>
              <CardDescription>Krátké fráze pro opakování během obchodování</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <p className="font-medium text-center">"Plán, vstup, výstup, opakovat."</p>
                </div>

                <div className="p-3 border rounded-md">
                  <p className="font-medium text-center">"Trpělivost přináší zisky."</p>
                </div>

                <div className="p-3 border rounded-md">
                  <p className="font-medium text-center">"Obchoduji proces, ne výsledek."</p>
                </div>

                <div className="p-3 border rounded-md">
                  <p className="font-medium text-center">"Ztráty jsou součástí hry."</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Připomenutí obchodního plánu</CardTitle>
              <CardDescription>Klíčové body vašeho obchodního plánu</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <span>Obchoduji pouze v nejlepších hodinách (9:30-11:30)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Timer className="h-4 w-4 mt-1 text-muted-foreground" />
                  <span>Čekám na ideální setup, nehoním každý pohyb</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="h-4 w-4 mt-1 text-muted-foreground" />
                  <span>Vždy mám jasný plán vstupu, výstupu a řízení rizika</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-1 text-muted-foreground" />
                  <span>Nikdy neriskuji více než 1% účtu na jeden obchod</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
