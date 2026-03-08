import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"
import { ThemeProvider } from "@/components/theme-provider"
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
import { AutoTranslator } from '@/components/auto-translator'
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <AutoTranslator />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <AuthProvider>
            <SubscriptionProvider>
              <LiveModeProvider>
                <AdminProvider>
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
                </AdminProvider>
              </LiveModeProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
