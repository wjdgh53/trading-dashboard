import { NextResponse } from 'next/server';
import { tradingHistoryService, completedTradesService, aiLearningService } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all data in parallel
    const [tradingHistory, completedTrades, aiLearningData, metrics] = await Promise.all([
      tradingHistoryService.getAll(),
      completedTradesService.getAll(),
      aiLearningService.getAll(),
      completedTradesService.getMetrics()
    ]);

    // Calculate additional statistics
    const aiData = aiLearningData || [];
    const avgRsiAccuracy = aiData.length > 0 
      ? aiData.reduce((sum, item) => sum + (item.rsi_accuracy_score || 0), 0) / aiData.length
      : 0;
    const avgMacdAccuracy = aiData.length > 0
      ? aiData.reduce((sum, item) => sum + (item.macd_accuracy_score || 0), 0) / aiData.length
      : 0;

    // Get unique symbols for filtering
    const symbolSet = new Set([
      ...(tradingHistory || []).map(t => t.symbol),
      ...(completedTrades || []).map(t => t.symbol),
      ...(aiLearningData || []).map(t => t.symbol)
    ]);
    const symbols = Array.from(symbolSet).sort();

    // Calculate daily P&L for chart
    const dailyPnL = calculateDailyPnL(completedTrades || []);

    return NextResponse.json({
      tradingHistory: tradingHistory || [],
      completedTrades: completedTrades || [],
      aiLearningData: aiLearningData || [],
      metrics: {
        ...metrics,
        avgRsiAccuracy: Math.round(avgRsiAccuracy * 10000) / 100, // Convert to percentage
        avgMacdAccuracy: Math.round(avgMacdAccuracy * 10000) / 100,
      },
      symbols,
      dailyPnL
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function calculateDailyPnL(completedTrades: any[]) {
  const dailyPnL: Record<string, number> = {};
  
  completedTrades.forEach(trade => {
    const date = new Date(trade.exit_date).toISOString().split('T')[0];
    dailyPnL[date] = (dailyPnL[date] || 0) + trade.realized_pnl;
  });

  const sortedDates = Object.keys(dailyPnL).sort();
  let cumulativePnL = 0;

  return sortedDates.map(date => {
    cumulativePnL += dailyPnL[date];
    return {
      date,
      pnl: Math.round(dailyPnL[date] * 100) / 100,
      cumulativePnL: Math.round(cumulativePnL * 100) / 100
    };
  });
}