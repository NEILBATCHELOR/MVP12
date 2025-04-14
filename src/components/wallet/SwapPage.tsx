import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/context/WalletContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ethers } from "ethers";
import { z } from "zod";
import { 
  ArrowDown, 
  ArrowLeftRight, 
  RefreshCw, 
  Settings, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  BarChart3, 
  AlertTriangle,
  Clock,
  Wallet,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ExternalLink,
  ChevronsRight,
} from "lucide-react";
import { SwapSettings } from "@/components/wallet/components/swap/SwapSettings";
import { SwapConfirmation } from "@/components/wallet/components/swap/SwapConfirmation";
import { SwapRouteInfo } from "@/components/wallet/components/swap/SwapRouteInfo";
import { TokenSelector } from "@/components/wallet/components/swap/TokenSelector";
import { 
  swapFormSchema, 
  SwapFormValues, 
  Token, 
  Quote, 
  TransactionResult, 
  SwapRouteStep,
  SwapState, 
  SwapProvider, 
  GasOption 
} from "@/components/wallet/components/swap/types";
import { SwapService } from "@/services/wallet/SwapService";
import { Spinner } from "../Spinner";

// Initialize SwapService
const swapService = new SwapService();

// Updated TokenSelector import with correct props
interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (tokenAddress: string) => void; // Changed from tokenId to tokenAddress
  tokens: Token[];
  selectedTokenId?: string;
  excludeTokenId?: string;
}

