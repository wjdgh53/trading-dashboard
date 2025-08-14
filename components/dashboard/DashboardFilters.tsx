'use client';

import { Filter, Calendar, TrendingUp, X } from 'lucide-react';

interface DashboardFiltersProps {
  filters: {
    symbol: string;
    dateFrom: string;
    dateTo: string;
    winLoss: 'all' | 'win' | 'loss';
  };
  symbols: string[];
  onFilterChange: (filters: any) => void;
}

export function DashboardFilters({ filters, symbols, onFilterChange }: DashboardFiltersProps) {
  const handleSymbolChange = (symbol: string) => {
    onFilterChange({ symbol });
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFilterChange({ [field]: value });
  };

  const handleWinLossChange = (winLoss: 'all' | 'win' | 'loss') => {
    onFilterChange({ winLoss });
  };

  const clearFilters = () => {
    onFilterChange({
      symbol: 'all',
      dateFrom: '',
      dateTo: '',
      winLoss: 'all'
    });
  };

  const hasActiveFilters = filters.symbol !== 'all' || filters.dateFrom || filters.dateTo || filters.winLoss !== 'all';

  return (
    <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-white font-medium">Filters</h3>
          {hasActiveFilters && (
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-xs text-blue-400">Filters Active</span>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Symbol Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Symbol
          </label>
          <select
            value={filters.symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Symbols</option>
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>From Date</span>
            </div>
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleDateChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>To Date</span>
            </div>
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleDateChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Win/Loss Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>Result</span>
            </div>
          </label>
          <div className="flex space-x-1">
            {[
              { value: 'all', label: 'All', class: 'bg-gray-600 hover:bg-gray-500' },
              { value: 'win', label: 'Wins', class: 'bg-green-600 hover:bg-green-500' },
              { value: 'loss', label: 'Losses', class: 'bg-red-600 hover:bg-red-500' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleWinLossChange(option.value as any)}
                className={`flex-1 px-3 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  filters.winLoss === option.value
                    ? option.class
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400">Quick filters:</span>
          <button
            onClick={() => handleDateChange('dateFrom', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 transition-colors"
          >
            Last 7 days
          </button>
          <button
            onClick={() => handleDateChange('dateFrom', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 transition-colors"
          >
            Last 30 days
          </button>
          <button
            onClick={() => handleDateChange('dateFrom', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 transition-colors"
          >
            Last 3 months
          </button>
          <button
            onClick={() => handleWinLossChange('win')}
            className="px-3 py-1 text-xs bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/30 transition-colors"
          >
            Winners only
          </button>
          <button
            onClick={() => handleWinLossChange('loss')}
            className="px-3 py-1 text-xs bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/30 transition-colors"
          >
            Losers only
          </button>
        </div>
      </div>
    </div>
  );
}