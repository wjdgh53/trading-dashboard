// 거래 결정요인을 자연어로 변환하는 유틸리티 함수들

export interface DecisionContext {
  type: 'buy' | 'hold' | 'sell' | 'analysis';
  symbol: string;
  price?: number;
  quantity?: number;
  date: string;
}

// 기술지표 신호를 자연어로 변환
export function translateTechnicalSignals(rsiSignal?: string, macdSignal?: string): string[] {
  const signals: string[] = [];
  
  if (rsiSignal) {
    const rsiTranslation: Record<string, string> = {
      'BUY': 'RSI 매수 신호 - 과매도 구간에서 반등',
      'SELL': 'RSI 매도 신호 - 과매수 구간 도달',
      'HOLD': 'RSI 보유 신호 - 중립 구간 유지',
      'STRONG_BUY': 'RSI 강한 매수 신호 - 매우 낮은 수준에서 상승',
      'STRONG_SELL': 'RSI 강한 매도 신호 - 매우 높은 수준에서 하락',
      'buy': 'RSI 매수 신호',
      'sell': 'RSI 매도 신호',
      'hold': 'RSI 보유 신호',
      'neutral': 'RSI 중립 신호'
    };
    signals.push(rsiTranslation[rsiSignal] || `RSI: ${rsiSignal}`);
  }
  
  if (macdSignal) {
    const macdTranslation: Record<string, string> = {
      'BUY': 'MACD 매수 신호 - 골든크로스 발생',
      'SELL': 'MACD 매도 신호 - 데드크로스 발생', 
      'HOLD': 'MACD 보유 신호 - 추세 지속',
      'BULLISH': 'MACD 상승 추세 - 지속적 상승 모멘텀',
      'BEARISH': 'MACD 하락 추세 - 지속적 하락 모멘텀',
      'buy': 'MACD 매수 신호',
      'sell': 'MACD 매도 신호',
      'hold': 'MACD 보유 신호',
      'neutral': 'MACD 중립 신호'
    };
    signals.push(macdTranslation[macdSignal] || `MACD: ${macdSignal}`);
  }
  
  return signals;
}

// 감정점수를 자연어로 변환
export function translateSentimentScore(sentimentScore: number): string {
  if (sentimentScore >= 0.8) {
    return `매우 긍정적인 시장 분위기 (${(sentimentScore * 100).toFixed(0)}점) - 낙관적 전망 우세`;
  } else if (sentimentScore >= 0.6) {
    return `긍정적인 시장 분위기 (${(sentimentScore * 100).toFixed(0)}점) - 상승 기대감 증가`;
  } else if (sentimentScore >= 0.4) {
    return `중립적인 시장 분위기 (${(sentimentScore * 100).toFixed(0)}점) - 관망세 지속`;
  } else if (sentimentScore >= 0.2) {
    return `부정적인 시장 분위기 (${(sentimentScore * 100).toFixed(0)}점) - 우려 증가`;
  } else {
    return `매우 부정적인 시장 분위기 (${(sentimentScore * 100).toFixed(0)}점) - 공포 심리 확산`;
  }
}

// VIX 수준을 자연어로 변환
export function translateVixLevel(vixLevel: number): string {
  if (vixLevel < 15) {
    return `매우 안정적인 시장 (VIX ${vixLevel.toFixed(1)}) - 낮은 변동성 환경`;
  } else if (vixLevel < 20) {
    return `안정적인 시장 (VIX ${vixLevel.toFixed(1)}) - 정상 변동성 수준`;
  } else if (vixLevel < 25) {
    return `약간 불안한 시장 (VIX ${vixLevel.toFixed(1)}) - 변동성 증가 시작`;
  } else if (vixLevel < 30) {
    return `불안한 시장 (VIX ${vixLevel.toFixed(1)}) - 높은 변동성 환경`;
  } else {
    return `매우 불안한 시장 (VIX ${vixLevel.toFixed(1)}) - 공포 지수 극값`;
  }
}

// 시장 체제를 자연어로 변환
export function translateMarketRegime(marketRegime: string): string {
  const regimeTranslation: Record<string, string> = {
    'bullish': '강세장 - 지속적인 상승 추세',
    'bearish': '약세장 - 지속적인 하락 추세', 
    'neutral': '보합세 - 횡보 구간 지속',
    'sideways': '횡보장 - 박스권 움직임',
    'volatile': '변동성 장세 - 급등락 반복',
    'trending_up': '상승 추세 - 꾸준한 상승',
    'trending_down': '하락 추세 - 꾸준한 하락'
  };
  
  return regimeTranslation[marketRegime.toLowerCase()] || `${marketRegime} 시장 환경`;
}

// AI 신뢰도를 자연어로 변환
export function translateConfidenceScore(confidence: number): string {
  if (confidence >= 90) {
    return `매우 높은 신뢰도 (${confidence.toFixed(0)}%) - 확신을 가진 예측`;
  } else if (confidence >= 80) {
    return `높은 신뢰도 (${confidence.toFixed(0)}%) - 신뢰할 만한 예측`;
  } else if (confidence >= 70) {
    return `보통 신뢰도 (${confidence.toFixed(0)}%) - 적당한 확신`;
  } else if (confidence >= 60) {
    return `낮은 신뢰도 (${confidence.toFixed(0)}%) - 불확실성 존재`;
  } else {
    return `매우 낮은 신뢰도 (${confidence.toFixed(0)}%) - 높은 불확실성`;
  }
}

