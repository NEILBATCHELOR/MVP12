# Constants Directory

This directory contains constant definitions and enumerations used throughout the application. These constants ensure consistent terminology, behavior, and data structures across the codebase.

## Key Files

### policyTypes.ts

Defines standard policy-related constants and utility functions for the application.

#### Key Constants:

1. **`POLICY_TYPES`**: Standard policy types such as:
   - `TRANSFER_LIMIT` - Sets maximum transaction amount
   - `KYC_VERIFICATION` - Requires KYC verification
   - `AML_SANCTIONS` - Enforces AML and sanctions screening
   - `LOCK_UP_PERIOD` - Prevents transfers during lock-up
   - `WHITELIST_TRANSFER` - Restricts transfers to approved addresses
   - And many more policy types

2. **`RULE_TYPES`**: Categories for rules:
   - `TRANSACTION` - Transaction-related rules
   - `WALLET` - Wallet-related rules
   - `ASSET` - Asset-related rules
   - `USER` - User-related rules
   - `TIME` - Time-based rules
   - `POLICY_METADATA` - Policy metadata rules

3. **`POLICY_STATUS`**: Possible policy statuses:
   - `ACTIVE` - Active policies
   - `INACTIVE` - Inactive policies
   - `DRAFT` - Draft policies
   - `PENDING` - Pending policies

4. **`JURISDICTIONS`**: Standard jurisdictions:
   - `GLOBAL` - Global jurisdiction
   - `US` - United States
   - `EU` - European Union
   - `UK` - United Kingdom
   - `ASIA_PACIFIC` - Asia Pacific region
   - `CUSTOM` - Custom jurisdiction

5. **`REVIEW_FREQUENCIES`**: Policy review frequency options:
   - `MONTHLY` - Monthly review
   - `QUARTERLY` - Quarterly review
   - `BIANNUALLY` - Bi-annual review
   - `ANNUALLY` - Annual review
   - `CUSTOM` - Custom review schedule

#### Helper Functions:

- `getPolicyTypeName(type)`: Converts a policy type code to a human-readable name
- `getJurisdictionName(jurisdiction)`: Converts a jurisdiction code to a human-readable name
- `getReviewFrequencyName(frequency)`: Converts a review frequency code to a human-readable name
- `getPoliciesForDashboard()`: Returns policy types formatted for dashboard display
- `getJurisdictionsForDashboard()`: Returns jurisdictions formatted for dashboard display
- `getReviewFrequenciesForDashboard()`: Returns review frequencies formatted for dashboard display

## Usage Guidelines

Constants should be:

1. Used consistently throughout the application
2. Defined using uppercase for constant names (`POLICY_TYPES`)
3. Exported as `const` to prevent modification
4. Accompanied by helper functions for display purposes
5. Well-documented with JSDoc comments
6. Named with clear, descriptive names

## Example Usage

```typescript
import { POLICY_TYPES, getPolicyTypeName } from '@/constants/policyTypes';

// Using a constant
const policyType = POLICY_TYPES.TRANSFER_LIMIT;

// Using a helper function
const displayName = getPolicyTypeName(policyType); // Returns "Transfer Limit"

// For select components
const policyOptions = getPoliciesForDashboard();
```