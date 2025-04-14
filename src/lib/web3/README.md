# Web3 Integration

This module provides integrated blockchain support for multiple networks, with a focus on consistent interfaces and chain-specific implementations.

## Architecture

The web3 integration follows a layered architecture:

1. **Adapters**: Chain-specific implementations of the `BlockchainAdapter` interface
2. **Factory**: The `BlockchainFactory` for creating and retrieving blockchain adapters
3. **Transactions**: Chain-specific transaction handlers and a unified transaction interface
4. **Crypto Utils**: Common cryptographic utilities and blockchain configuration

## Supported Blockchains

### EVM-Compatible Chains
- Ethereum
- Polygon
- Avalanche
- Optimism
- Base
- zkSync Era
- Arbitrum
- Mantle
- Hedera

### Non-EVM Chains
- Bitcoin (BTC)
- Ripple (XRP)
- Solana (SOL)
- Aptos
- Sui
- Stellar (XLM)
- NEAR Protocol

## Blockchain Adapter Usage

The `BlockchainAdapter` interface provides common blockchain operations:

```typescript
import { BlockchainFactory } from '@/lib/web3/BlockchainFactory';

// Get the adapter for the desired blockchain
const ethAdapter = BlockchainFactory.getAdapter('ethereum');
const solAdapter = BlockchainFactory.getAdapter('solana');

// Get chain information
const chainName = ethAdapter.getChainName?.();
const chainId = ethAdapter.getChainId?.();

// Generate address from public key
const address = await ethAdapter.generateAddress(publicKey);

// Validate an address
const isValid = ethAdapter.isValidAddress('0x123...');

// Get balance
const balance = await ethAdapter.getBalance('0x123...');

// Get token balance
const tokenBalance = await ethAdapter.getTokenBalance('0x123...', '0xtoken...');
```

## Transaction Handling

The transaction system provides chain-specific transaction handling:

```typescript
import { TransactionHandlerRegistry } from '@/lib/web3/transactions/TransactionHandlerRegistry';

// Get the handler for the desired blockchain
const handler = TransactionHandlerRegistry.getHandler('ethereum');

// Build a transaction
const tx = await handler.buildTransferTransaction(
  fromAddress,
  toAddress,
  '0.1' // Amount in the native currency
);

// Estimate the fee
const fee = await handler.estimateFee(tx);

// Sign the transaction
const signedTx = await handler.signTransaction(tx, privateKey);

// Send the transaction
const result = await handler.sendSignedTransaction(signedTx);

// Wait for confirmation
const status = await result.wait();

// Or check status later
const currentStatus = await handler.getTransactionStatus(result.hash);
```

## Adding Support for New Blockchains

To add support for a new blockchain:

1. **Add crypto configuration**: Update `CryptoUtils.ts` with the new blockchain's cryptographic properties
2. **Create an adapter**: Implement the `BlockchainAdapter` interface for the new blockchain
3. **Create a transaction handler**: Implement the `TransactionHandler` interface for the new blockchain
4. **Register the adapter**: Update the `BlockchainFactory` to create and return the new adapter
5. **Register the handler**: Update the `TransactionHandlerRegistry` to create and return the new handler
6. **Create a wallet generator**: Implement the `WalletGenerator` interface for the new blockchain
7. **Register the generator**: Update the `WalletGeneratorFactory` to create and return the new generator

## Implementation Notes

- The current implementation includes placeholder code for some blockchains, which would need to be replaced with actual implementations using the appropriate SDKs
- For EVM-compatible chains, the implementation is more complete as it leverages ethers.js
- For non-EVM chains, additional dependencies would be required for full implementations