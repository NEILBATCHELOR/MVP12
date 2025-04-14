import * as ethers from "ethers";
import { ERC4626_ABI } from "./TokenInterfaces";
import { logActivity } from "../activityLogger";

// Vault asset interface
export interface VaultAsset {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Vault share interface
export interface VaultShare {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Vault position interface
export interface VaultPosition {
  shares: string; // Raw share amount
  formattedShares: string; // Formatted with decimals
  assets: string; // Underlying asset amount
  formattedAssets: string; // Formatted with decimals
  shareValue: string; // Value of 1 share in assets
}

// Vault metrics interface
export interface VaultMetrics {
  totalAssets: string;
  totalShares: string;
  sharePrice: string; // NAV per share
  apy: string; // Current APY as percentage
  managementFee: string; // Annual management fee percentage
  performanceFee: string; // Performance fee percentage
  tvl: string; // Total value locked in USD
  lastUpdated: string; // ISO timestamp
}

// Vault transaction interface
export interface VaultTransaction {
  txHash: string;
  type: "deposit" | "withdraw" | "transfer" | "mint" | "redeem";
  userAddress: string;
  shares?: string;
  assets?: string;
  timestamp: string;
}

/**
 * ERC4626 Vault Mechanisms
 *
 * This class implements the core functionality of ERC4626 tokenized vaults,
 * providing methods for deposits, withdrawals, conversions, and yield calculations.
 */
export class ERC4626Mechanisms {
  private provider: ethers.providers.Provider | null = null;
  private userId: string | null = null;
  private userEmail: string | null = null;

  /**
   * Initialize the ERC4626 mechanisms with a provider
   */
  async initialize(
    providerUrl: string,
    userId?: string,
    userEmail?: string,
  ): Promise<boolean> {
    try {
      // Set user info for logging
      this.userId = userId || null;
      this.userEmail = userEmail || null;

      // Connect to provider
      this.provider = new ethers.providers.JsonRpcProvider(providerUrl);

      // Log successful initialization
      await this.logVaultAction("vault_mechanisms_initialized", {
        providerUrl,
      });

      return true;
    } catch (error: any) {
      console.error("Failed to initialize ERC4626Mechanisms:", error);
      await this.logVaultAction("vault_mechanisms_initialization_failed", {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get vault contract instance
   */
  private getVaultContract(
    vaultAddress: string,
    signer?: ethers.Signer,
  ): ethers.Contract {
    if (!this.provider) {
      throw new Error("ERC4626Mechanisms not initialized");
    }

    return new ethers.Contract(
      vaultAddress,
      ERC4626_ABI,
      signer || this.provider,
    );
  }

  /**
   * Get vault metadata
   */
  async getVaultMetadata(vaultAddress: string): Promise<{
    vault: VaultShare;
    asset: VaultAsset;
  } | null> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);

      // Get vault token metadata
      const vaultName = await vaultContract.name();
      const vaultSymbol = await vaultContract.symbol();
      const vaultDecimals = await vaultContract.decimals();

      // Get underlying asset address
      const assetAddress = await vaultContract.asset();

      // Get asset contract
      const assetContract = new ethers.Contract(
        assetAddress,
        [
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)",
        ],
        this.provider,
      );

      // Get asset metadata
      const assetName = await assetContract.name();
      const assetSymbol = await assetContract.symbol();
      const assetDecimals = await assetContract.decimals();

      return {
        vault: {
          address: vaultAddress,
          name: vaultName,
          symbol: vaultSymbol,
          decimals: vaultDecimals,
        },
        asset: {
          address: assetAddress,
          name: assetName,
          symbol: assetSymbol,
          decimals: assetDecimals,
        },
      };
    } catch (error) {
      console.error(`Failed to get vault metadata for ${vaultAddress}:`, error);
      return null;
    }
  }

  /**
   * Get vault metrics
   */
  async getVaultMetrics(vaultAddress: string): Promise<VaultMetrics | null> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);

      // Get basic vault metrics
      const totalAssets = await vaultContract.totalAssets();
      const totalSupply = await vaultContract.totalSupply();

