import {
  createCoin,
  createCoinCall,
  tradeCoin,
  tradeCoinCall,
  simulateBuy,
  simulateSell,
  getOnchainCoinDetails,
  getCoin,
  getCoins,
  getProfileCoins,
  getProfileBalances,
  getCoinActivity,
  getCoinHolders,
  getCoinTrades,
  type CreateCoinArgs,
  type TradeParams,
  type CoinData,
  type CoinActivity,
  type CoinHolder,
  type CoinTrade,
  DeployCurrency
} from '@zoralabs/coins-sdk';
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { Creator, CreatorCoin, Trade } from '@/types';

// Zora configuration
const ZORA_CHAIN_ID = 8453; // Base mainnet
const ZORA_RPC_URL = process.env.NEXT_PUBLIC_ZORA_RPC_URL || 'https://mainnet.base.org';

// Create viem clients
export const publicClient = createPublicClient({
  chain: base,
  transport: http(ZORA_RPC_URL),
});

export const createWalletClientFromProvider = (provider: any) => {
  return createWalletClient({
    chain: base,
    transport: http(ZORA_RPC_URL),
    account: provider.account,
  });
};

// Creator coin operations using Zora SDK
export class ZoraCreatorCoinManager {
  /**
   * Create a new creator coin
   */
  async createCreatorCoin(
    creator: Creator,
    walletClient: any,
    metadata?: {
      description?: string;
      image?: string;
      externalUrl?: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    }
  ): Promise<{ address: string; transactionHash: string }> {
    try {
      const createCoinArgs: CreateCoinArgs = {
        name: `${creator.displayName} Coin`,
        symbol: creator.username.toUpperCase(),
        uri: `https://api.zora.co/metadata/${creator.username}`,
        chainId: ZORA_CHAIN_ID,
        payoutRecipient: creator.walletAddress as `0x${string}`,
        currency: DeployCurrency.ETH,
      };

      const result = await createCoin(
        createCoinArgs,
        walletClient,
        publicClient
      );

      return {
        address: result.address || '',
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error creating creator coin:', error);
      throw new Error('Failed to create creator coin');
    }
  }

  /**
   * Get detailed coin information
   */
  async getCoinDetails(coinAddress: string): Promise<CoinData | null> {
    try {
      const coinData = await getCoin(coinAddress, publicClient);
      return coinData;
    } catch (error) {
      console.error('Error fetching coin details:', error);
      return null;
    }
  }

  /**
   * Get all coins for a specific creator
   */
  async getCreatorCoins(creatorAddress: string): Promise<CoinData[]> {
    try {
      const coins = await getProfileCoins(creatorAddress, publicClient);
      return coins;
    } catch (error) {
      console.error('Error fetching creator coins:', error);
      return [];
    }
  }

  /**
   * Get coin activity (trades, mints, etc.)
   */
  async getCoinActivity(coinAddress: string, limit: number = 50): Promise<CoinActivity[]> {
    try {
      const activity = await getCoinActivity(coinAddress, publicClient, { limit });
      return activity;
    } catch (error) {
      console.error('Error fetching coin activity:', error);
      return [];
    }
  }

  /**
   * Get coin holders
   */
  async getCoinHolders(coinAddress: string, limit: number = 100): Promise<CoinHolder[]> {
    try {
      const holders = await getCoinHolders(coinAddress, publicClient, { limit });
      return holders;
    } catch (error) {
      console.error('Error fetching coin holders:', error);
      return [];
    }
  }

  /**
   * Get recent trades for a coin
   */
  async getCoinTrades(coinAddress: string, limit: number = 50): Promise<CoinTrade[]> {
    try {
      const trades = await getCoinTrades(coinAddress, publicClient, { limit });
      return trades;
    } catch (error) {
      console.error('Error fetching coin trades:', error);
      return [];
    }
  }

  /**
   * Get creator coin information from API
   */
  async getCreatorCoin(coinAddress: string): Promise<CreatorCoin | null> {
    try {
      const response = await getCoin({ address: coinAddress });
      const coinData = response.data?.zora20Token;
      
      if (!coinData) return null;

      return {
        address: coinAddress,
        creatorId: coinData.creator?.address || '',
        symbol: coinData.symbol || '',
        name: coinData.name || '',
        totalSupply: BigInt(coinData.totalSupply || '0'),
        circulatingSupply: BigInt(coinData.circulatingSupply || '0'),
        currentPrice: BigInt(coinData.price || '0'),
        marketCap: BigInt(coinData.marketCap || '0'),
        tradingVolume24h: BigInt(coinData.volume24h || '0'),
        priceChange24h: coinData.priceChange24h || 0,
        isActive: true,
      };
    } catch (error) {
      console.error('Error getting creator coin:', error);
      return null;
    }
  }

  /**
   * Get all creator coins
   */
  async getAllCreatorCoins(limit: number = 50): Promise<CreatorCoin[]> {
    try {
      const response = await getCoins({ 
        limit,
        sort: { sortKey: 'CREATED', sortDirection: 'DESC' }
      });
      
      const coins = response.data?.zora20Tokens || [];
      
      return coins.map(coin => ({
        address: coin.address,
        creatorId: coin.creator?.address || '',
        symbol: coin.symbol || '',
        name: coin.name || '',
        totalSupply: BigInt(coin.totalSupply || '0'),
        circulatingSupply: BigInt(coin.circulatingSupply || '0'),
        currentPrice: BigInt(coin.price || '0'),
        marketCap: BigInt(coin.marketCap || '0'),
        tradingVolume24h: BigInt(coin.volume24h || '0'),
        priceChange24h: coin.priceChange24h || 0,
        isActive: true,
      }));
    } catch (error) {
      console.error('Error getting all creator coins:', error);
      return [];
    }
  }

  /**
   * Simulate a buy order to get price and slippage info
   */
  async simulateBuyOrder(
    coinAddress: string,
    amount: bigint
  ): Promise<{
    expectedOutput: bigint;
    priceImpact: number;
    minimumReceived: bigint;
    fee: bigint;
  }> {
    try {
      const simulation = await simulateBuy({
        target: coinAddress as `0x${string}`,
        requestedOrderSize: amount,
        publicClient,
      });

      return {
        expectedOutput: simulation.amountOut || BigInt(0),
        priceImpact: simulation.priceImpact || 0,
        minimumReceived: simulation.amountOut || BigInt(0),
        fee: simulation.fee || BigInt(0),
      };
    } catch (error) {
      console.error('Error simulating buy order:', error);
      throw new Error('Failed to simulate buy order');
    }
  }

  /**
   * Simulate a sell order to get price and slippage info
   */
  async simulateSellOrder(
    coinAddress: string,
    amount: bigint
  ): Promise<{
    expectedOutput: bigint;
    priceImpact: number;
    minimumReceived: bigint;
    fee: bigint;
  }> {
    try {
      const simulation = await simulateSell({
        target: coinAddress as `0x${string}`,
        requestedOrderSize: amount,
        publicClient,
      });

      return {
        expectedOutput: simulation.amountOut || BigInt(0),
        priceImpact: simulation.priceImpact || 0,
        minimumReceived: simulation.amountOut || BigInt(0),
        fee: simulation.fee || BigInt(0),
      };
    } catch (error) {
      console.error('Error simulating sell order:', error);
      throw new Error('Failed to simulate sell order');
    }
  }

  /**
   * Buy creator coins with slippage protection
   */
  async buyCoins(
    coinAddress: string,
    amount: bigint,
    userAddress: string,
    walletClient: any,
    maxSlippage: number = 0.05
  ): Promise<Trade> {
    try {
      // First simulate to get expected output
      const simulation = await this.simulateBuyOrder(coinAddress, amount);
      
      // Calculate minimum received with slippage protection
      const minimumReceived = (simulation.expectedOutput * BigInt(Math.floor((1 - maxSlippage) * 10000))) / BigInt(10000);

      const tradeParams: TradeParams = {
        direction: 'buy',
        target: coinAddress as `0x${string}`,
        args: {
          recipient: userAddress as `0x${string}`,
          orderSize: amount,
          minAmountOut: minimumReceived,
        },
      };

      const result = await tradeCoin(tradeParams, walletClient, publicClient);

      return {
        id: result.hash,
        coinAddress,
        traderAddress: userAddress,
        type: 'buy',
        amount,
        price: simulation.expectedOutput,
        totalValue: simulation.expectedOutput,
        timestamp: new Date(),
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error buying coins:', error);
      throw new Error('Failed to buy coins');
    }
  }

  /**
   * Sell creator coins with slippage protection
   */
  async sellCoins(
    coinAddress: string,
    amount: bigint,
    userAddress: string,
    walletClient: any,
    maxSlippage: number = 0.05
  ): Promise<Trade> {
    try {
      // First simulate to get expected output
      const simulation = await this.simulateSellOrder(coinAddress, amount);
      
      // Calculate minimum received with slippage protection
      const minimumReceived = (simulation.expectedOutput * BigInt(Math.floor((1 - maxSlippage) * 10000))) / BigInt(10000);

      const tradeParams: TradeParams = {
        direction: 'sell',
        target: coinAddress as `0x${string}`,
        args: {
          recipient: userAddress as `0x${string}`,
          orderSize: amount,
          minAmountOut: minimumReceived,
        },
      };

      const result = await tradeCoin(tradeParams, walletClient, publicClient);

      return {
        id: result.hash,
        coinAddress,
        traderAddress: userAddress,
        type: 'sell',
        amount,
        price: simulation.expectedOutput,
        totalValue: simulation.expectedOutput,
        timestamp: new Date(),
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error selling coins:', error);
      throw new Error('Failed to sell coins');
    }
  }

  /**
   * Get user's profile coins
   */
  async getUserCoins(userAddress: string): Promise<CreatorCoin[]> {
    try {
      const response = await getProfileCoins({ 
        address: userAddress,
        limit: 50 
      });
      
      const coins = response.data?.zora20Tokens || [];
      
      return coins.map(coin => ({
        address: coin.address,
        creatorId: coin.creator?.address || '',
        symbol: coin.symbol || '',
        name: coin.name || '',
        totalSupply: BigInt(coin.totalSupply || '0'),
        circulatingSupply: BigInt(coin.circulatingSupply || '0'),
        currentPrice: BigInt(coin.price || '0'),
        marketCap: BigInt(coin.marketCap || '0'),
        tradingVolume24h: BigInt(coin.volume24h || '0'),
        priceChange24h: coin.priceChange24h || 0,
        isActive: true,
      }));
    } catch (error) {
      console.error('Error getting user coins:', error);
      return [];
    }
  }

  /**
   * Get user's coin balances
   */
  async getUserBalances(userAddress: string): Promise<Record<string, bigint>> {
    try {
      const response = await getProfileBalances({ address: userAddress });
      const balances = response.data?.zora20TokenBalances || [];
      
      const balanceMap: Record<string, bigint> = {};
      balances.forEach(balance => {
        if (balance.token?.address) {
          balanceMap[balance.token.address] = BigInt(balance.balance || '0');
        }
      });
      
      return balanceMap;
    } catch (error) {
      console.error('Error getting user balances:', error);
      return {};
    }
  }
}

// Utility functions
export const formatZoraAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidZoraAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const getZoraExplorerUrl = (address: string): string => {
  return `https://basescan.org/address/${address}`;
};

export const getZoraTransactionUrl = (txHash: string): string => {
  return `https://basescan.org/tx/${txHash}`;
};

// Formatting utilities based on Zora API structure
export const formatZoraPrice = (price: string | bigint): string => {
  const priceNumber = typeof price === 'string' ? parseFloat(price) : Number(price) / 1e18;
  if (priceNumber >= 1) {
    return `$${priceNumber.toFixed(2)}`;
  } else if (priceNumber >= 0.01) {
    return `$${priceNumber.toFixed(4)}`;
  } else {
    return `$${priceNumber.toExponential(2)}`;
  }
};

export const formatZoraVolume = (volume: string | bigint): string => {
  const volumeNumber = typeof volume === 'string' ? parseFloat(volume) : Number(volume) / 1e18;
  if (volumeNumber >= 1e6) {
    return `$${(volumeNumber / 1e6).toFixed(2)}M`;
  } else if (volumeNumber >= 1e3) {
    return `$${(volumeNumber / 1e3).toFixed(2)}K`;
  } else {
    return `$${volumeNumber.toFixed(2)}`;
  }
};

export const formatZoraSupply = (supply: string | bigint): string => {
  const supplyNumber = typeof supply === 'string' ? parseFloat(supply) : Number(supply) / 1e18;
  return supplyNumber.toLocaleString();
};

export const formatZoraPriceChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  const color = change >= 0 ? 'text-green-600' : 'text-red-600';
  return `${sign}${change.toFixed(2)}%`;
};

// Create singleton instance
export const zoraCreatorCoinManager = new ZoraCreatorCoinManager();
