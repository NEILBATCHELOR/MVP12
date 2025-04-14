/// <reference types="vite/client" />

// Add the window ethereum type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isConnected: () => boolean;
    };
  }
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletAddressReceiver, WalletAddressMessage } from '@/services/wallet/WalletAddressReceiver';
import { ETHWalletGenerator, GeneratedWallet } from '@/services/wallet/ETHWalletGenerator';

// Wallet types
export type WalletType = 'eoa' | 'multisig';

export interface Wallet {
  id: string;
  name: string;
  address: string;
  type: WalletType;
  network: string;
  balance?: string;
  owners?: string[];
  threshold?: number;
  createdAt: Date;
}

// Context interface
interface WalletContextProps {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
  selectedWallet: Wallet | null;
  receivedAddresses: WalletAddressMessage[];
  wsConnected: boolean;
  
  // Actions
  createWallet: (name: string, type: WalletType, network: string) => Promise<Wallet>;
  selectWallet: (walletId: string) => void;
  generateNewAddress: () => GeneratedWallet;
  importWallet: (privateKey: string, name: string, network: string) => Promise<Wallet>;
  clearReceivedAddresses: () => void;
  reconnectWebSocket: () => void;
  connectWallet: () => Promise<void>;
}

// Default context value
const defaultContextValue: WalletContextProps = {
  wallets: [],
  loading: false,
  error: null,
  selectedWallet: null,
  receivedAddresses: [],
  wsConnected: false,
  
  createWallet: async () => {
    throw new Error('Not implemented');
  },
  selectWallet: () => {},
  generateNewAddress: () => {
    throw new Error('Not implemented');
  },
  importWallet: async () => {
    throw new Error('Not implemented');
  },
  clearReceivedAddresses: () => {},
  reconnectWebSocket: () => {},
  connectWallet: async () => {
    throw new Error('Not implemented');
  },
};

// Create the context
const WalletContext = createContext<WalletContextProps>(defaultContextValue);

