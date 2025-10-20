import { BondingCurve, TradeQuote, CreatorCoin } from '@/types';

/**
 * Advanced bonding curve pricing algorithm for creator coins
 * Works as a custom layer on top of Zora's AMM pricing
 * 
 * Formula: Price = k * (supply^2) / (total_supply - supply)
 * Enhanced with:
 * - Dynamic k factor based on trading volume
 * - Creator popularity multiplier
 * - Time-based decay for inactive coins
 * - Slippage protection and MEV resistance
 */
export class AdvancedBondingCurveCalculator {
  private baseK: number;
  private totalSupply: bigint;
  private maxSlippage: number;
  private creatorMultiplier: number;
  private volumeMultiplier: number;
  private timeDecayFactor: number;

  constructor(
    baseK: number = 0.0001,
    totalSupply: bigint = BigInt(1e9),
    maxSlippage: number = 0.05,
    creatorMultiplier: number = 1.0,
    volumeMultiplier: number = 1.0,
    timeDecayFactor: number = 0.95
  ) {
    this.baseK = baseK;
    this.totalSupply = totalSupply;
    this.maxSlippage = maxSlippage;
    this.creatorMultiplier = creatorMultiplier;
    this.volumeMultiplier = volumeMultiplier;
    this.timeDecayFactor = timeDecayFactor;
  }

  /**
   * Calculate the current price based on supply with advanced factors
   */
  calculatePrice(
    supply: bigint, 
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): bigint {
    if (supply >= this.totalSupply) {
      throw new Error('Supply cannot exceed total supply');
    }

    const supplyNumber = Number(supply);
    const totalSupplyNumber = Number(this.totalSupply);
    
    // Calculate dynamic k factor
    const dynamicK = this.calculateDynamicK(coinData, tradingVolume24h, lastTradeTime);
    
    // Base bonding curve formula
    const basePrice = dynamicK * (supplyNumber ** 2) / (totalSupplyNumber - supplyNumber);
    
    // Apply creator multiplier
    const creatorPrice = basePrice * this.creatorMultiplier;
    
    // Apply volume multiplier
    const volumePrice = creatorPrice * this.volumeMultiplier;
    
    return BigInt(Math.floor(volumePrice * 1e18)); // Convert to wei
  }

  /**
   * Calculate dynamic k factor based on coin performance
   */
  private calculateDynamicK(
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): number {
    let k = this.baseK;
    
    // Volume-based adjustment
    if (tradingVolume24h) {
      const volumeETH = Number(tradingVolume24h) / 1e18;
      if (volumeETH > 100) {
        k *= 1.2; // Increase price sensitivity for high volume
      } else if (volumeETH < 1) {
        k *= 0.8; // Decrease price sensitivity for low volume
      }
    }
    
    // Time decay for inactive coins
    if (lastTradeTime) {
      const hoursSinceLastTrade = (Date.now() - lastTradeTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastTrade > 24) {
        k *= Math.pow(this.timeDecayFactor, Math.floor(hoursSinceLastTrade / 24));
      }
    }
    
    // Creator popularity adjustment
    if (coinData) {
      const marketCap = Number(coinData.marketCap) / 1e18;
      if (marketCap > 1000) {
        k *= 1.1; // Slightly increase for popular creators
      }
    }
    
    return Math.max(k, this.baseK * 0.1); // Minimum k factor
  }

  /**
   * Calculate price for a specific trade amount with advanced features
   */
  calculateTradePrice(
    currentSupply: bigint, 
    tradeAmount: bigint, 
    isBuy: boolean,
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): TradeQuote {
    const newSupply = isBuy 
      ? currentSupply + tradeAmount 
      : currentSupply - tradeAmount;

    if (newSupply < 0 || newSupply > this.totalSupply) {
      throw new Error('Invalid trade amount');
    }

    // Calculate prices with dynamic factors
    const currentPrice = this.calculatePrice(currentSupply, coinData, tradingVolume24h, lastTradeTime);
    const newPrice = this.calculatePrice(newSupply, coinData, tradingVolume24h, lastTradeTime);
    
    // Calculate price impact
    const priceImpact = isBuy 
      ? Number(newPrice - currentPrice) / Number(currentPrice)
      : Number(currentPrice - newPrice) / Number(currentPrice);

    // Enhanced slippage protection
    const adjustedMaxSlippage = this.calculateAdjustedMaxSlippage(coinData, tradingVolume24h);
    if (priceImpact > adjustedMaxSlippage) {
      throw new Error(`Price impact too high: ${(priceImpact * 100).toFixed(2)}% (max: ${(adjustedMaxSlippage * 100).toFixed(2)}%)`);
    }

    // Calculate trade amounts
    const inputAmount = isBuy ? tradeAmount : tradeAmount;
    const outputAmount = isBuy ? tradeAmount * currentPrice / BigInt(1e18) : tradeAmount * currentPrice / BigInt(1e18);
    
    // Dynamic fee calculation
    const feeRate = this.calculateDynamicFeeRate(coinData, tradingVolume24h);
    const fee = outputAmount * BigInt(Math.floor(feeRate * 10000)) / BigInt(10000);
    const minimumReceived = outputAmount - fee;

    // MEV protection - add random delay to deadline
    const baseDeadline = 1800; // 30 minutes
    const randomDelay = Math.floor(Math.random() * 300); // 0-5 minutes
    const deadline = Math.floor(Date.now() / 1000) + baseDeadline + randomDelay;

    return {
      inputAmount,
      outputAmount,
      priceImpact,
      minimumReceived,
      fee,
      deadline,
    };
  }

