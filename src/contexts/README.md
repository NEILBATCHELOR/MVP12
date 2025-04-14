# Contexts Directory

This directory contains React Context providers that manage and share global state across components in the application.

## Key Files

### AuthProvider.tsx

The AuthProvider is a central component that manages authentication state and provides authentication-related functionality throughout the application. It integrates with Supabase for authentication and wraps the PermissionsProvider for role-based access control.

#### Features:

- Authentication state management (session, user, loading)
- Authentication methods (signIn, signOut)
- Integration with Supabase authentication
- Session persistence
- Authentication event handling
- Integrated with PermissionsProvider

#### Implementation Details:

- Uses React Context API to share authentication state
- Listens for auth state changes via Supabase `onAuthStateChange`
- Provides user and session information to all child components
- Handles authentication errors
- Exposes a convenient `useAuth` hook for accessing auth context

#### Usage:

```tsx
import { useAuth } from '@/contexts/AuthProvider';

function MyComponent() {
  const { user, signOut, loading } = useAuth();
  
  if (loading) return <p>Loading...</p>;
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

### Permissions System

The permissions system is implemented through the PermissionsProvider, which is wrapped by AuthProvider. This provides:

- Role-based access control
- Permission checking
- User role management
- Integration with Supabase for permission storage

#### Usage

```tsx
import { usePermissions } from '@/hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission } = usePermissions();
  // ... component logic
};
```

## Architecture

The context providers are organized in a hierarchy:

```
AuthProvider
└── PermissionsProvider
    └── Application Components
```

This structure ensures that:
- Authentication state is available throughout the app
- Permissions are always checked against an authenticated user
- Components have access to both auth and permission contexts

## Security Considerations

- All authentication is handled through Supabase
- Permissions are checked on both client and server side
- User roles and permissions are stored securely in the database
- Session management follows security best practices

## Related Contexts

Note that there is another `context` directory (singular) that contains additional context providers:

- `NotificationContext.tsx` - Manages notification state and display
- `Web3Context.tsx` - Provides blockchain/web3 functionality

## Best Practices

1. Context providers should focus on specific domains of state
2. Prefer hooks for accessing context (`useAuth()` instead of `<AuthContext.Consumer>`)
3. Include loading states to handle asynchronous operations
4. Document the API exposed by each context
5. Keep context state minimal to avoid unnecessary re-renders
6. Handle errors gracefully within context providers
7. Use TypeScript for better type safety