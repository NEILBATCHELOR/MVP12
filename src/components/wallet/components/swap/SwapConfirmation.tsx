import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Token, Quote, SwapRouteStep } from "./types";

interface SwapConfirmationProps {
  fromToken: Token | undefined;
  toToken: Token | undefined;
  quote: Quote;
  slippage: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SwapConfirmation: React.FC<SwapConfirmationProps> = ({
  fromToken,
  toToken,
  quote,
  slippage,
  onConfirm,
  onCancel,
}) => {
  if (!fromToken || !toToken) {
    return null;
  }

  const isPriceImpactHigh = Number(quote.priceImpact) > 1;
  const minReceived = parseFloat(quote.toAmount) * (1 - slippage / 100);

  // Generate a simplified path for visualization
  const getSimplifiedPath = () => {
    if (!Array.isArray(quote.route) || quote.route.length === 0) {
      return [];
    }

    if (typeof quote.route[0] === 'string') {
      // Handle legacy format
      return quote.route as unknown as string[];
    }

    // For SwapRouteStep format, extract a simple path
    const tokenPath = (quote.route as SwapRouteStep[]).reduce<string[]>((acc, step, index) => {
      if (index === 0) {
        // First step, add both tokens
        acc.push(step.tokenIn, step.tokenOut);
      } else {
        // Subsequent steps, just add the output token if it's different from the last one
        if (acc[acc.length - 1] !== step.tokenOut) {
          acc.push(step.tokenOut);
        }
      }
      return acc;
    }, []);

    // Remove duplicates
    return [...new Set(tokenPath)];
  };

  const simplifiedPath = getSimplifiedPath();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border overflow-hidden">
        <div className="p-4 space-y-2 bg-secondary/20">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">From</span>
            <span className="text-sm text-muted-foreground">
              Balance: {fromToken.balance} {fromToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={fromToken.logoURI}
              alt={fromToken.symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/generic.svg';
              }}
            />
            <div>
              <div className="font-medium">{fromToken.symbol}</div>
              <div className="text-sm text-muted-foreground">{fromToken.name}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-medium">{quote.fromAmount}</div>
              <div className="text-sm text-muted-foreground">
                ${(Number(quote.fromAmount) * (fromToken.price || 0)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-3 z-10 relative">
          <div className="rounded-full h-10 w-10 bg-background shadow-md border flex items-center justify-center">
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 space-y-2 bg-secondary/10">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">To (estimated)</span>
            <span className="text-sm text-muted-foreground">
              Balance: {toToken.balance} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={toToken.logoURI}
              alt={toToken.symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/generic.svg';
              }}
            />
            <div>
              <div className="font-medium">{toToken.symbol}</div>
              <div className="text-sm text-muted-foreground">{toToken.name}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-medium">{quote.toAmount}</div>
              <div className="text-sm text-muted-foreground">
                ${(Number(quote.toAmount) * (toToken.price || 0)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Rate</span>
          <span>
            1 {fromToken.symbol} = {quote.exchangeRate} {toToken.symbol}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Minimum Received</span>
          <span>
            {minReceived.toFixed(6)} {toToken.symbol}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price Impact</span>
          <span className={isPriceImpactHigh ? "text-amber-500" : "text-green-500"}>
            {quote.priceImpact}%
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Swap Fee</span>
          <span>{quote.route[0]?.fee || 0.3}%</span>
        </div>

        <Separator />

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Route</span>
          <div className="flex items-center">
            {simplifiedPath.map((token, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                <span>{token}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {quote.provider && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Provider</span>
            <span>{quote.provider}</span>
          </div>
        )}

        {quote.estimatedGas && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gas Estimate</span>
            <span>~{Number(quote.estimatedGas).toLocaleString()} units</span>
          </div>
        )}
      </div>

      {isPriceImpactHigh && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-700">Price Impact Warning</h4>
            <p className="text-sm text-amber-600">
              The price impact for this swap is relatively high. This might be due to low liquidity.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={onConfirm}
        >
          Confirm Swap
        </Button>
      </div>
    </div>
  );
}; 