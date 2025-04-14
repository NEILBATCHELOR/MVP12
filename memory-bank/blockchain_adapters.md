# Blockchain Adapters

## Overview

The blockchain adapter system provides a uniform interface for interacting with different blockchain networks. Each blockchain has a specific adapter implementation that conforms to the `BlockchainAdapter` interface, allowing applications to use a consistent API regardless of the underlying blockchain.

## Adapter Interface

The `BlockchainAdapter` interface defines the standard operations that all blockchain adapters must implement:

```typescript
interface BlockchainAdapter {
  // Chain information
  getChainName?(): string;
  getChainId?(): number;
  
  // Address operations
  generateAddress(publicKey: string): Promise<string>;
  isValidAddress(address: string): boolean;
  
  // Balance operations
  getBalance(address: string): Promise<string>;
  getTokenBalance(address: string, tokenAddress: string): Promise<string>;
  
  // Transaction operations
  getTransaction(txHash: string): Promise<any>;
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;
  getTransactionCount(address: string): Promise<number>;
  
  // Fee calculations
  estimateGas(txData: any): Promise<string>;
  getGasPrice(): Promise<string>;
  
  // Provider operations
  getProvider(): any;
  setProvider(provider: any): void;
}
```

## Supported Blockchains

### EVM-Compatible Chains

The following EVM-compatible chains share similar adapter implementations with chain-specific configurations:

1. **Ethereum**: The primary implementation used as a base for other EVM chains
2. **Polygon**: Layer 2 scaling solution with EVM compatibility
3. **Avalanche**: High-throughput EVM-compatible chain
4. **Optimism**: Optimistic rollup layer 2 solution
5. **Arbitrum**: Another optimistic rollup layer 2 solution
6. **Base**: Coinbase's EVM-compatible layer 2
7. **zkSync Era**: Zero-knowledge rollup with EVM compatibility
8. **Mantle**: Layer 2 solution with EVM compatibility
9. **Hedera**: Hashgraph-based network with EVM compatibility

### Non-EVM Chains

These chains have completely different architectures and require unique implementations:

1. **Bitcoin (BTC)**: The original cryptocurrency blockchain
2. **Ripple (XRP)**: Specialized for fast payment settlement
3. **Solana (SOL)**: High-performance blockchain with a unique architecture
4. **Aptos**: Move-based blockchain created by former Facebook/Diem engineers
5. **Sui**: Another Move-based blockchain focused on high throughput
6. **Stellar (XLM)**: Payment-focused blockchain with built-in DEX functionality
7. **NEAR Protocol**: Developer-friendly blockchain with sharding technology

## Implementation Details

### EthereumAdapter

The EthereumAdapter serves as the base implementation for all EVM-compatible chains:

```typescript
class EthereumAdapter implements BlockchainAdapter {
  protected provider: ethers.providers.Provider;
  protected network: string;
  protected chainId: number;
  
  constructor(provider: ethers.providers.Provider, network = 'mainnet') {
    this.provider = provider;
    this.network = network;
    // Chain ID will be set based on network or retrieved from provider
  }
  
  // Implementation of all BlockchainAdapter methods using ethers.js
}
```

### SolanaAdapter

The SolanaAdapter implements the BlockchainAdapter interface for Solana:

```typescript
class SolanaAdapter implements BlockchainAdapter {
  protected connection: web3.Connection;
  protected network: string;
  
  constructor(endpoint: string, network = 'mainnet-beta') {
    this.connection = new web3.Connection(endpoint);
    this.network = network;
  }
  
  // Implementation of all BlockchainAdapter methods using @solana/web3.js
}
```

### RippleAdapter

The RippleAdapter implements the BlockchainAdapter interface for XRP Ledger:

```typescript
class RippleAdapter implements BlockchainAdapter {
  protected client: RippleAPI;
  protected network: string;
  
  constructor(server: string, network = 'mainnet') {
    this.client = new RippleAPI({ server });
    this.network = network;
  }
  
  // Implementation of all BlockchainAdapter methods using ripple-lib
}
```

### NEARAdapter

The NEARAdapter implements the BlockchainAdapter interface for NEAR Protocol:

```typescript
class NEARAdapter implements BlockchainAdapter {
  protected near: Near;
  protected network: string;
  
  constructor(config: NearConfig, network = 'mainnet') {
    this.near = new Near(config);
    this.network = network;
  }
  
  // Implementation of all BlockchainAdapter methods using near-api-js
}
```

## BlockchainFactory

The BlockchainFactory creates and manages blockchain adapters:

