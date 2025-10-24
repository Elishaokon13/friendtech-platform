'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { RevenueDashboard } from './RevenueDashboard';
import { RevenueAnalytics } from './RevenueAnalytics';
import { RevenueDistributionManager, RevenueDistribution } from '@/lib/revenueDistribution';
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
  Target,
  Zap
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface RevenueIntegrationProps {
  coin: CreatorCoin | null;
  isCreator: boolean;
  onRevenueDistributed?: (distribution: RevenueDistribution) => void;
}

export const RevenueIntegration: React.FC<RevenueIntegrationProps> = ({ 
  coin, 
  isCreator, 
  onRevenueDistributed 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  const [revenueStats, setRevenueStats] = useState<{
    totalRevenue: bigint;
    totalDistributions: number;
    lastDistribution: Date | null;
    efficiency: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const revenueManager = new RevenueDistributionManager();

  useEffect(() => {
    if (coin) {
      loadRevenueStats();
    }
  }, [coin]);

  const loadRevenueStats = async () => {
    if (!coin) return;

    setLoading(true);
    try {
      const metrics = await revenueManager.getRevenueMetrics(coin.address);
      const history = await revenueManager.getDistributionHistory(coin.address);
      
      setRevenueStats({
        totalRevenue: metrics.totalRevenue,
        totalDistributions: metrics.distributionCount,
        lastDistribution: history[0]?.distributionDate || null,
        efficiency: 94.5 // Mock efficiency
      });
    } catch (error) {
      console.error('Error loading revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyVariant = (efficiency: number) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 70) return 'warning';
    return 'destructive';
  };

  if (!coin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Select a coin to view revenue distribution</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Distribution</h2>
          <p className="text-gray-600">Manage revenue sharing for {coin.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {isCreator ? 'Creator Mode' : 'Viewer Mode'}
          </Badge>
          <Button variant="outline" onClick={loadRevenueStats} loading={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      {revenueStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(revenueStats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Distributions</p>
                  <p className="text-2xl font-bold">{revenueStats.totalDistributions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Last Distribution</p>
                  <p className="text-lg font-bold">
                    {revenueStats.lastDistribution 
                      ? revenueStats.lastDistribution.toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold">{revenueStats.efficiency}%</p>
                  <Badge variant={getEfficiencyVariant(revenueStats.efficiency)} className="mt-1">
                    {revenueStats.efficiency >= 90 ? 'Excellent' : 
                     revenueStats.efficiency >= 70 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Distribution Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Revenue Distribution Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900">Creator (70%)</h3>
              <p className="text-sm text-blue-700 mt-1">
                Direct revenue to content creator
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900">Platform (20%)</h3>
              <p className="text-sm text-purple-700 mt-1">
                Platform maintenance and development
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-orange-900">Holders (10%)</h3>
              <p className="text-sm text-orange-700 mt-1">
                Distributed proportionally to token holders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          {isCreator && (
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <RevenueDashboard
            coin={coin}
            isCreator={isCreator}
            onRevenueDistributed={onRevenueDistributed}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <RevenueAnalytics
            coin={coin}
            onDataRefresh={loadRevenueStats}
          />
        </TabsContent>

        {isCreator && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Distribution Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Creator Percentage</span>
                          <Badge variant="outline">70%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Platform Percentage</span>
                          <Badge variant="outline">20%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Holder Percentage</span>
                          <Badge variant="outline">10%</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Distribution Rules</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Minimum Distribution</span>
                          <Badge variant="outline">0.01 ETH</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Distribution Interval</span>
                          <Badge variant="outline">24 hours</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Auto Distribution</span>
                          <Badge variant="success">Enabled</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Revenue Sources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Trading Fees</h4>
                        <p className="text-sm text-gray-600">
                          Revenue from buy/sell transactions on the platform
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Content Access</h4>
                        <p className="text-sm text-gray-600">
                          Revenue from exclusive content access fees
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Premium Features</h4>
                        <p className="text-sm text-gray-600">
                          Revenue from premium platform features
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Partnerships</h4>
                        <p className="text-sm text-gray-600">
                          Revenue from strategic partnerships and collaborations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
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

