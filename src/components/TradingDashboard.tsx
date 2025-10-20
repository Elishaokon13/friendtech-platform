'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { useZora } from '@/hooks/useZora';
import { formatPrice, formatNumber, formatPercentage } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  ArrowUp, 
  ArrowDown,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface TradingDashboardProps {
  selectedCoin: CreatorCoin | null;
  onCoinSelect?: (coin: CreatorCoin) => void;
}

export const TradingDashboard: React.FC<TradingDashboardProps> = ({ selectedCoin, onCoinSelect }) => {
  const { 
    isConnected, 
    coins, 
    loading, 
    error, 
    getCoinActivity,
    getCoinHolders,
    getCoinTrades 
  } = useZora();

  const [activeTab, setActiveTab] = useState<'overview' | 'trading' | 'analytics'>('overview');
  const [coinActivity, setCoinActivity] = useState<any[]>([]);
  const [coinHolders, setCoinHolders] = useState<any[]>([]);
  const [coinTrades, setCoinTrades] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load coin data when selected coin changes
  useEffect(() => {
    if (selectedCoin) {
      loadCoinData();
    }
  }, [selectedCoin]);

  const loadCoinData = async () => {
    if (!selectedCoin) return;

    setLoadingData(true);
    try {
      const [activity, holders, trades] = await Promise.all([
        getCoinActivity(selectedCoin.address, 20),
        getCoinHolders(selectedCoin.address, 50),
        getCoinTrades(selectedCoin.address, 20)
      ]);

      setCoinActivity(activity);
      setCoinHolders(holders);
      setCoinTrades(trades);
    } catch (error) {
      console.error('Error loading coin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getTopGainers = () => {
    return coins
      .filter(coin => coin.priceChange24h > 0)
      .sort((a, b) => b.priceChange24h - a.priceChange24h)
      .slice(0, 5);
  };

  const getTopLosers = () => {
    return coins
      .filter(coin => coin.priceChange24h < 0)
      .sort((a, b) => a.priceChange24h - b.priceChange24h)
      .slice(0, 5);
  };

  const getTopVolume = () => {
    return coins
      .sort((a, b) => Number(b.tradingVolume24h) - Number(a.tradingVolume24h))
      .slice(0, 5);
  };

  const getTotalMarketCap = () => {
    return coins.reduce((sum, coin) => sum + coin.marketCap, BigInt(0));
  };

  const getTotalVolume = () => {
    return coins.reduce((sum, coin) => sum + coin.tradingVolume24h, BigInt(0));
  };

  const getGainersCount = () => {
    return coins.filter(coin => coin.priceChange24h > 0).length;
  };

  const getLosersCount = () => {
    return coins.filter(coin => coin.priceChange24h < 0).length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading dashboard...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Trading Dashboard</h2>
          <p className="text-gray-600">Monitor and analyze creator coin markets</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'trading' ? 'default' : 'outline'}
            onClick={() => setActiveTab('trading')}
            disabled={!selectedCoin}
          >
            Trading
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            disabled={!selectedCoin}
          >
            Analytics
          </Button>
        </div>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Market Cap</p>
                <p className="text-xl font-bold">{formatPrice(getTotalMarketCap())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">24h Volume</p>
                <p className="text-xl font-bold">{formatPrice(getTotalVolume())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Gainers</p>
                <p className="text-xl font-bold">{getGainersCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Losers</p>
                <p className="text-xl font-bold">{getLosersCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTopGainers().map((coin, index) => (
                  <div
                    key={coin.address}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => onCoinSelect?.(coin)}
                  >
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
                        <ArrowUp className="h-3 w-3 mr-1" />
                        {formatPercentage(coin.priceChange24h)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTopLosers().map((coin, index) => (
                  <div
                    key={coin.address}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => onCoinSelect?.(coin)}
                  >
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
                        <ArrowDown className="h-3 w-3 mr-1" />
                        {formatPercentage(coin.priceChange24h)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                Top Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTopVolume().map((coin, index) => (
                  <div
                    key={coin.address}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => onCoinSelect?.(coin)}
                  >
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

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-4 w-4 mr-2 text-purple-600" />
                Market Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Coins</span>
                  <span className="font-semibold">{coins.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Coins</span>
                  <span className="font-semibold">{coins.filter(c => c.isActive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Price Change</span>
                  <span className="font-semibold">
                    {formatPercentage(
                      coins.reduce((sum, coin) => sum + coin.priceChange24h, 0) / coins.length
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Dominance</span>
                  <span className="font-semibold">
                    {selectedCoin ? 
                      formatPercentage(
                        (Number(selectedCoin.marketCap) / Number(getTotalMarketCap())) * 100
                      ) : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'trading' && selectedCoin && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Coin: {selectedCoin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Trading interface for {selectedCoin.symbol} would go here.
                This would integrate with the AdvancedTrading component.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && selectedCoin && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics for {selectedCoin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{coinActivity.length}</p>
                  <p className="text-sm text-gray-600">Recent Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{coinHolders.length}</p>
                  <p className="text-sm text-gray-600">Holders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{coinTrades.length}</p>
                  <p className="text-sm text-gray-600">Recent Trades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
