import { 
  SwapFormValues, 
  Quote, 
  SwapTransaction, 
  SwapProvider, 
  Token,
  SwapRouteStep,
  GasOption,
  SwapRoute,
  PriceData
} from "@/components/wallet/components/swap/types";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";

// Interfaces for DEX API responses
interface OneInchQuoteResponse {
  toAmount: string;
  fromToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  protocols: Array<any>;
  estimatedGas: number;
}

interface OneInchSwapResponse extends OneInchQuoteResponse {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
  };
}

interface ZeroXQuoteResponse {
  price: string;
  guaranteedPrice: string;
  estimatedGas: string;
  gas: string;
  gasPrice: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  buyAmount: string;
  sources: Array<{
    name: string;
    proportion: string;
  }>;
}

interface ZeroXSwapResponse extends ZeroXQuoteResponse {
  data: string;
  to: string;
  value: string;
}

// Class to handle all swap-related functionality
export class SwapService {
  private apiKeys: Record<string, string>;
  private baseUrls: Record<string, string>;
  private provider: ethers.providers.Web3Provider | null = null;
  
  constructor() {
    this.apiKeys = {
      "0x": import.meta.env.VITE_ZEROX_API_KEY || "",
      "1inch": import.meta.env.VITE_ONEINCH_API_KEY || "",
      "paraswap": import.meta.env.VITE_PARASWAP_API_KEY || "",
      "coingecko": import.meta.env.VITE_COINGECKO_API_KEY || ""
    };

    this.baseUrls = {
      "0x": "https://api.0x.org",
      "1inch": "https://api.1inch.io/v5.0",
      "paraswap": "https://apiv5.paraswap.io",
      "coingecko": "https://api.coingecko.com/api/v3",
      "uniswap": "https://api.uniswap.org/v1"
    };
    
    // Initialize Ethereum provider if window.ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
    }
  }
  
  // Initialize provider from external wallet connection
  initializeProvider(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
  }

  // Get token price data from CoinGecko or Uniswap
  async getTokenPrice(tokenId: string): Promise<number> {
    try {
      // First try CoinGecko
      const url = `${this.baseUrls.coingecko}/simple/price?ids=${tokenId.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url, {
        headers: {
          'X-CoinGecko-Api-Key': this.apiKeys.coingecko
        }
      });
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data[tokenId.toLowerCase()]?.usd) {
        return data[tokenId.toLowerCase()].usd;
      }
      
      // Fallback to Uniswap if CoinGecko doesn't have the token
      // This would require implementing Uniswap price query SDK
      throw new Error("Token not found in CoinGecko");
    } catch (error) {
      console.error("Error fetching token price:", error);
      throw new Error("Failed to fetch token price");
    }
  }

  // Get real-time token price data by addresses
  public async getTokenPriceData(fromTokenAddress: string, toTokenAddress: string): Promise<PriceData> {
    if (!fromTokenAddress || !toTokenAddress) {
      return {
        price: 0,
        priceChange24h: 0
      };
    }
    
    try {
      // Try CoinGecko for the from token
      const fromTokenUrl = `${this.baseUrls.coingecko}/simple/token_price/ethereum?contract_addresses=${fromTokenAddress}&vs_currencies=usd&include_24hr_change=true`;
      const fromTokenResponse = await fetch(fromTokenUrl, {
        headers: this.apiKeys.coingecko ? { 'x-cg-pro-api-key': this.apiKeys.coingecko } : {}
      });
      
      // Try CoinGecko for the to token
      const toTokenUrl = `${this.baseUrls.coingecko}/simple/token_price/ethereum?contract_addresses=${toTokenAddress}&vs_currencies=usd&include_24hr_change=true`;
      const toTokenResponse = await fetch(toTokenUrl, {
        headers: this.apiKeys.coingecko ? { 'x-cg-pro-api-key': this.apiKeys.coingecko } : {}
      });
      
      if (fromTokenResponse.ok && toTokenResponse.ok) {
        const fromTokenData = await fromTokenResponse.json();
        const toTokenData = await toTokenResponse.json();
        
        if (fromTokenData[fromTokenAddress.toLowerCase()] && toTokenData[toTokenAddress.toLowerCase()]) {
          // Get current gas price for calculation
          const gasPrice = await this.provider?.getGasPrice() || ethers.BigNumber.from("0");
          const estimatedGasCost = ethers.utils.formatEther(gasPrice.mul(100000)); // Rough estimate for swap gas
          
          return {
            price: fromTokenData[fromTokenAddress.toLowerCase()].usd,
            priceChange24h: fromTokenData[fromTokenAddress.toLowerCase()].usd_24h_change || 0,
            fromTokenUsdPrice: fromTokenData[fromTokenAddress.toLowerCase()].usd,
            toTokenUsdPrice: toTokenData[toTokenAddress.toLowerCase()].usd,
            gasCostUsd: parseFloat(estimatedGasCost) * (fromTokenData[fromTokenAddress.toLowerCase()].usd || 0)
          };
        }
      }
      
      // Fallback to a DEX API or aggregator
      throw new Error("CoinGecko API failed");
    } catch (error) {
      console.error("Error fetching token price data:", error);
      // Return mock data if API fails
      return {
        price: 0,
        priceChange24h: 0,
        fromTokenUsdPrice: 0,
        toTokenUsdPrice: 0,
        gasCostUsd: 0
      };
    }
  }

  // Get a quote from the specified provider
  async getQuote(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number,
    provider: SwapProvider = "auto"
  ): Promise<Quote> {
    // If auto, decide the best provider based on the tokens
    if (provider === "auto") {
      provider = this.selectBestProvider(fromToken, toToken);
    }

    try {
      // Call the appropriate provider-specific method
      switch (provider) {
        case "0x":
          return await this.getZeroXQuote(fromToken, toToken, amount, slippage);
        case "1inch":
          return await this.getOneInchQuote(fromToken, toToken, amount, slippage);
        case "paraswap":
          // Implement ParaSwap integration
          throw new Error("ParaSwap integration not implemented yet");
        default:
          throw new Error(`Provider ${provider} not supported`);
      }
    } catch (error) {
      console.error(`Error getting quote from ${provider}:`, error);
      throw new Error(`Failed to get quote from ${provider}`);
    }
  }

  // Build and execute a swap transaction
  async executeSwap(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number,
    walletAddress: string,
    provider: SwapProvider = "auto",
    gasOption: GasOption = "medium"
  ): Promise<string> {
    if (!this.provider) {
      throw new Error("Wallet provider not initialized");
    }
    
    // Ensure we have permission to access the user's account
    await this.provider.send("eth_requestAccounts", []);
    const signer = this.provider.getSigner();
    
    // If auto, decide the best provider based on the tokens
    if (provider === "auto") {
      provider = this.selectBestProvider(fromToken, toToken);
    }

    try {
      // Build transaction based on provider
      let txRequest;
      switch (provider) {
        case "0x":
          txRequest = await this.buildZeroXTransaction(fromToken, toToken, amount, slippage, walletAddress, gasOption);
          break;
        case "1inch":
          txRequest = await this.buildOneInchTransaction(fromToken, toToken, amount, slippage, walletAddress, gasOption);
          break;
        default:
          throw new Error(`Provider ${provider} not supported`);
      }
      
      if (!txRequest) {
        throw new Error("Failed to build transaction");
      }
      
      // Send transaction
      const tx = await signer.sendTransaction({
        to: txRequest.to,
        data: txRequest.data,
        value: ethers.BigNumber.from(txRequest.value || "0"),
        gasLimit: ethers.BigNumber.from(txRequest.gasLimit || "0"),
        gasPrice: ethers.BigNumber.from(txRequest.gasPrice || "0"),
      });
      
      // Return transaction hash
      return tx.hash;
    } catch (error) {
      console.error(`Error executing swap with ${provider}:`, error);
      throw new Error(`Transaction failed: ${error.message || "Unknown error"}`);
    }
  }

  // Get transaction status
  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    if (!this.provider) {
      throw new Error("Wallet provider not initialized");
    }
    
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) {
        return 'pending';
      }
      
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return 'pending';
      }
      
      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch (error) {
      console.error("Error getting transaction status:", error);
      throw new Error("Failed to get transaction status");
    }
  }

  // Select the best provider based on token pair
  private selectBestProvider(fromToken: Token, toToken: Token): SwapProvider {
    // For ETH pairs, 0x often has better rates
    if (fromToken.symbol === "ETH" || toToken.symbol === "ETH" || 
        fromToken.symbol === "WETH" || toToken.symbol === "WETH") {
      return "0x";
    }
    
    // For stablecoin pairs, 1inch often has better rates
    if ((fromToken.symbol === "USDC" || fromToken.symbol === "USDT" || fromToken.symbol === "DAI") &&
        (toToken.symbol === "USDC" || toToken.symbol === "USDT" || toToken.symbol === "DAI")) {
      return "1inch";
    }
    
    // Default to 0x for all other pairs
    return "0x";
  }

  // Get quote from 0x API
  private async getZeroXQuote(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number
  ): Promise<Quote> {
    if (!this.apiKeys["0x"]) {
      throw new Error("0x API key not configured");
    }
    
    // Format amount to proper decimals
    const sellAmount = ethers.utils.parseUnits(amount, fromToken.decimals).toString();
    
    // Build URL for 0x API
    const params = new URLSearchParams({
      sellToken: fromToken.address,
      buyToken: toToken.address,
      sellAmount: sellAmount,
      slippagePercentage: (slippage / 100).toString(),
    });
    
    const url = `${this.baseUrls["0x"]}/swap/v1/quote?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          '0x-api-key': this.apiKeys["0x"]
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`0x API error: ${errorData.reason || response.status}`);
      }
      
      const data: ZeroXQuoteResponse = await response.json();
      
      // Parse the route information from sources
      const route: SwapRouteStep[] = data.sources
        .filter(source => parseFloat(source.proportion) > 0)
        .map(source => ({
          protocol: source.name,
          tokenIn: fromToken.symbol,
          tokenOut: toToken.symbol,
          portion: parseFloat(source.proportion) * 100,
          fee: 0.3 // Default fee, 0x doesn't provide per-route fees
        }));
      
      // Calculate the exchange rate
      const fromDecimals = fromToken.decimals;
      const toDecimals = toToken.decimals;
      const fromAmount = ethers.BigNumber.from(sellAmount);
      const toAmount = ethers.BigNumber.from(data.buyAmount);
      const fromTokenWei = ethers.utils.formatUnits(fromAmount, fromDecimals);
      const toTokenWei = ethers.utils.formatUnits(toAmount, toDecimals);
      const exchangeRate = parseFloat(toTokenWei) / parseFloat(fromTokenWei);
      
      const minimumReceived = (parseFloat(toTokenWei) * (1 - slippage / 100)).toFixed(6);
      
      // Create swapRoute format required by Quote interface
      const swapRoute: SwapRoute = {
        name: "0x",
        portion: 100,
        hops: [
          {
            address: fromToken.address,
            symbol: fromToken.symbol,
            logoURI: fromToken.logoURI
          },
          {
            address: toToken.address,
            symbol: toToken.symbol,
            logoURI: toToken.logoURI
          }
        ]
      };

      return {
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: amount,
        toAmount: ethers.utils.formatUnits(data.buyAmount, toToken.decimals),
        exchangeRate: exchangeRate.toString(),
        priceImpact: "0.5", // 0x doesn't provide price impact info directly
        minimumReceived: minimumReceived,
        routes: [swapRoute],
        gasCost: {
          eth: ethers.utils.formatEther(ethers.BigNumber.from(data.gas).mul(ethers.BigNumber.from(data.gasPrice))),
          usd: "3.50" // Placeholder, should be calculated based on current ETH price
        },
        slippage: slippage.toString(),
        route: route,
        estimatedGas: data.estimatedGas,
        provider: "0x",
        guaranteedPrice: data.guaranteedPrice,
        gasPrice: data.gasPrice,
        protocolFee: data.protocolFee
      };
    } catch (error) {
      console.error("Error fetching 0x quote:", error);
      throw new Error(`Failed to get quote from 0x: ${error.message}`);
    }
  }

  // Get quote from 1inch API
  private async getOneInchQuote(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number
  ): Promise<Quote> {
    if (!this.apiKeys["1inch"]) {
      throw new Error("1inch API key not configured");
    }
    
    // Set chainId for Ethereum mainnet
    const chainId = 1;
    
    // Format amount to proper decimals
    const fromAmount = ethers.utils.parseUnits(amount, fromToken.decimals).toString();
    
    // Build URL for 1inch API
    const params = new URLSearchParams({
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      amount: fromAmount,
      slippage: slippage.toString(),
      disableEstimate: "true",
    });
    
    const url = `${this.baseUrls["1inch"]}/${chainId}/quote?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys["1inch"]}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`1inch API error: ${errorData.description || response.status}`);
      }
      
      const data: OneInchQuoteResponse = await response.json();
      
      // Parse the route information
      const route: SwapRouteStep[] = data.protocols[0][0].map(protocol => ({
        protocol: protocol.name,
        tokenIn: fromToken.symbol,
        tokenOut: toToken.symbol,
        portion: 100 / data.protocols[0][0].length, // Divide evenly if multiple protocols
        fee: 0.3 // Default fee, 1inch doesn't provide per-route fees
      }));
      
      // Calculate the exchange rate
      const fromDecimals = fromToken.decimals;
      const toDecimals = toToken.decimals;
      const fromTokenWei = ethers.utils.formatUnits(fromAmount, fromDecimals);
      const toTokenWei = ethers.utils.formatUnits(data.toAmount, toDecimals);
      const exchangeRate = parseFloat(toTokenWei) / parseFloat(fromTokenWei);
      
      const minimumReceived = (parseFloat(toTokenWei) * (1 - slippage / 100)).toFixed(6);
      
      // Create swapRoute format required by Quote interface
      const swapRoute: SwapRoute = {
        name: "1inch",
        portion: 100,
        hops: [
          {
            address: fromToken.address,
            symbol: fromToken.symbol,
            logoURI: fromToken.logoURI
          },
          {
            address: toToken.address,
            symbol: toToken.symbol,
            logoURI: toToken.logoURI
          }
        ]
      };

      return {
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: amount,
        toAmount: ethers.utils.formatUnits(data.toAmount, toToken.decimals),
        exchangeRate: exchangeRate.toString(),
        priceImpact: "0.6", // 1inch doesn't provide price impact directly
        minimumReceived: minimumReceived,
        routes: [swapRoute],
        gasCost: {
          eth: ethers.utils.formatEther(ethers.BigNumber.from(data.estimatedGas.toString()).mul(ethers.BigNumber.from("5000000000"))), // Estimate using 5 gwei
          usd: "2.50" // Placeholder, should be calculated based on current ETH price
        },
        slippage: slippage.toString(),
        route: route,
        estimatedGas: data.estimatedGas.toString(),
        provider: "1inch"
      };
    } catch (error) {
      console.error("Error fetching 1inch quote:", error);
      throw new Error(`Failed to get quote from 1inch: ${error.message}`);
    }
  }

  // Build transaction from 0x API
  private async buildZeroXTransaction(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number,
    walletAddress: string,
    gasOption: GasOption
  ): Promise<any> {
    if (!this.apiKeys["0x"]) {
      throw new Error("0x API key not configured");
    }
    
    // Format amount to proper decimals
    const sellAmount = ethers.utils.parseUnits(amount, fromToken.decimals).toString();
    
    // Build URL for 0x API swap endpoint
    const params = new URLSearchParams({
      sellToken: fromToken.address,
      buyToken: toToken.address,
      sellAmount: sellAmount,
      slippagePercentage: (slippage / 100).toString(),
      takerAddress: walletAddress
    });
    
    const url = `${this.baseUrls["0x"]}/swap/v1/quote?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          '0x-api-key': this.apiKeys["0x"]
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`0x API error: ${errorData.reason || response.status}`);
      }
      
      const data: ZeroXSwapResponse = await response.json();
      
      // Calculate gas price based on option
      const gasPrice = await this.getAdjustedGasPrice(data.gasPrice, gasOption);
      
      return {
        to: data.to,
        data: data.data,
        value: data.value,
        gasPrice,
        gasLimit: (parseInt(data.gas) * 1.1).toString() // Add 10% buffer
      };
    } catch (error) {
      console.error("Error building 0x transaction:", error);
      throw new Error(`Failed to build 0x transaction: ${error.message}`);
    }
  }

  // Build transaction from 1inch API
  private async buildOneInchTransaction(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number,
    walletAddress: string,
    gasOption: GasOption
  ): Promise<any> {
    if (!this.apiKeys["1inch"]) {
      throw new Error("1inch API key not configured");
    }
    
    // Set chainId for Ethereum mainnet
    const chainId = 1;
    
    // Format amount to proper decimals
    const fromAmount = ethers.utils.parseUnits(amount, fromToken.decimals).toString();
    
    // Build URL for 1inch API swap endpoint
    const params = new URLSearchParams({
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      amount: fromAmount,
      slippage: slippage.toString(),
      fromAddress: walletAddress,
      disableEstimate: "true",
    });
    
    const url = `${this.baseUrls["1inch"]}/${chainId}/swap?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys["1inch"]}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`1inch API error: ${errorData.description || response.status}`);
      }
      
      const data: OneInchSwapResponse = await response.json();
      
      // Calculate gas price based on option
      const gasPrice = await this.getAdjustedGasPrice(data.tx.gasPrice, gasOption);
      
      return {
        to: data.tx.to,
        data: data.tx.data,
        value: data.tx.value,
        gasPrice,
        gasLimit: (parseInt(data.estimatedGas.toString()) * 1.1).toString() // Add 10% buffer
      };
    } catch (error) {
      console.error("Error building 1inch transaction:", error);
      throw new Error(`Failed to build 1inch transaction: ${error.message}`);
    }
  }

  // Get adjusted gas price based on selected gas option
  private async getAdjustedGasPrice(baseGasPrice: string, gasOption: GasOption): Promise<string> {
    if (!this.provider) {
      return baseGasPrice;
    }
    
    try {
      const feeData = await this.provider.getFeeData();
      let multiplier: number;
      
      switch (gasOption) {
        case "low":
          multiplier = 0.9;
          break;
        case "high":
          multiplier = 1.5;
          break;
        case "medium":
        default:
          multiplier = 1.1;
          break;
      }
      
      // Base gas price
      const gasPrice = feeData.gasPrice || ethers.BigNumber.from(baseGasPrice);
      
      // Apply multiplier and return
      return gasPrice.mul(Math.floor(multiplier * 100)).div(100).toString();
    } catch (error) {
      console.error("Error getting adjusted gas price:", error);
      return baseGasPrice;
    }
  }
}

export const swapService = new SwapService(); 