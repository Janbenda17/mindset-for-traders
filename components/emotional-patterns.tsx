import { Tooltip } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

const data = [
  { emotion: "Strach", A: 80, fullMark: 100 },
  { emotion: "Chamtivost", A: 60, fullMark: 100 },
  { emotion: "Přehnaná sebedůvěra", A: 75, fullMark: 100 },
  { emotion: "Frustrace", A: 45, fullMark: 100 },
  { emotion: "Trpělivost", A: 90, fullMark: 100 },
  { emotion: "Disciplína", A: 85, fullMark: 100 },
]

export function EmotionalPatterns() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emocionální vzorce</CardTitle>
        <CardDescription>Identifikujte dominantní emoce ovlivňující vaše obchodování.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="emotion" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Úroveň" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
