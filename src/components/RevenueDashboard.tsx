'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input } from '@/components/ui';
import { RevenueDistributionManager, RevenueDistribution, RevenueMetrics, DistributionConfig } from '@/lib/revenueDistribution';
import { formatPrice, formatNumber } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Settings, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface RevenueDashboardProps {
  coin: CreatorCoin;
  isCreator: boolean;
  onRevenueDistributed?: (distribution: RevenueDistribution) => void;
}

export const RevenueDashboard: React.FC<RevenueDashboardProps> = ({ 
  coin, 
  isCreator, 
  onRevenueDistributed 
}) => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [distributionHistory, setDistributionHistory] = useState<RevenueDistribution[]>([]);
  const [config, setConfig] = useState<DistributionConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  const [showConfigModal, setShowConfigModal] = useState(false);

  const revenueManager = new RevenueDistributionManager();

  useEffect(() => {
    loadRevenueData();
  }, [coin]);

  const loadRevenueData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [metricsData, historyData, configData] = await Promise.all([
        revenueManager.getRevenueMetrics(coin.address),
        revenueManager.getDistributionHistory(coin.address),
        Promise.resolve(revenueManager.getDistributionConfig())
      ]);
      
      setMetrics(metricsData);
      setDistributionHistory(historyData);
      setConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const handleDistributeRevenue = async () => {
    if (!isCreator) return;
    
    setLoading(true);
    try {
      // This would trigger actual revenue distribution
      // For now, we'll simulate it
      const mockDistribution: RevenueDistribution = {
        id: `dist_${Date.now()}`,
        coinAddress: coin.address,
        creatorId: coin.creatorId,
        totalRevenue: parseEther('0.5'),
        creatorShare: parseEther('0.35'),
        platformShare: parseEther('0.1'),
        holderShare: parseEther('0.05'),
        distributionDate: new Date(),
        status: 'completed'
      };
      
      setDistributionHistory(prev => [mockDistribution, ...prev]);
      onRevenueDistributed?.(mockDistribution);
      
      // Refresh metrics
      await loadRevenueData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to distribute revenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading && !metrics) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading revenue data...</span>
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
            <Button onClick={loadRevenueData}>Retry</Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h2>
          <p className="text-gray-600">Revenue distribution for {coin.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isCreator && (
            <Button onClick={handleDistributeRevenue} loading={loading}>
              <DollarSign className="h-4 w-4 mr-2" />
              Distribute Revenue
            </Button>
          )}
          <Button variant="outline" onClick={loadRevenueData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(metrics.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Creator Share</p>
                  <p className="text-2xl font-bold">{formatPrice(metrics.creatorRevenue)}</p>
                  <p className="text-xs text-gray-500">70%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Platform Share</p>
                  <p className="text-2xl font-bold">{formatPrice(metrics.platformRevenue)}</p>
                  <p className="text-xs text-gray-500">20%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Holder Share</p>
                  <p className="text-2xl font-bold">{formatPrice(metrics.holderRevenue)}</p>
                  <p className="text-xs text-gray-500">10%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          {isCreator && (
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="text-sm">Creator (70%)</span>
                    </div>
                    <span className="font-semibold">{formatPrice(metrics?.creatorRevenue || BigInt(0))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-600 rounded"></div>
                      <span className="text-sm">Platform (20%)</span>
                    </div>
                    <span className="font-semibold">{formatPrice(metrics?.platformRevenue || BigInt(0))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-600 rounded"></div>
                      <span className="text-sm">Holders (10%)</span>
                    </div>
                    <span className="font-semibold">{formatPrice(metrics?.holderRevenue || BigInt(0))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Distributions</span>
                    <span className="font-semibold">{metrics?.distributionCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Distribution</span>
                    <span className="font-semibold">{formatPrice(metrics?.averageDistribution || BigInt(0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Distribution</span>
                    <span className="font-semibold">
                      {distributionHistory[0]?.distributionDate.toLocaleDateString() || 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Earners */}
          {metrics?.topEarners && metrics.topEarners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Earners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.topEarners.map((earner, index) => (
                    <div key={earner.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{earner.address.slice(0, 6)}...{earner.address.slice(-4)}</p>
                          <p className="text-sm text-gray-600">{earner.percentage.toFixed(1)}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(earner.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution History</CardTitle>
            </CardHeader>
            <CardContent>
              {distributionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No distributions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {distributionHistory.map((distribution) => (
                    <div key={distribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(distribution.status)}
                        <div>
                          <p className="font-medium">{formatPrice(distribution.totalRevenue)}</p>
                          <p className="text-sm text-gray-600">
                            {distribution.distributionDate.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Creator</p>
                          <p className="font-semibold">{formatPrice(distribution.creatorShare)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Platform</p>
                          <p className="font-semibold">{formatPrice(distribution.platformShare)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Holders</p>
                          <p className="font-semibold">{formatPrice(distribution.holderShare)}</p>
                        </div>
                        <Badge variant={getStatusVariant(distribution.status)}>
                          {distribution.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isCreator && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Creator Percentage
                      </label>
                      <Input
                        type="number"
                        value={config?.creatorPercentage || 70}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 0 && value <= 100) {
                            setConfig(prev => prev ? { ...prev, creatorPercentage: value } : null);
                          }
                        }}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Percentage
                      </label>
                      <Input
                        type="number"
                        value={config?.platformPercentage || 20}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 0 && value <= 100) {
                            setConfig(prev => prev ? { ...prev, platformPercentage: value } : null);
                          }
                        }}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Holder Percentage
                      </label>
                      <Input
                        type="number"
                        value={config?.holderPercentage || 10}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 0 && value <= 100) {
                            setConfig(prev => prev ? { ...prev, holderPercentage: value } : null);
                          }
                        }}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Distribution (ETH)
                      </label>
                      <Input
                        type="number"
                        step="0.001"
                        value={Number(formatEther(config?.minimumDistribution || BigInt(0)))}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 0) {
                            setConfig(prev => prev ? { ...prev, minimumDistribution: parseEther(value.toString()) } : null);
                          }
                        }}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distribution Interval (hours)
                      </label>
                      <Input
                        type="number"
                        value={config?.distributionInterval || 24}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0) {
                            setConfig(prev => prev ? { ...prev, distributionInterval: value } : null);
                          }
                        }}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setConfig(revenueManager.getDistributionConfig())}>
                      Reset
                    </Button>
                    <Button onClick={() => {
                      if (config) {
                        revenueManager.updateDistributionConfig(config);
                        setShowConfigModal(false);
                      }
                    }}>
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

