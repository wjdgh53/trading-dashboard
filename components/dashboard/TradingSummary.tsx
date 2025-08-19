'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart, Activity } from 'lucide-react';
import type { AdvancedTradingMetrics, AdvancedTradeData } from '@/hooks/useAdvancedTradingData';

interface TradingSummaryProps {
  metrics: AdvancedTradingMetrics;
  filteredData: {
    completed: AdvancedTradeData[];
    active: AdvancedTradeData[];
  };
  isLoading?: boolean;
  className?: string;
}

export default function TradingSummary({
  metrics,
  filteredData,
  isLoading = false,
  className = '',
}: TradingSummaryProps) {
  // 핵심 메트릭만 계산
  const calculatedMetrics = useMemo(() => {
    const activeTrades = filteredData.active;

    // 현재 활성 포지션 미실현 손익
    const unrealizedPnL = activeTrades.reduce((sum, trade) => 
      sum + (trade.unrealized_pl || 0), 0
    );

    return {
      unrealizedPnL,
      activePositions: activeTrades.length,
    };
  }, [filteredData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getColorClass = (value: number, type: 'profit' | 'neutral' = 'profit') => {
    if (type === 'neutral') return 'text-blue-400';
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getBackgroundClass = (value: number, type: 'profit' | 'neutral' = 'profit') => {
    if (type === 'neutral') return 'bg-blue-500/10';
    return value >= 0 ? 'bg-green-500/10' : 'bg-red-500/10';
  };

  const summaryCards = [
    {
      id: 'net-pnl',
      title: '실현 순손익',
      value: metrics.netPnL,
      icon: metrics.netPnL >= 0 ? TrendingUp : TrendingDown,
      type: 'profit' as const,
      description: '완료된 거래 손익',
      subValue: `${metrics.totalWins}승 ${metrics.totalLosses}패`,
    },
    {
      id: 'win-rate',
      title: '승률',
      value: metrics.winRate,
      icon: PieChart,
      type: 'neutral' as const,
      description: '승률 통계',
      subValue: `${metrics.totalTrades}건 거래`,
      isPercentage: true,
    },
    {
      id: 'unrealized-pnl',
      title: '미실현 손익',
      value: calculatedMetrics.unrealizedPnL,
      icon: calculatedMetrics.unrealizedPnL >= 0 ? TrendingUp : TrendingDown,
      type: 'profit' as const,
      description: '활성 포지션',
      subValue: `${calculatedMetrics.activePositions}개 포지션`,
    },
  ];

  if (isLoading) {
    return (
      <div className={`bg-gray-900 rounded-xl border border-gray-800 p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">요약 정보</h3>
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-700 rounded mb-1"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">요약 정보</h3>
        </div>
        <div className="text-sm text-gray-400">
          {metrics.filteredPeriod} 기준
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card) => {
          const IconComponent = card.icon;
          const colorClass = getColorClass(card.value, card.type);
          const bgClass = getBackgroundClass(card.value, card.type);
          
          return (
            <div
              key={card.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors touch-manipulation"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${bgClass}`}>
                    <IconComponent className={`w-4 h-4 ${colorClass}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {card.title}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className={`text-lg sm:text-xl font-bold ${colorClass}`}>
                  {card.isPercentage 
                    ? formatPercentage(card.value)
                    : formatCurrency(card.value)
                  }
                </div>
                <div className="text-xs text-gray-400">
                  {card.description}
                </div>
                <div className="text-xs text-gray-500">
                  {card.subValue}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 성과 요약 바 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">성과 요약</span>
          <span className="text-xs text-gray-500">
            총 {metrics.totalTrades}건의 거래
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-2">
            <div className="text-base sm:text-lg font-bold text-green-400">
              {formatCurrency(metrics.bestTrade)}
            </div>
            <div className="text-xs text-gray-400">최고 수익</div>
          </div>
          <div className="p-2">
            <div className="text-base sm:text-lg font-bold text-red-400">
              {formatCurrency(metrics.worstTrade)}
            </div>
            <div className="text-xs text-gray-400">최대 손실</div>
          </div>
          <div className="p-2">
            <div className="text-base sm:text-lg font-bold text-blue-400">
              {formatPercentage(metrics.averageReturn)}
            </div>
            <div className="text-xs text-gray-400">평균 수익률</div>
          </div>
          <div className="p-2">
            <div className="text-base sm:text-lg font-bold text-purple-400">
              {metrics.activePositions}
            </div>
            <div className="text-xs text-gray-400">활성 포지션</div>
          </div>
        </div>
      </div>

      {/* 실시간 업데이트 표시 */}
      <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>실시간 계산 중</span>
        </div>
      </div>
    </div>
  );
}