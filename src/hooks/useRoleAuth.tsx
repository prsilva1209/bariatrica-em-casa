import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'instrutor' | 'user';

export const useRoleAuth = () => {
  const { user } = useAuth();

  const { data: userRole, isLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async (): Promise<UserRole | null> => {
      if (!user) return null;
      
      // Verificar se é admin
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (isAdmin) return 'admin';
      
      // Verificar se é instrutor
      const { data: isInstructor } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'instrutor'
      });
      
      if (isInstructor) return 'instrutor';
      
      return 'user';
    },
    enabled: !!user,
  });

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  };

  const canManageUsers = (): boolean => hasRole('admin');
  const canManageExercises = (): boolean => hasRole(['admin', 'instrutor']);
  const canManagePlans = (): boolean => hasRole(['admin', 'instrutor']);
  const canViewAuditLogs = (): boolean => hasRole('admin');

  return {
    userRole,
    isLoading,
    hasRole,
    canManageUsers,
    canManageExercises,
    canManagePlans,
    canViewAuditLogs,
  };
};