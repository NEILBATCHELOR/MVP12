# Supabase Migrations

This folder contains SQL migrations that need to be applied to your Supabase database to enable the enhanced RBAC (Role-Based Access Control) system.

## Running the Migrations

You can run the migrations in one of the following ways:

### Option 1: Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Navigate to the project root
cd /path/to/your/project

# Run migrations
npx supabase migration up
```

### Option 2: Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Open each SQL file in this directory
4. Run them in the following order:
   - `20240401_add_enhanced_rbac_tables.sql`
   - `20240402_add_permission_functions.sql`

## Migration Files

### 20240401_add_enhanced_rbac_tables.sql

Creates the following tables:
- `roles` - Role definitions
- `permissions` - Permission definitions
- `role_permissions` - Mapping between roles and permissions
- `approval_configs` - Configuration for approval workflows
- `approval_requests` - Approval request tracking
- `audit_logs` - Enhanced audit logging

Also adds default roles and permissions.

### 20240402_add_permission_functions.sql

Adds the following SQL functions:
- `check_permission` - Checks if a role has a specific permission
- `log_audit` - Logs an audit entry

## Troubleshooting

If you encounter issues with the migrations:

1. Check that your Supabase project has the necessary permissions to create tables and functions
2. Verify that you're running the migrations in the correct order
3. If a migration partially completed, you may need to drop the affected tables and run again

## Manual Testing

You can test if the migrations worked correctly by running:

```sql
-- Check if roles table exists and has data
SELECT * FROM roles;

-- Test the check_permission function
SELECT check_permission('super_admin', 'system', 'view_audit_logs');
```