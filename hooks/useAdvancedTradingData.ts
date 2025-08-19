'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { completedTradesService, tradingHistoryService } from '@/lib/supabase';
import type { CompletedTrades, TradingHistory } from '@/types/database.types';
import { TradingDataCacheService } from '@/lib/tradingDataCache';
import { errorHandler } from '@/lib/errorHandling';
import { tradingDataUtils } from '@/lib/tradingDataUtils';

// Date filter types
export type DateFilterPeriod = 'today' | '7days' | '30days' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  period: DateFilterPeriod;
  dateRange?: DateRange;
  symbol?: string;
  winLoss?: 'win' | 'loss';
}

// Enhanced trading metrics with filtering support
export interface AdvancedTradingMetrics {
  totalInvestment: number;
  totalRecovery: number;
  netPnL: number;
  totalTrades: number;
  winRate: number;
  totalWins: number;
  totalLosses: number;
  activePositions: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
  filteredPeriod: string;
}

// Enhanced trade data with additional fields
export interface AdvancedTradeData {
  id: number;
  symbol: string;
  entry_price: number;
  exit_price?: number;
  position_size: number;
  realized_pnl?: number;
  profit_percentage?: number;
  win_loss?: string;
  exit_date?: string;
  trade_date: string;
  current_price?: number;
  ai_confidence?: number;
  unrealized_pl?: number;
  type: 'completed' | 'active';
  // 새로 추가된 필드들
  purchase_amount?: number;  // 매수금액: entry_price × position_size
  sale_amount?: number;      // 매도금액: exit_price × position_size
}

// Cache management interface
interface DataCache {
  completedTrades: AdvancedTradeData[];
  activeTrades: AdvancedTradeData[];
  lastFullUpdate: Date;
  lastIncrementalUpdate: Date;
  isValid: boolean;
}

// Main data state
interface AdvancedDataState {
  allData: {
    completed: AdvancedTradeData[];
    active: AdvancedTradeData[];
  };
  filteredData: {
    completed: AdvancedTradeData[];
    active: AdvancedTradeData[];
  };
  metrics: AdvancedTradingMetrics;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  cacheStatus: 'cold' | 'warm' | 'hot';
  isFiltering: boolean;
}

// Legacy cache interface for backward compatibility
interface DataCache {
  completedTrades: AdvancedTradeData[];
  activeTrades: AdvancedTradeData[];
  lastFullUpdate: Date;
  lastIncrementalUpdate: Date;
  isValid: boolean;
}

// Use optimized utilities from tradingDataUtils
const { filter: filterUtils, calculation: calculationUtils, date: dateUtils, amount: amountUtils } = tradingDataUtils;