```typescript
class BlockchainFactory {
  private static instance: BlockchainFactory;
  private adapters: Map<string, any> = new Map();
  
  private constructor() {
    // Register default adapters
    this.registerAdapter('ethereum', EthereumAdapter);
    this.registerAdapter('polygon', PolygonAdapter);
    this.registerAdapter('solana', SolanaAdapter);
    this.registerAdapter('ripple', RippleAdapter);
    this.registerAdapter('near', NEARAdapter);
    // Register other adapters...
  }
  
  static getInstance(): BlockchainFactory {
    if (!BlockchainFactory.instance) {
      BlockchainFactory.instance = new BlockchainFactory();
    }
    return BlockchainFactory.instance;
  }
  
  registerAdapter(blockchain: string, adapter: any): void {
    this.adapters.set(blockchain.toLowerCase(), adapter);
  }
  
  getAdapter(blockchain: string, config?: any): BlockchainAdapter {
    const AdapterClass = this.adapters.get(blockchain.toLowerCase());
    
    if (!AdapterClass) {
      throw new Error(`No adapter registered for blockchain: ${blockchain}`);
    }
    
    return new AdapterClass(config);
  }
  
  getSupportedBlockchains(): string[] {
    return Array.from(this.adapters.keys());
  }
}
```

## Usage Examples

### Getting an Adapter

```typescript
// Get the BlockchainFactory singleton
const factory = BlockchainFactory.getInstance();

// Get an Ethereum adapter with a provider
const ethProvider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_API_KEY');
const ethAdapter = factory.getAdapter('ethereum', ethProvider);

// Get a Solana adapter with an endpoint
const solanaEndpoint = 'https://api.mainnet-beta.solana.com';
const solanaAdapter = factory.getAdapter('solana', solanaEndpoint);
```

### Address Operations

```typescript
// Check if an address is valid
const isValidEth = ethAdapter.isValidAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
const isValidSol = solanaAdapter.isValidAddress('9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP');

// Generate an address from a public key
const ethAddress = await ethAdapter.generateAddress(ethPublicKey);
const solAddress = await solanaAdapter.generateAddress(solPublicKey);
```

### Balance Operations

```typescript
// Get native token balance
const ethBalance = await ethAdapter.getBalance('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
const solBalance = await solanaAdapter.getBalance('9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP');

// Get token balance
const usdcEthBalance = await ethAdapter.getTokenBalance(
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC on Ethereum
);

const usdcSolBalance = await solanaAdapter.getTokenBalance(
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC on Solana
);
```

### Transaction Operations

```typescript
// Get transaction details
const ethTx = await ethAdapter.getTransaction('0x123...');
const solTx = await solanaAdapter.getTransaction('abc...');

// Get transaction status
const ethTxStatus = await ethAdapter.getTransactionStatus('0x123...');
const solTxStatus = await solanaAdapter.getTransactionStatus('abc...');

// Get transaction count (nonce)
const ethNonce = await ethAdapter.getTransactionCount('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
```

### Fee Estimations

```typescript
// Estimate gas for a transaction
const ethGas = await ethAdapter.estimateGas({
  from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  to: '0x1234567890123456789012345678901234567890',
  value: ethers.utils.parseEther('0.1')
});

// Get current gas price
const ethGasPrice = await ethAdapter.getGasPrice();
```

## Adding a New Blockchain Adapter

To add support for a new blockchain:

1. **Implement the adapter interface**:
   ```typescript
   class NewChainAdapter implements BlockchainAdapter {
     // Implementation of all required methods
   }
   ```

2. **Register the adapter with the factory**:
   ```typescript
   const factory = BlockchainFactory.getInstance();
   factory.registerAdapter('newchain', NewChainAdapter);
   ```

3. **Update any blockchain-specific types or utilities**:
   ```typescript
   // Add blockchain identifiers
   enum BlockchainType {
     // Existing types...
     NEWCHAIN = 'newchain'
   }
   
   // Update utility functions
   function isEVMCompatible(blockchain: string): boolean {
     return [
       // Existing EVM chains...
       BlockchainType.NEWCHAIN
     ].includes(blockchain as BlockchainType);
   }
   ```

4. **Create a transaction builder for the new chain**:
   ```typescript
   class NewChainTransactionBuilder extends BaseTransactionBuilder {
     // Implementation of all required methods
   }
   
   // Register with the transaction builder factory
   const builderFactory = TransactionBuilderFactory.getInstance();
   builderFactory.registerBuilder('newchain', NewChainTransactionBuilder);
   ```