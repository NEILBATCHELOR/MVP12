# Authentication Components

This directory contains components related to authentication and user management.

## Components

- **AdminMFASettings.tsx**: Component for managing Multi-Factor Authentication settings at the admin level.
- **ProtectedRoute.tsx**: Route wrapper that ensures users are authenticated before accessing protected content.

## Authentication Context

The authentication context has been moved to `@/contexts/AuthProvider.tsx`. This provider:
- Manages authentication state and functions throughout the application
- Integrates with Supabase for authentication
- Wraps the PermissionsProvider for role-based access control
- Provides user session management

### Usage

```typescript
import { useAuth } from '@/contexts/AuthProvider';

const MyComponent = () => {
  const { user, signIn, signOut, loading } = useAuth();
  // ... component logic
};
```

## Features

- User authentication (login/logout)
- Session management
- Protected routes
- MFA configuration
- Role-based access control (via PermissionsProvider)

## Security Notes

- All authentication state is managed through Supabase
- User roles and permissions are handled by the PermissionsProvider
- MFA settings are stored securely in the database

## Overview
The Auth components handle user authentication, authorization, multi-factor authentication (MFA), and security-related functionality. These components form the security foundation of the application.

### Core Authentication Components
- **AuthProvider.tsx**: React context provider for authentication state and functions throughout the application.
- **LoginModal.tsx**: Modal dialog for user login with validation and error handling.
- **LoginButton.tsx**: Button component that triggers the login process.
- **SignUpForm.tsx**: Form for new user registration with validation.
- **ResetPasswordForm.tsx**: Form for password reset functionality.
- **UnauthorizedPage.tsx**: Page displayed when a user attempts to access content without proper authorization.

### Multi-Factor Authentication (MFA) Components
- **MFASetup.tsx**: Component for setting up multi-factor authentication.
- **MFAToggle.tsx**: Toggle switch for enabling/disabling MFA.
- **MFAVerification.tsx**: Component for verifying MFA codes during login.

## Usage
These components are used throughout the application to handle user authentication flows, protect routes, and manage security settings. The AuthProvider wraps the application to provide authentication context to all components.

## Dependencies
- React
- React Router for protected routes
- UI component library
- Authentication services/APIs