      // Calculate share price (NAV per share)
      // If totalSupply is 0, set share price to 1
      const sharePrice = totalSupply.gt(0)
        ? ethers.utils.formatUnits(
            totalAssets.mul(ethers.constants.WeiPerEther).div(totalSupply),
            18,
          )
        : "1.0";

      // For APY and TVL, we would typically need external data sources
      // Here we're returning placeholder values
      return {
        totalAssets: totalAssets.toString(),
        totalShares: totalSupply.toString(),
        sharePrice,
        apy: "0.0", // This would typically come from historical data or external source
        managementFee: "0.0", // This would typically be stored in the contract or external source
        performanceFee: "0.0", // This would typically be stored in the contract or external source
        tvl: totalAssets.toString(), // This would typically be calculated using price feeds
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to get vault metrics for ${vaultAddress}:`, error);
      return null;
    }
  }

  /**
   * Get user's position in the vault
   */
  async getUserPosition(
    vaultAddress: string,
    userAddress: string,
  ): Promise<VaultPosition | null> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);
      const vaultMetadata = await this.getVaultMetadata(vaultAddress);

      if (!vaultMetadata) {
        throw new Error("Failed to get vault metadata");
      }

      // Get user's share balance
      const shares = await vaultContract.balanceOf(userAddress);

      // Convert shares to assets
      const assets = await vaultContract.convertToAssets(shares);

      // Calculate share value (assets per share)
      const shareValue = shares.gt(0)
        ? ethers.utils.formatUnits(
            assets.mul(ethers.constants.WeiPerEther).div(shares),
            18,
          )
        : "1.0";

      return {
        shares: shares.toString(),
        formattedShares: ethers.utils.formatUnits(
          shares,
          vaultMetadata.vault.decimals,
        ),
        assets: assets.toString(),
        formattedAssets: ethers.utils.formatUnits(
          assets,
          vaultMetadata.asset.decimals,
        ),
        shareValue,
      };
    } catch (error) {
      console.error(
        `Failed to get user position for ${userAddress} in vault ${vaultAddress}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Deposit assets into the vault
   */
  async deposit(
    vaultAddress: string,
    amount: string,
    receiver: string,
    signer: ethers.Wallet,
  ): Promise<string | null> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress, signer);
      const vaultMetadata = await this.getVaultMetadata(vaultAddress);

      if (!vaultMetadata) {
        throw new Error("Failed to get vault metadata");
      }

      // Get asset contract
      const assetContract = new ethers.Contract(
        vaultMetadata.asset.address,
        [
          "function approve(address spender, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)",
        ],
        signer,
      );

      // Convert amount to wei
      const amountWei = ethers.utils.parseUnits(
        amount,
        vaultMetadata.asset.decimals,
      );

      // Check allowance
      const allowance = await assetContract.allowance(
        signer.address,
        vaultAddress,
      );

      // If allowance is insufficient, approve the vault to spend tokens
      if (allowance.lt(amountWei)) {
        const approveTx = await assetContract.approve(
          vaultAddress,
          ethers.constants.MaxUint256,
        );
        await approveTx.wait();
      }

      // Preview deposit to estimate shares
      const expectedShares = await vaultContract.previewDeposit(amountWei);

      // Execute deposit
      const tx = await vaultContract.deposit(amountWei, receiver);
      const receipt = await tx.wait();

