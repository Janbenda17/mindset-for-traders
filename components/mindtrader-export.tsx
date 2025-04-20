"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Download, FileText, Mail, Share2 } from "lucide-react"

export function MindTraderExport() {
  const [date, setDate] = useState<Date>()
  const [dateRange, setDateRange] = useState<Date[] | undefined>([subDays(new Date(), 7), new Date()])
  const [exportType, setExportType] = useState("pdf")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeReflections, setIncludeReflections] = useState(true)
  const [includeAdvice, setIncludeAdvice] = useState(true)

  const handleExport = () => {
    // In a real app, this would generate and download the export
    alert("Export byl úspěšně vygenerován!")
  }

  const handleShare = () => {
    // In a real app, this would share the export
    alert("Export byl úspěšně sdílen!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Export a sdílení</h2>
          <p className="text-muted-foreground">Exportujte své údaje nebo je sdílejte se svým koučem</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export dat</CardTitle>
            <CardDescription>Exportujte své údaje v různých formátech</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base">Časové období</Label>
              <div className="flex items-center gap-4 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.length === 2 ? (
                        <>
                          {format(dateRange[0], "d. M. yyyy")} - {format(dateRange[1], "d. M. yyyy")}
                        </>
                      ) : (
                        <span>Vyberte časové období</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label className="text-base">Formát exportu</Label>
              <Select value={exportType} onValueChange={setExportType} className="mt-2">
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte formát" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Obsah exportu</Label>

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="include-charts">Zahrnout grafy a vizualizace</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-reflections"
                  checked={includeReflections}
                  onCheckedChange={(checked) => setIncludeReflections(checked as boolean)}
                />
                <Label htmlFor="include-reflections">Zahrnout denní reflexe</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-advice"
                  checked={includeAdvice}
                  onCheckedChange={(checked) => setIncludeAdvice(checked as boolean)}
                />
                <Label htmlFor="include-advice">Zahrnout obchodní doporučení</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportovat
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sdílení s koučem</CardTitle>
            <CardDescription>Sdílejte své údaje se svým obchodním koučem nebo mentorem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base">Vyberte kouče</Label>
              <Select defaultValue="coach1" className="mt-2">
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte kouče" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coach1">Jan Novák (hlavní kouč)</SelectItem>
                  <SelectItem value="coach2">Petr Svoboda (mentor)</SelectItem>
                  <SelectItem value="new">Přidat nového kouče</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base">Časové období</Label>
              <div className="flex items-center gap-4 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.length === 2 ? (
                        <>
                          {format(dateRange[0], "d. M. yyyy")} - {format(dateRange[1], "d. M. yyyy")}
                        </>
                      ) : (
                        <span>Vyberte časové období</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Způsob sdílení</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <Button variant="outline" className="justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Poslat emailem
                </Button>

                <Button variant="outline" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Generovat odkaz
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Obsah sdílení</Label>

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox id="share-charts" defaultChecked />
                <Label htmlFor="share-charts">Zahrnout grafy a vizualizace</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="share-reflections" defaultChecked />
                <Label htmlFor="share-reflections">Zahrnout denní reflexe</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="share-advice" defaultChecked />
                <Label htmlFor="share-advice">Zahrnout obchodní doporučení</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleShare} className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Sdílet s koučem
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
