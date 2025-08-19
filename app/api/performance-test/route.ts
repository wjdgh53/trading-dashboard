import { NextRequest, NextResponse } from 'next/server';
import { completedTradesService, tradingHistoryService } from '@/lib/supabase';
import { tradingDataUtils } from '@/lib/tradingDataUtils';

export async function GET(request: NextRequest) {
  try {
    const results = {
      status: 'success',
      timestamp: new Date().toISOString(),
      performance: {
        dataLoading: { times: [], averageTime: 0, status: 'pending' },
        memoryUsage: { before: 0, after: 0, peak: 0, status: 'pending' },
        filtering: { times: [], averageTime: 0, status: 'pending' },
        calculations: { times: [], averageTime: 0, status: 'pending' },
        caching: { hitRate: 0, efficiency: 0, status: 'pending' },
        concurrency: { maxConcurrent: 0, avgResponseTime: 0, status: 'pending' }
      },
      recommendations: []
    };

    // 1. 데이터 로딩 성능 테스트 (5회 반복)
    console.log('1️⃣ 데이터 로딩 성능 테스트...');
    const loadingTimes = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      const [completedTrades, tradingHistory] = await Promise.all([
        completedTradesService.getAll(),
        tradingHistoryService.getAll()
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      loadingTimes.push(duration);
      
      // 잠시 대기 (캐시 효과 제거)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    results.performance.dataLoading = {
      times: loadingTimes,
      averageTime: loadingTimes.reduce((a, b) => a + b, 0) / loadingTimes.length,
      status: loadingTimes.every(t => t < 2000) ? 'excellent' : 
              loadingTimes.every(t => t < 5000) ? 'good' : 'poor'
    };

    // 2. 메모리 사용량 테스트
    console.log('2️⃣ 메모리 사용량 테스트...');
    const memoryBefore = process.memoryUsage();
    
    // 대용량 데이터 처리 시뮬레이션
    const [completedTrades, tradingHistory] = await Promise.all([
      completedTradesService.getAll(),
      tradingHistoryService.getAll()
    ]);
    
    // 10,000건의 가상 데이터 생성
    const largeDataset = Array(10000).fill(0).map((_, i) => ({
      id: i,
      symbol: ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'META'][i % 5],
      entry_price: 100 + Math.random() * 400,
      exit_price: 100 + Math.random() * 400,
      position_size: Math.floor(Math.random() * 100) + 1,
      realized_pnl: (Math.random() - 0.5) * 1000,
      profit_percentage: (Math.random() - 0.5) * 20,
      win_loss: Math.random() > 0.6 ? 'win' : 'loss',
      exit_date: new Date().toISOString(),
      trade_date: new Date().toISOString(),
      type: 'completed' as const
    }));
    
    const memoryPeak = process.memoryUsage();
    
    // 메모리 정리
    const memoryAfter = process.memoryUsage();
    
    results.performance.memoryUsage = {
      before: Math.round(memoryBefore.heapUsed / 1024 / 1024 * 100) / 100,
      after: Math.round(memoryAfter.heapUsed / 1024 / 1024 * 100) / 100,
      peak: Math.round(memoryPeak.heapUsed / 1024 / 1024 * 100) / 100,
      status: memoryPeak.heapUsed < 100 * 1024 * 1024 ? 'excellent' : 
              memoryPeak.heapUsed < 200 * 1024 * 1024 ? 'good' : 'poor'
    };

    // 3. 필터링 성능 테스트 (다양한 크기)
    console.log('3️⃣ 필터링 성능 테스트...');
    const filteringSizes = [100, 500, 1000, 5000, 10000];
    const filteringTimes = [];
    
    for (const size of filteringSizes) {
      const testData = largeDataset.slice(0, size);
      const filterOptions = [
        { period: 'today' as const },
        { period: '7days' as const },
        { period: '30days' as const },
        { period: 'custom' as const, dateRange: { startDate: '2025-01-01', endDate: '2025-12-31' } }
      ];
      
      const sizeResults = [];
      for (const filter of filterOptions) {
        const startTime = Date.now();
        tradingDataUtils.filter.filterTrades(testData, filter);
        const endTime = Date.now();
        sizeResults.push(endTime - startTime);
      }
      
      filteringTimes.push({
        size,
        times: sizeResults,
        averageTime: sizeResults.reduce((a, b) => a + b, 0) / sizeResults.length
      });
    }
    
    const overallFilteringAvg = filteringTimes.reduce((sum, test) => sum + test.averageTime, 0) / filteringTimes.length;
    
    results.performance.filtering = {
      times: filteringTimes,
      averageTime: overallFilteringAvg,
      status: overallFilteringAvg < 10 ? 'excellent' : 
              overallFilteringAvg < 50 ? 'good' : 'poor'
    };

    // 4. 계산 성능 테스트
    console.log('4️⃣ 계산 성능 테스트...');
    const calculationSizes = [100, 500, 1000, 5000];
    const calculationTimes = [];
    
    for (const size of calculationSizes) {
      const testData = largeDataset.slice(0, size);
      const activeData = testData.slice(0, Math.floor(size * 0.1)); // 10% 활성
      
      const startTime = Date.now();
      tradingDataUtils.calculation.calculateTradingMetrics(
        testData, 
        activeData, 
        { period: '30days' }
      );
      const endTime = Date.now();
      
      calculationTimes.push({
        size,
        time: endTime - startTime
      });
    }
    
    const overallCalcAvg = calculationTimes.reduce((sum, test) => sum + test.time, 0) / calculationTimes.length;
    
    results.performance.calculations = {
      times: calculationTimes,
      averageTime: overallCalcAvg,
      status: overallCalcAvg < 20 ? 'excellent' : 
              overallCalcAvg < 100 ? 'good' : 'poor'
    };

    // 5. 캐싱 효율성 테스트
    console.log('5️⃣ 캐싱 효율성 테스트...');
    const cacheTests = [];
    
    // 첫 번째 호출 (캐시 미스)
    const firstCallStart = Date.now();
    await completedTradesService.getAll();
    const firstCallTime = Date.now() - firstCallStart;
    
    // 두 번째 호출 (캐시 히트 예상)
    const secondCallStart = Date.now();
    await completedTradesService.getAll();
    const secondCallTime = Date.now() - secondCallStart;
    
    const cacheEfficiency = firstCallTime > 0 ? (1 - secondCallTime / firstCallTime) * 100 : 0;
    
    results.performance.caching = {
      hitRate: cacheEfficiency,
      efficiency: secondCallTime < firstCallTime ? 'excellent' : 'poor',
      status: cacheEfficiency > 50 ? 'excellent' : 
              cacheEfficiency > 20 ? 'good' : 'poor'
    };

    // 6. 동시 요청 처리 성능
    console.log('6️⃣ 동시 요청 처리 테스트...');
    const concurrentRequests = 10;
    const concurrentStartTime = Date.now();
    
    const concurrentPromises = Array(concurrentRequests).fill(0).map(async () => {
      const start = Date.now();
      await completedTradesService.getAll();
      return Date.now() - start;
    });
    
    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentTotalTime = Date.now() - concurrentStartTime;
    const avgConcurrentTime = concurrentResults.reduce((a, b) => a + b, 0) / concurrentResults.length;
    
    results.performance.concurrency = {
      maxConcurrent: concurrentRequests,
      avgResponseTime: avgConcurrentTime,
      totalTime: concurrentTotalTime,
      status: avgConcurrentTime < 1000 ? 'excellent' : 
              avgConcurrentTime < 3000 ? 'good' : 'poor'
    };

    // 7. 성능 권장사항 생성
    if (results.performance.dataLoading.averageTime > 2000) {
      results.recommendations.push({
        category: 'DataLoading',
        issue: '데이터 로딩 시간이 길음',
        suggestion: '데이터베이스 인덱스 최적화 또는 페이지네이션 구현',
        priority: 'high'
      });
    }
    
    if (results.performance.memoryUsage.peak > 150) {
      results.recommendations.push({
        category: 'Memory',
        issue: '메모리 사용량이 높음',
        suggestion: '데이터 스트리밍 또는 가상화 구현',
        priority: 'medium'
      });
    }
    
    if (results.performance.filtering.averageTime > 50) {
      results.recommendations.push({
        category: 'Filtering',
        issue: '필터링 성능이 저조함',
        suggestion: '인덱싱 또는 사전 필터링 구현',
        priority: 'medium'
      });
    }
    
    if (results.performance.calculations.averageTime > 100) {
      results.recommendations.push({
        category: 'Calculations',
        issue: '계산 성능이 저조함',
        suggestion: '계산 결과 캐싱 또는 백그라운드 처리',
        priority: 'low'
      });
    }

    // 전체 상태 결정
    const allStatuses = Object.values(results.performance).map(test => 
      typeof test === 'object' && 'status' in test ? test.status : 'pending'
    );
    
    if (allStatuses.every(status => status === 'excellent')) {
      results.status = 'excellent';
    } else if (allStatuses.some(status => status === 'poor')) {
      results.status = 'needs_improvement';
    } else {
      results.status = 'good';
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('성능 테스트 실행 중 오류:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      performance: {},
      recommendations: [{
        category: 'Error',
        issue: '성능 테스트 실행 실패',
        suggestion: '시스템 안정성 점검 필요',
        priority: 'critical'
      }]
    }, { status: 500 });
  }
}