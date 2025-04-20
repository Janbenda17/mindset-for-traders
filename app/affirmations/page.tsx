import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AffirmationsList } from "@/components/affirmations-list"
import { CustomAffirmationForm } from "@/components/custom-affirmation-form"

export default function AffirmationsPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Trading Affirmations</h1>
        <p className="text-muted-foreground">Strengthen your trading mindset with positive affirmations</p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="daily">Daily Affirmation</TabsTrigger>
          <TabsTrigger value="all">All Affirmations</TabsTrigger>
          <TabsTrigger value="custom">Custom Affirmations</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Today's Affirmation</CardTitle>
              <CardDescription>Focus on this affirmation throughout your trading day</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center p-6">
              <blockquote className="text-2xl font-serif italic mb-4">
                "I am disciplined in my trading approach and patient with my strategy."
              </blockquote>
              <p className="text-muted-foreground">
                Repeat this affirmation before market open, during trading sessions, and after the market closes.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button>Generate New Affirmation</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Trading Affirmation Library</CardTitle>
              <CardDescription>Browse and save affirmations that resonate with you</CardDescription>
            </CardHeader>
            <CardContent>
              <AffirmationsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Affirmations</CardTitle>
              <CardDescription>Write personalized affirmations for your specific trading challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomAffirmationForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
