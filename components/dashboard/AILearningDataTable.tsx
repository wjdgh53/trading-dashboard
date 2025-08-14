'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Brain, Activity, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDate, formatPercentage, formatCurrency } from '@/lib/utils';
import type { AiLearningData } from '@/types/database.types';

interface AILearningDataTableProps {
  data: AiLearningData[];
}

type SortField = 'prediction_date' | 'symbol' | 'actual_profit_percentage' | 'rsi_accuracy_score' | 'macd_accuracy_score' | 'vix_level';
type SortDirection = 'asc' | 'desc';

export function AILearningDataTable({ data }: AILearningDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('prediction_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'prediction_date') {
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'text-green-400';
    if (accuracy >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 0.8) return 'bg-green-500';
    if (accuracy >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMarketRegimeColor = (regime: string) => {
    const regimeLower = regime.toLowerCase();
    if (regimeLower.includes('bull')) return 'text-green-400';
    if (regimeLower.includes('bear')) return 'text-red-400';
    if (regimeLower.includes('neutral') || regimeLower.includes('sideways')) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getVixLevel = (vix: number) => {
    if (vix < 20) return { color: 'text-green-400', label: 'Low' };
    if (vix < 30) return { color: 'text-yellow-400', label: 'Medium' };
    return { color: 'text-red-400', label: 'High' };
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No AI learning data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-600">
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('prediction_date')}
            >
              <div className="flex items-center space-x-1">
                <span>Date</span>
                <SortIcon field="prediction_date" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center space-x-1">
                <span>Symbol</span>
                <SortIcon field="symbol" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('actual_profit_percentage')}
            >
              <div className="flex items-center space-x-1">
                <span>Actual Return</span>
                <SortIcon field="actual_profit_percentage" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('rsi_accuracy_score')}
            >
              <div className="flex items-center space-x-1">
                <span>RSI Accuracy</span>
                <SortIcon field="rsi_accuracy_score" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('macd_accuracy_score')}
            >
              <div className="flex items-center space-x-1">
                <span>MACD Accuracy</span>
                <SortIcon field="macd_accuracy_score" />
              </div>
            </th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">Market Regime</th>
            <th 
              className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
              onClick={() => handleSort('vix_level')}
            >
              <div className="flex items-center space-x-1">
                <span>VIX Level</span>
                <SortIcon field="vix_level" />
              </div>
            </th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">Prediction</th>
            <th className="text-left py-3 px-4 text-gray-300 font-medium">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => {
            const isProfit = item.actual_profit_percentage > 0;
            const profitClass = isProfit ? 'text-green-400' : 'text-red-400';
            const vixInfo = getVixLevel(item.vix_level);
            
            return (
              <tr 
                key={item.id} 
                className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                  index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
                }`}
              >
                <td className="py-3 px-4 text-gray-300">
                  {formatDate(item.prediction_date)}
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-blue-400">{item.symbol}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    {isProfit ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`font-semibold ${profitClass}`}>
                      {formatPercentage(item.actual_profit_percentage)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-2 max-w-16">
                      <div 
                        className={`h-2 rounded-full transition-all ${getAccuracyBg(item.rsi_accuracy_score)}`}
                        style={{ width: `${Math.max(10, item.rsi_accuracy_score * 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm min-w-12 ${getAccuracyColor(item.rsi_accuracy_score)}`}>
                      {formatPercentage(item.rsi_accuracy_score)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-2 max-w-16">
                      <div 
                        className={`h-2 rounded-full transition-all ${getAccuracyBg(item.macd_accuracy_score)}`}
                        style={{ width: `${Math.max(10, item.macd_accuracy_score * 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm min-w-12 ${getAccuracyColor(item.macd_accuracy_score)}`}>
                      {formatPercentage(item.macd_accuracy_score)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMarketRegimeColor(item.market_regime)} bg-gray-800 border border-gray-600`}>
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {item.market_regime}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <span className={vixInfo.color}>
                      {item.vix_level.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({vixInfo.label})
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-gray-300">
                    <div className="font-medium capitalize">
                      {item.prediction_type?.replace('_', ' ') || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.prediction_value || '-'}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <Brain className="h-4 w-4 text-blue-400" />
                    <span className={`text-sm ${getAccuracyColor(item.confidence_score || 0.5)}`}>
                      {item.confidence_score ? formatPercentage(item.confidence_score) : 'N/A'}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Row */}
      <tfoot className="border-t-2 border-gray-600">
        <tr className="bg-gray-800/50">
          <td colSpan={3} className="py-3 px-4 text-gray-300 font-medium">
            Summary ({data.length} predictions)
          </td>
          <td className="py-3 px-4">
            <span className="text-blue-400 font-bold">
              Avg: {formatPercentage(data.reduce((sum, item) => sum + item.rsi_accuracy_score, 0) / data.length)}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className="text-blue-400 font-bold">
              Avg: {formatPercentage(data.reduce((sum, item) => sum + item.macd_accuracy_score, 0) / data.length)}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className="text-gray-400 text-sm">
              Bull: {data.filter(d => d.market_regime.toLowerCase().includes('bull')).length} | 
              Bear: {data.filter(d => d.market_regime.toLowerCase().includes('bear')).length}
            </span>
          </td>
          <td className="py-3 px-4">
            <span className="text-gray-400">
              Avg: {(data.reduce((sum, item) => sum + item.vix_level, 0) / data.length).toFixed(1)}
            </span>
          </td>
          <td colSpan={2}></td>
        </tr>
      </tfoot>
    </div>
  );
}