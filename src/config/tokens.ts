import { Token } from "@/components/wallet/components/swap/types";

// Chain IDs
export enum ChainId {
  ETHEREUM = 1,
  POLYGON = 137,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  BASE = 8453,
}

// Chain information
export interface Chain {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Chain configurations
export const CHAINS: Record<number, Chain> = {
  [ChainId.ETHEREUM]: {
    id: ChainId.ETHEREUM,
    name: "Ethereum",
    shortName: "ETH",
    logoUrl: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
    rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  [ChainId.POLYGON]: {
    id: ChainId.POLYGON,
    name: "Polygon",
    shortName: "MATIC",
    logoUrl: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png",
    rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  [ChainId.ARBITRUM]: {
    id: ChainId.ARBITRUM,
    name: "Arbitrum",
    shortName: "ARB",
    logoUrl: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/arb.png",
    rpcUrl: import.meta.env.VITE_ARBITRUM_RPC_URL || "https://arb-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  [ChainId.OPTIMISM]: {
    id: ChainId.OPTIMISM,
    name: "Optimism",
    shortName: "OP",
    logoUrl: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/op.png",
    rpcUrl: import.meta.env.VITE_OPTIMISM_RPC_URL || "https://opt-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  [ChainId.BASE]: {
    id: ChainId.BASE,
    name: "Base",
    shortName: "BASE",
    logoUrl: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
    rpcUrl: import.meta.env.VITE_BASE_RPC_URL || "https://base-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// Token configurations with addresses for different chains
export const TOKENS: Record<string, Token> = {
  "ETH": {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Special address for native ETH
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
    balance: "0.00",
    price: 3500,
    chainId: ChainId.ETHEREUM,
  },
  "WETH": {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Mainnet WETH
    symbol: "WETH",
    name: "Wrapped Ethereum",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
    balance: "0.00",
    price: 3498,
    chainId: ChainId.ETHEREUM,
  },
  "USDC": {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Mainnet USDC
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png",
    balance: "0.00",
    price: 1,
    chainId: ChainId.ETHEREUM,
  },
  "USDT": {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Mainnet USDT
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png",
    balance: "0.00",
    price: 1,
    chainId: ChainId.ETHEREUM,
  },
  "DAI": {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // Mainnet DAI
    symbol: "DAI",
    name: "Dai",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dai.png",
    balance: "0.00",
    price: 1,
    chainId: ChainId.ETHEREUM,
  },
  "MATIC": {
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", // Mainnet MATIC (ERC20)
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png",
    balance: "0.00",
    price: 0.60,
    chainId: ChainId.ETHEREUM,
  },
  "UNI": {
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // Mainnet UNI
    symbol: "UNI",
    name: "Uniswap",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/uni.png",
    balance: "0.00",
    price: 10,
    chainId: ChainId.ETHEREUM,
  }
};

// Sets random balances for tokens to simulate a wallet with funds
// Only for development purposes
export function getTokensWithRandomBalances(): Token[] {
  return Object.values(TOKENS).map(token => ({
    ...token,
    balance: (Math.random() * 10).toFixed(token.decimals === 6 ? 2 : 4)
  }));
} 