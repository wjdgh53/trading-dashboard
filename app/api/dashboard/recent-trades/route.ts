import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { RecentTradeInfo } from '@/types/database.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent completed trades
    const { data: completedTrades, error: tradesError } = await supabase
      .from('completed_trades')
      .select('id, symbol, trade_date, realized_pnl, win_loss')
      .order('trade_date', { ascending: false })
      .limit(limit);

    if (tradesError) {
      console.error('Error fetching recent trades:', tradesError);
      return NextResponse.json(
        { error: 'Failed to fetch recent trades' },
        { status: 500 }
      );
    }

    if (!completedTrades) {
      return NextResponse.json([]);
    }

    // Get AI confidence data for recent trades
    const tradeIds = completedTrades.map(trade => trade.symbol);
    const { data: tradingHistory, error: historyError } = await supabase
      .from('trading_history')
      .select('symbol, ai_confidence, trade_date')
      .in('symbol', tradeIds)
      .order('trade_date', { ascending: false });

    // Create a map of latest AI confidence per symbol
    const aiConfidenceMap = new Map<string, number>();
    if (tradingHistory && !historyError) {
      tradingHistory.forEach(history => {
        if (!aiConfidenceMap.has(history.symbol)) {
          aiConfidenceMap.set(history.symbol, history.ai_confidence);
        }
      });
    }

    // Transform data for frontend
    const recentTrades: RecentTradeInfo[] = completedTrades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      date: trade.trade_date,
      pnl: trade.realized_pnl || 0,
      winLoss: trade.win_loss as 'win' | 'loss',
      aiConfidence: aiConfidenceMap.get(trade.symbol)
    }));

    return NextResponse.json(recentTrades);
  } catch (error) {
    console.error('Error in recent trades API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}