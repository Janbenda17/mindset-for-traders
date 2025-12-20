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
              <TradingStyleProvider>
                <DataProvider>
                  <DailyStageProvider>
                    <LossResetProvider>
                      <LanguageProvider>
                        <ClientLayout>{children}</ClientLayout>
                      </LanguageProvider>
                    </LossResetProvider>
                  </DailyStageProvider>
                </DataProvider>
              </TradingStyleProvider>
            </GamificationProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
