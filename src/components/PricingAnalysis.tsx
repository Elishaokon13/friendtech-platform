'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Progress } from '@/components/ui';
import { PricingEngine, PricingData, MarketConditions } from '@/lib/pricingEngine';
import { formatPrice, formatNumber, formatPercentage } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Zap, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Users
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface PricingAnalysisProps {
  coin: CreatorCoin;
  onRecommendationChange?: (recommendation: 'buy' | 'sell' | 'hold') => void;
}

export const PricingAnalysis: React.FC<PricingAnalysisProps> = ({ 
  coin, 
  onRecommendationChange 
}) => {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [marketConditions, setMarketConditions] = useState<MarketConditions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{ time: string; price: bigint }>>([]);

  const pricingEngine = new PricingEngine();

  useEffect(() => {
    if (coin) {
      loadPricingData();
    }
  }, [coin]);

  const loadPricingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await pricingEngine.calculatePricingData(coin);
      setPricingData(data);
      
      // Notify parent component of recommendation
      onRecommendationChange?.(data.recommendation);
      
      // Load market conditions
      const conditions = pricingEngine.getMarketConditions();
      setMarketConditions(conditions);
      
      // Generate mock price history for demonstration
      generatePriceHistory(data.customPrice);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const generatePriceHistory = (currentPrice: bigint) => {
    const history = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = BigInt(Math.floor(Number(currentPrice) * (1 + variation)));
      
      history.push({
        time: time.toLocaleTimeString(),
        price
      });
    }
    
    setPriceHistory(history);
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'sell':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 70) return 'text-green-600';
    if (confidence > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Analyzing pricing data...</span>
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
            <Button onClick={loadPricingData}>Retry Analysis</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pricingData) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-gray-500 text-center">No pricing data available</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, keyMetrics } = pricingEngine.getPricingSummary(pricingData);

  return (
    <div className="space-y-6">
      {/* Pricing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Pricing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Prices */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Current Prices</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Zora Price</span>
                  <span className="font-semibold">{formatPrice(pricingData.zoraPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Custom Price</span>
                  <span className="font-semibold">{formatPrice(pricingData.customPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Difference</span>
                  <span className={`font-semibold ${
                    pricingData.priceDifference > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(pricingData.priceDifference * 100)}
                  </span>
                </div>
              </div>
            </div>

            {/* Market Scores */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Market Scores</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Liquidity</span>
                    <span>{pricingData.liquidityScore.toFixed(0)}/100</span>
                  </div>
                  <Progress value={pricingData.liquidityScore} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volatility</span>
                    <span>{pricingData.volatilityScore.toFixed(0)}/100</span>
                  </div>
                  <Progress value={pricingData.volatilityScore} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trend</span>
                    <span>{pricingData.trendScore.toFixed(0)}/100</span>
                  </div>
                  <Progress 
                    value={Math.abs(pricingData.trendScore)} 
                    className="mt-1" 
                  />
                </div>
              </div>
            </div>

            {/* Trading Recommendation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Trading Recommendation</h4>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getRecommendationIcon(pricingData.recommendation)}
                  <span className="ml-2 text-lg font-bold">
                    {pricingData.recommendation.toUpperCase()}
                  </span>
                </div>
                <div className={`text-sm ${getConfidenceColor(pricingData.confidence)}`}>
                  {pricingData.confidence.toFixed(0)}% Confidence
                </div>
                <div className="mt-2">
                  <Badge variant={pricingData.riskLevel === 'low' ? 'success' : 
                                 pricingData.riskLevel === 'medium' ? 'warning' : 'error'}>
                    {getRiskIcon(pricingData.riskLevel)}
                    <span className="ml-1">{pricingData.riskLevel.toUpperCase()} RISK</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Price Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">1 Hour</p>
              <p className="text-lg font-semibold">{formatPrice(pricingData.priceTarget1h)}</p>
              <p className="text-xs text-gray-500">
                {formatPercentage(
                  (Number(pricingData.priceTarget1h) - Number(pricingData.currentPrice)) / 
                  Number(pricingData.currentPrice) * 100
                )}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">24 Hours</p>
              <p className="text-lg font-semibold">{formatPrice(pricingData.priceTarget24h)}</p>
              <p className="text-xs text-gray-500">
                {formatPercentage(
                  (Number(pricingData.priceTarget24h) - Number(pricingData.currentPrice)) / 
                  Number(pricingData.currentPrice) * 100
                )}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">7 Days</p>
              <p className="text-lg font-semibold">{formatPrice(pricingData.priceTarget7d)}</p>
              <p className="text-xs text-gray-500">
                {formatPercentage(
                  (Number(pricingData.priceTarget7d) - Number(pricingData.currentPrice)) / 
                  Number(pricingData.currentPrice) * 100
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Risk Level</span>
              <Badge variant={pricingData.riskLevel === 'low' ? 'success' : 
                             pricingData.riskLevel === 'medium' ? 'warning' : 'error'}>
                {getRiskIcon(pricingData.riskLevel)}
                <span className="ml-1">{pricingData.riskLevel.toUpperCase()}</span>
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Risk Factors:</p>
              <div className="space-y-1">
                {pricingData.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <AlertTriangle className="h-3 w-3 mr-2 text-yellow-600" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Trading Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">{summary}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className={`font-semibold ${metric.color}`}>{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Optimal Trade Size</span>
                <span className="font-semibold">
                  {formatNumber(Number(pricingData.optimalTradeSize) / 1e18)} {coin.symbol}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price History Chart (Mock) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Price History (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end space-x-1">
            {priceHistory.map((point, index) => {
              const height = (Number(point.price) / Number(pricingData.currentPrice)) * 100;
              return (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t"
                  style={{
                    height: `${Math.max(height, 10)}%`,
                    width: '100%',
                    minHeight: '4px'
                  }}
                  title={`${point.time}: ${formatPrice(point.price)}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
