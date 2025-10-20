import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Creator, CreatorCoin, User, WalletConnection, Trade } from '@/types';

interface AppState {
  // Wallet connection
  wallet: WalletConnection | null;
  isConnecting: boolean;
  
  // User data
  user: User | null;
  
  // Creators and coins
  creators: Creator[];
  creatorCoins: CreatorCoin[];
  
  // Trading
  trades: Trade[];
  isLoadingTrades: boolean;
  
  // UI state
  selectedCreator: Creator | null;
  selectedCoin: CreatorCoin | null;
  
  // Actions
  setWallet: (wallet: WalletConnection | null) => void;
  setIsConnecting: (connecting: boolean) => void;
  setUser: (user: User | null) => void;
  setCreators: (creators: Creator[]) => void;
  setCreatorCoins: (coins: CreatorCoin[]) => void;
  setTrades: (trades: Trade[]) => void;
  setIsLoadingTrades: (loading: boolean) => void;
  setSelectedCreator: (creator: Creator | null) => void;
  setSelectedCoin: (coin: CreatorCoin | null) => void;
  
  // Trading actions
  addTrade: (trade: Trade) => void;
  updateCoinPrice: (coinAddress: string, newPrice: bigint) => void;
  
  // Reset
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      wallet: null,
      isConnecting: false,
      user: null,
      creators: [],
      creatorCoins: [],
      trades: [],
      isLoadingTrades: false,
      selectedCreator: null,
      selectedCoin: null,
      
      // Actions
      setWallet: (wallet) => set({ wallet }),
      setIsConnecting: (isConnecting) => set({ isConnecting }),
      setUser: (user) => set({ user }),
      setCreators: (creators) => set({ creators }),
      setCreatorCoins: (creatorCoins) => set({ creatorCoins }),
      setTrades: (trades) => set({ trades }),
      setIsLoadingTrades: (isLoadingTrades) => set({ isLoadingTrades }),
      setSelectedCreator: (selectedCreator) => set({ selectedCreator }),
      setSelectedCoin: (selectedCoin) => set({ selectedCoin }),
      
      // Trading actions
      addTrade: (trade) => set((state) => ({ 
        trades: [trade, ...state.trades] 
      })),
      
      updateCoinPrice: (coinAddress, newPrice) => set((state) => ({
        creatorCoins: state.creatorCoins.map(coin => 
          coin.address === coinAddress 
            ? { ...coin, currentPrice: newPrice }
            : coin
        )
      })),
      
      // Reset
      reset: () => set({
        wallet: null,
        isConnecting: false,
        user: null,
        creators: [],
        creatorCoins: [],
        trades: [],
        isLoadingTrades: false,
        selectedCreator: null,
        selectedCoin: null,
      }),
    }),
    {
      name: 'friendtech-store',
    }
  )
);
