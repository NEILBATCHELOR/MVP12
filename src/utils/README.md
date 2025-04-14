# Utils Directory

This directory contains utility functions that provide common functionality across the application without being tied to specific business logic.

## Key Files

### roleUtils.ts
A comprehensive set of utility functions for working with roles and permissions:

#### Interfaces:
- `Role`: Defines the structure of a role with id, name, description, and priority
- `Permission`: Defines the structure of a permission with name and description

#### Key Functions:
- Role Management: `getAllRoles()`, `getRoleById()`, `createRole()`, `updateRole()`, `deleteRole()`
- User-Role Management: `assignRoleToUser()`, `removeRoleFromUser()`, `getUserRoles()`, `userHasRole()`
- Permission Management: `getAllPermissions()`, `getRolePermissions()`, `assignPermissionToRole()`
- Formatting: `formatRoleForDisplay()`, `normalizeRole()`

### formatters.ts
Utility functions for formatting values consistently across the application:

- `formatDate(dateString)`: Formats a date string for display
- `formatTokenAmount(amount, tokenType)`: Formats token amounts appropriately by type
- `formatCurrency(amount, currency)`: Formats currency values with appropriate symbols
- `formatAddress(address)`: Truncates blockchain addresses for display
- `formatPercentage(value)`: Formats decimal values as percentages
- `capitalizeWords(str)`: Capitalizes the first letter of each word
- `formatGasPrice(weiValue)`: Converts gas prices from wei to gwei

### dateHelpers.ts
Helper functions for working with dates:

- `toISOString(date)`: Converts various date formats to ISO string format
- `formatDate(date)`: Formats a date for display

### supabaseHelpers.ts
Utility functions for working with Supabase:

- `executeWithRetry()`: Retries Supabase operations with exponential backoff
- `handleSupabaseError()`: Standardized error handling for Supabase operations
- Query builders and result formatters

### typeMappers.ts
Functions that convert between database types and application models:

- Type conversion utilities
- Data transformation helpers
- Schema validation functions

### typeGuards.ts
TypeScript type guards for safely working with types:

- Type checking functions
- Runtime type validation
- Type narrowing utilities

### workflowMappers.ts
Utilities for managing workflow state transitions:

- Workflow state mapping
- Status transition helpers
- Workflow validation functions

### activityLogHelpers.ts
Helpers for working with activity and audit logs:

- Activity formatter functions
- Log categorization utilities
- Log filtering helpers

### stateHelpers.ts
Utilities for managing application state:

- State comparison functions
- State transformation utilities
- State persistence helpers

### exportUtils.ts
Utilities for data export operations:

- CSV export functions
- PDF generation helpers
- Data formatting for exports

### web3Adapters.ts
Adapter functions for web3/blockchain interactions:

- Chain ID utilities
- Address validation
- Transaction formatting
- Blockchain data converters

## Usage Guidelines

1. Keep utility functions pure (same inputs always produce same outputs)
2. Focus on reusability across the application
3. Avoid business logic in utility functions
4. Group related utilities in appropriately named files
5. Use TypeScript for better type safety
6. Document functions with JSDoc comments
7. Write unit tests for utility functions

## Example Usage

```typescript
import { formatCurrency, formatDate } from '@/utils/formatters';
import { assignRoleToUser } from '@/utils/roleUtils';

// Format values
const formattedPrice = formatCurrency(1250.99, 'USD'); // "$1,250.99"
const formattedDate = formatDate('2023-06-15T12:30:00Z'); // "Jun 15, 2023"

// Assign a role to a user
await assignRoleToUser('user-123', 'role-456');
```