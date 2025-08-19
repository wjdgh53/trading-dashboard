/**
 * Trading Data Utilities
 * High-performance filtering and calculation utilities for trading data
 */

import type { AdvancedTradeData, FilterOptions, DateRange, DateFilterPeriod } from '@/hooks/useAdvancedTradingData';

// Date utility functions
export const dateUtils = {
  /**
   * Get date range based on filter period
   */
  getDateRange(period: DateFilterPeriod, customRange?: DateRange): DateRange {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        return { startDate: today, endDate: today };
      
      case '7days': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { startDate: weekAgo.toISOString().split('T')[0], endDate: today };
      }
      
      case '30days': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { startDate: monthAgo.toISOString().split('T')[0], endDate: today };
      }
      
      case 'custom':
        return customRange || { startDate: today, endDate: today };
      
      default:
        return { startDate: today, endDate: today };
    }
  },

  /**
   * Check if a date string falls within a date range
   */
  isDateInRange(dateStr: string, range: DateRange): boolean {
    const date = new Date(dateStr);
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date
    
    return date >= start && date <= end;
  },

  /**
   * Format date range for display
   */
  formatDateRange(period: DateFilterPeriod, customRange?: DateRange): string {
    switch (period) {
      case 'today':
        return '오늘';
      case '7days':
        return '최근 7일';
      case '30days':
        return '최근 30일';
      case 'custom':
        if (customRange) {
          return `${customRange.startDate} ~ ${customRange.endDate}`;
        }
        return '사용자 지정';
      default:
        return '전체';
    }
  },

  /**
   * Get business days between two dates
   */
  getBusinessDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return businessDays;
  },
};

