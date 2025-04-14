import type { Country } from '@/lib/countries';
import type { InvestorType } from '@/lib/investorTypes';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  validityPeriod?: number; // in months
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  blockedCountries: string[]; // country ids
  blockedInvestorTypes: string[]; // investor type ids
  requiredDocuments: DocumentRequirement[];
  riskLevel: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ComplianceCheck {
  id: string;
  type: 'KYC' | 'KYB' | 'AML' | 'DOCUMENT' | 'RISK' | 'ASSET';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  result?: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  details: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export interface ComplianceAuditLog {
  id: string;
  entityType: 'INVESTOR' | 'ISSUER';
  entityId: string;
  action: string;
  details: Record<string, any>;
  performedBy: string;
  timestamp: Date;
}

export interface DocumentVerification {
  id: string;
  documentType: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationMethod: 'AUTOMATED' | 'MANUAL';
  verifiedBy?: string;
  verificationDate?: Date;
  expiryDate?: Date;
  rejectionReason?: string;
}

export interface RiskAssessment {
  id: string;
  entityId: string;
  entityType: 'INVESTOR' | 'ISSUER';
  riskLevel: RiskLevel;
  factors: {
    factor: string;
    weight: number;
    score: number;
  }[];
  totalScore: number;
  assessedBy: string;
  assessmentDate: Date;
  nextReviewDate: Date;
}

export interface ApprovalWorkflow {
  id: string;
  entityId: string;
  entityType: 'INVESTOR' | 'ISSUER';
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
  requiredApprovals: number;
  currentApprovals: number;
  approvers: {
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp?: Date;
    comments?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Investor-specific types
export interface InvestorCompliance {
  investorId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
  kycStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  amlStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  documents: DocumentVerification[];
  riskAssessment?: RiskAssessment;
  approvalWorkflow?: ApprovalWorkflow;
  checks: ComplianceCheck[];
  updatedAt: Date;
}

// Issuer-specific types
export interface IssuerCompliance {
  issuerId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
  kybStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  documents: DocumentVerification[];
  assetValidations: {
    assetId: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    details: Record<string, any>;
  }[];
  riskAssessment?: RiskAssessment;
  approvalWorkflow?: ApprovalWorkflow;
  checks: ComplianceCheck[];
  updatedAt: Date;
}