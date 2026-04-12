'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, AlertCircle, Loader, X, Copy, Download } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function IntegrationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [healthConnected, setHealthConnected] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checking, setChecking] = useState(true)
  const [webhookToken, setWebhookToken] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)

  // Check integration status on mount
  useEffect(() => {
    if (!user?.id) return

    const checkIntegrationStatus = async () => {
      try {
        setChecking(true)
        const { data } = await supabase
          .from('profiles')
          .select('mt4_webhook_token, terra_id, sleep_sync_enabled')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setConnected(!!data.mt4_webhook_token)
          setHealthConnected(!!data.terra_id && data.sleep_sync_enabled)
          if (data.mt4_webhook_token) {
            setWebhookToken(data.mt4_webhook_token)
          }
        }
      } catch (err) {
        console.error('[v0] Error checking integration status:', err)
      } finally {
        setChecking(false)
      }
    }

    checkIntegrationStatus()
  }, [user?.id])

  // Check for query parameters (success/error from oauth callback)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')

    if (successParam === 'apple_health_connected') {
      setSuccess('Apple Health connected successfully!')
      setHealthConnected(true)
      window.history.replaceState({}, '', '/settings/integrations')
      setTimeout(() => setSuccess(''), 3000)
    } else if (errorParam) {
      setError(`Connection failed: ${errorParam}`)
      window.history.replaceState({}, '', '/settings/integrations')
      setTimeout(() => setError(''), 5000)
    }
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in first</p>
      </div>
    )
  }

  const generateWebhookToken = async () => {
    setLoading(true)
    try {
      console.log('[v0] Generating webhook token...')

      const token = `${user.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 10)}-mt4`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          mt4_webhook_token: token,
          trades_sync_enabled: true,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setWebhookToken(token)
      setConnected(true)
      setSuccess('Webhook token generated successfully!')
      setTimeout(() => setSuccess(''), 3000)
      console.log('[v0] Token generated:', token)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate token'
      setError(errorMessage)
      console.error('[v0] Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const downloadEAScript = () => {
    const eaCode = `//+------------------------------------------------------------------+
//| MindTrader Trade Monitor EA                                      |
//| Automatically sends closed trades to MindTrader webhook          |
//| No login/password needed - fully automated                       |
//+------------------------------------------------------------------+

#property strict
#property description "MindTrader Trade Monitor EA"
#property version   "1.0"

// User inputs
input string WebhookURL = "${process.env.NEXT_PUBLIC_APP_URL}/api/trades/webhook";
input string UserToken = "${webhookToken || 'YOUR-TOKEN-HERE'}";
input bool   EnableLogging = true;
input int    CheckInterval = 5;

// Global variables
int lastTicket = 0;
datetime lastCheck = 0;

int OnInit()
{
    Print("MindTrader EA initialized");
    Print("Webhook URL: ", WebhookURL);
    Print("User Token: ", StringSubstr(UserToken, 0, 5), "...");
    return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
    Print("MindTrader EA deinitialized. Reason: ", reason);
}

void OnTick()
{
    static datetime nextCheck = TimeCurrent();
    
    if (TimeCurrent() >= nextCheck)
    {
        CheckClosedTrades();
        nextCheck = TimeCurrent() + CheckInterval;
    }
}

void CheckClosedTrades()
{
    int totalOrders = OrdersHistoryTotal();
    
    for (int i = 0; i < totalOrders; i++)
    {
        if (!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
            continue;
            
        if (OrderType() > OP_SELL)
            continue;
            
        if (OrderTicket() > lastTicket && OrderCloseTime() > 0)
        {
            SendTradeToWebhook(OrderTicket());
            lastTicket = OrderTicket();
        }
    }
}

void SendTradeToWebhook(int ticket)
{
    if (!OrderSelect(ticket, SELECT_BY_TICKET))
    {
        if (EnableLogging)
            Print("ERROR: Cannot select order #", ticket);
        return;
    }
    
    string json = "{";
    json += "\\"token\\":\\"" + UserToken + "\\",";
    json += "\\"ticket\\":" + IntegerToString(OrderTicket()) + ",";
    json += "\\"symbol\\":\\"" + OrderSymbol() + "\\",";
    json += "\\"type\\":" + IntegerToString(OrderType()) + ",";
    json += "\\"openTime\\":" + IntegerToString((int)OrderOpenTime()) + ",";
    json += "\\"closeTime\\":" + IntegerToString((int)OrderCloseTime()) + ",";
    json += "\\"openPrice\\":" + DoubleToString(OrderOpenPrice(), 5) + ",";
    json += "\\"closePrice\\":" + DoubleToString(OrderClosePrice(), 5) + ",";
    json += "\\"volume\\":" + DoubleToString(OrderOpenPrice(), 5) + ",";
    json += "\\"profit\\":" + DoubleToString(OrderProfit(), 2) + ",";
    json += "\\"commission\\":" + DoubleToString(OrderCommission(), 2) + ",";
    json += "\\"swap\\":" + DoubleToString(OrderSwap(), 2) + ",";
    json += "\\"comment\\":\\"" + OrderComment() + "\\"";
    json += "}";
    
    char data[];
    char result[];
    StringToCharArray(json, data);
    
    int response = WebRequest("POST", WebhookURL, "Content-Type: application/json\\r\\n", NULL, data, result);
    
    if (response == 200)
    {
        if (EnableLogging)
            Print("Trade #", ticket, " sent successfully. Profit: ", OrderProfit());
    }
    else
    {
        if (EnableLogging)
            Print("ERROR sending trade #", ticket, ". Response code: ", response);
    }
}
`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(eaCode))
    element.setAttribute('download', 'MindTrader_EA.mq4')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDisconnectMT4 = async () => {
    setLoading(true)
    try {
      console.log('[v0] Disconnecting MetaTrader...')

      const { error } = await supabase
        .from('profiles')
        .update({
          mt4_webhook_token: null,
          trades_sync_enabled: false,
        })
        .eq('user_id', user.id)

      if (error) throw error

      console.log('[v0] MetaTrader disconnected')
      setConnected(false)
      setWebhookToken(null)
      setSuccess('MetaTrader disconnected')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to disconnect')
      console.error('[v0] Disconnection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAppleHealthConnect = () => {
    console.log('[v0] Initiating Apple Health OAuth flow...')
    window.location.href = '/api/auth/apple-health'
  }

  const handleDisconnectAppleHealth = async () => {
    setLoading(true)
    try {
      console.log('[v0] Disconnecting Apple Health...')

      const { error } = await supabase
        .from('profiles')
        .update({
          terra_id: null,
          terra_reference_id: null,
          sleep_sync_enabled: false,
        })
        .eq('user_id', user.id)

      if (error) throw error

      console.log('[v0] Apple Health disconnected')
      setHealthConnected(false)
      setSuccess('Apple Health disconnected')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to disconnect Apple Health')
      console.error('[v0] Apple Health disconnection error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">Integrations</h1>
          <p className="text-slate-400">Connect your trading accounts and health devices</p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg flex gap-3 items-start">
            <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-300">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Trading Accounts Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Trading Accounts</h2>

          {connected && webhookToken ? (
            <Card className="p-6 bg-slate-900/50 border border-emerald-600/50">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Check className="w-5 h-5" />
                    <h3 className="font-semibold">MetaTrader Connected</h3>
                  </div>
                  <Button
                    onClick={handleDisconnectMT4}
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    className="text-red-300 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-emerald-200/70">Your trades are syncing automatically via EA script</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Your Webhook Token</label>
                  <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3">
                    <code className="text-sm text-slate-200 font-mono flex-1 truncate">{webhookToken}</code>
                    <button
                      onClick={() => copyToClipboard(webhookToken)}
                      className="p-2 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                    >
                      {copiedToken ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-lg text-sm text-slate-300">
                  Your EA script is configured and actively collecting trades. No password needed - fully automated!
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-slate-900 border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Connect MetaTrader 4/5</h3>
              <p className="text-slate-400 text-sm mb-6">
                Install our EA script in your MetaTrader platform. It automatically collects all your closed trades without needing your login/password.
              </p>

              <div className="space-y-4">
                {/* Step 1: Generate Token */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Step 1: Generate Your Webhook Token</h4>
                  <Button
                    onClick={generateWebhookToken}
                    disabled={loading}
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Token
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {webhookToken && !connected && (
                  <>
                    {/* Step 2: Download EA */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Step 2: Download EA Script</h4>
                      <Button
                        onClick={downloadEAScript}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download MindTrader_EA.mq4
                      </Button>
                    </div>

                    {/* Step 3: Instructions */}
                    <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-300 mb-3">Step 3: Install in MetaTrader</h4>
                      <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                        <li>Open MetaTrader → File → Open Data Folder</li>
                        <li>Go to: <code className="bg-slate-800 px-2 py-1 rounded text-xs">MQL4/Experts</code></li>
                        <li>Paste <code className="bg-slate-800 px-2 py-1 rounded text-xs">MindTrader_EA.mq4</code> here</li>
                        <li>Restart MetaTrader</li>
                        <li>Attach the EA to your chart (drag from Navigator)</li>
                        <li>Trades auto-sync when they close!</li>
                      </ol>
                    </div>

                    {/* Token Display */}
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Your Webhook Token</label>
                      <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3">
                        <code className="text-sm text-slate-200 font-mono flex-1 truncate">{webhookToken}</code>
                        <button
                          onClick={() => copyToClipboard(webhookToken)}
                          className="p-2 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                        >
                          {copiedToken ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">This token is already in your downloaded EA script</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Health Data Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Health & Sleep</h2>

          {healthConnected && (
            <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-300">
                  <Check className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Apple Health Connected</p>
                    <p className="text-sm text-emerald-200/70">Your sleep and health data syncs daily</p>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnectAppleHealth}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-400 hover:bg-red-900/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <Card className="p-6 bg-slate-900 border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Apple Health & Wearables</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Connect your Apple Health to automatically track sleep, heart rate, and stress levels. We correlate this with your trading to detect fatigue errors.
                </p>
              </div>
              <span className="text-3xl">🍎</span>
            </div>

            {!healthConnected && (
              <Button
                onClick={handleAppleHealthConnect}
                disabled={loading}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Apple Health
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
