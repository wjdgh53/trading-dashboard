'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, Zap, Target } from 'lucide-react';
import { AILearningData } from '@/types/ai-learning.types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AdvancedAnalyticsProps {
  data: AILearningData[];
  loading: boolean;
}

interface CorrelationData {
  indicator1: string;
  indicator2: string;
  correlation: number;
  significance: 'high' | 'medium' | 'low';
}

interface PerformanceCorrelation {
  metric: string;
  correlation: number;
  description: string;
}

export default function AdvancedAnalytics({ data, loading }: AdvancedAnalyticsProps) {
  const correlationAnalysis = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const indicators = [
      { key: 'rsi_accuracy_score', name: 'RSI' },
      { key: 'macd_accuracy_score', name: 'MACD' },
      { key: 'ma_accuracy_score', name: 'MA' },
      { key: 'predicted_confidence_initial', name: '초기 신뢰도' },
      { key: 'decision_quality_score', name: '의사결정 품질' },
      { key: 'vix_level', name: 'VIX 레벨' }
    ];

    const correlations: CorrelationData[] = [];
    
    for (let i = 0; i < indicators.length; i++) {
      for (let j = i + 1; j < indicators.length; j++) {
        const indicator1 = indicators[i];
        const indicator2 = indicators[j];
        
        const validData = data.filter(d => 
          d[indicator1.key as keyof AILearningData] !== null && 
          d[indicator1.key as keyof AILearningData] !== undefined &&
          d[indicator2.key as keyof AILearningData] !== null && 
          d[indicator2.key as keyof AILearningData] !== undefined
        );
        
        if (validData.length < 5) continue;
        
        const correlation = calculateCorrelation(
          validData.map(d => Number(d[indicator1.key as keyof AILearningData]) || 0),
          validData.map(d => Number(d[indicator2.key as keyof AILearningData]) || 0)
        );
        
        correlations.push({
          indicator1: indicator1.name,
          indicator2: indicator2.name,
          correlation,
          significance: Math.abs(correlation) > 0.7 ? 'high' : Math.abs(correlation) > 0.4 ? 'medium' : 'low'
        });
      }
    }
    
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [data]);

  const performanceMetrics = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const dataWithResults = data.filter(d => d.actual_profit_percentage !== null);
    if (dataWithResults.length === 0) return [];

    const metrics: PerformanceCorrelation[] = [];
    
    // Confidence vs Actual Performance
    const confidenceValues = dataWithResults.map(d => d.predicted_confidence_initial || 0);
    const actualROI = dataWithResults.map(d => d.actual_profit_percentage || 0);
    const confidenceCorrelation = calculateCorrelation(confidenceValues, actualROI);
    
    metrics.push({
      metric: '신뢰도 vs 실제 수익률',
      correlation: confidenceCorrelation,
      description: '예측 신뢰도와 실제 수익률 간의 상관관계'
    });

    // VIX vs Performance
    const vixData = dataWithResults.filter(d => d.vix_level !== null);
    if (vixData.length > 5) {
      const vixValues = vixData.map(d => d.vix_level || 0);
      const vixROI = vixData.map(d => d.actual_profit_percentage || 0);
      const vixCorrelation = calculateCorrelation(vixValues, vixROI);
      
      metrics.push({
        metric: 'VIX vs 수익률',
        correlation: vixCorrelation,
        description: '시장 변동성과 예측 성과 간의 관계'
      });
    }

    // Decision Quality vs ROI
    const qualityData = dataWithResults.filter(d => d.decision_quality_score !== null);
    if (qualityData.length > 5) {
      const qualityValues = qualityData.map(d => d.decision_quality_score || 0);
      const qualityROI = qualityData.map(d => d.actual_profit_percentage || 0);
      const qualityCorrelation = calculateCorrelation(qualityValues, qualityROI);
      
      metrics.push({
        metric: '의사결정 품질 vs 수익률',
        correlation: qualityCorrelation,
        description: '의사결정 품질과 실제 성과 간의 연관성'
      });
    }

    return metrics;
  }, [data]);

  const radarChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const avgMetrics = {
      RSI: calculateAverage(data.map(d => d.rsi_accuracy_score || 0)) * 100,
      MACD: calculateAverage(data.map(d => d.macd_accuracy_score || 0)) * 100,
      MA: calculateAverage(data.map(d => d.ma_accuracy_score || 0)) * 100,
      신뢰도: calculateAverage(data.map(d => d.predicted_confidence_initial || 0)) * 100,
      품질: calculateAverage(data.filter(d => d.decision_quality_score).map(d => d.decision_quality_score || 0)) * 100,
      감정분석: calculateAverage(data.filter(d => d.sentiment_accuracy_score).map(d => d.sentiment_accuracy_score || 0)) * 100
    };

    return Object.entries(avgMetrics).map(([key, value]) => ({
      metric: key,
      value: Math.min(100, Math.max(0, value)),
      fullMark: 100
    }));
  }, [data]);

  const timeSeriesData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const monthlyData = data.reduce((acc, item) => {
      const month = new Date(item.analysis_date).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          month,
          predictions: [],
          confidence: [],
          accuracy: [],
          roi: []
        };
      }
      
      acc[month].predictions.push(item);
      acc[month].confidence.push(item.predicted_confidence_initial || 0);
      
      if (item.actual_profit_percentage !== null) {
        const predicted = (item.predicted_confidence_initial || 0) > 0.5;
        const actual = (item.actual_profit_percentage || 0) > 0;
        acc[month].accuracy.push(predicted === actual ? 1 : 0);
        acc[month].roi.push(item.actual_profit_percentage || 0);
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData)
      .map((data: any) => ({
        month: data.month,
        avgConfidence: calculateAverage(data.confidence) * 100,
        accuracy: data.accuracy.length > 0 ? calculateAverage(data.accuracy) * 100 : 0,
        avgROI: data.roi.length > 0 ? calculateAverage(data.roi) : 0,
        predictions: data.predictions.length
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">고급 분석을 위한 데이터가 부족합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Radar Chart */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-900/20 rounded-lg">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">종합 성과 레이더</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <PolarRadiusAxis 
                  angle={0} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Radar
                  name="성과"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">성과 지표 세부사항</h4>
            {radarChartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800 rounded p-3">
                <span className="text-sm text-gray-300">{item.metric}</span>
                <span className={`text-sm font-semibold ${
                  item.value >= 80 ? 'text-green-400' :
                  item.value >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {item.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-900/20 rounded-lg">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">상관관계 분석</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">지표 간 상관관계</h4>
            <div className="space-y-2">
              {correlationAnalysis.slice(0, 8).map((corr, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 rounded p-3">
                  <div className="flex-1">
                    <span className="text-sm text-gray-300">
                      {corr.indicator1} × {corr.indicator2}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      corr.significance === 'high' ? 'bg-red-400' :
                      corr.significance === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}></div>
                    <span className={`text-sm font-semibold ${
                      Math.abs(corr.correlation) > 0.7 ? 'text-red-400' :
                      Math.abs(corr.correlation) > 0.4 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">성과 연관성</h4>
            <div className="space-y-3">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-800 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{metric.metric}</span>
                    <span className={`text-sm font-bold ${
                      Math.abs(metric.correlation) > 0.5 ? 'text-purple-400' :
                      Math.abs(metric.correlation) > 0.3 ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {metric.correlation > 0 ? '+' : ''}{metric.correlation.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{metric.description}</p>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metric.correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.abs(metric.correlation) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Analysis */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-900/20 rounded-lg">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">시계열 성과 분석</h3>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short' })}
            />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelFormatter={(value) => `${value} 월`}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(1) : value,
                name === 'avgConfidence' ? '평균 신뢰도' :
                name === 'accuracy' ? '정확도' :
                name === 'avgROI' ? '평균 ROI' :
                name === 'predictions' ? '예측 수' : name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="avgConfidence" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgROI" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800 rounded p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-400">평균 신뢰도</span>
            </div>
            <span className="text-white font-semibold">
              {timeSeriesData.length > 0 ? calculateAverage(timeSeriesData.map(d => d.avgConfidence)).toFixed(1) : '0'}%
            </span>
          </div>
          <div className="bg-gray-800 rounded p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">평균 정확도</span>
            </div>
            <span className="text-white font-semibold">
              {timeSeriesData.length > 0 ? calculateAverage(timeSeriesData.map(d => d.accuracy)).toFixed(1) : '0'}%
            </span>
          </div>
          <div className="bg-gray-800 rounded p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-400">평균 ROI</span>
            </div>
            <span className="text-white font-semibold">
              {timeSeriesData.length > 0 ? calculateAverage(timeSeriesData.map(d => d.avgROI)).toFixed(2) : '0'}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}