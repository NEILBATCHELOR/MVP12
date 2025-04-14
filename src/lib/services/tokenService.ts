import { supabase } from '@/lib/supabase';
import { TokenData, TokenStatus, TokenStandard } from '@/types/centralModels';
import type { Json } from '@/types/supabase';
import type { InsertTables, UpdateTables } from '@/types/database';

// Define types that align with database schema
type TokenInsert = InsertTables<'tokens'>;
type TokenUpdate = UpdateTables<'tokens'>;

// Extended TokenData interface with additional properties used in this service
interface ExtendedTokenData extends Omit<Partial<TokenData>, 'standard'> {
  standard?: TokenStandard | string; // Allow standard to be either TokenStandard enum or direct string
  is_mintable?: boolean;
  is_burnable?: boolean;
  is_pausable?: boolean;
  features?: any[];
  description?: string;
  total_supply?: string;
}

// Helper function to safely access JSON properties
function getJsonProperty<T>(json: Json | null, prop: string, defaultValue: T): T {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return defaultValue;
  }
  
  const typedJson = json as Record<string, any>;
  return (typedJson[prop] as T) ?? defaultValue;
}

/**
 * Get all tokens for a project
 * @param projectId - The project ID to fetch tokens for
 * @returns An array of tokens
 */
export async function getTokens(projectId: string) {
  const { data, error } = await supabase
    .from('tokens')
    .select(`
      *,
      token_deployments(*),
      token_versions(*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  }

  // Map database types to our central models
  return data.map(token => ({
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    description: getJsonProperty(token.metadata, 'description', ''),
    project_id: token.project_id,
    standard: token.standard as TokenStandard,
    status: token.status as TokenStatus,
    decimals: token.decimals,
    total_supply: getJsonProperty(token.metadata, 'totalSupply', '0'),
    is_mintable: getJsonProperty(token.blocks, 'is_mintable', false),
    is_burnable: getJsonProperty(token.blocks, 'is_burnable', false),
    is_pausable: getJsonProperty(token.blocks, 'is_pausable', false),
    features: getJsonProperty(token.blocks, 'features', []),
    created_at: token.created_at,
    updated_at: token.updated_at,
    // Convert token deployments to expected format
    token_deployments: (token.token_deployments || []).map(dep => ({
      id: dep.id,
      tokenId: dep.token_id,
      network: dep.network,
      contractAddress: dep.contract_address,
      transactionHash: dep.transaction_hash,
      deployedBy: dep.deployed_by,
      deployedAt: dep.deployed_at,
      status: dep.status,
      deploymentData: dep.deployment_data
    }))
  }));
}

/**
 * Get a specific token by ID
 * @param tokenId - The ID of the token to fetch
 * @returns The token or null if not found
 */
export async function getToken(tokenId: string) {
  const { data, error } = await supabase
    .from('tokens')
    .select(`
      *,
      token_deployments(*),
      token_versions(*)
    `)
    .eq('id', tokenId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means no rows returned, so token not found
      return null;
    }
    console.error('Error fetching token:', error);
    throw error;
  }

  // Map database type to our central model
  return {
    id: data.id,
    name: data.name,
    symbol: data.symbol,
    description: getJsonProperty(data.metadata, 'description', ''),
    project_id: data.project_id,
    standard: data.standard as TokenStandard,
    status: data.status as TokenStatus,
    decimals: data.decimals,
    total_supply: getJsonProperty(data.metadata, 'totalSupply', '0'),
    is_mintable: getJsonProperty(data.blocks, 'is_mintable', false),
    is_burnable: getJsonProperty(data.blocks, 'is_burnable', false),
    is_pausable: getJsonProperty(data.blocks, 'is_pausable', false),
    features: getJsonProperty(data.blocks, 'features', []),
    created_at: data.created_at,
    updated_at: data.updated_at,
    // Convert token deployments to expected format
    token_deployments: (data.token_deployments || []).map(dep => ({
      id: dep.id,
      tokenId: dep.token_id,
      network: dep.network,
      contractAddress: dep.contract_address,
      transactionHash: dep.transaction_hash,
      deployedBy: dep.deployed_by,
      deployedAt: dep.deployed_at,
      status: dep.status,
      deploymentData: dep.deployment_data
    }))
  };
}

/**
 * Create a new token
 * @param token - The token data to create
 * @returns The created token
 */
export async function createToken(token: ExtendedTokenData) {
  // Ensure we have required fields
  if (!token.name || !token.symbol) {
    throw new Error('Token name and symbol are required');
  }
  
  // Convert from central model to database insert type
  const tokenInsert: TokenInsert = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals || 18,
    standard: token.standard as string,
    project_id: token.project_id!,
    blocks: {
      // Include name and symbol in blocks for ERC-20 to satisfy database constraint
      name: token.name,
      symbol: token.symbol,
      is_mintable: token.is_mintable === true,
      is_burnable: token.is_burnable === true,
      is_pausable: token.is_pausable === true,
      features: token.features || []
    },
    metadata: {
      description: token.description || '',
      totalSupply: token.total_supply || "0"
    },
    status: token.status || TokenStatus.DRAFT
  };

  const { data, error } = await supabase
    .from('tokens')
    .insert(tokenInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating token:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing token
 * @param tokenId - The ID of the token to update
 * @param token - The token data to update
 * @returns The updated token
 */
export async function updateToken(tokenId: string, token: ExtendedTokenData) {
  // Ensure we have required fields if updating name/symbol
  if ((token.name || token.symbol) && (!token.name || !token.symbol)) {
    // If updating one, make sure both are provided
    throw new Error('Both token name and symbol must be provided when updating either');
  }
  
  // Convert from central model to database update type
  const tokenUpdate: TokenUpdate = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    standard: token.standard as string | undefined,
    blocks: token.name && token.symbol ? {
      // Include name and symbol in blocks for ERC-20 to satisfy database constraint
      name: token.name,
      symbol: token.symbol,
      is_mintable: token.is_mintable === true,
      is_burnable: token.is_burnable === true,
      is_pausable: token.is_pausable === true,
      features: token.features || []
    } : undefined,
    metadata: {
      description: token.description || '',
      totalSupply: token.total_supply || "0"
    },
    status: token.status
  };

  const { data, error } = await supabase
    .from('tokens')
    .update(tokenUpdate)
    .eq('id', tokenId)
    .select()
    .single();

  if (error) {
    console.error('Error updating token:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a token
 * @param tokenId - The ID of the token to delete
 * @returns void
 */
export async function deleteToken(tokenId: string) {
  const { error } = await supabase
    .from('tokens')
    .delete()
    .eq('id', tokenId);

  if (error) {
    console.error('Error deleting token:', error);
    throw error;
  }
}

/**
 * Clone an existing token with a new name and symbol
 * @param tokenId - The ID of the token to clone
 * @param newData - Optional new data for the cloned token
 * @returns The cloned token
 */
export async function cloneToken(tokenId: string, newData?: { 
  name?: string; 
  symbol?: string;
  projectId?: string; 
}) {
  // Get the original token
  const sourceToken = await getToken(tokenId);
  
  if (!sourceToken) {
    throw new Error('Source token not found');
  }
  
  // Create a new token with cleaned data
  const clonedToken: TokenInsert = {
    name: newData?.name || `${sourceToken.name} (Clone)`,
    symbol: newData?.symbol || `${sourceToken.symbol}2`,
    decimals: sourceToken.decimals,
    standard: sourceToken.standard as string,
    project_id: newData?.projectId || sourceToken.project_id,
    blocks: {
      name: newData?.name || `${sourceToken.name} (Clone)`,
      symbol: newData?.symbol || `${sourceToken.symbol}2`,
      is_mintable: sourceToken.is_mintable === true,
      is_burnable: sourceToken.is_burnable === true,
      is_pausable: sourceToken.is_pausable === true,
      features: sourceToken.features || []
    },
    metadata: {
      description: sourceToken.description || '',
      totalSupply: sourceToken.total_supply || "0"
    },
    status: TokenStatus.DRAFT
  };
  
  // Use createToken which already handles putting name/symbol in blocks
  const { data, error } = await supabase
    .from('tokens')
    .insert(clonedToken)
    .select()
    .single();

  if (error) {
    console.error('Error cloning token:', error);
    throw error;
  }

  return data;
}

/**
 * Change a token's status
 * @param tokenId - The ID of the token to update
 * @param status - The new status
 * @returns The updated token
 */
export async function updateTokenStatus(tokenId: string, status: TokenStatus) {
  const { data, error } = await supabase
    .from('tokens')
    .update({ status })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) {
    console.error('Error updating token status:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new token version (snapshot)
 * @param tokenId - The token ID to create a version for
 * @param userId - The user creating the version
 * @returns The created token version
 */
export async function createTokenVersion(tokenId: string, userId: string) {
  // First, get the current token data
  const token = await getToken(tokenId);
  
  if (!token) {
    throw new Error('Token not found');
  }
  
  // Get the latest version number
  const { data: versions, error: versionError } = await supabase
    .from('token_versions')
    .select('version')
    .eq('token_id', tokenId)
    .order('version', { ascending: false })
    .limit(1);
    
  if (versionError) {
    throw versionError;
  }
  
  const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;
  
  // Create a new version
  const { data, error } = await supabase
    .from('token_versions')
    .insert([{
      token_id: tokenId,
      version: nextVersion,
      data: token,
      created_by: userId
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating token version:', error);
    throw error;
  }
  
  return data;
}

/**
 * Add a token deployment record
 * @param deployment - The deployment data
 * @returns The created deployment record
 */
export async function addTokenDeployment(deployment: {
  token_id: string;
  network: string;
  contract_address: string;
  transaction_hash: string;
  deployed_by: string;
  status?: 'PENDING' | 'DEPLOYED' | 'FAILED';
  deployment_data?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('token_deployments')
    .insert([{
      ...deployment,
      status: deployment.status || 'PENDING'
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding token deployment:', error);
    throw error;
  }
  
  // Update the token status to DEPLOYED if the deployment was successful
  if (deployment.status === 'DEPLOYED') {
    await updateTokenStatus(deployment.token_id, TokenStatus.DEPLOYED);
  }
  
  return data;
}

/**
 * Get tokens by status for a project
 * @param projectId - The project ID to fetch tokens for
 * @param statuses - Array of token statuses to filter by
 * @returns An array of tokens with the specified statuses
 */
export async function getTokensByStatus(projectId: string, statuses: TokenStatus[]) {
  const { data, error } = await supabase
    .from('tokens')
    .select(`
      *,
      token_deployments(*),
      token_versions(*)
    `)
    .eq('project_id', projectId)
    .in('status', statuses)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tokens by status:', error);
    throw error;
  }

  // Map database types to our central models
  return data.map(token => ({
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    description: getJsonProperty(token.metadata, 'description', ''),
    project_id: token.project_id,
    standard: token.standard as TokenStandard,
    status: token.status as TokenStatus,
    decimals: token.decimals,
    total_supply: getJsonProperty(token.metadata, 'totalSupply', '0'),
    is_mintable: getJsonProperty(token.blocks, 'is_mintable', false),
    is_burnable: getJsonProperty(token.blocks, 'is_burnable', false),
    is_pausable: getJsonProperty(token.blocks, 'is_pausable', false),
    features: getJsonProperty(token.blocks, 'features', []),
    created_at: token.created_at,
    updated_at: token.updated_at,
    // Convert token deployments to expected format
    token_deployments: (token.token_deployments || []).map(dep => ({
      id: dep.id,
      tokenId: dep.token_id,
      network: dep.network,
      contractAddress: dep.contract_address,
      transactionHash: dep.transaction_hash,
      deployedBy: dep.deployed_by,
      deployedAt: dep.deployed_at,
      status: dep.status,
      deploymentData: dep.deployment_data
    }))
  }));
} 