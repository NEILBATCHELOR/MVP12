# Wallet Management System

## Overview

The Wallet Management system provides comprehensive functionality for working with cryptocurrency wallets across multiple blockchain networks. It handles wallet creation, connection, state management, signing operations, and address validation for each supported blockchain.

## Core Components

### 1. WalletManager

The `WalletManager` is the central component for managing wallet connections and operations:

```typescript
class WalletManager {
  private static instance: WalletManager;
  private connectedWallets: Map<string, Wallet> = new Map();
  private activeWallet: Wallet | null = null;
  private listeners: WalletEventListener[] = [];
  
  static getInstance(): WalletManager { /* ... */ }
  
  async connect(walletType: WalletType, blockchain: string, options?: any): Promise<Wallet> { /* ... */ }
  disconnect(walletId: string): Promise<void> { /* ... */ }
  getWallet(walletId: string): Wallet | null { /* ... */ }
  getActiveWallet(): Wallet | null { /* ... */ }
  setActiveWallet(walletId: string): Wallet | null { /* ... */ }
  getAllWallets(): Wallet[] { /* ... */ }
  
  // Event management
  addEventListener(listener: WalletEventListener): void { /* ... */ }
  removeEventListener(listener: WalletEventListener): void { /* ... */ }
  
  // Signing operations
  signMessage(message: string, walletId?: string): Promise<string> { /* ... */ }
  signTransaction(transaction: any, walletId?: string): Promise<any> { /* ... */ }
}
```

### 2. WalletGeneratorFactory

The `WalletGeneratorFactory` creates wallet generators for different blockchains:

```typescript
class WalletGeneratorFactory {
  private static instance: WalletGeneratorFactory;
  private generators: Map<string, WalletGenerator> = new Map();
  
  static getInstance(): WalletGeneratorFactory { /* ... */ }
  registerGenerator(blockchain: string, generator: WalletGenerator): void { /* ... */ }
  getGenerator(blockchain: string): WalletGenerator { /* ... */ }
  getSupportedBlockchains(): string[] { /* ... */ }
}
```

### 3. Blockchain-Specific Wallet Generators

Each supported blockchain has its own wallet generator:

#### EthereumWalletGenerator

```typescript
class EthereumWalletGenerator implements WalletGenerator {
  generateWallet(options?: any): Promise<Wallet> { /* ... */ }
  generateMnemonic(wordCount?: number): string { /* ... */ }
  recoverFromMnemonic(mnemonic: string, path?: string): Promise<Wallet> { /* ... */ }
  recoverFromPrivateKey(privateKey: string): Promise<Wallet> { /* ... */ }
  validateAddress(address: string): boolean { /* ... */ }
  validatePrivateKey(privateKey: string): boolean { /* ... */ }
  validateMnemonic(mnemonic: string): boolean { /* ... */ }
}
```

#### SolanaWalletGenerator

```typescript
class SolanaWalletGenerator implements WalletGenerator {
  // Similar methods as EthereumWalletGenerator but Solana-specific implementations
}
```

#### RippleWalletGenerator

```typescript
class RippleWalletGenerator implements WalletGenerator {
  // XRP-specific wallet generation and validation
}
```

#### NEARWalletGenerator

```typescript
class NEARWalletGenerator implements WalletGenerator {
  // NEAR-specific wallet generation and validation
}
```

### 4. WalletAddressReceiver

The `WalletAddressReceiver` manages WebSocket connections for receiving wallet addresses:

```typescript
export function useWalletAddressReceiver(url: string) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Connection management
  // Message handling
  // Reconnection logic
  
  return { addresses, isConnected, error, reconnect, clearAddresses };
}
```

### 5. WalletContext

The `WalletContext` provides application-wide access to wallet functionality:

```typescript
interface WalletContextType {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  connecting: boolean;
  error: Error | null;
  connect: (walletType: WalletType, blockchain: string) => Promise<void>;
  disconnect: (walletId: string) => Promise<void>;
  setActiveWallet: (walletId: string) => void;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (transaction: any) => Promise<any>;
  receivedAddresses: string[];
  wsConnected: boolean;
  reconnectWebSocket: () => void;
}

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // State management
  // Wallet operations
  // WebSocket integration
  
  const contextValue: WalletContextType = {
    wallets,
    activeWallet,
    connecting,
    error,
    connect,
    disconnect,
    setActiveWallet,
    signMessage,
    signTransaction,
    receivedAddresses,
    wsConnected,
    reconnectWebSocket
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
```

## Data Structures

### Wallet Interface

```typescript
interface Wallet {
  id: string;
  address: string;
  blockchain: string;
  type: WalletType;
  isConnected: boolean;
  balance?: string;
  publicKey?: string;
  privateKey?: string; // Only for non-custodial wallets when explicitly required
}
```

### WalletType Enum

```typescript
enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  PHANTOM = 'phantom',
  KEPLR = 'keplr',
  LEDGER = 'ledger',
  TREZOR = 'trezor',
  LOCAL = 'local', // For local wallet generation
  OTHER = 'other'
}
```

### WalletEventListener Interface

