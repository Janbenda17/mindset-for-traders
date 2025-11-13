"use client"

import { Bell, BellOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/contexts/notifications-context"

export function NotificationSettings() {
  const { settings, updateSettings, hasPermission, requestPermission } = useNotifications()

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasPermission ? <Bell className="h-5 w-5 text-blue-400" /> : <BellOff className="h-5 w-5 text-slate-500" />}
          <div>
            <h3 className="font-semibold text-white">Notifications</h3>
            <p className="text-sm text-slate-400">Manage your notification preferences</p>
          </div>
        </div>
        {!hasPermission && (
          <Button onClick={requestPermission} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Enable Notifications
          </Button>
        )}
      </div>

      {hasPermission && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="morning-check" className="text-white">
                Morning Check Reminder
              </Label>
              <p className="text-sm text-slate-400">Daily at 7:00 AM</p>
            </div>
            <Switch
              id="morning-check"
              checked={settings.morningCheck}
              onCheckedChange={() => handleToggle("morningCheck")}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="daily-review" className="text-white">
                Daily Review Reminder
              </Label>
              <p className="text-sm text-slate-400">Daily at 6:00 PM</p>
            </div>
            <Switch
              id="daily-review"
              checked={settings.dailyReview}
              onCheckedChange={() => handleToggle("dailyReview")}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-review" className="text-white">
                Weekly Review Reminder
              </Label>
              <p className="text-sm text-slate-400">Sundays at 8:00 PM</p>
            </div>
            <Switch
              id="weekly-review"
              checked={settings.weeklyReview}
              onCheckedChange={() => handleToggle("weeklyReview")}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="trading-alerts" className="text-white">
                Trading Alerts
              </Label>
              <p className="text-sm text-slate-400">Important trading notifications</p>
            </div>
            <Switch
              id="trading-alerts"
              checked={settings.tradingAlerts}
              onCheckedChange={() => handleToggle("tradingAlerts")}
            />
          </div>
        </div>
      )}
    </div>
  )
}
