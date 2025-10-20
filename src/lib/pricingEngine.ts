/**
 * Advanced Pricing Engine
 * Integrates custom bonding curve with Zora's AMM pricing
 * Provides intelligent pricing recommendations and market analysis
 */

import { AdvancedBondingCurveCalculator } from './bondingCurve';
import { ZoraCreatorCoinManager } from './zora';
import { CreatorCoin, Trade } from '@/types';
import { formatPrice, formatNumber, formatPercentage } from './utils';

export interface PricingData {
  // Current pricing
  currentPrice: bigint;
  zoraPrice: bigint;
  customPrice: bigint;
  priceDifference: number;
  
  // Market analysis
  liquidityScore: number;
  volatilityScore: number;
  trendScore: number;
  
  // Trading recommendations
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  optimalTradeSize: bigint;
  
  // Price predictions
  priceTarget1h: bigint;
  priceTarget24h: bigint;
  priceTarget7d: bigint;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
}

export interface MarketConditions {
  overallTrend: 'bullish' | 'bearish' | 'neutral';
  marketCap: bigint;
  totalVolume: bigint;
  activeTraders: number;
  averageTradeSize: bigint;
  priceVolatility: number;
}

export class PricingEngine {
  private bondingCurve: AdvancedBondingCurveCalculator;
  private zoraManager: ZoraCreatorCoinManager;
  private priceHistory: Map<string, bigint[]> = new Map();
  private marketConditions: MarketConditions | null = null;

  constructor() {
    this.bondingCurve = new AdvancedBondingCurveCalculator();
    this.zoraManager = new ZoraCreatorCoinManager();
  }

  /**
   * Calculate comprehensive pricing data for a coin
   */
  async calculatePricingData(coin: CreatorCoin): Promise<PricingData> {
    try {
      // Get current Zora price
      const zoraPrice = coin.currentPrice;
      
      // Calculate custom bonding curve price
      const customPrice = this.bondingCurve.calculatePrice(
        coin.circulatingSupply,
        coin,
        coin.tradingVolume24h,
        new Date() // Assuming current time for last trade
      );

      // Calculate price difference
      const priceDifference = Number(customPrice - zoraPrice) / Number(zoraPrice);

      // Calculate market analysis scores
      const liquidityScore = this.calculateLiquidityScore(coin);
      const volatilityScore = this.calculateVolatilityScore(coin);
      const trendScore = this.calculateTrendScore(coin);

      // Generate trading recommendation
      const recommendation = this.generateRecommendation(coin, priceDifference, liquidityScore);
      const confidence = this.calculateConfidence(coin, priceDifference, liquidityScore);

      // Calculate optimal trade size
      const optimalTradeSize = this.calculateOptimalTradeSize(coin, liquidityScore);

      // Generate price predictions
      const priceTargets = this.generatePriceTargets(coin, customPrice);

      // Assess risk
      const riskAssessment = this.assessRisk(coin, volatilityScore, liquidityScore);

      return {
        currentPrice: zoraPrice,
        zoraPrice,
        customPrice,
        priceDifference,
        liquidityScore,
        volatilityScore,
        trendScore,
        recommendation,
        confidence,
        optimalTradeSize,
        priceTarget1h: priceTargets.oneHour,
        priceTarget24h: priceTargets.twentyFourHours,
        priceTarget7d: priceTargets.sevenDays,
        riskLevel: riskAssessment.level,
        riskFactors: riskAssessment.factors,
      };
    } catch (error) {
      console.error('Error calculating pricing data:', error);
      throw new Error('Failed to calculate pricing data');
    }
  }

  /**
   * Calculate liquidity score (0-100)
   */
  private calculateLiquidityScore(coin: CreatorCoin): number {
    const volumeScore = Math.min(Number(coin.tradingVolume24h) / 1e18 / 1000, 40); // Max 40 points
    const marketCapScore = Math.min(Number(coin.marketCap) / 1e18 / 10000, 30); // Max 30 points
    const priceStabilityScore = Math.max(0, 20 - Math.abs(coin.priceChange24h)); // Max 20 points
    const supplyScore = Math.min(Number(coin.circulatingSupply) / 1e18 / 1000000, 10); // Max 10 points

    return Math.min(volumeScore + marketCapScore + priceStabilityScore + supplyScore, 100);
  }

