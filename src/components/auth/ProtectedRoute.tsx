import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { sessionManager } from '@/lib/sessionManager';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { normalizeRoleName, getRoleDisplayName } from '@/utils/roleNormalizer';

// Completely disabled ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        // First check if we have a valid session
        const isValidSession = await sessionManager.validateSession();
        if (!isValidSession) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Then check if user exists
        if (!user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Handle admin bypass case
        if (user.id === 'admin-bypass') {
          // Admin bypass has access to all routes
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If roles are specified, check user's roles
        if (allowedRoles && allowedRoles.length > 0) {
          const { data: roleData, error } = await supabase
            .from('user_roles')
            .select(`
              roles (
                name
              )
            `)
            .eq('user_id', user.id);

          if (error) {
            console.error('Error fetching user roles:', error);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          // Extract role names from the response
          const userRoles = roleData?.map(rd => rd.roles?.name || '') || [];
          
          // Store both display names and normalized names for logging
          const userRoleInfo = userRoles.map(role => ({
            original: role,
            display: getRoleDisplayName(role),
            normalized: normalizeRoleName(role)
          }));
          
          const allowedRoleInfo = allowedRoles.map(role => ({
            original: role,
            display: getRoleDisplayName(role),
            normalized: normalizeRoleName(role)
          }));
          
          // Check if user has any of the allowed roles
          // Note: any variant of super admin always has access
          const hasAccess = userRoleInfo.some(userRole => 
            // Check for any variant of super admin
            userRole.normalized === 'superadmin' ||
            // Or check against normalized allowed roles
            allowedRoleInfo.some(allowedRole => userRole.normalized === allowedRole.normalized)
          );

          if (!hasAccess) {
            console.log(
              'Access denied:\n' +
              `User roles (${userRoleInfo.length}):\n` +
              userRoleInfo.map(r => `  - ${r.display} (normalized: ${r.normalized})`).join('\n') +
              '\n\nAllowed roles:\n' +
              allowedRoleInfo.map(r => `  - ${r.display} (normalized: ${r.normalized})`).join('\n')
            );
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          if (!hasAccess) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, [user, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Store the attempted URL for redirection after login
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
