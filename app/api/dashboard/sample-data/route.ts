import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Create sample completed trades
    const sampleTrades = [
      {
        symbol: 'AAPL',
        entry_price: 150.00,
        exit_price: 155.50,
        realized_pnl: 550.00,
        profit_percentage: 3.67,
        win_loss: 'win',
        entry_date: '2024-08-01T10:00:00Z',
        exit_date: '2024-08-02T15:30:00Z',
        quantity: 100
      },
      {
        symbol: 'TSLA',
        entry_price: 240.00,
        exit_price: 232.00,
        realized_pnl: -800.00,
        profit_percentage: -3.33,
        win_loss: 'loss',
        entry_date: '2024-08-03T09:30:00Z',
        exit_date: '2024-08-03T16:00:00Z',
        quantity: 100
      },
      {
        symbol: 'GOOGL',
        entry_price: 140.00,
        exit_price: 147.20,
        realized_pnl: 720.00,
        profit_percentage: 5.14,
        win_loss: 'win',
        entry_date: '2024-08-05T11:00:00Z',
        exit_date: '2024-08-06T14:45:00Z',
        quantity: 100
      },
      {
        symbol: 'MSFT',
        entry_price: 410.00,
        exit_price: 425.50,
        realized_pnl: 1550.00,
        profit_percentage: 3.78,
        win_loss: 'win',
        entry_date: '2024-08-07T10:15:00Z',
        exit_date: '2024-08-08T13:20:00Z',
        quantity: 100
      },
      {
        symbol: 'NVDA',
        entry_price: 450.00,
        exit_price: 442.50,
        realized_pnl: -750.00,
        profit_percentage: -1.67,
        win_loss: 'loss',
        entry_date: '2024-08-09T09:45:00Z',
        exit_date: '2024-08-10T11:30:00Z',
        quantity: 100
      }
    ];

    const { data: tradesData, error: tradesError } = await supabase
      .from('completed_trades')
      .insert(sampleTrades)
      .select();

    if (tradesError) {
      console.error('Error inserting sample trades:', tradesError);
    }

    // Create sample trading history
    const sampleHistory = [
      {
        symbol: 'AAPL',
        trade_date: '2024-08-01T10:00:00Z',
        action: 'buy',
        ai_confidence: 0.85,
        technical_confidence: 0.78,
        execution_success: true
      },
      {
        symbol: 'AAPL',
        trade_date: '2024-08-02T15:30:00Z',
        action: 'sell',
        ai_confidence: 0.82,
        technical_confidence: 0.88,
        execution_success: true
      },
      {
        symbol: 'TSLA',
        trade_date: '2024-08-03T09:30:00Z',
        action: 'buy',
        ai_confidence: 0.72,
        technical_confidence: 0.65,
        execution_success: true
      },
      {
        symbol: 'TSLA',
        trade_date: '2024-08-03T16:00:00Z',
        action: 'sell',
        ai_confidence: 0.58,
        technical_confidence: 0.70,
        execution_success: true
      },
      {
        symbol: 'GOOGL',
        trade_date: '2024-08-05T11:00:00Z',
        action: 'buy',
        ai_confidence: 0.91,
        technical_confidence: 0.89,
        execution_success: true
      },
      {
        symbol: 'GOOGL',
        trade_date: '2024-08-06T14:45:00Z',
        action: 'sell',
        ai_confidence: 0.87,
        technical_confidence: 0.92,
        execution_success: true
      }
    ];

    const { data: historyData, error: historyError } = await supabase
      .from('trading_history')
      .insert(sampleHistory)
      .select();

    if (historyError) {
      console.error('Error inserting sample history:', historyError);
    }

    // Create sample AI learning data
    const sampleAiData = [
      {
        symbol: 'AAPL',
        actual_profit_percentage: 3.67,
        rsi_accuracy_score: 0.85,
        macd_accuracy_score: 0.78,
        market_regime: 'trending_up',
        vix_level: 18.5,
        prediction_date: '2024-08-01T09:00:00Z'
      },
      {
        symbol: 'TSLA',
        actual_profit_percentage: -3.33,
        rsi_accuracy_score: 0.65,
        macd_accuracy_score: 0.72,
        market_regime: 'volatile',
        vix_level: 22.1,
        prediction_date: '2024-08-03T08:30:00Z'
      },
      {
        symbol: 'GOOGL',
        actual_profit_percentage: 5.14,
        rsi_accuracy_score: 0.92,
        macd_accuracy_score: 0.88,
        market_regime: 'trending_up',
        vix_level: 16.8,
        prediction_date: '2024-08-05T10:30:00Z'
      }
    ];

    const { data: aiData, error: aiError } = await supabase
      .from('ai_learning_data')
      .insert(sampleAiData)
      .select();

    if (aiError) {
      console.error('Error inserting sample AI data:', aiError);
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        trades: tradesData?.length || 0,
        history: historyData?.length || 0,
        aiData: aiData?.length || 0
      }
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
}