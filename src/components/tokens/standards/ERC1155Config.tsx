import React, { useState } from "react";
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
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Coins,
  FileJson,
  Flame,
  ArrowUpDown,
  Database,
  DollarSign,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ERC1155ConfigProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
}

const ERC1155Config: React.FC<ERC1155ConfigProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
}) => {
  const [openSections, setOpenSections] = useState({
    collectionSetup: true,
    tokenManagement: true,
    mintingBurning: true,
    transferApproval: true,
    metadataTraits: true,
    royalties: true,
    tokenFeatures: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader = ({
    title,
    section,
    icon,
  }: {
    title: string;
    section: keyof typeof openSections;
    icon: React.ReactNode;
  }) => (
    <div
      className="flex items-center justify-between cursor-pointer py-2"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-medium text-lg">{title}</h4>
      </div>
      {openSections[section] ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );

  return (
    <div className="space-y-6 border-t pt-6 bg-white">
      <h3 className="text-xl font-semibold">
        ERC-1155 Multi Token Configuration
      </h3>

      {/* 1. Collection Setup Panel */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <SectionHeader
          title="Collection Setup"
          section="collectionSetup"
          icon={<Database className="h-5 w-5 text-blue-500" />}
        />

        {openSections.collectionSetup && (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name*</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., MultiToken Collection"
                  value={tokenForm.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Collection Symbol*</Label>
                <Input
                  id="symbol"
                  name="symbol"
                  placeholder="e.g., MTK"
                  value={tokenForm.symbol}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerAddress">
                  Owner Address (ETH Wallet)*
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
                <Label htmlFor="baseUri">Base Metadata URI</Label>
                <Input
                  id="baseUri"
                  placeholder="ipfs://"
                  value={tokenForm.metadata.baseUri || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        baseUri: e.target.value,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Base URI for all token metadata
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Metadata Storage</Label>
              <RadioGroup
                value={tokenForm.metadata.storageType || "ipfs"}
                onValueChange={(value) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      storageType: value,
                    },
                  }))
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="onchain" id="onchain" />
                  <Label htmlFor="onchain">On-Chain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ipfs" id="ipfs" />
                  <Label htmlFor="ipfs">IPFS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="centralized" id="centralized" />
                  <Label htmlFor="centralized">Centralized (URL)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="supportsMixedTokens"
                checked={tokenForm.metadata.supportsMixedTokens || false}
                onCheckedChange={(checked) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      supportsMixedTokens: !!checked,
                    },
                  }))
                }
              />
              <div>
                <Label htmlFor="supportsMixedTokens">
                  Supports Both Fungible & Non-Fungible Tokens
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow mixed token types in the same contract
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Sub-Token Management Panel */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <SectionHeader
          title="Sub-Token Management"
          section="tokenManagement"
          icon={<Coins className="h-5 w-5 text-green-500" />}
        />

        {openSections.tokenManagement && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Define multiple token types under this ERC-1155 contract
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newTokens = [...(tokenForm.metadata.tokens || [])];
                  newTokens.push({
                    id: newTokens.length + 1,
                    type: "Fungible",
                    name: `Token ${newTokens.length + 1}`,
                    amount: 1000,
                    maxSupply: 0,
                    uri: "",
                    burnable: false,
                    transferable: true,
                    traits: "{}",
                  });
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      tokens: newTokens,
                    },
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Token
              </Button>
            </div>

            {!tokenForm.metadata.tokens ||
            tokenForm.metadata.tokens.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-muted-foreground">
                  No tokens defined. Add a token to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tokenForm.metadata.tokens.map((token: any, index: number) => (
                  <div
                    key={index}
                    className="border rounded-md p-4 space-y-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                          ID: {token.id}
                        </span>
                        <h5 className="font-medium">
                          {token.name || `Token #${token.id}`}
                        </h5>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newTokens = [...tokenForm.metadata.tokens];
                          newTokens.splice(index, 1);
                          setTokenForm((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              tokens: newTokens,
                            },
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`token-${index}-type`}>
                          Token Type
                        </Label>
                        <Select
                          value={token.type}
                          onValueChange={(value) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].type = value;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select token type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fungible">
                              Fungible (ERC-20 like)
                            </SelectItem>
                            <SelectItem value="Semi-Fungible">
                              Semi-Fungible
                            </SelectItem>
                            <SelectItem value="Non-Fungible">
                              Non-Fungible (ERC-721 like)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`token-${index}-name`}>
                          Token Name
                        </Label>
                        <Input
                          id={`token-${index}-name`}
                          value={token.name}
                          onChange={(e) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].name = e.target.value;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`token-${index}-amount`}>
                          Initial Supply
                        </Label>
                        <Input
                          id={`token-${index}-amount`}
                          type="number"
                          min="1"
                          value={token.amount}
                          onChange={(e) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].amount =
                              parseInt(e.target.value) || 1;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`token-${index}-maxSupply`}>
                          Maximum Supply
                        </Label>
                        <Input
                          id={`token-${index}-maxSupply`}
                          type="number"
                          min="0"
                          placeholder="0 for unlimited"
                          value={token.maxSupply}
                          onChange={(e) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].maxSupply =
                              parseInt(e.target.value) || 0;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`token-${index}-uri`}>Token URI</Label>
                        <Input
                          id={`token-${index}-uri`}
                          placeholder="ipfs://"
                          value={token.uri}
                          onChange={(e) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].uri = e.target.value;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor={`token-${index}-traits`}>
                          Traits (JSON)
                        </Label>
                        <Textarea
                          id={`token-${index}-traits`}
                          placeholder='{"trait_type":"value"}'
                          value={token.traits || "{}"}
                          rows={3}
                          onChange={(e) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].traits = e.target.value;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`token-${index}-burnable`}
                          checked={token.burnable}
                          onCheckedChange={(checked) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].burnable = !!checked;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        />
                        <Label htmlFor={`token-${index}-burnable`}>
                          Burnable
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`token-${index}-transferable`}
                          checked={token.transferable}
                          onCheckedChange={(checked) => {
                            const newTokens = [...tokenForm.metadata.tokens];
                            newTokens[index].transferable = !!checked;
                            setTokenForm((prev) => ({
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                tokens: newTokens,
                              },
                            }));
                          }}
                        />
                        <Label htmlFor={`token-${index}-transferable`}>
                          Transferable
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Minting & Burning Panel */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <SectionHeader
          title="Minting & Burning"
          section="mintingBurning"
          icon={<Flame className="h-5 w-5 text-orange-500" />}
        />

        {openSections.mintingBurning && (
          <div className="mt-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Issue new tokens or burn existing ones
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium">Mint Tokens</h5>
                <div className="space-y-2">
                  <Label htmlFor="mintTokenId">Token ID</Label>
                  <Select defaultValue="no-token">
                    <SelectTrigger>
                      <SelectValue placeholder="Select token ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenForm.metadata.tokens?.map((token: any) => (
                        <SelectItem key={token.id} value={token.id.toString()}>
                          {token.id}: {token.name}
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
                  <Label htmlFor="mintRecipient">Recipient Address</Label>
                  <Input id="mintRecipient" placeholder="0x..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mintAmount">Amount</Label>
                  <Input
                    id="mintAmount"
                    type="number"
                    min="1"
                    placeholder="1"
                  />
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Mint Token
                </Button>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Burn Tokens</h5>
                <div className="space-y-2">
                  <Label htmlFor="burnTokenId">Token ID</Label>
                  <Select defaultValue="no-token">
                    <SelectTrigger>
                      <SelectValue placeholder="Select token ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenForm.metadata.tokens?.map((token: any) => (
                        <SelectItem key={token.id} value={token.id.toString()}>
                          {token.id}: {token.name}
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
                  <Label htmlFor="burnFromAddress">From Address</Label>
                  <Input id="burnFromAddress" placeholder="0x..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="burnAmount">Amount</Label>
                  <Input
                    id="burnAmount"
                    type="number"
                    min="1"
                    placeholder="1"
                  />
                </div>

                <Button variant="destructive" className="w-full">
                  <Flame className="h-4 w-4 mr-2" /> Burn Token
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Transfer & Approval Panel */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <SectionHeader
          title="Transfer & Approval"
          section="transferApproval"
          icon={<ArrowUpDown className="h-5 w-5 text-purple-500" />}
        />

        {openSections.transferApproval && (
          <div className="mt-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Manage token ownership transfers and approvals
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium">Transfer Tokens</h5>
                <div className="space-y-2">
                  <Label htmlFor="transferTokenId">Token ID</Label>
                  <Select defaultValue="no-token">
                    <SelectTrigger>
                      <SelectValue placeholder="Select token ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenForm.metadata.tokens?.map((token: any) => (
                        <SelectItem key={token.id} value={token.id.toString()}>
                          {token.id}: {token.name}
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
                  <Label>Current Owner</Label>
                  <div className="p-2 border rounded-md bg-gray-50 text-sm font-mono">
                    0x0000...0000
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferToAddress">New Owner Address</Label>
                  <Input id="transferToAddress" placeholder="0x..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferAmount">Amount</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    min="1"
                    placeholder="1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="batchTransfer" />
                  <Label htmlFor="batchTransfer">Batch Transfer</Label>
                </div>

                <Button className="w-full">
                  <ArrowUpDown className="h-4 w-4 mr-2" /> Transfer Token
                </Button>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Approval Settings</h5>
                <div className="space-y-2">
                  <Label htmlFor="approvalTokenId">Token ID</Label>
                  <Select defaultValue="no-token">
                    <SelectTrigger>
                      <SelectValue placeholder="Select token ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenForm.metadata.tokens?.map((token: any) => (
                        <SelectItem key={token.id} value={token.id.toString()}>
                          {token.id}: {token.name}
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
                  <Label htmlFor="approveMarketplace">
                    Approve for Marketplace
                  </Label>
                  <Select defaultValue="select-marketplace">
                    <SelectTrigger>
                      <SelectValue placeholder="Select marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select-marketplace" disabled>
                        Select marketplace
                      </SelectItem>
                      <SelectItem value="opensea">OpenSea</SelectItem>
                      <SelectItem value="looksrare">LooksRare</SelectItem>
                      <SelectItem value="blur">Blur</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customMarketplace">
                    Custom Marketplace Address
                  </Label>
                  <Input id="customMarketplace" placeholder="0x..." disabled />
                </div>

                <Button className="w-full">Approve</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Metadata & Traits Panel */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <SectionHeader
          title="Metadata & Traits"
          section="metadataTraits"
          icon={<FileJson className="h-5 w-5 text-yellow-500" />}
        />

        {openSections.metadataTraits && (
          <div className="mt-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Manage metadata attributes for tokens
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metadataTokenId">Token ID</Label>
                <Select defaultValue="no-token">
                  <SelectTrigger>
                    <SelectValue placeholder="Select token ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenForm.metadata.tokens?.map((token: any) => (
                      <SelectItem key={token.id} value={token.id.toString()}>
                        {token.id}: {token.name}
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
                <div className="flex justify-between">
                  <Label>Current Metadata URI</Label>
                  <Button variant="ghost" size="sm">
                    Fetch Metadata
                  </Button>
                </div>
                <div className="p-2 border rounded-md bg-gray-50 text-sm font-mono break-all">
                  ipfs://QmXyZ...
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateMetadataUri">Update Metadata URI</Label>
                <Input id="updateMetadataUri" placeholder="ipfs://" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenTraits">Token Traits (JSON)</Label>
                <Textarea
                  id="tokenTraits"
                  placeholder='{"trait_type":"value"}'
                  rows={6}
                />
              </div>

              <Button>Update Metadata</Button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Royalties & Marketplace Integration Panel */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <SectionHeader
          title="Royalties & Marketplace Integration"
          section="royalties"
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
        />

        {openSections.royalties && (
          <div className="mt-4 space-y-6">
            <p className="text-sm text-muted-foreground">
              Define royalty settings and integrate with NFT marketplaces
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="royaltyPercentage">Royalty Percentage</Label>
                <div className="flex items-center">
                  <Input
                    id="royaltyPercentage"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="2.5"
                    value={tokenForm.metadata.royaltyPercentage || ""}
                    onChange={(e) =>
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          royaltyPercentage: e.target.value,
                        },
                      }))
                    }
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of sales paid to royalty receiver (0-10%)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="royaltyReceiver">
                  Royalty Receiver Address
                </Label>
                <Input
                  id="royaltyReceiver"
                  placeholder="0x..."
                  value={tokenForm.metadata.royaltyReceiver || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        royaltyReceiver: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Marketplace Whitelist</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="opensea"
                    checked={
                      tokenForm.metadata.marketplaces?.includes("opensea") ||
                      false
                    }
                    onCheckedChange={(checked) => {
                      const current = tokenForm.metadata.marketplaces || [];
                      const updated = checked
                        ? [...current, "opensea"]
                        : current.filter((m: string) => m !== "opensea");

                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          marketplaces: updated,
                        },
                      }));
                    }}
                  />
                  <Label htmlFor="opensea">OpenSea</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="looksrare"
                    checked={
                      tokenForm.metadata.marketplaces?.includes("looksrare") ||
                      false
                    }
                    onCheckedChange={(checked) => {
                      const current = tokenForm.metadata.marketplaces || [];
                      const updated = checked
                        ? [...current, "looksrare"]
                        : current.filter((m: string) => m !== "looksrare");

                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          marketplaces: updated,
                        },
                      }));
                    }}
                  />
                  <Label htmlFor="looksrare">LooksRare</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blur"
                    checked={
                      tokenForm.metadata.marketplaces?.includes("blur") || false
                    }
                    onCheckedChange={(checked) => {
                      const current = tokenForm.metadata.marketplaces || [];
                      const updated = checked
                        ? [...current, "blur"]
                        : current.filter((m: string) => m !== "blur");

                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          marketplaces: updated,
                        },
                      }));
                    }}
                  />
                  <Label htmlFor="blur">Blur</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom-marketplace"
                    checked={tokenForm.metadata.customMarketplace || false}
                    onCheckedChange={(checked) => {
                      setTokenForm((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          customMarketplace: !!checked,
                        },
                      }));
                    }}
                  />
                  <Label htmlFor="custom-marketplace">Custom</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMarketplaceAddress">
                Custom Marketplace Address
              </Label>
              <Input
                id="customMarketplaceAddress"
                placeholder="0x..."
                disabled={!tokenForm.metadata.customMarketplace}
                value={tokenForm.metadata.customMarketplaceAddress || ""}
                onChange={(e) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      customMarketplaceAddress: e.target.value,
                    },
                  }))
                }
              />
            </div>

            <div className="flex space-x-2">
              <Button>
                <DollarSign className="h-4 w-4 mr-2" /> Set Royalties
              </Button>
              <Button variant="outline">Enable Marketplace</Button>
            </div>
          </div>
        )}
      </div>

      {/* 7. Token Features Panel */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <SectionHeader
          title="Token Features"
          section="tokenFeatures"
          icon={<Coins className="h-5 w-5 text-indigo-500" />}
        />

        {openSections.tokenFeatures && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure additional token features and capabilities
            </p>

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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="supportsBatchTransfers"
                  checked={tokenForm.metadata.supportsBatchTransfers !== false} // Default to true
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        supportsBatchTransfers: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="supportsBatchTransfers">
                    Supports Batch Transfers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable efficient batch operations
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="supportsOperatorFiltering"
                  checked={
                    tokenForm.metadata.supportsOperatorFiltering || false
                  }
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        supportsOperatorFiltering: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="supportsOperatorFiltering">
                    Operator Filtering
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Filter operators who can manage tokens
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ERC1155Config;
