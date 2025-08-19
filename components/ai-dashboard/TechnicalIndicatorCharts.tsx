'use client';

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { AILearningData } from '@/types/ai-learning.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';

interface TechnicalIndicatorChartsProps {
  data: AILearningData[];
  loading: boolean;
}

export default function TechnicalIndicatorCharts({ data, loading }: TechnicalIndicatorChartsProps) {
  const indicatorData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        rsi: { accuracy: 0, avgScore: 0, count: 0, color: 'bg-blue-500' },
        macd: { accuracy: 0, avgScore: 0, count: 0, color: 'bg-green-500' },
        ma: { accuracy: 0, avgScore: 0, count: 0, color: 'bg-purple-500' }
      };
    }

    // RSI 분석
    const rsiData = data.filter(d => d.rsi_accuracy_score !== null && d.rsi_accuracy_score !== undefined);
    const rsiAccuracy = rsiData.length > 0 ? 
      rsiData.reduce((sum, d) => sum + (d.rsi_accuracy_score || 0), 0) / rsiData.length : 0;

    // MACD 분석
    const macdData = data.filter(d => d.macd_accuracy_score !== null && d.macd_accuracy_score !== undefined);
    const macdAccuracy = macdData.length > 0 ? 
      macdData.reduce((sum, d) => sum + (d.macd_accuracy_score || 0), 0) / macdData.length : 0;

    // MA 분석
    const maData = data.filter(d => d.ma_accuracy_score !== null && d.ma_accuracy_score !== undefined);
    const maAccuracy = maData.length > 0 ? 
      maData.reduce((sum, d) => sum + (d.ma_accuracy_score || 0), 0) / maData.length : 0;

    return {
      rsi: { 
        accuracy: rsiAccuracy * 100, 
        avgScore: rsiAccuracy, 
        count: rsiData.length,
        color: 'bg-blue-500'
      },
      macd: { 
        accuracy: macdAccuracy * 100, 
        avgScore: macdAccuracy, 
        count: macdData.length,
        color: 'bg-green-500'
      },
      ma: { 
        accuracy: maAccuracy * 100, 
        avgScore: maAccuracy, 
        count: maData.length,
        color: 'bg-purple-500'
      }
    };
  }, [data]);

  const bestIndicatorStats = useMemo(() => {
    if (!data || data.length === 0) return {};

    const indicatorCounts = data.reduce((acc, d) => {
      if (d.best_indicator) {
        acc[d.best_indicator] = (acc[d.best_indicator] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return indicatorCounts;
  }, [data]);

  const maxIndicatorValue = Math.max(
    indicatorData.rsi.accuracy,
    indicatorData.macd.accuracy,
    indicatorData.ma.accuracy,
    100
  );

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
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
          <div className="p-2 bg-blue-900/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">기술적 지표 성능</h3>
        </div>
        <div className="text-sm text-gray-400">
          {data.length}개 예측 분석
        </div>
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart for Indicator Performance */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">지표별 정확도 비교</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Object.entries(indicatorData).map(([name, stats]) => ({
              name: name.toUpperCase(),
              accuracy: stats.accuracy,
              count: stats.count,
              fill: name === 'rsi' ? '#3B82F6' : name === 'macd' ? '#10B981' : '#8B5CF6'
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, '정확도']}
              />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for Best Indicator Distribution */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">최고 성과 지표 분포</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={Object.entries(bestIndicatorStats).map(([name, count], index) => ({
                  name: name.toUpperCase(),
                  value: count,
                  fill: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index % 5]
                }))}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {Object.entries(bestIndicatorStats).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index % 5]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value, name) => [value, `${name} 최고 성과 횟수`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indicator Performance Bars */}
      <div className="space-y-4 mb-6">
        {Object.entries(indicatorData).map(([indicator, stats]) => (
          <div key={indicator} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white uppercase">
                  {indicator}
                </span>
                <span className="text-xs text-gray-400">
                  ({stats.count}개 신호)
                </span>
              </div>
              <span className={`text-sm font-semibold ${
                stats.accuracy >= 70 ? 'text-green-400' : 
                stats.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {stats.accuracy.toFixed(1)}%
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${stats.color}`}
                  style={{ width: `${(stats.accuracy / maxIndicatorValue) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>평균 점수: {stats.avgScore.toFixed(3)}</span>
              <span>
                등급: {
                  stats.accuracy >= 80 ? 'A' :
                  stats.accuracy >= 70 ? 'B' :
                  stats.accuracy >= 60 ? 'C' :
                  stats.accuracy >= 50 ? 'D' : 'F'
                }
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Best Indicator Distribution */}
      <div className="border-t border-gray-800 pt-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          최고 성과 지표 분포
        </h4>
        
        {Object.keys(bestIndicatorStats).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(bestIndicatorStats)
              .sort(([,a], [,b]) => b - a)
              .map(([indicator, count]) => {
                const percentage = (count / data.length) * 100;
                return (
                  <div key={indicator} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white uppercase">{indicator}</span>
                      <span className="text-sm text-gray-400">{count}회 ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">최고 성과 지표 데이터가 없습니다</p>
        )}
      </div>

      {/* Performance Summary */}
      <div className="border-t border-gray-800 pt-4 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">최고 성과</p>
            <p className="text-sm font-semibold text-green-400">
              {Math.max(indicatorData.rsi.accuracy, indicatorData.macd.accuracy, indicatorData.ma.accuracy).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">평균 성과</p>
            <p className="text-sm font-semibold text-blue-400">
              {((indicatorData.rsi.accuracy + indicatorData.macd.accuracy + indicatorData.ma.accuracy) / 3).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1 md:block hidden">
            <p className="text-xs text-gray-400">신호 수</p>
            <p className="text-sm font-semibold text-purple-400">
              {indicatorData.rsi.count + indicatorData.macd.count + indicatorData.ma.count}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}