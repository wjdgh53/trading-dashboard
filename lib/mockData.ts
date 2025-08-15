import type { 
  TradeMetrics, 
  RecentTradeInfo, 
  DailyPnLData, 
  MonthlyPnLData,
  SymbolPerformance,
  CompletedTrades 
} from '@/types/database.types';

// Mock Trade Metrics
export const mockTradeMetrics: TradeMetrics = {
  totalTrades: 25,
  winRate: 64.0,
  totalPnL: 3420.50,
  averageReturn: 2.85,
  bestTrade: 1550.00,
  worstTrade: -800.00,
  totalWins: 16,
  totalLosses: 9
};

// Mock Recent Trades
export const mockRecentTrades: RecentTradeInfo[] = [
  {
    id: '1',
    symbol: 'AAPL',
    date: '2024-08-14T15:30:00Z',
    pnl: 425.50,
    winLoss: 'win',
    aiConfidence: 0.87
  },
  {
    id: '2',
    symbol: 'TSLA',
    date: '2024-08-14T14:45:00Z',
    pnl: -320.00,
    winLoss: 'loss',
    aiConfidence: 0.73
  },
  {
    id: '3',
    symbol: 'NVDA',
    date: '2024-08-14T13:20:00Z',
    pnl: 890.75,
    winLoss: 'win',
    aiConfidence: 0.92
  },
  {
    id: '4',
    symbol: 'GOOGL',
    date: '2024-08-14T11:15:00Z',
    pnl: 675.25,
    winLoss: 'win',
    aiConfidence: 0.85
  },
  {
    id: '5',
    symbol: 'MSFT',
    date: '2024-08-14T10:30:00Z',
    pnl: -150.00,
    winLoss: 'loss',
    aiConfidence: 0.68
  },
  {
    id: '6',
    symbol: 'AMZN',
    date: '2024-08-13T16:00:00Z',
    pnl: 550.00,
    winLoss: 'win',
    aiConfidence: 0.81
  },
  {
    id: '7',
    symbol: 'META',
    date: '2024-08-13T14:30:00Z',
    pnl: 380.50,
    winLoss: 'win',
    aiConfidence: 0.79
  },
  {
    id: '8',
    symbol: 'AMD',
    date: '2024-08-13T12:45:00Z',
    pnl: -280.75,
    winLoss: 'loss',
    aiConfidence: 0.65
  }
];

// Mock Daily P&L Data - Last 30 days
export const mockDailyPnL: DailyPnLData[] = [
  { date: '2024-07-15', pnl: 125.50, cumulativePnL: 2580.00 },
  { date: '2024-07-16', pnl: -85.25, cumulativePnL: 2494.75 },
  { date: '2024-07-17', pnl: 320.75, cumulativePnL: 2815.50 },
  { date: '2024-07-18', pnl: 45.00, cumulativePnL: 2860.50 },
  { date: '2024-07-19', pnl: -180.25, cumulativePnL: 2680.25 },
  { date: '2024-07-22', pnl: 275.50, cumulativePnL: 2955.75 },
  { date: '2024-07-23', pnl: 155.25, cumulativePnL: 3111.00 },
  { date: '2024-07-24', pnl: -95.75, cumulativePnL: 3015.25 },
  { date: '2024-07-25', pnl: 380.50, cumulativePnL: 3395.75 },
  { date: '2024-07-26', pnl: 24.75, cumulativePnL: 3420.50 },
  { date: '2024-07-29', pnl: 225.00, cumulativePnL: 3645.50 },
  { date: '2024-07-30', pnl: -125.50, cumulativePnL: 3520.00 },
  { date: '2024-07-31', pnl: 185.75, cumulativePnL: 3705.75 },
  { date: '2024-08-01', pnl: 425.25, cumulativePnL: 4131.00 },
  { date: '2024-08-02', pnl: -320.00, cumulativePnL: 3811.00 },
  { date: '2024-08-05', pnl: 275.50, cumulativePnL: 4086.50 },
  { date: '2024-08-06', pnl: 155.75, cumulativePnL: 4242.25 },
  { date: '2024-08-07', pnl: -85.25, cumulativePnL: 4157.00 },
  { date: '2024-08-08', pnl: 320.00, cumulativePnL: 4477.00 },
  { date: '2024-08-09', pnl: 45.75, cumulativePnL: 4522.75 },
  { date: '2024-08-12', pnl: -180.50, cumulativePnL: 4342.25 },
  { date: '2024-08-13', pnl: 225.25, cumulativePnL: 4567.50 },
  { date: '2024-08-14', pnl: 380.75, cumulativePnL: 4948.25 }
];

