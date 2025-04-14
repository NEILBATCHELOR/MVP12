import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { 
  ApprovalWorkflow, 
  ApprovalLevel, 
  ApprovalEntityType, 
  ApprovalStatus,
  Approver,
  ApproverRole
} from '@/types/compliance';

// Define RiskLevel locally since it's not exported from @/types/compliance
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export class ApprovalWorkflowService {
  private static instance: ApprovalWorkflowService;
  private supabase;

  private constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  public static getInstance(): ApprovalWorkflowService {
    if (!ApprovalWorkflowService.instance) {
      ApprovalWorkflowService.instance = new ApprovalWorkflowService();
    }
    return ApprovalWorkflowService.instance;
  }

  // Create a new approval workflow
  async createWorkflow(
    entityType: ApprovalEntityType,
    entityId: string,
    riskLevel: RiskLevel
  ): Promise<ApprovalWorkflow> {
    try {
      // Determine required approval levels based on risk level
      const requiredLevels = this.getRequiredLevelsForRisk(riskLevel);
      
      // Get approvers for each level
      const approvers = await this.getApproversForLevels(requiredLevels);
      
      const workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId,
        entityType,
        status: 'PENDING',
        requiredLevels,
        currentLevel: requiredLevels[0],
        approvers,
      };
      
      // Insert the workflow into the database
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .insert({
          entity_id: workflow.entityId,
          entity_type: workflow.entityType,
          status: workflow.status,
          required_levels: workflow.requiredLevels,
          current_level: workflow.currentLevel,
          approvers: workflow.approvers,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Format the response
      return {
        id: data.id,
        entityId: data.entity_id,
        entityType: data.entity_type as ApprovalEntityType,
        status: data.status as ApprovalStatus,
        requiredLevels: data.required_levels as ApprovalLevel[],
        currentLevel: data.current_level as ApprovalLevel,
        approvers: data.approvers as Approver[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        escalationReason: data.escalation_reason,
        escalatedBy: data.escalated_by,
        escalatedAt: data.escalated_at ? new Date(data.escalated_at) : undefined,
      };
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  // Get an approval workflow by ID
  async getWorkflowById(workflowId: string): Promise<ApprovalWorkflow | null> {
    try {
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        entityId: data.entity_id,
        entityType: data.entity_type as ApprovalEntityType,
        status: data.status as ApprovalStatus,
        requiredLevels: data.required_levels as ApprovalLevel[],
        currentLevel: data.current_level as ApprovalLevel,
        approvers: data.approvers as Approver[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        escalationReason: data.escalation_reason,
        escalatedBy: data.escalated_by,
        escalatedAt: data.escalated_at ? new Date(data.escalated_at) : undefined,
      };
    } catch (error) {
      console.error('Error getting workflow:', error);
      throw error;
    }
  }

  // Get approval workflows for an entity
  async getWorkflowsForEntity(
    entityType: ApprovalEntityType,
    entityId: string
  ): Promise<ApprovalWorkflow[]> {
    try {
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        entityId: item.entity_id,
        entityType: item.entity_type as ApprovalEntityType,
        status: item.status as ApprovalStatus,
        requiredLevels: item.required_levels as ApprovalLevel[],
        currentLevel: item.current_level as ApprovalLevel,
        approvers: item.approvers as Approver[],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
        escalationReason: item.escalation_reason,
        escalatedBy: item.escalated_by,
        escalatedAt: item.escalated_at ? new Date(item.escalated_at) : undefined,
      }));
    } catch (error) {
      console.error('Error getting workflows for entity:', error);
      throw error;
    }
  }

  // Get workflows that need approval by a user
  async getWorkflowsForApprover(userId: string): Promise<ApprovalWorkflow[]> {
    try {
      const { data: activeWorkflows, error } = await this.supabase
        .from('approval_workflows')
        .select('*')
        .eq('status', 'IN_PROGRESS');
      
      if (error) throw error;
      
      // Filter workflows where the user is an approver for the current level and hasn't acted yet
      const workflows = (activeWorkflows || [])
        .filter(workflow => {
          const approvers = workflow.approvers as Approver[];
          return approvers.some(
            approver => 
              approver.userId === userId && 
              approver.level === workflow.current_level && 
              approver.status === 'PENDING'
          );
        })
        .map(item => ({
          id: item.id,
          entityId: item.entity_id,
          entityType: item.entity_type as ApprovalEntityType,
          status: item.status as ApprovalStatus,
          requiredLevels: item.required_levels as ApprovalLevel[],
          currentLevel: item.current_level as ApprovalLevel,
          approvers: item.approvers as Approver[],
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
          escalationReason: item.escalation_reason,
          escalatedBy: item.escalated_by,
          escalatedAt: item.escalated_at ? new Date(item.escalated_at) : undefined,
        }));
      
      return workflows;
    } catch (error) {
      console.error('Error getting workflows for approver:', error);
      throw error;
    }
  }

  // Approve a workflow
  async approveWorkflow(
    workflowId: string,
    userId: string,
    comments?: string
  ): Promise<ApprovalWorkflow> {
    try {
      // Get the current workflow
      const workflow = await this.getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      if (workflow.status !== 'IN_PROGRESS' && workflow.status !== 'PENDING') {
        throw new Error(`Workflow is not in an approvable state: ${workflow.status}`);
      }
      
      // Find the approver
      const approverIndex = workflow.approvers.findIndex(
        approver => approver.userId === userId && approver.level === workflow.currentLevel
      );
      
      if (approverIndex === -1) {
        throw new Error('User is not an approver for the current level');
      }
      
      const updatedApprovers = [...workflow.approvers];
      updatedApprovers[approverIndex] = {
        ...updatedApprovers[approverIndex],
        status: 'APPROVED',
        timestamp: new Date(),
        comments
      };
      
      // Check if all approvers at this level have approved
      const currentLevelApprovers = updatedApprovers.filter(
        approver => approver.level === workflow.currentLevel
      );
      
      const allApproved = currentLevelApprovers.every(
        approver => approver.status === 'APPROVED' || approver.status === 'RECUSED'
      );
      
      let newStatus: ApprovalStatus = workflow.status;
      let newCurrentLevel = workflow.currentLevel;
      let completedAt = workflow.completedAt;
      
      if (allApproved) {
        // Move to the next level or complete the workflow
        const currentLevelIndex = workflow.requiredLevels.indexOf(workflow.currentLevel);
        
        if (currentLevelIndex === workflow.requiredLevels.length - 1) {
          // All levels completed, workflow is approved
          newStatus = 'APPROVED' as ApprovalStatus;
          completedAt = new Date();
        } else {
          // Move to the next level
          newCurrentLevel = workflow.requiredLevels[currentLevelIndex + 1];
        }
      }
      
      // If this is the first action, update status to IN_PROGRESS
      if (newStatus === 'PENDING') {
        newStatus = 'IN_PROGRESS';
      }
      
      // Update the workflow
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .update({
          status: newStatus,
          current_level: newCurrentLevel,
          approvers: updatedApprovers,
          completed_at: completedAt,
          updated_at: new Date()
        })
        .eq('id', workflowId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the updated workflow
      return {
        id: data.id,
        entityId: data.entity_id,
        entityType: data.entity_type as ApprovalEntityType,
        status: data.status as ApprovalStatus,
        requiredLevels: data.required_levels as ApprovalLevel[],
        currentLevel: data.current_level as ApprovalLevel,
        approvers: data.approvers as Approver[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        escalationReason: data.escalation_reason,
        escalatedBy: data.escalated_by,
        escalatedAt: data.escalated_at ? new Date(data.escalated_at) : undefined,
      };
    } catch (error) {
      console.error('Error approving workflow:', error);
      throw error;
    }
  }

  // Reject a workflow
  async rejectWorkflow(
    workflowId: string,
    userId: string,
    reason: string
  ): Promise<ApprovalWorkflow> {
    try {
      // Get the current workflow
      const workflow = await this.getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      if (workflow.status !== 'IN_PROGRESS' && workflow.status !== 'PENDING') {
        throw new Error(`Workflow is not in a rejectable state: ${workflow.status}`);
      }
      
      // Find the approver
      const approverIndex = workflow.approvers.findIndex(
        approver => approver.userId === userId && approver.level === workflow.currentLevel
      );
      
      if (approverIndex === -1) {
        throw new Error('User is not an approver for the current level');
      }
      
      const updatedApprovers = [...workflow.approvers];
      updatedApprovers[approverIndex] = {
        ...updatedApprovers[approverIndex],
        status: 'REJECTED',
        timestamp: new Date(),
        comments: reason
      };
      
      // Update the workflow
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .update({
          status: 'REJECTED',
          approvers: updatedApprovers,
          completed_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', workflowId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the updated workflow
      return {
        id: data.id,
        entityId: data.entity_id,
        entityType: data.entity_type as ApprovalEntityType,
        status: data.status as ApprovalStatus,
        requiredLevels: data.required_levels as ApprovalLevel[],
        currentLevel: data.current_level as ApprovalLevel,
        approvers: data.approvers as Approver[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        escalationReason: data.escalation_reason,
        escalatedBy: data.escalated_by,
        escalatedAt: data.escalated_at ? new Date(data.escalated_at) : undefined,
      };
    } catch (error) {
      console.error('Error rejecting workflow:', error);
      throw error;
    }
  }

  // Escalate a workflow
  async escalateWorkflow(
    workflowId: string,
    userId: string,
    reason: string
  ): Promise<ApprovalWorkflow> {
    try {
      // Get the current workflow
      const workflow = await this.getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      if (workflow.status !== 'IN_PROGRESS' && workflow.status !== 'PENDING') {
        throw new Error(`Workflow is not in an escalatable state: ${workflow.status}`);
      }
      
      // Find the approver
      const approverIndex = workflow.approvers.findIndex(
        approver => approver.userId === userId && approver.level === workflow.currentLevel
      );
      
      if (approverIndex === -1) {
        throw new Error('User is not an approver for the current level');
      }
      
      // Move directly to the highest level
      const highestLevel = workflow.requiredLevels[workflow.requiredLevels.length - 1];
      
      // Update the workflow
      const { data, error } = await this.supabase
        .from('approval_workflows')
        .update({
          status: 'ESCALATED',
          current_level: highestLevel,
          escalation_reason: reason,
          escalated_by: userId,
          escalated_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', workflowId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the updated workflow
      return {
        id: data.id,
        entityId: data.entity_id,
        entityType: data.entity_type as ApprovalEntityType,
        status: data.status as ApprovalStatus,
        requiredLevels: data.required_levels as ApprovalLevel[],
        currentLevel: data.current_level as ApprovalLevel,
        approvers: data.approvers as Approver[],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        escalationReason: data.escalation_reason,
        escalatedBy: data.escalated_by,
        escalatedAt: data.escalated_at ? new Date(data.escalated_at) : undefined,
      };
    } catch (error) {
      console.error('Error escalating workflow:', error);
      throw error;
    }
  }

  // Determine required approval levels based on risk level
  private getRequiredLevelsForRisk(riskLevel: RiskLevel): ApprovalLevel[] {
    switch (riskLevel) {
      case 'LOW':
        return ['L1'];
      case 'MEDIUM':
        return ['L1', 'L2'];
      case 'HIGH':
        return ['L1', 'L2', 'EXECUTIVE'];
      default:
        return ['L1'];
    }
  }

  // Get approvers for specified levels
  private async getApproversForLevels(levels: ApprovalLevel[]): Promise<Approver[]> {
    try {
      // This would normally fetch from a database table of users with their roles
      // For now, we'll return mock data
      const approvers: Approver[] = [];
      
      const mockUsers = {
        L1: [
          { userId: 'user_l1_1', role: 'COMPLIANCE_OFFICER' as ApproverRole },
          { userId: 'user_l1_2', role: 'COMPLIANCE_OFFICER' as ApproverRole }
        ],
        L2: [
          { userId: 'user_l2_1', role: 'MANAGER' as ApproverRole }
        ],
        EXECUTIVE: [
          { userId: 'user_ex_1', role: 'DIRECTOR' as ApproverRole },
          { userId: 'user_ex_2', role: 'EXECUTIVE' as ApproverRole }
        ]
      };
      
      for (const level of levels) {
        for (const user of mockUsers[level]) {
          approvers.push({
            userId: user.userId,
            level,
            role: user.role,
            status: 'PENDING'
          });
        }
      }
      
      return approvers;
    } catch (error) {
      console.error('Error getting approvers:', error);
      throw error;
    }
  }
}