  /**
   * Calculate adjusted max slippage based on coin characteristics
   */
  private calculateAdjustedMaxSlippage(
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint
  ): number {
    let adjustedSlippage = this.maxSlippage;
    
    // Reduce slippage tolerance for high-volume coins
    if (tradingVolume24h) {
      const volumeETH = Number(tradingVolume24h) / 1e18;
      if (volumeETH > 100) {
        adjustedSlippage *= 0.8; // Stricter slippage for liquid coins
      }
    }
    
    // Increase slippage tolerance for new coins
    if (coinData) {
      const marketCap = Number(coinData.marketCap) / 1e18;
      if (marketCap < 10) {
        adjustedSlippage *= 1.5; // More lenient for new coins
      }
    }
    
    return Math.min(adjustedSlippage, 0.1); // Cap at 10%
  }

  /**
   * Calculate dynamic fee rate based on coin performance
   */
  private calculateDynamicFeeRate(
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint
  ): number {
    let feeRate = 0.01; // Base 1% fee
    
    // Reduce fees for high-volume coins
    if (tradingVolume24h) {
      const volumeETH = Number(tradingVolume24h) / 1e18;
      if (volumeETH > 1000) {
        feeRate *= 0.5; // 0.5% fee for very liquid coins
      } else if (volumeETH > 100) {
        feeRate *= 0.75; // 0.75% fee for liquid coins
      }
    }
    
    // Increase fees for new coins to prevent manipulation
    if (coinData) {
      const marketCap = Number(coinData.marketCap) / 1e18;
      if (marketCap < 1) {
        feeRate *= 2; // 2% fee for very new coins
      }
    }
    
    return Math.max(feeRate, 0.005); // Minimum 0.5% fee
  }

  /**
   * Calculate the amount of coins needed for a specific ETH amount
   */
  calculateCoinsForEth(
    supply: bigint, 
    ethAmount: bigint,
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): bigint {
    const price = this.calculatePrice(supply, coinData, tradingVolume24h, lastTradeTime);
    return (ethAmount * BigInt(1e18)) / price;
  }

  /**
   * Calculate the ETH amount for a specific number of coins
   */
  calculateEthForCoins(
    supply: bigint, 
    coinAmount: bigint,
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): bigint {
    const price = this.calculatePrice(supply, coinData, tradingVolume24h, lastTradeTime);
    return (coinAmount * price) / BigInt(1e18);
  }

  /**
   * Get bonding curve parameters with advanced data
   */
  getBondingCurve(
    supply: bigint,
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): BondingCurve {
    const currentPrice = this.calculatePrice(supply, coinData, tradingVolume24h, lastTradeTime);
    const dynamicK = this.calculateDynamicK(coinData, tradingVolume24h, lastTradeTime);
    
    return {
      k: dynamicK,
      totalSupply: this.totalSupply,
      currentSupply: supply,
      currentPrice,
      priceImpact: 0,
    };
  }

  /**
   * Calculate market cap with dynamic pricing
   */
  calculateMarketCap(
    supply: bigint,
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): bigint {
    const price = this.calculatePrice(supply, coinData, tradingVolume24h, lastTradeTime);
    return (supply * price) / BigInt(1e18);
  }

  /**
   * Calculate price change percentage with advanced factors
   */
  calculatePriceChange(
    currentSupply: bigint, 
    previousSupply: bigint,
    currentCoinData?: CreatorCoin,
    previousCoinData?: CreatorCoin,
    currentVolume?: bigint,
    previousVolume?: bigint
  ): number {
    const currentPrice = this.calculatePrice(currentSupply, currentCoinData, currentVolume);
    const previousPrice = this.calculatePrice(previousSupply, previousCoinData, previousVolume);
    
    return Number(currentPrice - previousPrice) / Number(previousPrice);
  }

  /**
   * Calculate optimal trade size to minimize price impact
   */
  calculateOptimalTradeSize(
    supply: bigint,
    maxPriceImpact: number = 0.01,
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): bigint {
    const currentPrice = this.calculatePrice(supply, coinData, tradingVolume24h, lastTradeTime);
    const maxPrice = currentPrice * BigInt(Math.floor((1 + maxPriceImpact) * 1e18)) / BigInt(1e18);
    
    // Binary search for optimal trade size
    let low = BigInt(0);
    let high = this.totalSupply - supply;
    let optimalSize = BigInt(0);
    
    while (low <= high) {
      const mid = (low + high) / BigInt(2);
      const newPrice = this.calculatePrice(supply + mid, coinData, tradingVolume24h, lastTradeTime);
      
      if (newPrice <= maxPrice) {
        optimalSize = mid;
        low = mid + BigInt(1);
      } else {
        high = mid - BigInt(1);
      }
    }
    
    return optimalSize;
  }

