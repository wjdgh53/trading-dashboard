'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import type { TradeMetrics } from '@/types/database.types';

interface MetricsCardsProps {
  metrics: TradeMetrics;
  isLoading?: boolean;
}

const MetricsCards = ({ metrics, isLoading = false }: MetricsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 bg-gray-900 border-gray-800 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-20"></div>
              </div>
              <div className="h-8 w-8 bg-gray-700 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const cards = [
    {
      title: 'Total P&L',
      value: formatCurrency(metrics.totalPnL),
      icon: metrics.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: metrics.totalPnL >= 0 ? 'bg-green-400/10' : 'bg-red-400/10',
    },
    {
      title: 'Win Rate',
      value: formatPercentage(metrics.winRate),
      icon: Target,
      color: metrics.winRate >= 50 ? 'text-green-400' : 'text-red-400',
      bgColor: metrics.winRate >= 50 ? 'bg-green-400/10' : 'bg-red-400/10',
    },
    {
      title: 'Total Trades',
      value: metrics.totalTrades.toString(),
      icon: Award,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      subtitle: `${metrics.totalWins}W / ${metrics.totalLosses}L`,
    },
    {
      title: 'Best Trade',
      value: formatCurrency(metrics.bestTrade),
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      subtitle: `Worst: ${formatCurrency(metrics.worstTrade)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={index}
            className="p-6 bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsCards;