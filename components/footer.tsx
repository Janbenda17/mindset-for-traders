"use client"

import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Building2, User, AlertTriangle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Desktop Links */}
          <div className="hidden md:flex flex-wrap gap-6 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Obchodní podmínky
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Ochrana údajů
            </Link>
            <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">
              Právní upozornění
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Kontakt
            </Link>
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="terms">
                <AccordionTrigger className="text-sm">Obchodní podmínky</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Provozovatel:</strong></p>
                    <p>Jan Benda<br />IČO: 23112158<br />U Švehlova altánu 1588/5, 102 00 Praha 10 – Hostivař<br />E-mail: honza.newage@gmail.com</p>
                    <p className="pt-2">MindTrader je online software pro podporu osobního rozvoje a psychologické přípravy obchodníků.</p>
                    <Link href="/terms" className="text-primary hover:underline inline-block pt-2">
                      Zobrazit úplné podmínky →
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy">
                <AccordionTrigger className="text-sm">Ochrana údajů</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Správce údajů:</strong></p>
                    <p>Jan Benda, IČO 23112158<br />U Švehlova altánu 1588/5, Praha 10<br />E-mail: support@mindtrader.cz</p>
                    <p className="pt-2"><strong>Zpracováváme:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Identifikační data (jméno, e-mail)</li>
                      <li>Technické data (IP, cookies)</li>
                      <li>Uživatelská data (deník, skóre, statistiky)</li>
                    </ul>
                    <Link href="/privacy" className="text-primary hover:underline inline-block pt-2">
                      Zobrazit úplné zásady →
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="disclaimer">
                <AccordionTrigger className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Právní upozornění
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>MindTrader je nástroj pro mentální přípravu. Neposkytuje investiční ani právní poradenství.</p>
                    <p>Obchodování je rizikové a může vést ke ztrátám. Provozovatel nenesedpovědnost za obchodní výsledky.</p>
                    <p className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 mt-2 text-yellow-600 dark:text-yellow-400 font-semibold">
                      Před jakýmkoliv rozhodnutím se poraďte s odborníkem.
                    </p>
                    <Link href="/disclaimer" className="text-primary hover:underline inline-block pt-2">
                      Zobrazit úplné upozornění →
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contact">
                <AccordionTrigger className="text-sm">Kontakt</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Jméno</p>
                        <p>Jan Benda</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">IČO</p>
                        <p>23112158</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">E-mail</p>
                        <p>honza.newage@gmail.com</p>
                      </div>
                    </div>
                    <Link href="/contact" className="text-primary hover:underline inline-block pt-2">
                      Zobrazit úplný kontakt →
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            © 2025 MindTrader. Všechna práva vyhrazena.
          </div>
        </div>
      </div>
    </footer>
  )
}
