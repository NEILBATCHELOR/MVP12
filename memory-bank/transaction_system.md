# Transaction System Documentation

## Overview

The transaction system provides a unified interface for creating, signing, sending, and monitoring transactions across multiple blockchain networks. It consists of several key components designed to abstract away blockchain-specific details while providing powerful, type-safe transaction capabilities.

## Core Components

### 1. Transaction Builder Interface

The `TransactionBuilder` interface defines the standard operations for all blockchain-specific transaction builders:

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
  cancelTransaction?(hash: string, privateKey: string): Promise<string>;
  speedUpTransaction?(hash: string, privateKey: string, priorityLevel: TransactionPriority): Promise<string>;
}
```

### 2. BaseTransactionBuilder

The `BaseTransactionBuilder` abstract class implements common functionality for all transaction builders:

```typescript
abstract class BaseTransactionBuilder implements TransactionBuilder {
  protected provider: ethers.providers.Provider;
  protected blockchain: string;
  
  constructor(provider: ethers.providers.Provider, blockchain: string) {
    this.provider = provider;
    this.blockchain = blockchain;
  }
  
  abstract buildTransaction(...): Promise<Transaction>;
  abstract simulateTransaction(...): Promise<TransactionSimulationResult>;
  abstract estimateFee(...): Promise<TransactionFeeEstimate>;
  abstract signTransaction(...): Promise<SignedTransaction>;
  abstract sendTransaction(...): Promise<string>;
  abstract getTransaction(...): Promise<Transaction>;
  abstract getTransactionReceipt(...): Promise<TransactionReceipt>;
  abstract getTransactionStatus(...): Promise<TransactionStatus>;
  abstract waitForTransaction(...): Promise<TransactionReceipt>;
  
  async cancelTransaction(...): Promise<string> { /* Default implementation */ }
  async speedUpTransaction(...): Promise<string> { /* Default implementation */ }
  protected increaseFeeForCancel(...): string { /* Utility method */ }
  protected increaseFeeForSpeedup(...): string { /* Utility method */ }
  protected isEVMCompatible(): boolean { /* Helper method */ }
}
```

### 3. Blockchain-Specific Transaction Builders

Each supported blockchain has its own transaction builder implementation:

#### EthereumTransactionBuilder

Handles transactions for Ethereum and other EVM-compatible chains:
- Transaction creation using ethers.js
- Gas estimation with EIP-1559 support
- Multiple fee strategies (legacy, EIP-1559)
- Transaction cancellation and speed-up

#### SolanaTransactionBuilder

Handles Solana-specific transactions:
- Transaction creation using @solana/web3.js
- Lamport conversion for values
- Fee estimation based on Solana fee structure
- Signature handling with bs58 encoding

#### RippleTransactionBuilder

Handles XRP transactions:
- XRP-specific transaction formatting
- Fee calculation according to XRP ledger rules
- Transaction submission to XRP servers

#### NEARTransactionBuilder

Handles NEAR Protocol transactions:
- NEAR-specific transaction building
- Gas calculation for NEAR transactions
- Account ID validation and handling

### 4. TransactionBuilderFactory

The factory for creating appropriate transaction builders:

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

### 5. Transaction Monitor

Tracks the status of transactions and provides updates:

```typescript
class TransactionMonitor {
  // Properties for tracking transactions and their status
  
