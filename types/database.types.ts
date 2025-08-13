// Database type definitions for Supabase tables

export interface TradingHistory {
  id: string;
  user_id?: string;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  strategy?: string;
  notes?: string;
  profit_loss?: number;
  created_at: string;
  updated_at: string;
}

export interface CompletedTrades {
  id: string;
  user_id?: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  profit_loss: number;
  percentage_return: number;
  entry_date: string;
  exit_date: string;
  strategy?: string;
  notes?: string;
  trade_duration_hours: number;
  created_at: string;
  updated_at: string;
}

export interface AiLearningData {
  id: string;
  user_id?: string;
  symbol: string;
  prediction_type: 'price_target' | 'trend_direction' | 'volatility' | 'sentiment';
  prediction_value: string;
  actual_value?: string;
  confidence_score: number;
  market_conditions: Record<string, any>;
  technical_indicators: Record<string, any>;
  prediction_date: string;
  outcome_date?: string;
  accuracy_score?: number;
  model_version?: string;
  created_at: string;
  updated_at: string;
}

// Database schema interfaces
export interface Database {
  public: {
    Tables: {
      trading_history: {
        Row: TradingHistory;
        Insert: Omit<TradingHistory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TradingHistory, 'id' | 'created_at' | 'updated_at'>>;
      };
      completed_trades: {
        Row: CompletedTrades;
        Insert: Omit<CompletedTrades, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CompletedTrades, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_learning_data: {
        Row: AiLearningData;
        Insert: Omit<AiLearningData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AiLearningData, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Trading-specific types
export type TradeAction = 'buy' | 'sell';
export type PredictionType = 'price_target' | 'trend_direction' | 'volatility' | 'sentiment';

export interface TradeMetrics {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
}