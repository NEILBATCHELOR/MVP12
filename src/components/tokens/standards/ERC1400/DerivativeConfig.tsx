import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Calendar, BarChart3 } from "lucide-react";

interface DerivativeConfigProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const DerivativeConfig: React.FC<DerivativeConfigProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Derivative-Specific Configuration</h3>

      {/* Underlying Asset Management */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-blue-500" />
            Underlying Asset Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="underlyingAssetType">
                Underlying Asset Type*
              </Label>
              <Select
                value={tokenForm.metadata.underlyingAssetType || ""}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      underlyingAssetType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="commodity">Commodity</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="index">Index</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="underlyingAssetAddress">
                Underlying Asset Address
              </Label>
              <Input
                id="underlyingAssetAddress"
                placeholder="0x... (for tokenized assets)"
                value={tokenForm.metadata.underlyingAssetAddress || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      underlyingAssetAddress: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                For tokenized assets (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="underlyingAssetSymbol">
                Underlying Asset Symbol
              </Label>
              <Input
                id="underlyingAssetSymbol"
                placeholder="e.g., BTC, AAPL"
                value={tokenForm.metadata.underlyingAssetSymbol || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      underlyingAssetSymbol: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settlementType">Settlement Type</Label>
              <Select
                value={tokenForm.metadata.settlementType || "cash"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      settlementType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select settlement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash Settlement</SelectItem>
                  <SelectItem value="physical">Physical Delivery</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oracleAddress">Price Oracle Address</Label>
              <Input
                id="oracleAddress"
                placeholder="0x... (price feed address)"
                value={tokenForm.metadata.oracleAddress || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      oracleAddress: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Address of price oracle for settlement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiration & Strike Price Configurations */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-500" />
            Expiration & Strike Price Configurations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date*</Label>
              <Input
                id="expirationDate"
                type="date"
                value={tokenForm.metadata.expirationDate || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      expirationDate: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strikePrice">Strike Price*</Label>
              <Input
                id="strikePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={tokenForm.metadata.strikePrice || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      strikePrice: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="optionType">Option Type</Label>
              <Select
                value={tokenForm.metadata.optionType || "call"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      optionType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call Option</SelectItem>
                  <SelectItem value="put">Put Option</SelectItem>
                  <SelectItem value="future">Future</SelectItem>
                  <SelectItem value="swap">Swap</SelectItem>
                  <SelectItem value="forward">Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exerciseStyle">Exercise Style</Label>
              <Select
                value={tokenForm.metadata.exerciseStyle || "european"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      exerciseStyle: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="european">European</SelectItem>
                  <SelectItem value="bermudan">Bermudan</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                When the option can be exercised
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoExercise"
                checked={tokenForm.metadata.autoExercise || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      autoExercise: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="autoExercise">Auto-Exercise</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically exercise in-the-money options at expiration
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm">
              Configure Exercise Parameters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collateral & Margin Management */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-amber-500" />
            Collateral & Margin Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marginRequirement">Margin Requirement (%)</Label>
              <Input
                id="marginRequirement"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="10.0"
                value={tokenForm.metadata.marginRequirement || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      marginRequirement: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoLiquidation"
                checked={tokenForm.metadata.autoLiquidation || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      autoLiquidation: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="autoLiquidation">Auto-Liquidation</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically liquidate positions below threshold
                </p>
              </div>
            </div>

            {tokenForm.metadata.autoLiquidation && (
              <div className="space-y-2">
                <Label htmlFor="liquidationThreshold">
                  Liquidation Threshold (%)
                </Label>
                <Input
                  id="liquidationThreshold"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="5.0"
                  value={tokenForm.metadata.liquidationThreshold || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        liquidationThreshold: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="collateralType">Collateral Type</Label>
              <Select
                value={tokenForm.metadata.collateralType || "token"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      collateralType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collateral type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token</SelectItem>
                  <SelectItem value="stablecoin">Stablecoin</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="multi">Multi-Asset</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