```typescript
interface WalletEventListener {
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: (walletId: string) => void;
  onBalanceChange?: (wallet: Wallet, newBalance: string) => void;
  onWalletSwitch?: (oldWallet: Wallet | null, newWallet: Wallet) => void;
  onAccountChange?: (wallet: Wallet, newAddress: string) => void;
  onChainChange?: (wallet: Wallet, newChainId: string) => void;
  onError?: (error: Error, wallet?: Wallet) => void;
}
```

### WalletGenerator Interface

```typescript
interface WalletGenerator {
  generateWallet(options?: any): Promise<Wallet>;
  generateMnemonic(wordCount?: number): string;
  recoverFromMnemonic(mnemonic: string, path?: string): Promise<Wallet>;
  recoverFromPrivateKey(privateKey: string): Promise<Wallet>;
  validateAddress(address: string): boolean;
  validatePrivateKey(privateKey: string): boolean;
  validateMnemonic(mnemonic: string): boolean;
}
```

## Wallet Connection Flow

1. **Initialization**: Application creates or retrieves the WalletManager instance
2. **Connection Request**: User selects a wallet type (MetaMask, WalletConnect, etc.)
3. **Provider Connection**: WalletManager connects to the selected wallet provider
4. **Authorization**: User authorizes the connection in their wallet
5. **Account Access**: WalletManager receives account information from the wallet
6. **Event Registration**: WalletManager registers for wallet events (disconnect, account change, etc.)
7. **State Update**: Application UI updates to reflect the connected wallet
8. **Operation Availability**: Signing and transaction capabilities become available

## Usage Examples

### Connecting a Wallet

```typescript
import { WalletManager, WalletType } from '@/services/wallet/WalletManager';

// Get the wallet manager instance
const walletManager = WalletManager.getInstance();

// Connect to a wallet (MetaMask for Ethereum in this example)
try {
  const wallet = await walletManager.connect(WalletType.METAMASK, 'ethereum');
  console.log(`Connected to wallet: ${wallet.address}`);
} catch (error) {
  console.error('Failed to connect wallet:', error);
}
```

### Using the Wallet Context

```typescript
import { useWallet } from '@/context/WalletContext';
import { WalletType } from '@/services/wallet/WalletManager';

function WalletConnectButton() {
  const { connect, disconnect, activeWallet, connecting, error } = useWallet();
  
  const handleConnect = async () => {
    try {
      await connect(WalletType.METAMASK, 'ethereum');
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };
  
  const handleDisconnect = async () => {
    if (activeWallet) {
      await disconnect(activeWallet.id);
    }
  };
  
  return (
    <div>
      {!activeWallet ? (
        <button onClick={handleConnect} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected: {activeWallet.address}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```

### Generating a Wallet

```typescript
import { WalletGeneratorFactory } from '@/services/wallet/generators/WalletGeneratorFactory';

// Get a generator for the desired blockchain
const generator = WalletGeneratorFactory.getInstance().getGenerator('ethereum');

// Generate a new wallet
const newWallet = await generator.generateWallet();
console.log(`New wallet address: ${newWallet.address}`);
console.log(`Private key: ${newWallet.privateKey}`);

// Generate a mnemonic
const mnemonic = generator.generateMnemonic(12); // 12-word mnemonic
console.log(`Mnemonic: ${mnemonic}`);

// Recover from mnemonic
const recoveredWallet = await generator.recoverFromMnemonic(mnemonic);
console.log(`Recovered wallet address: ${recoveredWallet.address}`);

// Validate an address
const isValid = generator.validateAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
console.log(`Is valid address: ${isValid}`);
```

### Signing a Message

```typescript
import { WalletManager } from '@/services/wallet/WalletManager';

const walletManager = WalletManager.getInstance();
const activeWallet = walletManager.getActiveWallet();

if (activeWallet) {
  try {
    const message = 'Hello, blockchain world!';
    const signature = await walletManager.signMessage(message);
    console.log(`Message signed: ${signature}`);
  } catch (error) {
    console.error('Signing failed:', error);
  }
}
```

### Working with WebSocket Connection

```typescript
import { useWalletAddressReceiver } from '@/services/wallet/WalletAddressReceiver';

function WalletAddressMonitor() {
  const wsUrl = import.meta.env.VITE_WALLET_WS_URL || 'ws://localhost:8080/ws';
  const { addresses, isConnected, error, reconnect, clearAddresses } = useWalletAddressReceiver(wsUrl);
  
  return (
    <div>
      <h2>Wallet Address Monitor</h2>
      <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {error && <p className="error">{error.message}</p>}
      <button onClick={reconnect}>Reconnect</button>
      <button onClick={clearAddresses}>Clear Addresses</button>
      
      <h3>Received Addresses ({addresses.length})</h3>
      <ul>
        {addresses.map((address, index) => (
          <li key={index}>{address}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Security Considerations

1. **Private Key Handling**: Private keys are never stored in browser localStorage and are only kept in memory when absolutely necessary
2. **Connection Security**: All wallet connections use secure channels (HTTPS/WSS)
3. **Permissions**: Clear permission requests with specific scopes
4. **Input Validation**: All addresses and transaction parameters are validated before use
5. **Error Handling**: Failures don't expose sensitive information
6. **Wallet Timeouts**: Automatic disconnection after periods of inactivity