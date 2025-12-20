import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"
import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { GamificationProvider } from "@/contexts/gamification-context"
import { LossResetProvider } from "@/contexts/loss-reset-context"
import { TradingStyleProvider } from "@/contexts/trading-style-context"
import { DailyStageProvider } from "@/contexts/daily-stage-context"
import { LanguageProvider } from "@/contexts/language-context"
import { AIInsightsProvider } from "@/contexts/ai-insights-context"
import { CommunityChallengesProvider } from "@/contexts/community-challenges-context"
import { StreakProvider } from "@/contexts/streak-context"
import { MilestoneCelebrationsProvider } from "@/contexts/milestone-celebrations-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MindTrader AI - Trading Psychology Platform",
  description: "Advanced trading psychology and performance tracking platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <SubscriptionProvider>
            <GamificationProvider>
              <MilestoneCelebrationsProvider>
                <TradingStyleProvider>
                  <DataProvider>
                    <LossResetProvider>
                      <DailyStageProvider>
                        <LanguageProvider>
                          <AIInsightsProvider>
                            <CommunityChallengesProvider>
                              <StreakProvider>
                                <ClientLayout>{children}</ClientLayout>
                              </StreakProvider>
                            </CommunityChallengesProvider>
                          </AIInsightsProvider>
                        </LanguageProvider>
                      </DailyStageProvider>
                    </LossResetProvider>
                  </DataProvider>
                </TradingStyleProvider>
              </MilestoneCelebrationsProvider>
            </GamificationProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
