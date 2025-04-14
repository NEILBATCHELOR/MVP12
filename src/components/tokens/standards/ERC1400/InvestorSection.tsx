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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";

interface Partition {
  id: string;
  name: string;
}

interface InvestorEligibility {
  address: string;
  eligiblePartitions: string[];
  kycStatus: string;
  investorType: string;
}

interface InvestorSectionProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const InvestorSection: React.FC<InvestorSectionProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  const [newInvestor, setNewInvestor] = React.useState<
    Partial<InvestorEligibility>
  >({
    address: "",
    eligiblePartitions: [],
    kycStatus: "pending",
    investorType: "retail",
  });

  const handleAddInvestor = () => {
    if (!newInvestor.address) return;

    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        investorEligibility: [
          ...(prev.metadata.investorEligibility || []),
          newInvestor,
        ],
      },
    }));

    setNewInvestor({
      address: "",
      eligiblePartitions: [],
      kycStatus: "pending",
      investorType: "retail",
    });
  };

  const handleRemoveInvestor = (address: string) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        investorEligibility: (prev.metadata.investorEligibility || []).filter(
          (investor) => investor.address !== address,
        ),
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-green-500" />
        <h4 className="text-lg font-medium">
          Investor Verification & Compliance
        </h4>
      </div>
      <div className="pl-7 space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="kycRequired"
            checked={tokenForm.metadata.kycRequired !== false} // Default to true
            onCheckedChange={(checked) =>
              setTokenForm((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  kycRequired: !!checked,
                },
              }))
            }
          />
          <div>
            <Label htmlFor="kycRequired">KYC Required</Label>
            <p className="text-xs text-muted-foreground">
              Require KYC verification for token holders
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complianceLevel">Regulatory Compliance Level</Label>
          <Select
            value={tokenForm.metadata.complianceLevel || ""}
            onValueChange={(value) =>
              setTokenForm((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  complianceLevel: value,
                },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select compliance level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic KYC</SelectItem>
              <SelectItem value="accredited">
                Accredited Investors Only
              </SelectItem>
              <SelectItem value="jurisdiction">
                Jurisdiction-Based Rules
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investorTypes">Allowed Investor Types</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="institutional"
                checked={tokenForm.metadata.allowInstitutional || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      allowInstitutional: !!checked,
                    },
                  }))
                }
              />
              <Label htmlFor="institutional">Institutional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="retail"
                checked={tokenForm.metadata.allowRetail || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      allowRetail: !!checked,
                    },
                  }))
                }
              />
              <Label htmlFor="retail">Retail Investor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accredited"
                checked={tokenForm.metadata.allowAccredited || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      allowAccredited: !!checked,
                    },
                  }))
                }
              />
              <Label htmlFor="accredited">Accredited Investor</Label>
            </div>
          </div>
        </div>

        {tokenForm.metadata.multiplePartitions && (
          <div className="space-y-4 mt-6 pt-4 border-t border-gray-100">
            <h5 className="font-medium">Investor Partition Eligibility</h5>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Whitelist Investor for Partitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="investorAddress">Investor Address*</Label>
                    <Input
                      id="investorAddress"
                      placeholder="0x..."
                      value={newInvestor.address}
                      onChange={(e) =>
                        setNewInvestor({
                          ...newInvestor,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investorType">Investor Type</Label>
                    <Select
                      value={newInvestor.investorType || "retail"}
                      onValueChange={(value) =>
                        setNewInvestor({
                          ...newInvestor,
                          investorType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select investor type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="accredited">Accredited</SelectItem>
                        <SelectItem value="institutional">
                          Institutional
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kycStatus">KYC Status</Label>
                    <Select
                      value={newInvestor.kycStatus || "pending"}
                      onValueChange={(value) =>
                        setNewInvestor({
                          ...newInvestor,
                          kycStatus: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select KYC status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eligiblePartitions">
                      Eligible Partitions
                    </Label>
                    <Select
                      value={newInvestor.eligiblePartitions?.[0] || ""}
                      onValueChange={(value) =>
                        setNewInvestor({
                          ...newInvestor,
                          eligiblePartitions: [value],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select partition" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tokenForm.metadata.partitions || []).map(
                          (partition: Partition) => (
                            <SelectItem key={partition.id} value={partition.id}>
                              {partition.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Multi-select coming soon
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    onClick={handleAddInvestor}
                    disabled={!newInvestor.address}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Whitelist Investor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h5 className="font-medium">Whitelisted Investors</h5>
              {(tokenForm.metadata.investorEligibility || []).length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                  No investors whitelisted yet.
                </div>
              ) : (
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {(tokenForm.metadata.investorEligibility || []).map(
                      (investor: InvestorEligibility, index: number) => (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-medium truncate max-w-[300px]">
                                  {investor.address}
                                </h6>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary">
                                    {investor.investorType === "retail"
                                      ? "Retail"
                                      : investor.investorType === "accredited"
                                        ? "Accredited"
                                        : "Institutional"}
                                  </Badge>
                                  <Badge
                                    variant={
                                      investor.kycStatus === "approved"
                                        ? "default"
                                        : investor.kycStatus === "pending"
                                          ? "secondary"
                                          : "destructive"
                                    }
                                    className={
                                      investor.kycStatus === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : investor.kycStatus === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : ""
                                    }
                                  >
                                    {investor.kycStatus === "approved"
                                      ? "KYC Approved"
                                      : investor.kycStatus === "pending"
                                        ? "KYC Pending"
                                        : "KYC Rejected"}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-2">
                                  <div>
                                    Eligible for:{" "}
                                    {investor.eligiblePartitions
                                      ?.map((id) => {
                                        const partition = (
                                          tokenForm.metadata.partitions || []
                                        ).find((p: Partition) => p.id === id);
                                        return partition ? partition.name : id;
                                      })
                                      .join(", ") || "No partitions"}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveInvestor(investor.address)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
