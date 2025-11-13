"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <CardTitle className="text-3xl">Právní upozornění (Disclaimer)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            MindTrader je nástroj pro mentální a psychologickou přípravu traderů. Neposkytuje investiční, finanční ani
            právní poradenství.
          </p>
          <p>
            Veškeré informace mají vzdělávací charakter a nepředstavují investiční doporučení. Používání aplikace je
            výhradně na vlastní odpovědnost uživatele.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">Důležité upozornění:</p>
            <p className="mt-2">
              Obchodování s finančními instrumenty je rizikové a může vést k finančním ztrátám. Před jakýmkoliv
              rozhodnutím se poraďte s odborníkem. Provozovatel aplikace nenesepovědnost za vaše obchodní výsledky.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
