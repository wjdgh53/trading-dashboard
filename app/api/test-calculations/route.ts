import { NextRequest, NextResponse } from 'next/server';
import { completedTradesService, tradingHistoryService } from '@/lib/supabase';
import { tradingDataUtils } from '@/lib/tradingDataUtils';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 대시보드 계산 정확성 테스트 시작...');
    
    const results = {
      status: 'success',
      timestamp: new Date().toISOString(),
      tests: {
        dataLoading: { status: 'pending', details: {} },
        filtering: { status: 'pending', details: {} },
        calculations: { status: 'pending', details: {} },
        performance: { status: 'pending', details: {} },
        errorHandling: { status: 'pending', details: {} }
      },
      summary: {
        totalTests: 5,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // 1. 데이터 로딩 테스트
    try {
      const [completedTrades, tradingHistory] = await Promise.all([
        completedTradesService.getAll(),
        tradingHistoryService.getAll()
      ]);
      
      results.tests.dataLoading = {
        status: 'pass',
        details: {
          completedTrades: completedTrades.length,
          tradingHistory: tradingHistory.length,
          dataAvailable: completedTrades.length > 0 && tradingHistory.length > 0
        }
      };
      results.summary.passed++;
    } catch (error) {
      results.tests.dataLoading = {
        status: 'fail',
        details: { error: error.message }
      };
      results.summary.failed++;
    }

    // 2. 필터링 테스트
    try {
      const [completedTrades] = await Promise.all([
        completedTradesService.getAll()
      ]);
      
      const transformedCompleted = completedTrades.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        position_size: trade.sold_quantity,
        realized_pnl: trade.realized_pnl,
        profit_percentage: trade.profit_percentage,
        win_loss: trade.win_loss?.toLowerCase() as 'win' | 'loss',
        exit_date: trade.trade_date, // 실제로는 trade_date 사용
        trade_date: trade.trade_date,
        type: 'completed' as const
      }));

      const filterTests = [
        { period: 'today' as const, name: '오늘' },
        { period: '7days' as const, name: '최근 7일' },
        { period: '30days' as const, name: '최근 30일' },
        { period: 'custom' as const, dateRange: { startDate: '2025-07-01', endDate: '2025-08-15' }, name: '사용자 지정' }
      ];

      const filterResults = [];
      for (const filterTest of filterTests) {
        const startTime = Date.now();
        const filtered = tradingDataUtils.filter.filterTrades(transformedCompleted, filterTest);
        const endTime = Date.now();
        
        filterResults.push({
          name: filterTest.name,
          filteredCount: filtered.length,
          responseTime: endTime - startTime,
          performance: endTime - startTime < 200 ? 'good' : 'slow'
        });
      }

      results.tests.filtering = {
        status: 'pass',
        details: {
          totalData: transformedCompleted.length,
          filterTests: filterResults,
          averageResponseTime: filterResults.reduce((sum, test) => sum + test.responseTime, 0) / filterResults.length
        }
      };
      results.summary.passed++;
    } catch (error) {
      results.tests.filtering = {
        status: 'fail',
        details: { error: error.message }
      };
      results.summary.failed++;
    }

    // 3. 계산 정확성 테스트
    try {
      const [completedTrades, tradingHistory] = await Promise.all([
        completedTradesService.getAll(),
        tradingHistoryService.getAll()
      ]);

      const transformedCompleted = completedTrades.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        position_size: trade.sold_quantity,
        realized_pnl: trade.realized_pnl,
        profit_percentage: trade.profit_percentage,
        win_loss: trade.win_loss?.toLowerCase() as 'win' | 'loss',
        exit_date: trade.trade_date, // 실제로는 trade_date 사용
        trade_date: trade.trade_date,
        type: 'completed' as const
      }));

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

      // 샘플 데이터로 수동 계산
      const sampleTrades = transformedCompleted.slice(0, 10);
      let manualTotalInvestment = 0;
      let manualTotalRecovery = 0;
      let manualNetPnL = 0;
      let manualWins = 0;

      for (const trade of sampleTrades) {
        manualTotalInvestment += trade.entry_price * trade.position_size;
        manualTotalRecovery += (trade.exit_price || 0) * trade.position_size;
        manualNetPnL += trade.realized_pnl || 0;
        if (trade.win_loss === 'win') manualWins++;
      }

      const manualWinRate = sampleTrades.length > 0 ? (manualWins / sampleTrades.length) * 100 : 0;

      // 라이브러리 계산
      const filters = { period: '30days' as const };
      const libraryMetrics = tradingDataUtils.calculation.calculateTradingMetrics(
        sampleTrades,
        transformedActive.slice(0, 5),
        filters
      );

      // 정확성 검증
      const tolerance = 0.01;
      const investmentMatch = Math.abs(manualTotalInvestment - libraryMetrics.totalInvestment) < tolerance;
      const recoveryMatch = Math.abs(manualTotalRecovery - libraryMetrics.totalRecovery) < tolerance;
      const pnlMatch = Math.abs(manualNetPnL - libraryMetrics.netPnL) < tolerance;
      const winRateMatch = Math.abs(manualWinRate - libraryMetrics.winRate) < tolerance;

      const allMatch = investmentMatch && recoveryMatch && pnlMatch && winRateMatch;

      results.tests.calculations = {
        status: allMatch ? 'pass' : 'warning',
        details: {
          sampleSize: sampleTrades.length,
          manual: {
            totalInvestment: manualTotalInvestment,
            totalRecovery: manualTotalRecovery,
            netPnL: manualNetPnL,
            winRate: manualWinRate
          },
          library: {
            totalInvestment: libraryMetrics.totalInvestment,
            totalRecovery: libraryMetrics.totalRecovery,
            netPnL: libraryMetrics.netPnL,
            winRate: libraryMetrics.winRate
          },
          accuracy: {
            investmentMatch,
            recoveryMatch,
            pnlMatch,
            winRateMatch,
            overallMatch: allMatch
          }
        }
      };

      if (allMatch) {
        results.summary.passed++;
      } else {
        results.summary.warnings++;
      }
    } catch (error) {
      results.tests.calculations = {
        status: 'fail',
        details: { error: error.message }
      };
      results.summary.failed++;
    }

    // 4. 성능 테스트
    try {
      const [completedTrades] = await Promise.all([
        completedTradesService.getAll()
      ]);

      const transformedCompleted = completedTrades.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        position_size: trade.sold_quantity,
        realized_pnl: trade.realized_pnl,
        profit_percentage: trade.profit_percentage,
        win_loss: trade.win_loss?.toLowerCase() as 'win' | 'loss',
        exit_date: trade.trade_date, // 실제로는 trade_date 사용
        trade_date: trade.trade_date,
        type: 'completed' as const
      }));

      // 대용량 데이터 시뮬레이션
      const largeDataset = Array(1000).fill(0).map((_, i) => ({
        ...transformedCompleted[i % transformedCompleted.length],
        id: i + 1000
      }));

      const performanceTests = [
        { name: '1,000건 필터링', operation: 'filtering', size: 1000 },
        { name: '500건 계산', operation: 'calculation', size: 500 },
        { name: '100건 정렬', operation: 'sorting', size: 100 }
      ];

      const performanceResults = [];
      for (const test of performanceTests) {
        const testData = largeDataset.slice(0, test.size);
        const startTime = Date.now();

        if (test.operation === 'filtering') {
          tradingDataUtils.filter.filterTrades(testData, { period: '30days' });
        } else if (test.operation === 'calculation') {
          tradingDataUtils.calculation.calculateTradingMetrics(testData, [], { period: '30days' });
        } else if (test.operation === 'sorting') {
          tradingDataUtils.filter.sortTradesByDate(testData);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        performanceResults.push({
          name: test.name,
          duration,
          performance: duration < 100 ? 'excellent' : duration < 500 ? 'good' : 'slow'
        });
      }

      const averagePerformance = performanceResults.reduce((sum, test) => sum + test.duration, 0) / performanceResults.length;

      results.tests.performance = {
        status: averagePerformance < 200 ? 'pass' : 'warning',
        details: {
          tests: performanceResults,
          averageTime: averagePerformance,
          dataSize: largeDataset.length
        }
      };

      if (averagePerformance < 200) {
        results.summary.passed++;
      } else {
        results.summary.warnings++;
      }
    } catch (error) {
      results.tests.performance = {
        status: 'fail',
        details: { error: error.message }
      };
      results.summary.failed++;
    }

    // 5. 에러 처리 테스트
    try {
      const errorTests = [];

      // 빈 데이터 테스트
      try {
        const emptyMetrics = tradingDataUtils.calculation.calculateTradingMetrics([], [], { period: 'today' });
        errorTests.push({
          name: '빈 데이터 처리',
          status: 'pass',
          result: `총 거래: ${emptyMetrics.totalTrades}`
        });
      } catch (error) {
        errorTests.push({
          name: '빈 데이터 처리',
          status: 'fail',
          error: error.message
        });
      }

      // 잘못된 날짜 범위 테스트
      try {
        const badDateFilter = {
          period: 'custom' as const,
          dateRange: { startDate: '2025-12-31', endDate: '2025-01-01' }
        };
        const badDateResult = tradingDataUtils.filter.filterTrades([], badDateFilter);
        errorTests.push({
          name: '잘못된 날짜 범위',
          status: 'pass',
          result: `결과: ${badDateResult.length}건`
        });
      } catch (error) {
        errorTests.push({
          name: '잘못된 날짜 범위',
          status: 'fail',
          error: error.message
        });
      }

      // 데이터 검증 테스트
      try {
        const brokenTrade = { symbol: 'TEST', entry_price: null };
        const isValid = tradingDataUtils.validation.validateTradeData(brokenTrade as any);
        errorTests.push({
          name: '데이터 검증',
          status: isValid ? 'fail' : 'pass',
          result: `잘못된 데이터 ${isValid ? '허용' : '거부'}`
        });
      } catch (error) {
        errorTests.push({
          name: '데이터 검증',
          status: 'fail',
          error: error.message
        });
      }

      const allErrorTestsPassed = errorTests.every(test => test.status === 'pass');

      results.tests.errorHandling = {
        status: allErrorTestsPassed ? 'pass' : 'warning',
        details: {
          tests: errorTests,
          allPassed: allErrorTestsPassed
        }
      };

      if (allErrorTestsPassed) {
        results.summary.passed++;
      } else {
        results.summary.warnings++;
      }
    } catch (error) {
      results.tests.errorHandling = {
        status: 'fail',
        details: { error: error.message }
      };
      results.summary.failed++;
    }

    // 최종 상태 결정
    results.status = results.summary.failed > 0 ? 'failed' : 
                     results.summary.warnings > 0 ? 'warning' : 'success';

    return NextResponse.json(results);

  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      tests: {},
      summary: {
        totalTests: 5,
        passed: 0,
        failed: 5,
        warnings: 0
      }
    }, { status: 500 });
  }
}