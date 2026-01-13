'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  Activity,
  Wallet,
  PiggyBank,
  LineChart,
  CreditCard,
  Users,
} from 'lucide-react';

interface RevenueMetric {
  label: string;
  value: string | null;
  change?: string | null;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

interface StripeMetrics {
  mrr: number | null;
  arr: number | null;
  projectedRevenue: number | null;
  activeSubscriptions: number | null;
  mrrGrowth: number | null;
  churnRate: number | null;
  monthlySubscribers: number;
  threeMonthPurchases: number;
}

interface RevenueIntelligenceProps {
  isConnected?: boolean;
  metrics?: {
    mrr?: number | null;
    arr?: number | null;
    projectedRevenue?: number | null;
    activeSubscriptions?: number | null;
    mrrGrowth?: number | null;
    churnRate?: number | null;
  };
}

function SkeletonBar({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />
  );
}

function MetricCard({ metric, isLoading }: { metric: RevenueMetric; isLoading: boolean }) {
  const Icon = metric.icon;
  
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        {metric.trend && metric.change && !isLoading && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            metric.trend === 'up' 
              ? 'bg-emerald-50 text-emerald-600' 
              : metric.trend === 'down'
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-50 text-gray-500'
          }`}>
            {metric.trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : metric.trend === 'down' ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {metric.change}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {metric.label}
        </p>
        {isLoading ? (
          <div className="inline-block px-3 py-1 bg-gray-200 rounded">
            <p className="text-2xl font-bold tracking-tight text-white">
              {metric.value ?? '$0'}
            </p>
          </div>
        ) : (
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            {metric.value ?? 'N/A'}
          </p>
        )}
      </div>
    </div>
  );
}

function MiniChart({ isLoading }: { isLoading: boolean }) {
  const bars = [35, 45, 30, 55, 40, 65, 50, 70, 60, 75, 65, 80];
  
  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-2 rounded-sm transition-all ${
            isLoading 
              ? 'bg-gray-200 animate-pulse' 
              : 'bg-gray-900'
          }`}
          style={{ 
            height: isLoading ? '50%' : `${height}%`,
            opacity: isLoading ? 0.3 : 0.3 + (i / bars.length) * 0.7
          }}
        />
      ))}
    </div>
  );
}

export function RevenueIntelligence({ isConnected: initialConnected = false, metrics: initialMetrics }: RevenueIntelligenceProps) {
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [metrics, setMetrics] = useState<StripeMetrics | null>(initialMetrics as StripeMetrics | null);
  const [isLoading, setIsLoading] = useState(true);
  const [planCounts, setPlanCounts] = useState({ monthly: 0, threeMonth: 0 });

  useEffect(() => {
    async function fetchStripeMetrics() {
      try {
        const response = await fetch('/api/admin/stripe-metrics');
        const data = await response.json();
        
        if (data.isConnected) {
          setIsConnected(true);
          setMetrics(data.metrics);
          setPlanCounts({
            monthly: data.metrics.monthlySubscribers || 0,
            threeMonth: data.metrics.threeMonthPurchases || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch Stripe metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStripeMetrics();
  }, []);
  
  const formatCurrency = (value: number | null | undefined): string | null => {
    if (value === null || value === undefined) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | null | undefined): string | null => {
    if (value === null || value === undefined) return null;
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const revenueMetrics: RevenueMetric[] = [
    {
      label: 'Monthly Revenue',
      value: isConnected ? formatCurrency(metrics?.mrr) : '$0',
      change: isConnected ? formatPercent(metrics?.mrrGrowth) : null,
      trend: isConnected && metrics?.mrrGrowth != null 
        ? (metrics.mrrGrowth > 0 ? 'up' : metrics.mrrGrowth < 0 ? 'down' : 'neutral')
        : undefined,
      icon: DollarSign,
    },
    {
      label: 'Annual Revenue',
      value: isConnected ? formatCurrency(metrics?.arr) : '$0',
      change: null,
      trend: undefined,
      icon: PiggyBank,
    },
    {
      label: 'Projected (90 days)',
      value: isConnected ? formatCurrency(metrics?.projectedRevenue) : 'N/A',
      change: null,
      trend: undefined,
      icon: TrendingUp,
    },
    {
      label: 'Active Subscriptions',
      value: isConnected ? (metrics?.activeSubscriptions?.toString() ?? '0') : '0',
      change: null,
      trend: undefined,
      icon: Wallet,
    },
  ];

  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Intelligence</h2>
            <p className="text-sm text-gray-500">Financial performance overview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-amber-50 text-amber-600'
          }`}>
            <div className={`h-1.5 w-1.5 rounded-full ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`} />
            {isConnected ? 'Live' : 'Awaiting Stripe'}
          </div>
        </div>
      </div>

      {/* Primary Revenue Card */}
      <div className="relative overflow-hidden bg-gray-900 rounded-2xl p-6 mb-4 shadow-xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-50" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left: Primary Metric */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total Revenue (MTD)
                </span>
              </div>
              
              {isLoading ? (
                <>
                  <p className="text-5xl font-bold text-white tracking-tight">$0</p>
                  <p className="text-gray-500 text-sm mt-2">Awaiting Stripe connection</p>
                </>
              ) : (
                <>
                  <p className="text-5xl font-bold text-white tracking-tight">
                    {formatCurrency(metrics?.mrr) ?? '$0'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {metrics?.mrrGrowth != null && metrics.mrrGrowth > 0 && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
                        <ArrowUpRight className="h-4 w-4" />
                        {formatPercent(metrics.mrrGrowth)} vs last month
                      </span>
                    )}
                    {metrics?.mrrGrowth != null && metrics.mrrGrowth < 0 && (
                      <span className="inline-flex items-center gap-1 text-red-400 text-sm font-medium">
                        <TrendingDown className="h-4 w-4" />
                        {formatPercent(metrics.mrrGrowth)} vs last month
                      </span>
                    )}
                    {(metrics?.mrrGrowth === undefined || metrics?.mrrGrowth === null) && (
                      <span className="text-gray-500 text-sm">
                        Growth data pending
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right: Mini Chart */}
            <div className="lg:text-right">
              <div className="flex items-center gap-2 mb-3 lg:justify-end">
                <LineChart className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  12-Month Trend
                </span>
              </div>
              <MiniChart isLoading={isLoading} />
              {!isLoading && (
                <p className="text-xs text-gray-500 mt-2">
                  Revenue trajectory
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueMetrics.map((metric) => (
          <MetricCard 
            key={metric.label} 
            metric={metric} 
            isLoading={isLoading} 
          />
        ))}
      </div>

      {/* Membership Plans Section */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Membership Plans</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Agreement */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">
                Popular
              </span>
            </div>
            <h4 className="text-lg font-bold text-gray-900">Monthly Agreement</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">$50<span className="text-sm font-normal text-gray-500">/month</span></p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <span className="text-sm">Subscribers</span>
              </div>
              <span className={`text-lg font-semibold ${planCounts.monthly > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                {planCounts.monthly}
              </span>
            </div>
          </div>
          
          {/* 3 Months Paid-In-Full */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                One-time
              </span>
            </div>
            <h4 className="text-lg font-bold text-gray-900">3 Months Paid-In-Full</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">$150<span className="text-sm font-normal text-gray-500"> one time</span></p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <span className="text-sm">Purchased</span>
              </div>
              <span className={`text-lg font-semibold ${planCounts.threeMonth > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                {planCounts.threeMonth}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zero State Message */}
      {!isConnected && (
        <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Connect Stripe to unlock revenue intelligence
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time revenue metrics, subscription analytics, and financial projections will appear here once Stripe is integrated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
