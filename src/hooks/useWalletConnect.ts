import { useState, useEffect, useCallback } from 'react';
import { walletConnectManager, WalletConnection } from '@/lib/walletConnect';
import { useAppStore } from '@/store';

export const useWalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    wallet, 
    setWallet, 
    setIsConnecting: setStoreConnecting,
    reset 
  } = useAppStore();

  // Initialize wallet connection on mount
  useEffect(() => {
    const initWallet = async () => {
      try {
        const connection = await walletConnectManager.getConnectionStatus();
        if (connection) {
          setWallet(connection);
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
      }
    };

    initWallet();
  }, [setWallet]);

  // Connect wallet with modal
  const connect = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    setStoreConnecting(true);

    try {
      const connection = await walletConnectManager.connect();
      setWallet(connection);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
      setStoreConnecting(false);
    }
  }, [isConnecting, setWallet, setStoreConnecting]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await walletConnectManager.disconnect();
      setWallet(null);
      reset();
    } catch (err) {
      console.error('Wallet disconnection error:', err);
    }
  }, [setWallet, reset]);

  // Switch to Base network
  const switchToBase = useCallback(async () => {
    try {
      await walletConnectManager.switchToBase();
    } catch (err) {
      console.error('Failed to switch to Base network:', err);
      throw err;
    }
  }, []);

  // Get provider instance
  const getProvider = useCallback(() => {
    return walletConnectManager.getProvider();
  }, []);

  return {
    // State
    wallet,
    isConnecting,
    error,
    isConnected: !!wallet?.isConnected,
    
    // Actions
    connect,
    disconnect,
    switchToBase,
    getProvider,
    
    // Utils
    clearError: () => setError(null),
  };
};
