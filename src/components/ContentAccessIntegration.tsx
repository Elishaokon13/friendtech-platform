'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { ContentManager } from './ContentManager';
import { ContentViewer } from './ContentViewer';
import { ContentAccessManager, ContentAccess, AccessTier } from '@/lib/contentAccess';
import { formatPrice, formatNumber } from '@/lib/utils';
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Lock, 
  Unlock,
  FileText,
  Settings,
  BarChart3,
  Shield,
  Star,
  Zap
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface ContentAccessIntegrationProps {
  coin: CreatorCoin | null;
  userId: string;
  isCreator: boolean;
  onContentAccess?: (contentId: string) => void;
}

export const ContentAccessIntegration: React.FC<ContentAccessIntegrationProps> = ({ 
  coin, 
  userId, 
  isCreator, 
  onContentAccess 
}) => {
  const [activeTab, setActiveTab] = useState<'viewer' | 'manager' | 'analytics'>('viewer');
  const [accessTiers, setAccessTiers] = useState<AccessTier[]>([]);
  const [contentStats, setContentStats] = useState<{
    totalContent: number;
    totalViews: number;
    totalRevenue: bigint;
    activeUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const contentManager = new ContentAccessManager();

  useEffect(() => {
    if (coin) {
      loadAccessTiers();
      loadContentStats();
    }
  }, [coin]);

  const loadAccessTiers = async () => {
    try {
      const tiers = contentManager.getAccessTiers();
      setAccessTiers(tiers);
    } catch (error) {
      console.error('Error loading access tiers:', error);
    }
  };

  const loadContentStats = async () => {
    if (!coin) return;

    setLoading(true);
    try {
      // This would load real stats from the database
      // For now, we'll use mock data
      setContentStats({
        totalContent: 12,
        totalViews: 2500,
        totalRevenue: BigInt(5000000000000000000), // 5 ETH
        activeUsers: 150
      });
    } catch (error) {
      console.error('Error loading content stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccessTierIcon = (level: string) => {
    switch (level) {
      case 'bronze':
        return <Shield className="h-4 w-4" />;
      case 'silver':
        return <Star className="h-4 w-4" />;
      case 'gold':
        return <Crown className="h-4 w-4" />;
      case 'platinum':
        return <Zap className="h-4 w-4" />;
      case 'diamond':
        return <Crown className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getAccessTierColor = (level: string) => {
    switch (level) {
      case 'bronze':
        return 'bg-yellow-600';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-yellow-500';
      case 'platinum':
        return 'bg-gray-300';
      case 'diamond':
        return 'bg-blue-400';
      default:
        return 'bg-gray-500';
    }
  };

  if (!coin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Select a coin to view exclusive content</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exclusive Content</h2>
          <p className="text-gray-600">Access exclusive content for {coin.name} holders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {isCreator ? 'Creator Mode' : 'Viewer Mode'}
          </Badge>
        </div>
      </div>

      {/* Access Tiers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Access Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {accessTiers.map((tier) => (
              <div key={tier.name} className="text-center p-4 border rounded-lg hover:bg-gray-50">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${getAccessTierColor(tier.name.toLowerCase())} flex items-center justify-center`}>
                  {getAccessTierIcon(tier.name.toLowerCase())}
                </div>
                <h3 className="font-semibold">{tier.name}</h3>
                <p className="text-sm text-gray-600">
                  {formatNumber(Number(tier.requiredHoldings) / 1e18)} coins
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {tier.discount}% discount
                </p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {tier.benefits.length} benefits
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Statistics */}
      {contentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Content</p>
                  <p className="text-2xl font-bold">{contentStats.totalContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold">{contentStats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(contentStats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{contentStats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="viewer">
            <Unlock className="h-4 w-4 mr-2" />
            View Content
          </TabsTrigger>
          {isCreator && (
            <TabsTrigger value="manager">
              <Settings className="h-4 w-4 mr-2" />
              Manage Content
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viewer" className="space-y-4">
          <ContentViewer
            coin={coin}
            userId={userId}
            onContentAccess={onContentAccess}
          />
        </TabsContent>

        {isCreator && (
          <TabsContent value="manager" className="space-y-4">
            <ContentManager
              coin={coin}
              creatorId={userId}
              onContentCreated={(content) => {
                console.log('Content created:', content);
                loadContentStats();
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Content Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Views per Content</span>
                        <span className="font-semibold">
                          {contentStats ? Math.round(contentStats.totalViews / contentStats.totalContent) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Revenue per Content</span>
                        <span className="font-semibold">
                          {contentStats ? formatPrice(contentStats.totalRevenue / BigInt(contentStats.totalContent)) : '$0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">User Engagement Rate</span>
                        <span className="font-semibold">
                          {contentStats ? Math.round((contentStats.activeUsers / contentStats.totalViews) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Access Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bronze Tier</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Silver Tier</span>
                        <span className="font-semibold">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Gold Tier</span>
                        <span className="font-semibold">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Platinum+</span>
                        <span className="font-semibold">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Top Performing Content</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Welcome Message</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">500 views</span>
                        <Badge variant="success">Bronze</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Exclusive Q&A Session</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">300 views</span>
                        <Badge className="bg-gray-400">Silver</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Behind the Scenes</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">150 views</span>
                        <Badge className="bg-yellow-500">Gold</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

