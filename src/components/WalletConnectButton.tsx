'use client';

import { useWalletConnect } from '@/hooks/useWalletConnect';
import { formatAddress } from '@/lib/walletConnect';
import { Wallet, LogOut, ExternalLink } from 'lucide-react';

export const WalletConnectButton = () => {
  const { 
    wallet, 
    isConnecting, 
    error, 
    isConnected, 
    connect, 
    disconnect, 
    clearError 
  } = useWalletConnect();

  if (isConnected && wallet) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-sm">
            {formatAddress(wallet.address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600 text-sm">{error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
