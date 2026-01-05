import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"
import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { GamificationProvider } from "@/contexts/gamification-context"
import { TradingStyleProvider } from "@/contexts/trading-style-context"
import { LossResetProvider } from "@/contexts/loss-reset-context"
import { DailyStageProvider } from "@/contexts/daily-stage-context"
import { LanguageProvider } from "@/contexts/language-context"
import { AIInsightsProvider } from "@/contexts/ai-insights-context"
import { CommunityChallengesProvider } from "@/contexts/community-challenges-context"
import { MilestoneCelebrationsProvider } from "@/contexts/milestone-celebrations-context"
import { StreakProvider } from "@/contexts/streak-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { CloudSyncProvider } from "@/contexts/cloud-sync-context"
import { TradingIntegrationProvider } from "@/contexts/trading-integration-context"
import { AdminProvider } from "@/contexts/admin-context"
import { LiveModeProvider } from "@/contexts/live-mode-context"
import { AnalyticsProvider } from "@/contexts/analytics-context"

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
          <LiveModeProvider>
            {" "}
            {/* Add LiveModeProvider right after AuthProvider */}
            <AdminProvider>
              <SubscriptionProvider>
                <GamificationProvider>
                  <TradingStyleProvider>
                    <DataProvider>
                      <AnalyticsProvider>
                        <DailyStageProvider>
                          <LossResetProvider>
                            <AIInsightsProvider>
                              <CommunityChallengesProvider>
                                <MilestoneCelebrationsProvider>
                                  <StreakProvider>
                                    <NotificationsProvider>
                                      <CloudSyncProvider>
                                        <TradingIntegrationProvider>
                                          <LanguageProvider>
                                            <ClientLayout>{children}</ClientLayout>
                                          </LanguageProvider>
                                        </TradingIntegrationProvider>
                                      </CloudSyncProvider>
                                    </NotificationsProvider>
                                  </StreakProvider>
                                </MilestoneCelebrationsProvider>
                              </CommunityChallengesProvider>
                            </AIInsightsProvider>
                          </LossResetProvider>
                        </DailyStageProvider>
                      </AnalyticsProvider>
                    </DataProvider>
                  </TradingStyleProvider>
                </GamificationProvider>
              </SubscriptionProvider>
            </AdminProvider>
          </LiveModeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
