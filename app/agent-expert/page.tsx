'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Info,
  ToggleLeft,
  ToggleRight,
  Star,
  Bell
} from 'lucide-react';
import { useAILearningData } from '@/hooks/useAILearningData';
import { useAdvancedTradingData } from '@/hooks/useAdvancedTradingData';
import { normalizeConfidenceScore, normalizePercentage, formatPercentage } from '@/lib/confidenceUtils';

export default function AIExpertPage() {
  const {
    data: aiData,
    metrics: aiMetrics,
    loading: aiLoading,
    error: aiError,
    refreshData: refreshAIData,
    hasData: hasAIData,
  } = useAILearningData();

  const {
    data: tradingData,
    loading: tradingLoading,
    error: tradingError,
    refreshData: refreshTradingData,
  } = useAdvancedTradingData();

  // 전문가 모드 토글
  const [expertMode, setExpertMode] = useState(false);

  // 시간 및 심볼 필터
  const [timeFilter, setTimeFilter] = useState('30d');
  const [symbolFilter, setSymbolFilter] = useState('');

  // 로딩 상태
  const loading = aiLoading || tradingLoading;
  const error = aiError || tradingError;

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!aiData) return [];
    
    let filtered = aiData;
    
    // 심볼 필터
    if (symbolFilter.trim()) {
      filtered = filtered.filter(item => 
        item.symbol?.toLowerCase().includes(symbolFilter.toLowerCase())
      );
    }
    
    // 시간 필터
    if (timeFilter !== 'all') {
      const days = parseInt(timeFilter.replace('d', ''));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.analysis_date || item.trade_date);
        return itemDate >= cutoffDate;
      });
    }
    
    return filtered;
  }, [aiData, symbolFilter, timeFilter]);

  // 핵심 성과 지표 계산
  const coreMetrics = useMemo(() => {
    if (!filteredData.length) {
      return { winRate: 0, monthlyReturn: 0, totalTrades: 0 };
    }

    const completedTrades = filteredData.filter(item => 
      item.actual_profit_percentage !== null && item.actual_profit_percentage !== undefined
    );

    const winRate = completedTrades.length > 0 
      ? (completedTrades.filter(item => item.actual_profit_percentage! > 0).length / completedTrades.length) * 100
      : 0;

    const monthlyReturn = completedTrades.length > 0
      ? completedTrades.reduce((sum, item) => sum + (item.actual_profit_percentage || 0), 0) / completedTrades.length
      : 0;

    return {
      winRate: normalizePercentage(winRate),
      monthlyReturn: normalizePercentage(monthlyReturn),
      totalTrades: filteredData.length
    };
  }, [filteredData]);

  // 모의 추천 종목 (실제 구현 시 AI 데이터 기반)
  const mockRecommendations = [
    {
      symbol: 'AAPL',
      action: 'buy',
      confidence: 85,
      reason: '기술적 반등 + 실적 기대감',
      change: '+2.3%'
    },
    {
      symbol: 'TSLA', 
      action: 'watch',
      confidence: 65,
      reason: '변동성 높음, 진입 타이밍 대기',
      change: '-1.2%'
    },
    {
      symbol: 'META',
      action: 'sell',
      confidence: 78,
      reason: '추가 하락 가능성 70%',
      change: '-8.2%'
    }
  ];

  // 모의 주간 성과 데이터
  const weeklyData = [
    { day: '월', return: 2.1, trades: 2 },
    { day: '화', return: -1.3, trades: 1 },
    { day: '수', return: 3.2, trades: 3 },
    { day: '목', return: 1.8, trades: 2 },
    { day: '금', return: 0, trades: 0 }
  ];

  // 새로고침 함수
  const handleRefresh = () => {
    refreshAIData();
    refreshTradingData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">AI 투자 도우미를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-4">데이터를 불러올 수 없습니다</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="relative">
              <Brain className="w-10 h-10 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">🎯 AI 투자 도우미</h1>
              <p className="text-gray-400">쉽고 똑똑한 투자 결정을 도와드려요</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 모드 전환 토글 */}
            <button
              onClick={() => setExpertMode(!expertMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                expertMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {expertMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {expertMode ? '간단 모드' : '전문가 모드'}
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white hover:border-gray-500 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {!expertMode ? (
          // 일반 사용자용 간단 UI
          <div>
            {/* 핵심 지표 3개 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* 승률 */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{formatPercentage(coreMetrics.winRate)}</div>
                    <div className="text-green-300 text-sm">승률</div>
                  </div>
                </div>
                <div className="text-xs text-green-200">AI가 맞춘 비율</div>
              </div>

              {/* 이번 달 수익 */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">+{formatPercentage(coreMetrics.monthlyReturn)}</div>
                    <div className="text-blue-300 text-sm">이번 달 수익률</div>
                  </div>
                </div>
                <div className="text-xs text-blue-200">평균 거래 수익률</div>
              </div>

              {/* 총 거래 건수 */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{coreMetrics.totalTrades}</div>
                    <div className="text-purple-300 text-sm">총 예측 건수</div>
                  </div>
                </div>
                <div className="text-xs text-purple-200">누적 투자 결정</div>
              </div>
            </div>

            {/* 오늘의 AI 추천 액션 */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30 p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                🎯 오늘의 AI 추천 액션
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRecommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`${
                      rec.action === 'buy' ? 'bg-green-500/10 border-green-500/30' :
                      rec.action === 'watch' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-red-500/10 border-red-500/30'
                    } border rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        rec.action === 'buy' ? 'bg-green-500/20' :
                        rec.action === 'watch' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {rec.action === 'buy' ? <TrendingUp className="w-4 h-4 text-green-400" /> :
                         rec.action === 'watch' ? <Eye className="w-4 h-4 text-yellow-400" /> :
                         <AlertCircle className="w-4 h-4 text-red-400" />}
                      </div>
                      <span className={`font-medium ${
                        rec.action === 'buy' ? 'text-green-400' :
                        rec.action === 'watch' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {rec.action === 'buy' ? '강력 매수 신호' :
                         rec.action === 'watch' ? '관망 추천' :
                         '손절 검토'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{rec.symbol}</span>
                        <span className={`text-sm ${
                          rec.action === 'sell' ? 'text-red-400' :
                          rec.change.includes('+') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {rec.action === 'sell' ? rec.change : `${rec.confidence}% 신뢰도`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">"{rec.reason}"</p>
                      <button className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                        rec.action === 'buy' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        rec.action === 'watch' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                        'bg-red-600 hover:bg-red-700 text-white'
                      }`}>
                        {rec.action === 'buy' ? '매수 검토' :
                         rec.action === 'watch' ? '지켜보기' :
                         '매도 검토'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 이번 주 성과 & TOP 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 이번 주 성과 */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  이번 주 성과
                </h3>
                <div className="flex justify-between items-center mb-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm text-gray-400">{day.day}</div>
                      <div className={`text-lg font-bold ${
                        day.return > 0 ? 'text-green-400' : 
                        day.return < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {day.return === 0 ? '대기' : 
                         `${day.return > 0 ? '+' : ''}${day.return}%`}
                      </div>
                      <div className={`w-8 h-1 rounded mx-auto mt-1 ${
                        day.return > 0 ? 'bg-green-500' : 
                        day.return < 0 ? 'bg-red-500' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">주간 총 수익:</span>
                  <span className="text-green-400 font-bold">+5.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">승률:</span>
                  <span className="text-blue-400 font-bold">75% (3승 1패)</span>
                </div>
              </div>

              {/* TOP 3 종목 */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  이번 달 TOP 3
                </h3>
                <div className="space-y-3">
                  {[
                    { rank: 1, symbol: 'NVDA', return: 15.2, period: '3주 보유', color: 'bg-yellow-400 text-yellow-900' },
                    { rank: 2, symbol: 'AAPL', return: 8.7, period: '1주 보유', color: 'bg-gray-300 text-gray-900' },
                    { rank: 3, symbol: 'MSFT', return: 6.1, period: '2주 보유', color: 'bg-amber-600 text-amber-100' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 ${item.color} rounded-full flex items-center justify-center text-xs font-bold`}>
                          {item.rank}
                        </div>
                        <span className="font-medium text-white">{item.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">+{item.return}%</div>
                        <div className="text-xs text-gray-400">{item.period}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 전문가 모드 (기존 복잡한 UI)
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl text-gray-400 mb-2">전문가 모드 개발 중</h2>
            <p className="text-gray-500">복잡한 차트와 고급 분석 도구를 준비하고 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}