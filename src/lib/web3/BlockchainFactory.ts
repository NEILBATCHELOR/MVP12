import { ethers } from "ethers";
import {
  CurveType,
  SigningAlgorithm,
  blockchainCryptoConfig,
} from "./CryptoUtils";

// Import all blockchain adapters
import { EVMAdapter } from "./adapters/EVMAdapter";
import { SolanaAdapter } from "./adapters/SolanaAdapter";
import { BitcoinAdapter } from "./adapters/BitcoinAdapter";
import { RippleAdapter } from "./adapters/RippleAdapter";
import { AptosAdapter } from "./adapters/AptosAdapter";
import { SuiAdapter } from "./adapters/SuiAdapter";
import { StellarAdapter } from "./adapters/StellarAdapter";
import { NEARAdapter } from "./adapters/NEARAdapter";

// Interface for blockchain-specific implementations
export interface BlockchainAdapter {
  getChainName?(): string;
  getChainId?(): number;
  generateAddress(publicKey: string): Promise<string>;
  createMultiSigWallet(owners: string[], threshold: number): Promise<string>;
  getBalance(address: string): Promise<string>;
  getTokenBalance(address: string, tokenAddress: string): Promise<string>;
  proposeTransaction(
    walletAddress: string,
    to: string,
    value: string,
    data?: string,
  ): Promise<string>;
  signTransaction(transactionHash: string, privateKey: string): Promise<string>;
  executeTransaction(
    walletAddress: string,
    transactionHash: string,
    signatures: string[],
  ): Promise<string>;
  isValidAddress(address: string): boolean;
}

// Factory to create blockchain-specific adapters
export class BlockchainFactory {
  private static adapters: Record<string, BlockchainAdapter> = {};

  static getAdapter(blockchain: string): BlockchainAdapter {
    if (!this.adapters[blockchain]) {
      this.adapters[blockchain] = this.createAdapter(blockchain);
    }
    return this.adapters[blockchain];
  }

  private static createAdapter(blockchain: string): BlockchainAdapter {
    const config = blockchainCryptoConfig[blockchain];
    if (!config) {
      throw new Error(`Unsupported blockchain: ${blockchain}`);
    }

    if (
      config.curve === CurveType.SECP256K1 &&
      config.algorithm === SigningAlgorithm.ECDSA
    ) {
      // For EVM chains
      let rpcUrl: string;
      let chainId: number;
      let factoryAddress: string;

      switch (blockchain) {
        case "ethereum":
          rpcUrl =
            import.meta.env.VITE_ETHEREUM_RPC_URL ||
            "https://eth-sepolia.g.alchemy.com/v2/demo";
          chainId = 11155111; // Sepolia testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "ethereum", factoryAddress);

        case "polygon":
          rpcUrl =
            import.meta.env.VITE_POLYGON_RPC_URL ||
            "https://polygon-mumbai.g.alchemy.com/v2/demo";
          chainId = 80001; // Mumbai testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "polygon", factoryAddress);

        case "avalanche":
          rpcUrl =
            import.meta.env.VITE_AVALANCHE_RPC_URL ||
            "https://api.avax-test.network/ext/bc/C/rpc";
          chainId = 43113; // Fuji testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "avalanche", factoryAddress);

        case "optimism":
          rpcUrl =
            import.meta.env.VITE_OPTIMISM_RPC_URL ||
            "https://goerli.optimism.io";
          chainId = 420; // Optimism Goerli testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "optimism", factoryAddress);

        case "base":
          rpcUrl =
            import.meta.env.VITE_BASE_RPC_URL || "https://goerli.base.org";
          chainId = 84531; // Base Goerli testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "base", factoryAddress);

        case "zksync":
          rpcUrl =
            import.meta.env.VITE_ZKSYNC_RPC_URL ||
            "https://testnet.era.zksync.dev";
          chainId = 280; // zkSync Era testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "zksync", factoryAddress);

        case "arbitrum":
          rpcUrl =
            import.meta.env.VITE_ARBITRUM_RPC_URL ||
            "https://goerli-rollup.arbitrum.io/rpc";
          chainId = 421613; // Arbitrum Goerli testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "arbitrum", factoryAddress);

        case "mantle":
          rpcUrl =
            import.meta.env.VITE_MANTLE_RPC_URL ||
            "https://rpc.testnet.mantle.xyz";
          chainId = 5001; // Mantle testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "mantle", factoryAddress);

        case "hedera":
          rpcUrl =
            import.meta.env.VITE_HEDERA_RPC_URL ||
            "https://testnet.hashio.io/api";
          chainId = 296; // Hedera testnet
          factoryAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
          return new EVMAdapter(rpcUrl, chainId, "hedera", factoryAddress);

        case "bitcoin":
          // Note: While Bitcoin uses SECP256K1, it's not an EVM chain
          // We'll return a custom adapter for Bitcoin
          const btcRpcUrl = import.meta.env.VITE_BITCOIN_RPC_URL || "http://localhost:18443";
          return new BitcoinAdapter(btcRpcUrl, "testnet");

        case "ripple":
          const xrpRpcUrl = import.meta.env.VITE_RIPPLE_RPC_URL || "https://s.devnet.rippletest.net:51234/";
          return new RippleAdapter(xrpRpcUrl, "testnet");

        default:
          throw new Error(`Unsupported EVM chain: ${blockchain}`);
      }
    } else if (
      config.curve === CurveType.ED25519 &&
      config.algorithm === SigningAlgorithm.EDDSA
    ) {
      // For non-EVM chains like Solana, Aptos, etc.
      switch (blockchain) {
        case "solana":
          const solanaRpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com";
          return new SolanaAdapter(solanaRpcUrl, "devnet");

        case "aptos":
          const aptosRpcUrl = import.meta.env.VITE_APTOS_RPC_URL || "https://fullnode.devnet.aptoslabs.com/v1";
          return new AptosAdapter(aptosRpcUrl, "devnet");

        case "sui":
          const suiRpcUrl = import.meta.env.VITE_SUI_RPC_URL || "https://fullnode.devnet.sui.io:443";
          return new SuiAdapter(suiRpcUrl, "devnet");

        case "stellar":
          const stellarHorizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
          return new StellarAdapter(stellarHorizonUrl, "testnet");

        case "near":
          const nearRpcUrl = import.meta.env.VITE_NEAR_RPC_URL || "https://rpc.testnet.near.org";
          return new NEARAdapter(nearRpcUrl, "testnet");

        default:
          throw new Error(`Adapter for ${blockchain} not yet implemented`);
      }
    }

    throw new Error(
      `Unsupported curve/algorithm combination for ${blockchain}`,
    );
  }

  // Get the list of all supported blockchains
  static getSupportedBlockchains(): string[] {
    return Object.keys(blockchainCryptoConfig);
  }
  
  // Get EVM-compatible chains
  static getEVMChains(): string[] {
    return Object.entries(blockchainCryptoConfig)
      .filter(([_, config]) => 
        config.curve === CurveType.SECP256K1 && 
        config.algorithm === SigningAlgorithm.ECDSA)
      .map(([chain, _]) => chain)
      .filter(chain => chain !== "bitcoin" && chain !== "ripple");
  }
  
  // Get non-EVM chains
  static getNonEVMChains(): string[] {
    return Object.entries(blockchainCryptoConfig)
      .filter(([_, config]) => 
        !(config.curve === CurveType.SECP256K1 && 
          config.algorithm === SigningAlgorithm.ECDSA) ||
        ["bitcoin", "ripple"].includes(_))
      .map(([chain, _]) => chain);
  }
}
