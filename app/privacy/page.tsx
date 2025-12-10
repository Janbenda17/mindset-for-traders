"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Zásady ochrany osobních údajů (Privacy Policy)</CardTitle>
          <p className="text-sm text-muted-foreground">Poslední aktualizace: 30. listopadu 2025</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Správce osobních údajů</h2>
            <p>Správcem údajů je Jan Benda, IČO 23112158, se sídlem U Švehlova altánu 1588/5, Praha 10 – Hostivař.</p>
            <p>E-mail: support@mindtrader.cz</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Jaké údaje zpracováváme</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Identifikační:</strong> jméno, e-mailová adresa
              </li>
              <li>
                <strong>Technické:</strong> IP adresa, zařízení, cookies
              </li>
              <li>
                <strong>Uživatelská data:</strong> výsledky deníku, skóre, údaje z AI interakcí, trading statistiky
              </li>
              <li>
                <strong>Platební údaje:</strong> zpracovává Stripe Inc., 354 Oyster Point Blvd, San Francisco, CA USA
              </li>
              <li>
                <strong>Analytická data:</strong> přístupové logy (Vercel), API logy (OpenAI)
              </li>
              <li>
                <strong>Profilová data:</strong> trading styl, zkušenosti, rizikový profil, obchodované trhy
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Účel zpracování</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Poskytování a vylepšování služby MindTrader</li>
              <li>Analýza chování uživatelů (anonymizovaná data)</li>
              <li>Zpracování plateb a fakturace</li>
              <li>Komunikace se zákazníky a uživatelská podpora</li>
              <li>Poskytování funkcí Team Club a mentoringu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Právní základ</h2>
            <p>Zpracování probíhá na základě:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>plnění smlouvy (poskytnutí služby),</li>
              <li>souhlasu uživatele,</li>
              <li>oprávněného zájmu (bezpečnost, vylepšování).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Doba uchování</h2>
            <p>
              Údaje uchováváme po dobu trvání účtu a maximálně 12 měsíců po jeho zrušení. Platební záznamy uchováváme
              dle zákona o účetnictví po dobu 10 let.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Team Club a sdílení dat mezi uživateli</h2>
            <p>
              Funkce Team Club umožňuje uživatelům sdílet vybrané údaje s ostatními členy skupiny. Registrací do Team
              Club uživatel souhlasí se sdílením následujících dat:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Uživatelské jméno nebo přezdívka</li>
              <li>Trading statistiky (win rate, průměrný zisk/ztráta, série výher/proher)</li>
              <li>Psychological readiness skóre a mentální metriky</li>
              <li>Pozice v žebříčcích a získané odznaky</li>
              <li>Veřejné příspěvky a komentáře</li>
            </ul>
            <p className="mt-2">
              Uživatel může kdykoli opustit Team Club a tím ukončit sdílení svých dat s ostatními členy. Historická data
              z žebříčků mohou zůstat zachována v anonymizované podobě.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Admin Panel a přístup správců</h2>
            <p>
              Provozovatel služby (majitel) a oprávnění mentoři mají prostřednictvím Admin Panelu přístup k rozšířeným
              údajům uživatelů za účelem:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Poskytování personalizovaného mentoringu a zpětné vazby</li>
              <li>Monitorování pokroku uživatelů a identifikace oblastí ke zlepšení</li>
              <li>Řešení technických problémů a uživatelské podpory</li>
              <li>Zajištění bezpečnosti a prevence zneužití služby</li>
            </ul>
            <p className="mt-2">
              <strong>K jakým údajům mají správci přístup:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Kompletní trading statistiky a historie obchodů</li>
              <li>Journal záznamy a reflexe</li>
              <li>Psychological readiness data a mentální metriky</li>
              <li>Aktivita v aplikaci (přihlášení, využívání funkcí)</li>
              <li>Loss Reset záznamy a průběh</li>
              <li>Nastavení a preference uživatele</li>
            </ul>
            <p className="mt-2">
              Všichni správci a mentoři jsou vázáni mlčenlivostí a nesmějí údaje uživatelů sdílet s třetími stranami ani
              je využívat pro jiné účely než poskytování služby MindTrader.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Sdílení údajů s třetími stranami</h2>
            <p>Data mohou být zpracovávána následujícími subjekty:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stripe, Inc. (platby)</li>
              <li>Vercel Inc. (hosting aplikace)</li>
              <li>Supabase Inc. (databáze a autentizace)</li>
              <li>OpenAI LLC (AI funkce)</li>
              <li>Google LLC / Apple Inc. (pokud uživatel povolí integraci se zdravotními daty)</li>
            </ul>
            <p className="mt-2">Všichni partneři splňují podmínky GDPR compliance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Práva uživatele</h2>
            <p>Uživatel má právo na:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>přístup ke svým údajům,</li>
              <li>opravu nebo výmaz,</li>
              <li>omezení zpracování,</li>
              <li>přenositelnost dat,</li>
              <li>odvolání souhlasu se sdílením dat v Team Club,</li>
              <li>podání stížnosti u Úřadu pro ochranu osobních údajů.</li>
            </ul>
            <p className="mt-2">Žádosti posílej na support@mindtrader.cz.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Cookies</h2>
            <p>
              Aplikace používá cookies pro přihlášení, analytiku a zabezpečení. Používáním webu s tím uživatel souhlasí.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">11. Zabezpečení dat</h2>
            <p>
              Veškerá data jsou šifrována při přenosu (TLS/SSL) i v klidu. Přístup k Admin Panelu je chráněn
              vícefaktorovou autentizací a je logován pro účely auditu.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
