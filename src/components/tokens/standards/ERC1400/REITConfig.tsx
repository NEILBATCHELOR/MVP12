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
import { Building2, DollarSign, Users } from "lucide-react";

interface REITConfigProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const REITConfig: React.FC<REITConfigProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">REIT-Specific Configuration</h3>

      {/* Property & Asset Tracking */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-500" />
            Property & Asset Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyRegistryAddress">
                On-Chain Property Registry Address
              </Label>
              <Input
                id="propertyRegistryAddress"
                placeholder="0x..."
                value={tokenForm.metadata.propertyRegistryAddress || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      propertyRegistryAddress: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Smart contract address for property registry
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Select
                value={tokenForm.metadata.assetType || "residential"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      assetType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="mixed">Mixed-Use</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedYield">Expected Yield (%)</Label>
              <Input
                id="expectedYield"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="6.5"
                value={tokenForm.metadata.expectedYield || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      expectedYield: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyCount">Number of Properties</Label>
              <Input
                id="propertyCount"
                type="number"
                min="1"
                placeholder="10"
                value={tokenForm.metadata.propertyCount || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      propertyCount: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSquareFootage">Total Square Footage</Label>
              <Input
                id="totalSquareFootage"
                type="number"
                min="0"
                placeholder="100000"
                value={tokenForm.metadata.totalSquareFootage || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      totalSquareFootage: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupancyRate">Occupancy Rate (%)</Label>
              <Input
                id="occupancyRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="95.0"
                value={tokenForm.metadata.occupancyRate || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      occupancyRate: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dividend & Rental Income Distribution */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Dividend & Rental Income Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentalIncomeDistributionMethod">
                Rental Income Distribution Method
              </Label>
              <Select
                value={
                  tokenForm.metadata.rentalIncomeDistributionMethod || "fixed"
                }
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      rentalIncomeDistributionMethod: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select distribution method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Percentage</SelectItem>
                  <SelectItem value="navBased">NAV-Based</SelectItem>
                  <SelectItem value="performance">Performance-Based</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distributionFrequency">
                Distribution Frequency
              </Label>
              <Select
                value={tokenForm.metadata.distributionFrequency || "quarterly"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      distributionFrequency: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semiannual">Semi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dividendYield">Target Dividend Yield (%)</Label>
              <Input
                id="dividendYield"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="5.0"
                value={tokenForm.metadata.dividendYield || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      dividendYield: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDistributionDate">
                Next Distribution Date
              </Label>
              <Input
                id="nextDistributionDate"
                type="date"
                value={tokenForm.metadata.nextDistributionDate || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      nextDistributionDate: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm">
              Distribute REIT Dividends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Investor Restrictions */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Users className="h-5 w-5 mr-2 text-amber-500" />
            Investor Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="usReitRulesCompliance"
                checked={tokenForm.metadata.usReitRulesCompliance || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      usReitRulesCompliance: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="usReitRulesCompliance">
                  US REIT Rules Compliance
                </Label>
                <p className="text-xs text-muted-foreground">
                  90% of income must be distributed
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxOwnershipPerInvestor">
                Maximum Ownership Per Investor (%)
              </Label>
              <Select
                value={tokenForm.metadata.maxOwnershipPerInvestor || "10"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      maxOwnershipPerInvestor: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tokenForm.metadata.maxOwnershipPerInvestor === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customMaxOwnership">
                  Custom Maximum Ownership (%)
                </Label>
                <Input
                  id="customMaxOwnership"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="12.5"
                  value={tokenForm.metadata.customMaxOwnership || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        customMaxOwnership: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            )}

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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="minimumHoldingPeriod"
                checked={tokenForm.metadata.minimumHoldingPeriod || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      minimumHoldingPeriod: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="minimumHoldingPeriod">
                  Minimum Holding Period
                </Label>
                <p className="text-xs text-muted-foreground">
                  Require minimum holding period
                </p>
              </div>
            </div>

            {tokenForm.metadata.minimumHoldingPeriod && (
              <div className="space-y-2">
                <Label htmlFor="holdingPeriodDays">Holding Period (Days)</Label>
                <Input
                  id="holdingPeriodDays"
                  type="number"
                  min="1"
                  placeholder="180"
                  value={tokenForm.metadata.holdingPeriodDays || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        holdingPeriodDays: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
