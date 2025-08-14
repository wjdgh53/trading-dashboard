'use client';

import { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertCircle, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { CompletedTradesTable } from '@/components/dashboard/CompletedTradesTable';
import { TradingHistoryTable } from '@/components/dashboard/TradingHistoryTable';
import { AILearningDataTable } from '@/components/dashboard/AILearningDataTable';
import { StatCard } from '@/components/dashboard/StatCard';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useTradingData, useFilteredTradingData, useCalculatedMetrics } from '@/hooks/useTradingData';

interface DashboardFilters {
  symbol: string;
  dateFrom: string;
  dateTo: string;
  winLoss: 'all' | 'win' | 'loss';
}

interface DashboardMetrics {
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  averageReturn: number;
  bestTrade: number;
  worstTrade: number;
  totalWins: number;
  totalLosses: number;
}

export default function ProfessionalTradingDashboard() {
  const [activeTab, setActiveTab] = useState<'completed' | 'history' | 'ai'>('completed');
  const [filters, setFilters] = useState<DashboardFilters>({
    symbol: 'all',
    dateFrom: '',
    dateTo: '',
    winLoss: 'all',
  });

  // Use custom hooks for data management
  const { completedTrades, tradingHistory, aiLearningData, symbols, loading, error, lastUpdated, refetch } = useTradingData();
  
  // Get filtered data
  const { filteredCompletedTrades, filteredTradingHistory, filteredAiLearningData } = useFilteredTradingData(
    { completedTrades, tradingHistory, aiLearningData, symbols, loading, error, lastUpdated },
    filters
  );

  // Calculate metrics from filtered data
  const metrics = useCalculatedMetrics(filteredCompletedTrades);

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const renderMetricsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total P&L"
          value={formatCurrency(metrics.totalPnL)}
          subtitle={`${filteredCompletedTrades.length} trades`}
          icon={TrendingUp}
          color={metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}
          bgColor={metrics.totalPnL >= 0 ? 'bg-green-400/10' : 'bg-red-400/10'}
          trend={metrics.totalPnL >= 0 ? 'up' : 'down'}
          isLoading={loading}
        />
        <StatCard
          title="Win Rate"
          value={formatPercentage(metrics.winRate)}
          subtitle={`${metrics.totalWins}W / ${metrics.totalLosses}L`}
          icon={Target}
          color={metrics.winRate >= 50 ? 'text-green-400' : 'text-red-400'}
          bgColor={metrics.winRate >= 50 ? 'bg-green-400/10' : 'bg-red-400/10'}
          trend={metrics.winRate >= 50 ? 'up' : 'down'}
          isLoading={loading}
        />
        <StatCard
          title="Active Trades"
          value={filteredTradingHistory.length.toString()}
          subtitle={`${symbols.length} symbols`}
          icon={Users}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
          isLoading={loading}
        />
        <StatCard
          title="Best Trade"
          value={formatCurrency(metrics.bestTrade)}
          subtitle={`Worst: ${formatCurrency(metrics.worstTrade)}`}
          icon={DollarSign}
          color="text-green-400"
          bgColor="bg-green-400/10"
          trend="up"
          isLoading={loading}
        />
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'completed':
        return <CompletedTradesTable trades={filteredCompletedTrades} loading={loading} />;
      case 'history':
        return <TradingHistoryTable trades={filteredTradingHistory} loading={loading} />;
      case 'ai':
        return <AILearningDataTable data={filteredAiLearningData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="relative">
                <Activity className="w-8 h-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Professional Trading Dashboard</h1>
                <p className="text-gray-400 text-sm">
                  Real-time portfolio analytics with comprehensive data filtering
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-sm text-gray-400">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={refetch}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  loading
                    ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'border-gray-600 bg-gray-800 text-white hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
        </header>

        {/* Metrics Cards */}
        {renderMetricsCards()}

        {/* Filters */}
        <DashboardFilters
          filters={filters}
          symbols={symbols}
          onFilterChange={handleFilterChange}
        />

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'completed', label: 'Completed Trades', count: filteredCompletedTrades.length },
                { key: 'history', label: 'Trading History', count: filteredTradingHistory.length },
                { key: 'ai', label: 'AI Learning Data', count: filteredAiLearningData.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-400 text-sm">
            <p>&copy; 2024 NomadVibe Professional Trading Dashboard. Real-time data powered by Supabase.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Data
              </span>
              <span>v2.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}