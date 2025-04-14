import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Settings, Users } from "lucide-react";

interface OtherConfigProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const OtherConfig: React.FC<OtherConfigProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Custom Security Configuration</h3>

      {/* Custom Regulatory Framework */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Custom Regulatory Framework
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customSecurityType">Custom Security Type*</Label>
              <Input
                id="customSecurityType"
                placeholder="e.g., Carbon Credit, Insurance-Linked Security"
                value={tokenForm.metadata.customSecurityType || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customSecurityType: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceFramework">Compliance Framework</Label>
              <Select
                value={tokenForm.metadata.complianceFramework || "custom"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      complianceFramework: value,
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mifid">MiFID II</SelectItem>
                  <SelectItem value="regD">SEC Reg D</SelectItem>
                  <SelectItem value="regA">SEC Reg A+</SelectItem>
                  <SelectItem value="regS">SEC Reg S</SelectItem>
                  <SelectItem value="custom">Custom Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tokenForm.metadata.complianceFramework === "custom" && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="customFrameworkDescription">
                  Custom Framework Description
                </Label>
                <Textarea
                  id="customFrameworkDescription"
                  placeholder="Describe your custom regulatory framework..."
                  value={tokenForm.metadata.customFrameworkDescription || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        customFrameworkDescription: e.target.value,
                      },
                    }))
                  }
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="jurisdictionalRules">
                Custom Jurisdictional Rules
              </Label>
              <Textarea
                id="jurisdictionalRules"
                placeholder="Enter specific jurisdictional rules..."
                value={tokenForm.metadata.jurisdictionalRules || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      jurisdictionalRules: e.target.value,
                    },
                  }))
                }
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bespoke Features */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Settings className="h-5 w-5 mr-2 text-green-500" />
            Bespoke Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customFeature1">Custom Feature 1</Label>
              <Input
                id="customFeature1"
                placeholder="e.g., Redemption Mechanism"
                value={tokenForm.metadata.customFeature1 || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customFeature1: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customFeature1Value">Feature 1 Value</Label>
              <Input
                id="customFeature1Value"
                placeholder="e.g., Quarterly"
                value={tokenForm.metadata.customFeature1Value || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customFeature1Value: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customFeature2">Custom Feature 2</Label>
              <Input
                id="customFeature2"
                placeholder="e.g., Voting Rights"
                value={tokenForm.metadata.customFeature2 || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customFeature2: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customFeature2Value">Feature 2 Value</Label>
              <Input
                id="customFeature2Value"
                placeholder="e.g., Yes"
                value={tokenForm.metadata.customFeature2Value || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customFeature2Value: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="additionalFeatures">
                Additional Custom Features
              </Label>
              <Textarea
                id="additionalFeatures"
                placeholder="Describe any additional custom features..."
                value={tokenForm.metadata.additionalFeatures || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      additionalFeatures: e.target.value,
                    },
                  }))
                }
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Investor Restrictions */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <Users className="h-5 w-5 mr-2 text-amber-500" />
            Custom Investor Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customKycRequired"
                checked={tokenForm.metadata.customKycRequired || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customKycRequired: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="customKycRequired">Custom KYC Required</Label>
                <p className="text-xs text-muted-foreground">
                  Require custom KYC verification
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="customAccreditationRequired"
                checked={
                  tokenForm.metadata.customAccreditationRequired || false
                }
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customAccreditationRequired: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="customAccreditationRequired">
                  Custom Accreditation Required
                </Label>
                <p className="text-xs text-muted-foreground">
                  Require custom investor accreditation
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMinimumInvestment">
                Custom Minimum Investment
              </Label>
              <Input
                id="customMinimumInvestment"
                type="number"
                min="0"
                step="0.01"
                placeholder="10000.00"
                value={tokenForm.metadata.customMinimumInvestment || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customMinimumInvestment: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMaxInvestors">
                Maximum Number of Investors
              </Label>
              <Input
                id="customMaxInvestors"
                type="number"
                min="0"
                placeholder="100"
                value={tokenForm.metadata.customMaxInvestors || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customMaxInvestors: e.target.value,
                    },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                0 for unlimited investors
              </p>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="customInvestorRestrictions">
                Additional Investor Restrictions
              </Label>
              <Textarea
                id="customInvestorRestrictions"
                placeholder="Describe any additional investor restrictions..."
                value={tokenForm.metadata.customInvestorRestrictions || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customInvestorRestrictions: e.target.value,
                    },
                  }))
                }
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
