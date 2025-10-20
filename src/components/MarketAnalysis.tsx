'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Progress } from '@/components/ui';
import { PricingEngine, MarketConditions } from '@/lib/pricingEngine';
import { formatPrice, formatNumber, formatPercentage } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface MarketAnalysisProps {
  coins: CreatorCoin[];
  onMarketUpdate?: (conditions: MarketConditions) => void;
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ 
  coins, 
  onMarketUpdate 
}) => {
  const [marketConditions, setMarketConditions] = useState<MarketConditions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketTrends, setMarketTrends] = useState<{
    bullish: number;
    bearish: number;
    neutral: number;
  }>({ bullish: 0, bearish: 0, neutral: 0 });

  const pricingEngine = new PricingEngine();

  useEffect(() => {
    if (coins.length > 0) {
      analyzeMarket();
    }
  }, [coins]);

  const analyzeMarket = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Update market conditions
      await pricingEngine.updateMarketConditions(coins);
      const conditions = pricingEngine.getMarketConditions();
      setMarketConditions(conditions);
      
      // Calculate market trends
      const trends = calculateMarketTrends(coins);
      setMarketTrends(trends);
      
      // Notify parent component
      onMarketUpdate?.(conditions!);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze market');
    } finally {
      setLoading(false);
    }
  };

  const calculateMarketTrends = (coins: CreatorCoin[]) => {
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;

    coins.forEach(coin => {
      if (coin.priceChange24h > 5) {
        bullish++;
      } else if (coin.priceChange24h < -5) {
        bearish++;
      } else {
        neutral++;
      }
    });

    return { bullish, bearish, neutral };
  };

  const getMarketSentiment = () => {
    if (!marketConditions) return 'neutral';
    return marketConditions.overallTrend;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-600';
      case 'bearish':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getTopPerformers = () => {
    return coins
      .sort((a, b) => b.priceChange24h - a.priceChange24h)
      .slice(0, 5);
  };

  const getWorstPerformers = () => {
    return coins
      .sort((a, b) => a.priceChange24h - b.priceChange24h)
      .slice(0, 5);
  };

  const getVolumeLeaders = () => {
    return coins
      .sort((a, b) => Number(b.tradingVolume24h) - Number(a.tradingVolume24h))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Analyzing market conditions...</span>
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
            <Button onClick={analyzeMarket}>Retry Analysis</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marketConditions) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-gray-500 text-center">No market data available</p>
        </CardContent>
      </Card>
    );
  }

  const sentiment = getMarketSentiment();

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{formatPrice(marketConditions.marketCap)}</p>
              <p className="text-sm text-gray-600">Total Market Cap</p>
            </div>
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{formatPrice(marketConditions.totalVolume)}</p>
              <p className="text-sm text-gray-600">24h Volume</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{marketConditions.activeTraders}</p>
              <p className="text-sm text-gray-600">Active Coins</p>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{formatPrice(marketConditions.averageTradeSize)}</p>
              <p className="text-sm text-gray-600">Avg Trade Size</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {getSentimentIcon(sentiment)}
            <span className="ml-2">Market Sentiment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getSentimentColor(sentiment)}`}>
                {sentiment.toUpperCase()}
              </div>
              <p className="text-gray-600 mt-2">
                {sentiment === 'bullish' && 'Market is showing strong upward momentum'}
                {sentiment === 'bearish' && 'Market is experiencing downward pressure'}
                {sentiment === 'neutral' && 'Market conditions are stable and balanced'}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{marketTrends.bullish}</p>
                <p className="text-sm text-gray-600">Bullish</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Activity className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold text-yellow-600">{marketTrends.neutral}</p>
                <p className="text-sm text-gray-600">Neutral</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-600">{marketTrends.bearish}</p>
                <p className="text-sm text-gray-600">Bearish</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Volatility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Market Volatility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Overall Volatility</span>
              <Badge variant={marketConditions.priceVolatility > 20 ? 'error' : 
                             marketConditions.priceVolatility > 10 ? 'warning' : 'success'}>
                {marketConditions.priceVolatility.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={Math.min(marketConditions.priceVolatility, 100)} />
            <div className="text-sm text-gray-600">
              {marketConditions.priceVolatility > 20 && 'High volatility - expect significant price swings'}
              {marketConditions.priceVolatility > 10 && marketConditions.priceVolatility <= 20 && 'Moderate volatility - some price movement expected'}
              {marketConditions.priceVolatility <= 10 && 'Low volatility - stable market conditions'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopPerformers().map((coin, index) => (
                <div key={coin.address} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">{coin.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{coin.name}</p>
                      <p className="text-sm text-gray-600">@{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(coin.currentPrice)}</p>
                    <Badge variant="success" className="text-xs">
                      +{formatPercentage(coin.priceChange24h)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
              Worst Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getWorstPerformers().map((coin, index) => (
                <div key={coin.address} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">{coin.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{coin.name}</p>
                      <p className="text-sm text-gray-600">@{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(coin.currentPrice)}</p>
                    <Badge variant="error" className="text-xs">
                      {formatPercentage(coin.priceChange24h)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume Leaders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Volume Leaders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getVolumeLeaders().map((coin, index) => (
              <div key={coin.address} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">{coin.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{coin.name}</p>
                    <p className="text-sm text-gray-600">@{coin.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(coin.tradingVolume24h)}</p>
                  <p className="text-xs text-gray-500">24h volume</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Market Health Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Market Cap</p>
              <p className="text-lg font-semibold">
                {Number(marketConditions.marketCap) > 1e18 ? 'Healthy' : 'Low'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Trading Activity</p>
              <p className="text-lg font-semibold">
                {Number(marketConditions.totalVolume) > 1e18 ? 'High' : 'Moderate'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Market Breadth</p>
              <p className="text-lg font-semibold">
                {marketConditions.activeTraders > 10 ? 'Strong' : 'Limited'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
