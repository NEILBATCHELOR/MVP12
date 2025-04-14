// Core components
export { default as ComplianceDashboard } from './pages/Dashboard';

// KYC Components
export { default as OnfidoVerification } from './operations/kyc/components/OnfidoVerification';

// Document Components
export { default as DocumentUploader } from './operations/documents/components/DocumentUploader';
export { default as DocumentReview } from './operations/documents/components/DocumentReview';

// Approval Components
export { default as ApprovalWorkflow } from './operations/approvals/components/ApprovalWorkflow';

// Audit Components
export { default as AuditLogViewer } from './operations/audit/components/AuditLogViewer';

// Services
export { OnfidoService } from './operations/kyc/services/onfidoService';
export { IdenfyService } from './operations/kyc/services/idenfyService'; 
export { IdentityServiceFactory } from './operations/kyc/services/identityServiceFactory';
export { DocumentAnalysisService } from './operations/documents/services/documentAnalysisService';
export { ApprovalWorkflowService } from './operations/approvals/services/approvalWorkflowService';
export { AuditLogService } from './operations/audit/services/auditLogService';
export { SanctionsService } from './operations/aml/services/sanctionsService';
export { RiskScoringService } from './operations/risk/services/riskScoringService';

// Types - re-export from types/compliance.ts
export * from '@/types/compliance';