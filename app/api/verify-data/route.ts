import { NextRequest, NextResponse } from 'next/server';
import { completedTradesService, tradingHistoryService } from '@/lib/supabase';
import { tradingDataUtils } from '@/lib/tradingDataUtils';

export async function GET(request: NextRequest) {
  try {
    const [completedTrades, tradingHistory] = await Promise.all([
      completedTradesService.getAll(),
      tradingHistoryService.getAll()
    ]);
    
    // Transform data the same way the dashboard does
    const transformedCompleted = completedTrades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      position_size: trade.sold_quantity,
      realized_pnl: trade.realized_pnl,
      profit_percentage: trade.profit_percentage,
      win_loss: trade.win_loss?.toLowerCase() as 'win' | 'loss',
      exit_date: trade.trade_date,
      trade_date: trade.trade_date,
      type: 'completed' as const
    }));
    
    // Transform active trades
    const transformedActive = tradingHistory
      .filter(trade => trade.position_size && trade.position_size > 0)
      .map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        current_price: trade.current_price,
        position_size: trade.position_size,
        trade_date: trade.trade_date,
        ai_confidence: Math.min(Math.max(trade.ai_confidence || 0, 0), 100),
        unrealized_pl: trade.unrealized_pl,
        type: 'active' as const
      }));
    
    // Apply 30 days filter like the dashboard
    const thirtyDaysFilter = { period: '30days' as const };
    const filteredCompleted = tradingDataUtils.filter.filterTrades(transformedCompleted, thirtyDaysFilter);
    const filteredActive = tradingDataUtils.filter.filterTrades(transformedActive, thirtyDaysFilter);
    
    // Calculate metrics using the dashboard's calculation utils
    const dashboardMetrics = tradingDataUtils.calculation.calculateTradingMetrics(filteredCompleted, filteredActive, thirtyDaysFilter);
    
    // Check for duplicates in active trades
    const activeSymbols = transformedActive.map(t => t.symbol);
    const uniqueActiveSymbols = [...new Set(activeSymbols)];
    const duplicateActiveSymbols = activeSymbols.filter((symbol, index) => activeSymbols.indexOf(symbol) !== index);
    
    return NextResponse.json({
      status: 'success',
      totalTrades: completedTrades.length,
      activeTrades: {
        total: tradingHistory.length,
        withPosition: transformedActive.length,
        filtered: filteredActive.length,
        uniqueSymbols: uniqueActiveSymbols.length,
        duplicateSymbols: duplicateActiveSymbols,
        duplicateCount: duplicateActiveSymbols.length
      },
      duplicateAnalysis: {
        hasDuplicates: duplicateActiveSymbols.length > 0,
        duplicateSymbols: uniqueActiveSymbols.filter(symbol => 
          activeSymbols.filter(s => s === symbol).length > 1
        ),
        duplicateDetails: transformedActive
          .filter(trade => duplicateActiveSymbols.includes(trade.symbol))
          .slice(0, 10)
      },
      dashboardMetrics: dashboardMetrics,
      apiCallCount: {
        completedTrades: 1,
        tradingHistory: 1,
        totalCalls: 2,
        note: "각 API 호출당 전체 데이터를 가져옴 - 캐싱으로 최적화 필요"
      }
    });
    
  } catch (error) {
    console.error('데이터 검증 중 오류:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}