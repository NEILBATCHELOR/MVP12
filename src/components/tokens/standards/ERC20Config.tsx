import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Coins,
  ChevronDown,
  ChevronUp,
  Banknote,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

interface ERC20ConfigProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
}

const ERC20Config: React.FC<ERC20ConfigProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
}) => {
  // State for panel collapse
  const [panels, setPanels] = useState({
    tokenDefinition: true,
    supplyManagement: false,
    transferAllowance: false,
    pricing: false,
    accessControl: false,
  });

  const togglePanel = (panel: string) => {
    setPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-medium">ERC-20 Token Configuration</h3>
      {/* 1️⃣ Token Definition Panel */}
      <Card className="border border-gray-200">
        <CardHeader
          className={`flex flex-row cursor-pointer pb-4 justify-between items-center`}
          onClick={() => togglePanel("tokenDefinition")}
        >
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <CardTitle className="text-md">Token Definition</CardTitle>
          </div>
          {panels.tokenDefinition ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>

        {panels.tokenDefinition && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name*</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., MyToken"
                  value={tokenForm.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Token Symbol*</Label>
                <Input
                  id="symbol"
                  name="symbol"
                  placeholder="e.g., MTK"
                  value={tokenForm.symbol}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  name="decimals"
                  type="number"
                  min="0"
                  max="18"
                  placeholder="18"
                  value={tokenForm.decimals}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSupply">Total Supply*</Label>
                <Input
                  id="totalSupply"
                  name="totalSupply"
                  type="number"
                  min="1"
                  placeholder="1000000"
                  value={tokenForm.totalSupply}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      totalSupply: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="capSupply"
                  checked={tokenForm.metadata.capSupply || false}
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        capSupply: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="capSupply">Cap Supply</Label>
                  <p className="text-xs text-muted-foreground">
                    Limit the maximum token supply
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mintable"
                  checked={tokenForm.metadata.mintable || false}
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        mintable: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="mintable">Mintable</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow creation of new tokens
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="burnable"
                  checked={tokenForm.metadata.burnable || false}
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        burnable: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="burnable">Burnable</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow tokens to be destroyed
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerAddress">Owner Address (ETH Wallet)</Label>
                <Input
                  id="ownerAddress"
                  placeholder="0x..."
                  value={tokenForm.metadata.ownerAddress || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        ownerAddress: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      {/* 2️⃣ Token Supply Management Panel */}
      <Card className="border border-gray-200">
        <CardHeader
          className={`flex flex-row items-center justify-between cursor-pointer pb-4`}
          onClick={() => togglePanel("supplyManagement")}
        >
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-500" />
            <CardTitle className="text-md">Token Supply Management</CardTitle>
          </div>
          {panels.supplyManagement ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>

        {panels.supplyManagement && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 border rounded-md">
                <h4 className="font-medium">Mint Tokens</h4>
                <div className="space-y-2">
                  <Label htmlFor="mintAmount">Amount to Mint</Label>
                  <Input
                    id="mintAmount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={tokenForm.metadata.mintAmount || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          mintAmount: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mintRecipient">Recipient Address</Label>
                  <Input
                    id="mintRecipient"
                    placeholder="0x..."
                    value={tokenForm.metadata.mintRecipient || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          mintRecipient: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <Button className="w-full">Mint Tokens</Button>
              </div>

              <div className="space-y-4 p-4 border rounded-md">
                <h4 className="font-medium">Burn Tokens</h4>
                <div className="space-y-2">
                  <Label htmlFor="burnAmount">Amount to Burn</Label>
                  <Input
                    id="burnAmount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={tokenForm.metadata.burnAmount || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          burnAmount: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burnTarget">Target Address (Optional)</Label>
                  <Input
                    id="burnTarget"
                    placeholder="0x... (leave empty for own tokens)"
                    value={tokenForm.metadata.burnTarget || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          burnTarget: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <Button variant="destructive" className="w-full">
                  Burn Tokens
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      {/* 3️⃣ Transfer & Allowance Panel */}
      <Card className="border border-gray-200">
        <CardHeader
          className={`flex flex-row items-center justify-between cursor-pointer pb-4`}
          onClick={() => togglePanel("transferAllowance")}
        >
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-md">Transfer & Allowance</CardTitle>
          </div>
          {panels.transferAllowance ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>

        {panels.transferAllowance && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 border rounded-md">
                <h4 className="font-medium">Transfer Tokens</h4>
                <div className="space-y-2">
                  <Label htmlFor="senderAddress">Sender Address</Label>
                  <Input
                    id="senderAddress"
                    placeholder="0x..."
                    value={tokenForm.metadata.senderAddress || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          senderAddress: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientAddress">Recipient Address</Label>
                  <Input
                    id="recipientAddress"
                    placeholder="0x..."
                    value={tokenForm.metadata.recipientAddress || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          recipientAddress: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferAmount">Amount to Transfer</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={tokenForm.metadata.transferAmount || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          transferAmount: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <Button className="w-full">Transfer</Button>
              </div>

              <div className="space-y-4 p-4 border rounded-md">
                <h4 className="font-medium">Allowance Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="approveAmount">Approve Spending Amount</Label>
                  <Input
                    id="approveAmount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={tokenForm.metadata.approveAmount || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          approveAmount: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spenderAddress">Spender Address</Label>
                  <Input
                    id="spenderAddress"
                    placeholder="0x..."
                    value={tokenForm.metadata.spenderAddress || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          spenderAddress: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="maxAllowance"
                    checked={tokenForm.metadata.maxAllowance || false}
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          maxAllowance: !!checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="maxAllowance">Max Allowance?</Label>
                </div>
                <Button variant="outline" className="w-full">
                  Approve Spending
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      {/* 4️⃣ Pricing & Oracle Integration Panel */}
      <Card className="border border-gray-200">
        <CardHeader
          className={`flex flex-row items-center justify-between cursor-pointer pb-4`}
          onClick={() => togglePanel("pricing")}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-md">
              Pricing & Oracle Integration
            </CardTitle>
          </div>
          {panels.pricing ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>

        {panels.pricing && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Price Source</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="manualPrice"
                      checked={tokenForm.metadata.priceSource === "manual"}
                      onCheckedChange={(checked) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            priceSource: checked
                              ? "manual"
                              : prev.metadata.priceSource,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="manualPrice">Manual Entry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="chainlinkOracle"
                      checked={tokenForm.metadata.priceSource === "chainlink"}
                      onCheckedChange={(checked) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            priceSource: checked
                              ? "chainlink"
                              : prev.metadata.priceSource,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="chainlinkOracle">Chainlink Oracle</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customAPI"
                      checked={tokenForm.metadata.priceSource === "api"}
                      onCheckedChange={(checked) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            priceSource: checked
                              ? "api"
                              : prev.metadata.priceSource,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="customAPI">Custom API</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPrice">Current Price ($)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="0.00"
                    value={tokenForm.metadata.currentPrice || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          currentPrice: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Price Update Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="priceUpdateFrequency">
                    Price Update Frequency
                  </Label>
                  <select
                    id="priceUpdateFrequency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={tokenForm.metadata.priceUpdateFrequency || "daily"}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          priceUpdateFrequency: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oracleAddress">
                    Oracle Address (if applicable)
                  </Label>
                  <Input
                    id="oracleAddress"
                    placeholder="0x..."
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
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline">Fetch from Oracle</Button>
                  <Button>Update Price Manually</Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      {/* 5️⃣ Access Control & Ownership Panel */}
      <Card className="border border-gray-200">
        <CardHeader
          className={`flex flex-row items-center justify-between cursor-pointer pb-4`}
          onClick={() => togglePanel("accessControl")}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-md">
              Access Control & Ownership
            </CardTitle>
          </div>
          {panels.accessControl ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>

        {panels.accessControl && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Owner</Label>
                  <div className="p-2 bg-muted rounded-md font-mono text-sm">
                    {tokenForm.metadata.ownerAddress ||
                      "0x0000000000000000000000000000000000000000"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newOwnerAddress">Transfer Ownership</Label>
                  <Input
                    id="newOwnerAddress"
                    placeholder="New owner address"
                    value={tokenForm.metadata.newOwnerAddress || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          newOwnerAddress: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <Button variant="outline">Transfer Ownership</Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pauseTransfers"
                    checked={tokenForm.metadata.pauseTransfers || false}
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          pauseTransfers: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="pauseTransfers">Pause Transfers?</Label>
                    <p className="text-xs text-muted-foreground">
                      Temporarily disable all token transfers
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="blacklistAddress">Blacklist Address</Label>
                  <Input
                    id="blacklistAddress"
                    placeholder="Address to blacklist"
                    value={tokenForm.metadata.blacklistAddress || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          blacklistAddress: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive">Blacklist Address</Button>
                  <Button variant="outline">Pause Transfers</Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ERC20Config;
