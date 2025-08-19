'use client';

import React from 'react';
import { Activity, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { useAdvancedTradingData } from '@/hooks/useAdvancedTradingData';
import TradingFilters from '@/components/dashboard/TradingFilters';
import TradingSummary from '@/components/dashboard/TradingSummary';
import { tradingDataUtils } from '@/lib/tradingDataUtils';


export default function SimpleDashboard() {
  const {
    filteredData,
    metrics,
    loading,
    error,
    lastUpdated,
    currentFilters,
    isFiltering,
    applyFilters,
    refreshData,
    hasData,
    totalDataPoints,
    filteredDataPoints,
    clearCache, // 캐시 클리어 함수 추가
  } = useAdvancedTradingData();

  // Amount utils 참조
  const { amount: amountUtils } = tradingDataUtils;

  // 빠른 메트릭 접근
  const completedTrades = filteredData.completed;
  const activeTrades = filteredData.active;

  // Debug: 메트릭스 출력
  React.useEffect(() => {
    console.log('=== DEBUG: Dashboard Metrics ===');
    console.log('Current metrics:', metrics);
    
    // 매수금액/매도금액 계산 테스트
    console.log('\n=== 매수금액/매도금액 계산 검증 ===');
    
    // 샘플 데이터로 테스트
    const sampleTrade = {
      entry_price: 150.25,
      exit_price: 165.75,
      position_size: 8
    };
    
    const purchaseAmount = amountUtils.calculatePurchaseAmount(sampleTrade.entry_price, sampleTrade.position_size);
    const saleAmount = amountUtils.calculateSaleAmount(sampleTrade.exit_price, sampleTrade.position_size);
    
    console.log('샘플 거래:', sampleTrade);
    console.log('계산된 매수금액:', purchaseAmount, '(예상: 1202)');
    console.log('계산된 매도금액:', saleAmount, '(예상: 1326)');
    console.log('차이:', saleAmount - purchaseAmount, '(예상: 124)');
    
    // 실제 거래 데이터 검증 (있는 경우)
    if (completedTrades.length > 0) {
      const firstTrade = completedTrades[0];
      console.log('\n실제 거래 검증:');
      console.log('거래 데이터:', {
        symbol: firstTrade.symbol,
        entry_price: firstTrade.entry_price,
        exit_price: firstTrade.exit_price,
        position_size: firstTrade.position_size,
        purchase_amount: firstTrade.purchase_amount,
        sale_amount: firstTrade.sale_amount
      });
      
      // 재계산해서 검증
      const recalcPurchase = amountUtils.calculatePurchaseAmount(firstTrade.entry_price, firstTrade.position_size);
      const recalcSale = amountUtils.calculateSaleAmount(firstTrade.exit_price, firstTrade.position_size);
      
      console.log('재계산 결과:');
      console.log('매수금액 - 저장값:', firstTrade.purchase_amount, ', 재계산:', recalcPurchase, ', 일치:', firstTrade.purchase_amount === recalcPurchase);
      console.log('매도금액 - 저장값:', firstTrade.sale_amount, ', 재계산:', recalcSale, ', 일치:', firstTrade.sale_amount === recalcSale);
    }
  }, [metrics, completedTrades]);

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
                onClick={refreshData}
                disabled={loading || isFiltering}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-lg border transition-colors text-sm sm:text-base touch-manipulation ${
                  loading || isFiltering
                    ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'border-gray-600 bg-gray-800 text-white hover:border-gray-500 hover:bg-gray-700 active:bg-gray-600'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading || isFiltering ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">새로고침</span>
                <span className="sm:hidden">새로고침</span>
              </button>
              <button
                onClick={() => {
                  clearCache();
                  refreshData();
                }}
                disabled={loading || isFiltering}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-lg border transition-colors text-sm sm:text-base touch-manipulation ${
                  loading || isFiltering
                    ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'border-red-600 bg-red-800 text-white hover:border-red-500 hover:bg-red-700 active:bg-red-600'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">캐시 클리어</span>
                <span className="sm:hidden">클리어</span>
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
              {hasData ? '실시간 데이터' : '데이터 없음'} • {filteredDataPoints}/{totalDataPoints}개 레코드 필터됨
            </span>
          </div>
        </header>

        {/* 필터링 UI */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="xl:col-span-1">
            <TradingFilters
              currentFilters={currentFilters}
              onFiltersChange={applyFilters}
              isLoading={loading || isFiltering}
            />
          </div>
          <div className="xl:col-span-2">
            <TradingSummary
              metrics={metrics}
              filteredData={filteredData}
              isLoading={loading || isFiltering}
            />
          </div>
        </div>

        {/* 거래 테이블들 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* 완료된 거래 테이블 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">완료된 거래</h2>
                <span className="text-sm text-gray-400">
                  {completedTrades.length}건 필터됨
                </span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-80 sm:max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">심볼</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">매수가</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">매도가</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">매수금액</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">매도금액</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">손익</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">결과</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTrades.length > 0 ? (
                    completedTrades.slice(0, 20).map((trade) => {
                      // 안전한 매수금액과 매도금액 계산
                      const purchaseAmount = trade.purchase_amount ?? amountUtils.calculatePurchaseAmount(trade.entry_price, trade.position_size);
                      const saleAmount = trade.sale_amount ?? amountUtils.calculateSaleAmount(trade.exit_price, trade.position_size);
                      
                      return (
                        <tr key={`completed-${trade.id}`} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                          <td className="p-2 sm:p-4 font-bold text-blue-400 text-xs sm:text-sm">{trade.symbol}</td>
                          <td className="p-2 sm:p-4 text-white text-xs sm:text-sm">{formatCurrency(trade.entry_price)}</td>
                          <td className="p-2 sm:p-4 text-white text-xs sm:text-sm">{formatCurrency(trade.exit_price || 0)}</td>
                          <td className="p-2 sm:p-4 text-cyan-400 text-xs sm:text-sm font-medium">
                            {amountUtils.formatCurrency(purchaseAmount)}
                          </td>
                          <td className="p-2 sm:p-4 text-orange-400 text-xs sm:text-sm font-medium">
                            {amountUtils.formatCurrency(saleAmount)}
                          </td>
                          <td className={`p-2 sm:p-4 font-bold text-xs sm:text-sm ${(trade.realized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(trade.realized_pnl || 0)}
                          </td>
                          <td className="p-2 sm:p-4">
                            <span className={`px-1 sm:px-2 py-1 rounded text-xs font-medium ${
                              trade.win_loss === 'win' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {trade.win_loss === 'win' ? '승' : '패'}
                            </span>
                          </td>
                          <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm">{formatDate(trade.exit_date || trade.trade_date)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        필터된 완료 거래가 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 활성 포지션 테이블 */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">활성 포지션</h2>
                <span className="text-sm text-gray-400">
                  {activeTrades.length}개 포지션
                </span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-80 sm:max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">심볼</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">진입가</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">현재가</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">수량</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">투자금액</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">미실현손익</th>
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-medium text-xs sm:text-sm">진입일</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTrades.length > 0 ? (
                    activeTrades.slice(0, 20).map((trade) => {
                      // 안전한 투자금액 계산
                      const investmentAmount = trade.purchase_amount ?? amountUtils.calculatePurchaseAmount(trade.entry_price, trade.position_size);
                      
                      return (
                        <tr key={`active-${trade.id}`} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                          <td className="p-2 sm:p-4 font-bold text-blue-400 text-xs sm:text-sm">{trade.symbol}</td>
                          <td className="p-2 sm:p-4 text-white text-xs sm:text-sm">{formatCurrency(trade.entry_price)}</td>
                          <td className="p-2 sm:p-4 text-white text-xs sm:text-sm">{formatCurrency(trade.current_price || trade.entry_price)}</td>
                          <td className="p-2 sm:p-4 text-purple-400 text-xs sm:text-sm">{trade.position_size}</td>
                          <td className="p-2 sm:p-4 text-cyan-400 text-xs sm:text-sm font-medium">
                            {amountUtils.formatCurrency(investmentAmount)}
                          </td>
                          <td className={`p-2 sm:p-4 font-bold text-xs sm:text-sm ${(trade.unrealized_pl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(trade.unrealized_pl || 0)}
                          </td>
                          <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm">{formatDate(trade.trade_date)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        활성 포지션이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <footer className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-400 text-sm">
            <p>&copy; 2024 NomadVibe 심플 트레이딩 대시보드. 실제 데이터 기반.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                고급 필터링 모드
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}