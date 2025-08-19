'use client';

import { AILearningData, AIAnalyticsMetrics } from '@/types/ai-learning.types';

export interface ExportOptions {
  format: 'csv' | 'json';
  includeMetrics?: boolean;
  filename?: string;
}

export class DataExporter {
  static exportToCSV(data: AILearningData[], options: ExportOptions = { format: 'csv' }): void {
    if (data.length === 0) {
      throw new Error('데이터가 없습니다.');
    }

    // Define headers for CSV
    const headers = [
      'ID',
      'Symbol',
      'Trade Date',
      'Analysis Date',
      'Actual Result',
      'Actual Profit %',
      'Actual Holding Days',
      'Initial Confidence',
      'Final Confidence',
      'Confidence Volatility',
      'RSI Accuracy',
      'MACD Accuracy',
      'MA Accuracy',
      'Best Indicator',
      'Sentiment Accuracy',
      'Sentiment Correlation',
      'Market Regime',
      'Volatility Environment',
      'VIX Level',
      'Overconfidence Detected',
      'Optimal Threshold',
      'Decision Quality Score',
      'ROI vs Market',
      'Risk Adjusted Return',
      'Created At'
    ];

    // Convert data to CSV rows
    const csvRows = data.map(item => [
      item.id,
      item.symbol,
      item.trade_date,
      item.analysis_date,
      item.actual_result || '',
      item.actual_profit_percentage || '',
      item.actual_holding_days || '',
      item.predicted_confidence_initial || '',
      item.predicted_confidence_final || '',
      item.confidence_volatility || '',
      item.rsi_accuracy_score || '',
      item.macd_accuracy_score || '',
      item.ma_accuracy_score || '',
      item.best_indicator || '',
      item.sentiment_accuracy_score || '',
      item.sentiment_price_correlation || '',
      item.market_regime || '',
      item.volatility_environment || '',
      item.vix_level || '',
      item.overconfidence_detected ? 'TRUE' : 'FALSE',
      item.optimal_threshold_suggested || '',
      item.decision_quality_score || '',
      item.roi_vs_market || '',
      item.risk_adjusted_return || '',
      item.created_at
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const filename = options.filename || `ai_learning_data_${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  static exportToJSON(data: AILearningData[], metrics?: AIAnalyticsMetrics, options: ExportOptions = { format: 'json' }): void {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      data: data,
      ...(options.includeMetrics && metrics ? { metrics } : {})
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const filename = options.filename || `ai_learning_data_${new Date().toISOString().split('T')[0]}.json`;
    
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  static exportMetricsReport(metrics: AIAnalyticsMetrics, options: ExportOptions = { format: 'csv' }): void {
    const reportData = [
      ['Metric', 'Value'],
      ['Total Predictions', metrics.totalPredictions],
      ['Overall Accuracy (%)', metrics.overallAccuracy],
      ['Average Confidence Level (%)', metrics.avgConfidenceLevel],
      ['Average ROI vs Market (%)', metrics.avgROIvsMarket],
      ['Average Risk Adjusted Return', metrics.avgRiskAdjustedReturn],
      ['RSI Performance (%)', metrics.indicatorPerformance.rsi],
      ['MACD Performance (%)', metrics.indicatorPerformance.macd],
      ['MA Performance (%)', metrics.indicatorPerformance.ma],
      ['Bullish Market Predictions', metrics.marketRegimeAnalysis.bullish],
      ['Bearish Market Predictions', metrics.marketRegimeAnalysis.bearish],
      ['Neutral Market Predictions', metrics.marketRegimeAnalysis.neutral],
      ['Low Volatility Environment', metrics.volatilityEnvironment.low],
      ['Medium Volatility Environment', metrics.volatilityEnvironment.medium],
      ['High Volatility Environment', metrics.volatilityEnvironment.high],
      ['Overconfidence Rate (%)', metrics.overconfidenceRate],
      ['Average Decision Quality (%)', metrics.avgDecisionQuality]
    ];

    const csvContent = reportData
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const filename = options.filename || `ai_metrics_report_${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  static exportFilteredData(
    data: AILearningData[], 
    filters: {
      symbol?: string;
      dateFrom?: string;
      dateTo?: string;
      minAccuracy?: number;
      marketRegime?: string;
    },
    options: ExportOptions = { format: 'csv' }
  ): void {
    let filteredData = [...data];

    // Apply filters
    if (filters.symbol) {
      filteredData = filteredData.filter(item => 
        item.symbol.toLowerCase().includes(filters.symbol!.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filteredData = filteredData.filter(item => 
        new Date(item.analysis_date) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filteredData = filteredData.filter(item => 
        new Date(item.analysis_date) <= new Date(filters.dateTo!)
      );
    }

    if (filters.minAccuracy !== undefined) {
      filteredData = filteredData.filter(item => {
        const rsiAccuracy = (item.rsi_accuracy_score || 0) * 100;
        const macdAccuracy = (item.macd_accuracy_score || 0) * 100;
        const maAccuracy = (item.ma_accuracy_score || 0) * 100;
        const avgAccuracy = (rsiAccuracy + macdAccuracy + maAccuracy) / 3;
        return avgAccuracy >= filters.minAccuracy!;
      });
    }

    if (filters.marketRegime) {
      filteredData = filteredData.filter(item => 
        item.market_regime === filters.marketRegime
      );
    }

    // Generate filename with filter info
    const filterInfo = Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}_${value}`)
      .join('_');
    
    const filename = `ai_filtered_data_${filterInfo}_${new Date().toISOString().split('T')[0]}.${options.format}`;

    if (options.format === 'csv') {
      this.exportToCSV(filteredData, { ...options, filename });
    } else {
      this.exportToJSON(filteredData, undefined, { ...options, filename });
    }
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static generateSummaryReport(data: AILearningData[], metrics: AIAnalyticsMetrics): string {
    const reportDate = new Date().toLocaleDateString('ko-KR');
    const topSymbols = this.getTopPerformingSymbols(data, 5);
    const recentData = data.slice(0, 10);

    return `
AI 학습 데이터 분석 리포트
생성일: ${reportDate}
분석 기간: ${data.length > 0 ? `${data[data.length - 1].analysis_date} ~ ${data[0].analysis_date}` : 'N/A'}

=== 전체 성과 요약 ===
총 예측 수: ${metrics.totalPredictions}
전체 정확도: ${metrics.overallAccuracy.toFixed(2)}%
평균 신뢰도: ${metrics.avgConfidenceLevel.toFixed(2)}%
시장 대비 평균 수익률: ${metrics.avgROIvsMarket.toFixed(2)}%
위험 조정 수익률: ${metrics.avgRiskAdjustedReturn.toFixed(3)}
과신 비율: ${metrics.overconfidenceRate.toFixed(2)}%
평균 의사결정 품질: ${(metrics.avgDecisionQuality * 100).toFixed(0)}점

=== 기술적 지표 성과 ===
RSI 정확도: ${metrics.indicatorPerformance.rsi.toFixed(2)}%
MACD 정확도: ${metrics.indicatorPerformance.macd.toFixed(2)}%
이동평균 정확도: ${metrics.indicatorPerformance.ma.toFixed(2)}%

=== 시장 환경 분석 ===
강세장 예측: ${metrics.marketRegimeAnalysis.bullish}건
약세장 예측: ${metrics.marketRegimeAnalysis.bearish}건
횡보장 예측: ${metrics.marketRegimeAnalysis.neutral}건

=== 변동성 환경 ===
저변동성: ${metrics.volatilityEnvironment.low}건
중간변동성: ${metrics.volatilityEnvironment.medium}건
고변동성: ${metrics.volatilityEnvironment.high}건

=== 최고 성과 심볼 (Top 5) ===
${topSymbols.map((symbol, index) => 
  `${index + 1}. ${symbol.symbol}: ${symbol.avgROI.toFixed(2)}% (${symbol.count}건)`
).join('\n')}

=== 최근 예측 (최근 10건) ===
${recentData.map(item => 
  `${item.symbol} | ${item.analysis_date} | 신뢰도: ${((item.predicted_confidence_initial || 0) * 100).toFixed(1)}% | 실제수익: ${item.actual_profit_percentage?.toFixed(2) || 'N/A'}%`
).join('\n')}

=== 권장사항 ===
${this.generateRecommendations(metrics)}
    `.trim();
  }

  private static getTopPerformingSymbols(data: AILearningData[], limit: number) {
    const symbolStats = data.reduce((acc, item) => {
      if (!item.roi_vs_market) return acc;
      
      if (!acc[item.symbol]) {
        acc[item.symbol] = { roi: [], count: 0 };
      }
      acc[item.symbol].roi.push(item.roi_vs_market);
      acc[item.symbol].count++;
      return acc;
    }, {} as Record<string, { roi: number[], count: number }>);

    return Object.entries(symbolStats)
      .map(([symbol, stats]) => ({
        symbol,
        avgROI: stats.roi.reduce((sum, roi) => sum + roi, 0) / stats.roi.length,
        count: stats.count
      }))
      .sort((a, b) => b.avgROI - a.avgROI)
      .slice(0, limit);
  }

  private static generateRecommendations(metrics: AIAnalyticsMetrics): string {
    const recommendations = [];
    
    if (metrics.overallAccuracy < 60) {
      recommendations.push('• 전체 정확도가 60% 미만입니다. 모델 개선이 필요합니다.');
    }
    
    if (metrics.overconfidenceRate > 30) {
      recommendations.push('• 과신 비율이 높습니다. 신뢰도 임계값 조정을 고려하세요.');
    }
    
    if (metrics.avgDecisionQuality < 0.7) {
      recommendations.push('• 의사결정 품질이 낮습니다. 데이터 품질과 특성 엔지니어링을 검토하세요.');
    }
    
    const bestIndicator = Object.entries(metrics.indicatorPerformance)
      .sort(([,a], [,b]) => b - a)[0];
    
    recommendations.push(`• 가장 성과가 좋은 지표는 ${bestIndicator[0].toUpperCase()}입니다 (${bestIndicator[1].toFixed(1)}%).`);
    
    if (recommendations.length === 1) {
      recommendations.unshift('• 전반적인 성과가 양호합니다. 현재 전략을 유지하세요.');
    }
    
    return recommendations.join('\n');
  }
}

export default DataExporter;