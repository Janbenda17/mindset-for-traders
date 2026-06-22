"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles, Loader, Calendar, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/data-context"

interface FailLog {
  id: string
  date: string
  title: string
  rootCause: string
  category: string
  actionPlan: string
  lessonLearned: string
  severity: 'high' | 'medium' | 'low'
  trade?: {
    symbol: string
    entry: number
    exit: number
    loss: number
    timeInTrade?: string
  }
  aiGenerated: boolean
}

const severityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
  medium: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  low: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

const DEMO_FAIL_LOGS: FailLog[] = [
  {
    id: 'demo-1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    title: 'Vstup proti trendu na EUR/USD',
    rootCause: 'Vstup do shortu proti silnému růstovému trendu jen na pocit, že cena je "už moc vysoko" - bez potvrzení na vyšším časovém rámci.',
    category: 'Vstup bez plánu',
    actionPlan: 'Před každým vstupem zkontrolovat směr trendu na denním/4H grafu. Obchodovat pouze ve směru trendu, pokud nemám jasný reversal setup.',
    lessonLearned: 'Trh může zůstat "moc vysoko" nebo "moc nízko" mnohem déle, než vydrží účet.',
    severity: 'high',
    trade: { symbol: 'EUR/USD', entry: 1.0850, exit: 1.091, loss: 420, timeInTrade: '45 min' },
    aiGenerated: false,
  },
  {
    id: 'demo-2',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    title: 'Revenge trade po předchozí ztrátě',
    rootCause: 'Hned po ztrátovém obchodu jsem otevřel další pozici s větší velikostí, abych "dorovnal" ztrátu, bez nového validního setupu.',
    category: 'Revenge trading',
    actionPlan: 'Po jakékoliv ztrátě udělat povinnou pauzu alespoň 10 minut a obchod znovu zapsat do plánu, ne reagovat impulzivně.',
    lessonLearned: 'Emoční obchod po ztrátě téměř vždy zvyšuje ztrátu - velikost pozice musí klesat, ne růst, po neúspěchu.',
    severity: 'high',
    trade: { symbol: 'XAU/USD', entry: 2015.4, exit: 2008.2, loss: 610, timeInTrade: '20 min' },
    aiGenerated: false,
  },
  {
    id: 'demo-3',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    title: 'Overtrading - 7 obchodů v jeden den',
    rootCause: 'Po dvou úspěšných obchodech ráno jsem pokračoval v hledání dalších setupů i odpoledne, kdy už trh byl klidný a bez kvalitních signálů.',
    category: 'Overtrading',
    actionPlan: 'Nastavit denní limit max. 3 obchody. Po dosažení limitu zavřít platformu, i když "vypadá" další setup lákavě.',
    lessonLearned: 'Kvalita setupů klesá s počtem obchodů za den - nejlepší obchody jsou obvykle první 1-2 v session.',
    severity: 'medium',
    trade: { symbol: 'GBP/USD', entry: 1.265, exit: 1.2618, loss: 180, timeInTrade: '15 min' },
    aiGenerated: false,
  },
]

export default function FailLogPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()
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
      console.log('[v0] Starting fail log generation...')
      
      const response = await fetch('/api/fail-log/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('[v0] API response status:', response.status)

      if (!response.ok) {
        const text = await response.text()
        console.error('[v0] API error response:', text)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] API data received:', data)

      if (data.success && data.logs) {
        setFailLogs(data.logs)
        localStorage.setItem('fail-logs-ai', JSON.stringify(data.logs))
        toast({
          title: 'Hotovo!',
          description: 'Fail logy byly analyzovány AI'
        })
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error) {
      console.error('[v0] Error generating fail logs:', error)
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se analyzovat fail logy. Zkuste znovu.',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  // In demo mode, show example fail logs until the user has real ones (own or AI-generated)
  const displayLogs = failLogs.length > 0 ? failLogs : !isLiveMode ? DEMO_FAIL_LOGS : []
  const isShowingDemo = failLogs.length === 0 && !isLiveMode && displayLogs.length > 0

  const groupedByDate = displayLogs.reduce((acc, log) => {
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
          {isShowingDemo && (
            <div className="inline-flex mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              Ukázková data — takhle to bude vypadat s tvými vlastními obchody
            </div>
          )}
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
                    <Card key={log.id} className="bg-slate-900 border-slate-700 hover:border-red-500/40 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-white flex items-center gap-2 text-base">
                            <TrendingDown className="w-5 h-5 text-red-400 shrink-0" />
                            {log.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 shrink-0">
                            {log.severity && (
                              <Badge className={`text-xs border ${severityColors[log.severity] ?? ''}`}>
                                {log.severity === 'high' ? 'Vysoká' : log.severity === 'medium' ? 'Střední' : 'Nízká'}
                              </Badge>
                            )}
                            {log.category && (
                              <Badge className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                                {log.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/30">
                            <p className="text-xs font-semibold text-red-400 mb-1 uppercase tracking-wide">Kořenová příčina</p>
                            <p className="text-sm text-slate-200">{log.rootCause}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/30">
                            <p className="text-xs font-semibold text-amber-400 mb-1 uppercase tracking-wide">Klíčová lekce</p>
                            <p className="text-sm text-slate-200">{log.lessonLearned}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
                            <p className="text-xs font-semibold text-emerald-400 mb-1 uppercase tracking-wide">Akční plán</p>
                            <p className="text-sm text-slate-200">{log.actionPlan}</p>
                          </div>
                        </div>

                        {log.trade && (
                          <div className="flex items-center gap-6 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <span className="font-bold text-white">{log.trade.symbol}</span>
                            <span className="text-slate-400 text-sm">Entry: <span className="text-white">{log.trade.entry}</span></span>
                            <span className="text-slate-400 text-sm">Exit: <span className="text-white">{log.trade.exit}</span></span>
                            <span className="text-red-400 font-semibold ml-auto">-${log.trade.loss.toFixed(2)}</span>
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
