import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Token, SwapRouteStep } from "./types";

interface SwapRouteInfoProps {
  route: SwapRouteStep[];
  tokens: Record<string, Token>;
}

export const SwapRouteInfo: React.FC<SwapRouteInfoProps> = ({
  route,
  tokens,
}) => {
  // Calculate the total number of hops to visualize
  const tokenPath = route.reduce<string[]>((acc, step, index) => {
    if (index === 0) {
      // First step, add both tokens
      acc.push(step.tokenIn, step.tokenOut);
    } else {
      // Subsequent steps, just add the output token
      acc.push(step.tokenOut);
    }
    return acc;
  }, []);

  // Remove duplicates
  const uniqueTokenPath = [...new Set(tokenPath)];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Swap Route</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center flex-wrap">
          {uniqueTokenPath.map((tokenId, index) => {
            const token = tokens[tokenId] || { symbol: tokenId, logoURI: "" };
            
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex items-center">
                  {token.logoURI && (
                    <img 
                      src={token.logoURI} 
                      alt={token.symbol} 
                      className="w-5 h-5 rounded-full mr-1" 
                    />
                  )}
                  <span className="text-sm">{token.symbol}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          {uniqueTokenPath.length > 2 ? (
            <>
              This swap routes through multiple tokens to get you the best price.
            </>
          ) : (
            <>
              Direct swap between tokens.
            </>
          )}
        </div>

        {/* Protocol and fee information */}
        {route.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h4 className="text-xs font-medium mb-2">Route Details</h4>
            {route.map((step, index) => (
              <div key={index} className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {step.protocol} {step.portion.toFixed(1)}%
                </span>
                <span>{step.fee ? `Fee: ${step.fee}%` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 