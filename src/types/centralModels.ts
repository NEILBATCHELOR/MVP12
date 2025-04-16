/**
 * Central Models - Core Type Definitions
 * 
 * This file contains all the core type definitions for the application.
 * It serves as the source of truth for data structures used across the app.
 * 
 * When adding new models:
 * 1. Keep interfaces focused on one entity
 * 2. Use composition over inheritance where possible
 * 3. Document complex properties with JSDoc comments
 * 4. Maintain consistency with the database schema
 */

import type { Database } from "./database";
import type { 
  SubscriptionTable, 
  RedemptionRequestTable, 
  TokenAllocationTable,
  TokenTable,
  TokenDesignTable,
  TokenVersionTable,
  TokenDeploymentTable,
  OrganizationTable,
  InvestorTable,
  InvestorApprovalTable,
  DistributionTable,
  DistributionRedemptionTable
} from "./database";

// Base Models (DB-Aligned)
// --------------------------------------------------

/**
 * Base model for any entity that has an ID and timestamps
 */
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * User model representing a system user
 */
export interface User extends BaseModel {
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  publicKey?: string;
  encryptedPrivateKey?: string;
  mfaEnabled?: boolean;
  lastLoginAt?: string;
  preferences?: Record<string, any>;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  INVESTOR = 'investor'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

/**
 * Project model representing an investment project
 */
export interface Project extends BaseModel {
  name: string;
  description?: string;
  status: ProjectStatus;
  projectType: ProjectType;
  tokenSymbol?: string;
  tokenPrice?: number;
  totalTokenSupply?: number;
  fundingGoal?: number;
  raisedAmount?: number;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  ownerId?: string;
  visibility?: 'public' | 'private' | 'invite_only';
  customFields?: Record<string, any>;
  tags?: string[];
  image?: string;
  title?: string;
  totalInvestors?: number;
  totalAllocation?: number;
  authorizedShares?: number;
  sharePrice?: number;
  companyValuation?: number;
  fundingRound?: string;
  legalEntity?: string;
  jurisdiction?: string;
  taxId?: string;
  isPrimary?: boolean;
  issuerDocuments?: IssuerDocument[];
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FUNDED = 'funded',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

// Enum for project types
export enum ProjectType {
  EQUITY = "equity",
  TOKEN = "token",
  HYBRID = "hybrid"
}

/**
 * Organization model representing an issuer
 */
export interface Organization extends BaseModel {
  name: string;
  legalName?: string;
  registrationNumber?: string;
  registrationDate?: string;
  taxId?: string;
  jurisdiction?: string;
  businessType?: string;
  status?: OrganizationStatus;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: Address;
  legalRepresentatives?: LegalRepresentative[];
  complianceStatus?: ComplianceStatusType;
  onboardingCompleted?: boolean;
}

export enum OrganizationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

export interface LegalRepresentative {
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary?: boolean;
}

export enum ComplianceStatusType {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review'
}

/**
 * Investor model representing an individual or institutional investor
 */
export interface Investor extends BaseModel {
  userId?: string;
  name: string;
  email: string;
  company?: string;
  type: InvestorEntityType;
  kycStatus?: KycStatus;
  kycVerifiedAt?: string;
  kycExpiryDate?: string;
  accreditationStatus?: AccreditationStatus;
  accreditationType?: string;
  accreditationVerifiedAt?: string;
  accreditationExpiresAt?: string;
  walletAddress?: string;
  riskScore?: number;
  riskFactors?: Record<string, any>;
  investorStatus?: InvestorStatus;
  onboardingCompleted?: boolean;
  riskAssessment?: RiskAssessment;
  profileData?: Record<string, any>;
  taxResidency?: string;
  taxIdNumber?: string;
  investmentPreferences?: InvestmentPreferences;
  lastComplianceCheck?: string;
}

export interface RiskAssessment {
  score: number;
  factors: string[];
  lastUpdated: string;
  recommendedAction?: string;
}

export interface InvestmentPreferences {
  preferredAssetClasses?: string[];
  riskTolerance?: 'low' | 'medium' | 'high';
  investmentHorizon?: 'short' | 'medium' | 'long';
  preferredRegions?: string[];
  targetReturn?: number;
  preferredCurrency?: string;
  investmentGoals?: string[];
}

export enum InvestorEntityType {
  INDIVIDUAL = 'individual',
  INSTITUTIONAL = 'institutional',
  SYNDICATE = 'syndicate'
}

export enum KycStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  FAILED = 'failed',
  NOT_STARTED = 'not_started',
  EXPIRED = 'expired'
}

export enum AccreditationStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  NOT_STARTED = 'not_started',
  EXPIRED = 'expired'
}

