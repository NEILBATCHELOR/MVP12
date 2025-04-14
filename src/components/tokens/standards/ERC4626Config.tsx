import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ERC4626NAVPanel from "./ERC4626NAVPanel";

interface ERC4626ConfigProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
}

const ERC4626Config: React.FC<ERC4626ConfigProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
}) => {
  const [activeTab, setActiveTab] = useState("vault-setup");

  // Sample performance data for the chart
  const performanceData = [
    { date: "2025-03-14", tvl: 1200000, apy: 7.8, sharePrice: 1.01 },
    { date: "2025-03-15", tvl: 1250000, apy: 7.9, sharePrice: 1.02 },
    { date: "2025-03-16", tvl: 1300000, apy: 8.0, sharePrice: 1.03 },
    { date: "2025-03-17", tvl: 1400000, apy: 8.2, sharePrice: 1.04 },
    { date: "2025-03-18", tvl: 1450000, apy: 8.3, sharePrice: 1.04 },
    { date: "2025-03-19", tvl: 1500000, apy: 8.5, sharePrice: 1.05 },
  ];

  // Initialize totalShares if not present
  if (!tokenForm.metadata.totalShares) {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        totalShares: "1000",
        estimatedApy: "5.2",
      },
    }));
  }

  return (
    <div className="space-y-6 border-t pt-6 bg-white">
      <h3 className="text-lg font-medium">
        ERC-4626 Tokenized Vault Configuration
      </h3>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="vault-setup">Vault Setup</TabsTrigger>
          <TabsTrigger value="deposit-withdraw">Deposit & Withdraw</TabsTrigger>
          <TabsTrigger value="pricing-oracle">Pricing & Oracle</TabsTrigger>
          <TabsTrigger value="nav-panel">NAV Panel</TabsTrigger>
          <TabsTrigger value="transfer-approval">
            Transfer & Approval
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="fees">Fees & Rewards</TabsTrigger>
        </TabsList>

        {/* 1. Vault Setup Panel */}
        <TabsContent value="vault-setup">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-md">Vault Definition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Vault Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Yield Vault"
                    value={tokenForm.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol*</Label>
                  <Input
                    id="symbol"
                    name="symbol"
                    placeholder="e.g., yVAULT"
                    value={tokenForm.symbol}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="underlyingAsset">Underlying Asset*</Label>
                  <Select
                    value={tokenForm.metadata.underlyingAsset || ""}
                    onValueChange={(value) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          underlyingAsset: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="DAI">DAI</SelectItem>
                      <SelectItem value="WBTC">WBTC</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    min="0"
                    max="18"
                    placeholder="18"
                    value={tokenForm.metadata.decimals || "18"}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          decimals: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAssets">Total Assets</Label>
                  <Input
                    id="totalAssets"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={tokenForm.metadata.totalAssets || "0"}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          totalAssets: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerAddress">
                    Owner Address (ETH Wallet)
                  </Label>
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
                <div className="space-y-2">
                  <Label htmlFor="yieldStrategy">Yield Strategy*</Label>
                  <Select
                    value={tokenForm.metadata.yieldStrategy || ""}
                    onValueChange={(value) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          yieldStrategy: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LENDING">Lending</SelectItem>
                      <SelectItem value="STAKING">Staking</SelectItem>
                      <SelectItem value="LIQUIDITY">
                        Liquidity Provision
                      </SelectItem>
                      <SelectItem value="YIELD_FARMING">
                        Yield Farming
                      </SelectItem>
                      <SelectItem value="ARBITRAGE">Arbitrage</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Deposit & Withdraw Panel */}
        <TabsContent value="deposit-withdraw">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-md">Deposit Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="depositAmount">Deposit Amount</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      min="0"
                      placeholder="0.0"
                      value={tokenForm.metadata.depositAmount || ""}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            depositAmount: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depositRecipient">
                      Recipient Address (Optional)
                    </Label>
                    <Input
                      id="depositRecipient"
                      placeholder="0x..."
                      value={tokenForm.metadata.depositRecipient || ""}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            depositRecipient: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="pt-2">
                    <Button className="w-full">Deposit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-md">Withdraw Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawAmount">Withdraw Amount</Label>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      min="0"
                      placeholder="0.0"
                      value={tokenForm.metadata.withdrawAmount || ""}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            withdrawAmount: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="maxWithdrawal"
                      checked={tokenForm.metadata.maxWithdrawal || false}
                      onCheckedChange={(checked) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            maxWithdrawal: !!checked,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="maxWithdrawal">Max Withdrawal</Label>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full">Withdraw</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-gray-200 mt-6">
            <CardHeader>
              <CardTitle className="text-md">Vault Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deposit"
                    checked={tokenForm.metadata.deposit !== false} // Default to true
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          deposit: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="deposit">Deposit</Label>
                    <p className="text-xs text-muted-foreground">
                      Deposit assets into vault
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="withdraw"
                    checked={tokenForm.metadata.withdraw !== false} // Default to true
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          withdraw: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="withdraw">Withdraw</Label>
                    <p className="text-xs text-muted-foreground">
                      Withdraw from vault
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="convertToShares"
                    checked={tokenForm.metadata.convertToShares !== false} // Default to true
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          convertToShares: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="convertToShares">Convert to Shares</Label>
                    <p className="text-xs text-muted-foreground">
                      Convert deposits to vault shares
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="convertToAssets"
                    checked={tokenForm.metadata.convertToAssets !== false} // Default to true
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          convertToAssets: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="convertToAssets">Convert to Assets</Label>
                    <p className="text-xs text-muted-foreground">
                      Convert shares to underlying assets
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maxWithdraw"
                    checked={tokenForm.metadata.maxWithdraw !== false} // Default to true
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          maxWithdraw: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="maxWithdraw">Max Withdraw</Label>
                    <p className="text-xs text-muted-foreground">
                      Get max allowable withdrawal
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Pricing & Oracle Panel */}
        <TabsContent value="pricing-oracle">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-md">Share Price Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Share Price Calculation Method</Label>
                  <Select
                    value={tokenForm.metadata.sharePriceMethod || "MANUAL"}
                    onValueChange={(value) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          sharePriceMethod: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual Entry</SelectItem>
                      <SelectItem value="CHAINLINK">
                        Chainlink Oracle
                      </SelectItem>
                      <SelectItem value="CUSTOM">Custom Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSharePrice">
                    Current Share Price ($)
                  </Label>
                  <Input
                    id="currentSharePrice"
                    type="number"
                    min="0"
                    step="0.0001"
                    placeholder="1.0"
                    value={tokenForm.metadata.currentSharePrice || "1.0"}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          currentSharePrice: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>APY Calculation Source</Label>
                  <Select
                    value={tokenForm.metadata.apySource || "ON_CHAIN"}
                    onValueChange={(value) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          apySource: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON_CHAIN">
                        On-Chain Yield (Strategy-Based)
                      </SelectItem>
                      <SelectItem value="OFF_CHAIN">Off-Chain API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="navOracleEnabled"
                    checked={tokenForm.metadata.navOracleEnabled || false}
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          navOracleEnabled: !!checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="navOracleEnabled">
                    Enable Oracle-based NAV Calculation
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  When enabled, NAV will be calculated automatically using price
                  oracles. Otherwise, NAV will be updated manually by the fund
                  manager.
                </p>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline">Fetch from Oracle</Button>
                  <Button>Update Share Price</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NAV Panel */}
        <TabsContent value="nav-panel">
          <ERC4626NAVPanel tokenForm={tokenForm} setTokenForm={setTokenForm} />
        </TabsContent>

        {/* 4. Transfer & Approval Panel */}
        <TabsContent value="transfer-approval">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-md">Transfer Vault Shares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                      min="0"
                      placeholder="0.0"
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
                  <div className="pt-2">
                    <Button className="w-full">Transfer Vault Shares</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-md">Approval Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="approvalAddress">Approve for Address</Label>
                    <Input
                      id="approvalAddress"
                      placeholder="0x..."
                      value={tokenForm.metadata.approvalAddress || ""}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            approvalAddress: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvalAmount">Approval Amount</Label>
                    <Input
                      id="approvalAmount"
                      type="number"
                      min="0"
                      placeholder="0.0"
                      value={tokenForm.metadata.approvalAmount || ""}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            approvalAmount: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
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
                    <Label htmlFor="maxAllowance">Max Allowance</Label>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full">Approve Spending</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-gray-200 mt-6">
            <CardHeader>
              <CardTitle className="text-md">Token Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pausable"
                    checked={tokenForm.metadata.pausable || false}
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          pausable: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="pausable">Pausable</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable emergency stop functionality
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transferRestrictions"
                    checked={tokenForm.metadata.transferRestrictions || false}
                    onCheckedChange={(checked) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          transferRestrictions: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="transferRestrictions">
                      Transfer Restrictions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Limit transfers based on rules
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Performance & Yield Panel */}
        <TabsContent value="performance">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-md">Vault Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Total Value Locked (TVL)
                  </p>
                  <p className="text-2xl font-bold">$1,500,000</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Current APY</p>
                  <p className="text-2xl font-bold">8.5%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Current Share Price</p>
                  <p className="text-2xl font-bold">$1.05</p>
                </div>
              </div>

              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="tvl"
                      name="TVL ($)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="apy"
                      name="APY (%)"
                      stroke="#82ca9d"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sharePrice"
                      name="Share Price ($)"
                      stroke="#ffc658"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left border">Date</th>
                      <th className="p-2 text-left border">TVL ($)</th>
                      <th className="p-2 text-left border">APY (%)</th>
                      <th className="p-2 text-left border">Share Price ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="p-2 border">{item.date}</td>
                          <td className="p-2 border">
                            {item.tvl.toLocaleString()}
                          </td>
                          <td className="p-2 border">{item.apy.toFixed(1)}%</td>
                          <td className="p-2 border">
                            ${item.sharePrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline">View Full History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Fees & Rewards Panel */}
        <TabsContent value="fees">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-md">Fee Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="managementFee">Management Fee (%)</Label>
                  <Input
                    id="managementFee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="2.0"
                    value={tokenForm.metadata.managementFee || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          managementFee: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performanceFee">Performance Fee (%)</Label>
                  <Input
                    id="performanceFee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="20.0"
                    value={tokenForm.metadata.performanceFee || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          performanceFee: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeReceiverAddress">
                    Fee Receiver Address
                  </Label>
                  <Input
                    id="feeReceiverAddress"
                    placeholder="0x..."
                    value={tokenForm.metadata.feeReceiverAddress || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          feeReceiverAddress: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeFrequency">Fee Collection Frequency</Label>
                  <Select
                    value={tokenForm.metadata.feeFrequency || "MONTHLY"}
                    onValueChange={(value) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          feeFrequency: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="ANNUALLY">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Fund Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="min-deposit">Minimum Deposit</Label>
                    <Input
                      id="min-deposit"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={tokenForm.metadata.minDeposit || ""}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            minDeposit: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-deposit">Maximum Deposit</Label>
                    <Input
                      id="max-deposit"
                      type="number"
                      min="0"
                      placeholder="No limit"
                      value={tokenForm.metadata.maxDeposit || ""}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            maxDeposit: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redemption-notice">
                      Redemption Notice Period (Days)
                    </Label>
                    <Input
                      id="redemption-notice"
                      type="number"
                      min="0"
                      placeholder="30"
                      value={tokenForm.metadata.redemptionNoticeDays || "30"}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            redemptionNoticeDays: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="erc20-conversion">
                      ERC-20 Conversion Rate
                    </Label>
                    <Input
                      id="erc20-conversion"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1.0"
                      value={tokenForm.metadata.erc20ConversionRate || "1.0"}
                      onChange={(e) =>
                        setTokenForm((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            erc20ConversionRate: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button>Set Fees</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ERC4626Config;