// High-performance filtering functions
export const filterUtils = {
  /**
   * Filter trades by multiple criteria with optimized performance
   */
  filterTrades(trades: AdvancedTradeData[], filters: FilterOptions): AdvancedTradeData[] {
    if (!trades.length) return [];

    const dateRange = dateUtils.getDateRange(filters.period, filters.dateRange);
    
    // Debug logging for filtering
    console.log('=== DEBUG: Filtering Trades ===');
    console.log('Input trades count:', trades.length);
    console.log('Filter period:', filters.period);
    console.log('Date range:', dateRange);
    
    // Use optimized filter chain
    const filtered = trades.filter(trade => {
      // Date filter (most selective first)
      const tradeDate = trade.exit_date || trade.trade_date;
      if (!dateUtils.isDateInRange(tradeDate, dateRange)) return false;
      
      // Symbol filter
      if (filters.symbol && trade.symbol.toLowerCase() !== filters.symbol.toLowerCase()) {
        return false;
      }
      
      // Win/Loss filter
      if (filters.winLoss && trade.win_loss !== filters.winLoss) {
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered trades count:', filtered.length);
    console.log('Sample filtered trades:', filtered.slice(0, 3));
    
    return filtered;
  },

  /**
   * Filter completed trades only
   */
  filterCompletedTrades(trades: AdvancedTradeData[], filters: FilterOptions): AdvancedTradeData[] {
    const completedTrades = trades.filter(trade => trade.type === 'completed');
    return this.filterTrades(completedTrades, filters);
  },

  /**
   * Filter active trades only
   */
  filterActiveTrades(trades: AdvancedTradeData[], filters: FilterOptions): AdvancedTradeData[] {
    const activeTrades = trades.filter(trade => trade.type === 'active');
    return this.filterTrades(activeTrades, filters);
  },

  /**
   * Get unique symbols from trades
   */
  getUniqueSymbols(trades: AdvancedTradeData[]): string[] {
    const symbols = new Set(trades.map(trade => trade.symbol));
    return Array.from(symbols).sort();
  },

  /**
   * Group trades by symbol
   */
  groupTradesBySymbol(trades: AdvancedTradeData[]): Record<string, AdvancedTradeData[]> {
    return trades.reduce((groups, trade) => {
      const symbol = trade.symbol;
      if (!groups[symbol]) {
        groups[symbol] = [];
      }
      groups[symbol].push(trade);
      return groups;
    }, {} as Record<string, AdvancedTradeData[]>);
  },

  /**
   * Sort trades by date (newest first)
   */
  sortTradesByDate(trades: AdvancedTradeData[], ascending = false): AdvancedTradeData[] {
    return [...trades].sort((a, b) => {
      const dateA = new Date(a.exit_date || a.trade_date).getTime();
      const dateB = new Date(b.exit_date || b.trade_date).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  /**
   * Sort trades by PnL
   */
  sortTradesByPnL(trades: AdvancedTradeData[], ascending = false): AdvancedTradeData[] {
    return [...trades].sort((a, b) => {
      const pnlA = a.realized_pnl || a.unrealized_pl || 0;
      const pnlB = b.realized_pnl || b.unrealized_pl || 0;
      return ascending ? pnlA - pnlB : pnlB - pnlA;
    });
  },
};

// Performance calculation utilities
export const calculationUtils = {
  /**
   * Calculate comprehensive trading metrics
   */
  calculateTradingMetrics(completedTrades: AdvancedTradeData[], activeTrades: AdvancedTradeData[], filters: FilterOptions) {
    // Debug logging for investment calculation
    console.log('=== DEBUG: Trading Metrics Calculation ===');
    console.log('Completed trades count:', completedTrades.length);
    console.log('Sample completed trades:', completedTrades.slice(0, 3));
    
    // Investment and recovery calculations
    // Method 1: Using position_size (매도수량 기준)
    const totalInvestmentMethod1 = completedTrades.reduce(
      (sum, trade) => {
        const tradeInvestment = trade.entry_price * trade.position_size;
        return sum + tradeInvestment;
      }, 0
    );
    
    // Method 2: Using realized PnL to reverse calculate (더 정확한 방법)
    const totalInvestmentMethod2 = completedTrades.reduce(
      (sum, trade) => {
        // realized_pnl = (exit_price - entry_price) * actual_quantity
        // 따라서 actual_quantity = realized_pnl / (exit_price - entry_price)
        // investment = entry_price * actual_quantity
        
        if (trade.exit_price && trade.realized_pnl !== undefined && trade.realized_pnl !== null) {
          const priceDiff = trade.exit_price - trade.entry_price;
          if (Math.abs(priceDiff) > 0.001) { // 가격 차이가 있는 경우만
            const actualQuantity = Math.abs(trade.realized_pnl / priceDiff);
            const tradeInvestment = trade.entry_price * actualQuantity;
            console.log(`Trade ${trade.id} Method2: ${trade.symbol} - Entry: $${trade.entry_price}, Exit: $${trade.exit_price}, PnL: $${trade.realized_pnl}, Calc Qty: ${actualQuantity}, Investment: $${tradeInvestment}`);
            return sum + tradeInvestment;
          }
        }
        // Fallback to method 1
        const fallbackInvestment = trade.entry_price * trade.position_size;
        console.log(`Trade ${trade.id} Fallback: ${trade.symbol} - Entry: $${trade.entry_price}, Size: ${trade.position_size}, Investment: $${fallbackInvestment}`);
        return sum + fallbackInvestment;
      }, 0
    );
    
    console.log('Total Investment Method 1 (position_size):', totalInvestmentMethod1);
    console.log('Total Investment Method 2 (reverse calc):', totalInvestmentMethod2);
    
    // Use the more accurate method 2, fallback to method 1 if needed
    const totalInvestment = totalInvestmentMethod2 || totalInvestmentMethod1;
    
    const totalRecovery = completedTrades.reduce(
      (sum, trade) => sum + ((trade.exit_price || 0) * trade.position_size), 0
    );
    
    const netPnL = completedTrades.reduce(
      (sum, trade) => sum + (trade.realized_pnl || 0), 0
    );
    
    // Trade statistics
    const totalTrades = completedTrades.length;
    const winningTrades = completedTrades.filter(trade => trade.win_loss === 'win');
    const losingTrades = completedTrades.filter(trade => trade.win_loss === 'loss');
    
    const totalWins = winningTrades.length;
    const totalLosses = losingTrades.length;
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    
    // Performance metrics
    const returns = completedTrades.map(trade => trade.profit_percentage || 0);
    const averageReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const bestTrade = returns.length > 0 ? Math.max(...returns) : 0;
    const worstTrade = returns.length > 0 ? Math.min(...returns) : 0;
    
    // Risk metrics
    const profitFactor = this.calculateProfitFactor(winningTrades, losingTrades);
    const sharpeRatio = this.calculateSharpeRatio(returns);
    const maxDrawdown = this.calculateMaxDrawdown(completedTrades);
    
    const activePositions = activeTrades.length;
    const filteredPeriod = dateUtils.formatDateRange(filters.period, filters.dateRange);

    return {
      totalInvestment: Math.round(totalInvestment * 100) / 100,
      totalRecovery: Math.round(totalRecovery * 100) / 100,
      netPnL: Math.round(netPnL * 100) / 100,
      totalTrades,
      winRate: Math.round(winRate * 100) / 100,
      totalWins,
      totalLosses,
      activePositions,
      averageReturn: Math.round(averageReturn * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      filteredPeriod,
    };
  },

  /**
   * Calculate profit factor (gross profit / gross loss)
   */
  calculateProfitFactor(winningTrades: AdvancedTradeData[], losingTrades: AdvancedTradeData[]): number {
    const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0));
    
    return grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  },

  /**
   * Calculate Sharpe ratio (simplified)
   */
  calculateSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? (avgReturn / stdDev) : 0;
  },

  /**
   * Calculate maximum drawdown
   */
  calculateMaxDrawdown(trades: AdvancedTradeData[]): number {
    if (trades.length === 0) return 0;
    
    const sortedTrades = filterUtils.sortTradesByDate(trades, true); // ascending order
    let cumulativePnL = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    for (const trade of sortedTrades) {
      cumulativePnL += trade.realized_pnl || 0;
      
      if (cumulativePnL > peak) {
        peak = cumulativePnL;
      }
      
      const drawdown = ((peak - cumulativePnL) / Math.abs(peak)) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  },

  /**
   * Calculate daily PnL data for charts
   */
  calculateDailyPnL(trades: AdvancedTradeData[]): Array<{ date: string; pnl: number; cumulativePnL: number }> {
    const dailyData = new Map<string, number>();
    
    // Group trades by date and sum PnL
    for (const trade of trades) {
      if (trade.type === 'completed' && trade.realized_pnl !== undefined) {
        const date = (trade.exit_date || trade.trade_date).split('T')[0];
        const currentPnL = dailyData.get(date) || 0;
        dailyData.set(date, currentPnL + trade.realized_pnl);
      }
    }
    
    // Convert to array and sort by date
    const sortedDates = Array.from(dailyData.keys()).sort();
    let cumulativePnL = 0;
    
    return sortedDates.map(date => {
      const pnl = dailyData.get(date) || 0;
      cumulativePnL += pnl;
      return {
        date,
        pnl: Math.round(pnl * 100) / 100,
        cumulativePnL: Math.round(cumulativePnL * 100) / 100,
      };
    });
  },

  /**
   * Calculate symbol performance statistics
   */
  calculateSymbolPerformance(trades: AdvancedTradeData[]): Array<{
    symbol: string;
    totalTrades: number;
    totalPnL: number;
    winRate: number;
    averageReturn: number;
    bestTrade: number;
    worstTrade: number;
  }> {
    const symbolGroups = filterUtils.groupTradesBySymbol(
      trades.filter(trade => trade.type === 'completed')
    );
    
    return Object.entries(symbolGroups).map(([symbol, symbolTrades]) => {
      const totalTrades = symbolTrades.length;
      const totalPnL = symbolTrades.reduce((sum, trade) => sum + (trade.realized_pnl || 0), 0);
      const wins = symbolTrades.filter(trade => trade.win_loss === 'win').length;
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      
      const returns = symbolTrades.map(trade => trade.profit_percentage || 0);
      const averageReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
      const bestTrade = returns.length > 0 ? Math.max(...returns) : 0;
      const worstTrade = returns.length > 0 ? Math.min(...returns) : 0;
      
      return {
        symbol,
        totalTrades,
        totalPnL: Math.round(totalPnL * 100) / 100,
        winRate: Math.round(winRate * 100) / 100,
        averageReturn: Math.round(averageReturn * 100) / 100,
        bestTrade: Math.round(bestTrade * 100) / 100,
        worstTrade: Math.round(worstTrade * 100) / 100,
      };
    }).sort((a, b) => b.totalPnL - a.totalPnL); // Sort by total PnL descending
  },
};

// Amount calculation utilities with error checking
export const amountUtils = {
  /**
   * Calculate purchase amount (entry_price × position_size) with error checking
   */
  calculatePurchaseAmount(entry_price: number | null | undefined, position_size: number | null | undefined): number {
    // Input validation
    if (entry_price == null || position_size == null) return 0;
    if (typeof entry_price !== 'number' || typeof position_size !== 'number') return 0;
    if (entry_price < 0 || position_size < 0) return 0;
    if (!isFinite(entry_price) || !isFinite(position_size)) return 0;
    
    const result = entry_price * position_size;
    
    // Result validation
    if (!isFinite(result) || result < 0) return 0;
    
    // Round to 2 decimal places to avoid floating point precision issues
    return Math.round(result * 100) / 100;
  },

  /**
   * Calculate sale amount (exit_price × position_size) with error checking
   */
  calculateSaleAmount(exit_price: number | null | undefined, position_size: number | null | undefined): number {
    // Input validation
    if (exit_price == null || position_size == null) return 0;
    if (typeof exit_price !== 'number' || typeof position_size !== 'number') return 0;
    if (exit_price < 0 || position_size < 0) return 0;
    if (!isFinite(exit_price) || !isFinite(position_size)) return 0;
    
    const result = exit_price * position_size;
    
    // Result validation
    if (!isFinite(result) || result < 0) return 0;
    
    // Round to 2 decimal places to avoid floating point precision issues
    return Math.round(result * 100) / 100;
  },

  /**
   * Calculate both purchase and sale amounts for a trade
   */
  calculateTradeAmounts(trade: AdvancedTradeData): { purchaseAmount: number; saleAmount: number } {
    const purchaseAmount = this.calculatePurchaseAmount(trade.entry_price, trade.position_size);
    const saleAmount = this.calculateSaleAmount(trade.exit_price, trade.position_size);
    
    return { purchaseAmount, saleAmount };
  },

  /**
   * Format amount as currency string
   */
  formatCurrency(amount: number): string {
    if (!isFinite(amount)) return '$0.00';
    
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Validate amount is safe for calculation
   */
  isValidAmount(amount: number | null | undefined): boolean {
    return amount != null && 
           typeof amount === 'number' && 
           isFinite(amount) && 
           amount >= 0;
  },

  /**
   * Calculate total investment amount for multiple trades
   */
  calculateTotalInvestment(trades: AdvancedTradeData[]): number {
    if (!Array.isArray(trades) || trades.length === 0) return 0;
    
    const total = trades.reduce((sum, trade) => {
      const purchaseAmount = this.calculatePurchaseAmount(trade.entry_price, trade.position_size);
      return sum + purchaseAmount;
    }, 0);
    
    return Math.round(total * 100) / 100;
  },

  /**
   * Calculate total recovery amount for multiple trades
   */
  calculateTotalRecovery(trades: AdvancedTradeData[]): number {
    if (!Array.isArray(trades) || trades.length === 0) return 0;
    
    const total = trades.reduce((sum, trade) => {
      const saleAmount = this.calculateSaleAmount(trade.exit_price, trade.position_size);
      return sum + saleAmount;
    }, 0);
    
    return Math.round(total * 100) / 100;
  },
};

// Data validation utilities
export const validationUtils = {
  /**
   * Validate trade data
   */
  validateTradeData(trade: AdvancedTradeData): boolean {
    return !!(
      trade.id &&
      trade.symbol &&
      trade.entry_price > 0 &&
      trade.position_size > 0 &&
      trade.trade_date
    );
  },

  /**
   * Validate filter options
   */
  validateFilterOptions(filters: FilterOptions): boolean {
    if (!filters.period) return false;
    
    if (filters.period === 'custom') {
      return !!(
        filters.dateRange &&
        filters.dateRange.startDate &&
        filters.dateRange.endDate &&
        new Date(filters.dateRange.startDate) <= new Date(filters.dateRange.endDate)
      );
    }
    
    return true;
  },

  /**
   * Clean and validate trade data array
   */
  cleanTradeData(trades: AdvancedTradeData[]): AdvancedTradeData[] {
    return trades.filter(this.validateTradeData);
  },
};

// Export all utilities as a single object for easier imports
export const tradingDataUtils = {
  date: dateUtils,
  filter: filterUtils,
  calculation: calculationUtils,
  amount: amountUtils,
  validation: validationUtils,
};