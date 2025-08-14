'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus, Brain, Target, Calendar } from 'lucide-react';
import { formatDate, formatPercentage, formatCurrency } from '@/lib/utils';
import type { TradingHistory } from '@/types/database.types';
import { TableSkeleton } from './TableSkeleton';

// Helper function to cap AI confidence at 100%
const formatAIConfidence = (confidence?: number) => {
  if (!confidence) return '-';
  const cappedConfidence = Math.min(confidence, 100);
  return `${cappedConfidence.toFixed(0)}%`;
};

// Helper function to get action badge styling
const getActionBadge = (action: string) => {
  switch (action.toUpperCase()) {
    case 'BUY':
      return {
        icon: TrendingUp,
        text: 'BUY',
        className: 'bg-green-500/20 text-green-400 border-green-500/50'
      };
    case 'SELL':
      return {
        icon: TrendingDown,
        text: 'SELL',
        className: 'bg-red-500/20 text-red-400 border-red-500/50'
      };
    case 'NO_ACTION':
      return {
        icon: Minus,
        text: 'NO ACTION',
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      };
    default:
      return {
        icon: Minus,
        text: action,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      };
  }
};

// Helper function to get execution status badge styling
const getExecutionStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'EXECUTED':
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'FAILED':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'CANCELLED':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

interface TradingHistoryTableProps {
  trades: TradingHistory[];
  loading?: boolean;
}

type SortField = 'trade_date' | 'symbol' | 'action' | 'ai_confidence' | 'position_size' | 'entry_price' | 'target_price' | 'execution_status';
type SortDirection = 'asc' | 'desc';

export function TradingHistoryTable({ trades, loading = false }: TradingHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('trade_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedHistory = [...trades].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'trade_date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
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

  if (loading) {
    return <TableSkeleton columns={8} rows={5} />;
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-lg font-medium mb-2">No trading history data available</div>
        <div className="text-sm">Your recent trading signals and actions will appear here.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <table className="w-full min-w-[1000px] lg:min-w-full">
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
              onClick={() => handleSort('trade_date')}
            >
              <div className="flex items-center space-x-1">
                <span>Date</span>
                <SortIcon field="trade_date" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('action')}
            >
              <div className="flex items-center space-x-1">
                <span>Action</span>
                <SortIcon field="action" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('ai_confidence')}
            >
              <div className="flex items-center space-x-1">
                <span>AI Confidence</span>
                <SortIcon field="ai_confidence" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors min-w-[100px] hidden lg:table-cell"
              onClick={() => handleSort('position_size')}
            >
              <div className="flex items-center space-x-1">
                <span>Position Size</span>
                <SortIcon field="position_size" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors min-w-[100px] hidden md:table-cell"
              onClick={() => handleSort('entry_price')}
            >
              <div className="flex items-center space-x-1">
                <span>Entry Price</span>
                <SortIcon field="entry_price" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors min-w-[100px] hidden md:table-cell"
              onClick={() => handleSort('target_price')}
            >
              <div className="flex items-center space-x-1">
                <span>Target Price</span>
                <SortIcon field="target_price" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('execution_status')}
            >
              <div className="flex items-center space-x-1">
                <span>Execution Status</span>
                <SortIcon field="execution_status" />
              </div>
            </th>
          </tr>
          </thead>
          <tbody>
          {sortedHistory.map((trade, index) => {
            const actionBadge = getActionBadge(trade.action);
            const ActionIcon = actionBadge.icon;
            
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
                      <div>{formatDate(trade.trade_date)}</div>
                      <div className="md:hidden text-xs text-gray-400 mt-1">
                        {trade.entry_price ? formatCurrency(trade.entry_price) : '-'}
                        {trade.target_price && ` → ${formatCurrency(trade.target_price)}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 hidden sm:table-cell">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(trade.trade_date)}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${actionBadge.className}`}>
                    <ActionIcon className="h-3 w-3 mr-1" />
                    {actionBadge.text}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2 max-w-20">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (trade.ai_confidence || 0) >= 80 ? 'bg-green-500' :
                            (trade.ai_confidence || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(10, Math.min((trade.ai_confidence || 0), 100))}%` }}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Brain className="h-3 w-3 text-blue-400" />
                        <span className="text-sm text-gray-300 min-w-12">
                          {formatAIConfidence(trade.ai_confidence)}
                        </span>
                      </div>
                    </div>
                    <div className="lg:hidden text-xs text-gray-400 mt-1">
                      Size: {trade.position_size ? trade.position_size.toLocaleString() : '-'}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300 hidden lg:table-cell">
                  {trade.position_size ? `${trade.position_size.toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                  {trade.entry_price ? formatCurrency(trade.entry_price) : '-'}
                </td>
                <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                  <div className="flex items-center space-x-1">
                    {trade.target_price && (
                      <Target className="h-4 w-4 text-yellow-400" />
                    )}
                    <span>{trade.target_price ? formatCurrency(trade.target_price) : '-'}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${
                    getExecutionStatusBadge(trade.execution_status)
                  }`}>
                    {trade.execution_status || 'UNKNOWN'}
                  </span>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}