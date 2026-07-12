"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Crown, Check, Zap, BarChart3, Brain, FileText, Download, Headphones, ArrowLeft, Gift, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function UpgradePage() {
  const { upgradeToPremium, isLoading, isPremium, isTrialing, trialDaysLeft, checkSubscriptionStatus } = useSubscription()
  const { user } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const maxPolls = 15 // Max 30 seconds (15 checks x 2 seconds)

  // Redirect to login only if user is explicitly null (not authenticated)
  useEffect(() => {
    if (user === null) {
      router.push("/login")
    }
  }, [user, router])

  // If checkout window was opened, periodically check subscription status with MAX LIMIT
  useEffect(() => {
    if (!checkoutOpen || isPremium || pollCount >= maxPolls) {
      if (pollCount >= maxPolls && checkoutOpen) {
        console.log("[v0] [UPGRADE] Max polls reached, stopping checks")
        setCheckoutOpen(false)
      }
      return
    }

    console.log(`[v0] [UPGRADE] Poll #${pollCount + 1}/${maxPolls}`)
    const timer = setTimeout(async () => {
      setIsChecking(true)
      try {
        await checkSubscriptionStatus()
        console.log("[v0] [UPGRADE] Subscription checked")
      } catch (error) {
        console.error("[v0] [UPGRADE] Error checking subscription:", error)
      } finally {
        setIsChecking(false)
        setPollCount(prev => prev + 1)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [checkoutOpen, isPremium, pollCount, maxPolls, checkSubscriptionStatus])

  // If premium is detected, redirect immediately
  useEffect(() => {
    if (isPremium && checkoutOpen) {
      console.log("[v0] [UPGRADE] Premium detected! Redirecting...")
      setCheckoutOpen(false)
      router.push("/")
    }
  }, [isPremium, checkoutOpen, router])

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = "/login"
      return
    }

    setIsUpgrading(true)
    setCheckoutOpen(true)
    await upgradeToPremium()
    setIsUpgrading(false)
  }

  const handleManualCheck = async () => {
    if (!user?.email) {
      console.log("[v0] [UPGRADE] No user email available")
      return
    }

    setIsChecking(true)
    try {
      console.log("[v0] [UPGRADE] Manually checking payment status...")
      
      // Call unified verify-payment endpoint
      const response = await fetch("/api/subscription/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      })

      const data = await response.json()
      console.log("[v0] [UPGRADE] Verification result:", data)

      // Refresh subscription context to get latest status
      await checkSubscriptionStatus()

      if (data.success && data.isPremium) {
        console.log("[v0] [UPGRADE] ✓ Premium status confirmed!")
        // Page will automatically re-render and show premium UI
      } else {
        console.log("[v0] [UPGRADE] No active subscription found")
      }
    } catch (error) {
      console.error("[v0] [UPGRADE] Error during manual check:", error)
    } finally {
      setIsChecking(false)
    }
  }

  if (isPremium && !isTrialing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Už máte Premium!</h1>
            <p className="text-gray-600">Užívejte si všechny premium funkce.</p>
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-4">
              <ArrowLeft className="h-4 w-4" />
              Zpět na dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Checkout status message */}
        {checkoutOpen && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <RefreshCw className={`h-5 w-5 text-blue-600 ${isChecking ? "animate-spin" : ""}`} />
              <div>
                <p className="font-semibold text-blue-900">{language === 'en' ? "Waiting for payment confirmation..." : "Čeking na potvrzení platby..."}</p>
                <p className="text-sm text-blue-700">{language === 'en' ? "Payment window opened. After payment, your account will update automatically." : "Platební okno se otevřelo. Po zaplacení se vaše účet automaticky aktualizuje."}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="mt-2"
                >
                  {isChecking ? (language === 'en' ? "Verifying..." : "Ověřuji...") : (language === 'en' ? "Verify Payment Manually" : "Ověřit platbu ručně")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Trial status banner - shown while the 14-day free trial is active */}
        {user && isTrialing && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-center">
            <Crown className="h-12 w-12 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'en'
                ? `You're on a free Premium trial — ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`
                : `Máš aktivní zkušební Premium — zbývá ${trialDaysLeft} ${trialDaysLeft === 1 ? 'den' : trialDaysLeft < 5 ? 'dny' : 'dní'}`}
            </h2>
            <p className="text-lg opacity-90">
              {language === 'en'
                ? 'Full access to the AI coach, MT4/5 sync and advanced insights - no card required.'
                : 'Plný přístup k AI koučovi, MT4/5 synchronizaci a pokročilým insightům - bez platební karty.'}
            </p>
          </div>
        )}

        {/* Welcome message for new users */}
        {user && !isTrialing && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-center">
            <Gift className="h-12 w-12 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">{language === 'en' ? `Welcome, ${user.name}! 🎉` : `Vítejte, ${user.name}! 🎉`}</h2>
            <p className="text-lg">{language === 'en' ? 'Your account is ready. Upgrade now to unlock Premium!' : 'Váš účet je připraven. Upgradujte nyní a odemkněte Premium!'}</p>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'en' ? "Upgrade to Premium" : "Upgradujte na Premium"}
          </h1>
          <p className="text-xl text-gray-600 mb-8">{language === 'en' ? 'Unlock advanced features for professional trading' : 'Odemkněte pokročilé funkce pro profesionální trading'}</p>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-6 w-6" />
                <span className="text-2xl font-bold">{language === 'en' ? '14-day free trial' : '14denní zkušební verze zdarma'}</span>
              </div>
              <p className="text-lg">{language === 'en' ? 'then 749 Kč/month, no card required to start' : 'poté 749 Kč/měsíc, bez platební karty na start'}</p>
              <p className="text-sm opacity-90 mt-1">{language === 'en' ? '7-day money-back guarantee' : '7denní záruka vrácení peněz'}</p>
            </div>
        </div>

        {/* Check subscription button */}
        <div className="text-center mb-12">
          <Button
            onClick={handleManualCheck}
            disabled={isChecking}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? (language === 'en' ? "Checking..." : "Kontroluji...") : (language === 'en' ? "Check subscription" : "Zkontrolovat předplatné")}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Free
              </CardTitle>
              <div className="text-3xl font-bold">0 Kč</div>
              <p className="text-gray-600">{language === 'en' ? 'Forever free' : 'Navždy zdarma'}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {language === 'en' ? 'Live Mode - log your real trades' : 'Live Mode - zapisuj své reálné obchody'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {language === 'en' ? 'Trading calendar & basic discipline score' : 'Obchodní kalendář a základní discipline score'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {language === 'en' ? 'Journal entries & notes' : 'Journal záznamy a poznámky'}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-yellow-500 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1">
                {language === 'en' ? 'Most Popular' : 'Nejpopulárnější'}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Premium
              </CardTitle>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-blue-600">
                  {language === 'en' ? '$32' : '749 Kč'}
                </span>
                <span className="text-gray-500 text-lg">{language === 'en' ? '/month' : '/měsíc'}</span>
                <Badge className="ml-auto bg-green-100 text-green-700">
                  {language === 'en' ? '14-day free trial' : '14 dní zdarma'}
                </Badge>
              </div>
              <p className="text-sm text-green-600 font-semibold mt-3">{language === 'en' ? 'No credit card required to start your trial' : 'Bez platební karty na start zkušební verze'}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{language === 'en' ? 'Unlimited trading journal' : 'Neomezený obchodní deník'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  {language === 'en' ? 'Advanced analytics and reports' : 'Pokročilé analýzy a reporty'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <Brain className="h-4 w-4 text-purple-600" />
                  MindTrader AI Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <Download className="h-4 w-4 text-green-600" />
                  {language === 'en' ? 'Export data and reports' : 'Export dat a reportů'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <Headphones className="h-4 w-4 text-orange-600" />
                  {language === 'en' ? 'Priority customer support' : 'Prioritní zákaznická podpora'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {language === 'en' ? 'Advanced psychological metrics' : 'Pokročilé psychologické metriky'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {language === 'en' ? 'Risk management tools' : 'Risk management nástroje'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {language === 'en' ? 'Trading pattern detection' : 'Trading pattern detection'}
                </li>
              </ul>

              {user ? (
                isTrialing ? (
                  <div className="text-center text-sm text-gray-600 py-3 px-4 bg-purple-50 rounded-lg border border-purple-200">
                    {language === 'en'
                      ? `You already have full Premium access during your trial (${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left).`
                      : `Během zkušební verze už máš plný Premium přístup (zbývá ${trialDaysLeft} ${trialDaysLeft === 1 ? 'den' : trialDaysLeft < 5 ? 'dny' : 'dní'}).`}
                  </div>
                ) : (
                  <Button
                    onClick={handleUpgrade}
                    disabled={isLoading || isUpgrading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3"
                  >
                    {isLoading || isUpgrading ? (language === 'en' ? "Processing..." : "Zpracovávám...") : (language === 'en' ? "Upgrade to Premium" : "Upgradovat na Premium")}
                  </Button>
                )
              ) : (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3"
                >
                  <Link href="/signup">{language === 'en' ? "Sign Up & Start Free Trial" : "Registrovat se a začít zkušební verzi"}</Link>
                </Button>
              )}

              <p className="text-xs text-gray-500 text-center mt-3">{language === 'en' ? "749 Kč/month after your 14-day free trial. Cancel anytime. 7-day money-back guarantee." : "749 Kč/měsíc po 14denní zkušební verzi zdarma. Kdykoli zrušitelné. 7denní záruka vrácení peněz."}</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Proč Premium?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Pokročilé analýzy</h3>
              <p className="text-sm text-gray-600">Detailní reporty a insights pro lepší trading rozhodnutí</p>
            </div>
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI asistent</h3>
              <p className="text-sm text-gray-600">Personalizované doporučení a psychologická podpora</p>
            </div>
            <div className="text-center">
              <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Profesionální nástroje</h3>
              <p className="text-sm text-gray-600">Vše co potřebujete pro úspěšný trading</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-4 w-4" />
            Zpět na dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
