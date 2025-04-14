import { supabase } from '@/lib/supabase';
import { TokenTemplate, TokenStandard } from '@/types/centralModels';
import type { TokenTemplateInsert, TokenTemplateUpdate } from '@/types/database';

/**
 * Get all token templates for a project
 * @param projectId - The project ID to fetch templates for
 * @returns An array of token templates
 */
export async function getTokenTemplates(projectId: string) {
  const { data, error } = await supabase
    .from('token_templates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching token templates:', error);
    throw error;
  }

  // Map database types to central models
  const templates = data.map(template => {
    // Map database standard format to enum values
    let standardEnum: TokenStandard;
    switch (template.standard) {
      case 'ERC-20':
        standardEnum = TokenStandard.ERC20;
        break;
      case 'ERC-721':
        standardEnum = TokenStandard.ERC721;
        break;
      case 'ERC-1155':
        standardEnum = TokenStandard.ERC1155;
        break;
      default:
        standardEnum = TokenStandard.ERC20; // Default fallback
    }

    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      projectId: template.project_id,
      standard: standardEnum,
      blocks: template.blocks as Record<string, any>,
      metadata: template.metadata ? (template.metadata as Record<string, any>) : {},
      createdAt: template.created_at,
      updatedAt: template.updated_at
    };
  });

  return templates;
}

/**
 * Get a specific token template by ID
 * @param templateId - The ID of the template to fetch
 * @returns The token template or null if not found
 */
export async function getTokenTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('token_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means no rows returned, so template not found
      return null;
    }
    console.error('Error fetching token template:', error);
    throw error;
  }

  // Map database standard format to enum values
  let standardEnum: TokenStandard;
  switch (data.standard) {
    case 'ERC-20':
      standardEnum = TokenStandard.ERC20;
      break;
    case 'ERC-721':
      standardEnum = TokenStandard.ERC721;
      break;
    case 'ERC-1155':
      standardEnum = TokenStandard.ERC1155;
      break;
    default:
      standardEnum = TokenStandard.ERC20; // Default fallback
  }

  // Map database type to central model
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    projectId: data.project_id,
    standard: standardEnum,
    blocks: data.blocks as Record<string, any>,
    metadata: data.metadata ? (data.metadata as Record<string, any>) : {},
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Create a new token template
 * @param template - The template data to create
 * @returns The created token template
 */
