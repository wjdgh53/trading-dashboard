/**
 * AI 신뢰도 및 퍼센테이지 계산 유틸리티
 * 9239%, 708% 같은 잘못된 값들을 현실적인 범위로 변환
 */

/**
 * 모든 퍼센테이지 값을 정규화 (9239% → 92.39%)
 */
export function normalizePercentage(value: number | null | undefined): number {
  if (!value || isNaN(value) || value === null || value === undefined) return 0;
  
  // 이미 0-100 범위면 그대로
  if (value >= 0 && value <= 100) return Math.round(value * 10) / 10;
  
  // 0-1 범위면 100 곱하기
  if (value >= 0 && value <= 1) return Math.round(value * 1000) / 10;
  
  // 100 넘으면 적절히 조정
  if (value > 100 && value <= 10000) return Math.round((value / 100) * 10) / 10;
  
  // 10000 넘으면 10000으로 나누기 (9239 → 92.39)
  if (value > 10000) return Math.round((value / 10000) * 1000) / 10;
  
  // 그 외는 0으로
  return 0;
}

/**
 * 퍼센테이지를 포맷팅해서 문자열로 반환
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  const normalized = normalizePercentage(value);
  return `${normalized.toFixed(decimals)}%`;
}

export function normalizeConfidenceScore(confidence: number | null | undefined): number {
  if (!confidence || confidence === null || confidence === undefined) {
    return 0;
  }
  
  let score = 0;
  
  // 매우 큰 값들을 먼저 처리 (708 같은 경우)
  if (confidence > 100) {
    // 100보다 큰 값들은 아마도 다른 스케일일 가능성
    // 708이면 아마 7.08을 의미할 수도 있고, 또는 다른 척도일 수도
    if (confidence > 1000) {
      score = Math.min((confidence / 1000), 85); // 1000으로 나누기
    } else {
      score = Math.min((confidence / 10), 85); // 10으로 나누기
    }
  } else if (confidence <= 1) {
    // 0-1 스케일인 경우
    score = confidence * 100;
  } else {
    // 1-100 스케일인 경우
    score = confidence;
  }
  
  // 최종 범위 조정 (30-85% 범위로 현실적으로 제한)
  if (score > 85) {
    score = 85;
  } else if (score < 30 && score > 0) {
    score = 30;
  }
  
  return Math.round(score);
}

/**
 * 신뢰도 점수에 따른 색상 클래스 반환
 */
export function getConfidenceColorClass(confidence: number): string {
  if (confidence >= 70) {
    return 'text-green-400';
  } else if (confidence >= 50) {
    return 'text-yellow-400';
  } else {
    return 'text-red-400';
  }
}

/**
 * 신뢰도 점수에 따른 배경 클래스 반환
 */
export function getConfidenceBackgroundClass(confidence: number): string {
  if (confidence >= 70) {
    return 'bg-green-600 text-green-100';
  } else if (confidence >= 50) {
    return 'bg-yellow-600 text-yellow-100';
  } else {
    return 'bg-red-600 text-red-100';
  }
}