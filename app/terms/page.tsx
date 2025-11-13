"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Obchodní podmínky (Terms of Service)</CardTitle>
          <p className="text-sm text-muted-foreground">Poslední aktualizace: 11. listopadu 2025</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Provozovatel</h2>
            <p>Aplikaci MindTrader (dále jen „Služba") provozuje:</p>
            <ul className="list-none mt-2 space-y-1">
              <li>Jméno: Jan Benda</li>
              <li>IČO: 23112158</li>
              <li>Sídlo: U Švehlova altánu 1588/5, 102 00 Praha 10 – Hostivař</li>
              <li>E-mail: honza.newage@gmail.com</li>
            </ul>
            <p className="mt-2">(dále jen „Provozovatel")</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Předmět služby</h2>
            <p>
              MindTrader je online software (SaaS) určený k podpoře osobního rozvoje a psychologické přípravy obchodníků
              (traderů). Nástroj pomáhá uživateli sledovat a analyzovat faktory ovlivňující jeho rozhodování, disciplínu
              a psychický stav při obchodování.
            </p>
            <p className="mt-2">
              Služba neposkytuje investiční, finanční ani právní poradenství. Veškeré informace a doporučení mají
              vzdělávací charakter a slouží výhradně pro seberozvoj.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Uživatelský účet</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Registrací uživatel potvrzuje, že údaje uvedené při registraci jsou pravdivé.</li>
              <li>Přístupové údaje jsou osobní a nesmí být sdíleny s třetí osobou.</li>
              <li>Provozovatel může účet pozastavit nebo zrušit při zneužití služby či porušení podmínek.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Předplatné a platby</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Přístup ke Službě je poskytován na základě měsíčního nebo ročního předplatného prostřednictvím platební
                brány Stripe.
              </li>
              <li>Po úhradě má uživatel aktivní přístup po dobu zaplaceného období.</li>
              <li>Předplatné se automaticky obnovuje, pokud není zrušeno.</li>
              <li>Uživatel může zrušit předplatné kdykoli; přístup zůstává aktivní do konce zaplaceného období.</li>
              <li>V případě částečného využití služby nevzniká nárok na plnou refundaci.</li>
              <li>Ceny jsou uvedeny v CZK a mohou se měnit; uživatelé budou o změně informováni předem.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Odpovědnost</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Provozovatel neodpovídá za rozhodnutí, která uživatel činí na základě dat, doporučení nebo výstupů
                aplikace.
              </li>
              <li>Služba není investičním nástrojem a nezaručuje žádné obchodní výsledky.</li>
              <li>Uživatel bere na vědomí, že používá aplikaci výhradně na vlastní riziko.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Duševní vlastnictví</h2>
            <p>
              Veškerý obsah, texty, algoritmy, databáze, kód, design a grafické prvky Služby jsou chráněny autorským
              právem.
            </p>
            <p className="mt-2">
              Je zakázáno kopírovat, upravovat nebo distribuovat jakoukoli část aplikace bez písemného souhlasu
              Provozovatele.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Ochrana osobních údajů</h2>
            <p>
              Zpracování osobních údajů se řídí dokumentem Zásady ochrany osobních údajů (Privacy Policy), dostupným na
              adrese{" "}
              <a href="/privacy" className="text-primary hover:underline">
                https://mindtrader.cz/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Změny a ukončení služby</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Provozovatel si vyhrazuje právo měnit nebo ukončit poskytování služby s předchozím upozorněním.</li>
              <li>Aktualizace nebo změny podmínek budou oznámeny e-mailem nebo formou oznámení v aplikaci.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Kontaktní údaje</h2>
            <ul className="list-none space-y-1">
              <li>Jan Benda</li>
              <li>IČO: 23112158</li>
              <li>Sídlo: U Švehlova altánu 1588/5, 102 00 Praha 10 – Hostivař</li>
              <li>E-mail: honza.newage@gmail.com</li>
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
