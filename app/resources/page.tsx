"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Video, Headphones, FileText, Star, Clock, Users } from "lucide-react"
import { TopNavigation } from "@/components/top-navigation"

const resources = [
  {
    title: "Kniha: Obchodování v zóně",
    description: "Klasika pro rozvoj psychologie obchodování od Marka Douglase.",
    link: "#",
    type: "book",
    icon: BookOpen,
    rating: 4.8,
    duration: "8 hodin čtení",
    difficulty: "Pokročilý",
  },
  {
    title: "Video: Meditace pro obchodníky",
    description: "Vedená meditace pro zlepšení soustředění a snížení stresu během obchodování.",
    link: "#",
    type: "video",
    icon: Video,
    rating: 4.6,
    duration: "15 minut",
    difficulty: "Začátečník",
  },
  {
    title: "Podcast: Psychologie trhů",
    description: "Rozhovory s předními obchodními psychology a úspěšnými tradery.",
    link: "#",
    type: "podcast",
    icon: Headphones,
    rating: 4.9,
    duration: "45 minut",
    difficulty: "Střední",
  },
  {
    title: "Článek: 10 tipů pro zvládání emocí",
    description: "Praktické strategie pro udržení klidu a disciplíny na finančních trzích.",
    link: "#",
    type: "article",
    icon: FileText,
    rating: 4.7,
    duration: "5 minut čtení",
    difficulty: "Začátečník",
  },
  {
    title: "Webinář: Risk Management",
    description: "Pokročilé techniky řízení rizika a psychologické aspekty money managementu.",
    link: "#",
    type: "webinar",
    icon: Video,
    rating: 4.8,
    duration: "90 minut",
    difficulty: "Pokročilý",
  },
  {
    title: "E-book: Trading Mindset",
    description: "Kompletní průvodce mentálním nastavením úspěšného tradera.",
    link: "#",
    type: "ebook",
    icon: BookOpen,
    rating: 4.5,
    duration: "3 hodiny čtení",
    difficulty: "Střední",
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case "book":
    case "ebook":
      return "bg-blue-500/20 text-blue-300"
    case "video":
    case "webinar":
      return "bg-red-500/20 text-red-300"
    case "podcast":
      return "bg-green-500/20 text-green-300"
    case "article":
      return "bg-purple-500/20 text-purple-300"
    default:
      return "bg-gray-500/20 text-gray-300"
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Začátečník":
      return "bg-green-500/20 text-green-300"
    case "Střední":
      return "bg-yellow-500/20 text-yellow-300"
    case "Pokročilý":
      return "bg-red-500/20 text-red-300"
    default:
      return "bg-gray-500/20 text-gray-300"
  }
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <TopNavigation />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
              📚 Vzdělávací zdroje
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
              Doporučené zdroje pro další rozvoj vašeho obchodního myšlení a psychologie tradingu
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{resources.length}</div>
                <div className="text-sm text-gray-400">Zdrojů</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.7</div>
                <div className="text-sm text-gray-400">Průměrné hodnocení</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-gray-400">Uživatelů</div>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <Card key={index} className="psyche-card group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl">
                      <resource.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300">{resource.rating}</span>
                    </div>
                  </div>

                  <CardTitle className="text-white text-lg leading-tight">{resource.title}</CardTitle>

                  <CardDescription className="text-gray-400 text-sm leading-relaxed">
                    {resource.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}
                    >
                      {resource.difficulty}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center space-x-2 mb-4 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{resource.duration}</span>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    asChild
                    className="w-full neon-button bg-transparent group-hover:bg-purple-500/10 transition-all duration-300"
                  >
                    <a href={resource.link} target="_blank" rel="noopener noreferrer">
                      <span className="flex items-center justify-center">
                        Zobrazit zdroj
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </span>
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16">
            <Card className="psyche-card">
              <CardContent className="p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-4">Chcete přidat vlastní zdroj?</h3>
                  <p className="text-gray-300 mb-6">
                    Máte doporučení na kvalitní vzdělávací materiál? Podělte se s komunitou!
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Users className="w-4 h-4 mr-2" />
                    Navrhnout zdroj
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