// Mock Monthly P&L Data - Last 12 months
export const mockMonthlyPnL: MonthlyPnLData[] = [
  { month: 'Sep 2023', year: 2023, totalPnL: 1245.50, trades: 12, winRate: 58.3, bestTrade: 425.00, worstTrade: -180.50, cumulativePnL: 1245.50 },
  { month: 'Oct 2023', year: 2023, totalPnL: -325.75, trades: 8, winRate: 37.5, bestTrade: 185.25, worstTrade: -320.00, cumulativePnL: 919.75 },
  { month: 'Nov 2023', year: 2023, totalPnL: 875.25, trades: 15, winRate: 66.7, bestTrade: 550.00, worstTrade: -125.50, cumulativePnL: 1795.00 },
  { month: 'Dec 2023', year: 2023, totalPnL: 425.50, trades: 10, winRate: 60.0, bestTrade: 380.75, worstTrade: -95.25, cumulativePnL: 2220.50 },
  { month: 'Jan 2024', year: 2024, totalPnL: 1125.75, trades: 18, winRate: 72.2, bestTrade: 675.00, worstTrade: -150.25, cumulativePnL: 3346.25 },
  { month: 'Feb 2024', year: 2024, totalPnL: -280.50, trades: 9, winRate: 44.4, bestTrade: 225.00, worstTrade: -280.50, cumulativePnL: 3065.75 },
  { month: 'Mar 2024', year: 2024, totalPnL: 725.25, trades: 14, winRate: 64.3, bestTrade: 425.50, worstTrade: -185.75, cumulativePnL: 3791.00 },
  { month: 'Apr 2024', year: 2024, totalPnL: 385.50, trades: 11, winRate: 63.6, bestTrade: 320.00, worstTrade: -125.00, cumulativePnL: 4176.50 },
  { month: 'May 2024', year: 2024, totalPnL: 925.75, trades: 16, winRate: 68.8, bestTrade: 550.25, worstTrade: -180.50, cumulativePnL: 5102.25 },
  { month: 'Jun 2024', year: 2024, totalPnL: -125.25, trades: 7, winRate: 42.9, bestTrade: 155.00, worstTrade: -225.75, cumulativePnL: 4977.00 },
  { month: 'Jul 2024', year: 2024, totalPnL: 685.50, trades: 13, winRate: 69.2, bestTrade: 380.50, worstTrade: -95.25, cumulativePnL: 5662.50 },
  { month: 'Aug 2024', year: 2024, totalPnL: 1285.75, trades: 19, winRate: 73.7, bestTrade: 890.75, worstTrade: -320.00, cumulativePnL: 6948.25 }
];

