export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      approval_configs: {
        Row: {
          auto_approval_conditions: Json | null
          consensus_type: string
          created_at: string | null
          eligible_roles: string[]
          id: string
          permission_id: string
          required_approvals: number
          updated_at: string | null
        }
        Insert: {
          auto_approval_conditions?: Json | null
          consensus_type?: string
          created_at?: string | null
          eligible_roles: string[]
          id?: string
          permission_id: string
          required_approvals?: number
          updated_at?: string | null
        }
        Update: {
          auto_approval_conditions?: Json | null
          consensus_type?: string
          created_at?: string | null
          eligible_roles?: string[]
          id?: string
          permission_id?: string
          required_approvals?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          action: string
          approved_by: string[]
          approvers: string[]
          created_at: string | null
          id: string
          metadata: Json | null
          rejected_by: string[]
          requested_by: string
          required_approvals: number
          resource: string
          resource_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          action: string
          approved_by?: string[]
          approvers: string[]
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rejected_by?: string[]
          requested_by: string
          required_approvals?: number
          resource: string
          resource_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          approved_by?: string[]
          approvers?: string[]
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rejected_by?: string[]
          requested_by?: string
          required_approvals?: number
          resource?: string
          resource_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          action_type: string | null
          changes: Json | null
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          new_data: Json | null
          occurred_at: string | null
          old_data: Json | null
          project_id: string | null
          signature: string | null
          status: string | null
          timestamp: string
          user_email: string | null
          user_id: string | null
          username: string | null
          verified: boolean | null
        }
        Insert: {
          action: string
          action_type?: string | null
          changes?: Json | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          occurred_at?: string | null
          old_data?: Json | null
          project_id?: string | null
          signature?: string | null
          status?: string | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Update: {
          action?: string
          action_type?: string | null
          changes?: Json | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          occurred_at?: string | null
          old_data?: Json | null
          project_id?: string | null
          signature?: string | null
          status?: string | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      auth_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          id: string
          metadata: Json | null
          operation_type: string | null
          status: string | null
          tags: string[] | null
          target_ids: string[] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string | null
          status?: string | null
          tags?: string[] | null
          target_ids?: string[] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string | null
          status?: string | null
          tags?: string[] | null
          target_ids?: string[] | null
        }
        Relationships: []
      }
      cap_table_investors: {
        Row: {
          cap_table_id: string | null
          created_at: string | null
          id: string
          investor_id: string
        }
        Insert: {
          cap_table_id?: string | null
          created_at?: string | null
          id?: string
          investor_id: string
        }
        Update: {
          cap_table_id?: string | null
          created_at?: string | null
          id?: string
          investor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cap_table_investors_cap_table_id_fkey"
            columns: ["cap_table_id"]
            isOneToOne: false
            referencedRelation: "cap_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cap_table_investors_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
        ]
      }
      cap_tables: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cap_tables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          risk_reason: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level: string
          risk_reason: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          risk_reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "compliance_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          created_at: string
          created_by: string
          findings: Json
          generated_at: string
          id: string
          issuer_id: string
          metadata: Json
          status: Database["public"]["Enums"]["compliance_status"]
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          findings?: Json
          generated_at?: string
          id?: string
          issuer_id: string
          metadata?: Json
          status?: Database["public"]["Enums"]["compliance_status"]
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          findings?: Json
          generated_at?: string
          id?: string
          issuer_id?: string
          metadata?: Json
          status?: Database["public"]["Enums"]["compliance_status"]
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      compliance_settings: {
        Row: {
          created_at: string
          id: string
          investor_count: number
          jurisdictions: string[] | null
          kyc_status: string
          minimum_investment: number
          organization_id: string
          require_accreditation: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_count?: number
          jurisdictions?: string[] | null
          kyc_status?: string
          minimum_investment?: number
          organization_id: string
          require_accreditation?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_count?: number
          jurisdictions?: string[] | null
          kyc_status?: string
          minimum_investment?: number
          organization_id?: string
          require_accreditation?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      consensus_settings: {
        Row: {
          consensus_type: string
          created_at: string
          eligible_roles: string[]
          id: string
          required_approvals: number
          updated_at: string
        }
        Insert: {
          consensus_type: string
          created_at?: string
          eligible_roles: string[]
          id?: string
          required_approvals: number
          updated_at?: string
        }
        Update: {
          consensus_type?: string
          created_at?: string
          eligible_roles?: string[]
          id?: string
          required_approvals?: number
          updated_at?: string
        }
        Relationships: []
      }
      document_approvals: {
        Row: {
          approver_id: string | null
          comments: string | null
          created_at: string | null
          document_id: string | null
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          status: string
          updated_at?: string | null
        }
        Update: {
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "document_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string | null
          document_id: string | null
          file_path: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          uploaded_by?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_workflows: {
        Row: {
          completed_signers: string[]
          created_at: string
          created_by: string
          deadline: string | null
          document_id: string
          id: string
          metadata: Json
          required_signers: string[]
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string
          updated_by: string
        }
        Insert: {
          completed_signers?: string[]
          created_at?: string
          created_by: string
          deadline?: string | null
          document_id: string
          id?: string
          metadata?: Json
          required_signers: string[]
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          updated_by: string
        }
        Update: {
          completed_signers?: string[]
          created_at?: string
          created_by?: string
          deadline?: string | null
          document_id?: string
          id?: string
          metadata?: Json
          required_signers?: string[]
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_workflows_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "issuer_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          expiry_date: string | null
          file_path: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          name: string
          project_id: string | null
          status: string
          type: string
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
          workflow_stage_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          expiry_date?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          name: string
          project_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
          workflow_stage_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expiry_date?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
          workflow_stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_workflow_stage_id_fkey"
            columns: ["workflow_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      faucet_requests: {
        Row: {
          amount: string
          created_at: string | null
          id: string
          ip_address: string | null
          network: string
          status: string
          token_address: string | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          amount: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          network: string
          status?: string
          token_address?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          amount?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          network?: string
          status?: string
          token_address?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      investor_approvals: {
        Row: {
          approval_date: string | null
          approval_type: string
          created_at: string | null
          id: string
          investor_id: string
          metadata: Json | null
          rejection_reason: string | null
          required_documents: Json | null
          review_notes: string | null
          reviewer_id: string | null
          status: string
          submission_date: string | null
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          approval_type: string
          created_at?: string | null
          id?: string
          investor_id: string
          metadata?: Json | null
          rejection_reason?: string | null
          required_documents?: Json | null
          review_notes?: string | null
          reviewer_id?: string | null
          status?: string
          submission_date?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          approval_type?: string
          created_at?: string | null
          id?: string
          investor_id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          required_documents?: Json | null
          review_notes?: string | null
          reviewer_id?: string | null
          status?: string
          submission_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_approvals_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
        ]
      }
      investor_group_members: {
        Row: {
          created_at: string
          group_id: string
          investor_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          investor_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          investor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_group_members_group_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "investor_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_group_members_investor_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
        ]
      }
      investor_groups: {
        Row: {
          created_at: string | null
          description: string | null
          group: string | null
          id: string
          member_count: number
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group?: string | null
          id?: string
          member_count?: number
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group?: string | null
          id?: string
          member_count?: number
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_groups_investors: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          investor_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          investor_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          investor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_groups_investors_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "investor_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_groups_investors_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
        ]
      }
      investors: {
        Row: {
          accreditation_expiry_date: string | null
          accreditation_status: string | null
          accreditation_type: string | null
          company: string | null
          created_at: string | null
          email: string
          investment_preferences: Json | null
          investor_id: string
          investor_status: string | null
          investor_type: string | null
          kyc_expiry_date: string | null
          kyc_status: string
          last_compliance_check: string | null
          lastUpdated: string | null
          name: string
          notes: string | null
          onboarding_completed: boolean | null
          profile_data: Json | null
          risk_assessment: Json | null
          tax_id_number: string | null
          tax_residency: string | null
          type: string
          updated_at: string | null
          verification_details: Json | null
          wallet_address: string | null
        }
        Insert: {
          accreditation_expiry_date?: string | null
          accreditation_status?: string | null
          accreditation_type?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          investment_preferences?: Json | null
          investor_id?: string
          investor_status?: string | null
          investor_type?: string | null
          kyc_expiry_date?: string | null
          kyc_status: string
          last_compliance_check?: string | null
          lastUpdated?: string | null
          name: string
          notes?: string | null
          onboarding_completed?: boolean | null
          profile_data?: Json | null
          risk_assessment?: Json | null
          tax_id_number?: string | null
          tax_residency?: string | null
          type: string
          updated_at?: string | null
          verification_details?: Json | null
          wallet_address?: string | null
        }
        Update: {
          accreditation_expiry_date?: string | null
          accreditation_status?: string | null
          accreditation_type?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          investment_preferences?: Json | null
          investor_id?: string
          investor_status?: string | null
          investor_type?: string | null
          kyc_expiry_date?: string | null
          kyc_status?: string
          last_compliance_check?: string | null
          lastUpdated?: string | null
          name?: string
          notes?: string | null
          onboarding_completed?: boolean | null
          profile_data?: Json | null
          risk_assessment?: Json | null
          tax_id_number?: string | null
          tax_residency?: string | null
          type?: string
          updated_at?: string | null
          verification_details?: Json | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          issued_date: string | null
          paid: boolean | null
          subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_date?: string | null
          paid?: boolean | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_date?: string | null
          paid?: boolean | null
          subscription_id?: string | null
        }
        Relationships: []
      }
      issuer_access_roles: {
        Row: {
          created_at: string
          created_by: string
          id: string
          issuer_id: string
          role: Database["public"]["Enums"]["issuer_role"]
          updated_at: string
          updated_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          issuer_id: string
          role: Database["public"]["Enums"]["issuer_role"]
          updated_at?: string
          updated_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          issuer_id?: string
          role?: Database["public"]["Enums"]["issuer_role"]
          updated_at?: string
          updated_by?: string
          user_id?: string
        }
        Relationships: []
      }
      issuer_documents: {
        Row: {
          created_at: string
          created_by: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at: string | null
          file_url: string
          id: string
          issuer_id: string
          last_reviewed_at: string | null
          metadata: Json
          reviewed_by: string | null
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string
          updated_by: string
          uploaded_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_url: string
          id?: string
          issuer_id: string
          last_reviewed_at?: string | null
          metadata?: Json
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          updated_by: string
          uploaded_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_url?: string
          id?: string
          issuer_id?: string
          last_reviewed_at?: string | null
          metadata?: Json
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          updated_by?: string
          uploaded_at?: string
          version?: number
        }
        Relationships: []
      }
      kyc_screening_logs: {
        Row: {
          created_at: string | null
          id: string
          investor_id: string
          method: string
          new_status: string | null
          notes: string | null
          performed_by: string | null
          previous_status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          investor_id: string
          method: string
          new_status?: string | null
          notes?: string | null
          performed_by?: string | null
          previous_status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          investor_id?: string
          method?: string
          new_status?: string | null
          notes?: string | null
          performed_by?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_screening_logs_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
        ]
      }
      mfa_policies: {
        Row: {
          applies_to: string[]
          created_at: string | null
          exceptions: string[]
          id: string
          name: string
          required: boolean
        }
        Insert: {
          applies_to: string[]
          created_at?: string | null
          exceptions: string[]
          id?: string
          name: string
          required: boolean
        }
        Update: {
          applies_to?: string[]
          created_at?: string | null
          exceptions?: string[]
          id?: string
          name?: string
          required?: boolean
        }
        Relationships: []
      }
      multi_sig_confirmations: {
        Row: {
          confirmed: boolean | null
          created_at: string | null
          id: string
          owner: string
          signature: string
          signer: string | null
          timestamp: string | null
          transaction_id: string | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string | null
          id?: string
          owner: string
          signature: string
          signer?: string | null
          timestamp?: string | null
          transaction_id?: string | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string | null
          id?: string
          owner?: string
          signature?: string
          signer?: string | null
          timestamp?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multi_sig_confirmations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "multi_sig_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      multi_sig_transactions: {
        Row: {
          blockchain: string
          blockchain_specific_data: Json | null
          confirmations: number
          created_at: string | null
          data: string
          description: string | null
          destination_wallet_address: string
          executed: boolean
          hash: string
          id: string
          nonce: number
          required: number | null
          to: string | null
          token_address: string | null
          token_symbol: string | null
          updated_at: string | null
          value: string
          wallet_id: string | null
        }
        Insert: {
          blockchain: string
          blockchain_specific_data?: Json | null
          confirmations?: number
          created_at?: string | null
          data?: string
          description?: string | null
          destination_wallet_address: string
          executed?: boolean
          hash: string
          id?: string
          nonce: number
          required?: number | null
          to?: string | null
          token_address?: string | null
          token_symbol?: string | null
          updated_at?: string | null
          value: string
          wallet_id?: string | null
        }
        Update: {
          blockchain?: string
          blockchain_specific_data?: Json | null
          confirmations?: number
          created_at?: string | null
          data?: string
          description?: string | null
          destination_wallet_address?: string
          executed?: boolean
          hash?: string
          id?: string
          nonce?: number
          required?: number | null
          to?: string | null
          token_address?: string | null
          token_symbol?: string | null
          updated_at?: string | null
          value?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multi_sig_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "multi_sig_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      multi_sig_wallets: {
        Row: {
          address: string
          blockchain: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          owners: string[]
          threshold: number
          updated_at: string | null
        }
        Insert: {
          address: string
          blockchain: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          owners: string[]
          threshold: number
          updated_at?: string | null
        }
        Update: {
          address?: string
          blockchain?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          owners?: string[]
          threshold?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_required: boolean
          action_url: string | null
          created_at: string
          date: string
          description: string
          id: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_required?: boolean
          action_url?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_required?: boolean
          action_url?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_restrictions: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          id: string
          reason: string
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          id?: string
          reason: string
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          id?: string
          reason?: string
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: Json | null
          business_type: string | null
          compliance_status: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          jurisdiction: string | null
          legal_name: string | null
          legal_representatives: Json | null
          name: string
          onboarding_completed: boolean | null
          registration_date: string | null
          registration_number: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          business_type?: string | null
          compliance_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          jurisdiction?: string | null
          legal_name?: string | null
          legal_representatives?: Json | null
          name: string
          onboarding_completed?: boolean | null
          registration_date?: string | null
          registration_number?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          business_type?: string | null
          compliance_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          jurisdiction?: string | null
          legal_name?: string | null
          legal_representatives?: Json | null
          name?: string
          onboarding_completed?: boolean | null
          registration_date?: string | null
          registration_number?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      policy_rule_approvers: {
        Row: {
          comment: string | null
          created_at: string
          created_by: string
          id: string
          policy_rule_id: string
          status: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          created_by: string
          id?: string
          policy_rule_id: string
          status?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          created_by?: string
          id?: string
          policy_rule_id?: string
          status?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_rule_approvers_policy_rule_id_fkey"
            columns: ["policy_rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["rule_id"]
          },
        ]
      }
      policy_rule_approvers_backup: {
        Row: {
          comment: string | null
          created_at: string | null
          created_by: string | null
          policy_rule_id: string | null
          status: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          policy_rule_id?: string | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          policy_rule_id?: string | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      policy_template_approvers: {
        Row: {
          created_by: string | null
          status: string | null
          template_id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          created_by?: string | null
          status?: string | null
          template_id: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          created_by?: string | null
          status?: string | null
          template_id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_template_approvers_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "policy_templates"
            referencedColumns: ["template_id"]
          },
          {
            foreignKeyName: "policy_template_approvers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "policy_template_approvers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          status: string
          template_data: Json
          template_id: string
          template_name: string
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          status?: string
          template_data: Json
          template_id?: string
          template_name: string
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          status?: string
          template_data?: Json
          template_id?: string
          template_name?: string
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          authorized_shares: number | null
          company_valuation: number | null
          created_at: string | null
          description: string | null
          funding_round: string | null
          id: string
          jurisdiction: string | null
          legal_entity: string | null
          name: string
          project_type: string | null
          share_price: number | null
          status: string | null
          target_raise: number | null
          tax_id: string | null
          token_symbol: string | null
          updated_at: string | null
        }
        Insert: {
          authorized_shares?: number | null
          company_valuation?: number | null
          created_at?: string | null
          description?: string | null
          funding_round?: string | null
          id?: string
          jurisdiction?: string | null
          legal_entity?: string | null
          name: string
          project_type?: string | null
          share_price?: number | null
          status?: string | null
          target_raise?: number | null
          tax_id?: string | null
          token_symbol?: string | null
          updated_at?: string | null
        }
        Update: {
          authorized_shares?: number | null
          company_valuation?: number | null
          created_at?: string | null
          description?: string | null
          funding_round?: string | null
          id?: string
          jurisdiction?: string | null
          legal_entity?: string | null
          name?: string
          project_type?: string | null
          share_price?: number | null
          status?: string | null
          target_raise?: number | null
          tax_id?: string | null
          token_symbol?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      redemption_approvers: {
        Row: {
          approved: boolean
          approved_at: string | null
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          redemption_id: string
          role: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          redemption_id: string
          role: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          redemption_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_approvers_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "redemption_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      redemption_requests: {
        Row: {
          conversion_rate: number
          created_at: string
          destination_wallet_address: string
          id: string
          investor_count: number | null
          investor_id: string | null
          investor_name: string | null
          is_bulk_redemption: boolean | null
          redemption_type: string
          rejected_by: string | null
          rejection_reason: string | null
          rejection_timestamp: string | null
          required_approvals: number
          source_wallet_address: string
          status: string
          token_amount: number
          token_type: string
          updated_at: string
        }
        Insert: {
          conversion_rate: number
          created_at?: string
          destination_wallet_address: string
          id?: string
          investor_count?: number | null
          investor_id?: string | null
          investor_name?: string | null
          is_bulk_redemption?: boolean | null
          redemption_type: string
          rejected_by?: string | null
          rejection_reason?: string | null
          rejection_timestamp?: string | null
          required_approvals?: number
          source_wallet_address: string
          status: string
          token_amount: number
          token_type: string
          updated_at?: string
        }
        Update: {
          conversion_rate?: number
          created_at?: string
          destination_wallet_address?: string
          id?: string
          investor_count?: number | null
          investor_id?: string | null
          investor_name?: string | null
          is_bulk_redemption?: boolean | null
          redemption_type?: string
          rejected_by?: string | null
          rejection_reason?: string | null
          rejection_timestamp?: string | null
          required_approvals?: number
          source_wallet_address?: string
          status?: string
          token_amount?: number
          token_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      redemption_rules: {
        Row: {
          allow_any_time_redemption: boolean | null
          created_at: string | null
          enable_admin_override: boolean | null
          enable_pro_rata_distribution: boolean | null
          id: string
          immediate_execution: boolean | null
          lock_tokens_on_request: boolean | null
          lock_up_period: number | null
          notify_investors: boolean | null
          queue_unprocessed_requests: boolean | null
          redemption_type: string
          repurchase_frequency: string | null
          require_multi_sig_approval: boolean | null
          required_approvers: number | null
          rule_id: string | null
          settlement_method: string | null
          submission_window_days: number | null
          total_approvers: number | null
          updated_at: string | null
          use_latest_nav: boolean | null
          use_window_nav: boolean | null
        }
        Insert: {
          allow_any_time_redemption?: boolean | null
          created_at?: string | null
          enable_admin_override?: boolean | null
          enable_pro_rata_distribution?: boolean | null
          id?: string
          immediate_execution?: boolean | null
          lock_tokens_on_request?: boolean | null
          lock_up_period?: number | null
          notify_investors?: boolean | null
          queue_unprocessed_requests?: boolean | null
          redemption_type: string
          repurchase_frequency?: string | null
          require_multi_sig_approval?: boolean | null
          required_approvers?: number | null
          rule_id?: string | null
          settlement_method?: string | null
          submission_window_days?: number | null
          total_approvers?: number | null
          updated_at?: string | null
          use_latest_nav?: boolean | null
          use_window_nav?: boolean | null
        }
        Update: {
          allow_any_time_redemption?: boolean | null
          created_at?: string | null
          enable_admin_override?: boolean | null
          enable_pro_rata_distribution?: boolean | null
          id?: string
          immediate_execution?: boolean | null
          lock_tokens_on_request?: boolean | null
          lock_up_period?: number | null
          notify_investors?: boolean | null
          queue_unprocessed_requests?: boolean | null
          redemption_type?: string
          repurchase_frequency?: string | null
          require_multi_sig_approval?: boolean | null
          required_approvers?: number | null
          rule_id?: string | null
          settlement_method?: string | null
          submission_window_days?: number | null
          total_approvers?: number | null
          updated_at?: string | null
          use_latest_nav?: boolean | null
          use_window_nav?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "redemption_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["rule_id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_name: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_name: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_name?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_name_fkey"
            columns: ["permission_name"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "role_permissions_permission_name_fkey"
            columns: ["permission_name"]
            isOneToOne: false
            referencedRelation: "user_permissions_view"
            referencedColumns: ["permission_name"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          priority: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          priority: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          created_at: string | null
          created_by: string
          is_template: boolean | null
          rule_details: Json | null
          rule_id: string
          rule_name: string
          rule_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          is_template?: boolean | null
          rule_details?: Json | null
          rule_id?: string
          rule_name: string
          rule_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          is_template?: boolean | null
          rule_details?: Json | null
          rule_id?: string
          rule_name?: string
          rule_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          contract_address: string | null
          created_at: string
          details: string | null
          device_info: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          related_events: string[] | null
          severity: string
          status: string | null
          timestamp: string
          transaction_hash: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
          wallet_id: string | null
        }
        Insert: {
          contract_address?: string | null
          created_at?: string
          details?: string | null
          device_info?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          related_events?: string[] | null
          severity: string
          status?: string | null
          timestamp?: string
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
          wallet_id?: string | null
        }
        Update: {
          contract_address?: string | null
          created_at?: string
          details?: string | null
          device_info?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          related_events?: string[] | null
          severity?: string
          status?: string | null
          timestamp?: string
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
          wallet_id?: string | null
        }
        Relationships: []
      }
      signatures: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string | null
          signature: string
          signer: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          signature: string
          signer: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string | null
          signature?: string
          signer?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "transaction_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_requirements: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          failure_reason: string | null
          id: string
          name: string
          order: number
          stage_id: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          failure_reason?: string | null
          id?: string
          name: string
          order: number
          stage_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          failure_reason?: string | null
          id?: string
          name?: string
          order?: number
          stage_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_requirements_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          allocated: boolean
          confirmed: boolean
          created_at: string | null
          currency: string
          distributed: boolean
          fiat_amount: number
          id: string
          investor_id: string
          notes: string | null
          project_id: string | null
          subscription_date: string | null
          subscription_id: string
          updated_at: string | null
        }
        Insert: {
          allocated?: boolean
          confirmed?: boolean
          created_at?: string | null
          currency: string
          distributed?: boolean
          fiat_amount: number
          id?: string
          investor_id: string
          notes?: string | null
          project_id?: string | null
          subscription_date?: string | null
          subscription_id: string
          updated_at?: string | null
        }
        Update: {
          allocated?: boolean
          confirmed?: boolean
          created_at?: string | null
          currency?: string
          distributed?: boolean
          fiat_amount?: number
          id?: string
          investor_id?: string
          notes?: string | null
          project_id?: string | null
          subscription_date?: string | null
          subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "subscriptions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      token_allocations: {
        Row: {
          allocation_date: string | null
          created_at: string
          distributed: boolean
          distribution_date: string | null
          distribution_tx_hash: string | null
          id: string
          investor_id: string
          minted: boolean
          minting_date: string | null
          minting_tx_hash: string | null
          notes: string | null
          project_id: string | null
          subscription_id: string
          token_amount: number
          token_type: string
          updated_at: string | null
        }
        Insert: {
          allocation_date?: string | null
          created_at?: string
          distributed?: boolean
          distribution_date?: string | null
          distribution_tx_hash?: string | null
          id?: string
          investor_id: string
          minted?: boolean
          minting_date?: string | null
          minting_tx_hash?: string | null
          notes?: string | null
          project_id?: string | null
          subscription_id: string
          token_amount: number
          token_type: string
          updated_at?: string | null
        }
        Update: {
          allocation_date?: string | null
          created_at?: string
          distributed?: boolean
          distribution_date?: string | null
          distribution_tx_hash?: string | null
          id?: string
          investor_id?: string
          minted?: boolean
          minting_date?: string | null
          minting_tx_hash?: string | null
          notes?: string | null
          project_id?: string | null
          subscription_id?: string
          token_amount?: number
          token_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_allocations_investor_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "token_allocations_project_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_allocations_subscription_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      token_deployments: {
        Row: {
          contract_address: string
          deployed_at: string | null
          deployed_by: string
          deployment_data: Json | null
          id: string
          network: string
          status: string
          token_id: string
          transaction_hash: string
        }
        Insert: {
          contract_address: string
          deployed_at?: string | null
          deployed_by: string
          deployment_data?: Json | null
          id?: string
          network: string
          status?: string
          token_id: string
          transaction_hash: string
        }
        Update: {
          contract_address?: string
          deployed_at?: string | null
          deployed_by?: string
          deployment_data?: Json | null
          id?: string
          network?: string
          status?: string
          token_id?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_deployments_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_designs: {
        Row: {
          contract_address: string | null
          created_at: string | null
          deployment_date: string | null
          id: string
          name: string
          status: string
          total_supply: number
          type: string
        }
        Insert: {
          contract_address?: string | null
          created_at?: string | null
          deployment_date?: string | null
          id?: string
          name: string
          status?: string
          total_supply: number
          type: string
        }
        Update: {
          contract_address?: string | null
          created_at?: string | null
          deployment_date?: string | null
          id?: string
          name?: string
          status?: string
          total_supply?: number
          type?: string
        }
        Relationships: []
      }
      token_templates: {
        Row: {
          blocks: Json
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          project_id: string
          standard: string
          updated_at: string | null
        }
        Insert: {
          blocks: Json
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          project_id: string
          standard: string
          updated_at?: string | null
        }
        Update: {
          blocks?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          standard?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      token_versions: {
        Row: {
          blocks: Json | null
          created_at: string | null
          created_by: string | null
          data: Json
          decimals: number | null
          id: string
          metadata: Json | null
          name: string | null
          standard: string | null
          symbol: string | null
          token_id: string
          version: number
        }
        Insert: {
          blocks?: Json | null
          created_at?: string | null
          created_by?: string | null
          data: Json
          decimals?: number | null
          id?: string
          metadata?: Json | null
          name?: string | null
          standard?: string | null
          symbol?: string | null
          token_id: string
          version: number
        }
        Update: {
          blocks?: Json | null
          created_at?: string | null
          created_by?: string | null
          data?: Json
          decimals?: number | null
          id?: string
          metadata?: Json | null
          name?: string | null
          standard?: string | null
          symbol?: string | null
          token_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "token_versions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          approvals: string[] | null
          blocks: Json
          contract_preview: string | null
          created_at: string | null
          decimals: number
          id: string
          metadata: Json | null
          name: string
          project_id: string
          reviewers: string[] | null
          standard: string
          status: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          approvals?: string[] | null
          blocks: Json
          contract_preview?: string | null
          created_at?: string | null
          decimals?: number
          id?: string
          metadata?: Json | null
          name: string
          project_id: string
          reviewers?: string[] | null
          standard: string
          status?: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          approvals?: string[] | null
          blocks?: Json
          contract_preview?: string | null
          created_at?: string | null
          decimals?: number
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          reviewers?: string[] | null
          standard?: string
          status?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_events: {
        Row: {
          actor: string | null
          actor_role: string | null
          created_at: string
          data: Json
          event_type: string
          id: string
          request_id: string
          timestamp: string
        }
        Insert: {
          actor?: string | null
          actor_role?: string | null
          created_at?: string
          data: Json
          event_type: string
          id?: string
          request_id: string
          timestamp?: string
        }
        Update: {
          actor?: string | null
          actor_role?: string | null
          created_at?: string
          data?: Json
          event_type?: string
          id?: string
          request_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      transaction_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          transaction_id: string | null
          type: string
          wallet_address: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          transaction_id?: string | null
          type: string
          wallet_address: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          transaction_id?: string | null
          type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      transaction_proposals: {
        Row: {
          blockchain: string
          created_at: string | null
          created_by: string | null
          data: string | null
          description: string | null
          id: string
          nonce: number | null
          status: string
          title: string
          to_address: string
          token_address: string | null
          token_symbol: string | null
          updated_at: string | null
          value: string
          wallet_id: string | null
        }
        Insert: {
          blockchain: string
          created_at?: string | null
          created_by?: string | null
          data?: string | null
          description?: string | null
          id?: string
          nonce?: number | null
          status?: string
          title: string
          to_address: string
          token_address?: string | null
          token_symbol?: string | null
          updated_at?: string | null
          value: string
          wallet_id?: string | null
        }
        Update: {
          blockchain?: string
          created_at?: string | null
          created_by?: string | null
          data?: string | null
          description?: string | null
          id?: string
          nonce?: number | null
          status?: string
          title?: string
          to_address?: string
          token_address?: string | null
          token_symbol?: string | null
          updated_at?: string | null
          value?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_proposals_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "multi_sig_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          backup_codes: Json | null
          created_at: string | null
          enabled: boolean
          id: string
          secret: string | null
          updated_at: string | null
          user_id: string
          verified: boolean
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string | null
          enabled?: boolean
          id?: string
          secret?: string | null
          updated_at?: string | null
          user_id: string
          verified?: boolean
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string | null
          enabled?: boolean
          id?: string
          secret?: string | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_permissions_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          ip_address: string | null
          last_active_at: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          encrypted_private_key: string | null
          id: string
          name: string
          public_key: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          encrypted_private_key?: string | null
          id: string
          name: string
          public_key?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          encrypted_private_key?: string | null
          id?: string
          name?: string
          public_key?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      wallet_details: {
        Row: {
          blockchain_specific_data: Json
          created_at: string | null
          id: string
          updated_at: string | null
          wallet_id: string | null
        }
        Insert: {
          blockchain_specific_data: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
          wallet_id?: string | null
        }
        Update: {
          blockchain_specific_data?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_details_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "multi_sig_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          chain_id: string | null
          confirmation_count: number | null
          created_at: string | null
          data: Json | null
          from_address: string | null
          gas_limit: number | null
          gas_price: number | null
          id: string
          nonce: number | null
          status: string | null
          to_address: string | null
          token_address: string | null
          token_symbol: string | null
          tx_hash: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          chain_id?: string | null
          confirmation_count?: number | null
          created_at?: string | null
          data?: Json | null
          from_address?: string | null
          gas_limit?: number | null
          gas_price?: number | null
          id?: string
          nonce?: number | null
          status?: string | null
          to_address?: string | null
          token_address?: string | null
          token_symbol?: string | null
          tx_hash?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          chain_id?: string | null
          confirmation_count?: number | null
          created_at?: string | null
          data?: Json | null
          from_address?: string | null
          gas_limit?: number | null
          gas_price?: number | null
          id?: string
          nonce?: number | null
          status?: string | null
          to_address?: string | null
          token_address?: string | null
          token_symbol?: string | null
          tx_hash?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      whitelist_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          required_approvals: number
          rule_id: string | null
          total_approvers: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          required_approvals: number
          rule_id?: string | null
          total_approvers: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          required_approvals?: number
          rule_id?: string | null
          total_approvers?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whitelist_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whitelist_settings_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["rule_id"]
          },
        ]
      }
      whitelist_signatories: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          id: string
          user_id: string | null
          whitelist_id: string | null
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          id?: string
          user_id?: string | null
          whitelist_id?: string | null
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          id?: string
          user_id?: string | null
          whitelist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whitelist_signatories_whitelist_id_fkey"
            columns: ["whitelist_id"]
            isOneToOne: false
            referencedRelation: "whitelist_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stages: {
        Row: {
          completion_percentage: number
          created_at: string
          description: string | null
          id: string
          name: string
          order: number
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          completion_percentage?: number
          created_at?: string
          description?: string | null
          id: string
          name: string
          order: number
          organization_id: string
          status: string
          updated_at?: string
        }
        Update: {
          completion_percentage?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order?: number
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      restriction_statistics: {
        Row: {
          active_rules: number | null
          blocked_countries: number | null
          blocked_investor_types: number | null
          total_rules: number | null
        }
        Relationships: []
      }
      user_permissions_view: {
        Row: {
          email: string | null
          permission_description: string | null
          permission_name: string | null
          role_name: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
      valid_policy_approvers: {
        Row: {
          comment: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          policy_rule_id: string | null
          status: string | null
          timestamp: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_rule_approvers_policy_rule_id_fkey"
            columns: ["policy_rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["rule_id"]
          },
        ]
      }
    }
    Functions: {
      add_policy_approver: {
        Args:
          | { p_policy_id: string; p_user_id: string; p_created_by: string }
          | {
              policy_id: string
              user_id: string
              created_by: string
              status_val?: string
            }
        Returns: undefined
      }
      add_policy_approver_with_cast: {
        Args: { policy_id: string; user_id: string; created_by_id: string }
        Returns: boolean
      }
      add_table_to_realtime: {
        Args: { table_name: string }
        Returns: undefined
      }
      check_permission: {
        Args: { p_role_name: string; p_resource: string; p_action: string }
        Returns: boolean
      }
      check_user_permission: {
        Args: { user_id: string; permission: string }
        Returns: boolean
      }
      cleanup_orphaned_policy_approvers: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_transaction_events_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_with_privileges: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      exec: {
        Args: { query: string }
        Returns: Json
      }
      get_users_with_any_permission: {
        Args: { permission_names: string[] }
        Returns: {
          user_id: string
          name: string
          email: string
          role: string
        }[]
      }
      get_users_with_permission: {
        Args: { permission_name: string }
        Returns: {
          user_id: string
          name: string
          email: string
          role: string
        }[]
      }
      get_users_with_permission_simple: {
        Args: { p_permission_id: string }
        Returns: string[]
      }
      insert_policy_approver: {
        Args: { p_policy_id: string; p_user_id: string; p_created_by: string }
        Returns: undefined
      }
      list_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      log_audit: {
        Args: {
          p_action: string
          p_user_id: string
          p_entity_type: string
          p_entity_id?: string
          p_details?: string
          p_status?: string
          p_metadata?: Json
          p_old_data?: Json
          p_new_data?: Json
        }
        Returns: string
      }
      safe_cast_to_uuid: {
        Args: { input: string }
        Returns: string
      }
      safe_uuid_cast: {
        Args: { text_id: string }
        Returns: string
      }
      save_consensus_config: {
        Args: {
          p_consensus_type: string
          p_required_approvals: number
          p_eligible_roles: string[]
        }
        Returns: boolean
      }
      update_user_role: {
        Args: { p_user_id: string; p_role: string }
        Returns: undefined
      }
      upsert_policy_template_approver: {
        Args: {
          p_template_id: string
          p_user_id: string
          p_created_by: string
          p_status?: string
        }
        Returns: undefined
      }
      user_has_delete_permission: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      validate_blockchain_address: {
        Args: { blockchain: string; address: string }
        Returns: boolean
      }
    }
    Enums: {
      compliance_status: "compliant" | "non_compliant" | "pending_review"
      document_status: "pending" | "approved" | "rejected" | "expired"
      document_type:
        | "commercial_register"
        | "certificate_incorporation"
        | "memorandum_articles"
        | "director_list"
        | "shareholder_register"
        | "financial_statements"
        | "regulatory_status"
        | "qualification_summary"
        | "business_description"
        | "organizational_chart"
        | "key_people_cv"
        | "aml_kyc_description"
      issuer_role: "admin" | "editor" | "viewer" | "compliance_officer"
      kyc_status: "approved" | "pending" | "failed" | "not_started" | "expired"
      workflow_status: "pending" | "completed" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      compliance_status: ["compliant", "non_compliant", "pending_review"],
      document_status: ["pending", "approved", "rejected", "expired"],
      document_type: [
        "commercial_register",
        "certificate_incorporation",
        "memorandum_articles",
        "director_list",
        "shareholder_register",
        "financial_statements",
        "regulatory_status",
        "qualification_summary",
        "business_description",
        "organizational_chart",
        "key_people_cv",
        "aml_kyc_description",
      ],
      issuer_role: ["admin", "editor", "viewer", "compliance_officer"],
      kyc_status: ["approved", "pending", "failed", "not_started", "expired"],
      workflow_status: ["pending", "completed", "rejected"],
    },
  },
} as const
