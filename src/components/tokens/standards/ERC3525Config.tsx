import React, { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Trash2,
  Layers,
  BarChart,
  ArrowRightLeft,
  FileJson,
  Calendar,
  Coins,
  Settings,
  Edit,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ERC3525ConfigProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
}

interface Slot {
  id: number;
  name: string;
  description: string;
  fungibilityType: "fungible" | "semi-fungible" | "non-fungible";
  navPricingMechanism: "oracle" | "manual" | "formula";
  valueUnit: string;
  maxSupply?: number;
}

interface Token {
  id: number;
  slotId: number;
  name: string;
  balance: number;
  metadataUri: string;
  allowSplitting: boolean;
  allowMerging: boolean;
}

const ERC3525Config: React.FC<ERC3525ConfigProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
}) => {
  const [activeAccordion, setActiveAccordion] = useState<string[]>([
    "slots-management",
  ]);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [supplyWarnings, setSupplyWarnings] = useState<{
    [key: number]: string;
  }>({});
  const [totalSupplyWarning, setTotalSupplyWarning] = useState<string>("");

  // Initialize slots if not present
  if (!tokenForm.metadata.slots) {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        slots: [],
      },
    }));
  }

  // Initialize tokens if not present
  if (!tokenForm.metadata.tokens) {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tokens: [],
      },
    }));
  }

  // Initialize maxSupply if not present
  if (tokenForm.totalSupply === undefined) {
    setTokenForm((prev) => ({
      ...prev,
      totalSupply: 0,
    }));
  }

  // Validate slot supply against total contract supply
  useEffect(() => {
    const newSupplyWarnings: { [key: number]: string } = {};
    let totalSlotMaxSupply = 0;

    // Check each slot's max supply
    tokenForm.metadata.slots?.forEach((slot) => {
      if (
        slot.maxSupply &&
        tokenForm.totalSupply &&
        slot.maxSupply > tokenForm.totalSupply
      ) {
        newSupplyWarnings[slot.id] =
          `Slot max supply (${slot.maxSupply}) exceeds contract max supply (${tokenForm.totalSupply})`;
      }

      if (slot.maxSupply) {
        totalSlotMaxSupply += slot.maxSupply;
      }
    });

    // Check if sum of all slot max supplies exceeds contract max supply
    if (totalSlotMaxSupply > tokenForm.totalSupply) {
      setTotalSupplyWarning(
        `Sum of all slot max supplies (${totalSlotMaxSupply}) exceeds contract max supply (${tokenForm.totalSupply})`,
      );
    } else {
      setTotalSupplyWarning("");
    }

    setSupplyWarnings(newSupplyWarnings);
  }, [tokenForm.metadata.slots, tokenForm.totalSupply]);

  // Add a new slot
  const handleAddSlot = () => {
    const newSlotId =
      tokenForm.metadata.slots?.length > 0
        ? Math.max(...tokenForm.metadata.slots.map((s) => s.id)) + 1
        : 1;

    const newSlot: Slot = {
      id: newSlotId,
      name: `Slot ${newSlotId}`,
      description: "",
      fungibilityType: "semi-fungible",
      navPricingMechanism: "manual",
      valueUnit: "USD",
    };

    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        slots: [...(prev.metadata.slots || []), newSlot],
      },
    }));
  };

  // Delete a slot
  const handleDeleteSlot = (slotId: number) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        slots: prev.metadata.slots.filter((slot) => slot.id !== slotId),
        // Also remove tokens associated with this slot
        tokens: prev.metadata.tokens.filter((token) => token.slotId !== slotId),
      },
    }));
  };

  // Update a slot
  const handleUpdateSlot = (updatedSlot: Slot) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        slots: prev.metadata.slots.map((slot) =>
          slot.id === updatedSlot.id ? updatedSlot : slot,
        ),
      },
    }));
    setEditingSlot(null);
  };

  // Add a new token
  const handleAddToken = (slotId: number) => {
    const newTokenId =
      tokenForm.metadata.tokens?.length > 0
        ? Math.max(...tokenForm.metadata.tokens.map((t) => t.id)) + 1
        : 1;

    const newToken: Token = {
      id: newTokenId,
      slotId: slotId,
      name: `Token ${newTokenId}`,
      balance: 100,
      metadataUri: "",
      allowSplitting: true,
      allowMerging: true,
    };

    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tokens: [...(prev.metadata.tokens || []), newToken],
      },
    }));
  };

  // Delete a token
  const handleDeleteToken = (tokenId: number) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tokens: prev.metadata.tokens.filter((token) => token.id !== tokenId),
      },
    }));
  };

  // Update a token
  const handleUpdateToken = (updatedToken: Token) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tokens: prev.metadata.tokens.map((token) =>
          token.id === updatedToken.id ? updatedToken : token,
        ),
      },
    }));
    setEditingToken(null);
  };

  // Update NAV for a slot
  const handleUpdateNAV = (slotId: number, nav: string) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        navValues: {
          ...(prev.metadata.navValues || {}),
          [slotId]: nav,
        },
      },
    }));
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-xl font-semibold">
        ERC-3525 Semi-Fungible Token Configuration
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Configure your ERC-3525 token with slots, values, and NAV settings. This
        standard combines properties of both ERC-20 and ERC-721, allowing tokens
        to have value slots that function like accounts within the token.
      </p>

      {/* Basic Token Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Token Name*</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., SemiFungibleToken"
            value={tokenForm.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="symbol">Token Symbol*</Label>
          <Input
            id="symbol"
            name="symbol"
            placeholder="e.g., SFT"
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
          <Label htmlFor="totalSupply">Max Total Supply*</Label>
          <Input
            id="totalSupply"
            name="totalSupply"
            type="number"
            min="0"
            placeholder="1000000"
            value={tokenForm.totalSupply}
            onChange={handleInputChange}
          />
          <p className="text-xs text-muted-foreground">
            Maximum total supply across all slots
          </p>
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

      {/* Total Supply Warning */}
      {totalSupplyWarning && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supply Allocation Warning</AlertTitle>
          <AlertDescription>{totalSupplyWarning}</AlertDescription>
        </Alert>
      )}

      {/* Accordion for all configuration sections */}
      <Accordion
        type="multiple"
        value={activeAccordion}
        onValueChange={setActiveAccordion}
        className="w-full space-y-4"
      >
        {/* 1. Slots Management Panel */}
        <AccordionItem
          value="slots-management"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500" />
              <h4 className="text-base font-medium">Slots Management</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Define multiple slots, each representing a specific category of
                value.
              </p>
              <Button variant="outline" size="sm" onClick={handleAddSlot}>
                <Plus className="h-4 w-4 mr-2" /> Add Slot
              </Button>
            </div>

            {/* Slots List */}
            {tokenForm.metadata.slots?.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-muted-foreground">
                  No slots defined. Add a slot to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tokenForm.metadata.slots?.map((slot) => (
                  <Card key={slot.id} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{slot.name}</CardTitle>
                          <Badge variant="outline">ID: {slot.id}</Badge>
                          <Badge
                            variant={
                              slot.fungibilityType === "fungible"
                                ? "default"
                                : slot.fungibilityType === "semi-fungible"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {slot.fungibilityType === "fungible"
                              ? "Fungible"
                              : slot.fungibilityType === "semi-fungible"
                                ? "Semi-Fungible"
                                : "Non-Fungible"}
                          </Badge>
                          {slot.maxSupply && (
                            <Badge variant="outline" className="bg-blue-50">
                              Max: {slot.maxSupply.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingSlot(slot)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {supplyWarnings[slot.id] && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {supplyWarnings[slot.id]}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-muted-foreground">
                            {slot.description || "No description provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Value Unit</p>
                          <p className="text-sm text-muted-foreground">
                            {slot.valueUnit || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">NAV Pricing</p>
                          <p className="text-sm text-muted-foreground">
                            {slot.navPricingMechanism === "oracle"
                              ? "Oracle-Based"
                              : slot.navPricingMechanism === "formula"
                                ? "Formula-Based"
                                : "Manual Update"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current NAV</p>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="1.00"
                              value={
                                tokenForm.metadata.navValues?.[slot.id] ||
                                "1.00"
                              }
                              onChange={(e) =>
                                handleUpdateNAV(slot.id, e.target.value)
                              }
                              className="w-32"
                            />
                            <Button variant="outline" size="sm">
                              Update NAV
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Tokens in this slot */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">
                            Tokens in this Slot
                          </h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToken(slot.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Token
                          </Button>
                        </div>
                        {tokenForm.metadata.tokens?.filter(
                          (t) => t.slotId === slot.id,
                        ).length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            No tokens in this slot
                          </p>
                        ) : (
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Token ID</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Balance</TableHead>
                                  <TableHead className="text-right">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tokenForm.metadata.tokens
                                  ?.filter((t) => t.slotId === slot.id)
                                  .map((token) => (
                                    <TableRow key={token.id}>
                                      <TableCell>{token.id}</TableCell>
                                      <TableCell>{token.name}</TableCell>
                                      <TableCell>{token.balance}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              setEditingToken(token)
                                            }
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              handleDeleteToken(token.id)
                                            }
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Slot Dialog */}
            {editingSlot && (
              <Card className="border border-gray-200 mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Edit Slot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slotName">Slot Name*</Label>
                      <Input
                        id="slotName"
                        value={editingSlot.name}
                        onChange={(e) =>
                          setEditingSlot({
                            ...editingSlot,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slotFungibilityType">
                        Fungibility Type*
                      </Label>
                      <Select
                        value={editingSlot.fungibilityType}
                        onValueChange={(value) =>
                          setEditingSlot({
                            ...editingSlot,
                            fungibilityType: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fungibility type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fungible">
                            Fungible (ERC-20 like)
                          </SelectItem>
                          <SelectItem value="semi-fungible">
                            Semi-Fungible (Hybrid)
                          </SelectItem>
                          <SelectItem value="non-fungible">
                            Non-Fungible (ERC-721 like)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slotValueUnit">Value Unit*</Label>
                      <Input
                        id="slotValueUnit"
                        placeholder="e.g., USD, Shares, Points"
                        value={editingSlot.valueUnit}
                        onChange={(e) =>
                          setEditingSlot({
                            ...editingSlot,
                            valueUnit: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slotNavPricing">
                        NAV Pricing Mechanism*
                      </Label>
                      <Select
                        value={editingSlot.navPricingMechanism}
                        onValueChange={(value) =>
                          setEditingSlot({
                            ...editingSlot,
                            navPricingMechanism: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select NAV pricing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oracle">
                            Oracle (Automated)
                          </SelectItem>
                          <SelectItem value="manual">Manual Update</SelectItem>
                          <SelectItem value="formula">Formula-Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="slotDescription">Description</Label>
                      <Textarea
                        id="slotDescription"
                        placeholder="Describe the purpose of this slot"
                        value={editingSlot.description}
                        onChange={(e) =>
                          setEditingSlot({
                            ...editingSlot,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slotMaxSupply">
                        Maximum Supply (0 for unlimited)
                      </Label>
                      <Input
                        id="slotMaxSupply"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={editingSlot.maxSupply || "0"}
                        onChange={(e) =>
                          setEditingSlot({
                            ...editingSlot,
                            maxSupply: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Must not exceed contract max supply (
                        {tokenForm.totalSupply?.toLocaleString() || 0})
                      </p>
                      {editingSlot.maxSupply > tokenForm.totalSupply && (
                        <p className="text-xs text-red-500">
                          Warning: Exceeds contract max supply
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditingSlot(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => handleUpdateSlot(editingSlot)}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Token Dialog */}
            {editingToken && (
              <Card className="border border-gray-200 mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Edit Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tokenName">Token Name*</Label>
                      <Input
                        id="tokenName"
                        value={editingToken.name}
                        onChange={(e) =>
                          setEditingToken({
                            ...editingToken,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tokenBalance">Balance*</Label>
                      <Input
                        id="tokenBalance"
                        type="number"
                        min="0"
                        value={editingToken.balance}
                        onChange={(e) =>
                          setEditingToken({
                            ...editingToken,
                            balance: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="tokenMetadataUri">Metadata URI</Label>
                      <Input
                        id="tokenMetadataUri"
                        placeholder="ipfs://..."
                        value={editingToken.metadataUri}
                        onChange={(e) =>
                          setEditingToken({
                            ...editingToken,
                            metadataUri: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tokenAllowSplitting"
                        checked={editingToken.allowSplitting}
                        onCheckedChange={(checked) =>
                          setEditingToken({
                            ...editingToken,
                            allowSplitting: !!checked,
                          })
                        }
                      />
                      <div>
                        <Label htmlFor="tokenAllowSplitting">
                          Allow Splitting
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable token to be split into smaller units
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tokenAllowMerging"
                        checked={editingToken.allowMerging}
                        onCheckedChange={(checked) =>
                          setEditingToken({
                            ...editingToken,
                            allowMerging: !!checked,
                          })
                        }
                      />
                      <div>
                        <Label htmlFor="tokenAllowMerging">Allow Merging</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable token to be merged with others in same slot
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditingToken(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => handleUpdateToken(editingToken)}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 2. NAV Management Panel */}
        <AccordionItem value="nav-management" className="border rounded-lg p-2">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-green-500" />
              <h4 className="text-base font-medium">NAV Management</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Link and update real-time Net Asset Value (NAV) for each slot.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {tokenForm.metadata.slots?.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-muted-foreground">
                    No slots defined. Add slots in the Slots Management panel
                    first.
                  </p>
                </div>
              ) : (
                tokenForm.metadata.slots?.map((slot) => (
                  <Card key={slot.id} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{slot.name}</CardTitle>
                          <Badge variant="outline">ID: {slot.id}</Badge>
                        </div>
                        <Badge
                          variant={
                            slot.navPricingMechanism === "oracle"
                              ? "default"
                              : slot.navPricingMechanism === "formula"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {slot.navPricingMechanism === "oracle"
                            ? "Oracle-Based"
                            : slot.navPricingMechanism === "formula"
                              ? "Formula-Based"
                              : "Manual Update"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`nav-${slot.id}`}>Current NAV</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`nav-${slot.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="1.00"
                              value={
                                tokenForm.metadata.navValues?.[slot.id] ||
                                "1.00"
                              }
                              onChange={(e) =>
                                handleUpdateNAV(slot.id, e.target.value)
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {slot.valueUnit}
                            </span>
                          </div>
                        </div>

                        {slot.navPricingMechanism === "oracle" && (
                          <div className="space-y-2">
                            <Label htmlFor={`oracle-${slot.id}`}>
                              Oracle Address
                            </Label>
                            <Input
                              id={`oracle-${slot.id}`}
                              placeholder="0x..."
                              value={
                                tokenForm.metadata.oracleAddresses?.[slot.id] ||
                                ""
                              }
                              onChange={(e) =>
                                setTokenForm((prev) => ({
                                  ...prev,
                                  metadata: {
                                    ...prev.metadata,
                                    oracleAddresses: {
                                      ...(prev.metadata.oracleAddresses || {}),
                                      [slot.id]: e.target.value,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                        )}

                        {slot.navPricingMechanism === "formula" && (
                          <div className="space-y-2">
                            <Label htmlFor={`formula-${slot.id}`}>
                              Calculation Formula
                            </Label>
                            <Input
                              id={`formula-${slot.id}`}
                              placeholder="e.g., baseValue * (1 + interestRate)"
                              value={
                                tokenForm.metadata.formulas?.[slot.id] || ""
                              }
                              onChange={(e) =>
                                setTokenForm((prev) => ({
                                  ...prev,
                                  metadata: {
                                    ...prev.metadata,
                                    formulas: {
                                      ...(prev.metadata.formulas || {}),
                                      [slot.id]: e.target.value,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        {slot.navPricingMechanism === "oracle" && (
                          <Button variant="outline">Fetch from Oracle</Button>
                        )}
                        {slot.navPricingMechanism === "formula" && (
                          <Button variant="outline">Calculate NAV</Button>
                        )}
                        <Button>Update NAV</Button>
                      </div>

                      {/* NAV History Table (Mock) */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">
                          NAV History
                        </h5>
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>NAV Value</TableHead>
                                <TableHead>Source</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>
                                  {new Date().toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {tokenForm.metadata.navValues?.[slot.id] ||
                                    "1.00"}
                                </TableCell>
                                <TableCell>
                                  {slot.navPricingMechanism === "oracle"
                                    ? "Oracle"
                                    : slot.navPricingMechanism === "formula"
                                      ? "Formula"
                                      : "Manual Update"}
                                </TableCell>
                              </TableRow>
                              {/* Add more mock history entries if needed */}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Transfer & Approval Panel */}
        <AccordionItem
          value="transfer-approval"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-blue-500" />
              <h4 className="text-base font-medium">Transfer & Approval</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Manage how tokens can be transferred and approved.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-md">Transfer Token</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transferTokenId">Token ID</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokenForm.metadata.tokens?.map((token) => (
                          <SelectItem
                            key={token.id}
                            value={token.id.toString()}
                          >
                            {token.id}: {token.name} (Slot {token.slotId})
                          </SelectItem>
                        )) || (
                          <SelectItem value="no-token" disabled>
                            No tokens available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transferRecipient">Recipient Address</Label>
                    <Input id="transferRecipient" placeholder="0x..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transferAmount">Amount to Transfer</Label>
                    <Input
                      id="transferAmount"
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                    />
                  </div>

                  <Button className="w-full">Transfer Token</Button>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-md">Approval Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="approvalTokenId">Token ID</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokenForm.metadata.tokens?.map((token) => (
                          <SelectItem
                            key={token.id}
                            value={token.id.toString()}
                          >
                            {token.id}: {token.name} (Slot {token.slotId})
                          </SelectItem>
                        )) || (
                          <SelectItem value="no-token" disabled>
                            No tokens available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approveAddress">Approve for Address</Label>
                    <Input id="approveAddress" placeholder="0x..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approveAmount">Amount to Approve</Label>
                    <Input
                      id="approveAmount"
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                    />
                  </div>

                  <Button className="w-full">Approve</Button>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Metadata & Traits Panel */}
        <AccordionItem
          value="metadata-traits"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-yellow-500" />
              <h4 className="text-base font-medium">Metadata & Traits</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Manage metadata for slots and tokens.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium">Slot Metadata</h5>
                <div className="space-y-2">
                  <Label htmlFor="metadataSlotId">Slot ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenForm.metadata.slots?.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          {slot.id}: {slot.name}
                        </SelectItem>
                      )) || (
                        <SelectItem value="no-slot" disabled>
                          No slots available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slotMetadataUri">Slot Metadata URI</Label>
                  <Input id="slotMetadataUri" placeholder="ipfs://..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slotTraits">Slot Traits (JSON)</Label>
                  <Textarea
                    id="slotTraits"
                    placeholder='{"trait_type":"value"}'
                    rows={4}
                  />
                </div>

                <Button>Update Slot Metadata</Button>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Token Metadata</h5>
                <div className="space-y-2">
                  <Label htmlFor="metadataTokenId">Token ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenForm.metadata.tokens?.map((token) => (
                        <SelectItem key={token.id} value={token.id.toString()}>
                          {token.id}: {token.name} (Slot {token.slotId})
                        </SelectItem>
                      )) || (
                        <SelectItem value="no-token" disabled>
                          No tokens available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenMetadataUri">Token Metadata URI</Label>
                  <Input id="tokenMetadataUri" placeholder="ipfs://..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenTraits">Token Traits (JSON)</Label>
                  <Textarea
                    id="tokenTraits"
                    placeholder='{"trait_type":"value"}'
                    rows={4}
                  />
                </div>

                <Button>Update Token Metadata</Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Advanced Settings Panel */}
        <AccordionItem
          value="advanced-settings"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <h4 className="text-base font-medium">Advanced Settings</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="splitMerge"
                  checked={tokenForm.metadata.splitMerge || false}
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        splitMerge: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="splitMerge">Split/Merge Functionality</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable dynamic token management
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="redeemableValue"
                  checked={tokenForm.metadata.redeemableValue || false}
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        redeemableValue: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="redeemableValue">Redeemable Value</Label>
                  <p className="text-xs text-muted-foreground">
                    Set rules for cashing out
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expiration"
                  checked={tokenForm.metadata.expiration || false}
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        expiration: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="expiration">Expiration</Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-revoke tokens on a set date
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
          </AccordionContent>
        </AccordionItem>

        {/* 6. Dates & Lifecycle Panel */}
        <AccordionItem
          value="dates-lifecycle"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-500" />
              <h4 className="text-base font-medium">Dates & Lifecycle</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="issuanceDate">Issuance Date</Label>
                <Input
                  id="issuanceDate"
                  type="date"
                  value={tokenForm.metadata.issuanceDate || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        issuanceDate: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturityDate">Maturity Date</Label>
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
                <Label htmlFor="redemptionPeriodStart">
                  Redemption Period Start
                </Label>
                <Input
                  id="redemptionPeriodStart"
                  type="date"
                  value={tokenForm.metadata.redemptionPeriodStart || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        redemptionPeriodStart: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redemptionPeriodEnd">
                  Redemption Period End
                </Label>
                <Input
                  id="redemptionPeriodEnd"
                  type="date"
                  value={tokenForm.metadata.redemptionPeriodEnd || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        redemptionPeriodEnd: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 7. Tranche Configuration Panel */}
        <AccordionItem
          value="tranche-configuration"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <h4 className="text-base font-medium">Tranche Configuration</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Configure tranches for structured products.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newId =
                    tokenForm.metadata.tranches?.length > 0
                      ? Math.max(
                          ...tokenForm.metadata.tranches.map((t) => t.id),
                        ) + 1
                      : 1;
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      tranches: [
                        ...(prev.metadata.tranches || []),
                        {
                          id: newId,
                          name: `Tranche ${newId}`,
                          value: 0,
                          interestRate: 0,
                        },
                      ],
                    },
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Tranche
              </Button>
            </div>

            <div className="space-y-2">
              {!tokenForm.metadata.tranches ||
              tokenForm.metadata.tranches.length === 0 ? (
                <div className="text-center py-4 border rounded-md">
                  <p className="text-muted-foreground">
                    No tranches defined. Add a tranche to get started.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tranche Name</TableHead>
                        <TableHead>Slot ID</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Interest Rate (%)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokenForm.metadata.tranches.map((tranche, index) => (
                        <TableRow key={tranche.id}>
                          <TableCell>
                            <Input
                              value={tranche.name}
                              onChange={(e) => {
                                const updatedTranches = [
                                  ...tokenForm.metadata.tranches,
                                ];
                                updatedTranches[index].name = e.target.value;
                                setTokenForm((prev) => ({
                                  ...prev,
                                  metadata: {
                                    ...prev.metadata,
                                    tranches: updatedTranches,
                                  },
                                }));
                              }}
                            />
                          </TableCell>
                          <TableCell>{tranche.id}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={tranche.value}
                              onChange={(e) => {
                                const updatedTranches = [
                                  ...tokenForm.metadata.tranches,
                                ];
                                updatedTranches[index].value =
                                  parseInt(e.target.value) || 0;
                                setTokenForm((prev) => ({
                                  ...prev,
                                  metadata: {
                                    ...prev.metadata,
                                    tranches: updatedTranches,
                                  },
                                }));
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={tranche.interestRate}
                              onChange={(e) => {
                                const updatedTranches = [
                                  ...tokenForm.metadata.tranches,
                                ];
                                updatedTranches[index].interestRate =
                                  parseFloat(e.target.value) || 0;
                                setTokenForm((prev) => ({
                                  ...prev,
                                  metadata: {
                                    ...prev.metadata,
                                    tranches: updatedTranches,
                                  },
                                }));
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updatedTranches =
                                  tokenForm.metadata.tranches.filter(
                                    (_, i) => i !== index,
                                  );
                                setTokenForm((prev) => ({
                                  ...prev,
                                  metadata: {
                                    ...prev.metadata,
                                    tranches: updatedTranches,
                                  },
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Tranche summary */}
              {tokenForm.metadata.tranches?.length > 0 && (
                <div className="flex justify-between items-center mt-4 p-3 bg-muted/20 rounded-md">
                  <span>
                    Total Value:{" "}
                    {tokenForm.metadata.tranches
                      .reduce((sum, t) => sum + (t.value || 0), 0)
                      .toLocaleString()}
                  </span>
                  <span
                    className={
                      tokenForm.metadata.tranches.reduce(
                        (sum, t) => sum + (t.value || 0),
                        0,
                      ) !== tokenForm.totalSupply
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {tokenForm.metadata.tranches.reduce(
                      (sum, t) => sum + (t.value || 0),
                      0,
                    ) === tokenForm.totalSupply
                      ? "✓ Matches total supply"
                      : `⚠️ Doesn't match total supply (${tokenForm.totalSupply?.toLocaleString() || 0})`}
                  </span>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 8. Supply Management Panel */}
        <AccordionItem
          value="supply-management"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h4 className="text-base font-medium">Supply Management</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Monitor and manage supply allocation across all slots to ensure it
              doesn't exceed the contract's maximum supply.
            </p>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Supply Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Contract Max Supply:</span>
                      <span>
                        {tokenForm.totalSupply?.toLocaleString() || 0}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Allocated in Slots:</span>
                        <span>
                          {tokenForm.metadata.slots
                            ?.reduce(
                              (sum, slot) => sum + (slot.maxSupply || 0),
                              0,
                            )
                            .toLocaleString() || 0}
                        </span>
                      </div>

                      {/* Progress bar for allocation */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${totalSupplyWarning ? "bg-red-500" : "bg-green-500"}`}
                          style={{
                            width: `${Math.min(
                              100,
                              tokenForm.totalSupply
                                ? (tokenForm.metadata.slots?.reduce(
                                    (sum, slot) => sum + (slot.maxSupply || 0),
                                    0,
                                  ) /
                                    tokenForm.totalSupply) *
                                    100
                                : 0,
                            )}%`,
                          }}
                        ></div>
                      </div>

                      {totalSupplyWarning ? (
                        <p className="text-sm text-red-500">
                          {totalSupplyWarning}
                        </p>
                      ) : (
                        <p className="text-sm text-green-500">
                          Supply allocation is within limits
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">
                        Slot Allocation Breakdown
                      </h5>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Slot ID</TableHead>
                              <TableHead>Slot Name</TableHead>
                              <TableHead>Max Supply</TableHead>
                              <TableHead>% of Total</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tokenForm.metadata.slots?.map((slot) => (
                              <TableRow key={slot.id}>
                                <TableCell>{slot.id}</TableCell>
                                <TableCell>{slot.name}</TableCell>
                                <TableCell>
                                  {slot.maxSupply?.toLocaleString() ||
                                    "Unlimited"}
                                </TableCell>
                                <TableCell>
                                  {tokenForm.totalSupply && slot.maxSupply
                                    ? `${((slot.maxSupply / tokenForm.totalSupply) * 100).toFixed(2)}%`
                                    : "N/A"}
                                </TableCell>
                                <TableCell>
                                  {supplyWarnings[slot.id] ? (
                                    <Badge variant="destructive">
                                      Exceeds Limit
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50"
                                    >
                                      Valid
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ERC3525Config;
