'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Modal } from '@/components/ui';
import { useZora } from '@/hooks/useZora';
import { formatPrice, formatNumber, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { CreatorCoin } from '@/types';

interface TradingInterfaceProps {
  coin: CreatorCoin;
  onTradeComplete?: (trade: any) => void;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({ coin, onTradeComplete }) => {
  const { 
    isConnected, 
    account, 
    simulateBuy, 
    simulateSell, 
    buyCoins, 
    sellCoins, 
    trading, 
    tradeError,
    clearError 
  } = useZora();

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [maxSlippage, setMaxSlippage] = useState(0.05);
  const [simulation, setSimulation] = useState<any>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate trade when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      simulateTrade();
    } else {
      setSimulation(null);
    }
  }, [amount, tradeType]);

  const simulateTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSimulating(true);
    try {
      const result = tradeType === 'buy' 
        ? await simulateBuy(coin.address, amount)
        : await simulateSell(coin.address, amount);
      
      setSimulation(result);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleTrade = async () => {
    if (!isConnected || !account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const trade = tradeType === 'buy'
        ? await buyCoins(coin.address, amount, maxSlippage)
        : await sellCoins(coin.address, amount, maxSlippage);

      onTradeComplete?.(trade);
      setAmount('');
      setSimulation(null);
    } catch (error) {
      console.error('Trade error:', error);
    }
  };

  const formatSimulationOutput = (output: bigint) => {
    return formatPrice(output, 18);
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-600';
    if (impact < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Coin Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{coin.name}</CardTitle>
              <p className="text-sm text-gray-600">@{coin.symbol}</p>
            </div>
            <Badge variant={coin.priceChange24h >= 0 ? 'success' : 'error'}>
              {coin.priceChange24h >= 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(coin.priceChange24h)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-lg font-semibold">{formatPrice(coin.currentPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Market Cap</p>
              <p className="text-lg font-semibold">{formatPrice(coin.marketCap)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">24h Volume</p>
              <p className="text-lg font-semibold">{formatPrice(coin.tradingVolume24h)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Supply</p>
              <p className="text-lg font-semibold">{formatNumber(Number(coin.circulatingSupply) / 1e18)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trade Type Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              onClick={() => setTradeType('buy')}
              className="flex-1"
            >
              Buy
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'default' : 'outline'}
              onClick={() => setTradeType('sell')}
              className="flex-1"
            >
              Sell
            </Button>
          </div>

          {/* Amount Input */}
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            rightIcon={<DollarSign className="h-4 w-4" />}
            helperText={`Enter amount to ${tradeType}`}
          />

          {/* Max Slippage */}
          <Input
            label="Max Slippage"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={maxSlippage}
            onChange={(e) => setMaxSlippage(parseFloat(e.target.value))}
            helperText="Maximum acceptable slippage (0.01 = 1%)"
          />

          {/* Simulation Results */}
          {simulation && (
            <Card variant="outlined">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Trade Simulation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expected Output</span>
                    <span className="font-medium">
                      {formatSimulationOutput(simulation.expectedOutput)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price Impact</span>
                    <span className={`font-medium ${getPriceImpactColor(simulation.priceImpact)}`}>
                      {simulation.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fee</span>
                    <span className="font-medium">
                      {formatSimulationOutput(simulation.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum Received</span>
                    <span className="font-medium">
                      {formatSimulationOutput(simulation.minimumReceived)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {tradeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{tradeError}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Trade Button */}
          <Button
            onClick={handleTrade}
            disabled={!isConnected || !amount || parseFloat(amount) <= 0 || trading || isSimulating}
            loading={trading}
            className="w-full"
            size="lg"
          >
            {isSimulating ? 'Simulating...' : trading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Coins`}
          </Button>

          {!isConnected && (
            <p className="text-sm text-gray-500 text-center">
              Please connect your wallet to start trading
            </p>
          )}
        </CardContent>
      </Card>

      {/* Coin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">24h High</p>
                <p className="font-semibold">{formatPrice(coin.currentPrice * BigInt(110))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">24h Low</p>
                <p className="font-semibold">{formatPrice(coin.currentPrice * BigInt(90))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Holders</p>
                <p className="font-semibold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
