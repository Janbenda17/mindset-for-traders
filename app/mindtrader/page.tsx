"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, MessageCircle, Lightbulb, Target } from "lucide-react"

export default function MindTraderPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">MindTrader AI</h1>
        <p className="text-gray-600 mt-2">Váš osobní AI trenér pro trading psychologii</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
            <CardTitle>AI Konzultace</CardTitle>
            <CardDescription>Diskutujte své trading problémy s AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Začít konverzaci</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Lightbulb className="w-8 h-8 text-yellow-600 mb-2" />
            <CardTitle>Personalizované tipy</CardTitle>
            <CardDescription>Získejte rady na míru vašemu stylu</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-transparent" variant="outline">
              Zobrazit tipy
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Target className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Analýza vzorů</CardTitle>
            <CardDescription>Identifikujte své trading vzory</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-transparent" variant="outline">
              Analyzovat
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Chat</CardTitle>
          <CardDescription>Začněte konverzaci s vaším AI trenérem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">MindTrader AI je připraven</p>
              <p className="text-sm text-gray-600 mb-4">Začněte konverzaci o vašich trading výzvách</p>
              <Button>Začít chat</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
