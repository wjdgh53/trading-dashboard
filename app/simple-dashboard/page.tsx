'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CompletedTrade {
  id: number;
  symbol: string;
  trade_date: string;
  sold_quantity: number;
  entry_price: number;
  exit_price: number;
  realized_pnl: number;
  profit_percentage: number;
  win_loss: string;
  ai_confidence: number;
}

interface TradingHistory {
  id: number;
  symbol: string;
  trade_date: string;
  position_size: number;
  entry_price: number;
  current_price: number;
  unrealized_pl: number;
}

export default function SimpleDashboard() {
  const [completedTrades, setCompletedTrades] = useState<CompletedTrade[]>([]);
  const [tradingHistory, setTradingHistory] = useState<TradingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 데이터 가져오기
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 데이터 가져오는 중...');
      
      // 완료된 거래 가져오기
      const { data: completedData, error: completedError } = await supabase
        .from('completed_trades')
        .select('*')
        .order('trade_date', { ascending: false })
        .limit(50);

      if (completedError) {
        throw new Error(`완료된 거래 에러: ${completedError.message}`);
      }

      // 거래 히스토리 가져오기
      const { data: historyData, error: historyError } = await supabase
        .from('trading_history')
        .select('*')
        .order('trade_date', { ascending: false })
        .limit(50);

      if (historyError) {
        throw new Error(`거래 히스토리 에러: ${historyError.message}`);
      }

      setCompletedTrades(completedData || []);
      setTradingHistory(historyData || []);
      setLastUpdated(new Date());
      
      console.log(`✅ 데이터 로드 완료: 완료된 거래 ${completedData?.length}개, 거래 히스토리 ${historyData?.length}개`);
      
    } catch (err) {
      console.error('❌ 데이터 로드 에러:', err);
      setError(err instanceof Error ? err.message : '데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 메트릭 계산
  const totalTrades = completedTrades.length;
  const totalWins = completedTrades.filter(trade => trade.win_loss === 'WIN').length;
  const winRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100 * 100) / 100 : 0;
  const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0);
  const activePositions = tradingHistory.filter(trade => (trade.position_size || 0) > 0).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="relative">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">심플 트레이딩 대시보드</h1>
                <p className="text-gray-400 text-sm">
                  실제 데이터 - 2번 API 호출, 빠른 응답
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-sm text-gray-400">
                  업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
                </span>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  loading
                    ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'border-gray-600 bg-gray-800 text-white hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* 성능 표시 */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-900/50 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">실제 데이터 연결됨</span>
            </div>
            <span className="text-gray-400">
              2번 API 호출 • {totalTrades + tradingHistory.length}개 레코드 로드됨
            </span>
          </div>
        </header>

        {/* 메트릭 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 총 손익 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">총 손익</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(totalPnL)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Activity className={`w-6 h-6 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
          </div>

          {/* 승률 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">승률</p>
                <p className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {winRate}%
                </p>
                <p className="text-xs text-gray-500">{totalWins}승 {totalTrades - totalWins}패</p>
              </div>
              <div className={`p-3 rounded-lg ${winRate >= 50 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Activity className={`w-6 h-6 ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
          </div>

          {/* 활성 포지션 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">활성 포지션</p>
                <p className="text-2xl font-bold text-blue-400">{activePositions}개</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          {/* 총 거래 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">총 거래</p>
                <p className="text-2xl font-bold text-purple-400">{totalTrades}건</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 완료된 거래 테이블 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-8">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">완료된 거래 (최근 10개)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">심볼</th>
                  <th className="text-left p-4 text-gray-400 font-medium">매수가</th>
                  <th className="text-left p-4 text-gray-400 font-medium">매도가</th>
                  <th className="text-left p-4 text-gray-400 font-medium">손익</th>
                  <th className="text-left p-4 text-gray-400 font-medium">결과</th>
                  <th className="text-left p-4 text-gray-400 font-medium">매도일</th>
                </tr>
              </thead>
              <tbody>
                {completedTrades.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-800/50">
                    <td className="p-4 font-bold text-blue-400">{trade.symbol}</td>
                    <td className="p-4 text-white">{formatCurrency(trade.entry_price)}</td>
                    <td className="p-4 text-white">{formatCurrency(trade.exit_price)}</td>
                    <td className={`p-4 font-bold ${trade.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(trade.realized_pnl)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.win_loss === 'WIN' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {trade.win_loss === 'WIN' ? '승리' : '손실'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{formatDate(trade.trade_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 푸터 */}
        <footer className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-400 text-sm">
            <p>&copy; 2024 NomadVibe 심플 트레이딩 대시보드. 실제 데이터 기반.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                실제 데이터 모드
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}