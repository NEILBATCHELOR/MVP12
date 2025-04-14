import { TransactionHandler } from "./TransactionHandler";
import { EVMTransactionHandler } from "./handlers/EVMTransactionHandler";
import { BitcoinTransactionHandler } from "./handlers/BitcoinTransactionHandler";
import { SolanaTransactionHandler } from "./handlers/SolanaTransactionHandler";

/**
 * Registry for transaction handlers
 * This class maintains and provides access to blockchain-specific transaction handlers
 */
export class TransactionHandlerRegistry {
  private static handlers: Record<string, TransactionHandler> = {};

  /**
   * Get a transaction handler for a blockchain
   * @param blockchain The blockchain to get a handler for
   * @returns The transaction handler
   */
  static getHandler(blockchain: string): TransactionHandler {
    const normalizedChain = blockchain.toLowerCase();
    
    if (!this.handlers[normalizedChain]) {
      this.handlers[normalizedChain] = this.createHandler(normalizedChain);
    }
    
    return this.handlers[normalizedChain];
  }

  /**
   * Create a transaction handler for a blockchain
   * @param blockchain The blockchain to create a handler for
   * @returns The created transaction handler
   */
  private static createHandler(blockchain: string): TransactionHandler {
    switch (blockchain) {
      // EVM-compatible chains
      case "ethereum":
        return new EVMTransactionHandler(
          import.meta.env.VITE_ETHEREUM_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
          "ethereum",
          11155111 // Sepolia testnet
        );
      
      case "polygon":
        return new EVMTransactionHandler(
          import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/demo",
          "polygon",
          80001 // Mumbai testnet
        );
      
      case "avalanche":
        return new EVMTransactionHandler(
          import.meta.env.VITE_AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
          "avalanche",
          43113 // Fuji testnet
        );
      
      case "optimism":
        return new EVMTransactionHandler(
          import.meta.env.VITE_OPTIMISM_RPC_URL || "https://goerli.optimism.io",
          "optimism",
          420 // Optimism Goerli testnet
        );
      
      case "base":
        return new EVMTransactionHandler(
          import.meta.env.VITE_BASE_RPC_URL || "https://goerli.base.org",
          "base",
          84531 // Base Goerli testnet
        );
      
      case "zksync":
      case "zksyncera":
        return new EVMTransactionHandler(
          import.meta.env.VITE_ZKSYNC_RPC_URL || "https://testnet.era.zksync.dev",
          "zksync",
          280 // zkSync Era testnet
        );
      
      case "arbitrum":
        return new EVMTransactionHandler(
          import.meta.env.VITE_ARBITRUM_RPC_URL || "https://goerli-rollup.arbitrum.io/rpc",
          "arbitrum",
          421613 // Arbitrum Goerli testnet
        );
      
      case "mantle":
        return new EVMTransactionHandler(
          import.meta.env.VITE_MANTLE_RPC_URL || "https://rpc.testnet.mantle.xyz",
          "mantle",
          5001 // Mantle testnet
        );
      
      case "hedera":
        return new EVMTransactionHandler(
          import.meta.env.VITE_HEDERA_RPC_URL || "https://testnet.hashio.io/api",
          "hedera",
          296 // Hedera testnet
        );
      
      // Non-EVM chains
      case "bitcoin":
      case "btc":
        return new BitcoinTransactionHandler(
          import.meta.env.VITE_BITCOIN_RPC_URL || "http://localhost:18443",
          "testnet"
        );
      
      case "solana":
      case "sol":
        return new SolanaTransactionHandler(
          import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com",
          "devnet"
        );
      
      // Other blockchains would be added here
      // For now, we'll throw errors for unsupported chains
      case "ripple":
      case "xrp":
        throw new Error("Ripple transaction handler not implemented yet");
      
      case "aptos":
        throw new Error("Aptos transaction handler not implemented yet");
      
      case "sui":
        throw new Error("Sui transaction handler not implemented yet");
      
      case "stellar":
      case "xlm":
        throw new Error("Stellar transaction handler not implemented yet");
      
      case "near":
        throw new Error("NEAR transaction handler not implemented yet");
      
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  /**
   * Get the list of supported blockchains
   * @returns The list of supported blockchains
   */
  static getSupportedBlockchains(): string[] {
    return [
      "ethereum",
      "polygon",
      "avalanche",
      "optimism",
      "base",
      "zksync",
      "arbitrum",
      "mantle",
      "hedera",
      "bitcoin",
      "solana"
      // Add other supported blockchains as they are implemented
    ];
  }

  /**
   * Check if a blockchain is supported
   * @param blockchain The blockchain to check
   * @returns Whether the blockchain is supported
   */
  static isSupported(blockchain: string): boolean {
    const normalizedChain = blockchain.toLowerCase();
    return this.getSupportedBlockchains().includes(normalizedChain);
  }
}