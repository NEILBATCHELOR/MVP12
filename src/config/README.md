# Config Directory

This directory contains configuration files that define global settings, constants, and registries used throughout the application.

## Key Files

### ruleRegistry.ts

A central registry for rule configurations and metadata, serving as a single source of truth for all rule types in the system. This file defines:

- `RuleTypeConfig` interface that specifies the structure of rule type configurations
- `ruleTypeRegistry` object containing configurations for all available rule types
- Utility functions for accessing and manipulating the registry

#### Rule Types Defined:

1. **Transaction Rules**:
   - `transfer_limit` - Sets maximum transaction amount
   - `velocity_limit` - Controls transaction volume over time
   - `whitelist_transfer` - Restricts transfers to approved addresses

2. **Compliance Rules**:
   - `kyc_verification` - Requires KYC verification
   - `aml_sanctions` - Enforces AML and sanctions screening
   - `accredited_investor` - Ensures accredited investor status

3. **Asset Rules**:
   - `lock_up_period` - Prevents transfers during lock-up
   - `volume_supply_limit` - Controls asset supply

4. **Investor Rules**:
   - `investor_position_limit` - Caps investor holdings
   - `investor_transaction_limit` - Limits transaction size by tier

5. **Fund Rules**:
   - `tokenized_fund` - Configures tokenized fund parameters
   - `standard_redemption` - Sets redemption parameters
   - `interval_fund_redemption` - Configures interval fund redemptions

#### Utility Functions:

- `getRuleTypeConfig(type: string)` - Retrieves config for a specific rule type
- `getRuleTypesByCategory()` - Groups rule types by category
- `getAllRuleTypes()` - Returns all available rule types
- `validateRuleConfig(rule: any)` - Validates rule configuration against schema

## Usage

Config files should be imported directly where needed throughout the application. They provide static configuration that influences application behavior without requiring environment variables or backend calls.

Example usage:
```typescript
import { getRuleTypeConfig } from '@/config/ruleRegistry';

// Get config for a specific rule type
const transferLimitConfig = getRuleTypeConfig('transfer_limit');

// Use the configuration
console.log(`Rule name: ${transferLimitConfig.name}`);
console.log(`Fields required: ${transferLimitConfig.fields.join(', ')}`);
```

## Best Practices

1. Keep configuration data separate from business logic
2. Use TypeScript interfaces to define configuration structures
3. Provide utility functions for accessing complex configuration
4. Document each configuration option with JSDoc comments
5. Group related configuration options together
6. Use descriptive naming for configuration keys