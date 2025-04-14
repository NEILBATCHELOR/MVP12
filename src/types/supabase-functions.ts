import { Database } from './supabase';

export type Tables = Database['public']['Tables'];

/**
 * Extends the Supabase client type with our custom functions
 */
// Remove conflicting interface declaration
// and just define the custom functions type

/**
 * Additional Functions Type used for the Supabase client
 * Expands the built-in functions with our custom functions
 */
export interface CustomFunctions {
  run_sql: {
    Args: { sql: string };
    Returns: unknown;
  };
  check_permission: {
    Args: { p_role_name: string; p_resource: string; p_action: string };
    Returns: boolean;
  };
  log_audit: {
    Args: {
      p_action: string;
      p_user_id: string;
      p_entity_type: string;
      p_entity_id?: string;
      p_details?: string;
      p_status?: string;
      p_metadata?: Record<string, any>;
      p_old_data?: Record<string, any>;
      p_new_data?: Record<string, any>;
    };
    Returns: string; // UUID
  };
  verify_wallets: {
    Args: { 
      wallet_addresses: string[] 
    };
    Returns: {
      valid: boolean;
      invalid_addresses: string[];
    };
  };
  check_user_permission: {
    Args: {
      user_id: string;
      permission: string;
    };
    Returns: boolean;
  };
  get_users_with_permission: {
    Args: {
      permission_name: string;
    };
    Returns: string[];
  };
  begin_transaction: {
    Args: Record<string, never>;
    Returns: { id: string };
  };
  commit_transaction: {
    Args: Record<string, never>;
    Returns: boolean;
  };
  rollback_transaction: {
    Args: Record<string, never>;
    Returns: boolean;
  };
}