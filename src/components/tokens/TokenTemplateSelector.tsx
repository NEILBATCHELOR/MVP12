import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Plus, Check } from "lucide-react";

// Define the product template structure
interface TokenTemplate {
  name: string;
  description: string;
  primary: {
    structure: string;
    description: string;
  };
  alternative: {
    structure: string;
    description: string;
  };
}

// Define the product categories
const PRODUCT_CATEGORIES = [
  {
    name: "Traditional Assets",
    products: [
      "Structured Products",
      "Equity",
      "Commodities",
      "Funds, ETFs, ETPs",
      "Bonds",
      "Quantitative Investment Strategies",
    ],
  },
  {
    name: "Alternative Assets",
    products: [
      "Private Equity",
      "Private Debt",
      "Real Estate",
      "Energy",
      "Infrastructure",
      "Collectibles & all other assets",
    ],
  },
  {
    name: "Digital Assets",
    products: ["Digital Tokenised Fund"],
  },
];

// Define the token templates for each product
const TOKEN_TEMPLATES: Record<string, TokenTemplate> = {
  "Structured Products": {
    name: "Structured Products",
    description:
      "Regulatory compliance, issuer control, and enhanced liquidity.",
    primary: {
      structure: "ERC-1400 → ERC-20",
      description:
        "Default token structure designed for ease of compliance, investor control, and liquidity.",
    },
    alternative: {
      structure: "ERC-1400 + ERC-3525 → ERC-20",
      description:
        "Advanced token configuration allowing for additional features such as fractional ownership.",
    },
  },
  Equity: {
    name: "Equity",
    description:
      "Simplified compliance, investor governance, and efficient secondary market liquidity.",
    primary: {
      structure: "ERC-1400 → ERC-20",
      description:
        "Default token structure designed for ease of compliance, investor control, and liquidity.",
    },
    alternative: {
      structure: "ERC-1400 + ERC-3525 → ERC-20",
      description:
        "Advanced token configuration allowing for additional features such as fractional ownership.",
    },
  },
  Commodities: {
    name: "Commodities",
    description:
      "Batch efficiency, fractionalization, and improved tradability.",
    primary: {
      structure: "ERC-1155 → ERC-20",
      description:
        "Default token structure designed for batch efficiency and fractionalization.",
    },
    alternative: {
      structure: "ERC-20 (direct fungible commodities)",
      description: "Direct fungible token implementation for commodities.",
    },
  },
  "Funds, ETFs, ETPs": {
    name: "Funds, ETFs, ETPs",
    description:
      "Automated yield management, clear NAV calculations, and compliance with fund structures.",
    primary: {
      structure: "ERC-1400 + ERC-4626 vaults can wrap ERC-20 tokens",
      description:
        "Default token structure designed for automated yield management and compliance.",
    },
    alternative: {
      structure: "ERC-4626 vaults can wrap ERC-20 tokens",
      description: "Simplified vault structure for wrapping ERC-20 tokens.",
    },
  },
  Bonds: {
    name: "Bonds",
    description:
      "Clear issuer control, enhanced compliance, and seamless liquidity in debt markets.",
    primary: {
      structure: "ERC-1400 → ERC-20",
      description:
        "Default token structure designed for issuer control and compliance.",
    },
    alternative: {
      structure: "ERC-1400 + ERC-3525 → ERC-20",
      description:
        "Advanced token configuration allowing for additional features such as fractional ownership.",
    },
  },
  "Quantitative Investment Strategies": {
    name: "Quantitative Investment Strategies",
    description:
      "Efficient management, compliance, and seamless yield strategy integration.",
    primary: {
      structure: "ERC-1400 + ERC-4626 vaults",
      description:
        "Default token structure designed for efficient management and yield strategy integration.",
    },
    alternative: {
      structure: "ERC-4626 vaults",
      description: "Simplified vault structure for yield strategy integration.",
    },
  },
  "Private Equity": {
    name: "Private Equity",
    description:
      "Regulatory adherence, controlled investor restrictions, and fractional liquidity.",
    primary: {
      structure: "ERC-1400 → ERC-20",
      description:
        "Default token structure designed for regulatory adherence and controlled investor restrictions.",
    },
    alternative: {
      structure: "ERC-1400 + ERC-3525 → ERC-20",
      description:
        "Advanced token configuration allowing for additional features such as fractional ownership.",
    },
  },
  "Private Debt": {
    name: "Private Debt",
    description:
      "Issuer-controlled compliance, fractional tradability, and efficient debt issuance.",
    primary: {
      structure: "ERC-1400 → ERC-20",
      description:
        "Default token structure designed for issuer-controlled compliance and efficient debt issuance.",
    },
    alternative: {
      structure: "ERC-1400 + ERC-3525 → ERC-20",
      description:
        "Advanced token configuration allowing for additional features such as fractional ownership.",
    },
  },
  "Real Estate": {
    name: "Real Estate",
    description:
      "Strong compliance controls, flexible fractional ownership, and improved asset tokenization.",
    primary: {
      structure: "ERC-1400 + ERC-3525 → ERC-20",
      description:
        "Default token structure designed for strong compliance controls and flexible fractional ownership.",
    },
    alternative: {
      structure: "ERC-1400 → ERC-20",
      description: "Simplified token structure for compliance and liquidity.",
    },
  },
  Energy: {
    name: "Energy",
    description:
      "Batch management, compliance, and optimized market trading efficiency.",
    primary: {
      structure: "ERC-1400 + ERC-1155 → ERC-20",
      description:
        "Default token structure designed for batch management and compliance.",
    },
    alternative: {
      structure: "ERC-1400 → ERC-20",
      description: "Simplified token structure for compliance and liquidity.",
    },
  },
  Infrastructure: {
    name: "Infrastructure",
    description:
      "Compliance for large-scale projects, fractionalized infrastructure investment.",
    primary: {
      structure: "ERC-1400 + ERC-3525 → ERC-20",
      description:
        "Default token structure designed for compliance and fractionalized infrastructure investment.",
    },
    alternative: {
      structure: "ERC-1400 → ERC-20",
      description: "Simplified token structure for compliance and liquidity.",
    },
  },
  "Collectibles & all other assets": {
    name: "Collectibles & Other Assets",
    description:
      "Clear uniqueness, fractional tradability, and optimized market liquidity for unique assets.",
    primary: {
      structure: "ERC-721 / ERC-1155 → ERC-20",
      description:
        "Default token structure designed for clear uniqueness and fractional tradability.",
    },
    alternative: {
      structure: "ERC-721 → ERC-20",
      description:
        "Simplified token structure for unique assets with liquidity.",
    },
  },
  "Digital Tokenised Fund": {
    name: "Digital Tokenized Fund",
    description:
      "Efficient yield management, compliance, and seamless integration with fund strategies.",
    primary: {
      structure: "ERC-1400 + ERC-4626 vaults can wrap ERC-20 tokens",
      description:
        "Default token structure designed for efficient yield management and compliance.",
    },
    alternative: {
      structure: "ERC-4626 vaults",
      description: "Simplified vault structure for yield management.",
    },
  },
};

