import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coins } from "lucide-react";

interface TokenSetupSectionProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
}

export const TokenSetupSection: React.FC<TokenSetupSectionProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-blue-500" />
        <h4 className="text-lg font-medium">Security Token Setup</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
        <div className="space-y-2">
          <Label htmlFor="name">Token Name*</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., SecurityToken"
            value={tokenForm.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="symbol">Token Symbol*</Label>
          <Input
            id="symbol"
            name="symbol"
            placeholder="e.g., STKN"
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
            placeholder="18"
            value={tokenForm.metadata.decimals || "18"}
            onChange={(e) =>
              setTokenForm((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  decimals: e.target.value,
                },
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerAddress">Owner Address (ETH Wallet)*</Label>
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
          <Label htmlFor="securityType">Security Type*</Label>
          <Select
            value={tokenForm.metadata.securityType || ""}
            onValueChange={(value) =>
              setTokenForm((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  securityType: value,
                },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select security type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="debt">Debt</SelectItem>
              <SelectItem value="derivative">Derivative</SelectItem>
              <SelectItem value="fund">Fund</SelectItem>
              <SelectItem value="reit">REIT</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuerName">Issuer Name*</Label>
          <Input
            id="issuerName"
            placeholder="Legal entity name"
            value={tokenForm.metadata.issuerName || ""}
            onChange={(e) =>
              setTokenForm((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  issuerName: e.target.value,
                },
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};
