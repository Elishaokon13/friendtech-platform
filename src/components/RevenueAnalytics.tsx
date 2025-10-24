'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { RevenueDistributionManager, RevenueMetrics } from '@/lib/revenueDistribution';
import { formatPrice, formatNumber } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3, 
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface RevenueAnalyticsProps {
  coin: CreatorCoin;
  onDataRefresh?: () => void;
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ 
  coin, 
  onDataRefresh 
}) => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'breakdown' | 'predictions'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const revenueManager = new RevenueDistributionManager();

  useEffect(() => {
    loadAnalytics();
  }, [coin, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const metricsData = await revenueManager.getRevenueMetrics(coin.address);
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getRevenueGrowthRate = (): number => {
    // Mock growth rate calculation
    return 15.2; // 15.2% growth
  };

  const getTopPerformingPeriod = (): string => {
    // Mock analysis
    return 'Last 7 days';
  };

  const getRevenueDistributionEfficiency = (): number => {
    // Mock efficiency calculation
    return 94.5; // 94.5% efficiency
  };

  const getPredictedRevenue = (): bigint => {
    // Mock prediction based on current metrics
    if (!metrics) return BigInt(0);
    const growthRate = getRevenueGrowthRate() / 100;
    return BigInt(Math.floor(Number(metrics.totalRevenue) * (1 + growthRate)));
  };

  if (loading && !metrics) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadAnalytics}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-gray-600">Detailed insights for {coin.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(metrics?.totalRevenue || BigInt(0))}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+{getRevenueGrowthRate()}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Distribution Count</p>
                <p className="text-2xl font-bold">{metrics?.distributionCount || 0}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold">{getRevenueDistributionEfficiency()}%</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Optimal</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Best Period</p>
                <p className="text-lg font-bold">{getTopPerformingPeriod()}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Peak</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <PieChart className="h-4 w-4 mr-2" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <Target className="h-4 w-4 mr-2" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="text-sm">Creator Share</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(metrics?.creatorRevenue || BigInt(0))}</p>
                      <p className="text-xs text-gray-600">70%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-600 rounded"></div>
                      <span className="text-sm">Platform Share</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(metrics?.platformRevenue || BigInt(0))}</p>
                      <p className="text-xs text-gray-600">20%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-600 rounded"></div>
                      <span className="text-sm">Holder Share</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(metrics?.holderRevenue || BigInt(0))}</p>
                      <p className="text-xs text-gray-600">10%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">+{getRevenueGrowthRate()}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Distribution Efficiency</span>
                    <span className="font-semibold">{getRevenueDistributionEfficiency()}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average per Distribution</span>
                    <span className="font-semibold">{formatPrice(metrics?.averageDistribution || BigInt(0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Distributions</span>
                    <span className="font-semibold">{metrics?.distributionCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Revenue trend chart would be displayed here</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Integration with charting library (e.g., Chart.js, Recharts) would show:
                  </p>
                  <ul className="text-sm text-gray-400 mt-2 space-y-1">
                    <li>• Daily/Weekly revenue trends</li>
                    <li>• Distribution frequency over time</li>
                    <li>• Growth rate visualization</li>
                    <li>• Seasonal patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Revenue breakdown chart would be displayed here</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Integration with charting library would show:
                  </p>
                  <ul className="text-sm text-gray-400 mt-2 space-y-1">
                    <li>• Pie chart of revenue distribution</li>
                    <li>• Donut chart with percentages</li>
                    <li>• Interactive hover details</li>
                    <li>• Export functionality</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Next Month</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(getPredictedRevenue())}
                    </p>
                    <p className="text-sm text-blue-600">+{getRevenueGrowthRate()}% growth</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900">Next Quarter</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(BigInt(Math.floor(Number(getPredictedRevenue()) * 3)))}
                    </p>
                    <p className="text-sm text-green-600">Projected 3x growth</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900">Next Year</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPrice(BigInt(Math.floor(Number(getPredictedRevenue()) * 12)))}
                    </p>
                    <p className="text-sm text-purple-600">Annual projection</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Prediction Factors</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Current growth rate: {getRevenueGrowthRate()}%</li>
                    <li>• Distribution efficiency: {getRevenueDistributionEfficiency()}%</li>
                    <li>• Historical performance trends</li>
                    <li>• Market conditions and coin performance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

