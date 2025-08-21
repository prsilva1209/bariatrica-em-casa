import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Shield, ShieldCheck, Users, Trophy, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  current_bmi: number;
  goal_type: string;
  program_start_date: string;
  user_id: string;
  age: number;
  weight: number;
  height: number;
  completed_days?: number;
  total_exercises?: number;
  is_admin?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load user profiles with progress data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Load progress for each user
      const usersWithProgress = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // Get completed days count
          const { data: progressData } = await supabase
            .from('daily_progress')
            .select('day_number, is_day_completed')
            .eq('user_id', profile.user_id);

          const completedDays = progressData?.filter(p => p.is_day_completed).length || 0;

          // Get total exercise completions
          const { data: exerciseData } = await supabase
            .from('exercise_completions')
            .select('id')
            .eq('user_id', profile.user_id);

          const totalExercises = exerciseData?.length || 0;

          // Check if user is admin using the has_role function
          const { data: isAdminData, error: roleError } = await supabase.rpc('has_role', {
            _user_id: profile.user_id,
            _role: 'admin'
          });

          if (roleError) {
            console.error('Error checking admin role:', roleError);
          }

          return {
            ...profile,
            completed_days: completedDays,
            total_exercises: totalExercises,
            is_admin: !!isAdminData,
          };
        })
      );

      setUsers(usersWithProgress);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role using raw SQL
        const { error } = await supabase.rpc('sql', {
          query: `DELETE FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
          params: [userId]
        });

        if (error) {
          // Fallback: try using a direct query approach
          const { error: deleteError } = await supabase
            .from('profiles') // Use profiles table as a workaround
            .update({ id: profile.id }) // Dummy update to trigger auth
            .eq('user_id', userId)
            .then(async () => {
              // Execute raw SQL through a function call
              return await supabase.rpc('execute_sql', {
                sql: `DELETE FROM user_roles WHERE user_id = '${userId}' AND role = 'admin'`
              });
            });
          
          if (deleteError) throw deleteError;
        }
      } else {
        // Add admin role using raw SQL
        const { error } = await supabase.rpc('sql', {
          query: `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`,
          params: [userId]
        });

        if (error) {
          // Fallback: try using a direct query approach
          const { error: insertError } = await supabase
            .from('profiles') // Use profiles table as a workaround
            .update({ id: profile.id }) // Dummy update to trigger auth
            .eq('user_id', userId)
            .then(async () => {
              // Execute raw SQL through a function call
              return await supabase.rpc('execute_sql', {
                sql: `INSERT INTO user_roles (user_id, role) VALUES ('${userId}', 'admin')`
              });
            });
          
          if (insertError) throw insertError;
        }
      }

      toast({
        title: isCurrentlyAdmin ? "Admin removido" : "Admin adicionado",
        description: `Permissões de administrador ${isCurrentlyAdmin ? 'removidas' : 'concedidas'} com sucesso.`,
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar permissões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'lose_weight': return 'Perder Peso';
      case 'maintain_weight': return 'Manter Peso';
      case 'bariatric_prep': return 'Preparação Bariátrica';
      default: return 'Objetivo';
    }
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 25) return { status: 'Peso Normal', color: 'bg-success' };
    if (bmi < 30) return { status: 'Sobrepeso', color: 'bg-warning' };
    if (bmi < 35) return { status: 'Obesidade I', color: 'bg-destructive' };
    if (bmi < 40) return { status: 'Obesidade II', color: 'bg-destructive' };
    return { status: 'Obesidade III', color: 'bg-destructive' };
  };

  const daysSinceStart = (startDate: string) => {
    return Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Usuários
          </CardTitle>
          <CardDescription>
            {users.length} usuário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadUsers} disabled={loading}>
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Carregando usuários...</p>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const bmiStatus = getBMIStatus(user.current_bmi);
            const daysInProgram = daysSinceStart(user.program_start_date);
            
            return (
              <Card key={user.id} className="border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        {user.is_admin && (
                          <Badge className="bg-primary text-white">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Informações Básicas</p>
                          <p className="text-sm">
                            {user.age} anos • {user.weight}kg • {user.height}cm
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">IMC</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.current_bmi}</span>
                            <Badge variant="secondary" className={`text-xs ${bmiStatus.color} text-white`}>
                              {bmiStatus.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Objetivo</p>
                          <p className="text-sm font-medium">{getGoalLabel(user.goal_type)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Iniciado em</p>
                          <p className="text-sm">
                            {new Date(user.program_start_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Dias no programa</p>
                            <p className="font-semibold">{daysInProgram}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Trophy className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Dias completos</p>
                            <p className="font-semibold">{user.completed_days}/30</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Users className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Total de exercícios</p>
                            <p className="font-semibold">{user.total_exercises}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <Button
                        variant={user.is_admin ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleAdminRole(user.user_id, user.is_admin || false)}
                      >
                        {user.is_admin ? (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Remover Admin
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Tornar Admin
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserManagement;
