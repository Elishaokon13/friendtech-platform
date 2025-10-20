import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { WalletConnection } from '@/types';

// WalletConnect configuration with proper modal
export class WalletConnectManager {
  private provider: EthereumProvider | null = null;
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  /**
   * Initialize WalletConnect provider with modal
   */
  async initialize(): Promise<EthereumProvider> {
    if (this.provider) {
      return this.provider;
    }

    this.provider = await EthereumProvider.init({
      projectId: this.projectId,
      chains: [8453], // Base mainnet
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '1000',
          '--wcm-background-color': '#ffffff',
          '--wcm-accent-color': '#000000',
          '--wcm-border-radius': '8px',
        },
        mobileWallets: [
          {
            id: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
            name: 'MetaMask',
            links: {
              native: 'metamask://',
              universal: 'https://metamask.app.link',
            },
          },
        ],
        desktopWallets: [
          {
            id: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
            name: 'MetaMask',
            links: {
              native: 'metamask://',
              universal: 'https://metamask.app.link',
            },
          },
        ],
      },
    });

    return this.provider;
  }

  /**
   * Connect wallet
   */
  async connect(): Promise<WalletConnection> {
    const provider = await this.initialize();
    
    try {
      const accounts = await provider.enable();
      const chainId = await provider.request({ method: 'eth_chainId' });
      
      return {
        address: accounts[0],
        chainId: parseInt(chainId as string, 16),
        isConnected: true,
        provider,
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
  }

  /**
   * Get current connection status
   */
  async getConnectionStatus(): Promise<WalletConnection | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const accounts = await this.provider.request({ method: 'eth_accounts' });
      const chainId = await this.provider.request({ method: 'eth_chainId' });
      
      if (accounts.length === 0) {
        return null;
      }

      return {
        address: accounts[0],
        chainId: parseInt(chainId as string, 16),
        isConnected: true,
        provider: this.provider,
      };
    } catch (error) {
      console.error('Error getting connection status:', error);
      return null;
    }
  }

  /**
   * Switch to Base network
   */
  async switchToBase(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet
      });
    } catch (error) {
      // If the chain doesn't exist, add it
      if ((error as any).code === 4902) {
        await this.provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Get provider instance
   */
  getProvider(): EthereumProvider | null {
    return this.provider;
  }
}

// Create singleton instance
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
export const walletConnectManager = new WalletConnectManager(projectId);

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const getExplorerUrl = (address: string): string => {
  return `https://basescan.org/address/${address}`;
};

export const getTransactionUrl = (txHash: string): string => {
  return `https://basescan.org/tx/${txHash}`;
};
