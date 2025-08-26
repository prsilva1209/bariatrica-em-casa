
import React from 'react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  const { data: hasAccess, isLoading: checkingAccess } = useQuery({
    queryKey: ['adminAccess', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      // Check if user has admin or instructor role
      const [adminResult, instructorResult] = await Promise.all([
        supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: user.id, _role: 'instrutor' })
      ]);

      if (adminResult.error || instructorResult.error) {
        console.error('Error checking roles:', adminResult.error || instructorResult.error);
        return false;
      }

      return !!(adminResult.data || instructorResult.data);
    },
    enabled: !!user,
  });

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
