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
import { Vote, DollarSign, Building } from "lucide-react";

interface EquityConfigProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const EquityConfig: React.FC<EquityConfigProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Equity-Specific Configuration</h3>

      {/* Voting Rights Management */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Vote className="h-5 w-5 mr-2 text-blue-500" />
            Voting Rights Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableVotingRights"
              checked={tokenForm.metadata.enableVotingRights || false}
              onCheckedChange={(checked) =>
                setTokenForm((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    enableVotingRights: !!checked,
                  },
                }))
              }
            />
            <div>
              <Label htmlFor="enableVotingRights">Enable Voting Rights</Label>
              <p className="text-xs text-muted-foreground">
                Allow token holders to participate in governance decisions
              </p>
            </div>
          </div>

          {tokenForm.metadata.enableVotingRights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="votingWeight">Voting Weight</Label>
                <Select
                  value={tokenForm.metadata.votingWeight || "equal"}
                  onValueChange={(value) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        votingWeight: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voting weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">1 Vote Per Token</SelectItem>
                    <SelectItem value="proportional">
                      Proportional Voting
                    </SelectItem>
                    <SelectItem value="quadratic">Quadratic Voting</SelectItem>
                    <SelectItem value="custom">Custom Weighting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxyVoting">Proxy Voting</Label>
                <Input
                  id="proxyVoting"
                  placeholder="Proxy address (0x...)"
                  value={tokenForm.metadata.proxyVotingAddress || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        proxyVotingAddress: e.target.value,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Assign a proxy for voting
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="votingThreshold">Voting Threshold (%)</Label>
                <Input
                  id="votingThreshold"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="51"
                  value={tokenForm.metadata.votingThreshold || "51"}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        votingThreshold: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="votingPeriod">Voting Period (Days)</Label>
                <Input
                  id="votingPeriod"
                  type="number"
                  min="1"
                  placeholder="7"
                  value={tokenForm.metadata.votingPeriod || "7"}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        votingPeriod: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dividend & Distribution Settings */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Dividend & Distribution Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableDividends"
              checked={tokenForm.metadata.enableDividends || false}
              onCheckedChange={(checked) =>
                setTokenForm((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    enableDividends: !!checked,
                  },
                }))
              }
            />
            <div>
              <Label htmlFor="enableDividends">
                Enable Dividend Eligibility
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow token holders to receive dividends
              </p>
            </div>
          </div>

          {tokenForm.metadata.enableDividends && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="dividendType">Dividend Type</Label>
                <Select
                  value={tokenForm.metadata.dividendType || "fixed"}
                  onValueChange={(value) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        dividendType: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dividend type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                    <SelectItem value="performance">
                      Performance-Based
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distributionFrequency">
                  Distribution Frequency
                </Label>
                <Select
                  value={
                    tokenForm.metadata.distributionFrequency || "quarterly"
                  }
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
                    <SelectItem value="semiannual">Semi-Annually</SelectItem>
                    <SelectItem value="annual">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dividendRate">
                  Dividend Rate (% or Fixed Amount)
                </Label>
                <Input
                  id="dividendRate"
                  placeholder="e.g., 5.0"
                  value={tokenForm.metadata.dividendRate || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        dividendRate: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dividendPaymentAddress">
                  Dividend Payment Address
                </Label>
                <Input
                  id="dividendPaymentAddress"
                  placeholder="0x... (for off-chain payments)"
                  value={tokenForm.metadata.dividendPaymentAddress || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        dividendPaymentAddress: e.target.value,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Optional: For off-chain payments
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Corporate Actions Management */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Building className="h-5 w-5 mr-2 text-purple-500" />
            Corporate Actions Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="corporateAction">Corporate Action Type</Label>
              <Select
                value={tokenForm.metadata.corporateActionType || ""}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      corporateActionType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stockSplit">Stock Split</SelectItem>
                  <SelectItem value="buyback">Buyback</SelectItem>
                  <SelectItem value="merger">Merger</SelectItem>
                  <SelectItem value="issuanceRights">
                    Issuance Rights
                  </SelectItem>
                  <SelectItem value="spinOff">Spin-Off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionRatio">Ratio/Rate</Label>
              <Input
                id="actionRatio"
                placeholder="e.g., 2:1 for split"
                value={tokenForm.metadata.corporateActionRatio || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      corporateActionRatio: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Format depends on action type (e.g., 2:1 for split)
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!tokenForm.metadata.corporateActionType}
            >
              Configure Corporate Action
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
