'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Modal } from '@/components/ui';
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
  Settings,
  Zap,
  Shield,
  Clock,
  Target
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface AdvancedTradingProps {
  coin: CreatorCoin;
  onTradeComplete?: (trade: any) => void;
}

export const AdvancedTrading: React.FC<AdvancedTradingProps> = ({ coin, onTradeComplete }) => {
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
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [deadline, setDeadline] = useState(20); // minutes
  const [gasPrice, setGasPrice] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  // Advanced trading strategies
  const [strategy, setStrategy] = useState<'market' | 'limit' | 'dca'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [dcaAmount, setDcaAmount] = useState('');
  const [dcaInterval, setDcaInterval] = useState(60); // minutes

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

      // Add to trade history
      setTradeHistory(prev => [trade, ...prev.slice(0, 9)]); // Keep last 10 trades
      
      onTradeComplete?.(trade);
      setAmount('');
      setSimulation(null);
    } catch (error) {
      console.error('Trade error:', error);
    }
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-600';
    if (impact < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGasPriceMultiplier = () => {
    switch (gasPrice) {
      case 'slow': return 0.8;
      case 'standard': return 1.0;
      case 'fast': return 1.2;
      default: return 1.0;
    }
  };

  const estimatedGasCost = simulation ? 
    (Number(simulation.fee) * getGasPriceMultiplier() / 1e18).toFixed(6) : '0';

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
            <div className="flex items-center space-x-2">
              <Badge variant={coin.priceChange24h >= 0 ? 'success' : 'error'}>
                {coin.priceChange24h >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {formatPercentage(coin.priceChange24h)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
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

      {/* Advanced Settings Modal */}
      <Modal
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        title="Advanced Trading Settings"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trading Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={strategy === 'market' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStrategy('market')}
              >
                Market
              </Button>
              <Button
                variant={strategy === 'limit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStrategy('limit')}
              >
                Limit
              </Button>
              <Button
                variant={strategy === 'dca' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStrategy('dca')}
              >
                DCA
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Deadline (minutes)
            </label>
            <Input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(parseInt(e.target.value))}
              min="1"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gas Price
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={gasPrice === 'slow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGasPrice('slow')}
              >
                Slow
              </Button>
              <Button
                variant={gasPrice === 'standard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGasPrice('standard')}
              >
                Standard
              </Button>
              <Button
                variant={gasPrice === 'fast' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGasPrice('fast')}
              >
                Fast
              </Button>
            </div>
          </div>

          {strategy === 'limit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit Price
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            </div>
          )}

          {strategy === 'dca' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DCA Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={dcaAmount}
                  onChange={(e) => setDcaAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DCA Interval (minutes)
                </label>
                <Input
                  type="number"
                  value={dcaInterval}
                  onChange={(e) => setDcaInterval(parseInt(e.target.value))}
                  min="1"
                  max="1440"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Form */}
        <Card>
          <CardHeader>
            <CardTitle>Trade {coin.symbol}</CardTitle>
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
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Trade Simulation
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expected Output</span>
                      <span className="font-medium">
                        {formatPrice(simulation.expectedOutput)}
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
                        {formatPrice(simulation.fee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gas Cost</span>
                      <span className="font-medium">
                        {estimatedGasCost} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deadline</span>
                      <span className="font-medium">
                        {deadline} minutes
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

        {/* Trade History & Stats */}
        <div className="space-y-4">
          {/* Recent Trades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tradeHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent trades
                </p>
              ) : (
                <div className="space-y-2">
                  {tradeHistory.slice(0, 5).map((trade, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant={trade.type === 'buy' ? 'success' : 'error'}>
                          {trade.type}
                        </Badge>
                        <span className="text-sm">{formatPrice(trade.amount)}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {trade.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trading Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trading Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Trades</span>
                  <span className="font-semibold">{tradeHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Buy Orders</span>
                  <span className="font-semibold text-green-600">
                    {tradeHistory.filter(t => t.type === 'buy').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sell Orders</span>
                  <span className="font-semibold text-red-600">
                    {tradeHistory.filter(t => t.type === 'sell').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Slippage</span>
                  <span className="font-semibold">
                    {(maxSlippage * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">MEV Protection</p>
                <p className="font-semibold">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Gas Optimization</p>
                <p className="font-semibold">{gasPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-semibold">{deadline}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
