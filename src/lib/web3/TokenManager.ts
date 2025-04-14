import * as ethers from "ethers";
import { logActivity } from "../activityLogger";
import {
  ERC20_ABI,
  ERC721_ABI,
  ERC1155_ABI,
  ERC1400_ABI,
  ERC3525_ABI,
  ERC4626_ABI,
} from "./TokenInterfaces";

// Token types
export enum TokenType {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
  ERC1400 = "ERC1400",
  ERC3525 = "ERC3525",
  ERC4626 = "ERC4626",
}

// Token metadata interface
export interface TokenMetadata {
  address: string;
  type: TokenType;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  chainId: number;
  lastUpdated: string;
}

// Token balance interface
export interface TokenBalance {
  tokenAddress: string;
  tokenType: TokenType;
  tokenId?: string; // For NFTs and multi-tokens
  balance: string;
  formattedBalance?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  tokenURI?: string; // For NFTs
  partition?: string; // For ERC1400
}

// Token Manager class to handle token operations
export class TokenManager {
  private provider: ethers.providers.Provider | null = null;
  private userId: string | null = null;
  private userEmail: string | null = null;

  // Initialize the token manager
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
      await this.logTokenAction("token_manager_initialized", {
        providerUrl,
      });

      return true;
    } catch (error: any) {
      console.error("Failed to initialize TokenManager:", error);
      await this.logTokenAction("token_manager_initialization_failed", {
        error: error.message,
      });
      return false;
    }
  }

  // Get token metadata
  async getTokenMetadata(
    tokenAddress: string,
    tokenType: TokenType,
  ): Promise<TokenMetadata | null> {
    try {
      if (!this.provider) {
        throw new Error("Token manager not initialized");
      }

      // Get contract instance based on token type
      const contract = new ethers.Contract(
        tokenAddress,
        this.getAbiForTokenType(tokenType),
        this.provider,
      );

      // Get network info
      const network = await this.provider.getNetwork();

      // Get basic metadata
      const metadata: TokenMetadata = {
        address: tokenAddress,
        type: tokenType,
        chainId: network.chainId,
        lastUpdated: new Date().toISOString(),
      };

      // Get token-specific metadata
      if (
        tokenType === TokenType.ERC20 ||
        tokenType === TokenType.ERC1400 ||
        tokenType === TokenType.ERC4626
      ) {
        // Get ERC20-compatible metadata
        try {
          metadata.name = await contract.name();
          metadata.symbol = await contract.symbol();
          metadata.decimals = await contract.decimals();
          metadata.totalSupply = (await contract.totalSupply()).toString();
        } catch (e: any) {
          console.warn(
            `Some ERC20 metadata not available for ${tokenAddress}:`,
            e,
          );
        }
      } else if (tokenType === TokenType.ERC721) {
        // Get ERC721 metadata
        try {
          metadata.name = await contract.name();
          metadata.symbol = await contract.symbol();
        } catch (e: any) {
          console.warn(
            `Some ERC721 metadata not available for ${tokenAddress}:`,
            e,
          );
        }
      } else if (tokenType === TokenType.ERC3525) {
        // Get ERC3525 metadata
        try {
          metadata.name = await contract.name();
          metadata.symbol = await contract.symbol();
          metadata.decimals = await contract.valueDecimals();
        } catch (e: any) {
          console.warn(
            `Some ERC3525 metadata not available for ${tokenAddress}:`,
            e,
          );
        }
      }

      return metadata;
    } catch (error: any) {
      console.error(`Failed to get metadata for token ${tokenAddress}:`, error);
      return null;
    }
  }

  // Get token balances for an address
  async getTokenBalances(
    walletAddress: string,
    tokenAddresses: { address: string; type: TokenType; tokenId?: string }[],
  ): Promise<TokenBalance[]> {
    try {
      if (!this.provider) {
        throw new Error("Token manager not initialized");
      }

      const balances: TokenBalance[] = [];

      // Process each token
      for (const token of tokenAddresses) {
        const contract = new ethers.Contract(
          token.address,
          this.getAbiForTokenType(token.type),
          this.provider,
        );

        const balance: TokenBalance = {
          tokenAddress: token.address,
          tokenType: token.type,
          balance: "0",
        };

        // Get balance based on token type
        if (
          token.type === TokenType.ERC20 ||
          token.type === TokenType.ERC1400 ||
          token.type === TokenType.ERC4626
        ) {
          // Get ERC20-compatible balance
          try {
            balance.balance = (
              await contract.balanceOf(walletAddress)
            ).toString();
            balance.name = await contract.name();
            balance.symbol = await contract.symbol();
            balance.decimals = await contract.decimals();

            // Format balance with decimals
            balance.formattedBalance = ethers.utils.formatUnits(
              balance.balance,
              balance.decimals,
            );

            // For ERC1400, get partitions if available
            if (token.type === TokenType.ERC1400) {
              try {
                const partitions = await contract.partitionsOf(walletAddress);
                if (partitions && partitions.length > 0) {
                  balance.partition = partitions[0];
                }
              } catch (e: any) {
                console.warn(
                  `Partitions not available for ${token.address}:`,
                  e,
                );
              }
            }
          } catch (e: any) {
            console.warn(
              `Error getting ERC20 balance for ${token.address}:`,
              e,
            );
          }
        } else if (token.type === TokenType.ERC721) {
          // Get ERC721 balance and ownership
          try {
            balance.name = await contract.name();
            balance.symbol = await contract.symbol();

            if (token.tokenId) {
              // Check if the wallet owns this specific NFT
              try {
                const owner = await contract.ownerOf(token.tokenId);
                balance.tokenId = token.tokenId;
                balance.balance =
                  owner.toLowerCase() === walletAddress.toLowerCase()
                    ? "1"
                    : "0";
                balance.formattedBalance = balance.balance;

                // Get token URI if available
                try {
                  balance.tokenURI = await contract.tokenURI(token.tokenId);
                } catch (e: any) {
                  console.warn(
                    `TokenURI not available for ${token.address} #${token.tokenId}:`,
                    e,
                  );
                }
              } catch (e: any) {
                console.warn(
                  `Error checking ownership of ${token.address} #${token.tokenId}:`,
                  e,
                );
                balance.balance = "0";
                balance.formattedBalance = "0";
              }
            } else {
              // Get total balance of NFTs for this contract
              balance.balance = (
                await contract.balanceOf(walletAddress)
              ).toString();
              balance.formattedBalance = balance.balance;
            }
          } catch (e: any) {
            console.warn(
              `Error getting ERC721 balance for ${token.address}:`,
              e,
            );
          }
        } else if (token.type === TokenType.ERC1155) {
          // Get ERC1155 balance for specific token ID
          if (token.tokenId) {
            try {
              balance.tokenId = token.tokenId;
              balance.balance = (
                await contract.balanceOf(walletAddress, token.tokenId)
              ).toString();
              balance.formattedBalance = balance.balance;

              // Get token URI if available
              try {
                balance.tokenURI = await contract.uri(token.tokenId);
              } catch (e: any) {
                console.warn(
                  `URI not available for ${token.address} #${token.tokenId}:`,
                  e,
                );
              }
            } catch (e: any) {
              console.warn(
                `Error getting ERC1155 balance for ${token.address} #${token.tokenId}:`,
                e,
              );
            }
          } else {
            console.warn(
              `TokenId required for ERC1155 balance check: ${token.address}`,
            );
          }
        } else if (token.type === TokenType.ERC3525) {
          // Get ERC3525 balance
          try {
            balance.name = await contract.name();
            balance.symbol = await contract.symbol();
            balance.decimals = await contract.valueDecimals();

            if (token.tokenId) {
              // Get value of specific token ID
              try {
                const owner = await contract.ownerOf(token.tokenId);
                if (owner.toLowerCase() === walletAddress.toLowerCase()) {
                  balance.tokenId = token.tokenId;
                  // Fix the valueOf call - use balanceOf or value instead depending on contract
                  try {
                    // Try value() method first (typical for ERC3525)
                    balance.balance = (
                      await contract.value(token.tokenId)
                    ).toString();
                  } catch (valueError) {
                    // Fallback to valueOf without arguments if value() is not available
                    try {
                      balance.balance = (await contract.valueOf()).toString();
                    } catch (valueOfError) {
                      // Last resort - use balanceOf
                      balance.balance = (await contract.balanceOf(owner)).toString();
                    }
                  }
                  balance.formattedBalance = ethers.utils.formatUnits(
                    balance.balance,
                    balance.decimals,
                  );
                } else {
                  balance.balance = "0";
                  balance.formattedBalance = "0";
                }
              } catch (e: any) {
                console.warn(
                  `Error checking ERC3525 token ${token.address} #${token.tokenId}:`,
                  e,
                );
                balance.balance = "0";
                balance.formattedBalance = "0";
              }
            } else {
              // Get total balance of tokens for this contract
              balance.balance = (
                await contract.balanceOf(walletAddress)
              ).toString();
              balance.formattedBalance = balance.balance;
            }
          } catch (e: any) {
            console.warn(
              `Error getting ERC3525 balance for ${token.address}:`,
              e,
            );
          }
        }

        balances.push(balance);
      }

      return balances;
    } catch (error: any) {
      console.error(
        `Failed to get token balances for ${walletAddress}:`,
        error,
      );
      return [];
    }
  }

  // Transfer tokens
  async transferTokens(
    tokenAddress: string,
    tokenType: TokenType,
    to: string,
    amount: string,
    signer: ethers.Wallet,
    tokenId?: string,
    partition?: string
  ): Promise<string | null> {
    try {
      if (!this.provider) {
        throw new Error("Token manager not initialized");
      }

      // Get contract instance with signer
      const contract = new ethers.Contract(
        tokenAddress,
        this.getAbiForTokenType(tokenType),
        signer,
      );

      let tx;

      // Execute transfer based on token type
      if (tokenType === TokenType.ERC20) {
        // ERC20 transfer
        tx = await contract.transfer(to, amount);
      } else if (tokenType === TokenType.ERC721) {
        // ERC721 transfer
        if (!tokenId) throw new Error("TokenId required for ERC721 transfer");
        tx = await contract.transferFrom(signer.address, to, tokenId);
      } else if (tokenType === TokenType.ERC1155) {
        // ERC1155 transfer
        if (!tokenId) throw new Error("TokenId required for ERC1155 transfer");
        tx = await contract.safeTransferFrom(
          signer.address,
          to,
          tokenId,
          amount,
          "0x",
        );
      } else if (tokenType === TokenType.ERC1400) {
        // ERC1400 transfer
        if (partition) {
          // Transfer by partition
          tx = await contract.transferByPartition(partition, to, amount, "0x");
        } else {
          // Regular ERC20 transfer
          tx = await contract.transfer(to, amount);
        }
      } else if (tokenType === TokenType.ERC3525) {
        // ERC3525 transfer
        if (!tokenId) throw new Error("TokenId required for ERC3525 transfer");

        // Create a new token for the recipient with the transferred value
        tx = await contract.transferValue(tokenId, to, amount);
      } else if (tokenType === TokenType.ERC4626) {
        // ERC4626 transfer (same as ERC20)
        tx = await contract.transfer(to, amount);
      }

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Log the transfer
      await this.logTokenAction("token_transfer", {
        tokenAddress,
        tokenType,
        from: signer.address,
        to,
        amount,
        tokenId,
        partition,
        txHash: receipt.transactionHash,
      });

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("Failed to transfer tokens:", error);
      await this.logTokenAction("token_transfer_failed", {
        tokenAddress,
        tokenType,
        to,
        amount,
        tokenId,
        partition,
        error: error.message,
      });
      return null;
    }
  }

  // Approve token spending
  async approveTokens(
    tokenAddress: string,
    tokenType: TokenType,
    spender: string,
    amount: string,
    signer: ethers.Wallet,
    tokenId?: string
  ): Promise<string | null> {
    try {
      if (!this.provider) {
        throw new Error("Token manager not initialized");
      }

      // Get contract instance with signer
      const contract = new ethers.Contract(
        tokenAddress,
        this.getAbiForTokenType(tokenType),
        signer,
      );

      let tx;

      // Execute approval based on token type
      if (
        tokenType === TokenType.ERC20 ||
        tokenType === TokenType.ERC1400 ||
        tokenType === TokenType.ERC4626
      ) {
        // ERC20 approval
        tx = await contract.approve(spender, amount);
      } else if (tokenType === TokenType.ERC721) {
        // ERC721 approval
        if (!tokenId) throw new Error("TokenId required for ERC721 approval");
        tx = await contract.approve(spender, tokenId);
      } else if (tokenType === TokenType.ERC1155) {
        // ERC1155 approval (setApprovalForAll)
        tx = await contract.setApprovalForAll(spender, true);
      } else if (tokenType === TokenType.ERC3525) {
        // ERC3525 approval
        if (!tokenId) throw new Error("TokenId required for ERC3525 approval");
        tx = await contract.approve(tokenId, spender, amount);
      }

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Log the approval
      await this.logTokenAction("token_approval", {
        tokenAddress,
        tokenType,
        owner: signer.address,
        spender,
        amount,
        tokenId,
        txHash: receipt.transactionHash,
      });

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("Failed to approve tokens:", error);
      await this.logTokenAction("token_approval_failed", {
        tokenAddress,
        tokenType,
        spender,
        amount,
        tokenId,
        error: error.message,
      });
      return null;
    }
  }

  // Get ABI for token type
  private getAbiForTokenType(tokenType: TokenType): any[] {
    switch (tokenType) {
      case TokenType.ERC20:
        return ERC20_ABI;
      case TokenType.ERC721:
        return ERC721_ABI;
      case TokenType.ERC1155:
        return ERC1155_ABI;
      case TokenType.ERC1400:
        return ERC1400_ABI;
      case TokenType.ERC3525:
        return ERC3525_ABI;
      case TokenType.ERC4626:
        return ERC4626_ABI;
      default:
        throw new Error(`Unsupported token type: ${tokenType}`);
    }
  }

  // Log token actions to activity logger
  private async logTokenAction(action: string, details: any): Promise<void> {
    try {
      if (!this.userId) return;
      
      await logActivity({
        action: `token_${action}`,
        entity_type: "token",
        entity_id: details.tokenAddress || "unknown",
        details: {
          ...details,
          user_id: this.userId,
          user_email: this.userEmail
        },
        status: details.status || "success",
      });
    } catch (error) {
      console.error("Failed to log token action:", error);
    }
  }
}

// Create and export a singleton instance
export const tokenManager = new TokenManager();
