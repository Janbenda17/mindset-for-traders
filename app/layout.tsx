import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import Link from "next/link"
import { LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SubscriptionProvider>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Trader's Mindset</span>
                  </div>
                  <nav className="hidden md:flex gap-6">
                    <Link
                      href="/"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/journal"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Journal
                    </Link>
                    <Link
                      href="/affirmations"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Affirmations
                    </Link>
                    <Link
                      href="/analytics"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Analytics
                    </Link>
                    <Link
                      href="/mindtrader"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      MindTrader
                    </Link>
                    <Link
                      href="/mindtrader-pro"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      MindTrader PRO
                    </Link>
                    <Link
                      href="/resources"
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Resources
                    </Link>
                  </nav>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                  <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Trader's Mindset. All rights reserved.
                  </p>
                  <div className="flex gap-4">
                    <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
                      Terms
                    </Link>
                    <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
                      Privacy
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