// 기술적 권장사항을 자연어로 변환
export function translateTechnicalRecommendation(recommendation: string): string {
  const recTranslation: Record<string, string> = {
    'BUY': '기술적 매수 권장 - 상승 신호 확인',
    'STRONG_BUY': '기술적 강력 매수 - 강한 상승 신호',
    'SELL': '기술적 매도 권장 - 하락 신호 확인',
    'STRONG_SELL': '기술적 강력 매도 - 강한 하락 신호',
    'HOLD': '기술적 보유 권장 - 현 상태 유지',
    'WAIT': '기술적 관망 권장 - 명확한 신호 대기',
    'buy': '기술적 매수 신호',
    'sell': '기술적 매도 신호',
    'hold': '기술적 보유 신호',
    'neutral': '기술적 중립 신호'
  };
  
  return recTranslation[recommendation] || `기술적 분석: ${recommendation}`;
}

// 수익률에 따른 결과 설명
export function translateTradeResult(profitPercentage: number, realizedPnl: number): {
  resultType: 'big_win' | 'win' | 'small_win' | 'small_loss' | 'loss' | 'big_loss';
  description: string;
  emoji: string;
} {
  if (profitPercentage >= 20) {
    return {
      resultType: 'big_win',
      description: `대성공! ${profitPercentage.toFixed(1)}% 수익 (+$${realizedPnl.toFixed(2)})`,
      emoji: '🎉'
    };
  } else if (profitPercentage >= 10) {
    return {
      resultType: 'win',
      description: `성공적인 거래 ${profitPercentage.toFixed(1)}% 수익 (+$${realizedPnl.toFixed(2)})`,
      emoji: '✅'
    };
  } else if (profitPercentage > 0) {
    return {
      resultType: 'small_win',
      description: `소폭 수익 ${profitPercentage.toFixed(1)}% (+$${realizedPnl.toFixed(2)})`,
      emoji: '📈'
    };
  } else if (profitPercentage >= -5) {
    return {
      resultType: 'small_loss',
      description: `소폭 손실 ${Math.abs(profitPercentage).toFixed(1)}% (-$${Math.abs(realizedPnl).toFixed(2)})`,
      emoji: '📉'
    };
  } else if (profitPercentage >= -15) {
    return {
      resultType: 'loss',
      description: `손실 발생 ${Math.abs(profitPercentage).toFixed(1)}% (-$${Math.abs(realizedPnl).toFixed(2)})`,
      emoji: '❌'
    };
  } else {
    return {
      resultType: 'big_loss',
      description: `큰 손실 ${Math.abs(profitPercentage).toFixed(1)}% (-$${Math.abs(realizedPnl).toFixed(2)})`,
      emoji: '💥'
    };
  }
}

// 포지션 상태에 따른 설명
export function translatePositionStatus(unrealizedPnl: number, currentPrice: number, entryPrice: number): {
  status: 'profit' | 'loss' | 'breakeven';
  description: string;
  emoji: string;
} {
  const percentage = ((currentPrice - entryPrice) / entryPrice) * 100;
  
  if (Math.abs(percentage) < 0.5) {
    return {
      status: 'breakeven',
      description: `본전 근처 (${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%)`,
      emoji: '➡️'
    };
  } else if (unrealizedPnl > 0) {
    return {
      status: 'profit',
      description: `평가수익 +$${unrealizedPnl.toFixed(2)} (+${percentage.toFixed(1)}%)`,
      emoji: '📈'
    };
  } else {
    return {
      status: 'loss',
      description: `평가손실 -$${Math.abs(unrealizedPnl).toFixed(2)} (${percentage.toFixed(1)}%)`,
      emoji: '📉'
    };
  }
}

// 거래 기간에 따른 설명
export function translateHoldingPeriod(days: number): string {
  if (days === 0) {
    return '당일 매매';
  } else if (days === 1) {
    return '1일 보유';
  } else if (days <= 7) {
    return `단기 보유 (${days}일)`;
  } else if (days <= 30) {
    return `중기 보유 (${days}일)`;
  } else if (days <= 90) {
    return `장기 보유 (${days}일)`;
  } else {
    return `매우 장기 보유 (${days}일)`;
  }
}

// 종합 결정요인 생성
export function generateDecisionSummary(context: DecisionContext, factors: {
  technicalSignals?: { rsi?: string; macd?: string; };
  sentiment?: number;
  vix?: number;
  marketRegime?: string;
  confidence?: number;
  recommendation?: string;
}): string {
  const summaryParts: string[] = [];
  
  // 주요 신호들
  const technicalSignals = factors.technicalSignals;
  if (technicalSignals?.rsi || technicalSignals?.macd) {
    const signals = translateTechnicalSignals(technicalSignals.rsi, technicalSignals.macd);
    summaryParts.push(...signals);
  }
  
  // 기술적 권장사항
  if (factors.recommendation) {
    summaryParts.push(translateTechnicalRecommendation(factors.recommendation));
  }
  
  // 시장 환경
  if (factors.marketRegime) {
    summaryParts.push(translateMarketRegime(factors.marketRegime));
  }
  
  // 감정 및 변동성
  if (factors.sentiment !== undefined) {
    summaryParts.push(translateSentimentScore(factors.sentiment));
  }
  
  if (factors.vix !== undefined) {
    summaryParts.push(translateVixLevel(factors.vix));
  }
  
  // AI 신뢰도
  if (factors.confidence !== undefined) {
    summaryParts.push(translateConfidenceScore(factors.confidence));
  }
  
  if (summaryParts.length === 0) {
    return '복합 지표 분석을 통한 결정';
  }
  
  // 결정 타입에 따른 접두사 추가
  const actionPrefix = {
    'buy': '매수 결정:',
    'sell': '매도 결정:',
    'hold': '보유 결정:',
    'analysis': '분석 결과:'
  };
  
  return `${actionPrefix[context.type] || ''} ${summaryParts.join(', ')}`;
}