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
import { BarChart, ArrowDownUp, FileCheck } from "lucide-react";

interface FundConfigProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const FundConfig: React.FC<FundConfigProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Fund-Specific Configuration</h3>

      {/* Net Asset Value (NAV) Management */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-blue-500" />
            Net Asset Value (NAV) Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="navCalculationFrequency">
                NAV Calculation Frequency
              </Label>
              <Select
                value={tokenForm.metadata.navCalculationFrequency || "daily"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      navCalculationFrequency: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingMethod">Pricing Method</Label>
              <Select
                value={tokenForm.metadata.pricingMethod || "marketPrice"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      pricingMethod: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketPrice">Market Price</SelectItem>
                  <SelectItem value="markToModel">Mark-to-Model</SelectItem>
                  <SelectItem value="fairValue">Fair Value</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialNav">Initial NAV per Token</Label>
              <Input
                id="initialNav"
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={tokenForm.metadata.initialNav || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      initialNav: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="navOracleAddress">NAV Oracle Address</Label>
              <Input
                id="navOracleAddress"
                placeholder="0x... (optional)"
                value={tokenForm.metadata.navOracleAddress || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      navOracleAddress: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                External oracle for NAV calculation (optional)
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm">
              Update NAV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Redemption Rules */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <ArrowDownUp className="h-5 w-5 mr-2 text-green-500" />
            Subscription & Redemption Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumSubscription">
                Minimum Subscription Amount
              </Label>
              <Input
                id="minimumSubscription"
                type="number"
                min="0"
                step="0.01"
                placeholder="10000.00"
                value={tokenForm.metadata.minimumSubscription || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      minimumSubscription: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redemptionLockupPeriod">
                Redemption Lock-Up Period (Days)
              </Label>
              <Input
                id="redemptionLockupPeriod"
                type="number"
                min="0"
                placeholder="90"
                value={tokenForm.metadata.redemptionLockupPeriod || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      redemptionLockupPeriod: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redemptionFee">Redemption Fee (%)</Label>
              <Input
                id="redemptionFee"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="2.0"
                value={tokenForm.metadata.redemptionFee || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      redemptionFee: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionFee">Subscription Fee (%)</Label>
              <Input
                id="subscriptionFee"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="1.0"
                value={tokenForm.metadata.subscriptionFee || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      subscriptionFee: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redemptionFrequency">Redemption Frequency</Label>
              <Select
                value={tokenForm.metadata.redemptionFrequency || "monthly"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      redemptionFrequency: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redemptionNoticePeriod">
                Redemption Notice Period (Days)
              </Label>
              <Input
                id="redemptionNoticePeriod"
                type="number"
                min="0"
                placeholder="30"
                value={tokenForm.metadata.redemptionNoticePeriod || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      redemptionNoticePeriod: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fund Type & Compliance */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <FileCheck className="h-5 w-5 mr-2 text-amber-500" />
            Fund Type & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fundStructure">Fund Structure</Label>
              <Select
                value={tokenForm.metadata.fundStructure || "openEnd"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      fundStructure: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fund structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openEnd">Open-End Fund</SelectItem>
                  <SelectItem value="closedEnd">Closed-End Fund</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="interval">Interval Fund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fundCategory">Fund Category</Label>
              <Select
                value={tokenForm.metadata.fundCategory || "equity"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      fundCategory: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fund category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="fixedIncome">Fixed Income</SelectItem>
                  <SelectItem value="balanced">Balanced/Hybrid</SelectItem>
                  <SelectItem value="moneyMarket">Money Market</SelectItem>
                  <SelectItem value="alternative">Alternative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="institutionalOnly"
                checked={tokenForm.metadata.institutionalOnly || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      institutionalOnly: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="institutionalOnly">
                  Institutional Investors Only
                </Label>
                <p className="text-xs text-muted-foreground">
                  Restrict to institutional investors
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accreditedOnly"
                checked={tokenForm.metadata.accreditedOnly || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      accreditedOnly: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="accreditedOnly">
                  Accredited Investors Only
                </Label>
                <p className="text-xs text-muted-foreground">
                  Restrict to accredited investors
                </p>
              </div>
            </div>

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
