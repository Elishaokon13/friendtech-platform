// Core types for the FriendTech on Zora platform

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  walletAddress: string;
  coinAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatorCoin {
  address: string;
  creatorId: string;
  symbol: string;
  name: string;
  totalSupply: bigint;
  circulatingSupply: bigint;
  currentPrice: bigint;
  marketCap: bigint;
  tradingVolume24h: bigint;
  priceChange24h: number;
  isActive: boolean;
}

export interface BondingCurve {
  k: number; // Constant factor for price sensitivity
  totalSupply: bigint;
  currentSupply: bigint;
  currentPrice: bigint;
  priceImpact: number; // Maximum price impact per trade
}

export interface Trade {
  id: string;
  coinAddress: string;
  traderAddress: string;
  type: 'buy' | 'sell';
  amount: bigint;
  price: bigint;
  totalValue: bigint;
  timestamp: Date;
  transactionHash: string;
}

export interface ExclusiveContent {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  content: string;
  requiredCoins: bigint;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  walletAddress: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  holdings: Record<string, bigint>; // coinAddress -> amount
  totalValue: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider?: any;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Trading types
export interface TradeParams {
  coinAddress: string;
  amount: bigint;
  maxSlippage: number;
  deadline: number;
}

export interface TradeQuote {
  inputAmount: bigint;
  outputAmount: bigint;
  priceImpact: number;
  minimumReceived: bigint;
  fee: bigint;
  deadline: number;
}
