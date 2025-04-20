"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Mail, Smartphone } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MindTraderNotifications() {
  const [morningReminder, setMorningReminder] = useState(true)
  const [eveningReminder, setEveningReminder] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [morningTime, setMorningTime] = useState("08:00")
  const [eveningTime, setEveningTime] = useState("17:00")

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to a database
    alert("Nastavení notifikací bylo úspěšně uloženo!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notifikace a připomenutí</h2>
          <p className="text-muted-foreground">Nastavte si připomenutí pro pravidelné používání MindTrader PRO</p>
        </div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Nastavení</TabsTrigger>
          <TabsTrigger value="history">Historie notifikací</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Denní připomenutí</CardTitle>
              <CardDescription>Nastavte si připomenutí pro vyplnění MindTrader PRO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="morning-reminder" className="font-medium">
                      Ranní připomenutí
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Připomene vám vyplnit ranní část MindTrader PRO</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="w-24"
                  />
                  <Switch id="morning-reminder" checked={morningReminder} onCheckedChange={setMorningReminder} />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="evening-reminder" className="font-medium">
                      Večerní připomenutí
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">Připomene vám vyplnit večerní reflexi</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="time"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                    className="w-24"
                  />
                  <Switch id="evening-reminder" checked={eveningReminder} onCheckedChange={setEveningReminder} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kanály notifikací</CardTitle>
              <CardDescription>Vyberte, jak chcete dostávat notifikace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email
                  </Label>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="push-notifications" className="font-medium">
                    Push notifikace
                  </Label>
                </div>
                <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sms-notifications" className="font-medium">
                    SMS
                  </Label>
                </div>
                <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Další notifikace</CardTitle>
              <CardDescription>Nastavte si další typy notifikací</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="weekly-summary" className="font-medium">
                    Týdenní souhrn
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Dostávejte týdenní souhrn vašich obchodních a mentálních výsledků
                  </p>
                </div>
                <Select defaultValue="monday">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Vyberte den" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Pondělí</SelectItem>
                    <SelectItem value="friday">Pátek</SelectItem>
                    <SelectItem value="sunday">Neděle</SelectItem>
                    <SelectItem value="none">Vypnuto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="pattern-alerts" className="font-medium">
                    Upozornění na vzorce
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Dostávejte upozornění, když systém detekuje důležité vzorce ve vašich datech
                  </p>
                </div>
                <Switch id="pattern-alerts" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="w-full">
                Uložit nastavení
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historie notifikací</CardTitle>
              <CardDescription>Přehled nedávno odeslaných notifikací</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum a čas</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Kanál</TableHead>
                    <TableHead>Stav</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>19.4.2023, 08:00</TableCell>
                    <TableCell>Ranní připomenutí</TableCell>
                    <TableCell>Push</TableCell>
                    <TableCell>Doručeno</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>18.4.2023, 17:00</TableCell>
                    <TableCell>Večerní reflexe</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Doručeno</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>18.4.2023, 08:00</TableCell>
                    <TableCell>Ranní připomenutí</TableCell>
                    <TableCell>Push</TableCell>
                    <TableCell>Doručeno</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>17.4.2023, 17:00</TableCell>
                    <TableCell>Večerní reflexe</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Doručeno</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>17.4.2023, 14:32</TableCell>
                    <TableCell>Detekce vzorce</TableCell>
                    <TableCell>Push</TableCell>
                    <TableCell>Doručeno</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
