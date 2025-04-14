import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";
import type { ProjectUI, ProjectStatus, ProjectType } from "@/types/centralModels";
import { mapDbProjectToProject } from "@/utils/typeMappers";
import type { Tables } from "@/types/database";

// Types
export interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  projectType: string;
  tokenSymbol: string;
  targetRaise: string;
  authorizedShares: string;
  sharePrice: string;
  fundingRound?: string;
  legalEntity?: string;
  jurisdiction?: string;
  taxId?: string;
}

// Fetch all projects
export async function getProjects(): Promise<ProjectUI[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  // Map each project to the ProjectUI type
  return data ? data.map(mapDbProjectToProject) : [];
}

// Fetch a specific project
export async function getProject(id: string): Promise<ProjectUI | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching project ${id}:`, error);
    return null;
  }

  // Map the database project to the ProjectUI type
  return data ? mapDbProjectToProject(data) : null;
}

// Get a project by ID
export const getProjectById = async (id: string): Promise<ProjectUI | null> => {
  return getProject(id);
};

// Create a new project
export async function createProject(
  projectData: ProjectFormData,
): Promise<ProjectUI | null> {
  // Transform project data to match database schema
  const now = new Date().toISOString();
  const newProject = {
    id: crypto.randomUUID(),
    name: projectData.name,
    description: projectData.description || null,
    status: projectData.status,
    // Use the correct column name from the database schema
    project_type: projectData.projectType,
    token_symbol: projectData.tokenSymbol,
    // Convert form data values to appropriate types
    target_raise: parseFloat(projectData.targetRaise) || 0,
    authorized_shares: parseInt(projectData.authorizedShares) || 0,
    share_price: parseFloat(projectData.sharePrice) || 0,
    company_valuation: null,
    funding_round: projectData.fundingRound || null,
    legal_entity: projectData.legalEntity || null,
    jurisdiction: projectData.jurisdiction || null,
    tax_id: projectData.taxId || null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(newProject)
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }

  // Map the database project to the ProjectUI type
  return data ? mapDbProjectToProject(data) : null;
}

// Update an existing project
export const updateProject = async (
  id: string,
  projectData: ProjectFormData,
): Promise<ProjectUI> => {
  const now = new Date().toISOString();

  // Transform form data to database format
  const dbProject = {
    name: projectData.name,
    description: projectData.description,
    status: projectData.status,
    // Use the correct column name from the database schema
    project_type: projectData.projectType,
    token_symbol: projectData.tokenSymbol,
    target_raise: parseFloat(projectData.targetRaise) || 0,
    authorized_shares: parseInt(projectData.authorizedShares) || 0,
    share_price: parseFloat(projectData.sharePrice) || 0,
    funding_round: projectData.fundingRound,
    legal_entity: projectData.legalEntity,
    jurisdiction: projectData.jurisdiction,
    tax_id: projectData.taxId,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("projects")
    .update(dbProject)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw error;
  }

  // Map the database response to ProjectUI
  return mapDbProjectToProject(data);
};

// Delete a project
export const deleteProject = async (id: string): Promise<void> => {
  // First check if there are any cap tables associated with this project
  const { data: capTables, error: capTablesError } = await supabase
    .from("cap_tables")
    .select("id")
    .eq("project_id", id);

  if (capTablesError) {
    console.error(
      `Error checking cap tables for project ${id}:`,
      capTablesError,
    );
    throw capTablesError;
  }

  // If there are cap tables, delete them first
  if (capTables && capTables.length > 0) {
    const capTableIds = capTables.map((ct) => ct.id);

    // Delete cap table investors
    const { error: investorsError } = await supabase
      .from("cap_table_investors")
      .delete()
      .in("cap_table_id", capTableIds);

    if (investorsError) {
      console.error(
        `Error deleting cap table investors for project ${id}:`,
        investorsError,
      );
      throw investorsError;
    }

    // Delete cap tables
    const { error: deleteCapTablesError } = await supabase
      .from("cap_tables")
      .delete()
      .eq("project_id", id);

    if (deleteCapTablesError) {
      console.error(
        `Error deleting cap tables for project ${id}:`,
        deleteCapTablesError,
      );
      throw deleteCapTablesError;
    }
  }

  // Check for subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("project_id", id);

  if (subscriptionsError) {
    console.error(
      `Error checking subscriptions for project ${id}:`,
      subscriptionsError,
    );
    throw subscriptionsError;
  }

  // If there are subscriptions, delete them
  if (subscriptions && subscriptions.length > 0) {
    // Delete subscriptions - no related tables
    const { error: deleteSubscriptionsError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("project_id", id);

    if (deleteSubscriptionsError) {
      console.error(
        `Error deleting subscriptions for project ${id}:`,
        deleteSubscriptionsError,
      );
      throw deleteSubscriptionsError;
    }
  }

  // Finally, delete the project
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw error;
  }
};

// Get project statistics
export const getProjectStatistics = async (id: string) => {
  // Get cap table data
  const { data: capTable, error: capTableError } = await supabase
    .from("cap_tables")
    .select("id")
    .eq("project_id", id)
    .single();

  if (capTableError && capTableError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error(`Error fetching cap table for project ${id}:`, capTableError);
    throw capTableError;
  }

  let investorCount = 0;
  let totalAllocation = 0;

  if (capTable) {
    // Get investor count
    const { count: invCount, error: countError } = await supabase
      .from("cap_table_investors")
      .select("id", { count: "exact" })
      .eq("cap_table_id", capTable.id);

    if (countError) {
      console.error(`Error counting investors for project ${id}:`, countError);
      throw countError;
    }

    investorCount = invCount || 0;

    // Get total allocation - use a safer approach for querying
    try {
      const { data: investors, error: investorsError } = await supabase
        .from("cap_table_investors")
        .select("investor_id")
        .eq("cap_table_id", capTable.id);

      if (investorsError) {
        console.error(
          `Error fetching investors for project ${id}:`,
          investorsError,
        );
        throw investorsError;
      }

      // Instead of trying to join, just calculate a simple count
      totalAllocation = investors.length;
    } catch (error) {
      console.error(`Error calculating total allocation: ${error}`);
      totalAllocation = 0;
    }
  }

  return {
    investorCount,
    totalAllocation,
  };
};
