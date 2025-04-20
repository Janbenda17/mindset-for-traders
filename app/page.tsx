import Link from "next/link"
import { ArrowRight, BarChart2, BookOpen, Calendar, PieChart, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MoodTracker } from "@/components/mood-tracker"
import { DailyAffirmation } from "@/components/daily-affirmation"
import { RecentJournals } from "@/components/recent-journals"
import { PerformanceChart } from "@/components/performance-chart"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="container py-8 md:py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Welcome back, Trader</CardTitle>
                <CardDescription>Track your mindset and improve your trading performance</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodTracker />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Daily Affirmation</CardTitle>
                <CardDescription>Strengthen your trading mindset</CardDescription>
              </CardHeader>
              <CardContent>
                <DailyAffirmation />
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/affirmations">
                    View all affirmations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Trading Performance</CardTitle>
                  <CardDescription>Correlation with mindset</CardDescription>
                </div>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <PerformanceChart />
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/analytics">
                    View detailed analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Recent Journal Entries</CardTitle>
                  <CardDescription>Your trading reflections</CardDescription>
                </div>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <RecentJournals />
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/journal">
                    View all journal entries
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        <section className="container py-8 md:py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>New Feature: MindTrader PRO</CardTitle>
                <CardDescription>Professional mental training system with expert guidance</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                  <Brain className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-medium">Structured Mental Training</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete daily mental preparation with expert guidance
                  </p>
                  <Button variant="outline" size="sm" className="mt-auto" asChild>
                    <Link href="/mindtrader-pro">Try Now</Link>
                  </Button>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                  <PieChart className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-medium">Mental Stability Score</h3>
                  <p className="text-sm text-muted-foreground">Track your mental readiness for optimal trading</p>
                  <Button variant="outline" size="sm" className="mt-auto" asChild>
                    <Link href="/mindtrader-pro">Explore</Link>
                  </Button>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                  <Calendar className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-medium">End of Day Reflection</h3>
                  <p className="text-sm text-muted-foreground">Compare expectations with reality to improve</p>
                  <Button variant="outline" size="sm" className="mt-auto" asChild>
                    <Link href="/mindtrader-pro">Explore</Link>
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/mindtrader-pro">
                    Start Professional Mental Training
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