  /**
   * Calculate volatility score (0-100, higher = more volatile)
   */
  private calculateVolatilityScore(coin: CreatorCoin): number {
    const priceChange = Math.abs(coin.priceChange24h);
    const volumeVolatility = this.calculateVolumeVolatility(coin);
    
    return Math.min(priceChange * 2 + volumeVolatility, 100);
  }

  /**
   * Calculate trend score (-100 to 100, positive = bullish)
   */
  private calculateTrendScore(coin: CreatorCoin): number {
    const priceChange = coin.priceChange24h;
    const volumeTrend = this.calculateVolumeTrend(coin);
    const momentum = this.calculateMomentum(coin);
    
    return Math.max(-100, Math.min(100, priceChange + volumeTrend + momentum));
  }

  /**
   * Generate trading recommendation
   */
  private generateRecommendation(
    coin: CreatorCoin, 
    priceDifference: number, 
    liquidityScore: number
  ): 'buy' | 'sell' | 'hold' {
    // If custom price is significantly higher than Zora price, it's a buy opportunity
    if (priceDifference > 0.1 && liquidityScore > 50) {
      return 'buy';
    }
    
    // If custom price is significantly lower than Zora price, it's a sell opportunity
    if (priceDifference < -0.1 && liquidityScore > 50) {
      return 'sell';
    }
    
    // If price difference is small or liquidity is low, hold
    return 'hold';
  }

  /**
   * Calculate confidence in recommendation (0-100)
   */
  private calculateConfidence(
    coin: CreatorCoin, 
    priceDifference: number, 
    liquidityScore: number
  ): number {
    const priceDifferenceConfidence = Math.min(Math.abs(priceDifference) * 200, 50);
    const liquidityConfidence = liquidityScore * 0.3;
    const volumeConfidence = Math.min(Number(coin.tradingVolume24h) / 1e18 / 100, 20);
    
    return Math.min(priceDifferenceConfidence + liquidityConfidence + volumeConfidence, 100);
  }

  /**
   * Calculate optimal trade size to minimize price impact
   */
  private calculateOptimalTradeSize(coin: CreatorCoin, liquidityScore: number): bigint {
    const baseSize = Number(coin.circulatingSupply) / 1000; // 0.1% of supply
    const liquidityMultiplier = liquidityScore / 100;
    const optimalSize = baseSize * liquidityMultiplier;
    
    return BigInt(Math.floor(optimalSize));
  }

  /**
   * Generate price targets based on market analysis
   */
  private generatePriceTargets(coin: CreatorCoin, currentPrice: bigint) {
    const trend = this.calculateTrendScore(coin);
    const volatility = this.calculateVolatilityScore(coin);
    
    // Calculate price multipliers based on trend and volatility
    const oneHourMultiplier = 1 + (trend * 0.001) + (Math.random() - 0.5) * (volatility / 1000);
    const twentyFourHourMultiplier = 1 + (trend * 0.01) + (Math.random() - 0.5) * (volatility / 100);
    const sevenDayMultiplier = 1 + (trend * 0.05) + (Math.random() - 0.5) * (volatility / 10);
    
    return {
      oneHour: BigInt(Math.floor(Number(currentPrice) * oneHourMultiplier)),
      twentyFourHours: BigInt(Math.floor(Number(currentPrice) * twentyFourHourMultiplier)),
      sevenDays: BigInt(Math.floor(Number(currentPrice) * sevenDayMultiplier)),
    };
  }

  /**
   * Assess risk level and factors
   */
  private assessRisk(coin: CreatorCoin, volatilityScore: number, liquidityScore: number) {
    const riskFactors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (volatilityScore > 70) {
      riskFactors.push('High price volatility');
      riskLevel = 'high';
    } else if (volatilityScore > 40) {
      riskFactors.push('Moderate price volatility');
      riskLevel = 'medium';
    }

    if (liquidityScore < 30) {
      riskFactors.push('Low liquidity');
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }

    if (Math.abs(coin.priceChange24h) > 50) {
      riskFactors.push('Extreme price movement');
      riskLevel = 'high';
    }

    if (Number(coin.tradingVolume24h) < 1e18) { // Less than 1 ETH volume
      riskFactors.push('Low trading volume');
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }

    if (riskFactors.length === 0) {
      riskFactors.push('Stable market conditions');
    }

    return { level: riskLevel, factors: riskFactors };
  }