  /**
   * Calculate liquidity score for a coin
   */
  calculateLiquidityScore(
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): number {
    let score = 0;
    
    // Volume score (0-40 points)
    if (tradingVolume24h) {
      const volumeETH = Number(tradingVolume24h) / 1e18;
      score += Math.min(volumeETH / 10, 40); // Max 40 points for 400+ ETH volume
    }
    
    // Market cap score (0-30 points)
    if (coinData) {
      const marketCap = Number(coinData.marketCap) / 1e18;
      score += Math.min(marketCap / 100, 30); // Max 30 points for 3000+ ETH market cap
    }
    
    // Activity score (0-20 points)
    if (lastTradeTime) {
      const hoursSinceLastTrade = (Date.now() - lastTradeTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastTrade < 1) {
        score += 20; // Very active
      } else if (hoursSinceLastTrade < 24) {
        score += 15; // Active
      } else if (hoursSinceLastTrade < 168) {
        score += 10; // Somewhat active
      } else {
        score += 5; // Inactive
      }
    }
    
    // Price stability score (0-10 points)
    if (coinData && coinData.priceChange24h !== undefined) {
      const priceChange = Math.abs(coinData.priceChange24h);
      if (priceChange < 0.05) {
        score += 10; // Very stable
      } else if (priceChange < 0.1) {
        score += 7; // Stable
      } else if (priceChange < 0.2) {
        score += 4; // Somewhat volatile
      } else {
        score += 1; // Very volatile
      }
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get trading recommendations based on coin data
   */
  getTradingRecommendations(
    coinData?: CreatorCoin,
    tradingVolume24h?: bigint,
    lastTradeTime?: Date
  ): {
    recommendation: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string[];
  } {
    const liquidityScore = this.calculateLiquidityScore(coinData, tradingVolume24h, lastTradeTime);
    const reasoning: string[] = [];
    let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 0.5;

    // Volume analysis
    if (tradingVolume24h) {
      const volumeETH = Number(tradingVolume24h) / 1e18;
      if (volumeETH > 100) {
        reasoning.push('High trading volume indicates strong interest');
        confidence += 0.2;
      } else if (volumeETH < 1) {
        reasoning.push('Low trading volume may indicate lack of interest');
        confidence -= 0.1;
      }
    }

    // Price change analysis
    if (coinData && coinData.priceChange24h !== undefined) {
      const priceChange = coinData.priceChange24h;
      if (priceChange > 0.1) {
        reasoning.push('Strong positive price movement');
        recommendation = 'buy';
        confidence += 0.3;
      } else if (priceChange < -0.1) {
        reasoning.push('Negative price movement');
        recommendation = 'sell';
        confidence += 0.2;
      }
    }

    // Liquidity analysis
    if (liquidityScore > 70) {
      reasoning.push('High liquidity score - good for trading');
      confidence += 0.1;
    } else if (liquidityScore < 30) {
      reasoning.push('Low liquidity score - be cautious');
      confidence -= 0.1;
    }

    // Activity analysis
    if (lastTradeTime) {
      const hoursSinceLastTrade = (Date.now() - lastTradeTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastTrade > 168) {
        reasoning.push('No recent trading activity - coin may be inactive');
        confidence -= 0.2;
      }
    }

    return {
      recommendation,
      confidence: Math.max(0, Math.min(1, confidence)),
      reasoning,
    };
  }
}

// Default bonding curve calculator instance
export const defaultBondingCurve = new AdvancedBondingCurveCalculator();

// Specialized instances for different coin types
export const newCoinBondingCurve = new AdvancedBondingCurveCalculator(
  0.0002, // Higher k for new coins
  BigInt(1e9),
  0.08, // Higher slippage tolerance
  1.2, // Higher creator multiplier
  1.1, // Higher volume multiplier
  0.98 // Slower time decay
);

export const establishedCoinBondingCurve = new AdvancedBondingCurveCalculator(
  0.00005, // Lower k for established coins
  BigInt(1e9),
  0.03, // Lower slippage tolerance
  1.0, // Standard creator multiplier
  0.9, // Lower volume multiplier
  0.99 // Slower time decay
);

// Utility functions
export const formatPrice = (price: bigint): string => {
  const ethPrice = Number(price) / 1e18;
  return ethPrice.toFixed(6);
};

export const formatSupply = (supply: bigint): string => {
  const supplyNumber = Number(supply) / 1e18;
  return supplyNumber.toLocaleString();
};

export const formatMarketCap = (marketCap: bigint): string => {
  const ethMarketCap = Number(marketCap) / 1e18;
  if (ethMarketCap >= 1e6) {
    return `$${(ethMarketCap / 1e6).toFixed(2)}M`;
  } else if (ethMarketCap >= 1e3) {
    return `$${(ethMarketCap / 1e3).toFixed(2)}K`;
  }
  return `$${ethMarketCap.toFixed(2)}`;
};
