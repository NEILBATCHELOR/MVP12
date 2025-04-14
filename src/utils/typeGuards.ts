/**
 * Type Guards
 * 
 * This utility file provides type guard functions for runtime type checking
 * to help TypeScript narrow types correctly. They validate API response data
 * and ensure type safety when working with unknown data.
 */

import type { 
  Investor, 
  Organization, 
  InvestorApproval,
} from '@/types/centralModels';

import {
  InvestorEntityType,
  KycStatus,
  AccreditationStatus,
  InvestorStatus,
  OrganizationStatus,
  ComplianceStatusType
} from '@/types/centralModels';

/**
 * Check if a value is a valid UUID
 */
export const isUuid = (id: any): boolean => {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Check if a value is a valid date string
 */
export const isDateString = (date: any): boolean => {
  if (typeof date !== 'string') return false;
  return !isNaN(Date.parse(date));
};

/**
 * Type guard for Investor
 */
export const isInvestor = (obj: any): obj is Investor => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    isUuid(obj.id) &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    (
      obj.type === InvestorEntityType.INDIVIDUAL ||
      obj.type === InvestorEntityType.INSTITUTIONAL ||
      obj.type === InvestorEntityType.SYNDICATE
    ) &&
    (
      obj.kycStatus === undefined ||
      Object.values(KycStatus).includes(obj.kycStatus)
    ) &&
    (
      obj.accreditationStatus === undefined ||
      Object.values(AccreditationStatus).includes(obj.accreditationStatus)
    ) &&
    (
      obj.investorStatus === undefined ||
      Object.values(InvestorStatus).includes(obj.investorStatus)
    ) &&
    (
      obj.createdAt === undefined ||
      isDateString(obj.createdAt)
    )
  );
};

/**
 * Type guard for Organization
 */
export const isOrganization = (obj: any): obj is Organization => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    isUuid(obj.id) &&
    typeof obj.name === 'string' &&
    (
      obj.status === undefined ||
      Object.values(OrganizationStatus).includes(obj.status)
    ) &&
    (
      obj.complianceStatus === undefined ||
      Object.values(ComplianceStatusType).includes(obj.complianceStatus)
    ) &&
    (
      obj.onboardingCompleted === undefined ||
      typeof obj.onboardingCompleted === 'boolean'
    ) &&
    (
      obj.createdAt === undefined ||
      isDateString(obj.createdAt)
    )
  );
};

/**
 * Type guard for InvestorApproval
 */
export const isInvestorApproval = (obj: any): obj is InvestorApproval => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    isUuid(obj.id) &&
    isUuid(obj.investorId) &&
    (obj.reviewerId === undefined || isUuid(obj.reviewerId)) &&
    typeof obj.status === 'string' &&
    typeof obj.approvalType === 'string' &&
    typeof obj.submissionDate === 'string' &&
    (
      obj.approvalDate === undefined ||
      isDateString(obj.approvalDate)
    ) &&
    (
      obj.createdAt === undefined ||
      isDateString(obj.createdAt)
    )
  );
};

/**
 * Type guard for array of Investors
 */
export const areInvestors = (arr: any[]): arr is Investor[] => {
  return arr.every(isInvestor);
};

/**
 * Type guard for array of Organizations
 */
export const areOrganizations = (arr: any[]): arr is Organization[] => {
  return arr.every(isOrganization);
};

/**
 * Type guard for array of InvestorApprovals
 */
export const areInvestorApprovals = (arr: any[]): arr is InvestorApproval[] => {
  return arr.every(isInvestorApproval);
};