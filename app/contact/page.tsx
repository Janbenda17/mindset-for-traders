"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Building2, User } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Contact (Impressum)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Name</p>
                  <p>Jan Benda</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">ID Number</p>
                  <p>23112158</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p>U Švehlova altánu 1588/5</p>
                  <p>102 00 Prague 10 – Hostivař</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:support@mindtrader.cz" className="text-primary hover:underline">
                    support@mindtrader.cz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Website</p>
                  <a href="https://mindtrader.cz" className="text-primary hover:underline">
                    https://mindtrader.cz
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-muted-foreground">
              For technical support or questions about the application, please contact us at support@mindtrader.cz
            </p>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-3">Legal Notice (Disclaimer)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              MindTrader is a tool for mental and psychological preparation of traders. It does not provide investment, financial, or legal advice. All information is educational in nature and does not constitute investment recommendations. Use of the application is entirely at the user's own risk.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Important warning:</strong> Trading financial instruments is risky and may result in financial losses. Before making any decision, consult an expert. The application operator is not responsible for your trading results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
