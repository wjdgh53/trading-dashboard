import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

// Trading history functions
export const tradingHistoryService = {
  async getAll(userId?: string) {
    let query = supabase
      .from('trading_history')
      .select('*')
      .order('trade_date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getBySymbol(symbol: string, userId?: string) {
    let query = supabase
      .from('trading_history')
      .select('*')
      .eq('symbol', symbol)
      .order('trade_date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(trade: Database['public']['Tables']['trading_history']['Insert']) {
    const { data, error } = await supabase
      .from('trading_history')
      .insert(trade)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['trading_history']['Update']) {
    const { data, error } = await supabase
      .from('trading_history')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('trading_history')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Completed trades functions
export const completedTradesService = {
  async getAll(userId?: string) {
    let query = supabase
      .from('completed_trades')
      .select('*')
      .order('trade_date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(trade: Database['public']['Tables']['completed_trades']['Insert']) {
    const { data, error } = await supabase
      .from('completed_trades')
      .insert(trade)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMetrics(userId?: string) {
    let query = supabase
      .from('completed_trades')
      .select('realized_pnl, profit_percentage, win_loss');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageReturn: 0,
        bestTrade: 0,
        worstTrade: 0,
        totalWins: 0,
        totalLosses: 0
      };
    }

    const totalTrades = data.length;
    const totalWins = data.filter(trade => trade.win_loss === 'win').length;
    const totalLosses = totalTrades - totalWins;
    const winRate = (totalWins / totalTrades) * 100;
    const totalPnL = data.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0);
    const averageReturn = data.reduce((sum, trade) => sum + (trade.profit_percentage || 0), 0) / totalTrades;
    const pnlValues = data.map(trade => trade.realized_pnl || 0);
    const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
    const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

    return {
      totalTrades,
      winRate: Math.round(winRate * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      averageReturn: Math.round(averageReturn * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      totalWins,
      totalLosses
    };
  }
};

// AI learning data functions
export const aiLearningService = {
  async getAll(userId?: string) {
    let query = supabase
      .from('ai_learning_data')
      .select('*')
      .order('analysis_date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getBySymbol(symbol: string, userId?: string) {
    let query = supabase
      .from('ai_learning_data')
      .select('*')
      .eq('symbol', symbol)
      .order('analysis_date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getByDateRange(startDate: string, endDate: string, userId?: string) {
    let query = supabase
      .from('ai_learning_data')
      .select('*')
      .gte('analysis_date', startDate)
      .lte('analysis_date', endDate)
      .order('analysis_date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getMetrics(userId?: string) {
    let query = supabase
      .from('ai_learning_data')
      .select(`
        predicted_confidence_initial,
        predicted_confidence_final,
        actual_profit_percentage,
        rsi_accuracy_score,
        macd_accuracy_score,
        ma_accuracy_score,
        best_indicator,
        market_regime,
        volatility_environment,
        overconfidence_detected,
        decision_quality_score,
        roi_vs_market,
        risk_adjusted_return
      `);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
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
      };
    }

    const totalPredictions = data.length;
    
    // Calculate accuracy (predictions with actual results)
    const predictionsWithResults = data.filter(p => p.actual_profit_percentage !== null);
    const correctPredictions = predictionsWithResults.filter(p => {
      const predicted = (p.predicted_confidence_initial || 0) > 0.5;
      const actual = (p.actual_profit_percentage || 0) > 0;
      return predicted === actual;
    });
    const overallAccuracy = predictionsWithResults.length > 0 ? 
      (correctPredictions.length / predictionsWithResults.length) * 100 : 0;

    // Average confidence level
    const avgConfidenceLevel = data.reduce((sum, p) => 
      sum + (p.predicted_confidence_initial || 0), 0) / totalPredictions;

    // Average ROI vs Market
    const roiData = data.filter(p => p.roi_vs_market !== null);
    const avgROIvsMarket = roiData.length > 0 ? 
      roiData.reduce((sum, p) => sum + (p.roi_vs_market || 0), 0) / roiData.length : 0;

    // Average Risk Adjusted Return
    const riskData = data.filter(p => p.risk_adjusted_return !== null);
    const avgRiskAdjustedReturn = riskData.length > 0 ? 
      riskData.reduce((sum, p) => sum + (p.risk_adjusted_return || 0), 0) / riskData.length : 0;

    // Indicator Performance
    const rsiData = data.filter(p => p.rsi_accuracy_score !== null);
    const macdData = data.filter(p => p.macd_accuracy_score !== null);
    const maData = data.filter(p => p.ma_accuracy_score !== null);

    const indicatorPerformance = {
      rsi: rsiData.length > 0 ? 
        rsiData.reduce((sum, p) => sum + (p.rsi_accuracy_score || 0), 0) / rsiData.length : 0,
      macd: macdData.length > 0 ? 
        macdData.reduce((sum, p) => sum + (p.macd_accuracy_score || 0), 0) / macdData.length : 0,
      ma: maData.length > 0 ? 
        maData.reduce((sum, p) => sum + (p.ma_accuracy_score || 0), 0) / maData.length : 0
    };

    // Market Regime Analysis
    const regimeCounts = data.reduce((acc, p) => {
      const regime = p.market_regime || 'neutral';
      acc[regime] = (acc[regime] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const marketRegimeAnalysis = {
      bullish: regimeCounts.bullish || 0,
      bearish: regimeCounts.bearish || 0,
      neutral: (regimeCounts.neutral || 0) + (regimeCounts.sideways || 0)
    };

    // Volatility Environment
    const volatilityCounts = data.reduce((acc, p) => {
      const vol = p.volatility_environment || 'medium';
      acc[vol] = (acc[vol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const volatilityEnvironment = {
      low: volatilityCounts.low || 0,
      medium: volatilityCounts.medium || 0,
      high: volatilityCounts.high || 0
    };

    // Overconfidence Rate
    const overconfidentPredictions = data.filter(p => p.overconfidence_detected === true);
    const overconfidenceRate = (overconfidentPredictions.length / totalPredictions) * 100;

    // Average Decision Quality
    const qualityData = data.filter(p => p.decision_quality_score !== null);
    const avgDecisionQuality = qualityData.length > 0 ? 
      qualityData.reduce((sum, p) => sum + (p.decision_quality_score || 0), 0) / qualityData.length : 0;

    return {
      totalPredictions,
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      avgConfidenceLevel: Math.round(avgConfidenceLevel * 100) / 100,
      avgROIvsMarket: Math.round(avgROIvsMarket * 100) / 100,
      avgRiskAdjustedReturn: Math.round(avgRiskAdjustedReturn * 100) / 100,
      indicatorPerformance: {
        rsi: Math.round(indicatorPerformance.rsi * 100) / 100,
        macd: Math.round(indicatorPerformance.macd * 100) / 100,
        ma: Math.round(indicatorPerformance.ma * 100) / 100
      },
      marketRegimeAnalysis,
      volatilityEnvironment,
      overconfidenceRate: Math.round(overconfidenceRate * 100) / 100,
      avgDecisionQuality: Math.round(avgDecisionQuality * 100) / 100
    };
  },

  async create(prediction: Database['public']['Tables']['ai_learning_data']['Insert']) {
    const { data, error } = await supabase
      .from('ai_learning_data')
      .insert(prediction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['ai_learning_data']['Update']) {
    const { data, error } = await supabase
      .from('ai_learning_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOutcome(id: string, actualResult: string, actualProfitPercentage: number, actualHoldingDays: number) {
    const { data, error } = await supabase
      .from('ai_learning_data')
      .update({ 
        actual_result: actualResult,
        actual_profit_percentage: actualProfitPercentage,
        actual_holding_days: actualHoldingDays,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('ai_learning_data')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};