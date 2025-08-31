import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

const resources = [
  {
    title: "Kniha: Obchodování v zóně",
    description: "Klasika pro rozvoj psychologie obchodování.",
    link: "#",
  },
  {
    title: "Článek: 10 tipů pro zvládání emocí",
    description: "Praktické strategie pro udržení klidu na trzích.",
    link: "#",
  },
  {
    title: "Video: Meditace pro obchodníky",
    description: "Vedená meditace pro zlepšení soustředění a snížení stresu.",
    link: "#",
  },
  {
    title: "Podcast: Psychologie trhů",
    description: "Rozhovory s předními obchodními psychology.",
    link: "#",
  },
]

export default function ResourcesPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Zdroje</h1>
      <p className="text-muted-foreground">Doporučené zdroje pro další rozvoj vašeho obchodního myšlení.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href={resource.link} target="_blank" rel="noopener noreferrer">
                  Zobrazit zdroj
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
