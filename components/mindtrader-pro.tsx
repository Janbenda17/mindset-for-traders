"use client"

import { LockedFeature } from "@/components/locked-feature"
import { MindTraderHistory } from "@/components/mindtrader-history"
import { MindTraderHelpers } from "@/components/mindtrader-helpers"
import { MindTraderNotifications } from "@/components/mindtrader-notifications"
import { MindTraderReflection } from "@/components/mindtrader-reflection"
import { MindTraderExport } from "@/components/mindtrader-export"
import { MindTraderBehavior } from "@/components/mindtrader-behavior"
import { MindTraderAssessment } from "@/components/mindtrader-assessment"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Brain, FileText, Settings, BarChart2 } from 'lucide-react'

export function MindTraderPro() {
  return (
    <LockedFeature
      feature="mindtrader-pro"
      title="MindTrader AI Pro"
      description="Odemkněte pokročilé funkce AI pro hlubší psychologickou analýzu a personalizované vedení."
    >
      <Tabs defaultValue="assessment" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto bg-muted/50 p-1">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Assessment</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Analýza</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Chování</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Nástroje</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <MindTraderAssessment />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border border-purple-100 dark:border-purple-900/50">
            <MindTraderReflection />
            <div className="mt-8 pt-8 border-t border-purple-200 dark:border-purple-800/30">
              <MindTraderHistory />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 rounded-xl border border-orange-100 dark:border-orange-900/50">
            <MindTraderBehavior />
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <MindTraderHelpers />
            <div className="space-y-6">
              <MindTraderNotifications />
              <MindTraderExport />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </LockedFeature>
  )
}
