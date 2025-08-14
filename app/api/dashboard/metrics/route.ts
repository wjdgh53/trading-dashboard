import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { TradeMetrics } from '@/types/database.types';

export async function GET(request: NextRequest) {
  try {
    // Get completed trades for metrics calculation
    const { data: completedTrades, error: tradesError } = await supabase
      .from('completed_trades')
      .select('realized_pnl, profit_percentage, win_loss');

    if (tradesError) {
      console.error('Error fetching completed trades:', tradesError);
      return NextResponse.json(
        { error: 'Failed to fetch trades data' },
        { status: 500 }
      );
    }

    if (!completedTrades || completedTrades.length === 0) {
      const emptyMetrics: TradeMetrics = {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageReturn: 0,
        bestTrade: 0,
        worstTrade: 0,
        totalWins: 0,
        totalLosses: 0
      };
      return NextResponse.json(emptyMetrics);
    }

    // Calculate metrics
    const totalTrades = completedTrades.length;
    const totalWins = completedTrades.filter(trade => trade.win_loss === 'win').length;
    const totalLosses = totalTrades - totalWins;
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    
    const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0);
    const averageReturn = completedTrades.reduce((sum, trade) => sum + (trade.profit_percentage || 0), 0) / totalTrades;
    
    const pnlValues = completedTrades.map(trade => trade.realized_pnl || 0);
    const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
    const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

    const metrics: TradeMetrics = {
      totalTrades,
      winRate: Math.round(winRate * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      averageReturn: Math.round(averageReturn * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      totalWins,
      totalLosses
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in metrics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}