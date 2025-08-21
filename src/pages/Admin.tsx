
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Dumbbell, Settings } from 'lucide-react';
import ExerciseManagement from '@/components/admin/ExerciseManagement';
import UserManagement from '@/components/admin/UserManagement';

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
        <Tabs defaultValue="exercises" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Exercícios
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exercises">
            <ExerciseManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
