import React from "react";
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
import { ArrowRightLeft } from "lucide-react";

interface TransferSectionProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const TransferSection: React.FC<TransferSectionProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-5 w-5 text-blue-500" />
        <h4 className="text-lg font-medium">Transfer & Compliance Rules</h4>
      </div>
      <div className="pl-7 space-y-4">
        <div className="space-y-4">
          <h5 className="font-medium">Restricted Jurisdictions</h5>
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allJurisdictions = [
                  "Cuba",
                  "North Korea",
                  "Russia",
                  "Donetsk (Ukraine)",
                  "Belarus",
                  "Venezuela",
                  "Democratic Republic of the Congo",
                  "Lebanon",
                  "Somalia",
                  "Yemen",
                  "Iran",
                  "Syria",
                  "Crimea (Ukraine)",
                  "Luhansk (Ukraine)",
                  "Myanmar (Burma)",
                  "Zimbabwe",
                  "Iraq",
                  "Libya",
                  "Sudan",
                ];
                setTokenForm((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    restrictedJurisdictions: allJurisdictions,
                  },
                }));
              }}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTokenForm((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    restrictedJurisdictions: [],
                  },
                }));
              }}
            >
              Deselect All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Cuba",
              "North Korea",
              "Russia",
              "Donetsk (Ukraine)",
              "Belarus",
              "Venezuela",
              "Democratic Republic of the Congo",
              "Lebanon",
              "Somalia",
              "Yemen",
              "Iran",
              "Syria",
              "Crimea (Ukraine)",
              "Luhansk (Ukraine)",
              "Myanmar (Burma)",
              "Zimbabwe",
              "Iraq",
              "Libya",
              "Sudan",
            ].map((jurisdiction) => (
              <div key={jurisdiction} className="flex items-center space-x-2">
                <Checkbox
                  id={`jurisdiction-${jurisdiction}`}
                  checked={(
                    tokenForm.metadata.restrictedJurisdictions || []
                  ).includes(jurisdiction)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          restrictedJurisdictions: [
                            ...(prev.metadata.restrictedJurisdictions || []),
                            jurisdiction,
                          ],
                        },
                      }));
                    } else {
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          restrictedJurisdictions: (
                            prev.metadata.restrictedJurisdictions || []
                          ).filter((j) => j !== jurisdiction),
                        },
                      }));
                    }
                  }}
                />
                <Label htmlFor={`jurisdiction-${jurisdiction}`}>
                  {jurisdiction}
                </Label>
              </div>
            ))}
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
            <Label htmlFor="transferRestrictions">Transfer Restrictions</Label>
            <p className="text-xs text-muted-foreground">
              Limit trading to KYC-verified wallets
            </p>
          </div>
        </div>

        {tokenForm.metadata.multiplePartitions && (
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
            <h5 className="font-medium">Partition Transfer Rules</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partitionTransferRestriction">
                  Partition Transfer Restriction
                </Label>
                <Select
                  value={
                    tokenForm.metadata.partitionTransferRestriction || "within"
                  }
                  onValueChange={(value) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        partitionTransferRestriction: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select restriction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="within">
                      Within Same Partition Only
                    </SelectItem>
                    <SelectItem value="controlled">
                      Controlled Cross-Partition
                    </SelectItem>
                    <SelectItem value="unrestricted">Unrestricted</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Controls how tokens can move between partitions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partitionApproval">
                  Partition Transfer Approval
                </Label>
                <Select
                  value={tokenForm.metadata.partitionApproval || "automatic"}
                  onValueChange={(value) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        partitionApproval: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approval type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual Approval</SelectItem>
                    <SelectItem value="multisig">Multi-signature</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  How transfers are approved between partitions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