// WebSocket URL for receiving addresses
const WS_URL = import.meta.env.VITE_WALLET_WS_URL || 
  (import.meta.env.MODE === 'development' ? null : 'ws://localhost:8080/ws');

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [receivedAddresses, setReceivedAddresses] = useState<WalletAddressMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [addressReceiver, setAddressReceiver] = useState<WalletAddressReceiver | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Skip WebSocket initialization if URL is not provided
    if (!WS_URL) {
      setWsConnected(false);
      setError('WebSocket disabled in development mode');
      return;
    }

    const receiver = new WalletAddressReceiver(WS_URL);
    
    receiver.onConnected(() => {
      setWsConnected(true);
      setError(null);
    });
    
    receiver.onNewAddress((address) => {
      setReceivedAddresses(prev => [...prev, address]);
    });
    
    receiver.onError(() => {
      setWsConnected(false);
      setError('WebSocket connection disabled in development mode');
    });
    
    receiver.connect();
    setAddressReceiver(receiver);
    
    return () => {
      receiver.disconnect();
    };
  }, []);

  // Load wallets from storage/API
  useEffect(() => {
    const loadWallets = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockWallets: Wallet[] = [
          {
            id: '1',
            name: 'Main MultiSig Wallet',
            address: '0x7Fc98a135E7107396C53f3aFbBe271ab82A54D8F3e',
            type: 'multisig',
            network: 'ethereum',
            balance: '98245.32',
            owners: ['0x123...', '0x456...', '0x789...'],
            threshold: 3,
            createdAt: new Date('2023-01-15'),
          },
          {
            id: '2',
            name: 'Treasury MultiSig',
            address: '0x3Ab2f5d67890bCdE9D1c',
            type: 'multisig',
            network: 'polygon',
            balance: '28750.18',
            owners: ['0x123...', '0x456...'],
            threshold: 2,
            createdAt: new Date('2023-02-20'),
          },
          {
            id: '3',
            name: 'Personal Wallet',
            address: '0x9Ff4b567C890aD2A7b',
            type: 'eoa',
            network: 'avalanche',
            balance: '1425.00',
            createdAt: new Date('2023-03-10'),
          },
        ];
        
        setWallets(mockWallets);
        
        // Select the first wallet by default
        if (mockWallets.length > 0 && !selectedWallet) {
          setSelectedWallet(mockWallets[0]);
        }
      } catch (err) {
        setError('Failed to load wallets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWallets();
  }, [selectedWallet]);

  // Create a new wallet
  const createWallet = async (name: string, type: WalletType, network: string): Promise<Wallet> => {
    setLoading(true);
    try {
      let newWallet: Wallet;
      
      if (type === 'eoa') {
        // Generate a new EOA wallet
        const generated = ETHWalletGenerator.generateMultipleWallets(1, { includePrivateKey: false })[0];
        
        // In a real app, you would save the wallet securely
        newWallet = {
          id: Date.now().toString(),
          name,
          address: generated.address,
          type,
          network,
          balance: '0',
          createdAt: new Date(),
        };
      } else {
        // For MultiSig, we would typically use a factory contract
        // This is simplified mock implementation
        newWallet = {
          id: Date.now().toString(),
          name,
          address: `0x${Math.random().toString(16).substring(2, 42)}`,
          type,
          network,
          balance: '0',
          owners: ['0x123...', '0x456...'], // Default owners
          threshold: 1,
          createdAt: new Date(),
        };
      }
      
      // Update the wallets state
      setWallets(prev => [...prev, newWallet]);
      
      return newWallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Select a wallet
  const selectWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId) || null;
    setSelectedWallet(wallet);
  };

  // Generate a new ETH address
  const generateNewAddress = (): GeneratedWallet => {
    try {
      return ETHWalletGenerator.generateMultipleWallets(1, { includePrivateKey: true })[0];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Import a wallet using private key
  const importWallet = async (privateKey: string, name: string, network: string): Promise<Wallet> => {
    setLoading(true);
    try {
      const imported = ETHWalletGenerator.fromPrivateKey(privateKey, { includePrivateKey: false });
      
      const newWallet: Wallet = {
        id: Date.now().toString(),
        name,
        address: imported.address,
        type: 'eoa',
        network,
        balance: '0',
        createdAt: new Date(),
      };
      
      // Update the wallets state
      setWallets(prev => [...prev, newWallet]);
      
      return newWallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear received addresses
  const clearReceivedAddresses = () => {
    setReceivedAddresses([]);
  };

  // Reconnect to WebSocket
  const reconnectWebSocket = () => {
    if (addressReceiver) {
      addressReceiver.disconnect();
      addressReceiver.connect();
    }
  };

  // Connect a wallet (for web3 providers like MetaMask)
  const connectWallet = async (): Promise<void> => {
    try {
      setLoading(true);
      // This would connect to MetaMask or another browser wallet
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
        
        // Check if this wallet already exists in our list
        const existingWallet = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
        
        if (existingWallet) {
          setSelectedWallet(existingWallet);
        } else {
          // Create a new wallet entry for this address
          const connectedWallet: Wallet = {
            id: Date.now().toString(),
            name: 'MetaMask Wallet',
            address,
            type: 'eoa',
            network: 'ethereum',
            balance: '0', // This would be updated with a real balance check
            createdAt: new Date(),
          };
          
          setWallets(prev => [...prev, connectedWallet]);
          setSelectedWallet(connectedWallet);
        }
      } else {
        throw new Error('No wallet provider found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        loading,
        error,
        selectedWallet,
        receivedAddresses,
        wsConnected,
        createWallet,
        selectWallet,
        generateNewAddress,
        importWallet,
        clearReceivedAddresses,
        reconnectWebSocket,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use the wallet context
export const useWallet = () => useContext(WalletContext);