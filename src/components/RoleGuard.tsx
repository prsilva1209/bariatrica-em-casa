import React from 'react';
import { useRoleAuth, UserRole } from '@/hooks/useRoleAuth';

interface RoleGuardProps {
  allowedRoles: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { hasRole, isLoading } = useRoleAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
      </div>
    );
  }

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};