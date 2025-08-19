'use client';

import React, { useState } from 'react';
import { useAdvancedTradingData, type FilterOptions, type DateFilterPeriod } from '@/hooks/useAdvancedTradingData';

interface DashboardProps {
  className?: string;
}

export function AdvancedTradingDashboard({ className = '' }: DashboardProps) {
  const {
    // Core data
    filteredData,
    metrics,
    loading,
    error,
    cacheStatus,
    isFiltering,
    
    // Computed values
    hasData,
    totalDataPoints,
    filteredDataPoints,
    cacheAge,
    cacheHitRate,
    memoryUsage,
    uniqueSymbols,
    
    // Actions
    applyFilters,
    refreshData,
    refreshIncremental,
    clearCache,
    
    // Utility methods
    getSymbolPerformance,
    getDailyPnLData,
    getCacheStatistics,
    getErrorAnalytics,
  } = useAdvancedTradingData();

  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterPeriod>('30days');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Handle filter changes
  const handlePeriodChange = (period: DateFilterPeriod) => {
    setSelectedPeriod(period);
    const filters: FilterOptions = {
      period,
      symbol: selectedSymbol || undefined,
      dateRange: period === 'custom' ? customDateRange : undefined,
    };
    applyFilters(filters);
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    const filters: FilterOptions = {
      period: selectedPeriod,
      symbol: symbol || undefined,
      dateRange: selectedPeriod === 'custom' ? customDateRange : undefined,
    };
    applyFilters(filters);
  };

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomDateRange({ startDate, endDate });
    if (selectedPeriod === 'custom') {
      const filters: FilterOptions = {
        period: 'custom',
        dateRange: { startDate, endDate },
        symbol: selectedSymbol || undefined,
      };
      applyFilters(filters);
    }
  };

  // Performance data
  const symbolPerformance = getSymbolPerformance();
  const dailyPnLData = getDailyPnLData();
  const cacheStats = getCacheStatistics();

  return (
    <div className={`advanced-trading-dashboard ${className}`}>
      {/* Header with cache status */}
      <div className="dashboard-header mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">고성능 자동매매 대시보드</h1>
          <div className="flex items-center gap-4">
            <div className={`cache-status ${cacheStatus}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                cacheStatus === 'hot' ? 'bg-green-500' : 
                cacheStatus === 'warm' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              캐시: {cacheStatus}
            </div>
            <button
              onClick={refreshIncremental}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              disabled={loading}
            >
              업데이트
            </button>
            <button
              onClick={clearCache}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              캐시 초기화
            </button>
          </div>
        </div>
        
        {/* Performance metrics */}
        <div className="performance-info mt-2 text-sm text-gray-600">
          <span>데이터: {totalDataPoints}개 ({filteredDataPoints}개 필터링)</span>
          <span className="ml-4">캐시 적중률: {cacheHitRate.toFixed(1)}%</span>
          <span className="ml-4">메모리 사용량: {memoryUsage.toFixed(1)}KB</span>
          <span className="ml-4">캐시 나이: {Math.round(cacheAge / 1000)}초</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">기간 선택</label>
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value as DateFilterPeriod)}
              className="w-full p-2 border rounded"
              disabled={isFiltering}
            >
              <option value="today">오늘</option>
              <option value="7days">최근 7일</option>
              <option value="30days">최근 30일</option>
              <option value="custom">사용자 지정</option>
            </select>
          </div>

          {/* Symbol Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">종목 선택</label>
            <select
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isFiltering}
            >
              <option value="">전체 종목</option>
              {uniqueSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">날짜 범위</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => handleCustomDateChange(e.target.value, customDateRange.endDate)}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => handleCustomDateChange(customDateRange.startDate, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
              </div>
            </div>
          )}
        </div>

        {isFiltering && (
          <div className="mt-4 text-center">
            <span className="text-blue-600">필터링 중...</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 font-medium">⚠️ {error}</span>
            <button
              onClick={refreshData}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              disabled={loading}
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state mb-6 text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* Main Content */}
      {hasData && !loading && (
        <>
          {/* Summary Metrics */}
          <div className="metrics-grid mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">총 투자금액</h3>
              <p className="text-2xl font-bold text-blue-600">
                ₩{metrics.totalInvestment.toLocaleString()}
              </p>
            </div>
            
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">총 회수금액</h3>
              <p className="text-2xl font-bold text-green-600">
                ₩{metrics.totalRecovery.toLocaleString()}
              </p>
            </div>
            
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">순손익</h3>
              <p className={`text-2xl font-bold ${metrics.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₩{metrics.netPnL.toLocaleString()}
              </p>
            </div>
            
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">승률</h3>
              <p className="text-2xl font-bold text-purple-600">
                {metrics.winRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="additional-metrics mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">총 거래</h3>
              <p className="text-xl font-semibold">{metrics.totalTrades}건</p>
              <p className="text-sm text-gray-500">
                승: {metrics.totalWins} / 패: {metrics.totalLosses}
              </p>
            </div>
            
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">평균 수익률</h3>
              <p className={`text-xl font-semibold ${metrics.averageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.averageReturn.toFixed(2)}%
              </p>
            </div>
            
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">최고 거래</h3>
              <p className="text-xl font-semibold text-green-600">
                {metrics.bestTrade.toFixed(2)}%
              </p>
            </div>
            
            <div className="metric-card p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">활성 포지션</h3>
              <p className="text-xl font-semibold text-blue-600">
                {metrics.activePositions}개
              </p>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="recent-trades mb-6 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">최근 거래 ({metrics.filteredPeriod})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">종목</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">진입가</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">청산가</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">수량</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">손익</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">수익률</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.completed.slice(0, 10).map(trade => (
                    <tr key={trade.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{trade.symbol}</td>
                      <td className="px-4 py-2">₩{trade.entry_price.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        {trade.exit_price ? `₩${trade.exit_price.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-2">{trade.position_size}</td>
                      <td className={`px-4 py-2 font-medium ${
                        (trade.realized_pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₩{(trade.realized_pnl || 0).toLocaleString()}
                      </td>
                      <td className={`px-4 py-2 font-medium ${
                        (trade.profit_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(trade.profit_percentage || 0).toFixed(2)}%
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(trade.exit_date || trade.trade_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Positions */}
          {filteredData.active.length > 0 && (
            <div className="active-positions mb-6 bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">활성 포지션</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">종목</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">진입가</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">현재가</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">수량</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">미실현손익</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">AI 신뢰도</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">보유일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.active.map(trade => (
                      <tr key={trade.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{trade.symbol}</td>
                        <td className="px-4 py-2">₩{trade.entry_price.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          {trade.current_price ? `₩${trade.current_price.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-2">{trade.position_size}</td>
                        <td className={`px-4 py-2 font-medium ${
                          (trade.unrealized_pl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ₩{(trade.unrealized_pl || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {trade.ai_confidence || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {Math.floor((Date.now() - new Date(trade.trade_date).getTime()) / (1000 * 60 * 60 * 24))}일
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!hasData && !loading && !error && (
        <div className="empty-state text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">데이터가 없습니다</h3>
          <p className="text-gray-500">거래 데이터를 불러오거나 필터를 조정해보세요.</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            데이터 새로고침
          </button>
        </div>
      )}
    </div>
  );
}