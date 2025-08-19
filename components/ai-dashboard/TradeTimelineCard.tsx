'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, TrendingUp, TrendingDown, Brain, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useTradeTimeline, TimelineEvent, TradeTimeline } from '@/hooks/useTradeTimeline';
import { 
  translateTradeResult, 
  translatePositionStatus, 
  translateHoldingPeriod,
  translateConfidenceScore 
} from '@/lib/decisionFactors';

interface TradeTimelineCardProps {
  symbol: string;
  completedTrade?: any;
  onTimelineToggle?: (isExpanded: boolean) => void;
}

export function TradeTimelineCard({ symbol, completedTrade, onTimelineToggle }: TradeTimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeline, setTimeline] = useState<TradeTimeline | null>(null);
  const { getTradeTimeline, loading, error } = useTradeTimeline();

  const handleToggleExpand = async () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onTimelineToggle?.(newExpanded);

    if (newExpanded && !timeline) {
      const timelineData = await getTradeTimeline(symbol);
      setTimeline(timelineData);
    }
  };

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'check':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'ai_analysis':
        return <Brain className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventBorderColor = (event: TimelineEvent) => {
    switch (event.type) {
      case 'buy':
        return 'border-green-400';
      case 'sell':
        return event.result && event.result.pnl! > 0 ? 'border-green-400' : 'border-red-400';
      case 'check':
        return 'border-yellow-400';
      case 'ai_analysis':
        return 'border-purple-400';
      default:
        return 'border-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 거래 요약 정보 표시
  const renderTradeSummary = () => {
    if (!completedTrade) return null;

    const result = translateTradeResult(completedTrade.profit_percentage, completedTrade.realized_pnl);
    
    return (
      <div className="flex items-center justify-between p-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-400 text-xl">{symbol}</span>
            <span className="text-3xl">{result.emoji}</span>
          </div>
          
          <div className="flex flex-col">
            <span className={`font-semibold text-lg ${
              completedTrade.profit_percentage >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {completedTrade.profit_percentage >= 0 ? '+' : ''}{completedTrade.profit_percentage.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-400">
              {completedTrade.profit_percentage >= 0 ? '+' : ''}${completedTrade.realized_pnl.toFixed(2)}
            </span>
          </div>
          
          <div className="hidden md:flex flex-col text-sm text-gray-400">
            <span>AI 신뢰도</span>
            <span className="font-medium text-white">{completedTrade.ai_confidence?.toFixed(0) || 0}점</span>
          </div>
        </div>
        
        <button
          onClick={handleToggleExpand}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
            isExpanded 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
          }`}
        >
          <span>{isExpanded ? '접기' : '상세 과정'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };

  // 타임라인 이벤트 렌더링
  const renderTimelineEvent = (event: TimelineEvent, isLast: boolean) => {
    return (
      <div key={event.id} className="flex gap-4 relative group">
        {/* 타임라인 라인 */}
        {!isLast && (
          <div className="absolute left-6 top-14 w-px h-full bg-gray-700 group-hover:bg-gray-600 transition-colors" />
        )}
        
        {/* 이벤트 아이콘 */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 ${getEventBorderColor(event)} bg-gray-800 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
          {getEventIcon(event)}
        </div>
        
        {/* 이벤트 내용 */}
        <div className="flex-1 pb-6">
          <div className="bg-gray-800 hover:bg-gray-750 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white text-base">{event.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                  {formatDate(event.date)}
                </span>
              </div>
            </div>
            
            {/* 설명 */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{event.description}</p>
            
            {/* 결정요인들 */}
            {event.decision_factors.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  결정 요인
                </h5>
                <div className="flex flex-wrap gap-2">
                  {event.decision_factors.map((factor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full text-xs text-gray-200 border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 신뢰도 및 결과 */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {event.confidence && (
                <div className="flex items-center gap-2 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-800/50">
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 font-medium">
                    신뢰도 {event.confidence.toFixed(0)}%
                  </span>
                </div>
              )}
              
              {event.result && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border font-medium ${
                  event.result.pnl! >= 0 
                    ? 'bg-green-900/30 border-green-800/50 text-green-300' 
                    : 'bg-red-900/30 border-red-800/50 text-red-300'
                }`}>
                  {event.result.pnl! >= 0 ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span>
                    {event.result.pnl! >= 0 ? '+' : ''}${event.result.pnl?.toFixed(2)} 
                    ({event.result.percentage! >= 0 ? '+' : ''}{event.result.percentage?.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 타임라인 요약 정보
  const renderTimelineSummary = () => {
    if (!timeline) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <h4 className="font-semibold text-white mb-3">거래 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">보유 기간</span>
            <div className="font-medium text-white">
              {translateHoldingPeriod(timeline.summary.total_days)}
            </div>
          </div>
          
          <div>
            <span className="text-gray-400">매수일</span>
            <div className="font-medium text-white">
              {new Date(timeline.summary.buy_date).toLocaleDateString('ko-KR')}
            </div>
          </div>
          
          {timeline.summary.sell_date && (
            <div>
              <span className="text-gray-400">매도일</span>
              <div className="font-medium text-white">
                {new Date(timeline.summary.sell_date).toLocaleDateString('ko-KR')}
              </div>
            </div>
          )}
          
          <div>
            <span className="text-gray-400">상태</span>
            <div className={`font-medium ${
              timeline.summary.status === 'completed' ? 'text-blue-400' : 'text-yellow-400'
            }`}>
              {timeline.summary.status === 'completed' ? '완료됨' : '진행중'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl">
      {/* 메인 거래 정보 */}
      {renderTradeSummary()}
      
      {/* 확장된 타임라인 */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-600">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative">
                  <Brain className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
                  <div className="absolute inset-0 w-10 h-10 border-2 border-purple-400/20 rounded-full mx-auto animate-pulse"></div>
                </div>
                <p className="text-gray-400 text-lg">거래 과정을 분석하는 중...</p>
                <p className="text-gray-500 text-sm mt-1">잠시만 기다려주세요</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center bg-red-900/20 border border-red-800/50 rounded-lg p-6">
                <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 font-medium mb-2">데이터 로딩 실패</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {timeline && (
            <div className="space-y-6">
              {renderTimelineSummary()}
              
              {/* 타임라인 이벤트들 */}
              <div className="relative">
                <div className="flex items-center gap-3 mb-6 bg-gray-800/50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">거래 의사결정 과정</h4>
                    <p className="text-gray-400 text-sm">시간순으로 정렬된 거래 판단 과정</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {timeline.events.map((event, index) => 
                    renderTimelineEvent(event, index === timeline.events.length - 1)
                  )}
                </div>
                
                {timeline.events.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-gray-800/50 rounded-lg p-8">
                      <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">거래 과정 데이터가 없습니다</p>
                      <p className="text-gray-500 text-sm">데이터가 수집되면 상세한 분석을 확인할 수 있습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}