# Source Code Directory Documentation

This document provides a comprehensive overview of the source code directory structure, files, functionality, and dependencies.

## Directory Structure

```
src/
├── components/    # UI components
├── config/        # Configuration files
├── constants/     # Application constants and enums
├── context/       # React context providers
├── contexts/      # Additional context providers
├── hooks/         # React hooks
├── lib/           # Core libraries and utilities
├── pages/         # Page components for routing
├── routes/        # Routing configuration
├── scripts/       # Utility scripts
├── services/      # Business logic and API services
├── stories/       # Storybook stories
├── storyboards/   # UI storyboards and design specs
├── tempobook/     # Tempo Labs documentation
├── tests/         # Test utilities and helpers
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── App.tsx        # Main application component
├── env.d.ts       # Environment variable type definitions
├── index.css      # Global styles
├── main.tsx       # Application entry point
├── tsconfig.json  # TypeScript configuration
├── typedef.config.js # TypeScript definition config
└── vite-env.d.ts  # Vite environment types
```

## Key Directories

### `/components`

Contains all React UI components organized by feature or domain. Components follow a modular structure with proper TypeScript interfaces for props.

**Key Components:**
- `ui/`: Reusable UI components built with shadcn/ui
- `forms/`: Form components with validation
- `layout/`: Page layout components
- `shared/`: Common shared components
- `UserManagement/`: User management related components
- `tokens/`: Token and blockchain related components
- `wallet/`: Wallet management components

### `/config`

Contains application configuration files.

**Key Files:**
- `api.ts`: API configuration
- `theme.ts`: UI theme configuration
- `routes.ts`: Application routes configuration

### `/constants`

Application-wide constants and enumeration values.

**Key Files:**
- `routes.ts`: Route path constants
- `api.ts`: API endpoint constants
- `messages.ts`: UI message constants

### `/context` and `/contexts`

React context providers for state management throughout the application.

**Key Contexts:**
- `AuthContext.tsx`: Authentication state management
- `Web3Context.tsx`: Blockchain interaction context
- `ToastContext.tsx`: Toast notification management
- `ThemeContext.tsx`: Theme management

### `/hooks`

Custom React hooks for shared logic.

**Key Hooks:**
- `useApi.ts`: Hook for API calls with error handling
- `useAuth.ts`: Authentication hooks
- `useForm.ts`: Form handling hooks
- `useLocalStorage.ts`: Local storage management
- `useWallet.ts`: Wallet interaction hooks

### `/lib`

Core libraries and integration with third-party services.

**Key Libraries:**
- `supabaseClient.ts`: Supabase client with retry logic
- `web3/`: Blockchain integration libraries
  - `WalletManager.ts`: Wallet management with ethers.js
  - `MultiSigWalletManager.ts`: Multi-signature wallet support
  - `TokenManager.ts`: Token management utilities
- `activityLogger.ts`: Activity logging utilities
- `auditLogger.ts`: Audit logging utilities

### `/pages`

Page components that represent different routes in the application.

**Key Pages:**
- `Dashboard.tsx`: Main dashboard
- `Projects.tsx`: Projects overview
- `Investors.tsx`: Investors management
- `Wallet.tsx`: Wallet management
- `Settings.tsx`: User settings

### `/routes`

Routing configuration using React Router.

**Key Files:**
- `index.tsx`: Root router setup
- `PrivateRoute.tsx`: Authentication protected routes
- `PublicRoute.tsx`: Public accessible routes

### `/services`

Business logic and API service layers.

**Key Services:**
- `api.ts`: Core API service
- `auth/`: Authentication services
  - `AuthService.ts`: User authentication
  - `TokenService.ts`: Authentication token management
- `project/`: Project-related services
- `user/`: User management services
- `wallet/`: Wallet-related services
  - `ETHWalletGenerator.ts`: Ethereum wallet generation
  - `WalletService.ts`: Wallet management services

### `/types`

TypeScript type definitions, interfaces, and type utilities.

**Key Files:**
- `database.ts`: Database schema types
- `supabase.ts`: Supabase client types
- `centralModels.ts`: Core business model interfaces
- `status.ts`: Status enum definitions
- `api.ts`: API request/response types

### `/utils`

Utility functions and helpers.

**Key Utilities:**
- `typeMappers.ts`: Functions to map between database and model types
- `typeGuards.ts`: Type guard functions for runtime type checking
- `date.ts`: Date manipulation utilities
- `format.ts`: Data formatting utilities
- `validation.ts`: Data validation utilities
- `wallet/`: Wallet-specific utilities
  - `walletErrors.ts`: Wallet error types
  - `walletValidators.ts`: Wallet validation functions

