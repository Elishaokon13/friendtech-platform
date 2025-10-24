'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { PricingAnalysis } from './PricingAnalysis';
import { MarketAnalysis } from './MarketAnalysis';
import { AdvancedTrading } from './AdvancedTrading';
import { PricingEngine, PricingData, MarketConditions } from '@/lib/pricingEngine';
import { formatPrice, formatNumber, formatPercentage } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap, 
  Shield,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface PricingIntegrationProps {
  coin: CreatorCoin | null;
  coins: CreatorCoin[];
  onTradeComplete?: (trade: any) => void;
}

export const PricingIntegration: React.FC<PricingIntegrationProps> = ({ 
  coin, 
  coins, 
  onTradeComplete 
}) => {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [marketConditions, setMarketConditions] = useState<MarketConditions | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'trading' | 'market'>('analysis');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricingEngine = new PricingEngine();

  useEffect(() => {
    if (coin) {
      loadPricingData();
    }
  }, [coin]);

  useEffect(() => {
    if (coins.length > 0) {
      loadMarketConditions();
    }
  }, [coins]);

  const loadPricingData = async () => {
    if (!coin) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await pricingEngine.calculatePricingData(coin);
      setPricingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const loadMarketConditions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await pricingEngine.updateMarketConditions(coins);
      const conditions = pricingEngine.getMarketConditions();
      setMarketConditions(conditions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market conditions');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'text-green-600';
      case 'sell':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading pricing data...</span>
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
            <Button onClick={() => coin ? loadPricingData() : loadMarketConditions()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pricing Engine Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Pricing Engine Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Bonding Curve</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Market Analysis</p>
              <p className="text-lg font-semibold text-blue-600">
                {marketConditions ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Price Predictions</p>
              <p className="text-lg font-semibold text-purple-600">
                {pricingData ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Pricing Summary */}
      {pricingData && coin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Quick Pricing Summary - {coin.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Recommendation</p>
                <p className={`text-xl font-bold ${getRecommendationColor(pricingData.recommendation)}`}>
                  {pricingData.recommendation.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {pricingData.confidence.toFixed(0)}% confidence
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Price Difference</p>
                <p className={`text-xl font-bold ${
                  pricingData.priceDifference > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(pricingData.priceDifference * 100)}
                </p>
                <p className="text-xs text-gray-500">
                  vs Zora price
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Liquidity Score</p>
                <p className="text-xl font-bold">{pricingData.liquidityScore.toFixed(0)}/100</p>
                <p className="text-xs text-gray-500">
                  {pricingData.liquidityScore > 70 ? 'High' : 
                   pricingData.liquidityScore > 40 ? 'Medium' : 'Low'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Risk Level</p>
                <p className={`text-xl font-bold ${getRiskColor(pricingData.riskLevel)}`}>
                  {pricingData.riskLevel.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {pricingData.riskFactors.length} factors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="trading">Advanced Trading</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          {coin ? (
            <PricingAnalysis 
              coin={coin} 
              onRecommendationChange={(rec) => {
                console.log('Recommendation changed:', rec);
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a coin to view pricing analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          {coin ? (
            <AdvancedTrading 
              coin={coin} 
              onTradeComplete={onTradeComplete}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a coin to start trading</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <MarketAnalysis 
            coins={coins} 
            onMarketUpdate={(conditions) => {
              setMarketConditions(conditions);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Pricing Engine Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Pricing Engine Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Dynamic Pricing</p>
              <p className="text-xs text-gray-500">Real-time price adjustments</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">MEV Protection</p>
              <p className="text-xs text-gray-500">Anti-manipulation measures</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Price Predictions</p>
              <p className="text-xs text-gray-500">AI-powered forecasting</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Market Analysis</p>
              <p className="text-xs text-gray-500">Comprehensive insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

