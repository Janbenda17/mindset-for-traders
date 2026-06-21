import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/browser'
import { metaApiClient } from '@/lib/integrations/metaapi'

export interface BrokerData {
  accountBalance: number
  equity: number
  margin: number
  marginLevel: number
  openTrades: number
  todayPnL: number
  todayTrades: Array<{
    id: string
    symbol: string
    type: 'BUY' | 'SELL'
    volume: number
    entryPrice: number
    currentPrice: number
    profit: number
  }>
  lastTrade?: {
    symbol: string
    type: 'BUY' | 'SELL'
    volume: number
    entryPrice: number
    entryTime: string
  }
}

export function useBrokerAutoFill() {
  const { user } = useAuth()
  const [brokerData, setBrokerData] = useState<BrokerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFirstLoadRef = useRef(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  // Fetch broker data on mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetchBrokerData()

    return () => {
      stopPolling()
    }
  }, [user?.id])

  const fetchBrokerData = async () => {
    if (!user?.id) return

    try {
      if (isFirstLoadRef.current) setLoading(true)

      // Get user's MetaApi credentials
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('metaapi_account_id, metaapi_token')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError || !profile?.metaapi_account_id) {
        setError('MetaApi not connected')
        setLoading(false)
        // Not connected - nothing to poll for, stop hitting Supabase every
        // 30s until the user actually links a MetaTrader account.
        stopPolling()
        return
      }

      // Connected - make sure polling + realtime subscription are running
      // (only set up once, the first time we see a connected account).
      if (!pollRef.current && !channelRef.current) {
        pollRef.current = setInterval(fetchBrokerData, 30000)
        channelRef.current = supabase
          .channel(`broker_data_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'mt4_trades',
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              fetchBrokerData()
            }
          )
          .subscribe()
      }

      // Fetch account info from MetaApi
      const accountInfo = await metaApiClient.getAccountInfo(profile.metaapi_account_id)
      
      // Fetch trades from Supabase
      const { data: trades, error: tradesError } = await supabase
        .from('mt4_trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('entry_time', { ascending: false })

      if (tradesError) {
        console.error('[v0] Error fetching trades:', tradesError)
      }

      const openTrades = trades?.filter(t => !t.exit_time) || []
      const todayTrades = trades || []
      
      const todayPnL = todayTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0)

      setBrokerData({
        accountBalance: accountInfo.balance || 0,
        equity: accountInfo.equity || 0,
        margin: accountInfo.margin || 0,
        marginLevel: accountInfo.margin_level || 0,
        openTrades: openTrades.length,
        todayPnL,
        todayTrades: todayTrades.map(t => ({
          id: t.id,
          symbol: t.symbol,
          type: t.trade_type === 'BUY' ? 'BUY' : 'SELL',
          volume: t.volume,
          entryPrice: t.entry_price,
          currentPrice: t.current_price || t.entry_price,
          profit: t.profit_loss || 0,
        })),
        lastTrade: todayTrades[0] ? {
          symbol: todayTrades[0].symbol,
          type: todayTrades[0].trade_type === 'BUY' ? 'BUY' : 'SELL',
          volume: todayTrades[0].volume,
          entryPrice: todayTrades[0].entry_price,
          entryTime: todayTrades[0].entry_time,
        } : undefined,
      })

      setError(null)
    } catch (err) {
      console.error('[v0] Error fetching broker data:', err)
      setError('Failed to fetch broker data')
    } finally {
      setLoading(false)
      isFirstLoadRef.current = false
    }
  }

  return {
    brokerData,
    loading,
    error,
    refetch: fetchBrokerData,
  }
}

export default useBrokerAutoFill
