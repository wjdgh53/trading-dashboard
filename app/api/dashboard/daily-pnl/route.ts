import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { DailyPnLData } from '@/types/database.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get completed trades within the date range
    const { data: completedTrades, error: tradesError } = await supabase
      .from('completed_trades')
      .select('trade_date, realized_pnl')
      .gte('trade_date', startDate.toISOString())
      .lte('trade_date', endDate.toISOString())
      .order('trade_date', { ascending: true });

    if (tradesError) {
      console.error('Error fetching trades for daily P&L:', tradesError);
      return NextResponse.json(
        { error: 'Failed to fetch daily P&L data' },
        { status: 500 }
      );
    }

    if (!completedTrades) {
      return NextResponse.json([]);
    }

    // Group trades by date and calculate daily P&L
    const dailyPnLMap = new Map<string, number>();
    
    // Initialize all dates in range with 0 P&L
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyPnLMap.set(dateStr, 0);
    }

    // Aggregate P&L by day
    completedTrades.forEach(trade => {
      const dateStr = new Date(trade.trade_date).toISOString().split('T')[0];
      const currentPnL = dailyPnLMap.get(dateStr) || 0;
      dailyPnLMap.set(dateStr, currentPnL + (trade.realized_pnl || 0));
    });

    // Convert to array and calculate cumulative P&L
    let cumulativePnL = 0;
    const dailyPnLData: DailyPnLData[] = [];

    const sortedEntries = Array.from(dailyPnLMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    
    for (const [date, pnl] of sortedEntries) {
      cumulativePnL += pnl;
      dailyPnLData.push({
        date,
        pnl: Math.round(pnl * 100) / 100,
        cumulativePnL: Math.round(cumulativePnL * 100) / 100
      });
    }

    return NextResponse.json(dailyPnLData);
  } catch (error) {
    console.error('Error in daily P&L API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}