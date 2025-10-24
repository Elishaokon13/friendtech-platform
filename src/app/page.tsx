'use client';

import { useState } from 'react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import DesignSystemShowcase from '@/components/DesignSystemShowcase';
import { CreatorCoinList } from '@/components/CreatorCoinList';
import { TradingInterface } from '@/components/TradingInterface';
import { AdvancedTrading } from '@/components/AdvancedTrading';
import { TradingDashboard } from '@/components/TradingDashboard';
import { PricingIntegration } from '@/components/PricingIntegration';
import { ContentAccessIntegration } from '@/components/ContentAccessIntegration';
import { RevenueIntegration } from '@/components/RevenueIntegration';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useZora } from '@/hooks/useZora';
import { Palette, Coins, TrendingUp, Activity, Users } from 'lucide-react';
import { CreatorCoin } from '@/types';

export default function Home() {
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CreatorCoin | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coins' | 'trading' | 'pricing' | 'content' | 'revenue'>('dashboard');
  
  const { isConnected, coins, loading, error } = useZora();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                FriendTech on Zora
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDesignSystem(!showDesignSystem)}
                leftIcon={<Palette className="h-4 w-4" />}
              >
                {showDesignSystem ? 'Hide' : 'Show'} Design System
              </Button>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showDesignSystem ? (
          <DesignSystemShowcase />
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Creator Coins on Zora
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Buy and sell creator coins for exclusive content access
              </p>
            </div>

            {/* Stats Overview */}
            {isConnected && coins.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Coins</p>
                        <p className="text-2xl font-bold">{coins.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Active Coins</p>
                        <p className="text-2xl font-bold">{coins.filter(c => c.isActive).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Volume 24h</p>
                        <p className="text-2xl font-bold">
                          ${(coins.reduce((sum, coin) => sum + Number(coin.tradingVolume24h) / 1e18, 0)).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Gainers</p>
                        <p className="text-2xl font-bold">
                          {coins.filter(c => c.priceChange24h > 0).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Interface */}
            {isConnected ? (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex space-x-2 border-b border-gray-200">
                  <Button
                    variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={activeTab === 'coins' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('coins')}
                  >
                    Browse Coins
                  </Button>
                  <Button
                    variant={activeTab === 'trading' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('trading')}
                    disabled={!selectedCoin}
                  >
                    Advanced Trading
                  </Button>
                  <Button
                    variant={activeTab === 'pricing' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('pricing')}
                  >
                    Pricing Engine
                  </Button>
                  <Button
                    variant={activeTab === 'content' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('content')}
                    disabled={!selectedCoin}
                  >
                    Exclusive Content
                  </Button>
                  <Button
                    variant={activeTab === 'revenue' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('revenue')}
                    disabled={!selectedCoin}
                  >
                    Revenue Distribution
                  </Button>
                </div>

                {/* Tab Content */}
                {activeTab === 'dashboard' ? (
                  <TradingDashboard
                    selectedCoin={selectedCoin}
                    onCoinSelect={(coin) => {
                      setSelectedCoin(coin);
                      setActiveTab('trading');
                    }}
                  />
                ) : activeTab === 'coins' ? (
                  <CreatorCoinList
                    onCoinSelect={(coin) => {
                      setSelectedCoin(coin);
                      setActiveTab('trading');
                    }}
                    selectedCoin={selectedCoin}
                  />
                ) : selectedCoin ? (
                  <AdvancedTrading
                    coin={selectedCoin}
                    onTradeComplete={(trade) => {
                      console.log('Trade completed:', trade);
                      // Handle trade completion
                    }}
                  />
                ) : activeTab === 'pricing' ? (
                  <PricingIntegration
                    coin={selectedCoin}
                    coins={coins}
                    onTradeComplete={(trade) => {
                      console.log('Trade completed:', trade);
                      // Handle trade completion
                    }}
                  />
                ) : activeTab === 'content' ? (
                  <ContentAccessIntegration
                    coin={selectedCoin}
                    userId={account || 'anonymous'}
                    isCreator={selectedCoin?.creatorId === account}
                    onContentAccess={(contentId) => {
                      console.log('Content accessed:', contentId);
                    }}
                  />
                ) : activeTab === 'revenue' ? (
                  <RevenueIntegration
                    coin={selectedCoin}
                    isCreator={selectedCoin?.creatorId === account}
                    onRevenueDistributed={(distribution) => {
                      console.log('Revenue distributed:', distribution);
                    }}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">
                        {activeTab === 'trading' ? 'Please select a coin to start trading' : 
                         activeTab === 'pricing' ? 'Select a coin to view pricing analysis' : 
                         activeTab === 'content' ? 'Select a coin to view exclusive content' :
                         activeTab === 'revenue' ? 'Select a coin to view revenue distribution' :
                         'Please select a coin'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to start trading creator coins and accessing exclusive content.
                </p>
                <WalletConnectButton />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
