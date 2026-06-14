'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Plus, Calendar, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function JournalPage() {
  const { isEn } = useLanguage()
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '14.6.2026',
      type: 'trade',
      pair: 'EUR/USD',
      result: '+150 pips',
      notes: 'Perfect breakout setup on 1h chart, followed plan'
    },
    {
      id: 2,
      date: '14.6.2026',
      type: 'trade',
      pair: 'GBP/USD',
      result: '-80 pips',
      notes: 'Early entry, should have waited for confirmation'
    },
    {
      id: 3,
      date: '13.6.2026',
      type: 'note',
      title: 'Weekly Reflection',
      content: 'Good progress this week - focused on quality over quantity. Need to improve entry timing.'
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              {isEn ? 'Trading Journal' : 'Obchodní Deník'}
            </h1>
          </div>
          <p className="text-slate-400">
            {isEn ? 'Track your trades and progress' : 'Sleduj své obchody a pokrok'}
          </p>
        </motion.div>

        <Tabs defaultValue="trades" className="w-full">
          <TabsList className="mb-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="trades" className="gap-2">
              <Calendar className="w-4 h-4" />
              {isEn ? 'Trades' : 'Obchody'}
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="w-4 h-4" />
              {isEn ? 'Notes' : 'Poznámky'}
            </TabsTrigger>
          </TabsList>

          {/* Trades Tab */}
          <TabsContent value="trades" className="space-y-4">
            <Button className="gap-2 mb-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              {isEn ? 'New Trade' : 'Nový obchod'}
            </Button>

            {entries
              .filter((e) => e.type === 'trade')
              .map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-slate-400">{entry.date}</p>
                          <p className="text-lg font-bold text-white mt-1">{entry.pair}</p>
                          <p className="text-sm text-slate-300 mt-2">{entry.notes}</p>
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            entry.result.startsWith('+') ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {entry.result}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Button className="gap-2 mb-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              {isEn ? 'New Note' : 'Nová poznámka'}
            </Button>

            {entries
              .filter((e) => e.type === 'note')
              .map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">{entry.date}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
