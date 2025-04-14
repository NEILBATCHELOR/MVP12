# Components Directory

## Overview
This directory contains all React components organized into domain-specific folders. Each folder encapsulates related components for specific functional areas of the application.

## Directory Structure

### Core Application Components
- **home.tsx**: Central hub component that orchestrates project management, cap table views, and subscription handling.

### Domain-Specific Folders
- [**activity/**](./activity/README.md): Components for user activity tracking and audit logs.
- [**auth/**](./auth/README.md): Authentication and authorization components.
- [**captable/**](./captable/README.md): Cap table management, visualization, and financial modeling.
- [**dashboard/**](./dashboard/README.md): Administrative and user dashboard components.
- [**investors/**](./investors/README.md): Investor management, onboarding, and KYC components.
- [**layout/**](./layout/README.md): Application layout and navigation structure.
- [**onboarding/**](./onboarding/README.md): User and entity onboarding flows.
- [**projects/**](./projects/README.md): Project creation and management components.
- [**redemption/**](./redemption/README.md): Token redemption and conversion components.
- [**reports/**](./reports/README.md): Reporting and data visualization.
- [**rules/**](./rules/README.md): Business rules and compliance configuration.
- [**shared/**](./shared/README.md): Reusable utility components shared across the application.
- [**subscriptions/**](./subscriptions/README.md): Subscription management and billing components.
- [**tokens/**](./tokens/README.md): Token creation, management, and administration.
- [**ui/**](./ui/README.md): Foundational UI components forming the design system.
- [**wallet/**](./wallet/README.md): Cryptocurrency wallet integration and management.

## Development Guidelines

### Component Organization
1. Components should be placed in the most appropriate domain-specific folder based on their primary purpose.
2. Shared or reusable components should be placed in the `shared` directory.
3. UI/design system components belong in the `ui` directory.

### TypeScript Configuration
Each major component directory contains its own `tsconfig.json` file to define TypeScript settings specific to that domain.

### Component Structure
- Components should follow a consistent organization pattern:
  - Import statements
  - Interface/type definitions
  - Component declaration with JSDoc comments
  - Export statement

### State Management
- Use React Context for domain-specific state management
- Prefer hooks for component state
- Keep state as close as possible to where it's used

## Dependency Guidelines
- Import UI components from `@/components/ui`
- Import shared components from `@/components/shared`
- Import types from `@/types/database.ts` and `@/types/supabase.ts`
- Import business models from `@/types/centralModels.ts`
- Use consistent type imports with `import type { ... } from ...`