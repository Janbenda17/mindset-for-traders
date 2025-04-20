import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResourcesPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Trading Psychology Resources</h1>
        <p className="text-muted-foreground">Practical exercises to strengthen your trading mindset</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pre-Market Routine</CardTitle>
            <CardDescription>Prepare your mind before trading</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>5 minutes of mindful breathing</li>
              <li>Review your trading plan and rules</li>
              <li>Set clear intentions for the day</li>
              <li>Visualize successful execution of your strategy</li>
              <li>Repeat your daily affirmation</li>
            </ol>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Download Worksheet
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post-Loss Recovery</CardTitle>
            <CardDescription>Regain emotional balance after losses</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Step away from the screen for 10 minutes</li>
              <li>Practice deep breathing to calm your nervous system</li>
              <li>Write down what happened objectively</li>
              <li>Identify if you followed your trading plan</li>
              <li>Reframe the loss as a learning opportunity</li>
            </ol>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Download Worksheet
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trading Review</CardTitle>
            <CardDescription>Reflect on your psychological performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Review your emotional states during the week</li>
              <li>Identify patterns in your decision-making</li>
              <li>Assess adherence to your trading plan</li>
              <li>Note psychological improvements and challenges</li>
              <li>Set specific mindset goals for next week</li>
            </ol>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Download Worksheet
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fear & Greed Exercise</CardTitle>
            <CardDescription>Manage the two primary trading emotions</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Identify your personal fear triggers</li>
              <li>Document situations that activate greed</li>
              <li>Create specific response plans for each trigger</li>
              <li>Practice visualization of calm responses</li>
              <li>Implement a "pause and reflect" protocol</li>
            </ol>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Download Worksheet
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
