"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles, Loader, Calendar, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface FailLog {
  id: string
  date: string
  title: string
  rootCause: string
  actionPlan: string
  lessonLearned: string
  trade?: {
    symbol: string
    entry: number
    exit: number
    loss: number
  }
  aiGenerated: boolean
}

export default function FailLogPage() {
  const { toast } = useToast()
  const [failLogs, setFailLogs] = useState<FailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchFailLogs()
  }, [])

  const fetchFailLogs = async () => {
    try {
      setLoading(true)
      const stored = localStorage.getItem('fail-logs-ai')
      if (stored) {
        setFailLogs(JSON.parse(stored))
      }
    } catch (error) {
      console.error('[v0] Error fetching fail logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateFailLogsWithAI = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/fail-log/generate', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success && data.logs) {
        setFailLogs(data.logs)
        localStorage.setItem('fail-logs-ai', JSON.stringify(data.logs))
        toast({
          title: 'Hotovo!',
          description: 'Fail logy byly analyzovány AI'
        })
      }
    } catch (error) {
      console.error('[v0] Error generating fail logs:', error)
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se analyzovat fail logy',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  const groupedByDate = failLogs.reduce((acc, log) => {
    const date = log.date
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {} as Record<string, FailLog[]>)

  const sortedDates = Object.keys(groupedByDate).sort().reverse()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/bonus" className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Zpět</span>
          </div>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fail Log - Chyby a Lekce</h1>
          <p className="text-slate-400">Historie neúspěšných obchodů a co se z nich naučit</p>
        </div>

        <Button
          onClick={generateFailLogsWithAI}
          disabled={generating}
          className="mb-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
        >
          {generating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generuji...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyzovat s AI
            </>
          )}
        </Button>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Načítám...</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="p-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-lg text-center">
            <p className="text-slate-400">Žádné fail logy. Klikněte na "Analyzovat s AI"</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  {new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>

                <div className="grid gap-4">
                  {groupedByDate[date].map(log => (
                    <Card key={log.id} className="bg-red-900/20 border-red-600/30 hover:border-red-500/50 transition-all">
                      <CardHeader>
                        <CardTitle className="text-red-300 flex items-start justify-between">
                          <span className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            {log.title}
                          </span>
                          {log.aiGenerated && (
                            <Badge className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1">
                              AI analýza
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Příčina:</p>
                          <p className="text-sm text-red-300">{log.rootCause}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 mb-1">Co se naučit:</p>
                          <p className="text-sm text-slate-300">{log.lessonLearned}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 mb-1">Jak tomu zabránit:</p>
                          <p className="text-sm text-slate-300">{log.actionPlan}</p>
                        </div>

                        {log.trade && (
                          <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                            <p className="text-xs text-slate-400 mb-2">Trade Details:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                              <span>{log.trade.symbol}</span>
                              <span className="text-right">Ztráta: ${log.trade.loss.toFixed(2)}</span>
                              <span>Entry: ${log.trade.entry.toFixed(2)}</span>
                              <span className="text-right">Exit: ${log.trade.exit.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
