import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Image,
  Flame,
  ArrowRightLeft,
  FileText,
  Banknote,
  Layers,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ERC721ConfigProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
}

const ERC721Config: React.FC<ERC721ConfigProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
}) => {
  const [defaultAccordionValue, setDefaultAccordionValue] = useState<string[]>([
    "collection-setup",
  ]);

  // Helper function to handle metadata storage selection
  const handleMetadataStorageChange = (value: string) => {
    setTokenForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        storageType: value,
      },
    }));
  };

  // Helper function to handle marketplace selection
  const handleMarketplaceChange = (marketplace: string, checked: boolean) => {
    setTokenForm((prev) => {
      const currentMarketplaces = prev.metadata.marketplaces || [];
      const updatedMarketplaces = checked
        ? [...currentMarketplaces, marketplace]
        : currentMarketplaces.filter((m: string) => m !== marketplace);

      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          marketplaces: updatedMarketplaces,
        },
      };
    });
  };

  return (
    <div className="space-y-6 border-t pt-6 pb-6">
      <h3 className="text-lg font-medium">
        ERC-721 Non-Fungible Token Configuration
      </h3>

      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValue}
        className="w-full space-y-4"
      >
        {/* 1. NFT Collection Setup Panel */}
        <AccordionItem
          value="collection-setup"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-indigo-500" />
              <h4 className="text-base font-medium">NFT Collection Setup</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name*</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., MyNFT"
                  value={tokenForm.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Token Symbol*</Label>
                <Input
                  id="symbol"
                  name="symbol"
                  placeholder="e.g., MNFT"
                  value={tokenForm.symbol}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Metadata Storage</Label>
                <RadioGroup
                  value={tokenForm.metadata?.storageType || "ipfs"}
                  onValueChange={handleMetadataStorageChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on-chain" id="on-chain" />
                    <Label htmlFor="on-chain">On-Chain</Label>
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor="baseUri">Base URI</Label>
                <Input
                  id="baseUri"
                  placeholder="ipfs://"
                  value={tokenForm.metadata?.baseUri || ""}
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
                  Base URI for all token metadata (e.g., ipfs://Qm...)
                </p>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="default">
                Deploy Collection
              </Button>
              <Button type="button" variant="outline">
                Edit Collection
              </Button>
              <Button type="button" variant="destructive">
                Delete Collection
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Minting & Burning Panel */}
        <AccordionItem
          value="minting-burning"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h4 className="text-base font-medium">Minting & Burning</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tokenId">Token ID</Label>
                <Input
                  id="tokenId"
                  placeholder="Auto-Generated"
                  disabled
                  value={tokenForm.metadata?.nextTokenId || "Auto-Generated"}
                />
                <p className="text-xs text-muted-foreground">
                  Token ID will be auto-generated upon minting
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Recipient Address*</Label>
                <Input
                  id="recipientAddress"
                  placeholder="0x..."
                  value={tokenForm.metadata?.recipientAddress || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        recipientAddress: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="metadataUri">Metadata URI (Optional)</Label>
                <Input
                  id="metadataUri"
                  placeholder="ipfs://..."
                  value={tokenForm.metadata?.metadataUri || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        metadataUri: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="traits">Traits (Optional)</Label>
                <Textarea
                  id="traits"
                  placeholder='{"trait_type": "Background", "value": "Blue"}'
                  rows={4}
                  value={tokenForm.metadata?.traits || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        traits: e.target.value,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter traits in JSON format
                </p>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="default">
                Mint NFT
              </Button>
              <Button type="button" variant="destructive">
                Burn NFT
              </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="transferTokenId">Token ID</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Token ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token1">Token #1</SelectItem>
                    <SelectItem value="token2">Token #2</SelectItem>
                    <SelectItem value="token3">Token #3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentOwner">Current Owner</Label>
                <Input
                  id="currentOwner"
                  placeholder="0x..."
                  disabled
                  value={tokenForm.metadata?.currentOwner || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newOwner">New Owner Address*</Label>
                <Input
                  id="newOwner"
                  placeholder="0x..."
                  value={tokenForm.metadata?.newOwner || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        newOwner: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approveAddress">
                  Approve for Specific Address
                </Label>
                <Input
                  id="approveAddress"
                  placeholder="0x..."
                  value={tokenForm.metadata?.approveAddress || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        approveAddress: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approveMarketplace">
                  Approve for Marketplace
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opensea">OpenSea</SelectItem>
                    <SelectItem value="looksrare">LooksRare</SelectItem>
                    <SelectItem value="blur">Blur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="default">
                Transfer NFT
              </Button>
              <Button type="button" variant="outline">
                Approve Transfer
              </Button>
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
              <FileText className="h-5 w-5 text-emerald-500" />
              <h4 className="text-base font-medium">Metadata & Traits</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="metadataTokenId">Token ID</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Token ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="token1">Token #1</SelectItem>
                    <SelectItem value="token2">Token #2</SelectItem>
                    <SelectItem value="token3">Token #3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMetadataUri">Current Metadata URI</Label>
                <Input
                  id="currentMetadataUri"
                  placeholder="ipfs://..."
                  disabled
                  value={tokenForm.metadata?.currentMetadataUri || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="updateMetadataUri">Update Metadata URI</Label>
                <Input
                  id="updateMetadataUri"
                  placeholder="ipfs://..."
                  value={tokenForm.metadata?.updateMetadataUri || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        updateMetadataUri: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="updateTraits">Add/Edit Traits</Label>
                <Textarea
                  id="updateTraits"
                  placeholder='{"trait_type": "Background", "value": "Blue"}'
                  rows={4}
                  value={tokenForm.metadata?.updateTraits || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        updateTraits: e.target.value,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter traits in JSON format
                </p>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="default">
                Fetch Metadata
              </Button>
              <Button type="button" variant="outline">
                Update Metadata
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Royalties & Marketplace Integration Panel */}
        <AccordionItem
          value="royalties-marketplace"
          className="border rounded-lg p-2"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-amber-500" />
              <h4 className="text-base font-medium">
                Royalties & Marketplace Integration
              </h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="royaltyPercentage">
                  Royalty Percentage (%)
                </Label>
                <Input
                  id="royaltyPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={tokenForm.metadata?.royaltyPercentage || ""}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="royaltyReceiver">
                  Royalty Receiver Address
                </Label>
                <Input
                  id="royaltyReceiver"
                  placeholder="0x..."
                  value={tokenForm.metadata?.royaltyReceiver || ""}
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
              <div className="space-y-4 col-span-2">
                <Label>Marketplace Whitelist</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="opensea"
                      checked={
                        tokenForm.metadata?.marketplaces?.includes("opensea") ||
                        false
                      }
                      onCheckedChange={(checked) =>
                        handleMarketplaceChange("opensea", !!checked)
                      }
                    />
                    <Label htmlFor="opensea">OpenSea</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="looksrare"
                      checked={
                        tokenForm.metadata?.marketplaces?.includes(
                          "looksrare",
                        ) || false
                      }
                      onCheckedChange={(checked) =>
                        handleMarketplaceChange("looksrare", !!checked)
                      }
                    />
                    <Label htmlFor="looksrare">LooksRare</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="blur"
                      checked={
                        tokenForm.metadata?.marketplaces?.includes("blur") ||
                        false
                      }
                      onCheckedChange={(checked) =>
                        handleMarketplaceChange("blur", !!checked)
                      }
                    />
                    <Label htmlFor="blur">Blur</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="custom"
                      checked={
                        tokenForm.metadata?.marketplaces?.includes("custom") ||
                        false
                      }
                      onCheckedChange={(checked) =>
                        handleMarketplaceChange("custom", !!checked)
                      }
                    />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="customMarketplace">
                  Custom Marketplace (Specify)
                </Label>
                <Input
                  id="customMarketplace"
                  placeholder="Enter custom marketplace name"
                  value={tokenForm.metadata?.customMarketplace || ""}
                  onChange={(e) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        customMarketplace: e.target.value,
                      },
                    }))
                  }
                  disabled={
                    !tokenForm.metadata?.marketplaces?.includes("custom")
                  }
                />
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="default">
                Set Royalties
              </Button>
              <Button type="button" variant="outline">
                Enable Marketplace
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Token Features Section (Preserved from original) */}
        <AccordionItem value="token-features" className="border rounded-lg p-2">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              <h4 className="text-base font-medium">Token Features</h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mintable"
                  checked={tokenForm.metadata?.mintable || false}
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
                  checked={tokenForm.metadata?.burnable || false}
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
                  checked={tokenForm.metadata?.pausable || false}
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
                  checked={tokenForm.metadata?.transferRestrictions || false}
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
                  id="isTransferable"
                  checked={tokenForm.metadata?.isTransferable !== false} // Default to true
                  onCheckedChange={(checked) =>
                    setTokenForm((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        isTransferable: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label htmlFor="isTransferable">Is Transferable</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow tokens to be transferred between wallets
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ERC721Config;
