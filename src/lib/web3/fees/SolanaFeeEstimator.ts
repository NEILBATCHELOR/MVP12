import { FeeEstimator, FeeEstimationOptions, FeePriority, FeeSuggestion, NetworkCongestion } from "./FeeEstimator";
import * as web3 from "@solana/web3.js";

/**
 * Fee estimator for Solana
 */
export class SolanaFeeEstimator extends FeeEstimator {
  private connection: web3.Connection;
  
  constructor(rpcUrl: string, blockchain: string) {
    // Pass a dummy provider since Solana doesn't use ethers.js
    super({} as any, blockchain);
    this.connection = new web3.Connection(rpcUrl, "confirmed");
  }
  
  async estimateFee(options?: FeeEstimationOptions): Promise<FeeSuggestion> {
    const priority = options?.priority || FeePriority.MEDIUM;
    
    try {
      // Get current network congestion
      const congestion = await this.getNetworkCongestion();
      
      // Get the recent fee rate from the Solana cluster
      const recentBlockhash = await this.connection.getLatestBlockhash();

      // Get a default fee since feeCalculator is no longer available in modern Solana
      let baseFee = 5000; // Default fee in lamports

      try {
        // Create a simple transaction to estimate fees
        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: web3.Keypair.generate().publicKey,
            toPubkey: web3.Keypair.generate().publicKey,
            lamports: 10,
          })
        );
        
        // Set the blockhash
        transaction.recentBlockhash = recentBlockhash.blockhash;
        
        // Get the fee for this transaction - make sure to await the promise
        const fee = await this.connection.getFeeForMessage(
          transaction.compileMessage()
        );
        
        if (fee) {
          baseFee = fee.value;
        }
      } catch (error) {
        console.error("Error getting Solana fee estimate:", error);
        // Continue with default fee
      }
      
      // Priority fee adjustment - Solana doesn't have priority fees like EIP-1559,
      // but we can suggest different fee levels for UI purposes
      const priorityMultiplier = this.getPriorityMultiplier(priority);
      
      // Calculate the adjusted fee
      const adjustedFee = Math.floor(baseFee * priorityMultiplier);
      
      // Create the fee suggestion
      const suggestion: FeeSuggestion = {
        blockchain: this.blockchain,
        networkCongestion: congestion,
        suggestedPriority: priority,
        gasPrice: (adjustedFee / web3.LAMPORTS_PER_SOL).toString(), // SOL
        gasPriceWei: adjustedFee.toString(), // lamports
        estimatedTimeSeconds: this.estimateTimeToConfirmation(priority, congestion),
        timestamp: Date.now(),
      };
      
      return suggestion;
    } catch (error) {
      throw new Error(`Failed to estimate Solana fee: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async getNetworkCongestion(): Promise<NetworkCongestion> {
    try {
      // Get recent performance samples
      const perfSamples = await this.connection.getRecentPerformanceSamples(10);
      
      if (perfSamples.length === 0) {
        return NetworkCongestion.MEDIUM;
      }
      
      // Calculate average TPS
      const totalTps = perfSamples.reduce((sum, sample) => sum + sample.numTransactions / sample.samplePeriodSecs, 0);
      const avgTps = totalTps / perfSamples.length;
      
      // Solana's theoretical max TPS is around 50,000, but practically it's much lower
      // We'll use more conservative thresholds
      if (avgTps < 500) {
        return NetworkCongestion.LOW;
      } else if (avgTps < 1500) {
        return NetworkCongestion.MEDIUM;
      } else if (avgTps < 3000) {
        return NetworkCongestion.HIGH;
      } else {
        return NetworkCongestion.VERY_HIGH;
      }
    } catch (error) {
      console.error("Error determining Solana network congestion:", error);
      return NetworkCongestion.MEDIUM;
    }
  }
  
  /**
   * Get a multiplier for the fee based on priority
   * @param priority Fee priority
   * @returns Fee multiplier
   */
  private getPriorityMultiplier(priority: FeePriority): number {
    switch (priority) {
      case FeePriority.LOW:
        return 1.0; // Standard fee
      case FeePriority.MEDIUM:
        return 1.5; // 1.5x standard fee
      case FeePriority.HIGH:
        return 2.0; // 2x standard fee
      case FeePriority.URGENT:
        return 3.0; // 3x standard fee
      default:
        return 1.0;
    }
  }
  
  /**
   * Estimate time to confirmation based on priority
   * @param priority Fee priority
   * @param congestion Network congestion
   * @returns Estimated time in seconds
   */
  private estimateTimeToConfirmation(
    priority: FeePriority,
    congestion: NetworkCongestion
  ): number {
    // Solana has very fast finality (typically less than 1 second)
    // But during congestion, it can be slightly longer
    
    const congestionFactor: Record<NetworkCongestion, number> = {
      [NetworkCongestion.LOW]: 1,
      [NetworkCongestion.MEDIUM]: 2,
      [NetworkCongestion.HIGH]: 5,
      [NetworkCongestion.VERY_HIGH]: 10
    };
    
    return congestionFactor[congestion];
  }
}