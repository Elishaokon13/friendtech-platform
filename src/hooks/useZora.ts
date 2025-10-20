'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWalletConnect } from './useWalletConnect';
import { ZoraCreatorCoinManager } from '@/lib/zora';
import { Creator, CreatorCoin, Trade } from '@/types';
import { parseEther, formatEther } from 'viem';

export interface UseZoraReturn {
  // Connection state
  isConnected: boolean;
  account: string | null;
  
  // Coin management
  coins: CreatorCoin[];
  loading: boolean;
  error: string | null;
  
  // Trading state
  trading: boolean;
  tradeError: string | null;
  
  // Actions
  createCoin: (creator: Creator, metadata?: any) => Promise<{ address: string; transactionHash: string }>;
  getCoinDetails: (coinAddress: string) => Promise<CreatorCoin | null>;
  getAllCoins: (limit?: number) => Promise<void>;
  getUserCoins: (userAddress: string) => Promise<CreatorCoin[]>;
  
  // Trading actions
  simulateBuy: (coinAddress: string, amount: string) => Promise<any>;
  simulateSell: (coinAddress: string, amount: string) => Promise<any>;
  buyCoins: (coinAddress: string, amount: string, maxSlippage?: number) => Promise<Trade>;
  sellCoins: (coinAddress: string, amount: string, maxSlippage?: number) => Promise<Trade>;
  
  // Data fetching
  getCoinActivity: (coinAddress: string, limit?: number) => Promise<any[]>;
  getCoinHolders: (coinAddress: string, limit?: number) => Promise<any[]>;
  getCoinTrades: (coinAddress: string, limit?: number) => Promise<any[]>;
  
  // Utility functions
  refreshCoins: () => Promise<void>;
  clearError: () => void;
}

export const useZora = (): UseZoraReturn => {
  const { isConnected, account, provider } = useWalletConnect();
  const [coins, setCoins] = useState<CreatorCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trading, setTrading] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);

  // Initialize Zora manager
  const zoraManager = new ZoraCreatorCoinManager();

  // Create wallet client from provider
  const getWalletClient = useCallback(() => {
    if (!provider || !account) return null;
    return {
      account: account as `0x${string}`,
      // Add other wallet client properties as needed
    };
  }, [provider, account]);

  // Create a new creator coin
  const createCoin = useCallback(async (
    creator: Creator,
    metadata?: any
  ): Promise<{ address: string; transactionHash: string }> => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    setTrading(true);
    setTradeError(null);

    try {
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('Wallet client not available');

      const result = await zoraManager.createCreatorCoin(creator, walletClient, metadata);
      
      // Refresh coins after creation
      await refreshCoins();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create coin';
      setTradeError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTrading(false);
    }
  }, [isConnected, account, getWalletClient]);

  // Get detailed coin information
  const getCoinDetails = useCallback(async (coinAddress: string): Promise<CreatorCoin | null> => {
    try {
      setLoading(true);
      const coin = await zoraManager.getCreatorCoin(coinAddress);
      return coin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get coin details';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all creator coins
  const getAllCoins = useCallback(async (limit: number = 50): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const allCoins = await zoraManager.getAllCreatorCoins(limit);
      setCoins(allCoins);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch coins';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's coins
  const getUserCoins = useCallback(async (userAddress: string): Promise<CreatorCoin[]> => {
    try {
      setLoading(true);
      const userCoins = await zoraManager.getUserCoins(userAddress);
      return userCoins;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user coins';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate buy order
  const simulateBuy = useCallback(async (coinAddress: string, amount: string) => {
    try {
      const amountBigInt = parseEther(amount);
      const simulation = await zoraManager.simulateBuyOrder(coinAddress, amountBigInt);
      return {
        ...simulation,
        expectedOutputFormatted: formatEther(simulation.expectedOutput),
        feeFormatted: formatEther(simulation.fee),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to simulate buy';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Simulate sell order
  const simulateSell = useCallback(async (coinAddress: string, amount: string) => {
    try {
      const amountBigInt = parseEther(amount);
      const simulation = await zoraManager.simulateSellOrder(coinAddress, amountBigInt);
      return {
        ...simulation,
        expectedOutputFormatted: formatEther(simulation.expectedOutput),
        feeFormatted: formatEther(simulation.fee),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to simulate sell';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Buy coins
  const buyCoins = useCallback(async (
    coinAddress: string,
    amount: string,
    maxSlippage: number = 0.05
  ): Promise<Trade> => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    setTrading(true);
    setTradeError(null);

    try {
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('Wallet client not available');

      const amountBigInt = parseEther(amount);
      const trade = await zoraManager.buyCoins(coinAddress, amountBigInt, account, walletClient, maxSlippage);
      
      // Refresh coins after trade
      await refreshCoins();
      
      return trade;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to buy coins';
      setTradeError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTrading(false);
    }
  }, [isConnected, account, getWalletClient]);

  // Sell coins
  const sellCoins = useCallback(async (
    coinAddress: string,
    amount: string,
    maxSlippage: number = 0.05
  ): Promise<Trade> => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    setTrading(true);
    setTradeError(null);

    try {
      const walletClient = getWalletClient();
      if (!walletClient) throw new Error('Wallet client not available');

      const amountBigInt = parseEther(amount);
      const trade = await zoraManager.sellCoins(coinAddress, amountBigInt, account, walletClient, maxSlippage);
      
      // Refresh coins after trade
      await refreshCoins();
      
      return trade;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sell coins';
      setTradeError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setTrading(false);
    }
  }, [isConnected, account, getWalletClient]);

  // Get coin activity
  const getCoinActivity = useCallback(async (coinAddress: string, limit: number = 50) => {
    try {
      const activity = await zoraManager.getCoinActivity(coinAddress, limit);
      return activity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get coin activity';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Get coin holders
  const getCoinHolders = useCallback(async (coinAddress: string, limit: number = 100) => {
    try {
      const holders = await zoraManager.getCoinHolders(coinAddress, limit);
      return holders;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get coin holders';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Get coin trades
  const getCoinTrades = useCallback(async (coinAddress: string, limit: number = 50) => {
    try {
      const trades = await zoraManager.getCoinTrades(coinAddress, limit);
      return trades;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get coin trades';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Refresh coins
  const refreshCoins = useCallback(async () => {
    await getAllCoins();
  }, [getAllCoins]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setTradeError(null);
  }, []);

  // Auto-fetch coins when connected
  useEffect(() => {
    if (isConnected) {
      getAllCoins();
    }
  }, [isConnected, getAllCoins]);

  return {
    // Connection state
    isConnected,
    account,
    
    // Coin management
    coins,
    loading,
    error,
    
    // Trading state
    trading,
    tradeError,
    
    // Actions
    createCoin,
    getCoinDetails,
    getAllCoins,
    getUserCoins,
    
    // Trading actions
    simulateBuy,
    simulateSell,
    buyCoins,
    sellCoins,
    
    // Data fetching
    getCoinActivity,
    getCoinHolders,
    getCoinTrades,
    
    // Utility functions
    refreshCoins,
    clearError,
  };
};
