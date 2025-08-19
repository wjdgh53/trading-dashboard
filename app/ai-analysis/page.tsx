'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, RefreshCw, Target, CheckCircle2, XCircle, History, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAILearningData } from '@/hooks/useAILearningData';
import { tradingHistoryService, completedTradesService } from '@/lib/supabase';
import { normalizeConfidenceScore, getConfidenceColorClass, getConfidenceBackgroundClass } from '@/lib/confidenceUtils';

export default function AIAnalysisPage() {
  const {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    hasData,
  } = useAILearningData();

  const [filters, setFilters] = useState({
    symbol: '',
    result: ''
  });

  // Trading History와 Completed Trades 데이터 상태 추가
  const [tradingHistoryData, setTradingHistoryData] = useState<any[]>([]);
  const [completedTradesData, setCompletedTradesData] = useState<any[]>([]);
  const [tradingHistoryLoading, setTradingHistoryLoading] = useState(false);
  
  // 드롭다운 상태 관리
  const [expandedTrades, setExpandedTrades] = useState<Set<number>>(new Set());
  
  // AI 코멘트 상세보기 상태 관리
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Trading History와 Completed Trades 데이터 가져오기
  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        setTradingHistoryLoading(true);
        const [historyData, completedData] = await Promise.all([
          tradingHistoryService.getAll(),
          completedTradesService.getAll()
        ]);
        setTradingHistoryData(historyData || []);
        setCompletedTradesData(completedData || []);
      } catch (err) {
        console.error('Trade data fetch error:', err);
      } finally {
        setTradingHistoryLoading(false);
      }
    };

    fetchTradeData();
  }, []);

  // 거래 결과 계산 함수
  const getTradeResult = (item: any) => {
    if (item.actual_profit_percentage === null || item.actual_profit_percentage === undefined) {
      return 'pending';
    }
    return item.actual_profit_percentage > 0 ? 'win' : 'loss';
  };

  // AI 신뢰도 계산 (헬퍼 함수 사용)
  const getConfidenceScore = (confidence: number) => {
    return normalizeConfidenceScore(confidence);
  };

  // 주요 결정 요인 추출 (초보자도 이해하기 쉽게)
  const getDecisionFactors = (item: any) => {
    const factors = [];
    
    // 기술적 지표를 쉬운 용어로 변환
    if (item.best_indicator) {
      const indicatorText = {
        'RSI': '매수/매도 타이밍',
        'MACD': '추세 변화',
        'MA': '평균가 기준',
        'rsi': '매수/매도 타이밍',
        'macd': '추세 변화', 
        'ma': '평균가 기준'
      }[item.best_indicator] || `${item.best_indicator} 지표`;
      factors.push(indicatorText);
    }
    
    // 시장 환경을 명확하게 표현
    if (item.market_regime) {
      const regimeText = {
        'bullish': '상승 시장',
        'bearish': '하락 시장', 
        'neutral': '보합 시장'
      }[item.market_regime] || item.market_regime;
      factors.push(regimeText);
    }
    
    // 감정 분석을 구체적으로 표현
    if (item.sentiment_accuracy_score && item.sentiment_accuracy_score > 0.7) {
      factors.push('좋은 뉴스/여론');
    }
    
    // VIX 수준 추가 (공포 지수)
    if (item.vix_level) {
      if (item.vix_level < 20) {
        factors.push('안정적 시장');
      } else if (item.vix_level > 30) {
        factors.push('불안한 시장');
      }
    }
    
    return factors.length > 0 ? factors.join(', ') : '복합 분석';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 중복 제거 및 필터링된 데이터 계산
  const deduplicatedData = data.reduce((acc, current) => {
    // symbol과 trade_date가 같은 중복 항목 체크
    const existingIndex = acc.findIndex(item => 
      item.symbol === current.symbol && 
      item.trade_date === current.trade_date
    );
    
    if (existingIndex >= 0) {
      // 중복이 있으면 더 최신의 analysis_date를 가진 것을 유지
      const existing = acc[existingIndex];
      const currentDate = new Date(current.analysis_date).getTime();
      const existingDate = new Date(existing.analysis_date).getTime();
      
      if (currentDate > existingDate) {
        acc[existingIndex] = current;
      }
    } else {
      acc.push(current);
    }
    
    return acc;
  }, [] as typeof data);

  const filteredData = deduplicatedData.filter(item => {
    if (filters.symbol && !item.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
      return false;
    }
    if (filters.result) {
      const result = getTradeResult(item);
      if (filters.result !== result) {
        return false;
      }
    }
    return true;
  });

  // 간단한 통계 계산
  const stats = {
    total: filteredData.length,
    wins: filteredData.filter(item => getTradeResult(item) === 'win').length,
    losses: filteredData.filter(item => getTradeResult(item) === 'loss').length,
    pending: filteredData.filter(item => getTradeResult(item) === 'pending').length,
  };
  
  const winRate = stats.total > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100) : 0;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      symbol: '',
      result: ''
    });
  };

  // 완료된 거래별로 거래 플로우 생성
  const getTradeFlows = () => {
    return completedTradesData
      .filter(completed => filters.symbol ? completed.symbol?.toLowerCase().includes(filters.symbol.toLowerCase()) : true)
      .map(completedTrade => {
        // 해당 종목의 거래 히스토리 찾기 (날짜순 정렬)
        const relatedHistory = tradingHistoryData
          .filter(history => history.symbol === completedTrade.symbol)
          .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());

        return {
          completedTrade,
          history: relatedHistory,
          symbol: completedTrade.symbol,
          totalDays: completedTrade.trade_date ? 
            Math.ceil((new Date(completedTrade.trade_date).getTime() - 
                      new Date(relatedHistory[0]?.trade_date || completedTrade.trade_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
        };
      })
      .sort((a, b) => new Date(b.completedTrade.trade_date).getTime() - new Date(a.completedTrade.trade_date).getTime());
  };

  // 드롭다운 토글 함수
  const toggleTradeExpansion = (tradeId: number) => {
    const newExpanded = new Set(expandedTrades);
    if (newExpanded.has(tradeId)) {
      newExpanded.delete(tradeId);
    } else {
      newExpanded.add(tradeId);
    }
    setExpandedTrades(newExpanded);
  };

  // AI 코멘트 토글 함수
  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="relative">
                <Brain className="w-8 h-8 text-purple-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI 거래 기록</h1>
                <p className="text-gray-400 text-sm">
                  간단하고 명확한 거래 결과 분석
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={loading}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-lg border transition-colors text-sm sm:text-base touch-manipulation ${
                  loading
                    ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'border-gray-600 bg-gray-800 text-white hover:border-gray-500 hover:bg-gray-700 active:bg-gray-600'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">새로고침</span>
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

          {/* 간단한 통계 요약 */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">승리</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-gray-400">패배</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">승률</span>
              </div>
              <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">총 거래</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
          </div>

          {/* 간단한 필터 */}
          <div className="mt-4 flex flex-wrap gap-3">
            <input
              type="text"
              value={filters.symbol}
              onChange={(e) => handleFilterChange('symbol', e.target.value)}
              placeholder="종목 검색 (예: AAPL)"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
            />
            
            <select
              value={filters.result}
              onChange={(e) => handleFilterChange('result', e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">모든 결과</option>
              <option value="win">승리만</option>
              <option value="loss">패배만</option>
              <option value="pending">진행중</option>
            </select>
            
            {(filters.symbol || filters.result) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
              >
                필터 초기화
              </button>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-400">
            {filteredData.length}개 거래 표시 중 
            {data.length !== deduplicatedData.length && (
              <span className="text-yellow-400 ml-2">
                ({data.length - deduplicatedData.length}개 중복 제거됨)
              </span>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">AI 분석 데이터를 로드하는 중...</p>
            </div>
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">AI 학습 데이터가 없습니다</p>
              <p className="text-gray-500 text-sm">예측 데이터가 수집되면 분석이 표시됩니다</p>
            </div>
          </div>
        ) : (
          <>
            {/* 간단한 거래 기록 테이블 */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 mb-8">
              <div className="p-4 sm:p-6 border-b border-gray-800">
                <h2 className="text-lg sm:text-xl font-bold text-white">AI 거래 기록</h2>
                <p className="text-sm text-gray-400 mt-1">승패, 결정 요인, 신뢰도를 한눈에</p>
              </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-3 text-gray-300 font-medium text-sm">종목</th>
                    <th className="text-left p-3 text-gray-300 font-medium text-sm">결과</th>
                    <th className="text-left p-3 text-gray-300 font-medium text-sm">수익률</th>
                    <th className="text-left p-3 text-gray-300 font-medium text-sm">AI 신뢰도</th>
                    <th className="text-left p-3 text-gray-300 font-medium text-sm">결정 요인</th>
                    <th className="text-left p-3 text-gray-300 font-medium text-sm">거래일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 50).map((trade) => {
                    const result = getTradeResult(trade);
                    const confidenceScore = getConfidenceScore(trade.predicted_confidence_initial || 0);
                    
                    return (
                      <tr key={trade.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3">
                          <span className="font-bold text-blue-400 text-sm">
                            {trade.symbol}
                          </span>
                        </td>
                        
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {result === 'win' && (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 font-medium text-sm">승리</span>
                              </>
                            )}
                            {result === 'loss' && (
                              <>
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 font-medium text-sm">패배</span>
                              </>
                            )}
                            {result === 'pending' && (
                              <>
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 font-medium text-sm">진행중</span>
                              </>
                            )}
                          </div>
                        </td>
                        
                        <td className="p-3">
                          {trade.actual_profit_percentage !== null ? (
                            <span className={`font-medium text-sm ${
                              trade.actual_profit_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.actual_profit_percentage > 0 ? '+' : ''}
                              {trade.actual_profit_percentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${
                              confidenceScore >= 80 ? 'text-green-400' :
                              confidenceScore >= 60 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {confidenceScore}점
                            </span>
                            <div className={`w-12 h-1.5 rounded-full ${
                              confidenceScore >= 80 ? 'bg-green-400' :
                              confidenceScore >= 60 ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}>
                              <div 
                                className="h-full bg-white/30 rounded-full" 
                                style={{ width: `${confidenceScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-3">
                          <span className="text-gray-300 text-sm">
                            {getDecisionFactors(trade)}
                          </span>
                        </td>
                        
                        <td className="p-3">
                          <span className="text-gray-400 text-sm">
                            {formatDate(trade.trade_date || trade.analysis_date)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  조건에 맞는 거래 기록이 없습니다.
                </div>
              )}
            </div>
            </div>

            {/* 거래 의사결정 과정 섹션 */}
            <div className="bg-gray-900 rounded-xl border border-gray-800">
              <div className="p-4 sm:p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-purple-400" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">거래 의사결정 과정</h2>
                    <p className="text-sm text-gray-400 mt-1">매수부터 매도까지 AI의 생각과 판단 과정</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {tradingHistoryLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400">거래 기록을 불러오는 중...</p>
                  </div>
                ) : completedTradesData.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">완료된 거래가 없습니다</p>
                    <p className="text-gray-500 text-sm">거래가 완료되면 AI의 의사결정 과정을 확인할 수 있습니다</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getTradeFlows().slice(0, 10).map((tradeFlow) => {
                      const isExpanded = expandedTrades.has(tradeFlow.completedTrade.id);
                      
                      return (
                        <div key={tradeFlow.completedTrade.id} className="bg-gray-800/30 rounded-xl border border-gray-700/50">
                          {/* 거래 요약 헤더 (클릭 가능) */}
                          <div 
                            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-700/20 transition-colors"
                            onClick={() => toggleTradeExpansion(tradeFlow.completedTrade.id)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-blue-400 text-lg">{tradeFlow.symbol}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                tradeFlow.completedTrade.profit_percentage >= 0 
                                  ? 'bg-green-600 text-green-100' 
                                  : 'bg-red-600 text-red-100'
                              }`}>
                                {tradeFlow.completedTrade.profit_percentage >= 0 ? '승리' : '패배'}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {tradeFlow.totalDays}일간 보유
                              </span>
                              <span className="text-gray-500 text-xs">
                                ({tradeFlow.history.length + 1}개 이벤트)
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`text-lg font-bold ${
                                  tradeFlow.completedTrade.profit_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {tradeFlow.completedTrade.profit_percentage >= 0 ? '+' : ''}
                                  {tradeFlow.completedTrade.profit_percentage?.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-500">
                                  {tradeFlow.completedTrade.realized_pnl >= 0 ? '+' : ''}
                                  ${tradeFlow.completedTrade.realized_pnl?.toFixed(2)}
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* 거래 플로우 타임라인 (펼쳤을 때만 표시) */}
                          {isExpanded && (
                            <div className="px-5 pb-4 space-y-2">
                          {/* 거래 히스토리 이벤트들 */}
                          {tradeFlow.history.map((history, index) => {
                            const isFirstEntry = index === 0;
                            const confidence = getConfidenceScore(history.ai_confidence || 0);
                            
                            return (
                              <div key={history.id} className="flex gap-3">
                                {/* 타임라인 도트 */}
                                <div className="flex flex-col items-center">
                                  <div className={`w-2.5 h-2.5 rounded-full ${
                                    isFirstEntry ? 'bg-green-400' : 'bg-yellow-400'
                                  }`} />
                                  {index < tradeFlow.history.length - 1 && (
                                    <div className="w-0.5 h-6 bg-gray-600 mt-1" />
                                  )}
                                </div>
                                
                                {/* 이벤트 내용 - 더 컴팩트하게 */}
                                <div className="flex-1 pb-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        isFirstEntry ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'
                                      }`}>
                                        {isFirstEntry ? '매수' : '체크'}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(history.trade_date).toLocaleDateString('ko-KR', { 
                                          month: 'short', 
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-300">
                                        {isFirstEntry ? (
                                          `${history.position_size}주 매수 @ $${history.entry_price}`
                                        ) : (
                                          `보유 ${history.position_size}주, 현재 $${history.current_price} (${history.unrealized_plpc >= 0 ? '+' : ''}${history.unrealized_plpc?.toFixed(1)}%)`
                                        )}
                                      </span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${getConfidenceBackgroundClass(confidence)}`}>
                                        AI {confidence}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* 디버깅: AI 코멘트 확인 */}
                                  {console.log('History AI Commentary:', history.ai_commentary, 'for history ID:', history.id)}
                                  
                                  {/* AI 코멘트 테스트 - 임시로 항상 표시 */}
                                  <div className="mb-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCommentExpansion(`history-${history.id}`);
                                      }}
                                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-2 transition-colors"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                      <span>AI 코멘트 ({history.ai_commentary ? '있음' : '없음'})</span>
                                      {expandedComments.has(`history-${history.id}`) ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </button>
                                    {expandedComments.has(`history-${history.id}`) && (
                                      <div className="bg-purple-900/20 border-l-2 border-purple-400 pl-3 py-2">
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                          {history.ai_commentary || '코멘트가 없습니다.'}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* 기술적 지표 */}
                                  <div className="text-xs text-gray-500">
                                    {[
                                      history.technical_recommendation && `기술적: ${history.technical_recommendation}`,
                                      history.sentiment_score && `감정: ${(history.sentiment_score * 100).toFixed(0)}점`,
                                      history.vix_level && `VIX: ${history.vix_level.toFixed(1)}`
                                    ].filter(Boolean).join(' • ')}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* 매도 완료 이벤트 */}
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            </div>
                            
                            <div className="flex-1 pb-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-red-100">
                                    매도
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(tradeFlow.completedTrade.trade_date).toLocaleDateString('ko-KR', { 
                                      month: 'short', 
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-300">
                                    {tradeFlow.completedTrade.sold_quantity}주 매도 @ ${tradeFlow.completedTrade.exit_price}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${getConfidenceBackgroundClass(getConfidenceScore(tradeFlow.completedTrade.ai_confidence || 0))}`}>
                                    AI {getConfidenceScore(tradeFlow.completedTrade.ai_confidence || 0)}%
                                  </span>
                                </div>
                              </div>

                              {/* AI 매도 사유 테스트 - 임시로 항상 표시 */}
                              <div className="mb-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCommentExpansion(`completed-${tradeFlow.completedTrade.id}`);
                                  }}
                                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-2 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>AI 매도 사유 ({tradeFlow.completedTrade.ai_reason ? '있음' : '없음'})</span>
                                  {expandedComments.has(`completed-${tradeFlow.completedTrade.id}`) ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                                {expandedComments.has(`completed-${tradeFlow.completedTrade.id}`) && (
                                  <div className="bg-purple-900/20 border-l-2 border-purple-400 pl-3 py-2">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                      {tradeFlow.completedTrade.ai_reason || '매도 사유가 없습니다.'}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="text-xs text-gray-500">
                                {[
                                  tradeFlow.completedTrade.rsi_signal && `RSI: ${tradeFlow.completedTrade.rsi_signal}`,
                                  tradeFlow.completedTrade.macd_signal && `MACD: ${tradeFlow.completedTrade.macd_signal}`,
                                  tradeFlow.completedTrade.vix_level && `VIX: ${tradeFlow.completedTrade.vix_level.toFixed(1)}`
                                ].filter(Boolean).join(' • ')}
                              </div>
                            </div>
                            </div>
                          </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}