## Core Files

### `App.tsx`

The main application component that sets up:
- Top-level providers (AuthProvider, ThemeProvider, etc.)
- Global layout
- Routing structure
- Error boundaries

### `main.tsx`

The application entry point that:
- Renders the root App component
- Sets up global providers
- Initializes third-party libraries
- Configures global error handling

### `env.d.ts`

Type definitions for environment variables used in the application. Ensures type safety when accessing environment variables through `import.meta.env`.

## Dependencies

### Core Dependencies

- **React**: Frontend UI library (v18.2.0)
- **React Router**: Routing solution (v6.23.1)
- **TypeScript**: Type system (v5.2.2)
- **Supabase**: Backend and database (v2.45.6)
- **ethers.js**: Ethereum library (v6.10.0)
- **Vite**: Build tool and development server (v5.2.0)

### UI Dependencies

- **shadcn/ui**: Components built on Radix UI
- **Radix UI**: Low-level UI primitives
- **Tailwind CSS**: Utility CSS framework (v3.4.1)
- **clsx/class-variance-authority**: Class composition utilities
- **Framer Motion**: Animation library (v11.18.0)
- **Recharts**: Chart components (v2.15.1)

### Form Handling

- **React Hook Form**: Form management (v7.51.5)
- **Zod**: Schema validation (v3.24.2)
- **@hookform/resolvers**: Form validation integration (v3.10.0)

### Developer Tools

- **ESLint**: Code linting (v9.23.0)
- **SWC**: TypeScript/JavaScript compiler (v1.3.96)
- **TypeScript**: Type checking (v5.2.2)
- **Tempo DevTools**: Development utilities (v2.0.96)

## Type System

The application implements a robust type system following these principles:

1. **Database Types**: Imported from `types/database.ts`
2. **Supabase Types**: Imported from `types/supabase.ts`
3. **Status Enums**: Imported from `types/status.ts`
4. **Business Models**: Imported from `types/centralModels.ts`
5. **Type Mappers**: Functions in `utils/typeMappers.ts` convert between database and application models
6. **Type Guards**: Functions in `utils/typeGuards.ts` provide runtime type validation
7. **Error Handling**: Consistent patterns with proper typing

## Database Access Pattern

```typescript
import { executeWithRetry } from '../lib/supabaseClient';
import { toUserModel } from '../utils/typeMappers';
import { UserStatus } from '../types/status';

async function getActiveUsers() {
  try {
    const { data, error } = await executeWithRetry(() => 
      supabase
        .from('users')
        .select('*')
        .eq('status', UserStatus.Active)
    );
    
    if (error) throw error;
    if (!data || data.length === 0) return [];
    
    return data.map(toUserModel);
  } catch (err) {
    console.error('Error fetching active users:', err);
    throw err;
  }
}
```

## Component Pattern

```typescript
import { useState } from 'react';
import { User } from '../types/centralModels';
import { validateUser } from '../utils/typeGuards';

interface UserCardProps {
  user: User;
  onUpdate?: (user: User) => void;
  isEditable?: boolean;
}

export function UserCard({ user, onUpdate, isEditable = false }: UserCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Component implementation
}
```

## Testing and Validation

Type safety is enforced through multiple mechanisms:

1. **TypeScript Configuration**: Settings in `tsconfig.json`
2. **Type Checking Script**: `scripts/type-check.js` for comprehensive checking
3. **ESLint Rules**: Type-focused ESLint rules in `eslint-type-safety.js`
4. **Runtime Validation**: Type guards for runtime safety

## Getting Started with Development

1. **Environment Setup**:
   ```bash
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev
   ```

3. **Type Checking**:
   ```bash
   npm run type-check
   # or
   node scripts/type-check.js
   ```

4. **Building for Production**:
   ```bash
   npm run build
   ```

## Best Practices

1. Always import types from the appropriate files:
   - Database types from `types/database.ts`
   - Status enums from `types/status.ts`
   - Business models from `types/centralModels.ts`

2. Use type mapping functions to convert between database and application models

3. Implement proper error handling with try/catch blocks and meaningful error messages

4. Define explicit interfaces for component props

5. Use status enums instead of string literals for status values

6. Validate data at application boundaries (API, forms, etc.)

7. Follow the documented patterns in `.cursorrules` for consistent development