export enum InvestorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

/**
 * InvestorApproval model for managing investor approval processes
 */
export interface InvestorApproval extends BaseModel {
  investorId: string;
  reviewerId?: string;
  status: ApprovalStatus;
  rejectionReason?: string;
  approvalDate?: string;
  submissionDate: string;
  approvalType: ApprovalType;
  requiredDocuments?: DocumentRequirement[];
  reviewNotes?: string;
  metadata?: Record<string, any>;
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_REVIEW = 'in_review',
  DEFERRED = 'deferred'
}

export enum ApprovalType {
  KYC = 'kyc',
  ACCREDITATION = 'accreditation',
  WALLET = 'wallet',
  GENERAL = 'general'
}

export interface DocumentRequirement {
  documentType: string;
  description: string;
  isRequired: boolean;
  status?: string;
}

/**
 * Extended investor with investment details
 */
export interface InvestorWithDetails extends Investor {
  totalInvested?: number;
  projectCount?: number;
  lastActivityDate?: string;
  tags?: string[];
  notes?: string;
}

/**
 * Base Subscription model representing an investment subscription
 */
export interface BaseSubscription extends BaseModel {
  investorId: string;
  projectId: string;
  amount: number;
  tokenAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod?: string;
  paymentDate?: string;
  currency?: string;
  exchangeRate?: number;
}

/**
 * Base RedemptionRequest model for token redemption
 */
export interface BaseRedemptionRequest extends BaseModel {
  requestDate: string | Date;
  tokenAmount: number;
  tokenType: string;
  redemptionType: string;
  status: "Pending" | "Approved" | "Processing" | "Completed" | "Rejected";
  sourceWalletAddress: string;
  destinationWalletAddress: string;
  conversionRate: number;
  investorName?: string;
  investorId?: string;
  isBulkRedemption?: boolean;
  investorCount?: number;
  approvers: Approver[];
  requiredApprovals: number;
  windowId?: string;
  processedAmount?: number;
  processedDate?: string;
  notes?: string;
}

/**
 * Base TokenAllocation model
 */
export interface BaseTokenAllocation extends BaseModel {
  investorId: string;
  investorName: string;
  projectId: string;
  tokenType: string;
  subscribedAmount: number;
  allocatedAmount: number;
  confirmed: boolean;
  allocationConfirmed: boolean;
  allocationDate?: string;
  status: string;
  email?: string;
  company?: string;
  investorEmail?: string;
  subscriptionId?: string;
  currency?: string;
  fiatAmount?: number;
  walletAddress?: string;
}

/**
 * Approver interface for redemption approvals
 */
export interface Approver {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  approved: boolean;
  timestamp?: string;
}

/**
 * RedemptionWindow for token redemption periods
 */
export interface RedemptionWindow extends BaseModel {
  projectId: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'closed';
  totalTokensAvailable?: number;
  tokenPrice?: number;
  maxRedemptionPerInvestor?: number;
  terms?: string;
}

/**
 * Activity log for auditing
 */