  /**
   * Calculate volume volatility
   */
  private calculateVolumeVolatility(coin: CreatorCoin): number {
    // This would ideally use historical volume data
    // For now, we'll use a simplified calculation
    const currentVolume = Number(coin.tradingVolume24h);
    const averageVolume = currentVolume * 0.8; // Simplified assumption
    return Math.abs(currentVolume - averageVolume) / averageVolume * 100;
  }

  /**
   * Calculate volume trend
   */
  private calculateVolumeTrend(coin: CreatorCoin): number {
    // This would ideally use historical volume data
    // For now, we'll use a simplified calculation based on price change
    return coin.priceChange24h * 0.5;
  }

  /**
   * Calculate momentum
   */
  private calculateMomentum(coin: CreatorCoin): number {
    // This would ideally use historical price data
    // For now, we'll use a simplified calculation
    return coin.priceChange24h * 0.3;
  }

  /**
   * Update market conditions
   */
  async updateMarketConditions(coins: CreatorCoin[]): Promise<void> {
    const totalMarketCap = coins.reduce((sum, coin) => sum + coin.marketCap, BigInt(0));
    const totalVolume = coins.reduce((sum, coin) => sum + coin.tradingVolume24h, BigInt(0));
    const averagePriceChange = coins.reduce((sum, coin) => sum + coin.priceChange24h, 0) / coins.length;
    
    this.marketConditions = {
      overallTrend: averagePriceChange > 5 ? 'bullish' : averagePriceChange < -5 ? 'bearish' : 'neutral',
      marketCap: totalMarketCap,
      totalVolume,
      activeTraders: coins.length, // Simplified
      averageTradeSize: totalVolume / BigInt(coins.length),
      priceVolatility: Math.abs(averagePriceChange),
    };
  }

  /**
   * Get market conditions
   */
  getMarketConditions(): MarketConditions | null {
    return this.marketConditions;
  }

  /**
   * Calculate price impact for a trade
   */
  async calculatePriceImpact(
    coin: CreatorCoin, 
    tradeAmount: bigint, 
    isBuy: boolean
  ): Promise<{
    priceImpact: number;
    newPrice: bigint;
    slippage: number;
  }> {
    try {
      const currentPrice = coin.currentPrice;
      const supply = coin.circulatingSupply;
      
      // Calculate new supply after trade
      const newSupply = isBuy ? supply + tradeAmount : supply - tradeAmount;
      
      // Calculate new price using bonding curve
      const newPrice = this.bondingCurve.calculatePrice(newSupply, coin);
      
      // Calculate price impact
      const priceImpact = Number(newPrice - currentPrice) / Number(currentPrice) * 100;
      
      // Calculate slippage
      const slippage = Math.abs(priceImpact);
      
      return {
        priceImpact,
        newPrice,
        slippage,
      };
    } catch (error) {
      console.error('Error calculating price impact:', error);
      throw new Error('Failed to calculate price impact');
    }
  }

  /**
   * Get pricing summary for display
   */
  getPricingSummary(pricingData: PricingData): {
    summary: string;
    keyMetrics: Array<{ label: string; value: string; color: string }>;
  } {
    const { recommendation, confidence, priceDifference, riskLevel } = pricingData;
    
    let summary = '';
    if (recommendation === 'buy') {
      summary = `Strong buy opportunity with ${confidence.toFixed(0)}% confidence. Custom pricing suggests ${formatPercentage(priceDifference * 100)} undervaluation.`;
    } else if (recommendation === 'sell') {
      summary = `Sell opportunity with ${confidence.toFixed(0)}% confidence. Custom pricing suggests ${formatPercentage(Math.abs(priceDifference) * 100)} overvaluation.`;
    } else {
      summary = `Hold position. Market conditions are neutral with ${confidence.toFixed(0)}% confidence.`;
    }

    const keyMetrics = [
      {
        label: 'Recommendation',
        value: recommendation.toUpperCase(),
        color: recommendation === 'buy' ? 'text-green-600' : recommendation === 'sell' ? 'text-red-600' : 'text-yellow-600'
      },
      {
        label: 'Confidence',
        value: `${confidence.toFixed(0)}%`,
        color: confidence > 70 ? 'text-green-600' : confidence > 40 ? 'text-yellow-600' : 'text-red-600'
      },
      {
        label: 'Price Difference',
        value: formatPercentage(priceDifference * 100),
        color: priceDifference > 0 ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'Risk Level',
        value: riskLevel.toUpperCase(),
        color: riskLevel === 'low' ? 'text-green-600' : riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
      }
    ];

    return { summary, keyMetrics };
  }
}
