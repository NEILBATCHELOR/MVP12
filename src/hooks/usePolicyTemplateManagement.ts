import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import {
  savePolicyTemplate,
  getAllPolicyTemplates,
  getPolicyTemplateById,
  updatePolicyTemplate,
  deletePolicyTemplate,
  saveTemplateVersion,
  getTemplateVersions,
  deleteTemplateVersion,
  deleteAllTemplateVersions,
  templateToPolicy,
  TemplateVersion
} from '@/services/enhancedPolicyTemplateService';
import type { PolicyTemplateTable, PolicyTemplateUpdate } from '@/types/database';
import type { Json } from '@/types/supabase';
import { Policy } from '@/services/enhancedPolicyService';

export function usePolicyTemplateManagement() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PolicyTemplateTable[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  // Load all templates
  const loadTemplates = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const templatesData = await getAllPolicyTemplates();
      setTemplates(templatesData);
    } catch (err: any) {
      setError(err.message || 'Error loading policy templates');
      console.error('Error loading policy templates:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user, loadTemplates]);

  // Load versions for a specific template
  const loadVersions = useCallback(async (templateId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const versionsData = await getTemplateVersions(templateId);
      setVersions(versionsData);
      setCurrentTemplateId(templateId);
    } catch (err: any) {
      setError(err.message || 'Error loading template versions');
      console.error('Error loading template versions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save a policy template
  const saveTemplate = useCallback(async (
    templateName: string,
    description: string,
    policyData: Policy,
    approvers?: string[]
  ) => {
    if (!user) return null;
    
    try {
      setError(null);
      
      const savedTemplate = await savePolicyTemplate(
        templateName,
        description,
        policyData,
        user.id,
        approvers
      );
      
      // Refresh templates list
      await loadTemplates();
      
      return savedTemplate;
    } catch (err: any) {
      setError(err.message || 'Error saving policy template');
      console.error('Error saving policy template:', err);
      return null;
    }
  }, [user, loadTemplates]);

  // Update a policy template
  const updateTemplate = useCallback(async (
    templateId: string,
    updates: PolicyTemplateUpdate
  ) => {
    if (!user) return null;
    
    try {
      setError(null);
      
      const updatedTemplate = await updatePolicyTemplate(templateId, updates);
      
      // Refresh templates list
      await loadTemplates();
      
      return updatedTemplate;
    } catch (err: any) {
      setError(err.message || 'Error updating policy template');
      console.error('Error updating policy template:', err);
      return null;
    }
  }, [user, loadTemplates]);

  // Delete a policy template
  const removeTemplate = useCallback(async (templateId: string) => {
    if (!user) return false;
    
    try {
      setError(null);
      
      await deletePolicyTemplate(templateId);
      
      // Refresh templates list
      await loadTemplates();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting policy template');
      console.error('Error deleting policy template:', err);
      return false;
    }
  }, [user, loadTemplates]);

  // Save a template version
  const saveVersion = useCallback(async (
    templateId: string,
    version: string,
    versionData: any,
    notes?: string
  ) => {
    if (!user) return null;
    
    try {
      setError(null);
      
      const savedVersion = await saveTemplateVersion(
        templateId,
        version,
        versionData,
        user.id,
        notes
      );
      
      // Refresh versions if we're looking at the same template
      if (currentTemplateId === templateId) {
        await loadVersions(templateId);
      }
      
      return savedVersion;
    } catch (err: any) {
      setError(err.message || 'Error saving template version');
      console.error('Error saving template version:', err);
      return null;
    }
  }, [user, currentTemplateId, loadVersions]);

  // Delete a template version
  const removeVersion = useCallback(async (versionId: string) => {
    if (!user || !currentTemplateId) return false;
    
    try {
      setError(null);
      
      await deleteTemplateVersion(versionId);
      
      // Refresh versions
      await loadVersions(currentTemplateId);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting template version');
      console.error('Error deleting template version:', err);
      return false;
    }
  }, [user, currentTemplateId, loadVersions]);

  // Get a specific template
  const getTemplate = useCallback(async (templateId: string) => {
    if (!user) return null;
    
    try {
      setError(null);
      
      return await getPolicyTemplateById(templateId);
    } catch (err: any) {
      setError(err.message || 'Error getting policy template');
      console.error('Error getting policy template:', err);
      return null;
    }
  }, [user]);

  // Convert a template to a policy
  const convertToPolicy = useCallback((template: PolicyTemplateTable): Policy => {
    return templateToPolicy(template);
  }, []);

  return {
    templates,
    versions,
    loading,
    error,
    loadTemplates,
    loadVersions,
    saveTemplate,
    updateTemplate,
    removeTemplate,
    saveVersion,
    removeVersion,
    getTemplate,
    convertToPolicy
  };
}