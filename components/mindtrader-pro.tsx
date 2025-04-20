"use client"

import * as React from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Download, HelpCircle, Info, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MindTraderHistory } from "./mindtrader-history"
import { MindTraderReflection } from "./mindtrader-reflection"
import { MindTraderHelpers } from "./mindtrader-helpers"
import { MindTraderNotifications } from "./mindtrader-notifications"
import { MindTraderExport } from "./mindtrader-export"
import { MindTraderBehavior } from "./mindtrader-behavior"
import { useSubscription } from "@/contexts/subscription-context"
import { LockedFeature } from "./locked-feature"
import { PlanSelector } from "./plan-selector"

const formSchema = z.object({
  date: z.date(),
  // Morning self-reflection
  morningFeeling: z.number().min(1).max(10),
  morningNote: z.string().optional(),
  dailyIntention: z.string().optional(),
  focusArea: z.enum(["discipline", "result", "both"]),

  // Body and brain
  sleepHours: z.number().min(0).max(12),
  sleepQuality: z.number().min(1).max(10),
  sleepNote: z.string().optional(),
  mealQuality: z.number().min(1).max(10),
  mealCount: z.number().min(0).max(10),
  hydration: z.number().min(0).max(10),
  movement: z.boolean(),
  movementNote: z.string().optional(),

  // Emotions
  currentMood: z.number().min(1).max(10),
  dominantEmotion: z.string().optional(),
  biggestFear: z.string().optional(),
  stayingCentered: z.string().optional(),

  // Market readiness
  marketExpectation: z.string().optional(),
  importantNews: z.string().optional(),
  disruptionPlan: z.string().optional(),

  // Free time
  freeTimeHours: z.number().min(0).max(24),

  // Movement/sport
  didExercise: z.boolean(),
  exerciseFeeling: z.number().optional(),

  // Day result
  tradingResult: z.number().optional(),

  // Final note
  finalSummary: z.string().optional(),
  winningCriteria: z.string().optional(),
})

