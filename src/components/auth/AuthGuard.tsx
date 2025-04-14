import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { sessionManager } from '@/lib/sessionManager';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a valid session
        const isValidSession = await sessionManager.validateSession();
        if (!isValidSession) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Then check if user is still authenticated with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await sessionManager.endSession();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // If role is required, check user's role
        if (requiredRole) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select(`
              roles (
                name
              )
            `)
            .eq('user_id', session.user.id)
            .single();

          const userRole = roleData?.roles?.name?.toLowerCase();
          
          if (requiredRole === 'super_admin' && userRole !== 'super admin') {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          if (requiredRole === 'admin' && userRole !== 'admin' && userRole !== 'super admin') {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 