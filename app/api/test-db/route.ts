import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test 1: Basic connection test
    const { data: connectionTest, error: connectionError } = await supabase
      .from('trading_history')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('Connection error:', connectionError)
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        details: connectionError 
      }, { status: 500 })
    }

    // Test 2: Get actual data from each table
    const [tradingHistoryResult, completedTradesResult, aiLearningResult] = await Promise.all([
      supabase.from('trading_history').select('*').limit(5),
      supabase.from('completed_trades').select('*').limit(5), 
      supabase.from('ai_learning_data').select('*').limit(5)
    ])

    // Test 3: Count records in each table
    const [tradingCount, completedCount, aiCount] = await Promise.all([
      supabase.from('trading_history').select('*', { count: 'exact', head: true }),
      supabase.from('completed_trades').select('*', { count: 'exact', head: true }),
      supabase.from('ai_learning_data').select('*', { count: 'exact', head: true })
    ])

    return NextResponse.json({
      success: true,
      connection: 'OK',
      timestamp: new Date().toISOString(),
      tables: {
        trading_history: {
          count: tradingCount.count || 0,
          sample_data: tradingHistoryResult.data || [],
          error: tradingHistoryResult.error
        },
        completed_trades: {
          count: completedCount.count || 0,
          sample_data: completedTradesResult.data || [],
          error: completedTradesResult.error
        },
        ai_learning_data: {
          count: aiCount.count || 0,
          sample_data: aiLearningResult.data || [],
          error: aiLearningResult.error
        }
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}