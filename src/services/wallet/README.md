# Wallet Services

## Multi-Chain Wallet Support

The application supports multiple blockchain networks, providing wallet generation, transaction handling, and address validation for each supported blockchain:

### Supported Blockchains

- **EVM-Compatible Chains**:
  - Ethereum
  - Polygon
  - Avalanche
  - Optimism
  - Base
  - zkSync Era
  - Arbitrum
  - Mantle
  - Hedera

- **Non-EVM Chains**:
  - Bitcoin (BTC)
  - Ripple (XRP)
  - Solana (SOL)
  - Aptos
  - Sui
  - Stellar (XLM)
  - NEAR

### Wallet Generator Usage

```typescript
import { WalletGeneratorFactory } from '@/services/wallet/generators/WalletGeneratorFactory';

// Get the appropriate wallet generator for a blockchain
const generator = WalletGeneratorFactory.getGenerator('ethereum');

// Generate a wallet
const wallet = await generator.generateWallet();

// Validate an address
const isValid = generator.validateAddress('0x123...');
```

### Transaction Handler Usage

```typescript
import { TransactionHandlerRegistry } from '@/lib/web3/transactions/TransactionHandlerRegistry';

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

// Wait for confirmation
const status = await result.wait();
```

## WebSocket Connection Configuration

The application uses WebSockets to receive real-time wallet addresses from a service.

### Configuration

The WebSocket URL is configured using environment variables:

1. Create an `.env.local` file in the project root with:

```
VITE_WALLET_WS_URL=wss://your-actual-wallet-service.com/ws
```

2. For development without an actual WebSocket server, the application will use a fallback URL (`ws://localhost:8080/ws`) and suppress connection errors.

### Development Mode

When using development URLs (localhost, 127.0.0.1 or example.com), the WebSocket connection errors are suppressed in the console to avoid unnecessary error messages.

### WalletAddressReceiver Usage

```typescript
import { useWalletAddressReceiver } from '@/services/wallet/WalletAddressReceiver';

// In your component
const { addresses, isConnected, error, reconnect, clearAddresses } = useWalletAddressReceiver('wss://your-wallet-service.com/ws');

// Or use the WalletContext which manages the WebSocket connection
import { useWallet } from '@/context/WalletContext';

const { receivedAddresses, wsConnected, reconnectWebSocket } = useWallet();
```

### Troubleshooting

If you see WebSocket connection errors in your console:

1. Check if the `VITE_WALLET_WS_URL` environment variable is set correctly
2. Ensure your WebSocket server is running and accessible
3. For development without a WebSocket server, you can ignore these errors as they are expected