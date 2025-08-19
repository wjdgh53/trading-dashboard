'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiLearningService } from '@/lib/supabase';
import { AILearningData, AIAnalyticsMetrics } from '@/types/ai-learning.types';
import { errorHandling } from '@/lib/errorHandling';

interface UseAILearningDataReturn {
  data: AILearningData[];
  metrics: AIAnalyticsMetrics;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  hasData: boolean;
  totalDataPoints: number;
  getBySymbol: (symbol: string) => Promise<AILearningData[]>;
  getByDateRange: (startDate: string, endDate: string) => Promise<AILearningData[]>;
}

export function useAILearningData(userId?: string): UseAILearningDataReturn {
  const [data, setData] = useState<AILearningData[]>([]);
  const [metrics, setMetrics] = useState<AIAnalyticsMetrics>({
    totalPredictions: 0,
    overallAccuracy: 0,
    avgConfidenceLevel: 0,
    avgROIvsMarket: 0,
    avgRiskAdjustedReturn: 0,
    indicatorPerformance: { rsi: 0, macd: 0, ma: 0 },
    marketRegimeAnalysis: { bullish: 0, bearish: 0, neutral: 0 },
    volatilityEnvironment: { low: 0, medium: 0, high: 0 },
    overconfidenceRate: 0,
    avgDecisionQuality: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== AI Learning Data Hook: Loading Data ===');
      
      // Load both data and metrics in parallel
      const [aiData, aiMetrics] = await Promise.all([
        aiLearningService.getAll(userId),
        aiLearningService.getMetrics(userId)
      ]);

      console.log('AI Learning Data loaded:', aiData?.length || 0, 'records');
      console.log('AI Metrics:', aiMetrics);

      setData(aiData || []);
      setMetrics(aiMetrics);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = errorHandling.handleError(err, 'AI 학습 데이터 로딩');
      console.error('AI Learning Data loading error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshData = useCallback(async () => {
    console.log('=== AI Learning Data Hook: Refreshing Data ===');
    await loadData();
  }, [loadData]);

  const getBySymbol = useCallback(async (symbol: string): Promise<AILearningData[]> => {
    try {
      console.log(`=== AI Learning Data Hook: Getting data for symbol ${symbol} ===`);
      const symbolData = await aiLearningService.getBySymbol(symbol, userId);
      return symbolData || [];
    } catch (err) {
      console.error(`Error loading AI data for symbol ${symbol}:`, err);
      throw err;
    }
  }, [userId]);

  const getByDateRange = useCallback(async (startDate: string, endDate: string): Promise<AILearningData[]> => {
    try {
      console.log(`=== AI Learning Data Hook: Getting data for date range ${startDate} to ${endDate} ===`);
      const dateRangeData = await aiLearningService.getByDateRange(startDate, endDate, userId);
      return dateRangeData || [];
    } catch (err) {
      console.error(`Error loading AI data for date range:`, err);
      throw err;
    }
  }, [userId]);

  // Initial data load
  useEffect(() => {
    console.log('=== AI Learning Data Hook: Initial Load ===');
    loadData();
  }, [loadData]);

  const hasData = data.length > 0;
  const totalDataPoints = data.length;

  return {
    data,
    metrics,
    loading,
    error,
    lastUpdated,
    refreshData,
    hasData,
    totalDataPoints,
    getBySymbol,
    getByDateRange
  };
}