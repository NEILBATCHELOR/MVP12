/**
 * Type Mappers
 * 
 * This utility file provides functions to convert between database types (snake_case)
 * and application model types (camelCase). It handles data normalization and 
 * transformation for consistent type usage across the application.
 */

import type {
  Investor,
  Organization,
  InvestorApproval,
  BaseModel
} from '@/types/centralModels';

import type {
  InvestorTable,
  OrganizationTable,
  InvestorApprovalTable,
  InvestorInsert,
  OrganizationInsert,
  InvestorApprovalInsert
} from '@/types/database';

/**
 * Convert snake_case object keys to camelCase
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
export const toCamelCase = <T extends object>(obj: T): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    acc[camelKey] = value !== null && typeof value === 'object' ? toCamelCase(value) : value;
    
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Convert camelCase object keys to snake_case
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 */
export const toSnakeCase = <T extends object>(obj: T): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    acc[snakeKey] = value !== null && typeof value === 'object' ? toSnakeCase(value) : value;
    
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Map database investor to application model
 * @param investorDb - Database investor object
 * @returns Application investor model
 */
export const mapInvestorFromDatabase = (investorDb: InvestorTable): Investor => {
  const camelCaseInvestor = toCamelCase(investorDb);
  
  return {
    id: investorDb.investor_id,
    createdAt: investorDb.created_at,
    updatedAt: investorDb.updated_at,
    ...camelCaseInvestor,
  } as Investor;
};

/**
 * Map application investor model to database format
 * @param investor - Application investor model
 * @returns Database investor object
 */
export const mapInvestorToDatabase = (investor: Partial<Investor>): Partial<InvestorInsert> => {
  const { id, createdAt, updatedAt, ...rest } = investor as any;
  
  const snakeCaseData = toSnakeCase(rest);
  
  // If there's an ID, map it to investor_id for the database
  if (id) {
    snakeCaseData.investor_id = id;
  }
  
  return snakeCaseData;
};

/**
 * Map database organization to application model
 * @param orgDb - Database organization object
 * @returns Application organization model
 */
export const mapOrganizationFromDatabase = (orgDb: OrganizationTable): Organization => {
  const camelCaseOrg = toCamelCase(orgDb);
  
  return {
    id: orgDb.id,
    createdAt: orgDb.created_at,
    updatedAt: orgDb.updated_at,
    ...camelCaseOrg,
  } as Organization;
};

/**
 * Map application organization model to database format
 * @param org - Application organization model
 * @returns Database organization object
 */
export const mapOrganizationToDatabase = (org: Partial<Organization>): Partial<OrganizationInsert> => {
  const { id, createdAt, updatedAt, ...rest } = org as any;
  
  const snakeCaseData = toSnakeCase(rest);
  
  return snakeCaseData;
};

/**
 * Map database investor approval to application model
 * @param approvalDb - Database investor approval object
 * @returns Application investor approval model
 */
export const mapInvestorApprovalFromDatabase = (approvalDb: InvestorApprovalTable): InvestorApproval => {
  const camelCaseApproval = toCamelCase(approvalDb);
  
  return {
    id: approvalDb.id,
    createdAt: approvalDb.created_at,
    updatedAt: approvalDb.updated_at,
    ...camelCaseApproval,
  } as InvestorApproval;
};

/**
 * Map application investor approval model to database format
 * @param approval - Application investor approval model
 * @returns Database investor approval object
 */
export const mapInvestorApprovalToDatabase = (approval: Partial<InvestorApproval>): Partial<InvestorApprovalInsert> => {
  const { id, createdAt, updatedAt, ...rest } = approval as any;
  
  const snakeCaseData = toSnakeCase(rest);
  
  return snakeCaseData;
};

/**
 * Maps database investor to application investor model
 * This is a legacy mapper used by existing code
 * @param dbInvestor - Database investor object
 * @returns Application investor model
 */
export const mapDbInvestorToInvestor = (dbInvestor: any): any => {
  if (!dbInvestor) return null;
  
  return {
    id: dbInvestor.id || "",
    name: dbInvestor.name || "",
    email: dbInvestor.email || "",
    company: dbInvestor.company || "",
    type: dbInvestor.type || "individual",
    kycStatus: dbInvestor.kyc_status || "pending",
    kycExpiryDate: dbInvestor.kyc_expiry_date || null,
    walletAddress: dbInvestor.wallet_address || "",
    createdAt: dbInvestor.created_at ? new Date(dbInvestor.created_at) : new Date(),
    updatedAt: dbInvestor.updated_at ? new Date(dbInvestor.updated_at) : new Date()
  };
};

