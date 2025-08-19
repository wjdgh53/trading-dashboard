'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Activity, 
  BarChart3, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Zap,
  Filter,
  Calendar,
  Award,
  Shield,
  Clock,
  Percent,
  DollarSign,
  LineChart,
  PieChart,
  Settings,
  Info
} from 'lucide-react';
import { useAILearningData } from '@/hooks/useAILearningData';
import { useAdvancedTradingData } from '@/hooks/useAdvancedTradingData';
import { normalizeConfidenceScore } from '@/lib/confidenceUtils';

// Types for AI performance analysis
interface AIPerformanceMetrics {
  accuracyTrend: { date: string; accuracy: number }[];
  confidenceEvolution: { date: string; initial: number; final: number }[];
  indicatorRanking: { indicator: string; accuracy: number; signals: number }[];
  marketRegimePerformance: { regime: string; accuracy: number; count: number; roi: number }[];
  confidenceCalibration: { range: string; accuracy: number; count: number; overconfidence: number }[];
}

export default function AIExpertPage() {
  const {
    data: aiData,
    metrics: aiMetrics,
    loading: aiLoading,
    error: aiError,
    refreshData: refreshAIData,
    hasData: hasAIData,
    getBySymbol,
    getByDateRange,
  } = useAILearningData();

  const {
    filteredData: tradingData,
    metrics: tradingMetrics,
    loading: tradingLoading,
    refreshData: refreshTradingData,
  } = useAdvancedTradingData();

  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [symbolFilter, setSymbolFilter] = useState<string>('');
  const [debouncedSymbolFilter, setDebouncedSymbolFilter] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'confidence' | 'roi'>('accuracy');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Debounce symbol filter to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSymbolFilter(symbolFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [symbolFilter]);

  // Filter AI data based on time and symbol
  const filteredAIData = useMemo(() => {
    let filtered = aiData || [];

    // Time filter
    if (timeFilter !== 'all') {
      const days = parseInt(timeFilter);
      if (!isNaN(days) && days > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        filtered = filtered.filter(item => {
          const analysisDate = new Date(item.analysis_date);
          return !isNaN(analysisDate.getTime()) && analysisDate >= cutoffDate;
        });
      }
    }

    // Symbol filter with trim and validation (using debounced filter)
    if (debouncedSymbolFilter && debouncedSymbolFilter.trim()) {
      const trimmedFilter = debouncedSymbolFilter.trim().toLowerCase();
      filtered = filtered.filter(item => 
        item.symbol && item.symbol.toLowerCase().includes(trimmedFilter)
      );
    }

    return filtered;
  }, [aiData, timeFilter, debouncedSymbolFilter]);

  // Calculate advanced AI performance metrics
  const aiPerformanceMetrics = useMemo((): AIPerformanceMetrics => {
    if (filteredAIData.length === 0) {
      return {
        accuracyTrend: [],
        confidenceEvolution: [],
        indicatorRanking: [],
        marketRegimePerformance: [],
        confidenceCalibration: []
      };
    }

    // Accuracy trend over time (weekly aggregation)
    const accuracyTrend = filteredAIData
      .reduce((acc, item) => {
        const week = new Date(item.analysis_date).toISOString().slice(0, 10);
        if (!acc[week]) acc[week] = { correct: 0, total: 0 };
        
        if (item.actual_profit_percentage !== null) {
          acc[week].total++;
          if (item.actual_profit_percentage > 0) acc[week].correct++;
        }
        return acc;
      }, {} as Record<string, { correct: number; total: number }>)
    
    const accuracyData = Object.entries(accuracyTrend)
      .map(([date, stats]) => ({
        date,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12); // Last 12 weeks

    // Confidence evolution analysis
    const confidenceEvolution = filteredAIData
      .filter(item => item.predicted_confidence_initial && item.predicted_confidence_final)
      .reduce((acc, item) => {
        const week = new Date(item.analysis_date).toISOString().slice(0, 10);
        if (!acc[week]) acc[week] = { initialSum: 0, finalSum: 0, count: 0 };
        
        acc[week].initialSum += item.predicted_confidence_initial;
        acc[week].finalSum += item.predicted_confidence_final || item.predicted_confidence_initial;
        acc[week].count++;
        return acc;
      }, {} as Record<string, { initialSum: number; finalSum: number; count: number }>);

    const confidenceData = Object.entries(confidenceEvolution)
      .map(([date, stats]) => ({
        date,
        initial: stats.initialSum / stats.count,
        final: stats.finalSum / stats.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12);

    // Technical indicator ranking
    const indicatorStats = ['rsi', 'macd', 'ma'].map(indicator => {
      const accuracyField = `${indicator}_accuracy_score` as keyof typeof filteredAIData[0];
      const relevantData = filteredAIData.filter(item => item[accuracyField] !== null);
      
      const avgAccuracy = relevantData.length > 0 
        ? relevantData.reduce((sum, item) => sum + (item[accuracyField] as number || 0), 0) / relevantData.length
        : 0;

      return {
        indicator: indicator.toUpperCase(),
        accuracy: avgAccuracy * 100,
        signals: relevantData.length
      };
    }).sort((a, b) => b.accuracy - a.accuracy);

    // Market regime performance
    const regimeStats = ['bullish', 'bearish', 'neutral'].map(regime => {
      const regimeData = filteredAIData.filter(item => item.market_regime === regime);
      const withResults = regimeData.filter(item => item.actual_profit_percentage !== null);
      const accuracy = withResults.length > 0 
        ? (withResults.filter(item => item.actual_profit_percentage! > 0).length / withResults.length) * 100
        : 0;
      
      const avgROI = withResults.length > 0
        ? withResults.reduce((sum, item) => sum + (item.actual_profit_percentage || 0), 0) / withResults.length
        : 0;

      return {
        regime: regime === 'bullish' ? '상승장' : regime === 'bearish' ? '하락장' : '보합장',
        accuracy,
        count: regimeData.length,
        roi: avgROI
      };
    });

    // Confidence calibration analysis
    const confidenceRanges = [
      { min: 0, max: 50, label: '0-50%' },
      { min: 50, max: 60, label: '50-60%' },
      { min: 60, max: 70, label: '60-70%' },
      { min: 70, max: 80, label: '70-80%' },
      { min: 80, max: 100, label: '80-100%' }
    ];

    const calibrationData = confidenceRanges.map(range => {
      const rangeData = filteredAIData.filter(item => {
        // 신뢰도를 정규화 (헬퍼 함수 사용)
        const confidence = normalizeConfidenceScore(item.predicted_confidence_initial);
        return confidence >= range.min && confidence < range.max;
      });
      
      const withResults = rangeData.filter(item => item.actual_profit_percentage !== null);
      const accuracy = withResults.length > 0 
        ? (withResults.filter(item => item.actual_profit_percentage! > 0).length / withResults.length) * 100
        : 0;
      
      const overconfidence = Math.max(0, (range.min + range.max) / 2 - accuracy);

      return {
        range: range.label,
        accuracy,
        count: rangeData.length,
        overconfidence
      };
    });

    return {
      accuracyTrend: accuracyData,
      confidenceEvolution: confidenceData,
      indicatorRanking: indicatorStats,
      marketRegimePerformance: regimeStats,
      confidenceCalibration: calibrationData
    };
  }, [filteredAIData]);

  // Key insights and recommendations
  const insights = useMemo(() => {
    const insights = [];
    
    if (aiPerformanceMetrics.indicatorRanking.length > 0) {
      const bestIndicator = aiPerformanceMetrics.indicatorRanking[0];
      insights.push({
        type: 'success',
        title: '최고 성능 지표',
        message: `${bestIndicator.indicator} 지표가 ${bestIndicator.accuracy.toFixed(1)}% 정확도로 최고 성능을 보입니다.`,
        icon: Award
      });
    }

    if (aiMetrics.overconfidenceRate > 0.3) {
      insights.push({
        type: 'warning',
        title: '과신 경고',
        message: `AI가 ${(aiMetrics.overconfidenceRate * 100).toFixed(1)}% 확률로 과신하고 있습니다. 신뢰도 70% 이하에서 더 신중한 투자를 권장합니다.`,
        icon: AlertCircle
      });
    }

    const recentAccuracy = aiPerformanceMetrics.accuracyTrend.slice(-3);
    if (recentAccuracy.length >= 2) {
      const trend = recentAccuracy[recentAccuracy.length - 1].accuracy - recentAccuracy[0].accuracy;
      if (trend > 5) {
        insights.push({
          type: 'success',
          title: '성능 향상',
          message: `최근 AI 정확도가 ${trend.toFixed(1)}%p 향상되었습니다.`,
          icon: TrendingUp
        });
      } else if (trend < -5) {
        insights.push({
          type: 'warning',
          title: '성능 하락',
          message: `최근 AI 정확도가 ${Math.abs(trend).toFixed(1)}%p 하락했습니다. 시장 변화를 재분석할 필요가 있습니다.`,
          icon: TrendingDown
        });
      }
    }

    if (aiMetrics.avgDecisionQuality > 0.8) {
      insights.push({
        type: 'info',
        title: '높은 결정 품질',
        message: `AI의 평균 결정 품질이 ${(aiMetrics.avgDecisionQuality * 100).toFixed(1)}%로 우수합니다.`,
        icon: Shield
      });
    }

    return insights;
  }, [aiPerformanceMetrics, aiMetrics]);

  const loading = aiLoading || tradingLoading;

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 bg-gray-700 rounded" />
        <div className="h-3 bg-gray-700 rounded w-20" />
      </div>
      <div className="h-8 bg-gray-700 rounded w-16" />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <header className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center gap-4 mb-4 lg:mb-0">
                <div className="relative">
                  <Brain className="w-10 h-10 text-purple-400 opacity-50" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400/50 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="h-8 bg-gray-800 rounded w-48 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded w-72 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Filter Skeleton */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
              <div className="h-10 bg-gray-800 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-800 rounded w-48 animate-pulse" />
              <div className="h-10 bg-gray-800 rounded w-32 animate-pulse" />
            </div>

            {/* Key Performance Summary Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </header>

          {/* Content area with loading spinner */}
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">AI 성능 데이터를 분석하는 중...</p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (aiError) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="relative mb-6">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                <div className="absolute inset-0 w-16 h-16 mx-auto border border-red-400/20 rounded-full animate-ping" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">데이터 로딩 오류</h2>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                AI 성능 데이터를 불러오는 중 문제가 발생했습니다.
              </p>
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-6">
                <p className="text-red-300 text-sm">{aiError}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={refreshAIData}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 시도
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 active:bg-gray-900 transition-colors font-medium"
                >
                  페이지 새로고침
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAIData) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-lg">
              <div className="relative mb-8">
                <Brain className="w-20 h-20 text-gray-600 mx-auto" />
                <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-dashed border-gray-700 rounded-full animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">AI 학습 데이터가 없습니다</h2>
              <p className="text-gray-400 text-base mb-6 leading-relaxed">
                AI가 거래 데이터를 학습하면 여기에 상세한 성능 분석과 인사이트가 표시됩니다.
                투자를 시작하시면 AI의 학습 과정을 실시간으로 확인할 수 있습니다.
              </p>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-gray-400">예측 정확도 분석</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-gray-400">기술 지표 성능</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-gray-400">수익률 분석</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  refreshAIData();
                  refreshTradingData();
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                데이터 새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 lg:mb-0">
              <div className="relative">
                <Brain className="w-10 h-10 text-purple-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI 성능 분석</h1>
                <p className="text-gray-400">인공지능의 학습 진행과 투자 성과를 종합 분석</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  refreshAIData();
                  refreshTradingData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">새로고침</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                aria-label="시간 필터"
                className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:border-gray-500 transition-all w-full sm:w-auto"
              >
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
                <option value="90d">최근 90일</option>
                <option value="all">전체 기간</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
                placeholder="종목 필터 (예: AAPL)"
                aria-label="종목 필터"
                className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:border-gray-500 transition-all w-full sm:w-48"
              />
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
              <BarChart3 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                aria-label="분석 지표 선택"
                className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 hover:border-gray-500 transition-all w-full sm:w-auto"
              >
                <option value="accuracy">정확도 중심</option>
                <option value="confidence">신뢰도 중심</option>
                <option value="roi">수익률 중심</option>
              </select>
            </div>
          </div>

          {/* Key Performance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">전체 정확도</span>
              </div>
              <div className="text-xl font-bold text-green-400">
                {aiMetrics.overallAccuracy.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">평균 신뢰도</span>
              </div>
              <div className="text-xl font-bold text-blue-400">
                {(aiMetrics.avgConfidenceLevel * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">vs 시장 수익</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">
                +{aiMetrics.avgROIvsMarket.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">예측 건수</span>
              </div>
              <div className="text-xl font-bold text-white">
                {aiMetrics.totalPredictions}
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">결정 품질</span>
              </div>
              <div className="text-xl font-bold text-orange-400">
                {(aiMetrics.avgDecisionQuality * 100).toFixed(0)}점
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">과신 비율</span>
              </div>
              <div className="text-xl font-bold text-red-400">
                {(aiMetrics.overconfidenceRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </header>

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              핵심 인사이트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'success' ? 'bg-green-900/20 border-green-900/50' :
                    insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-900/50' :
                    'bg-blue-900/20 border-blue-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <insight.icon className={`w-5 h-5 mt-0.5 ${
                      insight.type === 'success' ? 'text-green-400' :
                      insight.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-white text-sm mb-1">{insight.title}</h3>
                      <p className="text-gray-300 text-xs leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Technical Indicators Performance */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                기술적 지표 성능
              </h3>
              <p className="text-gray-400 text-sm mt-1">각 지표별 예측 정확도와 신호 개수</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiPerformanceMetrics.indicatorRanking.map((indicator, index) => (
                  <div key={indicator.indicator} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-900' :
                        'bg-amber-600 text-amber-100'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-white">{indicator.indicator}</span>
                      <span className="text-gray-400 text-sm">({indicator.signals}개 신호)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          style={{ width: `${Math.min(indicator.accuracy, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white w-12 text-right">
                        {indicator.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Regime Performance */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-400" />
                시장 환경별 성과
              </h3>
              <p className="text-gray-400 text-sm mt-1">상승장, 하락장, 보합장에서의 AI 성능</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiPerformanceMetrics.marketRegimePerformance.map((regime) => (
                  <div key={regime.regime} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        regime.regime === '상승장' ? 'bg-green-400' :
                        regime.regime === '하락장' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`} />
                      <span className="font-medium text-white">{regime.regime}</span>
                      <span className="text-gray-400 text-sm">({regime.count}회)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {regime.accuracy.toFixed(1)}% 정확도
                      </div>
                      <div className={`text-xs ${regime.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {regime.roi >= 0 ? '+' : ''}{regime.roi.toFixed(1)}% 평균 수익
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Calibration Analysis */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-8">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              신뢰도 정확성 분석
            </h3>
            <p className="text-gray-400 text-sm mt-1">AI의 자신감과 실제 성과 비교 (이상적으로는 신뢰도와 정확도가 일치해야 함)</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {aiPerformanceMetrics.confidenceCalibration.map((cal) => (
                <div key={cal.range} className="text-center">
                  <div className="text-sm text-gray-400 mb-2">{cal.range} 신뢰도</div>
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white">{cal.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">실제 정확도</div>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {cal.count}개 예측
                  </div>
                  {cal.overconfidence > 5 && (
                    <div className="text-xs text-red-400">
                      {cal.overconfidence.toFixed(1)}%p 과신
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Accuracy Trend */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-green-400" />
                정확도 추이
              </h3>
              <p className="text-gray-400 text-sm mt-1">시간에 따른 AI 예측 정확도 변화</p>
            </div>
            <div className="p-6">
              {aiPerformanceMetrics.accuracyTrend.length > 0 ? (
                <div className="space-y-3">
                  {aiPerformanceMetrics.accuracyTrend.map((point, index) => (
                    <div key={point.date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {new Date(point.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${point.accuracy}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white w-12 text-right">
                          {point.accuracy.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  데이터가 충분하지 않습니다
                </div>
              )}
            </div>
          </div>

          {/* Confidence Evolution */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                신뢰도 진화
              </h3>
              <p className="text-gray-400 text-sm mt-1">초기 vs 최종 신뢰도 비교 (학습 효과)</p>
            </div>
            <div className="p-6">
              {aiPerformanceMetrics.confidenceEvolution.length > 0 ? (
                <div className="space-y-3">
                  {aiPerformanceMetrics.confidenceEvolution.map((point) => (
                    <div key={point.date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {new Date(point.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">초기</div>
                          <div className="text-sm font-medium text-blue-300">
                            {point.initial.toFixed(0)}%
                          </div>
                        </div>
                        <div className="w-6 h-0.5 bg-gray-600" />
                        <div className="text-right">
                          <div className="text-xs text-gray-400">최종</div>
                          <div className={`text-sm font-medium ${
                            point.final > point.initial ? 'text-green-400' : 
                            point.final < point.initial ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {point.final.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  신뢰도 진화 데이터가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-800/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            AI 최적화 권장사항
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="font-medium text-white text-sm">신뢰도 임계값</span>
              </div>
              <p className="text-gray-300 text-sm">
                70% 이상 신뢰도에서 투자하면 {aiPerformanceMetrics.confidenceCalibration.find(c => c.range === '70-80%')?.accuracy.toFixed(1) || '75'}% 정확도 기대
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="font-medium text-white text-sm">최적 지표</span>
              </div>
              <p className="text-gray-300 text-sm">
                {aiPerformanceMetrics.indicatorRanking[0]?.indicator || 'RSI'} 지표를 우선적으로 활용 권장
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white text-sm">시장 타이밍</span>
              </div>
              <p className="text-gray-300 text-sm">
                {aiPerformanceMetrics.marketRegimePerformance.sort((a, b) => b.accuracy - a.accuracy)[0]?.regime || '상승장'}에서 가장 높은 성과
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}