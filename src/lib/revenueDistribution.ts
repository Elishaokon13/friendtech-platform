/**
 * Revenue Distribution System
 * Manages revenue sharing between creators, platform, and token holders
 * Integrates with Zora SDK for automatic distribution
 */

import { ZoraCreatorCoinManager } from './zora';
import { formatEther, parseEther } from 'viem';

export interface RevenueDistribution {
  id: string;
  coinAddress: string;
  creatorId: string;
  totalRevenue: bigint;
  creatorShare: bigint;
  platformShare: bigint;
  holderShare: bigint;
  distributionDate: Date;
  transactionHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface RevenueShare {
  recipient: string;
  amount: bigint;
  percentage: number;
  type: 'creator' | 'platform' | 'holder' | 'treasury';
}

export interface RevenueMetrics {
  totalRevenue: bigint;
  creatorRevenue: bigint;
  platformRevenue: bigint;
  holderRevenue: bigint;
  averageDistribution: bigint;
  distributionCount: number;
  topEarners: Array<{
    address: string;
    revenue: bigint;
    percentage: number;
  }>;
}

export interface DistributionConfig {
  creatorPercentage: number; // Default: 70%
  platformPercentage: number; // Default: 20%
  holderPercentage: number; // Default: 10%
  minimumDistribution: bigint; // Minimum amount to trigger distribution
  distributionInterval: number; // Hours between distributions
  lastDistribution: Date;
}

export class RevenueDistributionManager {
  private zoraManager: ZoraCreatorCoinManager;
  private distributionConfig: DistributionConfig;

  constructor() {
    this.zoraManager = new ZoraCreatorCoinManager();
    this.distributionConfig = {
      creatorPercentage: 70,
      platformPercentage: 20,
      holderPercentage: 10,
      minimumDistribution: parseEther('0.01'), // 0.01 ETH minimum
      distributionInterval: 24, // 24 hours
      lastDistribution: new Date(0)
    };
  }

  /**
   * Calculate revenue distribution for a given amount
   */
  calculateRevenueDistribution(
    totalAmount: bigint,
    creatorId: string,
    coinAddress: string
  ): RevenueShare[] {
    const shares: RevenueShare[] = [];

    // Creator share
    const creatorAmount = (totalAmount * BigInt(this.distributionConfig.creatorPercentage)) / BigInt(100);
    shares.push({
      recipient: creatorId,
      amount: creatorAmount,
      percentage: this.distributionConfig.creatorPercentage,
      type: 'creator'
    });

    // Platform share
    const platformAmount = (totalAmount * BigInt(this.distributionConfig.platformPercentage)) / BigInt(100);
    shares.push({
      recipient: this.getPlatformAddress(),
      amount: platformAmount,
      percentage: this.distributionConfig.platformPercentage,
      type: 'platform'
    });

    // Holder share (distributed among token holders)
    const holderAmount = (totalAmount * BigInt(this.distributionConfig.holderPercentage)) / BigInt(100);
    shares.push({
      recipient: coinAddress, // Will be distributed to holders
      amount: holderAmount,
      percentage: this.distributionConfig.holderPercentage,
      type: 'holder'
    });

    return shares;
  }

  /**
   * Distribute revenue to all parties
   */
  async distributeRevenue(
    coinAddress: string,
    creatorId: string,
    totalAmount: bigint,
    walletClient: any
  ): Promise<RevenueDistribution> {
    try {
      // Check if distribution meets minimum threshold
      if (totalAmount < this.distributionConfig.minimumDistribution) {
        throw new Error('Revenue amount below minimum distribution threshold');
      }

      // Calculate distribution shares
      const shares = this.calculateRevenueDistribution(totalAmount, creatorId, coinAddress);

      // Create distribution record
      const distribution: RevenueDistribution = {
        id: this.generateDistributionId(),
        coinAddress,
        creatorId,
        totalRevenue: totalAmount,
        creatorShare: shares.find(s => s.type === 'creator')?.amount || BigInt(0),
        platformShare: shares.find(s => s.type === 'platform')?.amount || BigInt(0),
        holderShare: shares.find(s => s.type === 'holder')?.amount || BigInt(0),
        distributionDate: new Date(),
        status: 'processing'
      };

      // Execute distributions
      const distributionPromises = shares.map(share => 
        this.executeDistribution(share, walletClient)
      );

      const results = await Promise.allSettled(distributionPromises);
      
      // Check if all distributions succeeded
      const failedDistributions = results.filter(result => result.status === 'rejected');
      
      if (failedDistributions.length > 0) {
        distribution.status = 'failed';
        console.error('Some distributions failed:', failedDistributions);
      } else {
        distribution.status = 'completed';
        // Update last distribution time
        this.distributionConfig.lastDistribution = new Date();
      }

      // Store distribution record (would save to database)
      await this.saveDistributionRecord(distribution);

      return distribution;

    } catch (error) {
      console.error('Error distributing revenue:', error);
      throw new Error('Failed to distribute revenue');
    }
  }

  /**
   * Execute individual distribution
   */
  private async executeDistribution(share: RevenueShare, walletClient: any): Promise<void> {
    try {
      if (share.type === 'holder') {
        // Distribute to token holders
        await this.distributeToHolders(share.recipient, share.amount, walletClient);
      } else {
        // Direct transfer to creator or platform
        await this.transferToAddress(share.recipient, share.amount, walletClient);
      }
    } catch (error) {
      console.error(`Error executing distribution to ${share.recipient}:`, error);
      throw error;
    }
  }

