import { z } from "zod";

// Schema for the swap form
export const swapFormSchema = z.object({
  fromToken: z.string(),
  toToken: z.string(),
  fromAmount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  slippage: z.string().default("1.0"),
  deadline: z.number().default(20),
  autoRouter: z.boolean().default(true),
});

export type SwapFormValues = z.infer<typeof swapFormSchema>;

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  balance?: string;
  price?: number;
  chainId?: number;
}

export interface PriceData {
  price: number;
  priceChange24h: number;
  fromTokenUsdPrice?: number;
  toTokenUsdPrice?: number;
  gasCostUsd?: number;
}

export interface SwapRouteHop {
  address: string;
  symbol: string;
  logoURI: string;
}

export interface SwapRoute {
  name: string;
  portion: number;
  hops: SwapRouteHop[];
}

export interface SwapRouteStep {
  protocol: string;
  tokenIn: string;
  tokenOut: string;
  portion: number;
  fee?: number;
}

export interface Quote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  exchangeRate: string;
  priceImpact: string;
  minimumReceived: string;
  routes: SwapRoute[];
  gasCost: {
    eth: string;
    usd: string;
  };
  slippage: string;
  // Legacy fields for backward compatibility
  route?: SwapRouteStep[];
  estimatedGas?: string;
  provider?: SwapProvider;
  guaranteedPrice?: string;
  gasPrice?: string;
  protocolFee?: string;
  validUntil?: number;
}

export interface SwapTransaction {
  hash: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  walletAddress: string;
}

export interface TransactionResult {
  hash: string;
  status: "success" | "pending" | "failed";
}

export type SwapProvider = "auto" | "0x" | "1inch" | "paraswap" | "uniswap";
export type GasOption = "low" | "medium" | "high";
export type SwapState = "input" | "quote" | "confirmation" | "processing" | "success" | "error"; 