// Add a custom template option
TOKEN_TEMPLATES["Custom Template"] = {
  name: "Custom Template",
  description: "Complete flexibility for unique tokenization models.",
  primary: {
    structure: "User-defined combination",
    description:
      "User-defined combination of ERC-20, ERC-721, ERC-1155, ERC-1400, ERC-3525, and ERC-4626.",
  },
  alternative: {
    structure: "Fully customizable selection",
    description:
      "Fully customizable selection of token standards and configurations.",
  },
};

interface TokenTemplateSelectorProps {
  onSelect: (product: string, isAlternative: boolean) => void;
  selectedProduct?: string;
  selectedAlternative?: boolean;
}

const TokenTemplateSelector: React.FC<TokenTemplateSelectorProps> = ({
  onSelect,
  selectedProduct,
  selectedAlternative
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedView, setSelectedView] = useState<"categories" | "products" | "template">("categories");
  const [currentProduct, setCurrentProduct] = useState<string>(selectedProduct || "");
  const [isAlternative, setIsAlternative] = useState<boolean>(selectedAlternative || false);

  // Update state when props change
  React.useEffect(() => {
    if (selectedProduct) {
      setCurrentProduct(selectedProduct);
      
      // Find category for this product
      for (const category of PRODUCT_CATEGORIES) {
        if (category.products.includes(selectedProduct)) {
          setSelectedCategory(category.name);
          setSelectedView("template");
          break;
        }
      }
    }
    
    if (selectedAlternative !== undefined) {
      setIsAlternative(selectedAlternative);
    }
  }, [selectedProduct, selectedAlternative]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedView("products");
  };

  const handleProductSelect = (product: string) => {
    setCurrentProduct(product);
    setSelectedView("template");
  };

  const handleTemplateSelect = (isAlt: boolean) => {
    setIsAlternative(isAlt);
    onSelect(currentProduct, isAlt);
  };

  const handleBackToCategories = () => {
    setSelectedView("categories");
    setSelectedCategory("");
  };

  const handleBackToProducts = () => {
    setSelectedView("products");
  };
  
  return (
    <div className="space-y-6">
      {selectedView === "categories" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Product Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRODUCT_CATEGORIES.map((category) => (
              <Card
                key={category.name}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleCategorySelect(category.name)}
              >
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {category.products.length} product
                    {category.products.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {category.products.map((product) => (
                      <Badge key={product} variant="secondary">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedView === "products" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToCategories}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRODUCT_CATEGORIES.find(
              (category) => category.name === selectedCategory
            )?.products.map((product) => (
              <Card
                key={product}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleProductSelect(product)}
              >
                <CardHeader>
                  <CardTitle>{product}</CardTitle>
                  <CardDescription>
                    {TOKEN_TEMPLATES[product]?.description ||
                      "Tokenize this asset type"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedView === "template" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToProducts}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{currentProduct}</CardTitle>
              <CardDescription>
                {TOKEN_TEMPLATES[currentProduct]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="primary">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="primary">Primary Structure</TabsTrigger>
                  <TabsTrigger value="alternative">
                    Alternative Structure
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="primary">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {TOKEN_TEMPLATES[currentProduct]?.primary.structure}
                      </h3>
                      <p className="text-muted-foreground">
                        {TOKEN_TEMPLATES[currentProduct]?.primary.description}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleTemplateSelect(false)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isAlternative === false ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {isAlternative === false
                        ? "Selected"
                        : "Use Primary Structure"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="alternative">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {TOKEN_TEMPLATES[currentProduct]?.alternative.structure}
                      </h3>
                      <p className="text-muted-foreground">
                        {
                          TOKEN_TEMPLATES[currentProduct]?.alternative
                            .description
                        }
                      </p>
                    </div>

                    <Button
                      onClick={() => handleTemplateSelect(true)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isAlternative === true ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {isAlternative === true
                        ? "Selected"
                        : "Use Alternative Structure"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TokenTemplateSelector;
