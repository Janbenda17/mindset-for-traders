'use client'

import { TopNavigation } from '@/components/top-navigation'
import { WeeklyReviewAnalysis } from '@/components/weekly-review-analysis'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function WeeklyReviewPage() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <TopNavigation />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Weekly Trading Review</h1>
              <p className="text-slate-400">
                Your AI-generated insights from the past 7 days of trading
              </p>
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        <WeeklyReviewAnalysis />
      </main>
    </div>
  )
}{review.weekStart}</CardTitle>
                        <Badge variant={review.variant === "ai" ? "default" : "outline"} className="text-xs">
                          {review.variant === "ai" ? "AI" : "Manuální"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Trades</p>
                          <p className="text-lg font-bold text-white">{review.totalTrades}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Win%</p>
                          <p className="text-lg font-bold text-green-400">{roundPercent(review.winRate)}%</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">PnL</p>
                          <p className="text-lg font-bold text-white">${review.totalPnL}</p>
                        </div>
                      </div>
                      <div className="mb-3 space-y-1 text-xs">
                        <p className="text-gray-400">
                          Readiness: <span className="text-blue-400 font-semibold">{roundPercent(review.avgReadiness)}%</span>
                        </p>
                        <p className="text-gray-400">
                          Sleep: <span className={review.avgSleep >= 7 ? "text-green-400 font-semibold" : "text-orange-400 font-semibold"}>{review.avgSleep?.toFixed(1)}h</span>
                        </p>
                        <p className="text-gray-400">
                          Stress: <span className={review.avgStress <= 50 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>{roundPercent(review.avgStress)}%</span>
                        </p>
                        <p className="text-gray-400">
                          Revenge Trades: <span className={review.revengeIncidents > 0 ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>{review.revengeIncidents}</span>
                        </p>
                      </div>
                      <div className="mb-2 space-y-2">
                        <p className="text-xs text-gray-300 font-semibold">Poznámka:</p>
                        <p className="text-gray-300 text-xs line-clamp-2">{review.whatWorked || "Bez poznámek"}</p>
                      </div>
                      {review.aiInsights && review.aiInsights.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                          <p className="text-xs text-purple-400 font-semibold">AI Insights:</p>
                          {review.aiInsights.slice(0, 2).map((insight: any, idx: number) => {
                            // Handle both old format (objects) and new format (strings)
                            const insightText = typeof insight === 'string' ? insight : insight.description || '';
                            return (
                              <div key={idx} className="text-xs text-gray-300 bg-slate-700/30 p-2 rounded">
                                <p className="text-gray-300 text-xs">{insightText}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>
            )}

            {/* Review Form - Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 text-sm">What worked?</Label>
                    <Textarea
                      value={review.whatWorked || ""}
                      onChange={(e) => setReview({ ...review, whatWorked: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[100px]"
                      placeholder="Describe successful strategies and behavior..."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">What didn't work?</Label>
                    <Textarea
                      value={review.whatDidntWork || ""}
                      onChange={(e) => setReview({ ...review, whatDidntWork: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[100px]"
                      placeholder="Identify mistakes and weak spots..."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Mistakes & Lessons</Label>
                    <Textarea
                      value={review.mistakesMade || ""}
                      onChange={(e) => setReview({ ...review, mistakesMade: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[100px]"
                      placeholder="What did you learn from your mistakes..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Right Column */}
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-400" />
                      Psychological Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-gray-300 text-sm">Emotional Patterns</Label>
                      <Textarea
                        value={review.emotionalPatterns || ""}
                        onChange={(e) => setReview({ ...review, emotionalPatterns: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[120px]"
                        placeholder="How did you feel during trading..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-400" />
                      Action Plan for Next Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {actionPlan.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...actionPlan];
                            updated[index].text = e.target.value;
                            setActionPlan(updated);
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder={`Goal ${index + 1}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={saveReview} 
              className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Weekly Overview
            </Button>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {savedReviews.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No saved overviews yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedReviews.map((review) => (
                  <Card key={review.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">{review.weekStart} - {review.weekEnd}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString('cs-CZ')}</p>
                        </div>
                        <Badge variant={review.variant === "ai" ? "default" : "outline"} className="text-xs">
                          {review.variant === "ai" ? "AI" : "Manuální"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Trades</p>
                          <p className="text-lg font-bold text-white">{review.totalTrades}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Win%</p>
                          <p className="text-lg font-bold text-green-400">{review.winRate}%</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">PnL</p>
                          <p className="text-lg font-bold text-white">${review.totalPnL}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{review.whatWorked || "Bez poznámek"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
