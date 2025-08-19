'use client';

import React, { useMemo } from 'react';
import { Globe, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { AILearningData } from '@/types/ai-learning.types';

interface MarketEnvironmentTableProps {
  data: AILearningData[];
  loading: boolean;
}

interface MarketEnvironmentStats {
  regime: string;
  volatility: string;
  count: number;
  avgAccuracy: number;
  avgROI: number;
  avgVIX: number;
  avgConfidence: number;
  successRate: number;
}

export default function MarketEnvironmentTable({ data, loading }: MarketEnvironmentTableProps) {
  const environmentStats = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by market regime and volatility
    const groupedData = data.reduce((acc, item) => {
      const regime = item.market_regime || 'unknown';
      const volatility = item.volatility_environment || 'unknown';
      const key = `${regime}-${volatility}`;

      if (!acc[key]) {
        acc[key] = {
          regime,
          volatility,
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { regime: string; volatility: string; items: AILearningData[] }>);

    // Calculate stats for each group
    return Object.values(groupedData).map(group => {
      const items = group.items;
      const count = items.length;

      // Accuracy calculation (predictions with actual results)
      const itemsWithResults = items.filter(item => item.actual_profit_percentage !== null);
      const correctPredictions = itemsWithResults.filter(item => {
        const predicted = (item.predicted_confidence_initial || 0) > 0.5;
        const actual = (item.actual_profit_percentage ?? 0) > 0;
        return predicted === actual;
      });
      const avgAccuracy = itemsWithResults.length > 0 ? 
        (correctPredictions.length / itemsWithResults.length) * 100 : 0;

      // ROI calculation
      const roiItems = items.filter(item => item.roi_vs_market !== null);
      const avgROI = roiItems.length > 0 ? 
        roiItems.reduce((sum, item) => sum + (item.roi_vs_market || 0), 0) / roiItems.length : 0;

      // VIX calculation
      const vixItems = items.filter(item => item.vix_level !== null);
      const avgVIX = vixItems.length > 0 ? 
        vixItems.reduce((sum, item) => sum + (item.vix_level || 0), 0) / vixItems.length : 0;

      // Confidence calculation
      const avgConfidence = items.reduce((sum, item) => 
        sum + (item.predicted_confidence_initial || 0), 0) / count;

      // Success rate (profitable predictions)
      const profitableItems = items.filter(item => 
        item.actual_profit_percentage !== null && (item.actual_profit_percentage ?? 0) > 0
      );
      const successRate = itemsWithResults.length > 0 ? 
        (profitableItems.length / itemsWithResults.length) * 100 : 0;

      return {
        regime: group.regime,
        volatility: group.volatility,
        count,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        avgROI: Math.round(avgROI * 100) / 100,
        avgVIX: Math.round(avgVIX * 100) / 100,
        avgConfidence: Math.round(avgConfidence * 1000) / 10, // Convert to percentage
        successRate: Math.round(successRate * 100) / 100
      };
    }).sort((a, b) => b.count - a.count); // Sort by count descending
  }, [data]);

  const getRegimeIcon = (regime: string) => {
    switch (regime.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'neutral':
      case 'sideways':
        return <Minus className="w-4 h-4 text-gray-400" />;
      default:
        return <Globe className="w-4 h-4 text-blue-400" />;
    }
  };

  const getRegimeColor = (regime: string) => {
    switch (regime.toLowerCase()) {
      case 'bullish':
        return 'text-green-400 bg-green-900/20';
      case 'bearish':
        return 'text-red-400 bg-red-900/20';
      case 'neutral':
      case 'sideways':
        return 'text-gray-400 bg-gray-800';
      default:
        return 'text-blue-400 bg-blue-900/20';
    }
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility.toLowerCase()) {
      case 'high':
        return 'text-red-300 bg-red-900/20';
      case 'medium':
        return 'text-yellow-300 bg-yellow-900/20';
      case 'low':
        return 'text-green-300 bg-green-900/20';
      default:
        return 'text-gray-300 bg-gray-800';
    }
  };

  const getPerformanceColor = (value: number, isAccuracy: boolean = false) => {
    if (isAccuracy) {
      return value >= 70 ? 'text-green-400' : 
             value >= 50 ? 'text-yellow-400' : 'text-red-400';
    }
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-900/20 rounded-lg">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">시장 환경별 성과 분석</h3>
        </div>
        <div className="text-sm text-gray-400">
          {environmentStats.length}개 환경 조합
        </div>
      </div>

      {environmentStats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-3 text-gray-400 font-medium text-sm">시장 환경</th>
                <th className="text-left p-3 text-gray-400 font-medium text-sm">변동성</th>
                <th className="text-center p-3 text-gray-400 font-medium text-sm">예측 수</th>
                <th className="text-center p-3 text-gray-400 font-medium text-sm">정확도</th>
                <th className="text-center p-3 text-gray-400 font-medium text-sm">시장 대비 수익률</th>
                <th className="text-center p-3 text-gray-400 font-medium text-sm">평균 VIX</th>
                <th className="text-center p-3 text-gray-400 font-medium text-sm">평균 신뢰도</th>
                <th className="text-center p-3 text-gray-400 font-medium text-sm">성공률</th>
              </tr>
            </thead>
            <tbody>
              {environmentStats.map((stat, index) => (
                <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getRegimeIcon(stat.regime)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRegimeColor(stat.regime)}`}>
                        {stat.regime === 'bullish' ? '강세장' :
                         stat.regime === 'bearish' ? '약세장' :
                         stat.regime === 'neutral' ? '횡보장' :
                         stat.regime === 'sideways' ? '횡보장' : stat.regime}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getVolatilityColor(stat.volatility)}`}>
                      {stat.volatility === 'high' ? '고변동성' :
                       stat.volatility === 'medium' ? '중간변동성' :
                       stat.volatility === 'low' ? '저변동성' : stat.volatility}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span className="text-white font-medium">{stat.count}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-semibold ${getPerformanceColor(stat.avgAccuracy, true)}`}>
                      {stat.avgAccuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-semibold ${getPerformanceColor(stat.avgROI)}`}>
                      {stat.avgROI >= 0 ? '+' : ''}{stat.avgROI.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-orange-400 font-medium">
                      {stat.avgVIX > 0 ? stat.avgVIX.toFixed(1) : '-'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-blue-400 font-medium">
                      {stat.avgConfidence.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-semibold ${getPerformanceColor(stat.successRate, true)}`}>
                      {stat.successRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">시장 환경 데이터가 없습니다</p>
        </div>
      )}

      {/* Environment Summary */}
      {environmentStats.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-800">
          <h4 className="text-sm font-semibold text-white mb-3">환경별 요약</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 mb-1">최고 성과 환경</p>
              {(() => {
                const best = environmentStats.reduce((max, current) => 
                  current.avgAccuracy > max.avgAccuracy ? current : max, environmentStats[0]);
                return (
                  <p className="text-green-400 font-semibold">
                    {best.regime === 'bullish' ? '강세장' : 
                     best.regime === 'bearish' ? '약세장' : '횡보장'} + {' '}
                    {best.volatility === 'high' ? '고변동성' :
                     best.volatility === 'medium' ? '중간변동성' : '저변동성'}
                  </p>
                );
              })()}
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 mb-1">가장 많은 예측</p>
              {(() => {
                const most = environmentStats[0]; // Already sorted by count
                return (
                  <p className="text-blue-400 font-semibold">
                    {most.regime === 'bullish' ? '강세장' : 
                     most.regime === 'bearish' ? '약세장' : '횡보장'} ({most.count}개)
                  </p>
                );
              })()}
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 mb-1">평균 성과</p>
              <p className="text-purple-400 font-semibold">
                {(environmentStats.reduce((sum, stat) => sum + stat.avgAccuracy, 0) / environmentStats.length).toFixed(1)}% 정확도
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}