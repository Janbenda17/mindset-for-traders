import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { DataProvider } from "@/contexts/data-context"
import { AuthProvider } from "@/contexts/auth-context"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { LanguageProvider } from "@/contexts/language-context"
import { DailyStageProvider } from "@/contexts/daily-stage-context"
import { GamificationProvider } from "@/contexts/gamification-context"
import { LossResetProvider } from "@/contexts/loss-reset-context"
import { CloudSyncProvider } from "@/contexts/cloud-sync-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { TradingStyleProvider } from "@/contexts/trading-style-context"
import { TradingIntegrationProvider } from "@/contexts/trading-integration-context"
import { AIInsightsProvider } from "@/contexts/ai-insights-context"
import { StreakProvider } from "@/contexts/streak-context"
import { CommunityChallengesProvider } from "@/contexts/community-challenges-context"
import { MilestoneCelebrationsProvider } from "@/contexts/milestone-celebrations-context"
import { Toaster } from "@/components/ui/toaster"
import { XPNotification } from "@/components/xp-notification"
import { LossResetModal } from "@/components/loss-reset-modal"
import { NotificationPermissionBanner } from "@/components/notification-permission-banner"
import ClientLayout from "./ClientLayout"

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SubscriptionProvider>
              <LanguageProvider>
                <CloudSyncProvider>
                  <NotificationsProvider>
                    <TradingStyleProvider>
                      <TradingIntegrationProvider>
                        <DataProvider>
                          <DailyStageProvider>
                            <GamificationProvider>
                              <StreakProvider>
                                <AIInsightsProvider>
                                  <CommunityChallengesProvider>
                                    <MilestoneCelebrationsProvider>
                                      <LossResetProvider>
                                        <ClientLayout>{children}</ClientLayout>
                                        <Toaster />
                                        <XPNotification />
                                        <LossResetModal />
                                        <NotificationPermissionBanner />
                                        <Analytics />
                                      </LossResetProvider>
                                    </MilestoneCelebrationsProvider>
                                  </CommunityChallengesProvider>
                                </AIInsightsProvider>
                              </StreakProvider>
                            </GamificationProvider>
                          </DailyStageProvider>
                        </DataProvider>
                      </TradingIntegrationProvider>
                    </TradingStyleProvider>
                  </NotificationsProvider>
                </CloudSyncProvider>
              </LanguageProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
