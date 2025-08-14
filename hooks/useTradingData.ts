'use client';

import { useState, useEffect, useCallback } from 'react';
import { completedTradesService, tradingHistoryService, aiLearningService } from '@/lib/supabase';
import type { CompletedTrades, TradingHistory, AiLearningData } from '@/types/database.types';

interface TradingDataState {
  completedTrades: CompletedTrades[];
  tradingHistory: TradingHistory[];
  aiLearningData: AiLearningData[];
  symbols: string[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface TradingDataHook extends TradingDataState {
  refetch: () => Promise<void>;
}

export function useTradingData(): TradingDataHook {
  const [state, setState] = useState<TradingDataState>({
    completedTrades: [],
    tradingHistory: [],
    aiLearningData: [],
    symbols: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  // Helper function to validate and cap AI confidence
  const validateAIConfidence = (confidence?: number) => {
    if (!confidence) return 0;
    // Cap confidence at 100% and handle potential bad data
    return Math.min(Math.max(confidence, 0), 100);
  };

  // Helper function to clean trading data
  const cleanTradingData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      ai_confidence: validateAIConfidence(item.ai_confidence)
    }));
  };

  const fetchAllData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [completedTradesData, tradingHistoryData, aiLearningDataResult] = await Promise.all([
        completedTradesService.getAll(),
        tradingHistoryService.getAll(),
        aiLearningService.getAll(),
      ]);

      // Clean and validate data
      const cleanedCompletedTrades = cleanTradingData(completedTradesData || []);
      const cleanedTradingHistory = cleanTradingData(tradingHistoryData || []);
      const cleanedAiLearningData = aiLearningDataResult || [];

      // Extract unique symbols
      const symbolSet = new Set([
        ...cleanedCompletedTrades.map(t => t.symbol),
        ...cleanedTradingHistory.map(t => t.symbol),
        ...cleanedAiLearningData.map(t => t.symbol),
      ]);
      const allSymbols = Array.from(symbolSet).sort();

      setState(prev => ({
        ...prev,
        completedTrades: cleanedCompletedTrades,
        tradingHistory: cleanedTradingHistory,
        aiLearningData: cleanedAiLearningData,
        symbols: allSymbols,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      }));
    } catch (err) {
      console.error('Error fetching trading data:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load trading data. Please try again.',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...state,
    refetch: fetchAllData,
  };
}

// Hook for filtered data
export function useFilteredTradingData(
  data: TradingDataState,
  filters: {
    symbol: string;
    dateFrom: string;
    dateTo: string;
    winLoss: 'all' | 'win' | 'loss';
  }
) {
  const getFilteredData = useCallback(<T extends { 
    symbol: string; 
    exit_date?: string; 
    trade_date?: string; 
    prediction_date?: string; 
    win_loss?: string;
  }>(
    dataArray: T[]
  ) => {
    return dataArray.filter(item => {
      // Symbol filter
      if (filters.symbol !== 'all' && item.symbol !== filters.symbol) return false;
      
      // Date filter
      const itemDate = item.exit_date || item.trade_date || item.prediction_date;
      if (itemDate) {
        if (filters.dateFrom && new Date(itemDate) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(itemDate) > new Date(filters.dateTo)) return false;
      }
      
      // Win/Loss filter (only for completed trades)
      if (filters.winLoss !== 'all' && 'win_loss' in item && item.win_loss !== filters.winLoss) return false;
      
      return true;
    });
  }, [filters]);

  return {
    filteredCompletedTrades: getFilteredData(data.completedTrades),
    filteredTradingHistory: getFilteredData(data.tradingHistory),
    filteredAiLearningData: getFilteredData(data.aiLearningData),
  };
}

// Hook for calculating metrics
export function useCalculatedMetrics(trades: CompletedTrades[]) {
  return useCallback(() => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalPnL: 0,
        winRate: 0,
        averageReturn: 0,
        bestTrade: 0,
        worstTrade: 0,
        totalWins: 0,
        totalLosses: 0,
      };
    }

    const totalTrades = trades.length;
    const totalWins = trades.filter(trade => trade.win_loss === 'win').length;
    const totalLosses = totalTrades - totalWins;
    const winRate = (totalWins / totalTrades) * 100;
    const totalPnL = trades.reduce((sum, trade) => sum + trade.realized_pnl, 0);
    const averageReturn = trades.reduce((sum, trade) => sum + trade.profit_percentage, 0) / totalTrades;
    const pnlValues = trades.map(trade => trade.realized_pnl);
    const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
    const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

    return {
      totalTrades,
      totalPnL: Math.round(totalPnL * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      averageReturn: Math.round(averageReturn * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      totalWins,
      totalLosses,
    };
  }, [trades])();
}