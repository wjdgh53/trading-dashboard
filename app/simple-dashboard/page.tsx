'use client'

import { useState, useEffect } from 'react'

interface TradingData {
  id: number
  symbol: string
  action: string
  current_price: number
  ai_confidence: number
  realized_pnl?: number
  trade_date: string
  created_at?: string
}

interface CompletedTrade {
  id: number
  symbol: string
  realized_pnl: number
  profit_percentage: number
  win_loss: string
  trade_date: string
  entry_price: number
  exit_price: number
  sold_quantity: number
}

export default function SimpleDashboard() {
  const [tradingHistory, setTradingHistory] = useState<TradingData[]>([])
  const [completedTrades, setCompletedTrades] = useState<CompletedTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/test-db')
        const data = await response.json()
        
        if (data.success) {
          setTradingHistory(data.tables.trading_history.sample_data || [])
          setCompletedTrades(data.tables.completed_trades.sample_data || [])
        } else {
          setError('데이터 로드 실패')
        }
      } catch (err) {
        setError('API 호출 실패')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // 통계 계산
  const totalTrades = completedTrades.length
  const winTrades = completedTrades.filter(t => t.win_loss === 'WIN').length
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0
  const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0)
  const bestTrade = completedTrades.length > 0 ? Math.max(...completedTrades.map(t => t.realized_pnl)) : 0
  const worstTrade = completedTrades.length > 0 ? Math.min(...completedTrades.map(t => t.realized_pnl)) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">데이터 로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">간단 트레이딩 대시보드</h1>
        
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">총 거래</h3>
            <p className="text-2xl font-bold text-blue-400">{totalTrades}건</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">승률</h3>
            <p className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(winRate)}
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">총 수익/손실</h3>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totalPnL)}
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">최고 거래</h3>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(bestTrade)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 완료된 거래 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">완료된 거래</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left pb-2">종목</th>
                    <th className="text-left pb-2">수익/손실</th>
                    <th className="text-left pb-2">수익률</th>
                    <th className="text-left pb-2">승/패</th>
                    <th className="text-left pb-2">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTrades.slice(0, 10).map((trade, index) => (
                    <tr key={trade.id} className="border-b border-gray-700/50">
                      <td className="py-2 font-bold text-blue-400">{trade.symbol}</td>
                      <td className={`py-2 ${trade.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(trade.realized_pnl)}
                      </td>
                      <td className={`py-2 ${trade.profit_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage(trade.profit_percentage)}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.win_loss === 'WIN' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {trade.win_loss}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400">{formatDate(trade.trade_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 최근 트레이딩 히스토리 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">최근 트레이딩 활동</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left pb-2">종목</th>
                    <th className="text-left pb-2">액션</th>
                    <th className="text-left pb-2">현재가</th>
                    <th className="text-left pb-2">AI 신뢰도</th>
                    <th className="text-left pb-2">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {tradingHistory.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-700/50">
                      <td className="py-2 font-bold text-blue-400">{trade.symbol}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.action === 'BUY' ? 'bg-green-900 text-green-300' :
                          trade.action === 'SELL' ? 'bg-red-900 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="py-2">{formatCurrency(trade.current_price)}</td>
                      <td className="py-2 text-yellow-400">{trade.ai_confidence || 0}%</td>
                      <td className="py-2 text-gray-400">{formatDate(trade.trade_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 디버그 정보 */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold mb-2">데이터 상태</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>✅ 트레이딩 히스토리: {tradingHistory.length}개</p>
            <p>✅ 완료된 거래: {completedTrades.length}개</p>
            <p>✅ 데이터 로딩 완료</p>
          </div>
        </div>
      </div>
    </div>
  )
}