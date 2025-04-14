import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TokenTemplateDetailsProps {
  tokenForm: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  setTokenForm: (setter: (prev: any) => any) => void;
  onNext: () => void;
  selectedProduct: string;
  isAlternative: boolean;
}

// Define the token standards that need to be configured for each product template
const TOKEN_STANDARDS_CONFIG: Record<string, Record<string, string[]>> = {
  "Structured Products": {
    primary: ["ERC-1400", "ERC-20"],
    alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
  },
  Equity: {
    primary: ["ERC-1400", "ERC-20"],
    alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
  },
  Commodities: {
    primary: ["ERC-1155", "ERC-20"],
    alternative: ["ERC-20"],
  },
  "Funds, ETFs, ETPs": {
    primary: ["ERC-1400", "ERC-4626", "ERC-20"],
    alternative: ["ERC-4626", "ERC-20"],
  },
  Bonds: {
    primary: ["ERC-1400", "ERC-20"],
    alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
  },
  "Quantitative Investment Strategies": {
    primary: ["ERC-1400", "ERC-4626"],
    alternative: ["ERC-4626"],
  },
  "Private Equity": {
    primary: ["ERC-1400", "ERC-20"],
    alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
  },
  "Private Debt": {
    primary: ["ERC-1400", "ERC-20"],
    alternative: ["ERC-1400", "ERC-3525", "ERC-20"],
  },
  "Real Estate": {
    primary: ["ERC-1400", "ERC-3525", "ERC-20"],
    alternative: ["ERC-1400", "ERC-20"],
  },
  Energy: {
    primary: ["ERC-1400", "ERC-1155", "ERC-20"],
    alternative: ["ERC-1400", "ERC-20"],
  },
  Infrastructure: {
    primary: ["ERC-1400", "ERC-3525", "ERC-20"],
    alternative: ["ERC-1400", "ERC-20"],
  },
  "Collectibles & all other assets": {
    primary: ["ERC-721", "ERC-1155", "ERC-20"],
    alternative: ["ERC-721", "ERC-20"],
  },
  "Digital Tokenised Fund": {
    primary: ["ERC-1400", "ERC-4626", "ERC-20"],
    alternative: ["ERC-4626"],
  },
  "Custom Template": {
    primary: [
      "ERC-20",
      "ERC-721",
      "ERC-1155",
      "ERC-1400",
      "ERC-3525",
      "ERC-4626",
    ],
    alternative: [
      "ERC-20",
      "ERC-721",
      "ERC-1155",
      "ERC-1400",
      "ERC-3525",
      "ERC-4626",
    ],
  },
};

// Define descriptions for each token standard
const TOKEN_STANDARD_DESCRIPTIONS: Record<string, string> = {
  "ERC-20": "Fungible token standard for interchangeable assets",
  "ERC-721": "Non-fungible token standard for unique assets",
  "ERC-1155":
    "Multi-token standard supporting both fungible and non-fungible tokens",
  "ERC-1400": "Security token standard with compliance controls",
  "ERC-3525": "Semi-fungible token standard with slot-based value system",
  "ERC-4626": "Tokenized vault standard for yield-bearing assets",
};

const TokenTemplateDetails: React.FC<TokenTemplateDetailsProps> = ({
  tokenForm,
  handleInputChange,
  setTokenForm,
  onNext,
  selectedProduct,
  isAlternative,
}) => {
  const templateType = isAlternative ? "alternative" : "primary";
  const standards = TOKEN_STANDARDS_CONFIG[selectedProduct]?.[templateType] || [];

  // Get the structure string based on the product and template type
  const getStructureString = () => {
    if (selectedProduct === "Commodities" && isAlternative) {
      return "ERC-20 (direct fungible commodities)";
    }

    if (
      (selectedProduct === "Funds, ETFs, ETPs" ||
        selectedProduct === "Digital Tokenised Fund") &&
      !isAlternative
    ) {
      return "ERC-1400 + ERC-4626 vaults can wrap ERC-20 tokens";
    }

    if (
      (selectedProduct === "Funds, ETFs, ETPs" ||
        selectedProduct === "Digital Tokenised Fund") &&
      isAlternative
    ) {
      return "ERC-4626 vaults can wrap ERC-20 tokens";
    }

    if (selectedProduct === "Quantitative Investment Strategies" && !isAlternative) {
      return "ERC-1400 + ERC-4626 vaults";
    }

    if (selectedProduct === "Quantitative Investment Strategies" && isAlternative) {
      return "ERC-4626 vaults";
    }

    if (selectedProduct === "Collectibles & all other assets" && !isAlternative) {
      return "ERC-721 / ERC-1155 → ERC-20";
    }

    if (selectedProduct === "Custom Template") {
      return isAlternative
        ? "Fully customizable selection"
        : "User-defined combination";
    }

    // Default case: construct from standards
    if (standards.length === 1) {
      return standards[0];
    } else if (standards.length === 2) {
      return `${standards[0]} → ${standards[1]}`;
    } else if (standards.length > 2) {
      const lastStandard = standards[standards.length - 1];
      const otherStandards = standards
        .slice(0, standards.length - 1)
        .join(" + ");
      return `${otherStandards} → ${lastStandard}`;
    }

    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Template Details</h3>
          <Badge variant={isAlternative ? "outline" : "default"}>
            {isAlternative ? "Advanced" : "Recommended"}
          </Badge>
        </div>
        
        <div className="p-3 bg-muted/30 rounded-md mb-6">
          <div className="text-sm font-medium mb-1">Token Structure</div>
          <div className="text-lg font-medium">{getStructureString()}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input 
              id="name" 
              name="name" 
              value={tokenForm.name || ''} 
              onChange={handleInputChange} 
              placeholder="Enter a name for this template"
              className="mt-1" 
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={tokenForm.description || ''} 
              onChange={handleInputChange}
              placeholder="Describe the purpose of this template"
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-2">
          <h3 className="text-sm font-medium mb-2">
            Token Standards to Configure
          </h3>
          <div className="space-y-2">
            {standards.map((standard) => (
              <div
                key={standard}
                className="p-2 border rounded-md bg-card flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{standard}</div>
                  <div className="text-xs text-muted-foreground">
                    {TOKEN_STANDARD_DESCRIPTIONS[standard]}
                  </div>
                </div>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onNext} className="flex items-center gap-2">
            Configure Standards
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TokenTemplateDetails;
