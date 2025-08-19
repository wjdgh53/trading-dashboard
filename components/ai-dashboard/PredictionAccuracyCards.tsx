'use client';

import React from 'react';
import { Target, TrendingUp, AlertTriangle, Award, Brain, Zap } from 'lucide-react';
import { AIAnalyticsMetrics } from '@/types/ai-learning.types';

interface PredictionAccuracyCardsProps {
  metrics: AIAnalyticsMetrics;
  loading: boolean;
}

export default function PredictionAccuracyCards({ metrics, loading }: PredictionAccuracyCardsProps) {
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDecimal = (value: number) => {
    return value.toFixed(3);
  };

  const cards = [
    {
      title: '전체 예측 정확도',
      value: formatPercentage(metrics.overallAccuracy),
      icon: Target,
      color: metrics.overallAccuracy >= 70 ? 'text-green-400' : 
             metrics.overallAccuracy >= 50 ? 'text-yellow-400' : 'text-red-400',
      bgColor: metrics.overallAccuracy >= 70 ? 'bg-green-900/20 border-green-900/50' : 
               metrics.overallAccuracy >= 50 ? 'bg-yellow-900/20 border-yellow-900/50' : 'bg-red-900/20 border-red-900/50',
      description: `${metrics.totalPredictions}개 예측 중`,
      trend: metrics.overallAccuracy >= 60 ? 'up' : 'down'
    },
    {
      title: '평균 신뢰도',
      value: formatPercentage(metrics.avgConfidenceLevel * 100),
      icon: Brain,
      color: metrics.avgConfidenceLevel >= 0.8 ? 'text-blue-400' : 
             metrics.avgConfidenceLevel >= 0.6 ? 'text-cyan-400' : 'text-purple-400',
      bgColor: 'bg-blue-900/20 border-blue-900/50',
      description: 'AI 예측 신뢰도',
      trend: metrics.avgConfidenceLevel >= 0.7 ? 'up' : 'neutral'
    },
    {
      title: '시장 대비 수익률',
      value: formatPercentage(metrics.avgROIvsMarket),
      icon: TrendingUp,
      color: metrics.avgROIvsMarket >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: metrics.avgROIvsMarket >= 0 ? 'bg-green-900/20 border-green-900/50' : 'bg-red-900/20 border-red-900/50',
      description: '시장 대비 성과',
      trend: metrics.avgROIvsMarket >= 0 ? 'up' : 'down'
    },
    {
      title: '위험 조정 수익률',
      value: formatDecimal(metrics.avgRiskAdjustedReturn),
      icon: Award,
      color: metrics.avgRiskAdjustedReturn >= 0 ? 'text-emerald-400' : 'text-orange-400',
      bgColor: 'bg-emerald-900/20 border-emerald-900/50',
      description: '샤프 비율 기준',
      trend: metrics.avgRiskAdjustedReturn >= 0 ? 'up' : 'down'
    },
    {
      title: '과신 비율',
      value: formatPercentage(metrics.overconfidenceRate),
      icon: AlertTriangle,
      color: metrics.overconfidenceRate <= 20 ? 'text-green-400' : 
             metrics.overconfidenceRate <= 40 ? 'text-yellow-400' : 'text-red-400',
      bgColor: metrics.overconfidenceRate <= 20 ? 'bg-green-900/20 border-green-900/50' : 
               metrics.overconfidenceRate <= 40 ? 'bg-yellow-900/20 border-yellow-900/50' : 'bg-red-900/20 border-red-900/50',
      description: '과도한 신뢰도 탐지',
      trend: metrics.overconfidenceRate <= 30 ? 'up' : 'down'
    },
    {
      title: '의사결정 품질',
      value: `${(metrics.avgDecisionQuality * 100).toFixed(0)}점`,
      icon: Zap,
      color: metrics.avgDecisionQuality >= 0.8 ? 'text-purple-400' : 
             metrics.avgDecisionQuality >= 0.6 ? 'text-indigo-400' : 'text-gray-400',
      bgColor: 'bg-purple-900/20 border-purple-900/50',
      description: '평균 결정 품질',
      trend: metrics.avgDecisionQuality >= 0.7 ? 'up' : 'neutral'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">예측 성능 요약</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span>실시간 분석</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gray-900 rounded-xl border p-4 md:p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg ${card.bgColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gray-800 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`text-xs font-medium ${
                  card.trend === 'up' ? 'text-green-400' : 
                  card.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {card.trend === 'up' ? '↗' : card.trend === 'down' ? '↘' : '→'}
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-300">
                  {card.title}
                </h3>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick insights */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">빠른 인사이트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-400">최고 성과 지표</p>
            <p className="text-white font-medium">
              {metrics.indicatorPerformance.rsi >= metrics.indicatorPerformance.macd && 
               metrics.indicatorPerformance.rsi >= metrics.indicatorPerformance.ma ? 'RSI' :
               metrics.indicatorPerformance.macd >= metrics.indicatorPerformance.ma ? 'MACD' : 'MA'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400">주요 시장 환경</p>
            <p className="text-white font-medium">
              {metrics.marketRegimeAnalysis.bullish >= metrics.marketRegimeAnalysis.bearish && 
               metrics.marketRegimeAnalysis.bullish >= metrics.marketRegimeAnalysis.neutral ? '강세장' :
               metrics.marketRegimeAnalysis.bearish >= metrics.marketRegimeAnalysis.neutral ? '약세장' : '횡보장'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400">변동성 환경</p>
            <p className="text-white font-medium">
              {metrics.volatilityEnvironment.high >= metrics.volatilityEnvironment.medium && 
               metrics.volatilityEnvironment.high >= metrics.volatilityEnvironment.low ? '고변동성' :
               metrics.volatilityEnvironment.medium >= metrics.volatilityEnvironment.low ? '중간변동성' : '저변동성'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}