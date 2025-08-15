'use client';

import { useState, useEffect, useCallback } from 'react';
import { completedTradesService, tradingHistoryService } from '@/lib/supabase';
import type { CompletedTrades, TradingHistory } from '@/types/database.types';

interface SimpleTradingMetrics {
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  totalWins: number;
  totalLosses: number;
  activePositions: number;
}

interface SimpleTradeData {
  id: number;
  symbol: string;
  entry_price: number;
  exit_price?: number;
  realized_pnl?: number;
  profit_percentage?: number;
  win_loss?: string;
  exit_date?: string;
  current_price?: number;
  position_size?: number;
  ai_confidence?: number;
  trade_date?: string;
}

interface SimpleDataState {
  metrics: SimpleTradingMetrics;
  completedTrades: SimpleTradeData[];
  activeTrades: SimpleTradeData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useSimpleTradingData() {
  const [state, setState] = useState<SimpleDataState>({
    metrics: {
      totalTrades: 0,
      totalPnL: 0,
      winRate: 0,
      totalWins: 0,
      totalLosses: 0,
      activePositions: 0,
    },
    completedTrades: [],
    activeTrades: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Only 2 API calls as requested
      const [completedTradesData, tradingHistoryData] = await Promise.all([
        completedTradesService.getAll(),
        tradingHistoryService.getAll(),
      ]);

      // Process completed trades data
      const completedTrades: SimpleTradeData[] = (completedTradesData || []).map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        realized_pnl: trade.realized_pnl,
        profit_percentage: trade.profit_percentage,
        win_loss: trade.win_loss?.toLowerCase(),
        exit_date: trade.trade_date,
      }));

      // Process active trades data (filter for active positions)
      const activeTrades: SimpleTradeData[] = (tradingHistoryData || [])
        .filter(trade => trade.position_size && trade.position_size > 0)
        .map(trade => ({
          id: trade.id,
          symbol: trade.symbol,
          entry_price: trade.entry_price,
          current_price: trade.current_price,
          position_size: trade.position_size,
          ai_confidence: Math.min(Math.max(trade.ai_confidence || 0, 0), 100),
          trade_date: trade.trade_date,
        }));

      // Calculate metrics
      const totalTrades = completedTrades.length;
      const totalWins = completedTrades.filter(trade => trade.win_loss === 'win').length;
      const totalLosses = completedTrades.filter(trade => trade.win_loss === 'loss').length;
      const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
      const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0);
      const activePositions = activeTrades.length;

      const metrics: SimpleTradingMetrics = {
        totalTrades,
        totalPnL: Math.round(totalPnL * 100) / 100,
        winRate: Math.round(winRate * 100) / 100,
        totalWins,
        totalLosses,
        activePositions,
      };

      setState({
        metrics,
        completedTrades: completedTrades.slice(0, 10), // Show only recent 10 trades
        activeTrades: activeTrades.slice(0, 10), // Show only recent 10 active trades
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error('Error fetching simple trading data:', err);
      setState(prev => ({
        ...prev,
        error: '데이터를 불러오는데 실패했습니다. 다시 시도해주세요.',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}