"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: November 11, 2025</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Service Operator</h2>
            <p>The MindTrader application (hereinafter "Service") is operated by:</p>
            <ul className="list-none mt-2 space-y-1">
              <li>Name: Jan Benda</li>
              <li>ID: 23112158</li>
              <li>Address: U Švehlova altánu 1588/5, 102 00 Prague 10 – Hostivař</li>
              <li>Email: honza.newage@gmail.com</li>
            </ul>
            <p className="mt-2">(hereinafter "Operator")</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Service Description</h2>
            <p>
              MindTrader is an online software (SaaS) designed to support personal development and psychological preparation of traders. The tool helps the user track and analyze factors affecting their decision-making, discipline, and mental state while trading.
            </p>
            <p className="mt-2">
              The Service does not provide investment, financial, or legal advice. All information and recommendations are educational in nature and are intended solely for personal development.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. User Account</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>By registering, the user confirms that the information provided during registration is true.</li>
              <li>Access credentials are personal and must not be shared with third parties.</li>
              <li>The Operator may suspend or terminate the account for service abuse or violation of terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Subscription and Payments</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Access to the Service is provided through monthly or annual subscription via the Stripe payment gateway.
              </li>
              <li>After payment, the user has active access for the duration of the paid period.</li>
              <li>Subscription automatically renews unless cancelled.</li>
              <li>The user may cancel the subscription at any time; access remains active until the end of the paid period.</li>
              <li>In case of partial use of the Service, there is no right to a full refund.</li>
              <li>Prices are shown in CZK and may change; users will be notified of changes in advance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Responsibility</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                The Operator is not responsible for decisions made by the user based on data, recommendations, or outputs from the application.
              </li>
              <li>The Service is not an investment tool and does not guarantee any trading results.</li>
              <li>The user acknowledges that they use the application entirely at their own risk.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Intellectual Property</h2>
            <p>
              All content, texts, algorithms, databases, code, design, and graphical elements of the Service are protected by copyright.
            </p>
            <p className="mt-2">
              It is forbidden to copy, modify, or distribute any part of the application without the written consent of the Operator.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Data Protection</h2>
            <p>
              Personal data processing is governed by the Privacy Policy document, available at{" "}
              <a href="/privacy" className="text-primary hover:underline">
                https://mindtrader.cz/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Changes and Service Termination</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>The Operator reserves the right to change or terminate the provision of the Service with prior notice.</li>
              <li>Updates or changes to terms will be announced via email or notification in the application.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contact Information</h2>
            <ul className="list-none space-y-1">
              <li>Jan Benda</li>
              <li>ID: 23112158</li>
              <li>Address: U Švehlova altánu 1588/5, 102 00 Prague 10 – Hostivař</li>
              <li>Email: honza.newage@gmail.com</li>
              <li>
                Web:{" "}
                <a href="https://mindtrader.cz" className="text-primary hover:underline">
                  https://mindtrader.cz
                </a>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
