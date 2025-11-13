"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  HeartPulse,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ACTION_FLOWS, type ActionFlow } from "@/types/action-flows"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"

interface ActionFlowGuideProps {
  flowId?: string
}

export function ActionFlowGuide({ flowId }: ActionFlowGuideProps) {
  const [selectedFlow, setSelectedFlow] = useState<ActionFlow | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load completed steps from localStorage
    const saved = localStorage.getItem("mindtrader-action-flows")
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading action flows:", error)
      }
    }

    // Auto-select flow if flowId is provided
    if (flowId) {
      const flow = ACTION_FLOWS.find((f) => f.id === flowId)
      if (flow) {
        setSelectedFlow(flow)
      }
    }
  }, [flowId])

  const toggleStep = (flowId: string, stepId: string) => {
    const key = `${flowId}-${stepId}`
    const newCompleted = { ...completedSteps, [key]: !completedSteps[key] }
    setCompletedSteps(newCompleted)
    localStorage.setItem("mindtrader-action-flows", JSON.stringify(newCompleted))
  }

  const resetFlow = (flowId: string) => {
    const newCompleted = { ...completedSteps }
    Object.keys(newCompleted).forEach((key) => {
      if (key.startsWith(`${flowId}-`)) {
        delete newCompleted[key]
      }
    })
    setCompletedSteps(newCompleted)
    localStorage.setItem("mindtrader-action-flows", JSON.stringify(newCompleted))
  }

  const getFlowProgress = (flow: ActionFlow) => {
    const completed = flow.steps.filter((step) => completedSteps[`${flow.id}-${step.id}`]).length
    return (completed / flow.steps.length) * 100
  }

  const getCategoryIcon = (category: ActionFlow["category"]) => {
    switch (category) {
      case "daily":
        return Calendar
      case "weekly":
        return TrendingUp
      case "setup":
        return Settings
      case "recovery":
        return HeartPulse
      case "onboarding":
        return Target
      default:
        return Target
    }
  }

  const getCategoryColor = (category: ActionFlow["category"]) => {
    switch (category) {
      case "daily":
        return "from-blue-500 to-cyan-500"
      case "weekly":
        return "from-purple-500 to-pink-500"
      case "setup":
        return "from-orange-500 to-red-500"
      case "recovery":
        return "from-red-500 to-rose-500"
      case "onboarding":
        return "from-green-500 to-emerald-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  if (selectedFlow) {
    const progress = getFlowProgress(selectedFlow)
    const completedCount = selectedFlow.steps.filter((step) => completedSteps[`${selectedFlow.id}-${step.id}`]).length
    const isComplete = completedCount === selectedFlow.steps.length

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedFlow(null)} className="bg-transparent">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Flows
          </Button>
          <Button variant="outline" onClick={() => resetFlow(selectedFlow.id)} className="bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Flow
          </Button>
        </div>

        {/* Flow Header */}
        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge className={cn("bg-gradient-to-r text-white border-0", getCategoryColor(selectedFlow.category))}>
                {selectedFlow.category.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{selectedFlow.totalTime}</span>
              </div>
            </div>
            <CardTitle className="text-white text-3xl">{selectedFlow.title}</CardTitle>
            <CardDescription className="text-gray-400 text-lg">{selectedFlow.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-bold">
                  {completedCount} / {selectedFlow.steps.length} steps
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {isComplete && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <AlertDescription>
                  <p className="font-bold text-green-400">🎉 Flow completed!</p>
                  <p className="text-gray-300 mt-1">Great job! You've completed all steps in this flow.</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {selectedFlow.steps.map((step, index) => {
            const isCompleted = completedSteps[`${selectedFlow.id}-${step.id}`]
            const isExpanded = expandedSteps[step.id]

            return (
              <Collapsible
                key={step.id}
                open={isExpanded}
                onOpenChange={(open) => setExpandedSteps({ ...expandedSteps, [step.id]: open })}
              >
                <Card
                  className={cn(
                    "bg-slate-900/80 border-slate-700/50 backdrop-blur-xl transition-all",
                    isCompleted && "border-green-500/30 bg-green-500/5",
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => toggleStep(selectedFlow.id, step.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{step.icon}</span>
                            <div>
                              <h3 className={cn("font-bold text-lg", isCompleted && "line-through text-gray-500")}>
                                {step.title}
                              </h3>
                              {step.required && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {step.estimatedTime}
                            </Badge>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        <p className={cn("text-gray-400", isCompleted && "line-through")}>{step.description}</p>

                        <CollapsibleContent className="mt-4 space-y-3">
                          {step.helpText && (
                            <Alert className="border-blue-500/30 bg-blue-500/10">
                              <AlertTriangle className="w-4 h-4 text-blue-400" />
                              <AlertDescription>
                                <p className="text-sm text-gray-300">{step.helpText}</p>
                              </AlertDescription>
                            </Alert>
                          )}

                          {step.linkTo && (
                            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                              <Link href={step.linkTo}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Go to {step.title}
                              </Link>
                            </Button>
                          )}
                        </CollapsibleContent>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-3xl flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-400" />
            Action Flow Guide
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Simple, systematic workflows to keep you consistent and disciplined
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Flow Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACTION_FLOWS.map((flow) => {
          const Icon = getCategoryIcon(flow.category)
          const progress = getFlowProgress(flow)
          const completedCount = flow.steps.filter((step) => completedSteps[`${flow.id}-${step.id}`]).length

          return (
            <Card
              key={flow.id}
              className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl hover:scale-105 transition-all cursor-pointer"
              onClick={() => setSelectedFlow(flow)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn("p-3 rounded-xl bg-gradient-to-r", getCategoryColor(flow.category))}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      className={cn(
                        flow.priority === "high" && "bg-red-500/20 text-red-400 border-red-500/30",
                        flow.priority === "medium" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                        flow.priority === "low" && "bg-green-500/20 text-green-400 border-green-500/30",
                      )}
                    >
                      {flow.priority}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-white mb-2">{flow.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{flow.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Clock className="w-3 h-3" />
                      <span>{flow.totalTime}</span>
                      <span>•</span>
                      <span>{flow.steps.length} steps</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-bold">
                        {completedCount} / {flow.steps.length}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    Start Flow
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
