export interface AILearningData {
  id: string;
  symbol: string;
  trade_date: string;
  analysis_date: string;
  actual_result?: string;
  actual_profit_percentage?: number;
  actual_holding_days?: number;
  predicted_confidence_initial: number;
  predicted_confidence_final?: number;
  confidence_volatility?: number;
  rsi_accuracy_score?: number;
  macd_accuracy_score?: number;
  ma_accuracy_score?: number;
  best_indicator?: string;
  sentiment_accuracy_score?: number;
  sentiment_price_correlation?: number;
  market_regime?: string;
  volatility_environment?: string;
  vix_level?: number;
  overconfidence_detected?: boolean;
  optimal_threshold_suggested?: number;
  decision_quality_score?: number;
  recommended_actions?: any; // JSONB field
  roi_vs_market?: number;
  risk_adjusted_return?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAnalyticsMetrics {
  totalPredictions: number;
  overallAccuracy: number;
  avgConfidenceLevel: number;
  avgROIvsMarket: number;
  avgRiskAdjustedReturn: number;
  indicatorPerformance: {
    rsi: number;
    macd: number;
    ma: number;
  };
  marketRegimeAnalysis: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  volatilityEnvironment: {
    low: number;
    medium: number;
    high: number;
  };
  overconfidenceRate: number;
  avgDecisionQuality: number;
}

export interface PredictionAccuracyData {
  symbol: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  avgConfidence: number;
  avgROI: number;
}

export interface TechnicalIndicatorPerformance {
  indicator: string;
  accuracy: number;
  avgScore: number;
  totalSignals: number;
  bestPerformingSymbols: string[];
}

export interface MarketEnvironmentData {
  regime: string;
  volatility: string;
  count: number;
  avgAccuracy: number;
  avgROI: number;
  avgVIX: number;
}

export interface ConfidenceAnalysis {
  confidenceRange: string;
  count: number;
  accuracy: number;
  avgActualROI: number;
  overconfidenceRate: number;
}