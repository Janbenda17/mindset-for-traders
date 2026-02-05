"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t mt-auto relative z-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center gap-4">
          <div className="flex flex-wrap gap-6 text-sm">
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
        </div>
      </div>
    </footer>
  )
}
