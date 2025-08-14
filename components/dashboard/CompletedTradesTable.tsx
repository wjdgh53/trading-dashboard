'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Clock, Calendar, Brain } from 'lucide-react';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils';
import type { CompletedTrades } from '@/types/database.types';
import { TableSkeleton } from './TableSkeleton';

interface CompletedTradesTableProps {
  trades: CompletedTrades[];
  loading?: boolean;
}

// Helper function to cap AI confidence at 100%
const formatAIConfidence = (confidence?: number) => {
  if (!confidence) return '-';
  const cappedConfidence = Math.min(confidence, 100);
  return `${cappedConfidence.toFixed(0)}%`;
};

// Helper function to calculate investment and final amounts
const calculateTradeAmounts = (trade: CompletedTrades) => {
  const quantity = trade.sold_quantity || trade.quantity || 0;
  const investmentAmount = trade.entry_price * quantity;
  const finalAmount = trade.exit_price * quantity;
  const calculatedPnL = finalAmount - investmentAmount;
  const calculatedProfitPercent = ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100;
  
  return {
    investmentAmount,
    finalAmount,
    calculatedPnL,
    calculatedProfitPercent,
    quantity
  };
};

type SortField = 'exit_date' | 'entry_date' | 'symbol' | 'realized_pnl' | 'profit_percentage' | 'trade_duration_hours' | 'ai_confidence';
type SortDirection = 'asc' | 'desc';

export function CompletedTradesTable({ trades, loading = false }: CompletedTradesTableProps) {
  const [sortField, setSortField] = useState<SortField>('exit_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'exit_date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return '-';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  if (loading) {
    return <TableSkeleton columns={12} rows={5} />;
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-lg font-medium mb-2">No completed trades data available</div>
        <div className="text-sm">Your completed trades will appear here once you have trading activity.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <table className="w-full min-w-[1200px] lg:min-w-full">
          <thead>
          <tr className="border-b border-gray-600">
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors min-w-[80px]"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center space-x-1">
                <span>Symbol</span>
                <SortIcon field="symbol" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors min-w-[100px] hidden sm:table-cell"
              onClick={() => handleSort('entry_date')}
            >
              <div className="flex items-center space-x-1">
                <span>Entry Date</span>
                <SortIcon field="entry_date" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('exit_date')}
            >
              <div className="flex items-center space-x-1">
                <span>Exit Date</span>
                <SortIcon field="exit_date" />
              </div>
            </th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium min-w-[90px] hidden md:table-cell">Entry Price</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium min-w-[90px] hidden md:table-cell">Exit Price</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium min-w-[80px] hidden lg:table-cell">Quantity</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium min-w-[100px] hidden lg:table-cell">Investment</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium min-w-[100px] hidden lg:table-cell">Final Amount</th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('realized_pnl')}
            >
              <div className="flex items-center space-x-1">
                <span>Realized P&L</span>
                <SortIcon field="realized_pnl" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('profit_percentage')}
            >
              <div className="flex items-center space-x-1">
                <span>Profit %</span>
                <SortIcon field="profit_percentage" />
              </div>
            </th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">WIN/LOSS</th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors min-w-[110px] hidden xl:table-cell"
              onClick={() => handleSort('ai_confidence')}
            >
              <div className="flex items-center space-x-1">
                <span>AI Confidence</span>
                <SortIcon field="ai_confidence" />
              </div>
            </th>
          </tr>
          </thead>
          <tbody>
          {sortedTrades.map((trade, index) => {
            const tradeAmounts = calculateTradeAmounts(trade);
            const isProfit = trade.realized_pnl > 0;
            const profitClass = isProfit ? 'text-green-400' : 'text-red-400';
            
            return (
              <tr 
                key={trade.id} 
                className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                  index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-400">{trade.symbol}</span>
                    <div className="sm:hidden text-xs text-gray-400 mt-1">
                      <div>{formatDate(trade.entry_date)} → {formatDate(trade.exit_date)}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span>{formatCurrency(trade.entry_price)} → {formatCurrency(trade.exit_price)}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 hidden sm:table-cell">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(trade.entry_date)}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(trade.exit_date)}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                  {formatCurrency(trade.entry_price)}
                </td>
                <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                  {formatCurrency(trade.exit_price)}
                </td>
                <td className="py-3 px-4 text-gray-300 hidden lg:table-cell">
                  {tradeAmounts.quantity ? tradeAmounts.quantity.toLocaleString() : '-'}
                </td>
                <td className="py-3 px-4 text-gray-300 hidden lg:table-cell">
                  <span className="font-medium">{formatCurrency(tradeAmounts.investmentAmount)}</span>
                </td>
                <td className="py-3 px-4 text-gray-300 hidden lg:table-cell">
                  <span className="font-medium">{formatCurrency(tradeAmounts.finalAmount)}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      {isProfit ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`font-semibold ${profitClass}`}>
                        {formatCurrency(trade.realized_pnl)}
                      </span>
                    </div>
                    <div className="lg:hidden text-xs text-gray-400 mt-1">
                      Investment: {formatCurrency(tradeAmounts.investmentAmount)}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className={`font-semibold ${profitClass}`}>
                      {formatPercentage(trade.profit_percentage)}
                    </span>
                    <div className="xl:hidden text-xs text-gray-400 mt-1">
                      AI: {formatAIConfidence(trade.ai_confidence)}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    trade.win_loss === 'win'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    {trade.win_loss === 'win' ? 'WIN' : 'LOSS'}
                  </span>
                </td>
                <td className="py-3 px-4 hidden xl:table-cell">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      {formatAIConfidence(trade.ai_confidence)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
          
          {/* Summary Row */}
          <tfoot className="border-t-2 border-gray-600">
        <tr className="bg-gray-800/50">
          <td colSpan={6} className="py-3 px-4 text-gray-300 font-medium">
            Summary ({trades.length} trades)
          </td>
          <td className="py-3 px-4">
            <span className="font-bold text-blue-400">
              {formatCurrency(trades.reduce((sum, trade) => {
                const amounts = calculateTradeAmounts(trade);
                return sum + amounts.investmentAmount;
              }, 0))}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className="font-bold text-blue-400">
              {formatCurrency(trades.reduce((sum, trade) => {
                const amounts = calculateTradeAmounts(trade);
                return sum + amounts.finalAmount;
              }, 0))}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className={`font-bold ${
              trades.reduce((sum, trade) => sum + trade.realized_pnl, 0) >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {formatCurrency(trades.reduce((sum, trade) => sum + trade.realized_pnl, 0))}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className={`font-bold ${
              trades.reduce((sum, trade) => sum + trade.profit_percentage, 0) / trades.length >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {formatPercentage(trades.reduce((sum, trade) => sum + trade.profit_percentage, 0) / trades.length)}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className="text-gray-300 font-medium">
              {trades.filter(t => t.win_loss === 'win').length}W / {trades.filter(t => t.win_loss === 'loss').length}L
            </span>
          </td>
          <td className="py-3 px-4">
            <span className="text-gray-300">
              Avg: {formatAIConfidence(trades.reduce((sum, trade) => sum + (trade.ai_confidence || 0), 0) / trades.length)}
            </span>
          </td>
        </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}