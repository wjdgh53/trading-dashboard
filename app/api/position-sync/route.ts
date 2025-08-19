import { NextRequest, NextResponse } from 'next/server';
import { completedTradesService, tradingHistoryService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 포지션 동기화 상태 분석 시작...');
    
    const [completedTrades, tradingHistory] = await Promise.all([
      completedTradesService.getAll(),
      tradingHistoryService.getAll()
    ]);

    // 활성 포지션 분석 (position_size > 0인 거래들)
    const activePositions = tradingHistory
      .filter(trade => trade.position_size && trade.position_size > 0)
      .map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        position_size: trade.position_size,
        trade_date: trade.trade_date,
        last_updated: trade.updated_at || trade.created_at,
        status: 'active_in_db'
      }));

    // 종목별 그룹화
    const positionsBySymbol = activePositions.reduce((acc, position) => {
      if (!acc[position.symbol]) {
        acc[position.symbol] = [];
      }
      acc[position.symbol].push(position);
      return acc;
    }, {} as Record<string, any[]>);

    // 중복 포지션 분석
    const duplicateAnalysis = Object.entries(positionsBySymbol).map(([symbol, positions]) => {
      const sortedPositions = positions.sort((a, b) => 
        new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
      );
      
      return {
        symbol,
        totalPositions: positions.length,
        isDuplicate: positions.length > 1,
        latestPosition: sortedPositions[0],
        olderPositions: sortedPositions.slice(1),
        totalPositionSize: positions.reduce((sum, p) => sum + p.position_size, 0),
        averageEntryPrice: positions.reduce((sum, p) => sum + p.entry_price, 0) / positions.length
      };
    });

    // 완료된 거래와 중복 확인
    const completedSymbols = new Set(completedTrades.map(trade => trade.symbol));
    const potentiallyCompleted = duplicateAnalysis.filter(analysis => 
      completedSymbols.has(analysis.symbol)
    );

    // 오래된 포지션 탐지 (7일 이상 된 거래)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const stalePositions = activePositions.filter(position => 
      new Date(position.trade_date) < sevenDaysAgo
    );

    // 의심스러운 포지션들 (완료되었을 가능성이 높은 포지션)
    const suspiciousPositions = activePositions.filter(position => {
      // 1. 같은 종목의 완료된 거래가 더 늦은 날짜에 있는 경우
      const laterCompletedTrades = completedTrades.filter(completed => 
        completed.symbol === position.symbol &&
        new Date(completed.trade_date) > new Date(position.trade_date)
      );
      
      return laterCompletedTrades.length > 0;
    });

    const results = {
      status: 'success',
      timestamp: new Date().toISOString(),
      summary: {
        totalActivePositions: activePositions.length,
        uniqueSymbols: Object.keys(positionsBySymbol).length,
        duplicateSymbols: duplicateAnalysis.filter(a => a.isDuplicate).length,
        stalePositions: stalePositions.length,
        suspiciousPositions: suspiciousPositions.length,
        potentiallyCompletedButActive: potentiallyCompleted.length
      },
      analysis: {
        duplicatePositions: duplicateAnalysis.filter(a => a.isDuplicate),
        stalePositions: stalePositions.slice(0, 10), // 최대 10개만 표시
        suspiciousPositions: suspiciousPositions.slice(0, 10),
        potentiallyCompleted: potentiallyCompleted
      },
      recommendations: []
    };

    // 권장사항 생성
    if (results.summary.duplicateSymbols > 0) {
      results.recommendations.push({
        type: 'cleanup',
        priority: 'high',
        issue: `${results.summary.duplicateSymbols}개 종목에 중복 포지션 존재`,
        action: '중복 포지션 중 가장 최신 것만 유지하고 나머지 제거',
        affectedSymbols: duplicateAnalysis.filter(a => a.isDuplicate).map(a => a.symbol)
      });
    }

    if (results.summary.stalePositions > 0) {
      results.recommendations.push({
        type: 'verification',
        priority: 'medium', 
        issue: `${results.summary.stalePositions}개의 7일 이상 된 활성 포지션`,
        action: 'Alpaca API와 동기화하여 실제 포지션 상태 확인',
        count: results.summary.stalePositions
      });
    }

    if (results.summary.suspiciousPositions > 0) {
      results.recommendations.push({
        type: 'sync',
        priority: 'high',
        issue: `${results.summary.suspiciousPositions}개의 의심스러운 포지션 (완료되었을 가능성)`,
        action: '포지션 상태를 completed_trades로 이동하거나 position_size를 0으로 업데이트',
        count: results.summary.suspiciousPositions
      });
    }

    // 전체 상태 결정
    if (results.summary.suspiciousPositions > 5 || results.summary.duplicateSymbols > 3) {
      results.status = 'critical';
    } else if (results.summary.suspiciousPositions > 0 || results.summary.duplicateSymbols > 0) {
      results.status = 'warning';
    } else {
      results.status = 'healthy';
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('포지션 동기화 분석 중 오류:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      summary: {},
      analysis: {},
      recommendations: [{
        type: 'error',
        priority: 'critical',
        issue: '포지션 동기화 분석 실패',
        action: '시스템 로그 확인 및 데이터베이스 연결 상태 점검'
      }]
    }, { status: 500 });
  }
}