      // Log the deposit
      await this.logVaultAction("deposit", {
        vaultAddress,
        from: signer.address,
        receiver,
        amount: amountWei.toString(),
        expectedShares: expectedShares.toString(),
        txHash: receipt.transactionHash,
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to deposit into vault:", error);
      await this.logVaultAction("deposit_failed", {
        vaultAddress,
        amount,
        receiver,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Mint shares from the vault
   */
  async mint(
    vaultAddress: string,
    shares: string,
    receiver: string,
    signer: ethers.Wallet,
  ): Promise<string | null> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress, signer);
      const vaultMetadata = await this.getVaultMetadata(vaultAddress);

      if (!vaultMetadata) {
        throw new Error("Failed to get vault metadata");
      }

      // Get asset contract
      const assetContract = new ethers.Contract(
        vaultMetadata.asset.address,
        [
          "function approve(address spender, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)",
        ],
        signer,
      );

      // Convert shares to wei
      const sharesWei = ethers.utils.parseUnits(
        shares,
        vaultMetadata.vault.decimals,
      );

      // Preview mint to estimate assets needed
      const assetsNeeded = await vaultContract.previewMint(sharesWei);

      // Check allowance
      const allowance = await assetContract.allowance(
        signer.address,
        vaultAddress,
      );

      // If allowance is insufficient, approve the vault to spend tokens
      if (allowance.lt(assetsNeeded)) {
        const approveTx = await assetContract.approve(
          vaultAddress,
          ethers.constants.MaxUint256,
        );
        await approveTx.wait();
      }

      // Execute mint
      const tx = await vaultContract.mint(sharesWei, receiver);
      const receipt = await tx.wait();

      // Log the mint
      await this.logVaultAction("mint", {
        vaultAddress,
        from: signer.address,
        receiver,
        shares: sharesWei.toString(),
        assetsNeeded: assetsNeeded.toString(),
        txHash: receipt.transactionHash,
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to mint vault shares:", error);
      await this.logVaultAction("mint_failed", {
        vaultAddress,
        shares,
        receiver,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Withdraw assets from the vault
   */
  async withdraw(
    vaultAddress: string,
    amount: string,
    receiver: string,
    owner: string,
    signer: ethers.Wallet,
  ): Promise<string | null> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress, signer);
      const vaultMetadata = await this.getVaultMetadata(vaultAddress);

      if (!vaultMetadata) {
        throw new Error("Failed to get vault metadata");
      }

      // Convert amount to wei
      const amountWei = ethers.utils.parseUnits(
        amount,
        vaultMetadata.asset.decimals,
      );

      // Preview withdraw to estimate shares needed
      const sharesNeeded = await vaultContract.previewWithdraw(amountWei);

      // Execute withdraw
      const tx = await vaultContract.withdraw(amountWei, receiver, owner);
      const receipt = await tx.wait();

      // Log the withdrawal
      await this.logVaultAction("withdraw", {
        vaultAddress,
        from: owner,
        receiver,
        amount: amountWei.toString(),
        sharesNeeded: sharesNeeded.toString(),
        txHash: receipt.transactionHash,
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to withdraw from vault:", error);
      await this.logVaultAction("withdraw_failed", {
        vaultAddress,
        amount,
        receiver,
        owner,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Redeem shares from the vault
   */
  async redeem(
    vaultAddress: string,
    shares: string,
    receiver: string,
    owner: string,
    signer: ethers.Wallet,
  ): Promise<string | null> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress, signer);
      const vaultMetadata = await this.getVaultMetadata(vaultAddress);

      if (!vaultMetadata) {
        throw new Error("Failed to get vault metadata");
      }

      // Convert shares to wei
      const sharesWei = ethers.utils.parseUnits(
        shares,
        vaultMetadata.vault.decimals,
      );

      // Preview redeem to estimate assets to receive
      const assetsToReceive = await vaultContract.previewRedeem(sharesWei);

      // Execute redeem
      const tx = await vaultContract.redeem(sharesWei, receiver, owner);
      const receipt = await tx.wait();

      // Log the redemption
      await this.logVaultAction("redeem", {
        vaultAddress,
        from: owner,
        receiver,
        shares: sharesWei.toString(),
        assetsToReceive: assetsToReceive.toString(),
        txHash: receipt.transactionHash,
      });

      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to redeem vault shares:", error);
      await this.logVaultAction("redeem_failed", {
        vaultAddress,
        shares,
        receiver,
        owner,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Calculate NAV (Net Asset Value) per share
   */
  async calculateNAVPerShare(vaultAddress: string): Promise<string> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);

      // Get total assets and total supply
      const totalAssets = await vaultContract.totalAssets();
      const totalSupply = await vaultContract.totalSupply();

      // If totalSupply is 0, return 1.0 as the default NAV
      if (totalSupply.isZero()) {
        return "1.0";
      }

      // Calculate NAV per share: totalAssets / totalSupply
      // We use 18 decimals for precision in the calculation
      const navPerShare = totalAssets
        .mul(ethers.constants.WeiPerEther)
        .div(totalSupply);

      return ethers.utils.formatUnits(navPerShare, 18);
    } catch (error) {
      console.error(
        `Failed to calculate NAV per share for ${vaultAddress}:`,
        error,
      );
      return "1.0"; // Default to 1.0 on error
    }
  }

  /**
   * Calculate estimated APY based on historical NAV changes
   * Note: This is a simplified calculation and would typically use more data points
   */
  async calculateEstimatedAPY(
    vaultAddress: string,
    historicalNAVs: { timestamp: number; nav: string }[],
  ): Promise<string> {
    try {
      if (historicalNAVs.length < 2) {
        return "0.0"; // Not enough data points
      }

      // Sort by timestamp (oldest first)
      const sortedNAVs = [...historicalNAVs].sort(
        (a, b) => a.timestamp - b.timestamp,
      );

      // Get oldest and newest NAV
      const oldestNAV = parseFloat(sortedNAVs[0].nav);
      const newestNAV = parseFloat(sortedNAVs[sortedNAVs.length - 1].nav);

      // Calculate time difference in years
      const timeDiffMs =
        sortedNAVs[sortedNAVs.length - 1].timestamp - sortedNAVs[0].timestamp;
      const timeDiffYears = timeDiffMs / (1000 * 60 * 60 * 24 * 365);

      if (timeDiffYears <= 0 || oldestNAV <= 0) {
        return "0.0";
      }

      // Calculate APY: (newestNAV / oldestNAV)^(1/timeDiffYears) - 1
      const apy = Math.pow(newestNAV / oldestNAV, 1 / timeDiffYears) - 1;

      // Convert to percentage and return with 2 decimal places
      return (apy * 100).toFixed(2);
    } catch (error) {
      console.error(
        `Failed to calculate estimated APY for ${vaultAddress}:`,
        error,
      );
      return "0.0";
    }
  }

  /**
   * Calculate management fee impact on NAV
   */
  calculateManagementFeeImpact(
    navPerShare: string,
    managementFeePercent: string,
    performanceFeePercent: string,
    periodInYears: number = 1,
  ): string {
    try {
      const nav = parseFloat(navPerShare);
      const mgmtFee = parseFloat(managementFeePercent) / 100;
      const perfFee = parseFloat(performanceFeePercent) / 100;

      // Calculate fee impact over the period
      // NAVfee = NAVtoken × (1−(Management Fee+Performance Fee / 100))
      const feeImpact = nav * Math.pow(1 - (mgmtFee + perfFee), periodInYears);

      return feeImpact.toFixed(6);
    } catch (error) {
      console.error("Failed to calculate management fee impact:", error);
      return navPerShare; // Return original NAV on error
    }
  }

  /**
   * Calculate estimated yield impact on NAV
   */
  calculateEstimatedYield(
    navPerShare: string,
    apyPercent: string,
    periodInYears: number = 1,
  ): string {
    try {
      const nav = parseFloat(navPerShare);
      const apy = parseFloat(apyPercent) / 100;

      // Calculate yield impact over the period
      // Yield annual = NAVtoken × (1+(APY/100))
      const yieldImpact = nav * Math.pow(1 + apy, periodInYears);

      return yieldImpact.toFixed(6);
    } catch (error) {
      console.error("Failed to calculate estimated yield:", error);
      return navPerShare; // Return original NAV on error
    }
  }

  /**
   * Calculate NAV evolution over time
   */
  calculateNAVEvolution(
    initialNAV: string,
    apyPercent: string,
    managementFeePercent: string,
    performanceFeePercent: string,
    periodInYears: number = 5,
    intervalsPerYear: number = 12,
  ): { timestamp: number; nav: string }[] {
    try {
      const nav = parseFloat(initialNAV);
      const apy = parseFloat(apyPercent) / 100;
      const mgmtFee = parseFloat(managementFeePercent) / 100;
      const perfFee = parseFloat(performanceFeePercent) / 100;

      const totalIntervals = periodInYears * intervalsPerYear;
      const intervalInYears = 1 / intervalsPerYear;

      const result: { timestamp: number; nav: string }[] = [];
      let currentNAV = nav;
      const now = Date.now();

      // Add initial point
      result.push({
        timestamp: now,
        nav: currentNAV.toFixed(6),
      });

      // Calculate NAV for each interval
      for (let i = 1; i <= totalIntervals; i++) {
        // Calculate yield for this interval
        const yieldForInterval =
          currentNAV * (Math.pow(1 + apy, intervalInYears) - 1);

        // Calculate fee for this interval
        const feeForInterval =
          currentNAV * (1 - Math.pow(1 - (mgmtFee + perfFee), intervalInYears));

        // Update NAV: NAVt = NAVt−1 + (Yield t − Fee t)
        currentNAV = currentNAV + (yieldForInterval - feeForInterval);

        // Add to result
        result.push({
          timestamp: now + (i * (365 * 24 * 60 * 60 * 1000)) / intervalsPerYear,
          nav: currentNAV.toFixed(6),
        });
      }

      return result;
    } catch (error) {
      console.error("Failed to calculate NAV evolution:", error);
      return [{ timestamp: Date.now(), nav: initialNAV }];
    }
  }

  /**
   * Get maximum deposit amount for a user
   */
  async getMaxDeposit(
    vaultAddress: string,
    userAddress: string,
  ): Promise<string> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);
      const maxDeposit = await vaultContract.maxDeposit(userAddress);
      return maxDeposit.toString();
    } catch (error) {
      console.error(
        `Failed to get max deposit for ${userAddress} in vault ${vaultAddress}:`,
        error,
      );
      return "0";
    }
  }

  /**
   * Get maximum withdrawal amount for a user
   */
  async getMaxWithdraw(
    vaultAddress: string,
    userAddress: string,
  ): Promise<string> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);
      const maxWithdraw = await vaultContract.maxWithdraw(userAddress);
      return maxWithdraw.toString();
    } catch (error) {
      console.error(
        `Failed to get max withdraw for ${userAddress} in vault ${vaultAddress}:`,
        error,
      );
      return "0";
    }
  }

  /**
   * Get maximum mint amount for a user
   */
  async getMaxMint(vaultAddress: string, userAddress: string): Promise<string> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);
      const maxMint = await vaultContract.maxMint(userAddress);
      return maxMint.toString();
    } catch (error) {
      console.error(
        `Failed to get max mint for ${userAddress} in vault ${vaultAddress}:`,
        error,
      );
      return "0";
    }
  }

  /**
   * Get maximum redeem amount for a user
   */
  async getMaxRedeem(
    vaultAddress: string,
    userAddress: string,
  ): Promise<string> {
    try {
      const vaultContract = this.getVaultContract(vaultAddress);
      const maxRedeem = await vaultContract.maxRedeem(userAddress);
      return maxRedeem.toString();
    } catch (error) {
      console.error(
        `Failed to get max redeem for ${userAddress} in vault ${vaultAddress}:`,
        error,
      );
      return "0";
    }
  }

  /**
   * Log vault actions to activity logger
   */
  private async logVaultAction(action: string, details: any): Promise<void> {
    try {
      if (!this.userId) return;
      
      await logActivity({
        action: `vault_${action}`,
        entity_type: "vault",
        entity_id: details.vaultAddress || "unknown",
        details: {
          ...details,
          user_id: this.userId,
          user_email: this.userEmail
        },
        status: details.status || "success",
      });
    } catch (error) {
      console.error("Failed to log vault action:", error);
    }
  }
}

// Create and export a singleton instance
export const erc4626Mechanisms = new ERC4626Mechanisms();
