'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui';
import { useZora } from '@/hooks/useZora';
import { formatPrice, formatNumber, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Search, Users, Activity } from 'lucide-react';
import { CreatorCoin } from '@/types';

interface CreatorCoinListProps {
  onCoinSelect?: (coin: CreatorCoin) => void;
  selectedCoin?: CreatorCoin | null;
}

export const CreatorCoinList: React.FC<CreatorCoinListProps> = ({ onCoinSelect, selectedCoin }) => {
  const { coins, loading, error, refreshCoins } = useZora();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'change' | 'marketCap'>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort coins
  const filteredCoins = coins
    .filter(coin => 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'price':
          aValue = Number(a.currentPrice);
          bValue = Number(b.currentPrice);
          break;
        case 'volume':
          aValue = Number(a.tradingVolume24h);
          bValue = Number(b.tradingVolume24h);
          break;
        case 'change':
          aValue = a.priceChange24h;
          bValue = b.priceChange24h;
          break;
        case 'marketCap':
        default:
          aValue = Number(a.marketCap);
          bValue = Number(b.marketCap);
          break;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3" /> : 
      <ArrowDown className="h-3 w-3" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading coins...</span>
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
            <Button onClick={refreshCoins}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'marketCap' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('marketCap')}
              >
                Market Cap {getSortIcon('marketCap')}
              </Button>
              <Button
                variant={sortBy === 'volume' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('volume')}
              >
                Volume {getSortIcon('volume')}
              </Button>
              <Button
                variant={sortBy === 'change' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('change')}
              >
                Change {getSortIcon('change')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coin List */}
      <div className="space-y-2">
        {filteredCoins.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No coins found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCoins.map((coin) => (
            <Card
              key={coin.address}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCoin?.address === coin.address ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onCoinSelect?.(coin)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {coin.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{coin.name}</h3>
                      <p className="text-sm text-gray-600">@{coin.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(coin.currentPrice)}</p>
                      <div className="flex items-center space-x-1">
                        {coin.priceChange24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-sm ${
                          coin.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(coin.priceChange24h)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Market Cap</p>
                      <p className="font-semibold">{formatPrice(coin.marketCap)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">24h Volume</p>
                      <p className="font-semibold">{formatPrice(coin.tradingVolume24h)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={coin.isActive ? 'success' : 'secondary'}>
                        {coin.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCoinSelect?.(coin);
                        }}
                      >
                        Trade
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{coins.length}</p>
              <p className="text-sm text-gray-600">Total Coins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(coins.reduce((sum, coin) => sum + coin.marketCap, BigInt(0)))}
              </p>
              <p className="text-sm text-gray-600">Total Market Cap</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(coins.reduce((sum, coin) => sum + coin.tradingVolume24h, BigInt(0)))}
              </p>
              <p className="text-sm text-gray-600">Total Volume 24h</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {coins.filter(coin => coin.priceChange24h > 0).length}
              </p>
              <p className="text-sm text-gray-600">Gainers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
