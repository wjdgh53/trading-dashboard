'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Brain } from 'lucide-react';
import type { RecentTradeInfo } from '@/types/database.types';

interface RecentTradesTableProps {
  trades: RecentTradeInfo[];
  isLoading?: boolean;
}

const RecentTradesTable = ({ trades, isLoading = false }: RecentTradesTableProps) => {
  if (isLoading) {
    return (
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatConfidence = (confidence?: number) => {
    if (confidence === undefined) return 'N/A';
    return `${(confidence * 100).toFixed(0)}%`;
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
        <span className="text-sm text-gray-400">{trades.length} trades</span>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No trades found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Symbol
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  P&L
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Result
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  AI Confidence
                </th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, index) => (
                <tr
                  key={trade.id}
                  className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                    index === trades.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-white">{trade.symbol}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-300">{formatDate(trade.date)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-medium ${
                        trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(trade.pnl)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {trade.winLoss === 'win' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          trade.winLoss === 'win' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {trade.winLoss.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">
                        {formatConfidence(trade.aiConfidence)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RecentTradesTable;