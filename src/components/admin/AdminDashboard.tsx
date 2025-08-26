import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Dumbbell, Calendar, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalPlans: number;
  totalExercises: number;
  totalCompletions: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPlans: 0,
    totalExercises: 0,
    totalCompletions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Carregar estatísticas em paralelo
        const [usersResult, plansResult, exercisesResult, completionsResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('workout_plans').select('id', { count: 'exact', head: true }),
          supabase.from('exercises').select('id', { count: 'exact', head: true }),
          supabase.from('exercise_completions').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalPlans: plansResult.count || 0,
          totalExercises: exercisesResult.count || 0,
          totalCompletions: completionsResult.count || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      description: 'Usuários registrados na plataforma',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Planos de Treino',
      value: stats.totalPlans,
      description: 'Planos criados pelos instrutores',
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Exercícios',
      value: stats.totalExercises,
      description: 'Exercícios disponíveis no sistema',
      icon: Dumbbell,
      color: 'text-orange-600',
    },
    {
      title: 'Exercícios Completados',
      value: stats.totalCompletions,
      description: 'Total de exercícios realizados pelos usuários',
      icon: Activity,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded animate-pulse w-16" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Administrativo</h2>
        <p className="text-muted-foreground">
          Visão geral das atividades da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Plataforma</CardTitle>
          <CardDescription>
            Informações gerais sobre o uso do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Taxa de Engajamento</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalUsers > 0 
                  ? Math.round((stats.totalCompletions / stats.totalUsers) * 100) / 100
                  : 0} exercícios por usuário
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Exercícios por Plano</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalPlans > 0 
                  ? Math.round(stats.totalExercises / stats.totalPlans)
                  : 0} exercícios/plano
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;