'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="relative">
              <Activity className="w-12 h-12 text-trading-green" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-trading-green rounded-full animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              Trading Dashboard
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-trading-white-muted mb-8 max-w-3xl mx-auto">
            Advanced trading analytics with AI-powered insights, real-time market data, and comprehensive performance tracking.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="status-badge status-success">
              <Zap className="w-4 h-4 mr-1" />
              Real-time Data
            </span>
            <span className="status-badge status-info">
              <BarChart3 className="w-4 h-4 mr-1" />
              Advanced Analytics
            </span>
            <span className="status-badge status-warning">
              AI-Powered Insights
            </span>
          </div>
        </header>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Portfolio Overview Card */}
          <div className="trading-card group hover:border-glow-green transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-trading-white">Portfolio Overview</h3>
              <TrendingUp className="w-6 h-6 text-trading-green group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-trading-white-muted">Total Value</span>
                <span className="text-2xl font-bold profit-positive">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-trading-white-muted">24h Change</span>
                <span className="profit-positive">+0.00%</span>
              </div>
              <div className="w-full bg-trading-dark-lighter rounded-full h-2">
                <div className="bg-gradient-to-r from-trading-green to-trading-green-light h-2 rounded-full w-0"></div>
              </div>
            </div>
          </div>

          {/* Active Trades Card */}
          <div className="trading-card group hover:border-glow-green transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-trading-white">Active Trades</h3>
              <Activity className="w-6 h-6 text-trading-green group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-trading-white-muted">Open Positions</span>
                <span className="text-2xl font-bold text-trading-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-trading-white-muted">Total P&L</span>
                <span className="profit-neutral">$0.00</span>
              </div>
              <div className="text-sm text-trading-white-muted">
                No active trades
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="trading-card group hover:border-glow-green transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-trading-white">AI Insights</h3>
              <BarChart3 className="w-6 h-6 text-trading-green group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-trading-white-muted">Accuracy Rate</span>
                <span className="text-2xl font-bold profit-positive">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-trading-white-muted">Predictions</span>
                <span className="text-trading-white">0</span>
              </div>
              <div className="text-sm text-trading-white-muted">
                Learning from market data...
              </div>
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="trading-card mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-trading-white">Market Status</h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-trading-green rounded-full animate-pulse"></div>
              <span className="text-sm text-trading-white-muted">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-trading-dark-lighter rounded-lg">
              <div className="text-sm text-trading-white-muted mb-1">BTC/USD</div>
              <div className="text-lg font-bold text-trading-white">--</div>
              <div className="text-sm profit-neutral">--</div>
            </div>
            <div className="text-center p-4 bg-trading-dark-lighter rounded-lg">
              <div className="text-sm text-trading-white-muted mb-1">ETH/USD</div>
              <div className="text-lg font-bold text-trading-white">--</div>
              <div className="text-sm profit-neutral">--</div>
            </div>
            <div className="text-center p-4 bg-trading-dark-lighter rounded-lg">
              <div className="text-sm text-trading-white-muted mb-1">SPY</div>
              <div className="text-lg font-bold text-trading-white">--</div>
              <div className="text-sm profit-neutral">--</div>
            </div>
            <div className="text-center p-4 bg-trading-dark-lighter rounded-lg">
              <div className="text-sm text-trading-white-muted mb-1">QQQ</div>
              <div className="text-lg font-bold text-trading-white">--</div>
              <div className="text-sm profit-neutral">--</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center animate-slide-up delay-200">
          <h3 className="text-xl font-semibold text-trading-white mb-6">Get Started</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button className="trading-button-primary flex-1">
              Connect Wallet
            </button>
            <button className="trading-button-secondary flex-1">
              View Analytics
            </button>
          </div>
          <p className="text-sm text-trading-white-muted mt-4">
            Connect your trading accounts to start tracking performance
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-trading-white-muted">
          <div className="border-t border-trading-gray pt-8">
            <p>&copy; 2024 NomadVibe Trading Dashboard. Built with Next.js 14 and Supabase.</p>
            <p className="text-xs mt-2">
              Ready for Vercel deployment with full TypeScript support
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}