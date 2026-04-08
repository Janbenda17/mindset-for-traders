"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: November 30, 2025</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Data Controller</h2>
            <p>The data controller is Jan Benda, ID 23112158, with headquarters at U Švehlova altánu 1588/5, Prague 10 – Hostivař.</p>
            <p>Email: support@mindtrader.cz</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. What Data We Process</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Identification:</strong> name, email address
              </li>
              <li>
                <strong>Technical:</strong> IP address, device, cookies
              </li>
              <li>
                <strong>User data:</strong> journal results, scores, AI interaction data, trading statistics
              </li>
              <li>
                <strong>Payment data:</strong> processed by Stripe Inc., 354 Oyster Point Blvd, San Francisco, CA USA
              </li>
              <li>
                <strong>Analytics data:</strong> access logs (Vercel), API logs (OpenAI)
              </li>
              <li>
                <strong>Profile data:</strong> trading style, experience, risk profile, traded markets
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Purpose of Processing</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Providing and improving the MindTrader service</li>
              <li>Analysis of user behavior (anonymized data)</li>
              <li>Payment processing and billing</li>
              <li>Customer communication and user support</li>
              <li>Providing Team Club and mentoring features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Legal Basis</h2>
            <p>Processing is based on:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>contract performance (service provision),</li>
              <li>user consent,</li>
              <li>legitimate interest (security, improvement).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Data Retention</h2>
            <p>
              We retain data for the duration of the account and a maximum of 12 months after its deletion. Payment records are retained according to accounting law for 10 years.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Team Club and Data Sharing Between Users</h2>
            <p>
              The Team Club feature allows users to share selected data with other group members. By registering for Team Club, the user agrees to share the following data:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Username or nickname</li>
              <li>Trading statistics (win rate, average profit/loss, winning/losing streaks)</li>
              <li>Psychological readiness score and mental metrics</li>
              <li>Rankings position and earned badges</li>
              <li>Public posts and comments</li>
            </ul>
            <p className="mt-2">
              Users can leave Team Club at any time and thus stop sharing their data with other members. Historical leaderboard data may remain in anonymized form.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Admin Panel and Administrator Access</h2>
            <p>
              The service operator (owner) and authorized mentors have access through the Admin Panel to extended user data for the purpose of:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Providing personalized mentoring and feedback</li>
              <li>Monitoring user progress and identifying areas for improvement</li>
              <li>Resolving technical issues and user support</li>
              <li>Ensuring security and preventing service abuse</li>
            </ul>
            <p className="mt-2">
              <strong>What data administrators can access:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Complete trading statistics and trade history</li>
              <li>Journal entries and reflections</li>
              <li>Psychological readiness data and mental metrics</li>
              <li>Application activity (logins, feature usage)</li>
              <li>Loss Reset records and progress</li>
              <li>User settings and preferences</li>
            </ul>
            <p className="mt-2">
              All administrators and mentors are bound by confidentiality and must not share user data with third parties or use it for any purpose other than providing the MindTrader service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Data Sharing with Third Parties</h2>
            <p>Data may be processed by the following entities:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stripe, Inc. (payments)</li>
              <li>Vercel Inc. (application hosting)</li>
              <li>Supabase Inc. (database and authentication)</li>
              <li>OpenAI LLC (AI features)</li>
              <li>Google LLC / Apple Inc. (if user enables health data integration)</li>
            </ul>
            <p className="mt-2">All partners comply with GDPR requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. User Rights</h2>
            <p>Users have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>access their data,</li>
              <li>correct or delete,</li>
              <li>restrict processing,</li>
              <li>data portability,</li>
              <li>withdraw consent to data sharing in Team Club,</li>
              <li>file a complaint with the Data Protection Authority.</li>
            </ul>
            <p className="mt-2">Send requests to support@mindtrader.cz.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Cookies</h2>
            <p>
              The application uses cookies for login, analytics, and security. By using the website, the user consents to this.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">11. Data Security</h2>
            <p>
              All data is encrypted in transit (TLS/SSL) and at rest. Admin Panel access is protected by multi-factor authentication and logged for audit purposes.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