// Mock Symbol Performance Data
export const mockSymbolPerformance: SymbolPerformance[] = [
  {
    symbol: 'NVDA',
    totalTrades: 8,
    totalPnL: 1425.75,
    winRate: 75.0,
    averageReturn: 4.25,
    bestTrade: 890.75,
    worstTrade: -125.50,
    averageHoldingPeriod: 2.3,
    profitFactor: 3.2,
    sharpeRatio: 1.85,
    maxDrawdown: -8.5,
    lastTradeDate: '2024-08-14T13:20:00Z'
  },
  {
    symbol: 'AAPL',
    totalTrades: 12,
    totalPnL: 1125.25,
    winRate: 66.7,
    averageReturn: 3.15,
    bestTrade: 425.50,
    worstTrade: -180.00,
    averageHoldingPeriod: 1.8,
    profitFactor: 2.8,
    sharpeRatio: 1.65,
    maxDrawdown: -6.2,
    lastTradeDate: '2024-08-14T15:30:00Z'
  },
  {
    symbol: 'GOOGL',
    totalTrades: 9,
    totalPnL: 875.50,
    winRate: 77.8,
    averageReturn: 3.85,
    bestTrade: 675.25,
    worstTrade: -95.50,
    averageHoldingPeriod: 2.1,
    profitFactor: 3.5,
    sharpeRatio: 1.92,
    maxDrawdown: -4.8,
    lastTradeDate: '2024-08-14T11:15:00Z'
  },
  {
    symbol: 'MSFT',
    totalTrades: 15,
    totalPnL: 725.25,
    winRate: 60.0,
    averageReturn: 2.45,
    bestTrade: 380.00,
    worstTrade: -150.00,
    averageHoldingPeriod: 1.5,
    profitFactor: 2.4,
    sharpeRatio: 1.42,
    maxDrawdown: -7.3,
    lastTradeDate: '2024-08-14T10:30:00Z'
  },
  {
    symbol: 'TSLA',
    totalTrades: 11,
    totalPnL: 285.75,
    winRate: 54.5,
    averageReturn: 1.85,
    bestTrade: 550.00,
    worstTrade: -320.00,
    averageHoldingPeriod: 1.2,
    profitFactor: 1.8,
    sharpeRatio: 0.95,
    maxDrawdown: -12.8,
    lastTradeDate: '2024-08-14T14:45:00Z'
  },
  {
    symbol: 'AMZN',
    totalTrades: 7,
    totalPnL: 650.00,
    winRate: 71.4,
    averageReturn: 3.45,
    bestTrade: 550.00,
    worstTrade: -125.25,
    averageHoldingPeriod: 2.8,
    profitFactor: 3.1,
    sharpeRatio: 1.75,
    maxDrawdown: -5.5,
    lastTradeDate: '2024-08-13T16:00:00Z'
  },
  {
    symbol: 'META',
    totalTrades: 6,
    totalPnL: 485.50,
    winRate: 66.7,
    averageReturn: 2.95,
    bestTrade: 380.50,
    worstTrade: -95.00,
    averageHoldingPeriod: 1.9,
    profitFactor: 2.6,
    sharpeRatio: 1.58,
    maxDrawdown: -6.8,
    lastTradeDate: '2024-08-13T14:30:00Z'
  },
  {
    symbol: 'AMD',
    totalTrades: 5,
    totalPnL: 125.25,
    winRate: 60.0,
    averageReturn: 1.55,
    bestTrade: 225.00,
    worstTrade: -280.75,
    averageHoldingPeriod: 1.1,
    profitFactor: 1.4,
    sharpeRatio: 0.75,
    maxDrawdown: -15.2,
    lastTradeDate: '2024-08-13T12:45:00Z'
  }
];

// Helper function to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const mockApiService = {
  async getMetrics(): Promise<TradeMetrics> {
    await delay(500); // Simulate network delay
    return mockTradeMetrics;
  },

  async getRecentTrades(limit: number = 10): Promise<RecentTradeInfo[]> {
    await delay(300);
    return mockRecentTrades.slice(0, limit);
  },

  async getDailyPnL(days: number = 30): Promise<DailyPnLData[]> {
    await delay(400);
    return mockDailyPnL.slice(-days);
  },

  async getMonthlyPnL(months: number = 12): Promise<MonthlyPnLData[]> {
    await delay(450);
    return mockMonthlyPnL.slice(-months);
  },

  async getSymbolPerformance(limit: number = 10): Promise<SymbolPerformance[]> {
    await delay(350);
    return mockSymbolPerformance.slice(0, limit);
  }
};

// Environment check function
export const isDemoMode = (): boolean => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !supabaseUrl || 
         !supabaseKey || 
         supabaseUrl.includes('your-project.supabase.co') ||
         supabaseKey.includes('your-anon-key-here');
};