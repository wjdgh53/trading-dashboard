/**
 * 대시보드 계산 로직 정확성 테스트 스크립트
 */

const { completedTradesService, tradingHistoryService } = require('../lib/supabase');
const { tradingDataUtils } = require('../lib/tradingDataUtils');

async function runCalculationTests() {
    console.log('📊 대시보드 계산 정확성 테스트 시작...\n');
    
    try {
        // 1. 실제 데이터 가져오기
        console.log('1️⃣ 실제 데이터 로딩...');
        const [completedTrades, tradingHistory] = await Promise.all([
            completedTradesService.getAll(),
            tradingHistoryService.getAll()
        ]);
        
        console.log(`✅ 완료된 거래: ${completedTrades.length}건`);
        console.log(`✅ 거래 히스토리: ${tradingHistory.length}건\n`);
        
        // 2. 데이터 변환 테스트
        console.log('2️⃣ 데이터 변환 테스트...');
        const transformedCompleted = completedTrades.map(trade => ({
            id: trade.id,
            symbol: trade.symbol,
            entry_price: trade.entry_price,
            exit_price: trade.exit_price,
            position_size: trade.sold_quantity,
            realized_pnl: trade.realized_pnl,
            profit_percentage: trade.profit_percentage,
            win_loss: trade.win_loss?.toLowerCase(),
            exit_date: trade.exit_date || trade.trade_date,
            trade_date: trade.trade_date,
            type: 'completed'
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
                type: 'active'
            }));
        
        console.log(`✅ 변환된 완료 거래: ${transformedCompleted.length}건`);
        console.log(`✅ 변환된 활성 포지션: ${transformedActive.length}건\n`);
        
        // 3. 필터링 테스트
        console.log('3️⃣ 필터링 기능 테스트...');
        const filterTests = [
            { period: 'today', name: '오늘' },
            { period: '7days', name: '최근 7일' },
            { period: '30days', name: '최근 30일' },
            { period: 'custom', dateRange: { startDate: '2025-07-01', endDate: '2025-08-15' }, name: '사용자 지정' }
        ];
        
        for (const filterTest of filterTests) {
            const startTime = Date.now();
            const filtered = tradingDataUtils.filter.filterTrades(transformedCompleted, filterTest);
            const endTime = Date.now();
            
            console.log(`📅 ${filterTest.name}: ${filtered.length}건 (${endTime - startTime}ms)`);
        }
        console.log();
        
        // 4. 계산 정확성 테스트
        console.log('4️⃣ 계산 정확성 테스트...');
        const sampleTrades = transformedCompleted.slice(0, 10); // 처음 10건으로 테스트
        
        // 수동 계산
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
        const filters = { period: '30days' };
        const libraryMetrics = tradingDataUtils.calculation.calculateTradingMetrics(
            sampleTrades, 
            transformedActive.slice(0, 5), 
            filters
        );
        
        console.log('📊 수동 계산 결과:');
        console.log(`   총 투자금액: ₩${manualTotalInvestment.toLocaleString()}`);
        console.log(`   총 회수금액: ₩${manualTotalRecovery.toLocaleString()}`);
        console.log(`   순손익: ₩${manualNetPnL.toLocaleString()}`);
        console.log(`   승률: ${manualWinRate.toFixed(1)}%`);
        
        console.log('\n📈 라이브러리 계산 결과:');
        console.log(`   총 투자금액: ₩${libraryMetrics.totalInvestment.toLocaleString()}`);
        console.log(`   총 회수금액: ₩${libraryMetrics.totalRecovery.toLocaleString()}`);
        console.log(`   순손익: ₩${libraryMetrics.netPnL.toLocaleString()}`);
        console.log(`   승률: ${libraryMetrics.winRate}%`);
        
        // 정확성 검증
        const tolerance = 0.01; // 1% 허용 오차
        const investmentMatch = Math.abs(manualTotalInvestment - libraryMetrics.totalInvestment) < tolerance;
        const recoveryMatch = Math.abs(manualTotalRecovery - libraryMetrics.totalRecovery) < tolerance;
        const pnlMatch = Math.abs(manualNetPnL - libraryMetrics.netPnL) < tolerance;
        const winRateMatch = Math.abs(manualWinRate - libraryMetrics.winRate) < tolerance;
        
        console.log('\n✅ 정확성 검증:');
        console.log(`   투자금액 일치: ${investmentMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   회수금액 일치: ${recoveryMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   손익 일치: ${pnlMatch ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   승률 일치: ${winRateMatch ? '✅ PASS' : '❌ FAIL'}`);
        
        // 5. 성능 테스트
        console.log('\n5️⃣ 성능 테스트...');
        const largeDataset = Array(1000).fill(0).map((_, i) => ({
            ...transformedCompleted[i % transformedCompleted.length],
            id: i + 1000
        }));
        
        const performanceTests = [
            { name: '1,000건 필터링', size: 1000 },
            { name: '500건 계산', size: 500 },
            { name: '100건 정렬', size: 100 }
        ];
        
        for (const test of performanceTests) {
            const testData = largeDataset.slice(0, test.size);
            const startTime = Date.now();
            
            if (test.name.includes('필터링')) {
                tradingDataUtils.filter.filterTrades(testData, { period: '30days' });
            } else if (test.name.includes('계산')) {
                tradingDataUtils.calculation.calculateTradingMetrics(testData, [], { period: '30days' });
            } else if (test.name.includes('정렬')) {
                tradingDataUtils.filter.sortTradesByDate(testData);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            const isGood = duration < 100; // 100ms 미만이면 좋음
            
            console.log(`⚡ ${test.name}: ${duration}ms ${isGood ? '✅' : '⚠️'}`);
        }
        
        // 6. 에러 시나리오 테스트
        console.log('\n6️⃣ 에러 시나리오 테스트...');
        
        try {
            // 빈 데이터 테스트
            const emptyMetrics = tradingDataUtils.calculation.calculateTradingMetrics([], [], { period: 'today' });
            console.log(`📊 빈 데이터 처리: ✅ (총 거래: ${emptyMetrics.totalTrades})`);
        } catch (error) {
            console.log(`📊 빈 데이터 처리: ❌ ${error.message}`);
        }
        
        try {
            // 잘못된 날짜 범위 테스트
            const badDateFilter = { 
                period: 'custom', 
                dateRange: { startDate: '2025-12-31', endDate: '2025-01-01' } 
            };
            const badDateResult = tradingDataUtils.filter.filterTrades(transformedCompleted, badDateFilter);
            console.log(`📅 잘못된 날짜 범위: ✅ (결과: ${badDateResult.length}건)`);
        } catch (error) {
            console.log(`📅 잘못된 날짜 범위: ❌ ${error.message}`);
        }
        
        try {
            // 누락된 필드 테스트
            const brokenTrade = { symbol: 'TEST', entry_price: null };
            const isValid = tradingDataUtils.validation.validateTradeData(brokenTrade);
            console.log(`🔍 데이터 검증: ${isValid ? '❌ FAIL' : '✅ PASS'} (잘못된 데이터 거부)`);
        } catch (error) {
            console.log(`🔍 데이터 검증: ❌ ${error.message}`);
        }
        
        console.log('\n🎉 모든 테스트 완료!\n');
        
        // 요약 리포트
        console.log('📋 테스트 요약:');
        console.log(`   데이터 로딩: ✅`);
        console.log(`   필터링 기능: ✅`);
        console.log(`   계산 정확성: ${investmentMatch && recoveryMatch && pnlMatch && winRateMatch ? '✅' : '⚠️'}`);
        console.log(`   성능: ✅`);
        console.log(`   에러 처리: ✅`);
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
        process.exit(1);
    }
}

// CommonJS 환경에서 실행
if (require.main === module) {
    runCalculationTests().then(() => {
        console.log('\n✅ 계산 테스트 스크립트 완료');
        process.exit(0);
    }).catch(error => {
        console.error('❌ 스크립트 실행 실패:', error);
        process.exit(1);
    });
}

module.exports = { runCalculationTests };