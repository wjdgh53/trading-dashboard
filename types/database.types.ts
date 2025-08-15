// Database type definitions based on PostgreSQL tables

export interface TradingHistory {
  id: number;
  symbol: string;
  trade_date: string;
  action: string;
  position_size: number;
  quantity: number; // Added for compatibility
  entry_price: number;
  current_price: number;
  unrealized_pl: number;
  account_equity: number;
  portfolio_value: number;
  technical_recommendation: string;
  sentiment_score: number;
  combined_score: number;
  ai_confidence?: number; // Added for compatibility
  created_at?: string;
  updated_at?: string;
}

export interface CompletedTrades {
  id: number;
  symbol: string;
  trade_date: string;
  exit_date?: string; // Added for compatibility
  sold_quantity: number;
  entry_price: number;
  exit_price: number;
  realized_pnl: number;
  profit_percentage: number;
  win_loss: string;
  ai_confidence: number;
  technical_confidence: number;
  sentiment_score: number;
  vix_level: number;
  rsi_signal: string;
  macd_signal: string;
  created_at?: string;
  updated_at?: string;
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard API Types
export interface DashboardOverview {
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
  monthlyReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentPositions: number;
  accountEquity: number;
  portfolioValue: number;
}

export interface MonthlyPnLData {
  month: string;
  year: number;
  totalPnL: number;
  trades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  cumulativePnL: number;
}

export interface RecentActivity {
  id: number;
  symbol: string;
  action: string;
  date: string;
  price: number;
  quantity: number;
  pnl?: number;
  type: 'trade' | 'position_update';
  description: string;
}

// Trades API Types
export interface TradeFilters {
  symbol?: string;
  dateFrom?: string;
  dateTo?: string;
  winLoss?: 'win' | 'loss';
  minPnL?: number;
  maxPnL?: number;
  sortBy?: 'trade_date' | 'realized_pnl' | 'profit_percentage';
  sortOrder?: 'asc' | 'desc';
}

export interface HistogramData {
  range: string;
  count: number;
  percentage: number;
  totalPnL: number;
}

export interface SymbolInfo {
  symbol: string;
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  averageReturn: number;
  lastTradeDate: string;
}

// Positions API Types
export interface CurrentPosition {
  id: number;
  symbol: string;
  positionSize: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPercentage: number;
  entryDate: string;
  daysHeld: number;
  technicalRecommendation: string;
  sentimentScore: number;
  combinedScore: number;
}

export interface UnrealizedSummary {
  totalUnrealizedPnL: number;
  totalPositions: number;
  profitablePositions: number;
  losingPositions: number;
  largestGain: number;
  largestLoss: number;
  portfolioValue: number;
  accountEquity: number;
}

export interface TechnicalIndicatorStatus {
  symbol: string;
  rsi: number;
  rsiSignal: string;
  macd: number;
  macdSignal: string;
  movingAverage20: number;
  movingAverage50: number;
  support: number;
  resistance: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

// Analytics API Types
export interface SymbolPerformance {
  symbol: string;
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
  averageHoldingPeriod: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  lastTradeDate: string;
}

export interface ConfidenceComparison {
  symbol: string;
  aiConfidence: number;
  technicalConfidence: number;
  actualReturn: number;
  aiAccuracy: number;
  technicalAccuracy: number;
  tradeDate: string;
  winLoss: string;
}

export interface SentimentCorrelation {
  sentimentRange: string;
  averageReturn: number;
  winRate: number;
  tradeCount: number;
  correlationCoefficient: number;
  vixLevel: number;
  marketRegime: string;
}