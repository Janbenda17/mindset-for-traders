"use client"

import * as React from "react"
import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PricingPage() {
  const [billingCycle, setBillingCycle] = React.useState("monthly")

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vyberte si plán, který vám vyhovuje</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Začněte zdarma a upgradujte, až budete připraveni posunout své obchodování na další úroveň.
        </p>
      </div>

      <Tabs defaultValue="monthly" className="w-full max-w-3xl mx-auto mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>
            Měsíčně
          </TabsTrigger>
          <TabsTrigger value="yearly" onClick={() => setBillingCycle("yearly")}>
            Ročně <Badge className="ml-2 bg-green-500/20 text-green-700">Ušetříte 20%</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {/* FREE Plan */}
        <Card className="flex flex-col border-2">
          <CardHeader>
            <CardTitle>FREE</CardTitle>
            <CardDescription>Základní deník pro začínající tradery</CardDescription>
            <div className="mt-4 text-3xl font-bold">0 Kč</div>
            <p className="text-sm text-muted-foreground">Navždy zdarma</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Základní deník (nálada, spánek, jídlo)</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Výpočet mentálního skóre</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Denní záznamy</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Začít zdarma</Button>
          </CardFooter>
          <div className="bg-muted/50 p-3 text-center text-sm">
            <Badge variant="outline" className="mb-1">
              Cílovka
            </Badge>
            <p>Začínající tradeři</p>
          </div>
        </Card>

        {/* BASIC Plan */}
        <Card className="flex flex-col border-2">
          <CardHeader>
            <CardTitle>BASIC</CardTitle>
            <CardDescription>Pro tradery, kteří chtějí sledovat svůj pokrok</CardDescription>
            <div className="mt-4 text-3xl font-bold">
              {billingCycle === "monthly" ? "9 €" : "86 €"}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {billingCycle === "monthly" ? "měsíc" : "rok"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">~{billingCycle === "monthly" ? "220 Kč" : "2 100 Kč"}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Vše z FREE plánu</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Historie záznamů</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Týdenní přehled</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Export do PDF</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Motivace + citáty</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Vybrat BASIC</Button>
          </CardFooter>
          <div className="bg-muted/50 p-3 text-center text-sm">
            <Badge variant="outline" className="mb-1">
              Cílovka
            </Badge>
            <p>Začínající tradeři</p>
          </div>
        </Card>

        {/* PRO Plan */}
        <Card className="flex flex-col border-2 border-primary relative">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <Badge className="bg-primary text-primary-foreground">Nejoblíbenější</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center">
              PRO
              <Star className="h-4 w-4 ml-2 fill-primary text-primary" />
            </CardTitle>
            <CardDescription>Pro pokročilé tradery, kteří chtějí analyzovat své chování</CardDescription>
            <div className="mt-4 text-3xl font-bold">
              {billingCycle === "monthly" ? "19 €" : "182 €"}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {billingCycle === "monthly" ? "měsíc" : "rok"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">~{billingCycle === "monthly" ? "460 Kč" : "4 400 Kč"}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Vše z BASIC plánu</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Analýza vzorců chování</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Notifikace / připomínky</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Reflexe obchodního chování</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Vlastní váhy a přehledy</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="default">
              Vybrat PRO
            </Button>
          </CardFooter>
          <div className="bg-primary/10 p-3 text-center text-sm">
            <Badge variant="outline" className="mb-1">
              Cílovka
            </Badge>
            <p>Pokročilí tradeři</p>
          </div>
        </Card>

        {/* PRO+ Plan */}
        <Card className="flex flex-col border-2">
          <CardHeader>
            <CardTitle>PRO+</CardTitle>
            <CardDescription>Pro profesionální tradery a mentory</CardDescription>
            <div className="mt-4 text-3xl font-bold">
              {billingCycle === "monthly" ? "29 €" : "278 €"}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {billingCycle === "monthly" ? "měsíc" : "rok"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">~{billingCycle === "monthly" ? "700 Kč" : "6 700 Kč"}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Vše z PRO plánu</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Napojení na MetaTrader</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Mentální AI kouč</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Sdílení s mentorem / koučem</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Personalizované strategie pro zvládání stresu</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Vybrat PRO+
            </Button>
          </CardFooter>
          <div className="bg-muted/50 p-3 text-center text-sm">
            <Badge variant="outline" className="mb-1">
              Cílovka
            </Badge>
            <p>Profi obchodníci / mentoři</p>
          </div>
        </Card>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Často kladené otázky</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Mohu změnit plán později?</h3>
            <p className="text-muted-foreground">
              Ano, svůj plán můžete kdykoli upgradovat nebo downgradovat. Změny se projeví při dalším fakturačním
              období.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Jak funguje napojení na MetaTrader?</h3>
            <p className="text-muted-foreground">
              V PRO+ plánu získáte přístup k našemu MT4/MT5 pluginu, který automaticky zaznamenává vaše obchody a
              propojuje je s vaším mentálním deníkem.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Co když nejsem spokojen se službou?</h3>
            <p className="text-muted-foreground">
              Nabízíme 14denní záruku vrácení peněz. Pokud nejste spokojeni, jednoduše nás kontaktujte a vrátíme vám
              plnou částku.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Jak funguje roční předplatné?</h3>
            <p className="text-muted-foreground">
              Při ročním předplatném ušetříte 20% oproti měsíční platbě. Platba se provádí jednorázově na celý rok
              dopředu.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Stále si nejste jisti?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Začněte s bezplatným plánem a vyzkoušejte základní funkce. Můžete upgradovat kdykoli, až budete připraveni.
        </p>
        <Button size="lg">Začít zdarma</Button>
      </div>
    </div>
  )
}
