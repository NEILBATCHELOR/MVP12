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
import { Layers, Plus, Trash2, Edit, Check, X } from "lucide-react";

interface Partition {
  id: string;
  name: string;
  supply: string;
  investorClass: string;
  riskProfile?: string;
  yieldRate?: string;
  minimumInvestment?: string;
  isTrancheType?: boolean;
}

interface PartitionSectionProps {
  tokenForm: any;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const PartitionSection: React.FC<PartitionSectionProps> = ({
  tokenForm,
  setTokenForm,
}) => {
  const [newPartition, setNewPartition] = React.useState<Partial<Partition>>({
    name: "",
    supply: "",
    investorClass: "accredited",
    isTrancheType: false,
  });

  const [editingPartitionId, setEditingPartitionId] = React.useState<
    string | null
  >(null);

  const handleAddPartition = () => {
    if (!newPartition.name) return;

    const partitionId = `partition-${Date.now()}`;
    const partition = {
      ...newPartition,
      id: partitionId,
    } as Partition;

    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        partitions: [...(prev.metadata.partitions || []), partition],
      },
    }));

    setNewPartition({
      name: "",
      supply: "",
      investorClass: "accredited",
      isTrancheType: false,
    });
  };

  const handleUpdatePartition = () => {
    if (!editingPartitionId) return;

    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        partitions: (prev.metadata.partitions || []).map((p) =>
          p.id === editingPartitionId ? { ...p, ...newPartition } : p,
        ),
      },
    }));

    setEditingPartitionId(null);
    setNewPartition({
      name: "",
      supply: "",
      investorClass: "accredited",
      isTrancheType: false,
    });
  };

  const handleEditPartition = (partition: Partition) => {
    setNewPartition(partition);
    setEditingPartitionId(partition.id);
  };

  const handleDeletePartition = (id: string) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        partitions: (prev.metadata.partitions || []).filter((p) => p.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-purple-500" />
        <h4 className="text-lg font-medium">Partitions & Tranches</h4>
      </div>
      <div className="pl-7 space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="multiplePartitions"
            checked={tokenForm.metadata.multiplePartitions || false}
            onCheckedChange={(checked) =>
              setTokenForm((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  multiplePartitions: !!checked,
                },
              }))
            }
          />
          <div>
            <Label htmlFor="multiplePartitions">
              Enable Multiple Partitions
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow different classes of shares (e.g., Common, Preferred)
            </p>
          </div>
        </div>

        {tokenForm.metadata.multiplePartitions && (
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingPartitionId ? "Edit Partition" : "Add New Partition"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partitionName">Partition Name*</Label>
                    <Input
                      id="partitionName"
                      placeholder="e.g., Class A Equity"
                      value={newPartition.name}
                      onChange={(e) =>
                        setNewPartition({
                          ...newPartition,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partitionSupply">Partition Supply</Label>
                    <Input
                      id="partitionSupply"
                      type="number"
                      placeholder="e.g., 1000000"
                      value={newPartition.supply}
                      onChange={(e) =>
                        setNewPartition({
                          ...newPartition,
                          supply: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investorClass">Investor Class</Label>
                    <Select
                      value={newPartition.investorClass || "accredited"}
                      onValueChange={(value) =>
                        setNewPartition({
                          ...newPartition,
                          investorClass: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select investor class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accredited">
                          Accredited Investors
                        </SelectItem>
                        <SelectItem value="retail">Retail Investors</SelectItem>
                        <SelectItem value="institutional">
                          Institutional Investors
                        </SelectItem>
                        <SelectItem value="qualified">
                          Qualified Purchasers
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="isTrancheType"
                        checked={newPartition.isTrancheType || false}
                        onCheckedChange={(checked) =>
                          setNewPartition({
                            ...newPartition,
                            isTrancheType: !!checked,
                          })
                        }
                      />
                      <Label htmlFor="isTrancheType">
                        Configure as Tranche
                      </Label>
                    </div>
                  </div>
                </div>

                {newPartition.isTrancheType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <Label htmlFor="riskProfile">Risk Profile</Label>
                      <Select
                        value={newPartition.riskProfile || "medium"}
                        onValueChange={(value) =>
                          setNewPartition({
                            ...newPartition,
                            riskProfile: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yieldRate">Yield/Interest Rate (%)</Label>
                      <Input
                        id="yieldRate"
                        type="number"
                        placeholder="e.g., 5.5"
                        value={newPartition.yieldRate || ""}
                        onChange={(e) =>
                          setNewPartition({
                            ...newPartition,
                            yieldRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimumInvestment">
                        Minimum Investment
                      </Label>
                      <Input
                        id="minimumInvestment"
                        type="number"
                        placeholder="e.g., 10000"
                        value={newPartition.minimumInvestment || ""}
                        onChange={(e) =>
                          setNewPartition({
                            ...newPartition,
                            minimumInvestment: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-4 space-x-2">
                  {editingPartitionId ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPartitionId(null);
                          setNewPartition({
                            name: "",
                            supply: "",
                            investorClass: "accredited",
                            isTrancheType: false,
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleUpdatePartition}>
                        <Check className="h-4 w-4 mr-1" /> Update Partition
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleAddPartition}
                      disabled={!newPartition.name}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Partition
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h5 className="font-medium">Configured Partitions</h5>
              {(tokenForm.metadata.partitions || []).length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                  No partitions configured yet. Add your first partition above.
                </div>
              ) : (
                <ScrollArea className="h-[250px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {(tokenForm.metadata.partitions || []).map(
                      (partition: Partition) => (
                        <Card
                          key={partition.id}
                          className="border border-gray-200"
                        >
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-medium">
                                  {partition.name}
                                </h6>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={
                                      partition.isTrancheType
                                        ? "outline"
                                        : "secondary"
                                    }
                                  >
                                    {partition.isTrancheType
                                      ? "Tranche"
                                      : "Partition"}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {partition.investorClass === "accredited"
                                      ? "Accredited"
                                      : partition.investorClass === "retail"
                                        ? "Retail"
                                        : partition.investorClass ===
                                            "institutional"
                                          ? "Institutional"
                                          : "Qualified"}
                                  </Badge>
                                  {partition.isTrancheType &&
                                    partition.riskProfile && (
                                      <Badge
                                        variant={
                                          partition.riskProfile === "low"
                                            ? "default"
                                            : partition.riskProfile === "medium"
                                              ? "secondary"
                                              : "destructive"
                                        }
                                        className={
                                          partition.riskProfile === "low"
                                            ? "bg-green-100 text-green-800"
                                            : partition.riskProfile === "medium"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : ""
                                        }
                                      >
                                        {partition.riskProfile === "low"
                                          ? "Low Risk"
                                          : partition.riskProfile === "medium"
                                            ? "Medium Risk"
                                            : "High Risk"}
                                      </Badge>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-2">
                                  <div>
                                    Supply: {partition.supply || "Unlimited"}
                                  </div>
                                  {partition.isTrancheType && (
                                    <>
                                      {partition.yieldRate && (
                                        <div>Yield: {partition.yieldRate}%</div>
                                      )}
                                      {partition.minimumInvestment && (
                                        <div>
                                          Min Investment:{" "}
                                          {partition.minimumInvestment}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditPartition(partition)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeletePartition(partition.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
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

        {!tokenForm.metadata.multiplePartitions && (
          <div className="space-y-2">
            <Label htmlFor="defaultPartition">Default Partition Name</Label>
            <Input
              id="defaultPartition"
              placeholder="e.g., Common Stock"
              value={tokenForm.metadata.defaultPartition || ""}
              onChange={(e) =>
                setTokenForm((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    defaultPartition: e.target.value,
                  },
                }))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