/**
 * Maps database project to ProjectUI model
 * This is a legacy mapper used by existing code
 * @param dbProject - Database project object
 * @returns ProjectUI model
 */
export const mapDbProjectToProject = (dbProject: any): any => {
  if (!dbProject) return null;
  
  return {
    id: dbProject.id || "",
    name: dbProject.name || "",
    description: dbProject.description || "",
    status: dbProject.status || "draft",
    projectType: dbProject.project_type || "token",
    tokenSymbol: dbProject.token_symbol || "",
    totalTokenSupply: dbProject.total_token_supply || 0,
    tokenPrice: dbProject.token_price || 0,
    sharePrice: dbProject.share_price || 0,
    fundingGoal: dbProject.target_raise || 0,
    raisedAmount: dbProject.raised_amount || 0,
    startDate: dbProject.start_date || null,
    endDate: dbProject.end_date || null,
    companyValuation: dbProject.company_valuation || 0,
    fundingRound: dbProject.funding_round || "",
    legalEntity: dbProject.legal_entity || "",
    authorizedShares: dbProject.authorized_shares || 0,
    createdAt: dbProject.created_at || null,
    investorCount: dbProject.investor_count || 0
  };
};

/**
 * Alias for mapDbProjectToProject for UI consistency
 * @param project - Project object (either DB format or already mapped)
 * @returns ProjectUI model
 */
export const mapProjectToProjectUI = mapDbProjectToProject;

/**
 * Maps subscription data to SubscriptionUI model
 * @param subscription - Subscription object from database or partial data
 * @returns SubscriptionUI model
 */
export const mapSubscriptionToSubscriptionUI = (subscription: any): any => {
  if (!subscription) return null;
  
  return {
    id: subscription.id || `sub_${Date.now()}`,
    investorId: subscription.investorId || subscription.investor_id || "",
    projectId: subscription.projectId || subscription.project_id || "",
    amount: subscription.amount || subscription.fiat_amount || 0,
    tokenAmount: subscription.tokenAmount || subscription.token_amount || 0,
    status: subscription.status || "active",
    planName: subscription.planName || "Basic",
    planId: subscription.planId || "basic",
    startDate: subscription.startDate || subscription.subscription_date || new Date().toISOString(),
    endDate: subscription.endDate || null,
    billingCycle: subscription.billingCycle || "monthly",
    price: subscription.price || subscription.fiat_amount || 0,
    investorName: subscription.investorName || subscription.investor_name || "",
    projectName: subscription.projectName || "",
    formattedAmount: subscription.formattedAmount || `$${subscription.fiat_amount || 0}`,
    formattedDate: subscription.formattedDate || subscription.subscription_date || new Date().toISOString()
  };
};

/**
 * Maps database redemption request to RedemptionRequest model
 * @param dbRedemption - Database redemption request object
 * @returns RedemptionRequest model
 */
export const mapDbRedemptionToRedemptionRequest = (dbRedemption: any): any => {
  if (!dbRedemption) return null;
  
  return {
    id: dbRedemption.id || "",
    requestDate: dbRedemption.request_date || null,
    tokenAmount: dbRedemption.token_amount || 0,
    tokenType: dbRedemption.token_type || "",
    redemptionType: dbRedemption.redemption_type || "",
    status: dbRedemption.status || "Pending",
    sourceWalletAddress: dbRedemption.source_wallet_address || "",
    destinationWalletAddress: dbRedemption.destination_wallet_address || "",
    conversionRate: dbRedemption.conversion_rate || 0,
    investorId: dbRedemption.investor_id || "",
    investorName: dbRedemption.investor_name || "",
    isBulkRedemption: dbRedemption.is_bulk_redemption || false,
    investorCount: dbRedemption.investor_count || 1,
    approvers: dbRedemption.approvers || [],
    requiredApprovals: dbRedemption.required_approvals || 0,
    windowId: dbRedemption.window_id || "",
    processedAmount: dbRedemption.processed_amount || 0,
    processedDate: dbRedemption.processed_date || null,
    notes: dbRedemption.notes || "",
    createdAt: dbRedemption.created_at || new Date().toISOString()
  };
};