export async function createTokenTemplate(template: Partial<TokenTemplate>) {
  // Check if projectId is provided
  if (!template.projectId) {
    throw new Error('Project ID is required when creating a token template');
  }

  // Map enum token standard to database format (with hyphen)
  let dbStandard: string;
  switch (template.standard) {
    case TokenStandard.ERC20:
      dbStandard = 'ERC-20';
      break;
    case TokenStandard.ERC721:
      dbStandard = 'ERC-721';
      break;
    case TokenStandard.ERC1155:
      dbStandard = 'ERC-1155';
      break;
    default:
      throw new Error('Invalid token standard');
  }

  // Convert from central model to database insert type
  const templateInsert = {
    name: template.name!,
    description: template.description,
    project_id: template.projectId,
    standard: dbStandard, // Use the mapped standard with hyphen
    blocks: template.blocks || {},
    metadata: template.metadata || {}
  };

  const { data, error } = await supabase
    .from('token_templates')
    .insert([templateInsert])
    .select()
    .single();

  if (error) {
    console.error('Error creating token template:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing token template
 * @param templateId - The ID of the template to update
 * @param template - The template data to update
 * @returns The updated token template
 */
export async function updateTokenTemplate(templateId: string, template: Partial<TokenTemplate>) {
  // Map enum token standard to database format if provided
  let dbStandard: string | undefined;
  if (template.standard) {
    switch (template.standard) {
      case TokenStandard.ERC20:
        dbStandard = 'ERC-20';
        break;
      case TokenStandard.ERC721:
        dbStandard = 'ERC-721';
        break;
      case TokenStandard.ERC1155:
        dbStandard = 'ERC-1155';
        break;
      default:
        throw new Error('Invalid token standard');
    }
  }

  // Convert from central model to database update type
  const templateUpdate = {
    name: template.name,
    description: template.description,
    standard: dbStandard, // Use the mapped standard with hyphen if provided
    blocks: template.blocks,
    metadata: template.metadata,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('token_templates')
    .update(templateUpdate)
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating token template:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a token template
 * @param templateId - The ID of the template to delete
 * @returns void
 */
export async function deleteTokenTemplate(templateId: string) {
  const { error } = await supabase
    .from('token_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Error deleting token template:', error);
    throw error;
  }
}

/**
 * Duplicate a token template with a new name
 * @param templateId - The source template ID to duplicate
 * @param newData - New data for the duplicate (at minimum should include a name)
 * @returns The newly created token template
 */
export async function duplicateTokenTemplate(
  templateId: string, 
  newData: { name: string; description?: string; projectId?: string }
) {
  // First get the source template
  const sourceTemplate = await getTokenTemplate(templateId);
  
  if (!sourceTemplate) {
    throw new Error('Source template not found');
  }
  
  // Create a new template based on source with overrides
  const newTemplate: Partial<TokenTemplate> = {
    name: newData.name,
    description: newData.description || sourceTemplate.description,
    projectId: newData.projectId || sourceTemplate.projectId,
    standard: sourceTemplate.standard,
    blocks: sourceTemplate.blocks,
    metadata: sourceTemplate.metadata
  };
  
  // Use the create function which already has the standard mapping logic
  return createTokenTemplate(newTemplate);
}

/**
 * Create a token from a template
 * @param templateId The template ID to use
 * @param tokenData Additional token data (name, symbol, etc.)
 * @returns The created token
 */
export async function createTokenFromTemplate(templateId: string, tokenData: {
  name: string;
  symbol: string;
  projectId: string;
  decimals?: number;
}) {
  // First, get the template
  const template = await getTokenTemplate(templateId);
  
  if (!template) {
    throw new Error('Template not found');
  }
  
  // Create the token with template data
  const { data, error } = await supabase
    .from('tokens')
    .insert([{
      name: tokenData.name,
      symbol: tokenData.symbol,
      project_id: tokenData.projectId,
      decimals: tokenData.decimals || 18, 
      standard: template.standard,
      blocks: template.blocks,
      metadata: {
        ...template.metadata,
        template_info: {
          template_id: templateId,
          template_name: template.name,
          created_from_template: true
        }
      },
      status: 'DRAFT'
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating token from template:', error);
    throw error;
  }
  
  return data;
}

/**
 * Delete all templates in a group
 * @param groupName The group name to delete templates for
 * @param projectId The project ID the templates belong to
 * @returns void
 */
export async function deleteTemplateGroup(groupName: string, projectId: string) {
  try {
    // Use an alternative approach that avoids problematic JSON path filters
    // First, get all templates where metadata contains the groupName 
    const { data, error: fetchError } = await supabase
      .from('token_templates')
      .select('id, metadata')
      .eq('project_id', projectId);
    
    if (fetchError) {
      console.error('Error fetching templates:', fetchError);
      throw fetchError;
    }
    
    // Filter the templates by checking the groupName in JavaScript
    const matchingTemplates = data?.filter(
      template => {
        // Need to access metadata as a record to fix TypeScript error
        const meta = template.metadata as Record<string, any>;
        return meta?.groupName === groupName;
      }
    ) || [];
    
    if (matchingTemplates.length === 0) {
      return; // No templates in this group
    }
    
    // Delete all templates in the group
    const templateIds = matchingTemplates.map(template => template.id);
    
    const { error: deleteError } = await supabase
      .from('token_templates')
      .delete()
      .in('id', templateIds);
    
    if (deleteError) {
      console.error('Error deleting template group:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('Error in deleteTemplateGroup:', error);
    throw error;
  }
}

/**
 * Get token templates that match certain token statuses
 * This is useful for fetching templates that meet specific criteria
 * @param projectId - The project ID to fetch templates for
 * @param status - The required status of the template
 * @returns An array of token templates
 */
export async function getTemplatesWithStatus(projectId: string, status: string) {
  const { data, error } = await supabase
    .from('token_templates')
    .select('*, tokens(id, status)')
    .eq('project_id', projectId)
    .eq('tokens.status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching token templates with status:', error);
    throw error;
  }

  // Map database types to central models
  const templates = data.map(template => {
    // Map database standard format to enum values
    let standardEnum: TokenStandard;
    switch (template.standard) {
      case 'ERC-20':
        standardEnum = TokenStandard.ERC20;
        break;
      case 'ERC-721':
        standardEnum = TokenStandard.ERC721;
        break;
      case 'ERC-1155':
        standardEnum = TokenStandard.ERC1155;
        break;
      default:
        standardEnum = TokenStandard.ERC20; // Default fallback
    }

    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      projectId: template.project_id,
      standard: standardEnum,
      blocks: template.blocks as Record<string, any>,
      metadata: template.metadata ? (template.metadata as Record<string, any>) : {},
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      status: status
    };
  });

  return templates;
} 