'use client';

import { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertCircle } from 'lucide-react';
import MetricsCards from '@/components/dashboard/MetricsCards';
import RecentTradesTable from '@/components/dashboard/RecentTradesTable';
import DailyPnLChart from '@/components/dashboard/DailyPnLChart';
import type { TradeMetrics, RecentTradeInfo, DailyPnLData } from '@/types/database.types';

interface DashboardState {
  metrics: TradeMetrics | null;
  recentTrades: RecentTradeInfo[];
  dailyPnL: DailyPnLData[];
  isLoading: {
    metrics: boolean;
    trades: boolean;
    chart: boolean;
  };
  error: {
    metrics: string | null;
    trades: string | null;
    chart: string | null;
  };
  lastUpdated: Date | null;
}

export default function TradingDashboard() {
  const [state, setState] = useState<DashboardState>({
    metrics: null,
    recentTrades: [],
    dailyPnL: [],
    isLoading: {
      metrics: true,
      trades: true,
      chart: true,
    },
    error: {
      metrics: null,
      trades: null,
      chart: null,
    },
    lastUpdated: null,
  });

  const fetchMetrics = async () => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, metrics: true },
        error: { ...prev.error, metrics: null },
      }));

      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metrics: TradeMetrics = await response.json();
      
      setState(prev => ({
        ...prev,
        metrics,
        isLoading: { ...prev.isLoading, metrics: false },
      }));
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, metrics: 'Failed to load metrics data' },
        isLoading: { ...prev.isLoading, metrics: false },
      }));
    }
  };

  const fetchRecentTrades = async () => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, trades: true },
        error: { ...prev.error, trades: null },
      }));

      const response = await fetch('/api/dashboard/recent-trades?limit=10');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const recentTrades: RecentTradeInfo[] = await response.json();
      
      setState(prev => ({
        ...prev,
        recentTrades,
        isLoading: { ...prev.isLoading, trades: false },
      }));
    } catch (error) {
      console.error('Error fetching recent trades:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, trades: 'Failed to load recent trades' },
        isLoading: { ...prev.isLoading, trades: false },
      }));
    }
  };

  const fetchDailyPnL = async () => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, chart: true },
        error: { ...prev.error, chart: null },
      }));

      const response = await fetch('/api/dashboard/daily-pnl?days=30');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const dailyPnL: DailyPnLData[] = await response.json();
      
      setState(prev => ({
        ...prev,
        dailyPnL,
        isLoading: { ...prev.isLoading, chart: false },
      }));
    } catch (error) {
      console.error('Error fetching daily P&L:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, chart: 'Failed to load P&L chart data' },
        isLoading: { ...prev.isLoading, chart: false },
      }));
    }
  };

  const refreshAllData = async () => {
    setState(prev => ({
      ...prev,
      isLoading: {
        metrics: true,
        trades: true,
        chart: true,
      },
    }));

    await Promise.all([
      fetchMetrics(),
      fetchRecentTrades(),
      fetchDailyPnL(),
    ]);

    setState(prev => ({
      ...prev,
      lastUpdated: new Date(),
    }));
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const hasAnyError = Object.values(state.error).some(error => error !== null);
  const isAnyLoading = Object.values(state.isLoading).some(loading => loading);

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="relative">
                <Activity className="w-8 h-8 text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
                <p className="text-gray-400 text-sm">
                  Real-time portfolio analytics and performance tracking
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {state.lastUpdated && (
                <span className="text-sm text-gray-400">
                  Last updated: {state.lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={refreshAllData}
                disabled={isAnyLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isAnyLoading
                    ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'border-gray-600 bg-gray-800 text-white hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {hasAnyError && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Some data failed to load</span>
              </div>
              <div className="mt-2 text-sm text-red-300">
                {Object.entries(state.error)
                  .filter(([, error]) => error)
                  .map(([key, error]) => (
                    <div key={key}>• {error}</div>
                  ))}
              </div>
            </div>
          )}
        </header>

        <div className="space-y-8">
          {/* Metrics Cards */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6">Portfolio Overview</h2>
            <MetricsCards 
              metrics={state.metrics || {
                totalTrades: 0,
                winRate: 0,
                totalPnL: 0,
                averageReturn: 0,
                bestTrade: 0,
                worstTrade: 0,
                totalWins: 0,
                totalLosses: 0
              }} 
              isLoading={state.isLoading.metrics}
            />
          </section>

          {/* Charts */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6">Performance Analytics</h2>
            <DailyPnLChart 
              data={state.dailyPnL} 
              isLoading={state.isLoading.chart}
            />
          </section>

          {/* Recent Trades */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6">Trading Activity</h2>
            <RecentTradesTable 
              trades={state.recentTrades} 
              isLoading={state.isLoading.trades}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-400 text-sm">
            <p>&copy; 2024 NomadVibe Trading Dashboard. Powered by Supabase & Next.js.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Data
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}