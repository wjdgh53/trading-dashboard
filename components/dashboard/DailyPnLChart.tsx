'use client';

import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { DailyPnLData } from '@/types/database.types';

interface DailyPnLChartProps {
  data: DailyPnLData[];
  isLoading?: boolean;
}

const DailyPnLChart = ({ data, isLoading = false }: DailyPnLChartProps) => {
  if (isLoading) {
    return (
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
          <div className="h-64 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{formatDate(label)}</p>
          <p className="text-white font-medium">
            Daily P&L: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-blue-400 font-medium">
            Cumulative: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily P&L Bar Chart */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Daily P&L</h3>
          <span className="text-sm text-gray-400">{data.length} days</span>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No P&L data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatCurrency}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="pnl"
                radius={[2, 2, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Bar
                    key={`bar-${index}`}
                    fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Cumulative P&L Line Chart */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Cumulative P&L</h3>
          <span className="text-sm text-gray-400">
            {data.length > 0 && formatCurrency(data[data.length - 1]?.cumulativePnL || 0)}
          </span>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No cumulative data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatCurrency}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length && label) {
                    return (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                        <p className="text-gray-300 text-sm">{formatDate(String(label))}</p>
                        <p className="text-blue-400 font-medium">
                          Cumulative: {formatCurrency(Number(payload[0].value))}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulativePnL"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default DailyPnLChart;