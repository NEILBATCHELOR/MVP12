import React, { createContext, useContext, useState, useEffect } from "react";
import type { providers } from "ethers";

// Placeholder for web3-react imports
const InjectedConnector = class {
  constructor(config: any) {}
  isAuthorized() {
    return Promise.resolve(false);
  }
};

const WalletConnectConnector = class {
  constructor(config: any) {}
};

// Configure connectors
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 137, 80001], // Supported networks
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: "https://mainnet.infura.io/v3/your-infura-key",
    3: "https://ropsten.infura.io/v3/your-infura-key",
  },
  qrcode: true,
});

interface Web3ContextType {
  account: string | null;
  chainId: number | undefined;
  active: boolean;
  error: Error | undefined;
  library: providers.Web3Provider | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

// Mock implementation of useWeb3React
const useWeb3React = () => {
  return {
    activate: async () => {},
    deactivate: () => {},
    account: null,
    chainId: 1,
    active: false,
    error: undefined,
    library: undefined,
  };
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activate, deactivate, account, chainId, active, error, library } =
    useWeb3React();

  // Connect to wallet
  const connect = async () => {
    try {
      await activate();
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    try {
      deactivate();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  // Sign a message with the connected wallet
  const signMessage = async (message: string): Promise<string> => {
    if (!library || !account) {
      throw new Error("No wallet connected");
    }

    try {
      const signer = library.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error: any) {
      console.error("Error signing message:", error);
      throw error;
    }
  };

  // Auto-connect to the wallet if previously connected
  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate().catch((error) => {
          console.error("Failed to auto-connect:", error);
        });
      }
    });
  }, [activate]);

  const value = {
    account,
    chainId,
    active,
    error,
    library,
    connect,
    disconnect,
    signMessage,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
