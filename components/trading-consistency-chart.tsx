import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { week: "1", trades: 10, wins: 7, losses: 3 },
  { week: "2", trades: 12, wins: 8, losses: 4 },
  { week: "3", trades: 8, wins: 6, losses: 2 },
  { week: "4", trades: 15, wins: 10, losses: 5 },
  { week: "5", trades: 11, wins: 9, losses: 2 },
  { week: "6", trades: 13, wins: 7, losses: 6 },
]

export function TradingConsistencyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konzistence obchodování</CardTitle>
        <CardDescription>Sledujte počet obchodů a poměr výher/proher v průběhu času.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="trades" stroke="#8884d8" name="Celkem obchodů" />
            <Line type="monotone" dataKey="wins" stroke="#82ca9d" name="Výhry" />
            <Line type="monotone" dataKey="losses" stroke="#ffc658" name="Prohry" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