  static getInstance(blockchain: Blockchain, provider: any): TransactionMonitor { /* ... */ }
  configure(config: Partial<MonitoringConfig>): void { /* ... */ }
  monitorTransaction(transaction: Transaction, listener?: TransactionListener): void { /* ... */ }
  stopMonitoring(transactionId: string): void { /* ... */ }
  addListener(transactionId: string, listener: TransactionListener): void { /* ... */ }
  removeListener(transactionId: string, listener: TransactionListener): void { /* ... */ }
  // Additional methods...
}
```

## Data Structures

### Transaction

Represents a blockchain transaction:

```typescript
interface Transaction {
  id: string;
  hash?: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  status: TransactionStatus;
  timestamp: number;
  blockNumber?: number;
  blockHash?: string;
  networkFee?: string;
  gasUsed?: string;
  gasPrice?: string;
  nonce?: number;
  blockchain: string;
  chainId: number;
  type?: string;
  simulationResult?: TransactionSimulationResult;
}
```

### SignedTransaction

Extends the Transaction interface with signatures:

```typescript
interface SignedTransaction extends Transaction {
  signatures: TransactionSignature[];
}
```

### TransactionReceipt

Represents the receipt of a confirmed transaction:

```typescript
interface TransactionReceipt {
  hash: string;
  blockNumber: number;
  blockHash: string;
  status: boolean;
  gasUsed: string;
  logs: any[];
  events?: any[];
  from: string;
  to: string;
  contractAddress?: string;
}
```

### TransactionFeeEstimate

Provides fee estimates at different priority levels:

```typescript
interface TransactionFeeEstimate {
  low: {
    fee: string;
    time: number; // estimated confirmation time in seconds
  };
  medium: {
    fee: string;
    time: number;
  };
  high: {
    fee: string;
    time: number;
  };
  baseFee?: string;
  priorityFee?: string;
  maxFee?: string;
  gasPrice?: string;
  gasLimit: string;
}
```

## Transaction Lifecycle

1. **Building**: Create a transaction object with source, destination, and amount
2. **Simulation**: Test the transaction to identify potential errors
3. **Fee Estimation**: Calculate appropriate fees based on network conditions
4. **Signing**: Cryptographically sign the transaction with a private key
5. **Submission**: Send the signed transaction to the blockchain network
6. **Monitoring**: Track the transaction until it is confirmed or fails
7. **Receipt Retrieval**: Get the final transaction receipt with confirmation details

## Error Handling

The transaction system includes robust error handling:
- Transaction simulation catches potential errors before submission
- Well-defined error types for different failure scenarios
- Transaction monitoring with automatic retries for transient failures
- Detailed error information propagation to the application

## Usage Examples

### Basic Transaction Flow

```typescript
// Create a transaction builder for the desired blockchain
const builder = TransactionBuilderFactory.getInstance().createBuilder('ethereum', provider);

// Build a transaction
const transaction = await builder.buildTransaction(
  '0xsenderAddress',
  '0xrecipientAddress',
  '0.1', // ETH amount
  '0x' // Empty data for a simple transfer
);

// Estimate fees
const feeEstimate = await builder.estimateFee(transaction);
console.log(`Estimated fee: ${feeEstimate.medium.fee} ETH`);

// Sign the transaction
const signedTransaction = await builder.signTransaction(transaction, privateKey);

// Send the transaction
const txHash = await builder.sendTransaction(signedTransaction);
console.log(`Transaction submitted: ${txHash}`);

// Wait for confirmation
const receipt = await builder.waitForTransaction(txHash, 2); // Wait for 2 confirmations
console.log(`Transaction ${receipt.status ? 'succeeded' : 'failed'}`);
```

### Transaction Monitoring

```typescript
// Create a transaction listener
const listener: TransactionListener = {
  onStatusChange: (tx, oldStatus, newStatus) => {
    console.log(`Transaction ${tx.hash} status changed from ${oldStatus} to ${newStatus}`);
  },
  onConfirmation: (tx, confirmations) => {
    console.log(`Transaction ${tx.hash} has ${confirmations} confirmations`);
  },
  onSuccess: (tx, receipt) => {
    console.log(`Transaction ${tx.hash} succeeded!`);
  },
  onFailure: (tx, receipt, error) => {
    console.error(`Transaction ${tx.hash} failed: ${error?.message || 'Unknown error'}`);
  },
  onError: (tx, error) => {
    console.error(`Error monitoring transaction ${tx.hash}: ${error.message}`);
  }
};

// Monitor a transaction
const monitor = TransactionMonitor.getInstance('ethereum', provider);
monitor.monitorTransaction(transaction, listener);

// Later, stop monitoring
monitor.stopMonitoring(transaction.id);
```