export interface ActivityLog extends BaseModel {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  projectId?: string;
  details?: any;
  status?: 'success' | 'error' | 'pending';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Wallet model for blockchain wallets
 */
export interface Wallet extends BaseModel {
  name: string;
  type: WalletType;
  address: string;
  contractAddress?: string;
  userId?: string;
  signers?: string[];
  requiredConfirmations?: number;
  blockchain?: string;
  chainId?: number;
  isDefault?: boolean;
  encryptedPrivateKey?: string;
}

export enum WalletType {
  INDIVIDUAL = 'individual',
  MULTISIG = 'multisig',
  CUSTODIAL = 'custodial',
  EOA = 'EOA',
  SMART = 'SMART'
}

export enum TokenType {
  NATIVE = 'native',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  ERC1155 = 'erc1155'
}

/**
 * TokenBalance for displaying asset balances
 */
export interface TokenBalance {
  tokenAddress: string;
  tokenType: TokenType;
  name: string;
  symbol: string;
  balance: string;
  formattedBalance: string;
  decimals: number;
}

/**
 * Transaction model for blockchain transactions
 */
export interface Transaction extends BaseModel {
  walletId: string;
  to: string;
  value: string;
  data?: string;
  nonce?: number;
  description?: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  blockHash?: string;
  from?: string;
  gasLimit?: string;
  gasPrice?: string;
  chainId?: number;
  hash?: string;
  timestamp?: string;
}

/**
 * MultiSig transaction extension
 */
export interface MultiSigTransaction extends Transaction {
  confirmations: number;
  required: number;
  executed: boolean;
  createdBy?: string;
}

/**
 * UI representation of a project
 */
export interface ProjectUI {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status: string;
  projectType?: ProjectType;
  tokenSymbol?: string;
  totalTokenSupply?: number;
  tokenPrice?: number;
  sharePrice?: number;
  fundingGoal?: number;
  raisedAmount?: number;
  startDate?: string;
  endDate?: string;
  progress?: number;
  remainingDays?: number;
  investorCount?: number;
  totalInvestors?: number;
  companyValuation?: number;
  fundingRound?: string;
  legalEntity?: string;
  authorizedShares?: number;
  image?: string;
  tags?: string[];
  createdAt?: string;
  subscription?: Subscription | SubscriptionUI;
}

/**
 * Subscription UI representation
 */
export interface SubscriptionUI {
  id: string;
  status: "active" | "canceled" | "expired" | "trial";
  planName: string;
  planId: string;
  startDate: string;
  endDate?: string;
  billingCycle?: "monthly" | "yearly" | "one-time";
  price: number;
  paymentMethod?: {
    type: "credit_card" | "bank_transfer" | "crypto";
    last4?: string;
    expiryDate?: string;
    cardType?: string;
  };
  investorId?: string;
  projectId?: string;
  amount?: number;
  tokenAmount?: number;
  investorName?: string;
  projectName?: string;
  formattedAmount?: string;
  formattedDate?: string;
}

/**
 * Invoice model for billing
 */
export interface Invoice extends BaseModel {
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  items?: InvoiceItem[];
  notes?: string;
  termsAndConditions?: string;
}

/**
 * Invoice line item 
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

/**
 * Props for Empty State components
 */
export interface EmptyStateProps {
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
  action?: React.ReactNode;
}

/**
 * Workflow stage representation
 */
export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: string;
  completionPercentage?: number;
}

// Type mappings from database to application models
export type Subscription = SubscriptionTable & {
  investor_name?: string;
  investor_email?: string;
  project_name?: string;
  token_amount?: number;
  status?: string;
} & Partial<BaseSubscription>;

export type TokenAllocation = TokenAllocationTable & Partial<BaseTokenAllocation>;

export type RedemptionRequest = Omit<RedemptionRequestTable, 
  'created_at' | 'investor_id' | 'investor_name' | 'is_bulk_redemption' | 'investor_count' | 'token_amount' | 'token_type' | 'redemption_type' | 'status' | 'source_wallet_address' | 'destination_wallet_address' | 'conversion_rate' | 'notes'
> & {
  requestDate: string | null;
  tokenAmount: number;
  tokenType: string;
  redemptionType: string;
  status: string;
  sourceWalletAddress: string;
  destinationWalletAddress: string;
  conversionRate: number;
  investorId: string;
  investorName: string;
  isBulkRedemption: boolean;
  investorCount: number;
  approvers: any[];
  requiredApprovals: number;
  windowId: string;
  processedAmount: number;
  processedDate: string;
  notes: string;
  createdAt: string;
} & Partial<BaseRedemptionRequest>;

export type ToastVariant = "error" | "success" | "default" | "warning";

// Token related types
export interface Token extends BaseModel {
  name: string;
  symbol: string;
  decimals: number;
  standard: TokenStandard;
  projectId: string;
  blocks: Record<string, any>;
  metadata?: Record<string, any>;
  status: TokenStatus;
  reviewers?: string[];
  approvals?: string[];
  contractPreview?: string;
}

