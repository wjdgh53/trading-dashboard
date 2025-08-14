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
      .order('exit_date', { ascending: false });
    
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
      .order('prediction_date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
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

  async updateOutcome(id: string, actualValue: string, accuracyScore: number) {
    const { data, error } = await supabase
      .from('ai_learning_data')
      .update({ 
        actual_value: actualValue, 
        accuracy_score: accuracyScore,
        outcome_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};