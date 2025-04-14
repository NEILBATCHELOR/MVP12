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
import { Calendar, Percent, Shield, DollarSign } from "lucide-react";

interface DebtConfigProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const DebtConfig: React.FC<DebtConfigProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Debt-Specific Configuration</h3>

      {/* Bond Issuance & Maturity Management */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Bond Issuance & Maturity Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maturityDate">Maturity Date*</Label>
              <Input
                id="maturityDate"
                type="date"
                value={tokenForm.metadata.maturityDate || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      maturityDate: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="couponRate">Coupon Rate (%)*</Label>
              <Input
                id="couponRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="5.0"
                value={tokenForm.metadata.couponRate || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      couponRate: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateType">Rate Type</Label>
              <Select
                value={tokenForm.metadata.rateType || "fixed"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      rateType: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Rate</SelectItem>
                  <SelectItem value="floating">Floating Rate</SelectItem>
                  <SelectItem value="zero">Zero Coupon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tokenForm.metadata.rateType === "floating" && (
              <div className="space-y-2">
                <Label htmlFor="referenceRate">Reference Rate</Label>
                <Select
                  value={tokenForm.metadata.referenceRate || "libor"}
                  onValueChange={(value) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        referenceRate: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="libor">LIBOR</SelectItem>
                    <SelectItem value="sofr">SOFR</SelectItem>
                    <SelectItem value="euribor">EURIBOR</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="callable"
                checked={tokenForm.metadata.callable || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      callable: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="callable">Callable</Label>
                <p className="text-xs text-muted-foreground">
                  Can issuer redeem early?
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="convertible"
                checked={tokenForm.metadata.convertible || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      convertible: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="convertible">Convertible</Label>
                <p className="text-xs text-muted-foreground">
                  Can be converted into equity?
                </p>
              </div>
            </div>

            {tokenForm.metadata.convertible && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="conversionRatio">Conversion Ratio</Label>
                <Input
                  id="conversionRatio"
                  placeholder="e.g., 10:1"
                  value={tokenForm.metadata.conversionRatio || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        conversionRatio: e.target.value,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of equity tokens received per debt token
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debt Hierarchy & Security Level */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-500" />
            Debt Hierarchy & Security Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debtHierarchy">Debt Hierarchy</Label>
              <Select
                value={tokenForm.metadata.debtHierarchy || "senior"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      debtHierarchy: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hierarchy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="subordinated">Subordinated</SelectItem>
                  <SelectItem value="mezzanine">Mezzanine</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="secured"
                checked={tokenForm.metadata.secured || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      secured: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="secured">Secured</Label>
                <p className="text-xs text-muted-foreground">
                  Linked to collateral?
                </p>
              </div>
            </div>

            {tokenForm.metadata.secured && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="collateralAddress">Collateral Address</Label>
                <Input
                  id="collateralAddress"
                  placeholder="0x... (on-chain reference)"
                  value={tokenForm.metadata.collateralAddress || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        collateralAddress: e.target.value,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  On-chain reference to collateral
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment & Interest Distribution */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-amber-500" />
            Payment & Interest Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentSchedule">Payment Schedule</Label>
              <Select
                value={tokenForm.metadata.paymentSchedule || "semiannual"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      paymentSchedule: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semiannual">Semi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="maturity">At Maturity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
              <Input
                id="nextPaymentDate"
                type="date"
                value={tokenForm.metadata.nextPaymentDate || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      nextPaymentDate: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoRollover"
                checked={tokenForm.metadata.autoRollover || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      autoRollover: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="autoRollover">Auto-Roll Over Principal</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically reinvest principal at maturity
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="defaultProtection"
                checked={tokenForm.metadata.defaultProtection || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      defaultProtection: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="defaultProtection">Default Protection</Label>
                <p className="text-xs text-muted-foreground">
                  Enable protection mechanisms against default
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm">
              Schedule Interest Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