  /**
   * Distribute revenue to token holders proportionally
   */
  private async distributeToHolders(
    coinAddress: string,
    amount: bigint,
    walletClient: any
  ): Promise<void> {
    try {
      // Get all token holders
      const holders = await this.zoraManager.getCoinHolders(coinAddress);
      
      if (holders.length === 0) {
        console.log('No holders found for distribution');
        return;
      }

      // Calculate total supply for proportional distribution
      const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, BigInt(0));
      
      if (totalSupply === BigInt(0)) {
        console.log('Total supply is zero, cannot distribute');
        return;
      }

      // Distribute proportionally to each holder
      const distributionPromises = holders.map(holder => {
        const holderShare = (amount * holder.balance) / totalSupply;
        if (holderShare > BigInt(0)) {
          return this.transferToAddress(holder.address, holderShare, walletClient);
        }
        return Promise.resolve();
      });

      await Promise.allSettled(distributionPromises);

    } catch (error) {
      console.error('Error distributing to holders:', error);
      throw error;
    }
  }

  /**
   * Transfer ETH to a specific address
   */
  private async transferToAddress(
    toAddress: string,
    amount: bigint,
    walletClient: any
  ): Promise<void> {
    try {
      // This would use the wallet client to send ETH
      // For now, we'll simulate the transfer
      console.log(`Transferring ${formatEther(amount)} ETH to ${toAddress}`);
      
      // In a real implementation, this would be:
      // await walletClient.sendTransaction({
      //   to: toAddress as `0x${string}`,
      //   value: amount
      // });
      
    } catch (error) {
      console.error(`Error transferring to ${toAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get revenue metrics for a coin
   */
  async getRevenueMetrics(coinAddress: string): Promise<RevenueMetrics> {
    try {
      // This would query the database for actual metrics
      // For now, we'll return mock data
      return this.generateMockRevenueMetrics(coinAddress);
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      throw new Error('Failed to get revenue metrics');
    }
  }

  /**
   * Get distribution history for a coin
   */
  async getDistributionHistory(coinAddress: string): Promise<RevenueDistribution[]> {
    try {
      // This would query the database
      // For now, we'll return mock data
      return this.generateMockDistributionHistory(coinAddress);
    } catch (error) {
      console.error('Error getting distribution history:', error);
      return [];
    }
  }

  /**
   * Update distribution configuration
   */
  updateDistributionConfig(config: Partial<DistributionConfig>): void {
    this.distributionConfig = { ...this.distributionConfig, ...config };
  }

  /**
   * Get current distribution configuration
   */
  getDistributionConfig(): DistributionConfig {
    return { ...this.distributionConfig };
  }

  /**
   * Check if distribution is due
   */
  isDistributionDue(): boolean {
    const now = new Date();
    const timeSinceLastDistribution = now.getTime() - this.distributionConfig.lastDistribution.getTime();
    const hoursSinceLastDistribution = timeSinceLastDistribution / (1000 * 60 * 60);
    
    return hoursSinceLastDistribution >= this.distributionConfig.distributionInterval;
  }

  /**
   * Get platform address
   */
  private getPlatformAddress(): string {
    // This would be the actual platform treasury address
    return '0x0000000000000000000000000000000000000000';
  }

  /**
   * Generate unique distribution ID
   */
  private generateDistributionId(): string {
    return 'dist_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Save distribution record
   */
  private async saveDistributionRecord(distribution: RevenueDistribution): Promise<void> {
    try {
      // This would save to the database
      console.log('Saving distribution record:', distribution);
    } catch (error) {
      console.error('Error saving distribution record:', error);
      throw error;
    }
  }

  /**
   * Generate mock revenue metrics
   */
  private generateMockRevenueMetrics(coinAddress: string): RevenueMetrics {
    return {
      totalRevenue: parseEther('10.5'), // 10.5 ETH
      creatorRevenue: parseEther('7.35'), // 70%
      platformRevenue: parseEther('2.1'), // 20%
      holderRevenue: parseEther('1.05'), // 10%
      averageDistribution: parseEther('0.5'), // 0.5 ETH average
      distributionCount: 21,
      topEarners: [
        { address: '0x1234...5678', revenue: parseEther('2.1'), percentage: 20 },
        { address: '0x2345...6789', revenue: parseEther('1.8'), percentage: 17.1 },
        { address: '0x3456...7890', revenue: parseEther('1.5'), percentage: 14.3 }
      ]
    };
  }

  /**
   * Generate mock distribution history
   */
  private generateMockDistributionHistory(coinAddress: string): RevenueDistribution[] {
    const distributions: RevenueDistribution[] = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const distributionDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const totalRevenue = parseEther((0.1 + Math.random() * 0.9).toFixed(3));
      
      distributions.push({
        id: `dist_${i}_${Date.now()}`,
        coinAddress,
        creatorId: 'creator1',
        totalRevenue,
        creatorShare: (totalRevenue * BigInt(70)) / BigInt(100),
        platformShare: (totalRevenue * BigInt(20)) / BigInt(100),
        holderShare: (totalRevenue * BigInt(10)) / BigInt(100),
        distributionDate,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'completed'
      });
    }
    
    return distributions;
  }
}

