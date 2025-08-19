'use client';

import React, { useMemo } from 'react';
import { Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { AILearningData } from '@/types/ai-learning.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from 'recharts';

interface ConfidenceAnalysisChartProps {
  data: AILearningData[];
  loading: boolean;
}

interface ConfidenceRange {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
}

interface ConfidenceStats {
  range: string;
  count: number;
  accuracy: number;
  avgActualROI: number;
  overconfidenceRate: number;
  avgProfitPercentage: number;
  successRate: number;
  color: string;
  bgColor: string;
}

export default function ConfidenceAnalysisChart({ data, loading }: ConfidenceAnalysisChartProps) {
  const confidenceRanges: ConfidenceRange[] = [
    { label: '매우 높음 (80-100%)', min: 0.8, max: 1.0, color: 'text-green-400', bgColor: 'bg-green-500' },
    { label: '높음 (60-80%)', min: 0.6, max: 0.8, color: 'text-blue-400', bgColor: 'bg-blue-500' },
    { label: '보통 (40-60%)', min: 0.4, max: 0.6, color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
    { label: '낮음 (20-40%)', min: 0.2, max: 0.4, color: 'text-orange-400', bgColor: 'bg-orange-500' },
    { label: '매우 낮음 (0-20%)', min: 0.0, max: 0.2, color: 'text-red-400', bgColor: 'bg-red-500' }
  ];

  const confidenceStats = useMemo(() => {
    if (!data || data.length === 0) return [];

    return confidenceRanges.map(range => {
      const rangeData = data.filter(d => {
        const confidence = d.predicted_confidence_initial || 0;
        return confidence >= range.min && confidence < range.max;
      });

      if (rangeData.length === 0) {
        return {
          range: range.label,
          count: 0,
          accuracy: 0,
          avgActualROI: 0,
          overconfidenceRate: 0,
          avgProfitPercentage: 0,
          successRate: 0,
          color: range.color,
          bgColor: range.bgColor
        };
      }

      // Accuracy calculation
      const rangeDataWithResults = rangeData.filter(d => d.actual_profit_percentage !== null);
      const correctPredictions = rangeDataWithResults.filter(d => {
        const predicted = (d.predicted_confidence_initial || 0) > 0.5;
        const actual = (d.actual_profit_percentage || 0) > 0;
        return predicted === actual;
      });
      const accuracy = rangeDataWithResults.length > 0 ? 
        (correctPredictions.length / rangeDataWithResults.length) * 100 : 0;

      // ROI calculation
      const roiData = rangeData.filter(d => d.roi_vs_market !== null);
      const avgActualROI = roiData.length > 0 ? 
        roiData.reduce((sum, d) => sum + (d.roi_vs_market || 0), 0) / roiData.length : 0;

      // Overconfidence rate
      const overconfidentCount = rangeData.filter(d => d.overconfidence_detected === true).length;
      const overconfidenceRate = (overconfidentCount / rangeData.length) * 100;

      // Average profit percentage
      const profitData = rangeData.filter(d => d.actual_profit_percentage !== null);
      const avgProfitPercentage = profitData.length > 0 ? 
        profitData.reduce((sum, d) => sum + (d.actual_profit_percentage || 0), 0) / profitData.length : 0;

      // Success rate (profitable predictions)
      const profitableCount = rangeDataWithResults.filter(d => (d.actual_profit_percentage || 0) > 0).length;
      const successRate = rangeDataWithResults.length > 0 ? 
        (profitableCount / rangeDataWithResults.length) * 100 : 0;

      return {
        range: range.label,
        count: rangeData.length,
        accuracy: Math.round(accuracy * 100) / 100,
        avgActualROI: Math.round(avgActualROI * 100) / 100,
        overconfidenceRate: Math.round(overconfidenceRate * 100) / 100,
        avgProfitPercentage: Math.round(avgProfitPercentage * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        color: range.color,
        bgColor: range.bgColor
      };
    }).filter(stat => stat.count > 0);
  }, [data]);

  const maxCount = Math.max(...confidenceStats.map(stat => stat.count), 1);

  const overallStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalOverconfident = data.filter(d => d.overconfidence_detected === true).length;
    const overallOverconfidenceRate = (totalOverconfident / data.length) * 100;

    const dataWithResults = data.filter(d => d.actual_profit_percentage !== null);
    const totalCorrect = dataWithResults.filter(d => {
      const predicted = (d.predicted_confidence_initial || 0) > 0.5;
      const actual = (d.actual_profit_percentage || 0) > 0;
      return predicted === actual;
    }).length;
    const overallAccuracy = dataWithResults.length > 0 ? (totalCorrect / dataWithResults.length) * 100 : 0;

    return {
      overallOverconfidenceRate: Math.round(overallOverconfidenceRate * 100) / 100,
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      totalPredictions: data.length,
      totalWithResults: dataWithResults.length
    };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded"></div>
                </div>
              </div>
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
          <div className="p-2 bg-purple-900/20 rounded-lg">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">신뢰도별 성과 분석</h3>
        </div>
        <div className="text-sm text-gray-400">
          {data.length}개 예측 분석
        </div>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">전체 정확도</p>
            <p className={`text-lg font-bold ${overallStats.overallAccuracy >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
              {overallStats.overallAccuracy.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">과신 비율</p>
            <p className={`text-lg font-bold ${overallStats.overallOverconfidenceRate <= 30 ? 'text-green-400' : 'text-red-400'}`}>
              {overallStats.overallOverconfidenceRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">총 예측</p>
            <p className="text-lg font-bold text-blue-400">{overallStats.totalPredictions}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">결과 확인</p>
            <p className="text-lg font-bold text-purple-400">{overallStats.totalWithResults}</p>
          </div>
        </div>
      )}

      {/* Confidence Range Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart for Confidence Distribution */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">신뢰도 구간별 예측 수</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confidenceStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value, name) => [value, name === 'count' ? '예측 수' : name]}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter Plot for Confidence vs Accuracy */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">신뢰도 vs 정확도 관계</h4>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={confidenceStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number"
                dataKey="count"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                name="예측 수"
              />
              <YAxis 
                type="number"
                dataKey="accuracy"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                name="정확도 (%)"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value, name) => [
                  name === 'accuracy' ? `${value.toFixed(1)}%` : value,
                  name === 'accuracy' ? '정확도' : '예측 수'
                ]}
                labelFormatter={(label) => `구간: ${confidenceStats[label]?.range || ''}`}
              />
              <Scatter dataKey="accuracy" fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Confidence Range Analysis */}
      <div className="space-y-4">
        {confidenceStats.map((stat, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${stat.color}`}>
                  {stat.range}
                </span>
                <span className="text-xs text-gray-400">
                  ({stat.count}개)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className={`font-semibold ${stat.accuracy >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                  정확도: {stat.accuracy.toFixed(1)}%
                </span>
                <span className={`font-semibold ${stat.successRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  성공률: {stat.successRate.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Count Bar */}
            <div className="relative">
              <div className="w-full bg-gray-800 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${stat.bgColor}`}
                  style={{ width: `${(stat.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {stat.count}개
                </span>
              </div>
            </div>
            
            {/* Detailed Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                <span className="text-gray-400">시장 대비 ROI:</span>
                <span className={`font-semibold ${stat.avgActualROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.avgActualROI >= 0 ? '+' : ''}{stat.avgActualROI.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                <span className="text-gray-400">평균 수익률:</span>
                <span className={`font-semibold ${stat.avgProfitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.avgProfitPercentage >= 0 ? '+' : ''}{stat.avgProfitPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                <span className="text-gray-400">과신 탐지:</span>
                <div className="flex items-center gap-1">
                  {stat.overconfidenceRate > 0 && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                  <span className={`font-semibold ${stat.overconfidenceRate <= 20 ? 'text-green-400' : 'text-orange-400'}`}>
                    {stat.overconfidenceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                <span className="text-gray-400">트렌드:</span>
                <div className="flex items-center gap-1">
                  {stat.accuracy >= 60 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs ${stat.accuracy >= 60 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.accuracy >= 60 ? '좋음' : '개선 필요'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <h4 className="text-sm font-semibold text-white mb-3">주요 인사이트</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400 mb-2">최고 성과 신뢰도 구간:</p>
            {(() => {
              const best = confidenceStats.reduce((max, current) => 
                current.accuracy > max.accuracy ? current : max, confidenceStats[0] || { range: 'N/A', accuracy: 0 });
              return (
                <p className="text-green-400 font-semibold">
                  {best.range} ({best.accuracy.toFixed(1)}% 정확도)
                </p>
              );
            })()}
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400 mb-2">가장 많은 예측 구간:</p>
            {(() => {
              const most = confidenceStats.reduce((max, current) => 
                current.count > max.count ? current : max, confidenceStats[0] || { range: 'N/A', count: 0 });
              return (
                <p className="text-blue-400 font-semibold">
                  {most.range} ({most.count}개 예측)
                </p>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}