export default function SwapPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallets, selectedWallet } = useWallet(); // Removed connectWallet
  
  // State management
  const [swapState, setSwapState] = useState<SwapState>("input");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState<"from" | "to" | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<"pending" | "confirmed" | "failed" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<SwapProvider>("auto");
  const [selectedGasOption, setSelectedGasOption] = useState<GasOption>("medium");
  const [isPriceImpactWarningOpen, setIsPriceImpactWarningOpen] = useState(false);
  
  // Form for swap settings
  const form = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      fromToken: "",
      toToken: "",
      fromAmount: "",
      slippage: "0.5",
      deadline: 20,
      autoRouter: true
    },
  });

  // Create a connect wallet function if not provided by context
  const connectWallet = useCallback(async () => {
    try {
      // Basic implementation to request wallet connection
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        swapService.initializeProvider(provider);
        toast({
          title: "Wallet connected",
          description: "Your wallet has been connected successfully."
        });
      } else {
        toast({
          variant: "destructive",
          title: "No wallet found",
          description: "Please install a Web3 wallet like MetaMask."
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Failed to connect to your wallet."
      });
    }
  }, [toast]);

  // Fetch tokens on component mount
  useEffect(() => {
    async function fetchTokens() {
      try {
        // In a real implementation, you would fetch tokens from a token list API
        // or blockchain directly. For now, we'll use a mock list
        const response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
        if (!response.ok) throw new Error('Failed to fetch token list');
        
        const data = await response.json();
        
        // Add balance information (this would come from wallet in production)
        const tokensWithBalance = data.tokens.slice(0, 30).map((token: any) => ({
          ...token,
          balance: (Math.random() * 10).toFixed(4),
          price: Math.random() * 100
        }));
        
        setAvailableTokens(tokensWithBalance);
        
        // Set default from and to tokens
        const eth = tokensWithBalance.find((t: Token) => t.symbol === 'ETH' || t.symbol === 'WETH');
        const usdc = tokensWithBalance.find((t: Token) => t.symbol === 'USDC');
        
        if (eth) setFromToken(eth);
        if (usdc) setToToken(usdc);
      } catch (error) {
        console.error('Error fetching tokens:', error);
        toast({
          variant: "destructive",
          title: "Failed to load tokens",
          description: "Please try refreshing the page."
        });
      }
    }
    
    fetchTokens();
    
    // Initialize wallet connection
    if (selectedWallet) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        swapService.initializeProvider(provider);
      } catch (error) {
        console.error('Error initializing wallet provider:', error);
      }
    }
  }, [toast, selectedWallet]);

  // Fetch quote when tokens or amount changes
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      fetchQuote();
    } else {
      setSwapState("input");
      setQuote(null);
    }
  }, [fromToken, toToken, fromAmount, form.watch("slippage"), selectedProvider]);
  
  // Monitor transaction status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (txHash && transactionStatus === "pending") {
      intervalId = setInterval(async () => {
        try {
          const status = await swapService.getTransactionStatus(txHash);
          setTransactionStatus(status);
          
          if (status === "confirmed") {
            setSwapState("success");
            clearInterval(intervalId);
          } else if (status === "failed") {
            setSwapState("error");
            setErrorMessage("Transaction failed on the blockchain");
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Error checking transaction status:", error);
        }
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [txHash, transactionStatus]);

  const fetchQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) === 0) {
      return;
    }
    
    setIsQuoteLoading(true);
    setErrorMessage(null);
    
    try {
      const slippage = parseFloat(form.watch("slippage"));
      
      const newQuote = await swapService.getQuote(
        fromToken,
        toToken,
        fromAmount,
        slippage,
        selectedProvider
      );
      
      setQuote(newQuote);
      setToAmount(newQuote.toAmount);
      setSwapState("quote");
      
      // Check if price impact is high (over 5%)
      if (parseFloat(newQuote.priceImpact) > 5) {
        setIsPriceImpactWarningOpen(true);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      setErrorMessage(`Failed to get quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSwapState("input");
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    form.setValue("fromAmount", value);
  };

  // Handlers for token selection
  const handleFromTokenSelect = (tokenAddress: string) => {
    const token = availableTokens.find(t => t.address === tokenAddress);
    if (token) {
      setFromToken(token);
      form.setValue("fromToken", token.symbol);
    }
    setIsTokenSelectOpen(null);
  };

  const handleToTokenSelect = (tokenAddress: string) => {
    const token = availableTokens.find(t => t.address === tokenAddress);
    if (token) {
      setToToken(token);
      form.setValue("toToken", token.symbol);
    }
    setIsTokenSelectOpen(null);
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    
    form.setValue("fromToken", toToken?.symbol || "");
    form.setValue("toToken", fromToken?.symbol || "");
    
    setFromAmount(toAmount);
    form.setValue("fromAmount", toAmount);
    setToAmount(fromAmount);
  };

  const handleConfirmSwap = async () => {
    setSwapState("confirmation");
  };

  const executeSwap = async () => {
    if (!selectedWallet || !fromToken || !toToken || !quote) {
      setErrorMessage("Missing wallet connection or swap details");
      setSwapState("error");
      return;
    }
    
    setSwapState("processing");
    setTransactionStatus("pending");
    
    try {
      const slippage = parseFloat(form.watch("slippage"));
      
      const txHash = await swapService.executeSwap(
        fromToken,
        toToken,
        fromAmount,
        slippage,
        selectedWallet.address,
        selectedProvider,
        selectedGasOption
      );
      
      setTxHash(txHash);
    } catch (error) {
      console.error("Error during swap:", error);
      setErrorMessage(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSwapState("error");
      setTransactionStatus(null);
    }
  };

  const resetSwap = () => {
    setSwapState("input");
    setFromAmount("");
    form.setValue("fromAmount", "");
    setToAmount("");
    setQuote(null);
    setErrorMessage(null);
    setTxHash(null);
    setTransactionStatus(null);
    setIsPriceImpactWarningOpen(false);
  };

  const openTokenSelector = (side: "from" | "to") => {
    setIsTokenSelectOpen(side);
  };

  // Render the token selection dropdown
  const renderTokenSelector = (
    selectedToken: Token | null,
    onSelect: (tokenAddress: string) => void,
    side: "from" | "to"
  ) => {
    return (
      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-card px-2 py-1 ring-1 ring-border hover:ring-primary"
          onClick={() => openTokenSelector(side)}
        >
          {selectedToken ? (
            <>
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.name}
                className="h-6 w-6 rounded-full"
                onError={(e) => {
                  // Fallback if token image fails to load
                  (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/generic.svg';
                }}
              />
              <span className="font-medium">{selectedToken.symbol}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select token</span>
          )}
        </button>
      </div>
    );
  };

  // Determine what content to render based on swap state
  const renderContent = () => {
    switch (swapState) {
      case "input":
      case "quote":
        return (
          <Form {...form}>
            <form className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-foreground/60">
                    From
                  </label>
                  {fromToken && (
                    <div className="text-sm">
                      Balance:{" "}
                      <span className="font-medium">
                        {fromToken.balance} {fromToken.symbol}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderTokenSelector(fromToken, handleFromTokenSelect, "from")}
                  <Input
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fromToken && handleFromAmountChange(fromToken.balance || "0")}
                  >
                    Max
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleSwapTokens}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-foreground/60">
                    To
                  </label>
                  {toToken && (
                    <div className="text-sm">
                      Balance:{" "}
                      <span className="font-medium">
                        {toToken.balance} {toToken.symbol}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderTokenSelector(toToken, handleToTokenSelect, "to")}
                  <Input
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className="flex-1"
                  />
                </div>
              </div>

              {quote && (
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span>
                      1 {fromToken?.symbol} ={" "}
                      {parseFloat(quote.exchangeRate).toFixed(6)}{" "}
                      {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span>{quote.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className={parseFloat(quote.priceImpact) > 3 ? "text-orange-500" : "text-green-500"}>
                      {quote.priceImpact}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <div className="flex items-center">
                      <span>{fromToken?.symbol}</span>
                      {quote.route.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <ChevronsRight className="h-4 w-4 text-muted-foreground mx-1" />
                          <div className="flex items-center">
                            <span>{step.tokenOut}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas (estimated)</span>
                    <span>{ethers.utils.formatUnits(quote.estimatedGas, "gwei")} gwei</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Button
                type="button"
                variant={fromAmount && toAmount ? "default" : "outline"}
                className="w-full"
                disabled={!fromAmount || !toAmount || isQuoteLoading}
                onClick={handleConfirmSwap}
              >
                {isQuoteLoading ? <Spinner className="mr-2" /> : null}
                {isQuoteLoading
                  ? "Getting Best Quote"
                  : fromAmount && toAmount
                  ? "Review Swap"
                  : "Enter Amount"}
              </Button>
            </form>
          </Form>
        );
      case "confirmation":
        return (
          <SwapConfirmation
            fromToken={fromToken}
            toToken={toToken}
            quote={quote}
            slippage={parseFloat(form.watch("slippage"))}
            onConfirm={executeSwap}
            onCancel={() => setSwapState("quote")}
          />
        );
      case "processing":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Spinner className="h-12 w-12" />
            <h3 className="text-lg font-medium">Processing Your Swap</h3>
            <p className="text-muted-foreground text-center">
              Please wait while we process your swap transaction. This may take a
              few moments.
            </p>
            {txHash && (
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-1 text-sm"
              >
                View on Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium">Swap Successful!</h3>
            <p className="text-muted-foreground text-center">
              You've successfully swapped {fromAmount} {fromToken?.symbol} for{" "}
              {toAmount} {toToken?.symbol}.
            </p>
            {txHash && (
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-1 text-sm"
              >
                View on Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button onClick={resetSwap} className="mt-4">
              Swap Again
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium">Swap Failed</h3>
            <p className="text-muted-foreground text-center">
              {errorMessage || "There was an error processing your swap. Please try again."}
            </p>
            <Button onClick={resetSwap} variant="destructive" className="mt-4">
              Try Again
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle>Swap</CardTitle>
          <div className="flex space-x-2">
            <Select
              value={selectedProvider}
              onValueChange={(value) => setSelectedProvider(value as SwapProvider)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Best)</SelectItem>
                <SelectItem value="0x">0x Protocol</SelectItem>
                <SelectItem value="1inch">1inch</SelectItem>
                <SelectItem value="paraswap">ParaSwap</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Trade tokens instantly with the best rates across multiple DEXes.
        </CardDescription>
      </CardHeader>

      {/* Settings Dialog */}
      {isSettingsOpen && (
        <SwapSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          form={form}
        />
      )}

      {/* Token Selector Dialog */}
      {isTokenSelectOpen && (
        <TokenSelector
          isOpen={isTokenSelectOpen !== null}
          onClose={() => setIsTokenSelectOpen(null)}
          tokens={availableTokens}
          onSelectToken={isTokenSelectOpen === "from" ? handleFromTokenSelect : handleToTokenSelect}
          selectedTokenId={isTokenSelectOpen === "from" ? fromToken?.address : toToken?.address}
          excludeTokenId={isTokenSelectOpen === "from" ? toToken?.address : fromToken?.address}
        />
      )}

      <Card>
        <CardContent className="pt-6">{renderContent()}</CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Wallet</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedWallet ? 
                      `${selectedWallet.address.substring(0, 6)}...${selectedWallet.address.substring(selectedWallet.address.length - 4)}` : 
                      "Not connected"}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => selectedWallet ? navigate("/wallet") : connectWallet()}
              >
                {selectedWallet ? "Change" : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 