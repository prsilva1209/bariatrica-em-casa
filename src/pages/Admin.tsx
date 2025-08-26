
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Dumbbell, Settings, BarChart3, FileText } from 'lucide-react';
import ExerciseManagement from '@/components/admin/ExerciseManagement';
import UserManagement from '@/components/admin/UserManagement';
import PlanManagement from '@/components/admin/PlanManagement';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AuditLogs from '@/components/admin/AuditLogs';
import { RoleGuard } from '@/components/RoleGuard';

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Administração</h1>
              <p className="text-sm text-muted-foreground">
                Gerenciar exercícios e usuários
              </p>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            
            <RoleGuard allowedRoles="admin">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </TabsTrigger>
            </RoleGuard>
            
            <RoleGuard allowedRoles={['admin', 'instrutor']}>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Planos
              </TabsTrigger>
            </RoleGuard>
            
            <RoleGuard allowedRoles={['admin', 'instrutor']}>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Exercícios
              </TabsTrigger>
            </RoleGuard>
            
            <RoleGuard allowedRoles="admin">
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Auditoria
              </TabsTrigger>
            </RoleGuard>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <RoleGuard allowedRoles="admin">
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </RoleGuard>

          <RoleGuard allowedRoles={['admin', 'instrutor']}>
            <TabsContent value="plans">
              <PlanManagement />
            </TabsContent>
          </RoleGuard>

          <RoleGuard allowedRoles={['admin', 'instrutor']}>
            <TabsContent value="exercises">
              <ExerciseManagement />
            </TabsContent>
          </RoleGuard>

          <RoleGuard allowedRoles="admin">
            <TabsContent value="logs">
              <AuditLogs />
            </TabsContent>
          </RoleGuard>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
