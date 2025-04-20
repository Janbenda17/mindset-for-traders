"use client"

import { useState } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, ThumbsUp } from "lucide-react"

export function MindTraderReflection() {
  const [planAdherence, setPlanAdherence] = useState<string>("mostly")
  const [emotionalControl, setEmotionalControl] = useState<string>("good")
  const [learningPoints, setLearningPoints] = useState<string>("")
  const [tomorrowFocus, setTomorrowFocus] = useState<string>("")
  const [customLearningPoints, setCustomLearningPoints] = useState<string>("")
  const [customTomorrowFocus, setCustomTomorrowFocus] = useState<string>("")

  // Sample data - in a real app, this would come from the morning form
  const morningData = {
    date: new Date(),
    mentalScore: 78,
    intention: "Dodržovat svůj obchodní plán a být trpělivý",
    focusArea: "discipline",
    marketExpectation: "Volatilní trh s možnými příležitostmi",
    tradingResult: 350,
  }

  const handleSubmit = () => {
    // In a real app, this would save the reflection to a database
    alert("Denní reflexe byla úspěšně uložena!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Denní reflexe</h2>
          <p className="text-muted-foreground">Uzavřete svůj obchodní den a porovnejte plán s realitou</p>
        </div>
        <div className="text-sm text-muted-foreground">{format(morningData.date, "d. MMMM yyyy", { locale: cs })}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranní záměr vs. Realita</CardTitle>
          <CardDescription>Porovnejte svůj ranní plán s tím, co se skutečně stalo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-muted/50 pb-2">
                <CardTitle className="text-sm">Ranní záměr</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>{morningData.intention}</p>
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Mentální skóre: {morningData.mentalScore}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-muted/50 pb-2">
                <CardTitle className="text-sm">Obchodní výsledek</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="font-medium text-green-500">${morningData.tradingResult}</p>
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Očekávání trhu: {morningData.marketExpectation}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base">Jak dobře jste dodrželi svůj obchodní plán?</Label>
              <RadioGroup className="mt-2" value={planAdherence} onValueChange={setPlanAdherence}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fully" id="plan-fully" />
                  <Label htmlFor="plan-fully">Zcela (100%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mostly" id="plan-mostly" />
                  <Label htmlFor="plan-mostly">Většinou (75-99%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat" id="plan-somewhat" />
                  <Label htmlFor="plan-somewhat">Částečně (50-74%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="barely" id="plan-barely" />
                  <Label htmlFor="plan-barely">Minimálně (25-49%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not" id="plan-not" />
                  <Label htmlFor="plan-not">Vůbec (0-24%)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base">Jak dobře jste zvládli své emoce?</Label>
              <RadioGroup className="mt-2" value={emotionalControl} onValueChange={setEmotionalControl}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="emotion-excellent" />
                  <Label htmlFor="emotion-excellent">Výborně</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="emotion-good" />
                  <Label htmlFor="emotion-good">Dobře</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="average" id="emotion-average" />
                  <Label htmlFor="emotion-average">Průměrně</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="emotion-poor" />
                  <Label htmlFor="emotion-poor">Špatně</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="terrible" id="emotion-terrible" />
                  <Label htmlFor="emotion-terrible">Velmi špatně</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="learning-points" className="text-base">
                Co jste se dnes naučili? (volitelné)
              </Label>
              <Select value={learningPoints} onValueChange={setLearningPoints}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Vyberte, co jste se naučili" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patience">Trpělivost se vyplácí</SelectItem>
                  <SelectItem value="discipline">Disciplína je klíčová</SelectItem>
                  <SelectItem value="emotions">Emoce ovlivňují mé rozhodování</SelectItem>
                  <SelectItem value="preparation">Lepší příprava = lepší výsledky</SelectItem>
                  <SelectItem value="breaks">Přestávky zlepšují mé rozhodování</SelectItem>
                  <SelectItem value="overtrading">Méně obchodů = lepší výsledky</SelectItem>
                  <SelectItem value="custom">Vlastní (napište níže)</SelectItem>
                </SelectContent>
              </Select>
              {learningPoints === "custom" && (
                <Textarea
                  className="mt-2"
                  placeholder="Napište, co jste se dnes naučili..."
                  rows={3}
                  value={customLearningPoints}
                  onChange={(e) => setCustomLearningPoints(e.target.value)}
                />
              )}
            </div>

            <div>
              <Label htmlFor="tomorrow-focus" className="text-base">
                Na co se zaměříte zítra? (volitelné)
              </Label>
              <Select value={tomorrowFocus} onValueChange={setTomorrowFocus}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Vyberte oblast zaměření" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discipline">Větší disciplína</SelectItem>
                  <SelectItem value="patience">Více trpělivosti</SelectItem>
                  <SelectItem value="emotions">Lepší kontrola emocí</SelectItem>
                  <SelectItem value="preparation">Důkladnější příprava</SelectItem>
                  <SelectItem value="breaks">Pravidelné přestávky</SelectItem>
                  <SelectItem value="fewer_trades">Méně obchodů</SelectItem>
                  <SelectItem value="custom">Vlastní (napište níže)</SelectItem>
                </SelectContent>
              </Select>
              {tomorrowFocus === "custom" && (
                <Textarea
                  className="mt-2"
                  placeholder="Napište, na co se zaměříte zítra..."
                  rows={3}
                  value={customTomorrowFocus}
                  onChange={(e) => setCustomTomorrowFocus(e.target.value)}
                />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            Uložit denní reflexi
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analýza dne</CardTitle>
          <CardDescription>Automatická analýza vašeho obchodního dne</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Shrnutí</TabsTrigger>
              <TabsTrigger value="strengths">Silné stránky</TabsTrigger>
              <TabsTrigger value="improvements">Prostor pro zlepšení</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Celkové hodnocení dne:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Dobrý den</span>
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Mentální příprava vs. výsledek</span>
                  <Progress value={75} className="h-2 mt-1" />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Klíčový poznatek</AlertTitle>
                  <AlertDescription>
                    Vaše mentální příprava byla dobrá (78%) a výsledek byl pozitivní. Dodržování plánu bylo na dobré
                    úrovni.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="strengths" className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Dobrá mentální příprava</p>
                    <p className="text-sm text-muted-foreground">
                      Vaše ranní mentální skóre bylo 78%, což je nad průměrem
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Pozitivní obchodní výsledek</p>
                    <p className="text-sm text-muted-foreground">Váš obchodní výsledek byl ziskový</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Dobrá kontrola emocí</p>
                    <p className="text-sm text-muted-foreground">Zvládli jste své emoce dobře během obchodování</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="improvements" className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Dodržování plánu</p>
                    <p className="text-sm text-muted-foreground">
                      Váš plán byl dodržen jen částečně. Zaměřte se na důslednější dodržování.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Mentální příprava</p>
                    <p className="text-sm text-muted-foreground">
                      Vaše mentální skóre má prostor pro zlepšení. Zkuste ranní meditaci.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
