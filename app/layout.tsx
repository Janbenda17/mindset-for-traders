import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
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
import { SiteAnalyticsTracker } from '@/components/site-analytics-tracker'
import { StreakProvider } from "@/contexts/streak-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { TradingIntegrationProvider } from "@/contexts/trading-integration-context"
import { AdminProvider } from "@/contexts/admin-context"
import { LiveModeProvider } from "@/contexts/live-mode-context"
import { AnalyticsProvider } from "@/contexts/analytics-context"
import { MilestoneCelebrationsProvider } from "@/contexts/milestone-celebrations-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
title: "MindTrader AI - Trading Psychology Platform",
description: "Advanced trading psychology and performance tracking platform",
generator: 'v0.app',
other: {
"trustpilot-one-time-domain-verification-id": "084c5f53-f122-48f8-83cc-3c63964e54a5",
"facebook-domain-verification": "b7wk4ssr4j3mnwh4c9uh70s6qv2qo1",
},
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
<body className={inter.className}>
{/* Google Analytics */}
{process.env.NEXT_PUBLIC_GA_ID && (
<>
<Script
strategy="afterInteractive"
src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
/>
<Script
id="gtag-init"
strategy="afterInteractive"
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
{/* Microsoft Clarity */}
<Script
id="clarity-init"
strategy="afterInteractive"
dangerouslySetInnerHTML={{
__html: `
(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xiw2y8g507");
`,
}}
/>
{/* Meta Pixel */}
<Script
id="meta-pixel-init"
strategy="beforeInteractive"
dangerouslySetInnerHTML={{
__html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1039876665305483');
fbq('track', 'PageView');
`,
}}
/>
<noscript>
<img
height="1"
width="1"
style={{ display: 'none' }}
src="https://www.facebook.com/tr?id=1039876665305483&ev=PageView&noscript=1"
alt=""
/>
</noscript>
<AutoTranslator />
<SiteAnalyticsTracker />
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
<TradingIntegrationProvider>
<LanguageProvider>
<ClientLayout>{children}</ClientLayout>
</LanguageProvider>
</TradingIntegrationProvider>
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