export function useAdvancedTradingData() {
  const [state, setState] = useState<AdvancedDataState>({
    allData: { completed: [], active: [] },
    filteredData: { completed: [], active: [] },
    metrics: {
      totalInvestment: 0,
      totalRecovery: 0,
      netPnL: 0,
      totalTrades: 0,
      winRate: 0,
      totalWins: 0,
      totalLosses: 0,
      activePositions: 0,
      averageReturn: 0,
      bestTrade: 0,
      worstTrade: 0,
      filteredPeriod: '전체',
    },
    loading: true,
    error: null,
    lastUpdated: null,
    cacheStatus: 'cold',
    isFiltering: false,
  });

  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    period: '30days',
  });

  const cacheRef = useRef(TradingDataCacheService.getInstance());
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Transform API data to internal format
  const transformCompletedTrades = useCallback((trades: CompletedTrades[]): AdvancedTradeData[] => {
    return trades.map(trade => {
      // Debug: 매도수량이 실제 매수수량과 같은지 확인 필요
      // 일반적으로 completed_trades에서 sold_quantity는 전체 포지션을 매도한 것으로 가정
      // 따라서 sold_quantity = 원래 매수한 수량으로 간주
      const originalPositionSize = trade.sold_quantity;
      
      console.log(`Transform completed trade ${trade.id}: sold_quantity=${trade.sold_quantity}, entry_price=${trade.entry_price}`);
      
      // 매수금액과 매도금액 계산
      const purchase_amount = amountUtils.calculatePurchaseAmount(trade.entry_price, originalPositionSize);
      const sale_amount = amountUtils.calculateSaleAmount(trade.exit_price, originalPositionSize);
      
      return {
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        position_size: originalPositionSize, // 매수 시점의 수량 (= 매도한 수량)
        realized_pnl: trade.realized_pnl,
        profit_percentage: trade.profit_percentage,
        win_loss: trade.win_loss?.toLowerCase() as 'win' | 'loss',
        exit_date: trade.exit_date || trade.trade_date,
        trade_date: trade.trade_date,
        ai_confidence: trade.ai_confidence,
        type: 'completed' as const,
        purchase_amount,
        sale_amount,
      };
    });
  }, []);

  const transformActiveTrades = useCallback((trades: TradingHistory[]): AdvancedTradeData[] => {
    // 활성거래에서 중복 제거: 같은 종목의 가장 최신 거래만 유지
    const uniqueTrades = trades
      .filter(trade => trade.position_size && trade.position_size > 0)
      .reduce((acc, trade) => {
        const existing = acc[trade.symbol];
        if (!existing || new Date(trade.trade_date) > new Date(existing.trade_date)) {
          acc[trade.symbol] = trade;
        }
        return acc;
      }, {} as Record<string, TradingHistory>);
    
    return Object.values(uniqueTrades).map(trade => {
      // 활성 거래에서는 매수금액만 계산 (아직 매도하지 않았으므로)
      const purchase_amount = amountUtils.calculatePurchaseAmount(trade.entry_price, trade.position_size);
      
      return {
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        current_price: trade.current_price,
        position_size: trade.position_size,
        trade_date: trade.trade_date,
        ai_confidence: Math.min(Math.max(trade.ai_confidence || 0, 0), 100),
        unrealized_pl: trade.unrealized_pl,
        type: 'active' as const,
        purchase_amount,
        // sale_amount는 활성 거래에서는 undefined (아직 매도하지 않음)
      };
    });
  }, []);

  // Full data fetch with simplified error handling
  const fetchFullData = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, cacheStatus: 'cold' }));

      const [completedTradesData, tradingHistoryData] = await Promise.all([
        completedTradesService.getAll(),
        tradingHistoryService.getAll(),
      ]);

      const completedTrades = transformCompletedTrades(completedTradesData || []);
      const activeTrades = transformActiveTrades(tradingHistoryData || []);

      // Debug logging for data loading
      console.log('=== DEBUG: Data Loading ===');
      console.log('Raw completed trades from API:', completedTradesData?.length || 0);
      console.log('Raw trading history from API:', tradingHistoryData?.length || 0);
      console.log('Transformed completed trades:', completedTrades.length);
      console.log('Transformed active trades:', activeTrades.length);
      console.log('Sample raw completed trade:', completedTradesData?.[0]);
      console.log('Sample transformed completed trade:', completedTrades[0]);

      // Update cache using advanced cache service
      await cacheRef.current.setFullCache(completedTrades, activeTrades);

      const allData = { completed: completedTrades, active: activeTrades };
      const filteredCompleted = filterUtils.filterTrades(completedTrades, currentFilters);
      const filteredActive = filterUtils.filterTrades(activeTrades, currentFilters);
      const filteredData = { completed: filteredCompleted, active: filteredActive };
      const metrics = calculationUtils.calculateTradingMetrics(filteredCompleted, filteredActive, currentFilters);

      setState(prev => ({
        ...prev,
        allData,
        filteredData,
        metrics,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        cacheStatus: 'hot',
      }));

    } catch (error) {
      console.error('Failed to fetch data:', error);
      
      // Try to use cached data if available
      const cachedData = cacheRef.current.getAllData();
      if (cachedData.completed.length > 0 || cachedData.active.length > 0) {
        const allData = cachedData;
        const filteredCompleted = filterUtils.filterTrades(cachedData.completed, currentFilters);
        const filteredActive = filterUtils.filterTrades(cachedData.active, currentFilters);
        const filteredData = { completed: filteredCompleted, active: filteredActive };
        const metrics = calculationUtils.calculateTradingMetrics(filteredCompleted, filteredActive, currentFilters);

        setState(prev => ({
          ...prev,
          allData,
          filteredData,
          metrics,
          loading: false,
          error: 'Using cached data due to network issues',
          lastUpdated: new Date(),
          cacheStatus: 'warm',
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        error: '데이터를 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.',
        loading: false,
        cacheStatus: 'cold',
      }));
    }
  }, [currentFilters, transformCompletedTrades, transformActiveTrades]);

  // Incremental data fetch for new trades only
  const fetchIncrementalData = useCallback(async (): Promise<void> => {
    if (!cacheRef.current.isValid()) {
      await fetchFullData();
      return;
    }

    try {
      const cacheStats = cacheRef.current.getStatistics();
      const lastUpdate = cacheStats.lastIncrementalUpdate.toISOString();
      
      // Fetch only new data since last update
      const [newCompletedTrades, newTradingHistory] = await Promise.all([
        completedTradesService.getAll(), // In production, add date filter: getByDate(lastUpdate)
        tradingHistoryService.getAll(),   // In production, add date filter: getByDate(lastUpdate)
      ]);

      // Filter for truly new data
      const newCompleted = transformCompletedTrades(
        (newCompletedTrades || []).filter(trade => 
          new Date(trade.created_at || trade.trade_date) > cacheStats.lastIncrementalUpdate
        )
      );

      const newActive = transformActiveTrades(
        (newTradingHistory || []).filter(trade => 
          new Date(trade.created_at || trade.trade_date) > cacheStats.lastIncrementalUpdate
        )
      );

      if (newCompleted.length > 0 || newActive.length > 0) {
        // Update cache with new data
        await cacheRef.current.updateIncrementalCache(newCompleted, newActive);
        
        const allData = cacheRef.current.getAllData();
        const filteredCompleted = filterUtils.filterTrades(allData.completed, currentFilters);
        const filteredActive = filterUtils.filterTrades(allData.active, currentFilters);
        const filteredData = { completed: filteredCompleted, active: filteredActive };
        const metrics = calculationUtils.calculateTradingMetrics(filteredCompleted, filteredActive, currentFilters);

        setState(prev => ({
          ...prev,
          allData,
          filteredData,
          metrics,
          lastUpdated: new Date(),
          cacheStatus: 'hot',
        }));
      }

    } catch (error) {
      console.error('Failed to fetch incremental data:', error);
      // Continue with existing cached data
    }
  }, [currentFilters, fetchFullData, transformCompletedTrades, transformActiveTrades]);

  // Apply filters to cached data (instant filtering)
  const applyFilters = useCallback((filters: FilterOptions): void => {
    setState(prev => ({ ...prev, isFiltering: true }));

    if (!cacheRef.current.isValid()) {
      setCurrentFilters(filters);
      fetchFullData();
      return;
    }

    const allData = cacheRef.current.getAllData();
    const filteredCompleted = filterUtils.filterTrades(allData.completed, filters);
    const filteredActive = filterUtils.filterTrades(allData.active, filters);
    const metrics = calculationUtils.calculateTradingMetrics(filteredCompleted, filteredActive, filters);

    setState(prev => ({
      ...prev,
      filteredData: { completed: filteredCompleted, active: filteredActive },
      metrics,
      isFiltering: false,
    }));

    setCurrentFilters(filters);
  }, [fetchFullData]);

  // Auto-refresh with incremental updates
  useEffect(() => {
    const cache = cacheRef.current;
    
    if (!cache.isValid()) {
      fetchFullData();
    } else {
      // Use cached data immediately
      const allData = cache.getAllData();
      const filteredCompleted = filterUtils.filterTrades(allData.completed, currentFilters);
      const filteredActive = filterUtils.filterTrades(allData.active, currentFilters);
      const filteredData = { completed: filteredCompleted, active: filteredActive };
      const metrics = calculationUtils.calculateTradingMetrics(filteredCompleted, filteredActive, currentFilters);
      const cacheStats = cache.getStatistics();

      setState(prev => ({
        ...prev,
        allData,
        filteredData,
        metrics,
        loading: false,
        lastUpdated: cacheStats.lastFullUpdate,
        cacheStatus: 'warm',
      }));
    }

    // Set up 5-minute incremental updates
    const intervalId = setInterval(() => {
      if (cache.needsIncrementalUpdate()) {
        fetchIncrementalData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [currentFilters, fetchFullData, fetchIncrementalData]);

  // Memoized computed values for performance
  const computedValues = useMemo(() => {
    const cacheStats = cacheRef.current.getStatistics();
    return {
      hasData: state.allData.completed.length > 0 || state.allData.active.length > 0,
      totalDataPoints: state.allData.completed.length + state.allData.active.length,
      filteredDataPoints: state.filteredData.completed.length + state.filteredData.active.length,
      cacheAge: state.lastUpdated ? Date.now() - state.lastUpdated.getTime() : 0,
      cacheHitRate: cacheStats.cacheHitRate,
      memoryUsage: cacheStats.memoryUsage,
      uniqueSymbols: cacheRef.current.getUniqueSymbols(),
      dataDateRange: cacheRef.current.getDataDateRange(),
    };
  }, [state.allData, state.filteredData, state.lastUpdated]);

  return {
    // Data
    ...state,
    
    // Computed values
    ...computedValues,
    
    // Filter state
    currentFilters,
    
    // Actions
    applyFilters,
    refreshData: fetchFullData,
    refreshIncremental: fetchIncrementalData,
    clearCache: () => {
      cacheRef.current.clearCache();
      setState(prev => ({ ...prev, cacheStatus: 'cold' }));
    },
    
    // Additional utility methods
    getSymbolPerformance: () => {
      const allCompleted = cacheRef.current.getTradesByType('completed');
      return calculationUtils.calculateSymbolPerformance(allCompleted);
    },
    
    getDailyPnLData: () => {
      const allCompleted = cacheRef.current.getTradesByType('completed');
      return calculationUtils.calculateDailyPnL(allCompleted);
    },
    
    getCacheStatistics: () => cacheRef.current.getStatistics(),
    
    getErrorAnalytics: () => errorHandler.getAnalytics(),
  };
}