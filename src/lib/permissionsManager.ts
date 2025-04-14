import { supabase } from "./supabase";
import type { Tables } from "@/types/database";

/**
 * Interface for permission check
 */
interface PermissionRequest {
  action: string;
  resource: string;
}

/**
 * Hard-coded demo permissions map for roles
 */
const DEMO_ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  super_admin: {
    "*": ["*"] // Super admin can do everything
  },
  compliance_manager: {
    "policies": ["create", "read", "update", "delete"],
    "rules": ["create", "read", "update", "delete"],
    "policy_templates": ["create", "read", "update", "delete"],
    "policy_rules": ["approve", "reject", "read"]
  },
  compliance_officer: {
    "policies": ["read", "update"],
    "rules": ["read", "update"],
    "policy_templates": ["read"],
    "policy_rules": ["approve", "reject", "read"]
  },
  owner: {
    "policies": ["read", "create"],
    "rules": ["read", "create"],
    "policy_templates": ["read"],
    "policy_rules": ["approve", "read"]
  },
  user: {
    "policies": ["read"],
    "rules": ["read"],
    "policy_templates": ["read"]
  }
};

/**
 * Check if a user has a specific permission
 * This function should only be used in demo mode or as a fallback
 * 
 * @param userId The user ID to check
 * @param permission The permission to check
 * @returns True if the user has the permission, false otherwise
 */
export const hasPermission = async (
  userId: string, 
  permission: PermissionRequest
): Promise<boolean> => {
  // First, get the user's role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError || !userData) {
    console.error('Error fetching user role:', userError);
    return false;
  }
  
  // We need to cast userData to the appropriate type
  const userTableData = userData as Tables<'users'>;
  
  // Since role is not in the schema directly, check if role exists in the status field
  // This is a workaround, ideally you should have a proper role field
  const role = userTableData.status || 'user';
  
  // Check if the role exists in our demo permissions
  if (!DEMO_ROLE_PERMISSIONS[role]) {
    return false;
  }
  
  // Check for wildcard permission
  if (DEMO_ROLE_PERMISSIONS[role]["*"] && 
      (DEMO_ROLE_PERMISSIONS[role]["*"].includes("*") || 
       DEMO_ROLE_PERMISSIONS[role]["*"].includes(permission.action))) {
    return true;
  }
  
  // Check for resource-specific permission
  const resourcePermissions = DEMO_ROLE_PERMISSIONS[role][permission.resource];
  if (!resourcePermissions) {
    return false;
  }
  
  // Check if the resource permissions include the action or a wildcard
  return resourcePermissions.includes("*") || resourcePermissions.includes(permission.action);
};

/**
 * Get all users with a specific permission
 * This function should only be used in demo mode or as a fallback
 * 
 * @param permission The permission to check
 * @returns Array of user IDs with the permission
 */
export const getUsersWithPermission = async (
  permission: PermissionRequest
): Promise<string[]> => {
  // Get all users with their roles
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, status');
  
  if (usersError || !users) {
    console.error('Error fetching users:', usersError);
    return [];
  }
  
  // Filter users based on their role's permissions
  return users.filter(user => {
    // We need to cast user to the appropriate type
    const userTableData = user as Tables<'users'>;
    
    // Since role is not in the schema directly, check if role exists in the status field
    // This is a workaround, ideally you should have a proper role field
    const role = userTableData.status || 'user';
    
    // Skip if the role doesn't exist in our demo permissions
    if (!DEMO_ROLE_PERMISSIONS[role]) {
      return false;
    }
    
    // Check for wildcard permission
    if (DEMO_ROLE_PERMISSIONS[role]["*"] && 
        (DEMO_ROLE_PERMISSIONS[role]["*"].includes("*") || 
         DEMO_ROLE_PERMISSIONS[role]["*"].includes(permission.action))) {
      return true;
    }
    
    // Check for resource-specific permission
    const resourcePermissions = DEMO_ROLE_PERMISSIONS[role][permission.resource];
    if (!resourcePermissions) {
      return false;
    }
    
    // Check if the resource permissions include the action or a wildcard
    return resourcePermissions.includes("*") || resourcePermissions.includes(permission.action);
  }).map(user => (user as Tables<'users'>).id);
}; 