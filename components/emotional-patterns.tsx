"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function EmotionalPatterns() {
  const patterns = [
    {
      trigger: "Large unexpected market moves",
      emotion: "Fear/Panic",
      behavior: "Closing positions prematurely",
      alternative:
        "Step away for 5 minutes, review your original analysis, and decide if anything has fundamentally changed",
    },
    {
      trigger: "Missing a good trade setup",
      emotion: "FOMO (Fear of Missing Out)",
      behavior: "Entering similar but lower-quality setups",
      alternative: "Remind yourself that there will always be another opportunity and focus on the next valid setup",
    },
    {
      trigger: "Taking multiple losses in a row",
      emotion: "Frustration/Revenge",
      behavior: "Increasing position size to 'make back' losses",
      alternative: "Take a short break, review your trading rules, and consider reducing position size temporarily",
    },
    {
      trigger: "Having a winning streak",
      emotion: "Overconfidence",
      behavior: "Deviating from trading plan, taking excessive risks",
      alternative: "Acknowledge the success but remind yourself that discipline is what created the winning streak",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2 font-medium text-sm">
        <div>Trigger</div>
        <div>Emotion</div>
        <div>Behavior</div>
        <div>Alternative Response</div>
      </div>

      {patterns.map((pattern, index) => (
        <Card key={index}>
          <CardContent className="p-4 grid grid-cols-4 gap-2 text-sm">
            <div>{pattern.trigger}</div>
            <div>{pattern.emotion}</div>
            <div>{pattern.behavior}</div>
            <div>{pattern.alternative}</div>
          </CardContent>
        </Card>
      ))}

      <div className="border rounded-md p-4">
        <Label className="mb-2 block">Your Personal Pattern</Label>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="border rounded p-2 bg-muted/50">
            <p className="text-muted-foreground">Identify your trigger...</p>
          </div>
          <div className="border rounded p-2 bg-muted/50">
            <p className="text-muted-foreground">What emotion arises?</p>
          </div>
          <div className="border rounded p-2 bg-muted/50">
            <p className="text-muted-foreground">How do you typically react?</p>
          </div>
          <div className="border rounded p-2 bg-muted/50">
            <p className="text-muted-foreground">What would be better?</p>
          </div>
        </div>
      </div>
    </div>
  )
}
