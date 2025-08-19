'use client';

import { useState, useCallback } from 'react';
import { completedTradesService, tradingHistoryService, aiLearningService } from '@/lib/supabase';
import type { CompletedTrades, TradingHistory, AiLearningData } from '@/types/database.types';
import type { AILearningData } from '@/types/ai-learning.types';

// 거래 타임라인 이벤트 타입
export type TimelineEventType = 'buy' | 'check' | 'sell' | 'ai_analysis';

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description: string;
  data: any; // 원본 데이터
  decision_factors: string[]; // 결정 요인들
  confidence?: number;
  result?: {
    pnl?: number;
    percentage?: number;
  };
}

export interface TradeTimeline {
  symbol: string;
  events: TimelineEvent[];
  summary: {
    total_days: number;
    buy_date: string;
    sell_date?: string;
    final_pnl?: number;
    final_percentage?: number;
    status: 'completed' | 'active';
  };
}

export function useTradeTimeline() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 거래 타임라인 데이터 수집
  const getTradeTimeline = useCallback(async (symbol: string): Promise<TradeTimeline | null> => {
    try {
      setLoading(true);
      setError(null);

      // 1. 완료된 거래 정보 조회
      const completedTrades = await completedTradesService.getAll();
      const completedTrade = completedTrades?.find(trade => trade.symbol === symbol);

      // 2. 거래 히스토리 조회 (같은 종목의 모든 기록)
      const tradingHistory = await tradingHistoryService.getBySymbol(symbol);

      // 3. AI 학습 데이터 조회 (AILearningData 타입 사용)
      const aiData: AILearningData[] = await aiLearningService.getBySymbol(symbol);

      if (!completedTrade && (!tradingHistory || tradingHistory.length === 0)) {
        return null;
      }

      const events: TimelineEvent[] = [];

      // 4. Trading History 이벤트 추가 (매수 및 체크업 기록)
      if (tradingHistory && tradingHistory.length > 0) {
        // 날짜순 정렬
        const sortedHistory = tradingHistory.sort((a, b) => 
          new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
        );

        sortedHistory.forEach((history, index) => {
          const isFirstEntry = index === 0;
          
          events.push({
            id: `history-${history.id}`,
            date: history.trade_date,
            type: isFirstEntry ? 'buy' : 'check',
            title: isFirstEntry ? '매수 결정' : '포지션 체크',
            description: generateHistoryDescription(history, isFirstEntry),
            data: history,
            decision_factors: extractHistoryDecisionFactors(history),
            confidence: history.ai_confidence,
          });
        });
      }

      // 5. AI 분석 이벤트 추가
      if (aiData && aiData.length > 0) {
        aiData.forEach(ai => {
          events.push({
            id: `ai-${ai.id}`,
            date: ai.analysis_date || ai.created_at, // AILearningData에는 prediction_date 대신 analysis_date 사용
            type: 'ai_analysis',
            title: 'AI 분석 업데이트',
            description: generateAiAnalysisDescription(ai),
            data: ai,
            decision_factors: extractAiDecisionFactors(ai),
            confidence: ai.predicted_confidence_initial ? ai.predicted_confidence_initial * 100 : undefined,
          });
        });
      }

      // 6. 완료된 거래 이벤트 추가 (매도)
      if (completedTrade) {
        events.push({
          id: `completed-${completedTrade.id}`,
          date: completedTrade.exit_date || completedTrade.trade_date,
          type: 'sell',
          title: '매도 완료',
          description: generateCompletedTradeDescription(completedTrade),
          data: completedTrade,
          decision_factors: extractCompletedTradeDecisionFactors(completedTrade),
          confidence: completedTrade.ai_confidence,
          result: {
            pnl: completedTrade.realized_pnl,
            percentage: completedTrade.profit_percentage,
          },
        });
      }

      // 7. 이벤트 날짜순 정렬
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 8. 요약 정보 생성
      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];
      const buyDate = firstEvent?.date || '';
      const sellDate = completedTrade ? (completedTrade.exit_date || completedTrade.trade_date) : undefined;
      
      const totalDays = sellDate ? 
        Math.ceil((new Date(sellDate).getTime() - new Date(buyDate).getTime()) / (1000 * 60 * 60 * 24)) : 
        Math.ceil((new Date().getTime() - new Date(buyDate).getTime()) / (1000 * 60 * 60 * 24));

      return {
        symbol,
        events,
        summary: {
          total_days: totalDays,
          buy_date: buyDate,
          sell_date: sellDate,
          final_pnl: completedTrade?.realized_pnl,
          final_percentage: completedTrade?.profit_percentage,
          status: completedTrade ? 'completed' : 'active',
        },
      };

    } catch (err) {
      console.error('Error fetching trade timeline:', err);
      setError('거래 타임라인을 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getTradeTimeline,
    loading,
    error,
  };
}

// Helper functions for generating descriptions and decision factors

function generateHistoryDescription(history: TradingHistory, isFirstEntry: boolean): string {
  if (isFirstEntry) {
    return `${history.symbol} ${history.position_size}주를 $${history.entry_price}에 매수`;
  }
  
  const unrealizedPnl = history.unrealized_pl || 0;
  const pnlText = unrealizedPnl >= 0 ? `+$${unrealizedPnl.toFixed(2)} 수익` : `-$${Math.abs(unrealizedPnl).toFixed(2)} 손실`;
  return `포지션 체크 - 현재가 $${history.current_price}, ${pnlText}`;
}

function generateCompletedTradeDescription(trade: CompletedTrades): string {
  const pnlText = trade.realized_pnl >= 0 ? 
    `+$${trade.realized_pnl.toFixed(2)} 수익` : 
    `-$${Math.abs(trade.realized_pnl).toFixed(2)} 손실`;
  return `${trade.symbol} ${trade.sold_quantity}주를 $${trade.exit_price}에 매도 - ${pnlText} (${trade.profit_percentage.toFixed(1)}%)`;
}

function generateAiAnalysisDescription(ai: AILearningData): string {
  const confidence = ai.predicted_confidence_initial ? `신뢰도 ${(ai.predicted_confidence_initial * 100).toFixed(0)}%` : '';
  return `AI 분석 업데이트 - ${ai.market_regime || '시장 분석'} ${confidence}`;
}

function extractHistoryDecisionFactors(history: TradingHistory): string[] {
  const factors: string[] = [];
  
  // 기술적 권장사항
  if (history.technical_recommendation) {
    factors.push(`기술적 분석: ${history.technical_recommendation}`);
  }
  
  // 감정 점수
  if (history.sentiment_score !== undefined && history.sentiment_score !== null) {
    const sentiment = history.sentiment_score > 0.6 ? '긍정적' : 
                     history.sentiment_score < 0.4 ? '부정적' : '중립적';
    factors.push(`시장 감정: ${sentiment} (${(history.sentiment_score * 100).toFixed(0)}점)`);
  }
  
  // 종합 점수
  if (history.combined_score !== undefined && history.combined_score !== null) {
    factors.push(`종합 점수: ${history.combined_score.toFixed(1)}점`);
  }
  
  return factors.length > 0 ? factors : ['복합 지표 분석'];
}

function extractCompletedTradeDecisionFactors(trade: CompletedTrades): string[] {
  const factors: string[] = [];
  
  // RSI 신호
  if (trade.rsi_signal) {
    factors.push(`RSI: ${trade.rsi_signal}`);
  }
  
  // MACD 신호
  if (trade.macd_signal) {
    factors.push(`MACD: ${trade.macd_signal}`);
  }
  
  // 감정 점수
  if (trade.sentiment_score !== undefined && trade.sentiment_score !== null) {
    const sentiment = trade.sentiment_score > 0.6 ? '긍정적' : 
                     trade.sentiment_score < 0.4 ? '부정적' : '중립적';
    factors.push(`시장 감정: ${sentiment} (${(trade.sentiment_score * 100).toFixed(0)}점)`);
  }
  
  // VIX 레벨
  if (trade.vix_level !== undefined && trade.vix_level !== null) {
    const vixLevel = trade.vix_level < 20 ? '안정적 시장' :
                     trade.vix_level > 30 ? '불안정한 시장' : '보통 시장';
    factors.push(`${vixLevel} (VIX ${trade.vix_level.toFixed(1)})`);
  }
  
  // AI 신뢰도
  if (trade.ai_confidence !== undefined && trade.ai_confidence !== null) {
    factors.push(`AI 신뢰도: ${trade.ai_confidence.toFixed(0)}점`);
  }
  
  return factors.length > 0 ? factors : ['종합 분석'];
}

function extractAiDecisionFactors(ai: AILearningData): string[] {
  const factors: string[] = [];
  
  // 시장 체제
  if (ai.market_regime) {
    const regime = ai.market_regime === 'bullish' ? '상승장' :
                   ai.market_regime === 'bearish' ? '하락장' : '보합세';
    factors.push(`시장 환경: ${regime}`);
  }
  
  // 최적 지표
  if (ai.best_indicator) {
    factors.push(`최적 지표: ${ai.best_indicator}`);
  }
  
  // RSI 정확도
  if (ai.rsi_accuracy_score !== undefined && ai.rsi_accuracy_score !== null) {
    factors.push(`RSI 신뢰도: ${(ai.rsi_accuracy_score * 100).toFixed(0)}%`);
  }
  
  // MACD 정확도
  if (ai.macd_accuracy_score !== undefined && ai.macd_accuracy_score !== null) {
    factors.push(`MACD 신뢰도: ${(ai.macd_accuracy_score * 100).toFixed(0)}%`);
  }
  
  // VIX 레벨
  if (ai.vix_level !== undefined && ai.vix_level !== null) {
    const vixLevel = ai.vix_level < 20 ? '안정적 시장' :
                     ai.vix_level > 30 ? '불안정한 시장' : '보통 시장';
    factors.push(`${vixLevel} (VIX ${ai.vix_level.toFixed(1)})`);
  }
  
  return factors.length > 0 ? factors : ['AI 종합 분석'];
}