export interface TokenVersion extends BaseModel {
  tokenId: string;
  version: number;
  blocks?: Record<string, any>;
  metadata?: Record<string, any>;
  data: Record<string, any>;
  createdBy?: string;
  name?: string;
  symbol?: string;
  standard?: TokenStandard;
  decimals?: number;
}

export interface TokenDeployment extends BaseModel {
  tokenId: string;
  network: string;
  contractAddress: string;
  transactionHash: string;
  deployedBy: string;
  deployedAt?: string;
  status: 'PENDING' | 'DEPLOYED' | 'FAILED';
  deploymentData?: Record<string, any>;
}

export interface TokenTemplate extends BaseModel {
  name: string;
  description?: string;
  projectId: string;
  standard: TokenStandard;
  blocks: Record<string, any>;
  metadata?: Record<string, any>;
}

export enum TokenStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  READY_TO_MINT = 'READY_TO_MINT',
  MINTED = 'MINTED',
  DEPLOYED = 'DEPLOYED',
  PAUSED = 'PAUSED',
  DISTRIBUTED = 'DISTRIBUTED'
}

export enum TokenStandard {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155"
}

export interface TokenDocument {
  id: string;
  tokenId: string;
  name: string;
  description?: string;
  documentUrl: string;
  documentType: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvestorDocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REQUIRES_UPDATE = 'REQUIRES_UPDATE'
}

export interface InvestorDocument {
  id: string;
  investorId: string;
  name: string;
  description?: string;
  documentUrl: string;
  documentType: string;
  status: InvestorDocumentStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Type maps with database integration
export type TokenData = TokenTable & Partial<Token>;
export type TokenVersionData = TokenVersionTable & Partial<TokenVersion>;
export type TokenDeploymentData = TokenDeploymentTable & Partial<TokenDeployment>;
export type TokenDesignData = TokenDesignTable & Partial<TokenTemplate>; 
export type OrganizationData = OrganizationTable & Partial<Organization>;
export type InvestorData = InvestorTable & Partial<Investor>;
export type InvestorApprovalData = InvestorApprovalTable & Partial<InvestorApproval>;
export type DistributionData = DistributionTable & Partial<Distribution>;
export type DistributionRedemptionData = DistributionRedemptionTable & Partial<DistributionRedemption>;

/**
 * Issuer Document interface for project document uploads
 */
export interface IssuerDocument extends BaseModel {
  projectId: string;
  documentType: IssuerDocumentType;
  documentUrl: string;
  documentName: string;
  uploadedAt: string;
  updatedAt?: string;
  uploadedBy?: string;
  status: 'active' | 'archived' | 'pending_review';
  metadata?: Record<string, any>;
}

export enum IssuerDocumentType {
  ISSUER_CREDITWORTHINESS = 'issuer_creditworthiness',
  PROJECT_SECURITY_TYPE = 'project_security_type',
  OFFERING_DETAILS = 'offering_details',
  TERM_SHEET = 'term_sheet',
  SPECIAL_RIGHTS = 'special_rights',
  UNDERWRITERS = 'underwriters',
  USE_OF_PROCEEDS = 'use_of_proceeds',
  FINANCIAL_HIGHLIGHTS = 'financial_highlights',
  TIMING = 'timing',
  RISK_FACTORS = 'risk_factors',
  LEGAL_REGULATORY_COMPLIANCE = 'legal_regulatory_compliance'
}

/**
 * Distribution interface representing a confirmed token distribution with blockchain data
 */
export interface Distribution {
  id: string;
  tokenAllocationId: string;
  investorId: string;
  subscriptionId: string;
  projectId?: string;
  tokenType: string;
  tokenAmount: number;
  distributionDate: string;
  distributionTxHash: string;
  walletId?: string;
  blockchain: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  toAddress: string;
  walletAddress?: string;
  status: 'confirmed';
  notes?: string;
  remainingAmount: number;
  fullyRedeemed: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * DistributionRedemption interface representing the relationship between distributions and redemption requests
 */
export interface DistributionRedemption {
  id: string;
  distributionId: string;
  redemptionRequestId: string;
  amountRedeemed: number;
  createdAt: string;
  updatedAt?: string;
}