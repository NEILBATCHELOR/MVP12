/**
 * Database Types - Core database-related type definitions
 * 
 * This file re-exports types from the Supabase-generated types
 * and provides additional custom database tables/types.
 */

import type { Json, Database } from './supabase';
export type { Database, Json } from './supabase';

// Helper types for Supabase - Re-exported from supabase.ts
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Export Enum types from Supabase
export type DocumentType = Database["public"]["Enums"]["document_type"];
export type DocumentStatus = Database["public"]["Enums"]["document_status"];
export type WorkflowStatus = Database["public"]["Enums"]["workflow_status"];
export type ComplianceStatus = Database["public"]["Enums"]["compliance_status"];

// Policy-related table exports
export type PolicyTemplateTable = Tables<'policy_templates'>;
export type PolicyTemplateInsert = InsertTables<'policy_templates'>;
export type PolicyTemplateUpdate = UpdateTables<'policy_templates'>;
export type PolicyTemplateApproverTable = Tables<'policy_template_approvers'>;
export type PolicyTemplateApproverInsert = InsertTables<'policy_template_approvers'>;

// Table type exports for use in centralModels.ts
export type UserTable = Tables<'users'>;
export type RoleTable = Tables<'roles'>;
export type SubscriptionTable = Tables<'subscriptions'>;
export type RedemptionRequestTable = Tables<'redemption_requests'>;
export type RedemptionApproverTable = Tables<'redemption_approvers'>;
export type TokenAllocationTable = Tables<'token_allocations'>;
export type TokenTable = Tables<'tokens'>;
export type TokenDesignTable = Tables<'token_templates'>;
export type TokenVersionTable = Tables<'token_versions'>;
export type TokenDeploymentTable = Tables<'token_deployments'>;
export type IssuerDocumentTable = Tables<'issuer_documents'>;
export type OrganizationTable = Tables<'organizations'>;
export type InvestorTable = Tables<'investors'>;
export type InvestorApprovalTable = Tables<'investor_approvals'>;

// Insert type exports
export type RedemptionRequestInsert = InsertTables<'redemption_requests'>;
export type RedemptionApproverInsert = InsertTables<'redemption_approvers'>;
export type OrganizationInsert = InsertTables<'organizations'>;
export type OrganizationUpdate = UpdateTables<'organizations'>;
export type InvestorInsert = InsertTables<'investors'>;
export type InvestorUpdate = UpdateTables<'investors'>;
export type InvestorApprovalInsert = InsertTables<'investor_approvals'>;
export type InvestorApprovalUpdate = UpdateTables<'investor_approvals'>;

// Template types for reuse in TokenTemplate related files
export type TokenTemplateInsert = InsertTables<'token_templates'>;
export type TokenTemplateUpdate = UpdateTables<'token_templates'>;

/**
 * Database Rule Table representation
 */
export interface RuleTable {
  rule_id: string;
  rule_name: string;
  rule_type: string;
  rule_details: Json;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_template: boolean;
}

/**
 * Database Rule Insert type
 */
export type RuleInsert = Omit<RuleTable, 'rule_id' | 'created_at' | 'updated_at'> & {
  rule_id?: string;
};

/**
 * Database Rule Update type
 */
export type RuleUpdate = Partial<Omit<RuleTable, 'rule_id' | 'created_at' | 'updated_at'>>;

/**
 * Database Template Version Table representation
 */
export interface TemplateVersionTable {
  version_id: string;
  template_id: string;
  version: string;
  version_data: Json;
  notes?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

/**
 * Database Template Version Insert type
 */
export type TemplateVersionInsert = Omit<TemplateVersionTable, 'version_id' | 'created_at' | 'updated_at'> & {
  version_id?: string;
};

/**
 * Database Template Version Update type
 */
export type TemplateVersionUpdate = Partial<Omit<TemplateVersionTable, 'version_id' | 'created_at' | 'updated_at'>>;

/**
 * Database Policy Rule Approver Table representation
 */
export interface PolicyRuleApproverTable {
  policy_rule_id: string;
  user_id: string;
  created_at: string;
  created_by: string;
  status?: string;
  comment?: string;
  timestamp?: string;
}

/**
 * Database Policy Version Table representation
 */
export interface PolicyVersionTable {
  version_id: string;
  policy_id: string;
  version_number: number;
  policy_data: Json;
  created_by: string;
  comment: string;
  timestamp: string;
}

/**
 * Database Audit Log Table representation
 */
export interface AuditLogTable {
  log_id: string;
  entity_id: string;
  entity_type: string;
  action: string;
  user_id: string;
  details: Json;
  timestamp: string;
}

/**
 * Database Policy Table representation
 * (Virtual view of the rules table for policies)
 */
export interface DatabasePolicy {
  id: string;
  name: string;
  description: string;
  type: string;
  jurisdiction: string;
  effectiveDate: string;
  expirationDate?: string;
  tags: string[];
  reviewFrequency?: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  version: number;
}

/**
 * Enhanced Organization Table (Issuer) representation
 */
export interface ExtendedOrganizationTable extends Partial<OrganizationTable> {
  legal_name?: string;
  registration_number?: string;
  registration_date?: string;
  tax_id?: string;
  jurisdiction?: string;
  business_type?: string;
  status?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: Json;
  legal_representatives?: Json;
  compliance_status?: string;
  onboarding_completed?: boolean;
}

/**
 * Enhanced Investor Table representation
 */
export interface ExtendedInvestorTable extends Partial<InvestorTable> {
  investor_status?: string;
  onboarding_completed?: boolean;
  risk_assessment?: Json;
  profile_data?: Json;
  accreditation_status?: string;
  accreditation_expiry_date?: string;
  accreditation_type?: string;
  tax_residency?: string;
  tax_id_number?: string;
  investment_preferences?: Json;
  last_compliance_check?: string;
}

// Stub types for files in compliance components that reference missing tables
export interface CountryRestriction {
  id: string;
  country_code: string;
  country_name: string;
  is_blocked: boolean;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface InvestorTypeRestriction {
  id: string;
  type: string;
  is_blocked: boolean;
  reason: string;
  minimum_investment?: number;
  required_documents: string[];
  created_at: string;
  updated_at: string;
}

export interface InvestorValidation {
  id: string;
  investor_id: string;
  is_eligible: boolean;
  reasons: string[];
  required_documents: string[];
  validated_at: string;
}

// Type from Supabase JS that was referenced but not exported
export interface FileObject {
  name: string;
  bucket_id: string;
  owner: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}