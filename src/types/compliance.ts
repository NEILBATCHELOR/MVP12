/**
 * Compliance module type definitions
 * Contains shared types for KYC/AML, identity verification, and compliance workflows
 */

import type { RiskLevel, ComplianceCheck } from '@/components/compliance/operations/types';
import type { OnfidoApplicant, OnfidoCheck } from './onfido';
import type { IdenfySessionResponse } from './idenfy';

/**
 * Identity verification providers supported by the system
 */
export type IdentityProvider = 'onfido' | 'idenfy' | 'manual';

/**
 * Mapping between investor and identity verification provider
 */
export interface IdentityProviderMapping {
  id: string;
  investorId: string;
  provider: IdentityProvider;
  providerId: string; // External ID (e.g., Onfido applicant ID)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * KYC verification status for an investor
 */
export type KycStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'EXPIRED'
  | 'REVIEW_REQUIRED';

/**
 * KYC verification result
 */
export type KycResult = 
  | 'PASS' 
  | 'FAIL' 
  | 'REVIEW_REQUIRED' 
  | 'PENDING';

/**
 * KYC verification record for an investor
 */
export interface KycVerification {
  id: string;
  investorId: string;
  provider: IdentityProvider;
  externalId?: string;
  status: KycStatus;
  result?: KycResult;
  checkId?: string;
  details: Record<string, any>;
  documents: KycDocument[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

/**
 * KYC document type
 */
export type KycDocumentType = 
  | 'PASSPORT' 
  | 'DRIVERS_LICENSE' 
  | 'ID_CARD' 
  | 'RESIDENCE_PERMIT'
  | 'UTILITY_BILL'
  | 'BANK_STATEMENT'
  | 'OTHER';

/**
 * KYC document status
 */
export type KycDocumentStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED';

/**
 * KYC document record
 */
export interface KycDocument {
  id: string;
  kycVerificationId: string;
  type: KycDocumentType;
  status: KycDocumentStatus;
  provider: IdentityProvider;
  externalId?: string;
  fileUrl?: string;
  rejectionReason?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * AML (Anti-Money Laundering) check status
 */
export type AmlStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'FAILED'
  | 'REVIEW_REQUIRED';

/**
 * AML check result
 */
export type AmlResult = 
  | 'NO_MATCH' 
  | 'POTENTIAL_MATCH' 
  | 'MATCH' 
  | 'ERROR';

/**
 * AML list types
 */
export type AmlListType = 
  | 'SANCTIONS' 
  | 'PEP' 
  | 'ADVERSE_MEDIA' 
  | 'WATCHLIST'
  | 'GLOBAL_SANCTIONS';

/**
 * AML check record
 */
export interface AmlCheck {
  id: string;
  investorId: string;
  provider: string;
  externalId?: string;
  status: AmlStatus;
  result?: AmlResult;
  listTypes: AmlListType[];
  details: Record<string, any>;
  matchDetails?: AmlMatchDetail[];
  createdAt: Date;
  completedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

/**
 * AML match detail record
 */
export interface AmlMatchDetail {
  listType: AmlListType;
  matchType: 'EXACT' | 'PARTIAL' | 'FUZZY';
  confidence: number; // 0-100 confidence score
  details: Record<string, any>;
}

/**
 * Risk factor category
 */
export type RiskFactorCategory =
  | 'GEOGRAPHIC'
  | 'CUSTOMER'
  | 'TRANSACTION'
  | 'BUSINESS'
  | 'REGULATORY';

/**
 * Risk factor definition
 */
export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  category: RiskFactorCategory;
  weight: number; // 1-10 weighting factor
  scoringLogic: string; // Description of scoring logic
  enabled: boolean;
}

/**
 * Risk factor assessment for a specific entity
 */
export interface RiskFactorAssessment {
  factorId: string;
  score: number; // 1-10 score
  notes?: string;
  assessedBy: string;
  assessedAt: Date;
}

/**
 * Types of entities that can be approved
 */
export type ApprovalEntityType = 'INVESTOR' | 'ISSUER' | 'TRANSACTION';

/**
 * Approval level
 */
export type ApprovalLevel = 'L1' | 'L2' | 'EXECUTIVE';

/**
 * Approval workflow status
 */
export type ApprovalStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'APPROVED' 
  | 'REJECTED'
  | 'ESCALATED';

/**
 * Approver role
 */
export type ApproverRole = 
  | 'COMPLIANCE_OFFICER' 
  | 'MANAGER' 
  | 'DIRECTOR' 
  | 'EXECUTIVE';

/**
 * Multi-signature approval workflow
 */
export interface ApprovalWorkflow {
  id: string;
  entityId: string;
  entityType: ApprovalEntityType;
  status: ApprovalStatus;
  requiredLevels: ApprovalLevel[];
  currentLevel: ApprovalLevel;
  approvers: Approver[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  escalationReason?: string;
  escalatedBy?: string;
  escalatedAt?: Date;
}

/**
 * Approver in an approval workflow
 */
export interface Approver {
  userId: string;
  level: ApprovalLevel;
  role: ApproverRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECUSED';
  timestamp?: Date;
  comments?: string;
}

/**
 * Compliance audit record
 */
export interface ComplianceAudit {
  id: string;
  entityType: ApprovalEntityType;
  entityId: string;
  action: string;
  details: Record<string, any>;
  performedBy: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

/**
 * Batch processing job for compliance checks
 */
export interface ComplianceBatchJob {
  id: string;
  jobType: 'KYC' | 'AML' | 'RISK_ASSESSMENT' | 'DOCUMENT_VERIFICATION';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  entityIds: string[];
  progress: number; // 0-100 percentage
  results: {
    succeeded: string[];
    failed: string[];
    details: Record<string, any>;
  };
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Mapping between provider types and our system types
 */
export interface IdentityProviderFactory {
  createApplicant: (investorData: any) => Promise<any>;
  getApplicant: (applicantId: string) => Promise<any>;
  createCheck: (applicantId: string, options?: any) => Promise<any>;
  getCheckResult: (checkId: string) => Promise<any>;
  mapProviderCheck: (providerCheck: any) => ComplianceCheck;
}