export function MindTraderPro() {
  const [mentalStability, setMentalStability] = useState(0)
  const [showEndOfDayReflection, setShowEndOfDayReflection] = useState(false)
  const [quickMode, setQuickMode] = useState(false)
  const [activeTab, setActiveTab] = useState("form")
  const { hasAccess } = useSubscription()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      morningFeeling: 5,
      sleepHours: 7,
      sleepQuality: 5,
      mealQuality: 5,
      mealCount: 3,
      hydration: 5,
      movement: false,
      currentMood: 5,
      dominantEmotion: "",
      freeTimeHours: 1,
      didExercise: false,
      tradingResult: 0,
    },
  })

  // Update the calculateMentalStability function to use the new weight distribution
  function calculateMentalStability(values: z.infer<typeof formSchema>) {
    // Initialize score and category scores
    let totalScore = 0

    // 1. PHYSICAL STATE (35%)
    let physicalScore = 0

    // Sleep (20%)
    const sleepScore = (values.sleepHours >= 7 ? 1 : values.sleepHours / 7) * 0.5 + (values.sleepQuality / 10) * 0.5
    physicalScore += sleepScore * 20

    // Food quality (7%)
    physicalScore += (values.mealQuality / 10) * 7

    // Hydration (5%)
    physicalScore += (values.hydration / 10) * 5

    // Movement/sport (3%)
    physicalScore += (values.movement ? 1 : 0) * 3

    // Add physical score to total
    totalScore += physicalScore

    // 2. MENTAL STATE (35%)
    let mentalScore = 0

    // Mood / emotional stability (10%)
    mentalScore += (values.currentMood / 10) * 10

    // Energy + focus (10%) - we'll use morning feeling as a proxy
    mentalScore += (values.morningFeeling / 10) * 10

    // Gratitude + daily intention (5%)
    mentalScore += (values.dailyIntention ? 1 : 0.5) * 5

    // Routine adherence (5%) - we'll use focus area as a proxy
    mentalScore += (values.focusArea === "discipline" ? 1 : 0.8) * 5

    // Free time (5%)
    mentalScore += (values.freeTimeHours >= 1 ? 1 : values.freeTimeHours) * 5

    // Add mental score to total
    totalScore += mentalScore

    // 3. TRADING BEHAVIOR (20%)
    // This would normally come from the behavior component, but for now we'll use a default value
    const tradingBehaviorScore = 20 * 0.7 // Assuming 70% compliance with good trading behavior
    totalScore += tradingBehaviorScore

    // 4. EXTERNAL FACTORS (10%)
    // Since we don't have direct inputs for these, we'll use a default value
    const externalFactorsScore = 10 * 0.8 // Assuming 80% favorable external conditions
    totalScore += externalFactorsScore

    // Return the final percentage score
    return Math.round(totalScore)
  }

  function quickAssessStability() {
    const values = form.getValues()
    const stability = calculateMentalStability(values)
    setMentalStability(stability)
  }

  // Add a useEffect to update the stability score when key fields change
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only recalculate when important fields change
      const keyFields = [
        "morningFeeling",
        "sleepHours",
        "sleepQuality",
        "mealQuality",
        "movement",
        "currentMood",
        "freeTimeHours",
        "didExercise",
      ]

      if (name && keyFields.includes(name)) {
        quickAssessStability()
      }
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  function onSubmit(values: z.infer<typeof formSchema>) {
    const stability = calculateMentalStability(values)
    setMentalStability(stability)
    console.log(values)

    // In a real app, you would save this to a database
    alert(`Mental training form saved successfully! Your mental stability score is ${stability}%`)
  }

  function handleEndOfDayReflection() {
    setShowEndOfDayReflection(true)
  }

  function exportToPDF() {
    // In a real app, this would generate a PDF
    alert("Exporting to PDF... This feature would be implemented in the production version.")
  }

  // Predefined options for emotions to avoid typing
  const emotionOptions = [
    "Calm",
    "Confident",
    "Excited",
    "Optimistic",
    "Focused",
    "Neutral",
    "Anxious",
    "Fearful",
    "Frustrated",
    "Impatient",
    "Overwhelmed",
    "Angry",
  ]

  // Predefined options for fears to avoid typing
  const fearOptions = [
    "Missing a good trade",
    "Taking a loss",
    "Breaking my rules",
    "Market volatility",
    "Missing my profit target",
    "Overtrading",
    "Being too cautious",
    "News events",
    "None today",
  ]

  // Predefined options for staying centered
  const centeringOptions = [
    "Following my trading plan",
    "Taking breaks between trades",
    "Deep breathing",
    "Reviewing my rules before each trade",
    "Setting clear profit targets",
    "Strict stop losses",
    "Journaling after each trade",
    "Meditation",
  ]

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">MindTrader Pro</h1>
          <PlanSelector />
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7">
            <TabsTrigger value="form">Denní formulář</TabsTrigger>
            <TabsTrigger value="history">Historie a grafy</TabsTrigger>
            <TabsTrigger value="reflection">Denní reflexe</TabsTrigger>
            <TabsTrigger value="behavior">Obchodní chování</TabsTrigger>
            <TabsTrigger value="helpers">Mentální pomocníci</TabsTrigger>
            <TabsTrigger value="notifications">Notifikace</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Daily Mental Training</h2>
                  <p className="text-muted-foreground">Complete this form to prepare your mind for optimal trading</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="quick-mode" checked={quickMode} onCheckedChange={setQuickMode} />
                    <label
                      htmlFor="quick-mode"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Quick Mode
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Mental Stability:</span>
                    <div className="w-40">
                      <Progress value={mentalStability} className="h-2" />
                    </div>
                    <span className="text-sm font-medium">{mentalStability}%</span>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Training Date</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant={"outline"} className="w-[240px] pl-3 text-left font-normal">
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Morning Self-Reflection Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>🕘 Morning: Self-Reflection</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Starting your day with self-reflection helps you become aware of your mental state before
                              trading decisions.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription>
                        Begin your day with awareness of your current state and intentions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="morningFeeling"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How did you wake up today? (1-10)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  defaultValue={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Terrible (1)</span>
                                  <span>Neutral (5)</span>
                                  <span>Excellent (10)</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!quickMode && (
                        <FormField
                          control={form.control}
                          name="morningNote"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes about your morning (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any specific thoughts or feelings when you woke up..."
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {!quickMode && (
                        <FormField
                          control={form.control}
                          name="dailyIntention"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What is your intention for today? (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Be specific about what you want to accomplish mentally today..."
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription>
                                Setting a clear intention helps focus your mind throughout the trading day
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="focusArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What matters more today?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your focus" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="discipline">Discipline (following my plan)</SelectItem>
                                <SelectItem value="result">Result (profit/loss)</SelectItem>
                                <SelectItem value="both">Both equally</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Clarifying your priority helps manage expectations</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Body and Brain Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>🧘 Body and Brain</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Your physical state directly impacts your trading decisions. Tracking these factors helps
                              identify patterns in performance.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription>Track physical factors that influence your mental performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sleepHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sleep (hours)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={12}
                                  step={0.5}
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sleepQuality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sleep Quality (1-10)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Poor (1)</span>
                                    <span>Good (10)</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {!quickMode && (
                        <FormField
                          control={form.control}
                          name="sleepNote"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sleep Notes (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any factors affecting your sleep..."
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="mealQuality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nutrition Quality (1-10)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Poor (1)</span>
                                    <span>Excellent (10)</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mealCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meals Today (count)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={10}
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="hydration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hydration Level (1-10)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  defaultValue={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Dehydrated (1)</span>
                                  <span>Well Hydrated (10)</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>Even mild dehydration can impair cognitive function</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="movement"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Movement / Stretching / Breathing</FormLabel>
                                <FormDescription>Have you done any physical activity today?</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {!quickMode && form.watch("movement") && (
                        <FormField
                          control={form.control}
                          name="movementNote"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Movement Notes (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="What type of movement did you do? How did it make you feel?"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Emotions Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>💬 Emotions</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Recognizing your emotions before trading helps identify potential biases in your
                              decision-making process.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription>Identify and manage your emotional state before trading</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="currentMood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How do you feel right now? (1-10)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  defaultValue={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Terrible (1)</span>
                                  <span>Neutral (5)</span>
                                  <span>Excellent (10)</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dominantEmotion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What emotion is dominant today?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your dominant emotion" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {emotionOptions.map((emotion) => (
                                  <SelectItem key={emotion} value={emotion}>
                                    {emotion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Naming your emotion helps create distance from it</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!quickMode && (
                        <FormField
                          control={form.control}
                          name="biggestFear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What are you most afraid of today? (optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your biggest trading fear" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fearOptions.map((fear) => (
                                    <SelectItem key={fear} value={fear}>
                                      {fear}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Acknowledging fears reduces their subconscious influence
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {!quickMode && (
                        <FormField
                          control={form.control}
                          name="stayingCentered"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What will help you stay centered today? (optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your centering technique" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {centeringOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Having a plan for emotional balance improves decision quality
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {!quickMode && (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>📊 Market Readiness</CardTitle>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Preparing for market conditions and having contingency plans improves your ability to
                                stay disciplined.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <CardDescription>Prepare for market conditions and potential challenges</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="marketExpectation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What do you expect from the markets today? (optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your market expectation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="trending_up">Trending Up</SelectItem>
                                  <SelectItem value="trending_down">Trending Down</SelectItem>
                                  <SelectItem value="ranging">Ranging/Sideways</SelectItem>
                                  <SelectItem value="volatile">Volatile</SelectItem>
                                  <SelectItem value="quiet">Quiet/Low Volume</SelectItem>
                                  <SelectItem value="uncertain">Uncertain</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Setting expectations helps you adapt to changing conditions
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="disruptionPlan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                What's your plan if the market disrupts your emotional balance? (optional)
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your disruption plan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="take_break">Take a 15-minute break</SelectItem>
                                  <SelectItem value="reduce_size">Reduce position size</SelectItem>
                                  <SelectItem value="stop_trading">Stop trading for the day</SelectItem>
                                  <SelectItem value="review_plan">Review my trading plan</SelectItem>
                                  <SelectItem value="journal">Write in my journal</SelectItem>
                                  <SelectItem value="breathing">Do breathing exercises</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Having a pre-planned response prevents impulsive decisions
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Free Time Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>🕒 Free Time</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Personal time is essential for mental recovery and preventing trading burnout.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription>Track time dedicated to yourself outside of trading</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="freeTimeHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How much time have you dedicated to yourself today? (hours)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={24}
                                step={0.5}
                                {...field}
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Less than 1 hour may increase risk of frustration with the market
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("freeTimeHours") < 1 && (
                        <Alert>
                          <HelpCircle className="h-4 w-4" />
                          <AlertTitle>Low personal time detected</AlertTitle>
                          <AlertDescription>
                            Consider taking a short break before trading to reset your mental state.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Movement/Sport Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>🏃‍♂️ Movement / Sport</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Physical activity improves cognitive function and emotional regulation, both critical for
                              trading.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription>Track physical activity and its impact on your trading mindset</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="didExercise"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Did you exercise today?</FormLabel>
                              <FormDescription>Include any intentional physical activity</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch("didExercise") && !quickMode && (
                        <FormField
                          control={form.control}
                          name="exerciseFeeling"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How did you feel after exercise? (1-10)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    defaultValue={[field.value || 5]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Worse (1)</span>
                                    <span>No Change (5)</span>
                                    <span>Much Better (10)</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {!form.watch("didExercise") && (
                        <Alert>
                          <HelpCircle className="h-4 w-4" />
                          <AlertTitle>No exercise recorded</AlertTitle>
                          <AlertDescription>
                            Consider taking a short walk to restore balance and improve focus before trading.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Day Result Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>💰 Trading Result</CardTitle>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Tracking results alongside mental state helps identify patterns in your trading
                              psychology.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <CardDescription>Record your trading performance for the day</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tradingResult"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profit/Loss Amount (optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter positive or negative number"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Enter your total profit or loss for the day</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("tradingResult") > 0 && (
                        <Alert>
                          <HelpCircle className="h-4 w-4" />
                          <AlertTitle>First profit recorded</AlertTitle>
                          <AlertDescription>
                            Consider closing your trading day instead of risking profits due to greed.
                          </AlertDescription>
                        </Alert>
                      )}

                      {form.watch("tradingResult") < 0 && (
                        <Alert>
                          <HelpCircle className="h-4 w-4" />
                          <AlertTitle>Loss detected</AlertTitle>
                          <AlertDescription>
                            Don't chase the market to recover losses. Take a break, record your thoughts, and pause.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {!quickMode && (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>✍️ Final Note</CardTitle>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Summarizing your mental state helps solidify awareness and creates a record for future
                                pattern recognition.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <CardDescription>Summarize your mental preparation for today</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="finalSummary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brief summary of today's mental state (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Summarize your overall mental preparation for trading today..."
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="winningCriteria"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How will you know you've "won" today? (optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your success criteria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="followed_plan">I followed my trading plan 100%</SelectItem>
                                  <SelectItem value="managed_emotions">I managed my emotions well</SelectItem>
                                  <SelectItem value="took_breaks">I took regular breaks</SelectItem>
                                  <SelectItem value="respected_stops">I respected all my stop losses</SelectItem>
                                  <SelectItem value="no_overtrading">I didn't overtrade</SelectItem>
                                  <SelectItem value="learned_something">I learned something valuable</SelectItem>
                                  <SelectItem value="profitable">I was profitable</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Defining success beyond P&L helps maintain a healthy trading mindset
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between">
                    <Button type="submit" size="lg">
                      <Save className="mr-2 h-4 w-4" />
                      Save Mental Training
                    </Button>

                    <div className="space-x-2">
                      {!quickMode && (
                        <Button type="button" variant="outline" onClick={handleEndOfDayReflection}>
                          End of Day Reflection
                        </Button>
                      )}

                      {hasAccess("pdf-export") ? (
                        <Button type="button" variant="outline" onClick={exportToPDF}>
                          <Download className="mr-2 h-4 w-4" />
                          Export to PDF
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" disabled>
                          <Download className="mr-2 h-4 w-4" />
                          Export to PDF (BASIC+)
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <LockedFeature
              featureId="history"
              title="Historie a grafy"
              description="Sledujte svůj mentální vývoj v čase a identifikujte vzorce"
            >
              <MindTraderHistory />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="reflection">
            <LockedFeature
              featureId="weekly-overview"
              title="Denní reflexe"
              description="Porovnejte své očekávání s realitou a zlepšete svou mentální přípravu"
            >
              <MindTraderReflection />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="behavior">
            <LockedFeature
              featureId="trading-behavior"
              title="Obchodní chování"
              description="Analyzujte své obchodní chování a identifikujte vzorce"
            >
              <MindTraderBehavior />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="helpers">
            <LockedFeature
              featureId="motivation"
              title="Mentální pomocníci"
              description="Nástroje pro zlepšení vaší mentální přípravy a obchodního výkonu"
            >
              <MindTraderHelpers />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="notifications">
            <LockedFeature
              featureId="notifications"
              title="Notifikace"
              description="Nastavte si připomínky pro důležité obchodní rutiny"
            >
              <MindTraderNotifications />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="export">
            <LockedFeature
              featureId="pdf-export"
              title="Export"
              description="Exportujte své záznamy do PDF nebo sdílejte s mentorem"
            >
              <MindTraderExport />
            </LockedFeature>
          </TabsContent>
        </Tabs>

        {showEndOfDayReflection && !quickMode && hasAccess("weekly-overview") && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>End of Day Reflection</CardTitle>
              <CardDescription>
                Compare your expectations with reality to improve future mental preparation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reflection">
                <TabsList>
                  <TabsTrigger value="reflection">Reflection Questions</TabsTrigger>
                  <TabsTrigger value="comparison">Morning vs. Reality</TabsTrigger>
                </TabsList>
                <TabsContent value="reflection" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Did you follow your trading plan today?</h3>
                      <RadioGroup defaultValue="yes">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="plan-yes" />
                          <label htmlFor="plan-yes">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mostly" id="plan-mostly" />
                          <label htmlFor="plan-mostly">Mostly</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="somewhat" id="plan-somewhat" />
                          <label htmlFor="plan-somewhat">Somewhat</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="plan-no" />
                          <label htmlFor="plan-no">No</label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">What emotions influenced your trading decisions?</h3>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary emotion" />
                        </SelectTrigger>
                        <SelectContent>
                          {emotionOptions.map((emotion) => (
                            <SelectItem key={emotion} value={emotion}>
                              {emotion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">What will you do differently tomorrow?</h3>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select improvement area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="better_preparation">Better preparation</SelectItem>
                          <SelectItem value="more_patience">More patience</SelectItem>
                          <SelectItem value="stricter_rules">Stricter rule adherence</SelectItem>
                          <SelectItem value="better_entries">Better entries</SelectItem>
                          <SelectItem value="better_exits">Better exits</SelectItem>
                          <SelectItem value="emotional_control">Better emotional control</SelectItem>
                          <SelectItem value="take_breaks">Take more breaks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="comparison" className="pt-4">
                  <div className="space-y-4">
                    <Alert>
                      <AlertTitle>Mental Stability Score: {mentalStability}%</AlertTitle>
                      <AlertDescription>
                        This score reflects your overall mental preparation for trading today.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Morning Intention</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{form.watch("dailyIntention") || "Not set"}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Actual Outcome</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RadioGroup defaultValue="yes">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="intention-yes" />
                              <label htmlFor="intention-yes">Achieved</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="partially" id="intention-partially" />
                              <label htmlFor="intention-partially">Partially achieved</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="intention-no" />
                              <label htmlFor="intention-no">Not achieved</label>
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Reflection</Button>
            </CardFooter>
          </Card>
        )}

        {/* Trading Advice Section - Conditional recommendations based on mental state */}
        <Card className="mt-8 border-2 border-primary">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>🧠 Trading Advice</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Personalized recommendations based on your current mental state and historical patterns.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>Actionable guidance based on your mental readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentalStability < 50 && (
                <Alert variant="destructive">
                  <AlertTitle>Consider taking a day off from trading</AlertTitle>
                  <AlertDescription>
                    Your mental stability score is below 50%. Trading in this state significantly increases the risk of
                    emotional decisions and losses.
                  </AlertDescription>
                </Alert>
              )}

              {mentalStability >= 50 && mentalStability < 70 && (
                <Alert>
                  <AlertTitle>Trade with reduced position size today</AlertTitle>
                  <AlertDescription>
                    Your mental stability score is {mentalStability}%. Consider reducing your standard position size by
                    30-50%.
                  </AlertDescription>
                </Alert>
              )}

              {mentalStability >= 70 && mentalStability < 85 && (
                <Alert>
                  <AlertTitle>Normal trading conditions</AlertTitle>
                  <AlertDescription>
                    Your mental stability score is {mentalStability}%. You're in a good state for trading.
                  </AlertDescription>
                </Alert>
              )}

              {mentalStability >= 85 && (
                <Alert className="border-green-500 text-green-500">
                  <AlertTitle>Optimal trading conditions</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Your mental stability score is {mentalStability}%. This is an excellent day to follow your trading
                    plan with confidence.
                  </AlertDescription>
                </Alert>
              )}

              {form.watch("sleepHours") < 6 && (
                <Alert>
                  <AlertTitle>Sleep deficit detected</AlertTitle>
                  <AlertDescription>
                    You've reported less than 6 hours of sleep. Consider more conservative trading today.
                  </AlertDescription>
                </Alert>
              )}

              {form.watch("currentMood") <= 3 && (
                <Alert>
                  <AlertTitle>Low mood alert</AlertTitle>
                  <AlertDescription>
                    Your current mood is rated low. If you trade today, implement a strict "one-and-done" loss policy.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
