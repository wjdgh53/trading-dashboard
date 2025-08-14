// Database type definitions for Supabase tables

export interface TradingHistory {
  id: string;
  user_id?: string;
  symbol: string;
  trade_date: string;
  action: 'BUY' | 'SELL' | 'NO_ACTION';
  ai_confidence: number; // 0-100 percentage
  position_size?: number;
  entry_price?: number;
  target_price?: number;
  execution_status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  quantity?: number;
  price?: number;
  strategy?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompletedTrades {
  id: string;
  user_id?: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  entry_date: string;
  exit_date: string;
  sold_quantity: number; // Use this for calculations
  realized_pnl: number;
  profit_percentage: number;
  win_loss: 'win' | 'loss';
  ai_confidence?: number; // 0-100 percentage
  quantity?: number;
  strategy?: string;
  notes?: string;
  trade_duration_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface AiLearningData {
  id: string;
  user_id?: string;
  symbol: string;
  actual_profit_percentage: number;
  rsi_accuracy_score: number;
  macd_accuracy_score: number;
  market_regime: string;
  vix_level: number;
  prediction_type?: 'price_target' | 'trend_direction' | 'volatility' | 'sentiment';
  prediction_value?: string;
  actual_value?: string;
  confidence_score?: number;
  market_conditions?: Record<string, any>;
  technical_indicators?: Record<string, any>;
  prediction_date: string;
  outcome_date?: string;
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
export type TradeAction = 'BUY' | 'SELL' | 'NO_ACTION';
export type ExecutionStatus = 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
export type PredictionType = 'price_target' | 'trend_direction' | 'volatility' | 'sentiment';
export type WinLoss = 'win' | 'loss';

export interface TradeMetrics {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
  totalWins: number;
  totalLosses: number;
  totalInvestment: number;
  totalReturns: number;
}

export interface DashboardData {
  metrics: TradeMetrics;
  recentTrades: RecentTradeInfo[];
  dailyPnL: DailyPnLData[];
}

export interface RecentTradeInfo {
  id: string;
  symbol: string;
  date: string;
  pnl: number;
  winLoss: 'win' | 'loss';
  aiConfidence?: number;
}

export interface DailyPnLData {
  date: string;
  pnl: number;
  cumulativePnL: number;
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