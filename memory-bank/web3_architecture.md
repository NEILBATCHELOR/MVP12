# Web3 Architecture

## Overview

The Web3 Integration Framework provides a unified interface for interacting with multiple blockchain networks through a layered, adapter-based architecture. This document details the key architectural components and their relationships.

## Core Architecture Components

### 1. Blockchain Adapters

Blockchain adapters implement a common interface (`BlockchainAdapter`) to provide standardized access to different blockchain networks:

```typescript
interface BlockchainAdapter {
  getChainName?(): string;
  getChainId?(): number;
  generateAddress(publicKey: string): Promise<string>;
  isValidAddress(address: string): boolean;
  getBalance(address: string): Promise<string>;
  getTokenBalance(address: string, tokenAddress: string): Promise<string>;
  // Additional methods...
}
```

These adapters handle the translation between the unified API and blockchain-specific implementations, abstracting away the complexities of each blockchain network.

### 2. Factory Pattern

The `BlockchainFactory` creates and manages blockchain adapters:

```typescript
// Factory implementation
class BlockchainFactory {
  private static instance: BlockchainFactory;
  private adapters: Map<string, any> = new Map();
  
  static getInstance(): BlockchainFactory { /* ... */ }
  registerAdapter(blockchain: string, adapter: any): void { /* ... */ }
  getAdapter(blockchain: string): BlockchainAdapter { /* ... */ }
}
```

This factory pattern allows for centralized creation and management of adapters while enabling easy extension to support new blockchains.

### 3. Transaction System

#### Transaction Builders

Each blockchain has a specific transaction builder that implements the `TransactionBuilder` interface:

```typescript
interface TransactionBuilder {
  buildTransaction(from: string, to: string, value: string, data?: string, options?: any): Promise<Transaction>;
  simulateTransaction(transaction: Transaction): Promise<TransactionSimulationResult>;
  estimateFee(transaction: Transaction): Promise<TransactionFeeEstimate>;
  signTransaction(transaction: Transaction, privateKey: string): Promise<SignedTransaction>;
  sendTransaction(transaction: SignedTransaction): Promise<string>;
  getTransaction(hash: string): Promise<Transaction>;
  getTransactionReceipt(hash: string): Promise<TransactionReceipt>;
  getTransactionStatus(hash: string): Promise<TransactionStatus>;
  waitForTransaction(hash: string, confirmations?: number): Promise<TransactionReceipt>;
  // Optional methods
  cancelTransaction?(hash: string, privateKey: string): Promise<string>;
  speedUpTransaction?(hash: string, privateKey: string, priorityLevel: TransactionPriority): Promise<string>;
}
```

Specific implementations include:
- `EthereumTransactionBuilder`
- `SolanaTransactionBuilder`
- `RippleTransactionBuilder`
- `NEARTransactionBuilder`

#### Transaction Builder Factory

The `TransactionBuilderFactory` creates appropriate transaction builders for each blockchain:

```typescript
class TransactionBuilderFactory {
  private static instance: TransactionBuilderFactory;
  private builders: Map<string, any> = new Map();
  
  static getInstance(): TransactionBuilderFactory { /* ... */ }
  registerBuilder(blockchain: string, builder: any): void { /* ... */ }
  createBuilder(blockchain: string, provider: any): BaseTransactionBuilder { /* ... */ }
  getSupportedBlockchains(): string[] { /* ... */ }
  static getEVMBlockchains(): string[] { /* ... */ }
  static getNonEVMBlockchains(): string[] { /* ... */ }
}
```

#### Transaction Monitor

The `TransactionMonitor` tracks transaction status:

```typescript
class TransactionMonitor {
  private transactionBuilder: BaseTransactionBuilder;
  private static instance: TransactionMonitor;
  private transactions: Map<string, Transaction>;
  private lastKnownStatus: Map<string, TransactionStatus>;
  private confirmations: Map<string, number>;
  private pollingIntervals: Map<string, NodeJS.Timeout>;
  private listeners: Map<string, TransactionListener[]>;
  
  static getInstance(blockchain: Blockchain, provider: any): TransactionMonitor { /* ... */ }
  configure(config: Partial<MonitoringConfig>): void { /* ... */ }
  monitorTransaction(transaction: Transaction, listener?: TransactionListener): void { /* ... */ }
  stopMonitoring(transactionId: string): void { /* ... */ }
  addListener(transactionId: string, listener: TransactionListener): void { /* ... */ }
  removeListener(transactionId: string, listener: TransactionListener): void { /* ... */ }
  getStatus(transactionId: string): TransactionStatus | undefined { /* ... */ }
  getConfirmations(transactionId: string): number { /* ... */ }
  getAllTransactions(): Transaction[] { /* ... */ }
  // Additional methods...
}
```

## Blockchain Support

### 1. EVM-Compatible Chains

EVM-compatible chains share a common implementation with chain-specific configurations:
- Ethereum
- Polygon
- Avalanche
- Optimism
- Arbitrum
- Base
- zkSync
- Mantle

### 2. Non-EVM Chains

Each non-EVM chain has its own dedicated implementation:
- Solana: Using `@solana/web3.js`
- Ripple (XRP): Using `ripple-lib`
- NEAR Protocol: Using `near-api-js`

## Integration Points

### 1. Wallet Generation

The `WalletGeneratorFactory` provides wallet generation capabilities:

```typescript
// Get the appropriate wallet generator for a blockchain
const generator = WalletGeneratorFactory.getGenerator('ethereum');

// Generate a wallet
const wallet = await generator.generateWallet();

// Validate an address
const isValid = generator.validateAddress('0x123...');
```

### 2. Transaction Handling

The `TransactionHandlerRegistry` provides transaction capabilities:

```typescript
// Get the appropriate transaction handler for a blockchain
const handler = TransactionHandlerRegistry.getHandler('ethereum');

// Build a transaction
const tx = await handler.buildTransferTransaction(
  fromAddress,
  toAddress,
  '0.1' // Amount in the native currency
);

// Sign the transaction
const signedTx = await handler.signTransaction(tx, privateKey);

// Send the transaction
const result = await handler.sendSignedTransaction(signedTx);
```

## Data Flow

### Transaction Flow

1. Application requests a transaction through the unified API
2. The appropriate transaction builder is selected via factory
3. The transaction is built with blockchain-specific details
4. The transaction is simulated to check for potential issues
5. Fee estimation is performed based on network conditions
6. The transaction is signed with the appropriate algorithm
7. The signed transaction is submitted to the blockchain
8. The transaction monitor tracks the status until completion
9. Status updates are delivered to registered listeners

### Wallet Connection Flow

1. Application requests wallet connection through wallet manager
2. The appropriate wallet provider is selected
3. Connection request is sent to the wallet
4. Wallet responds with account information
5. The application receives notification of successful connection
6. Account information is available for blockchain operations