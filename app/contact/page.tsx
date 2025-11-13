"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Building2, User } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Kontakt (Impressum)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Jméno</p>
                  <p>Jan Benda</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">IČO</p>
                  <p>23112158</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Sídlo</p>
                  <p>U Švehlova altánu 1588/5</p>
                  <p>102 00 Praha 10 – Hostivař</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">E-mail</p>
                  <a href="mailto:support@mindtrader.cz" className="text-primary hover:underline">
                    support@mindtrader.cz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Web</p>
                  <a href="https://mindtrader.cz" className="text-primary hover:underline">
                    https://mindtrader.cz
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-2">Podpora</h3>
            <p className="text-muted-foreground">
              Pro technickou podporu nebo dotazy k aplikaci nás kontaktujte na e-mailu support@mindtrader.cz
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
