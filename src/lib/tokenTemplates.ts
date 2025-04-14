export interface TokenTemplate {
  id: string;
  name: string;
  primaryStructure: {
    description: string;
    tokens: string[];
    conversionType: "wrap" | "convert" | "direct" | "custom";
  };
  alternativeStructure: {
    description: string;
    tokens: string[];
    conversionType: "wrap" | "convert" | "direct" | "custom";
  };
  compellingReason: string;
  details: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  templateId: string;
}

export const TOKEN_TEMPLATES: TokenTemplate[] = [
  {
    id: "structured-products",
    name: "Structured Products",
    primaryStructure: {
      description: "ERC-1400 → ERC-20",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description: "ERC-1400 + ERC-3525 → ERC-20",
      tokens: ["ERC-1400", "ERC-3525", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason: "Regulatory compliance, issuer control, liquidity",
    details:
      "Structured products benefit from the compliance features of ERC-1400 while maintaining liquidity through ERC-20 conversion. The alternative structure adds ERC-3525 for enhanced customization of semi-fungible features.",
  },
  {
    id: "equity",
    name: "Equity",
    primaryStructure: {
      description: "ERC-1400 → ERC-20",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description: "ERC-1400 + ERC-3525 → ERC-20",
      tokens: ["ERC-1400", "ERC-3525", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason: "Simple compliance, investor governance, liquidity",
    details:
      "Equity tokens leverage ERC-1400 for compliance and governance features, with ERC-20 conversion for liquidity. The alternative adds ERC-3525 for more granular investor rights and governance mechanisms.",
  },
  {
    id: "commodities",
    name: "Commodities",
    primaryStructure: {
      description: "ERC-1155 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1155", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description: "ERC-20 directly (purely fungible commodities)",
      tokens: ["ERC-20"],
      conversionType: "direct",
    },
    compellingReason: "Batch efficiency, fractionalization, tradability",
    details:
      "Commodities benefit from ERC-1155's batch transfer capabilities with conversion to ERC-20 for liquidity. For purely fungible commodities, direct ERC-20 implementation is more efficient.",
  },
  {
    id: "funds-etfs-etps",
    name: "Funds, ETFs, ETPs",
    primaryStructure: {
      description: "ERC-1400 + ERC-4626 vaults can wrap ERC-20 tokens",
      tokens: ["ERC-1400", "ERC-4626", "ERC-20"],
      conversionType: "wrap",
    },
    alternativeStructure: {
      description: "ERC-4626 vaults can wrap ERC-20 tokens",
      tokens: ["ERC-4626", "ERC-20"],
      conversionType: "wrap",
    },
    compellingReason: "Automated yield management, NAV clarity, compliance",
    details:
      "Fund structures benefit from ERC-4626 vault standards for yield management and NAV calculations. The primary structure adds ERC-1400 for additional compliance features.",
  },
  {
    id: "bonds",
    name: "Bonds",
    primaryStructure: {
      description: "ERC-1400 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description:
        "ERC-1400 + ERC-3525 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-3525", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason: "Clear issuer control, compliance, easy market liquidity",
    details:
      "Bond tokens use ERC-1400 for issuer control and compliance, with ERC-20 conversion for secondary market liquidity. The alternative adds ERC-3525 for more complex bond structures with varying maturities or rates.",
  },
  {
    id: "quantitative-strategies",
    name: "Quantitative Strategies",
    primaryStructure: {
      description: "ERC-1400 + ERC-4626 vaults can wrap ERC-20 tokens",
      tokens: ["ERC-1400", "ERC-4626", "ERC-20"],
      conversionType: "wrap",
    },
    alternativeStructure: {
      description: "ERC-4626 vaults can wrap ERC-20 tokens",
      tokens: ["ERC-4626", "ERC-20"],
      conversionType: "wrap",
    },
    compellingReason: "Efficient management, compliance, yield integration",
    details:
      "Quantitative strategy tokens benefit from ERC-4626 vault standards for yield calculations and strategy implementation. The primary structure adds ERC-1400 for compliance features.",
  },
  {
    id: "private-equity",
    name: "Private Equity",
    primaryStructure: {
      description: "ERC-1400 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description:
        "ERC-1400 + ERC-3525 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-3525", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason:
      "Regulatory adherence, investor restrictions, fractional liquidity",
    details:
      "Private equity tokens require strong regulatory controls via ERC-1400 with potential for limited liquidity through ERC-20 conversion. The alternative adds ERC-3525 for more granular investor rights and restrictions.",
  },
  {
    id: "private-debt",
    name: "Private Debt",
    primaryStructure: {
      description: "ERC-1400 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description:
        "ERC-1400 + ERC-3525 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-3525", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason: "Issuer-controlled compliance, fractional tradability",
    details:
      "Private debt tokens use ERC-1400 for issuer control and compliance, with potential for limited liquidity through ERC-20 conversion. The alternative adds ERC-3525 for tranches or varying terms.",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    primaryStructure: {
      description:
        "ERC-1400 + ERC-3525 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-3525", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description:
        "ERC-1400 → with conversion to ERC-20 for liquidity (simpler fractionalization)",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason:
      "Flexible fractional ownership, strong compliance controls",
    details:
      "Real estate tokens benefit from ERC-3525's semi-fungible properties for representing different properties or units, with ERC-1400 for compliance and ERC-20 for liquidity.",
  },
  {
    id: "energy",
    name: "Energy",
    primaryStructure: {
      description:
        "ERC-1400 + ERC-1155 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-1155", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description:
        "ERC-1400 → with conversion to ERC-20 for liquidity (simple issuance)",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason: "Batch management, compliance, efficient market trading",
    details:
      "Energy tokens use ERC-1155 for batch management of different energy types or sources, with ERC-1400 for compliance and ERC-20 for market trading.",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    primaryStructure: {
      description:
        "ERC-1400 + ERC-3525 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-1400", "ERC-3525", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description:
        "ERC-1400 → with conversion to ERC-20 for liquidity (if no differentiation needed)",
      tokens: ["ERC-1400", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason:
      "Compliance for large-scale projects, flexible fractionalization",
    details:
      "Infrastructure tokens use ERC-3525 for representing different project phases or components, with ERC-1400 for compliance and ERC-20 for liquidity.",
  },
  {
    id: "collectibles-other-assets",
    name: "Collectibles & Other Assets",
    primaryStructure: {
      description:
        "ERC-721 / ERC-1155 → with conversion to ERC-20 for liquidity",
      tokens: ["ERC-721", "ERC-1155", "ERC-20"],
      conversionType: "convert",
    },
    alternativeStructure: {
      description:
        "ERC-721 → with conversion to ERC-20 for liquidity (for highly unique assets)",
      tokens: ["ERC-721", "ERC-20"],
      conversionType: "convert",
    },
    compellingReason: "Clear uniqueness, fractional tradability",
    details:
      "Collectible tokens use ERC-721 for unique items or ERC-1155 for collections, with potential conversion to ERC-20 for fractional ownership and liquidity.",
  },
  {
    id: "digital-tokenized-fund",
    name: "Digital Tokenized Fund",
    primaryStructure: {
      description: "ERC-1400 + ERC-4626 vaults can wrap ERC-20 tokens",
      tokens: ["ERC-1400", "ERC-4626", "ERC-20"],
      conversionType: "wrap",
    },
    alternativeStructure: {
      description: "ERC-4626 vaults can wrap ERC-20 tokens",
      tokens: ["ERC-4626", "ERC-20"],
      conversionType: "wrap",
    },
    compellingReason:
      "Efficient yield management, compliance, seamless trading",
    details:
      "Digital fund tokens use ERC-4626 for standardized yield calculations and vault operations, with ERC-1400 for compliance in the primary structure.",
  },
  {
    id: "custom-template",
    name: "Custom Template",
    primaryStructure: {
      description:
        "Any possible combination of ERC-20, ERC-721, ERC-1155, ERC-1400, ERC-3525 and ERC4626 available to be selected together.",
      tokens: [
        "ERC-20",
        "ERC-721",
        "ERC-1155",
        "ERC-1400",
        "ERC-3525",
        "ERC-4626",
      ],
      conversionType: "custom",
    },
    alternativeStructure: {
      description: "The user can choose which 3 tokens to create together.",
      tokens: [],
      conversionType: "custom",
    },
    compellingReason:
      "Complete customisation of tokens types created as assets",
    details:
      "Custom templates allow for maximum flexibility in token design, combining any of the available standards to meet specific business requirements.",
  },
];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "structured-products",
    name: "Structured Products",
    description:
      "Financial instruments with predefined risk-return profiles based on underlying assets",
    templateId: "structured-products",
  },
  {
    id: "equity",
    name: "Equity",
    description: "Ownership shares in a company or organization",
    templateId: "equity",
  },
  {
    id: "commodities",
    name: "Commodities",
    description:
      "Raw materials or primary agricultural products that can be bought and sold",
    templateId: "commodities",
  },
  {
    id: "funds-etfs-etps",
    name: "Funds, ETFs, ETPs",
    description:
      "Investment vehicles that pool assets and typically track indexes, sectors, or strategies",
    templateId: "funds-etfs-etps",
  },
  {
    id: "bonds",
    name: "Bonds",
    description:
      "Debt securities where investors loan money to an entity for a defined period at a fixed interest rate",
    templateId: "bonds",
  },
  {
    id: "quantitative-strategies",
    name: "Quantitative Strategies",
    description:
      "Investment approaches using mathematical models and algorithms to identify opportunities",
    templateId: "quantitative-strategies",
  },
  {
    id: "private-equity",
    name: "Private Equity",
    description:
      "Investment in private companies or buyouts of public companies",
    templateId: "private-equity",
  },
  {
    id: "private-debt",
    name: "Private Debt",
    description:
      "Loans made to private companies or assets not traded on public markets",
    templateId: "private-debt",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description:
      "Property investments including land, buildings, and related assets",
    templateId: "real-estate",
  },
  {
    id: "energy",
    name: "Energy",
    description:
      "Investments in energy production, distribution, or related infrastructure",
    templateId: "energy",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description:
      "Long-term investments in physical systems like transportation, utilities, and communications",
    templateId: "infrastructure",
  },
  {
    id: "collectibles-other-assets",
    name: "Collectibles & Other Assets",
    description:
      "Unique items valued for their rarity, cultural significance, or artistic merit",
    templateId: "collectibles-other-assets",
  },
  {
    id: "digital-tokenized-fund",
    name: "Digital Tokenized Fund",
    description:
      "Investment funds represented as digital tokens with automated management features",
    templateId: "digital-tokenized-fund",
  },
  {
    id: "custom-template",
    name: "Custom Template",
    description:
      "Create a fully customized token structure tailored to specific requirements",
    templateId: "custom-template",
  },
];

export function getTemplateByCategory(
  categoryId: string,
): TokenTemplate | undefined {
  const category = PRODUCT_CATEGORIES.find((cat) => cat.id === categoryId);
  if (!category) return undefined;

  return TOKEN_TEMPLATES.find(
    (template) => template.id === category.templateId,
  );
}

export function getTemplateById(templateId: string): TokenTemplate | undefined {
  return TOKEN_TEMPLATES.find((template) => template.id === templateId);
}
