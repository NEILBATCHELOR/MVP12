import { ReactNode } from "react";

export interface TokenTemplate {
  name: string;
  description: string;
  category: string;
  standard: string;
  defaultBlocks: any;
  icon: ReactNode;
}

export interface Token {
  id: string;
  project_id: string;
  name: string;
  symbol: string;
  decimals: number;
  standard: string;
  blocks: any;
  metadata: any;
  status: string;
  contract_preview?: string;
  created_at: string;
  updated_at: string;
}

export interface TokenFormState {
  name: string;
  symbol: string;
  decimals: number;
  standard: string;
  totalSupply: number;
  blocks: {
    compliance: string[];
    features: string[];
    governance: string[];
  };
  metadata: {
    description: string;
    category: string;
    product: string;
    issuanceDate: string;
    maturityDate: string;
    tranches: {
      id: number;
      name: string;
      value: number;
      interestRate: number;
    }[];
    whitelistEnabled: boolean;
    jurisdictionRestrictions: string[];
    conversionRate: number;
    underlyingAsset: string;
    yieldStrategy: string;
    minDeposit: string;
    maxDeposit: string;
    redemptionNoticeDays: string;
    managementFee: string;
    navOracleEnabled: boolean;
    erc20ConversionRate: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export const getDefaultTokenForm = (): TokenFormState => ({
  name: "",
  symbol: "",
  decimals: 18,
  standard: "ERC-20",
  totalSupply: 1000000,
  blocks: {
    compliance: [],
    features: [],
    governance: [],
  },
  metadata: {
    description: "",
    category: "",
    product: "",
    issuanceDate: "",
    maturityDate: "",
    tranches: [],
    whitelistEnabled: true,
    jurisdictionRestrictions: [],
    conversionRate: 0,
    underlyingAsset: "ETH",
    yieldStrategy: "STAKING",
    minDeposit: "1000",
    maxDeposit: "1000000",
    redemptionNoticeDays: "30",
    managementFee: "2.0",
    navOracleEnabled: false,
    erc20ConversionRate: "1.0",
  },
});
