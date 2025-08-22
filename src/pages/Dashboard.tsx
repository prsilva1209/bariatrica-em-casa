import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { performCompleteSignOut } from '@/lib/auth-cleanup';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { 
  Heart, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  LogOut,
  Play,
  CheckCircle,
  Settings
} from 'lucide-react';
import CaloriesBurnedCard from '@/components/CaloriesBurnedCard';
import DifficultySelector from '@/components/DifficultySelector';

interface Profile {
  id: string;
  name: string;
  current_bmi: number;
  goal_type: string;
  program_start_date: string;
}

interface DailyProgress {
  day_number: number;
  completed_exercises: number;
  is_day_completed: boolean;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin using the has_role function
  const { data: isAdmin } = useQuery({
    queryKey: ['adminRole', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Perfil não encontrado, redirecionar para onboarding
          navigate('/onboarding');
          return;
        }
        throw profileError;
      }

      setProfile(profileData);

      // Carregar progresso
      const { data: progressData, error: progressError } = await supabase
        .from('daily_progress')
        .select('day_number, completed_exercises, is_day_completed')
        .eq('user_id', user?.id)
        .order('day_number');

      if (progressError) throw progressError;

      setProgress(progressData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await performCompleteSignOut();
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'lose_weight': return 'Perder Peso';
      case 'maintain_weight': return 'Manter Peso';
      case 'bariatric_prep': return 'Bariátrica em Casa';
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

  const completedDays = progress.filter(p => p.is_day_completed).length;
  const totalProgress = (completedDays / 30) * 100;
  const currentDay = Math.min(completedDays + 1, 30);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const bmiStatus = getBMIStatus(profile.current_bmi);
  const daysSinceStart = Math.floor((Date.now() - new Date(profile.program_start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Olá, {profile.name}!</h1>
              <p className="text-sm text-muted-foreground">Seu Caminho Magro</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso Geral</p>
                  <p className="text-2xl font-semibold">{completedDays}/30</p>
                  <p className="text-sm text-muted-foreground">dias completos</p>
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">IMC Atual</p>
                  <p className="text-2xl font-semibold">{profile.current_bmi}</p>
                  <Badge variant="secondary" className={`text-xs ${bmiStatus.color} text-white`}>
                    {bmiStatus.status}
                  </Badge>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Objetivo</p>
                  <p className="text-lg font-medium">{getGoalLabel(profile.goal_type)}</p>
                  <p className="text-sm text-muted-foreground">Dia {currentDay}</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <CaloriesBurnedCard userId={user?.id} />
        </div>

        {/* Progresso Visual */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Seu Progresso nos 30 Dias
            </CardTitle>
            <CardDescription>
              Você completou {completedDays} de 30 dias do programa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={totalProgress} className="h-3" />
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const dayProgress = progress.find(p => p.day_number === day);
                  const isCompleted = dayProgress?.is_day_completed || false;
                  const isCurrent = day === currentDay;
                  
                  return (
                    <div
                      key={day}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                        ${isCompleted 
                          ? 'bg-success text-white shadow-soft' 
                          : isCurrent 
                          ? 'bg-primary text-white animate-pulse' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : day}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ação do Dia */}
        <Card className="shadow-soft border-0 bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Exercícios do Dia {currentDay}</h3>
                <p className="text-white/90 mb-4">
                  {currentDay > 30 
                    ? 'Parabéns! Você completou todo o programa!' 
                    : 'Está na hora do seu treino diário. Vamos com calma e carinho!'
                  }
                </p>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">~50 minutos de exercícios</span>
                </div>
              </div>
              <div className="text-center">
                {currentDay <= 30 ? (
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate(`/exercises/${currentDay}`)}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Começar
                  </Button>
                ) : (
                  <div className="text-4xl">🎉</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Dificuldade */}
        <DifficultySelector />

        {/* Mensagem Motivacional */}
        <Card className="shadow-soft border-0 bg-gradient-soft">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">
              {completedDays === 0 
                ? 'Seja bem-vindo à sua jornada!' 
                : completedDays < 10 
                ? 'Você está indo muito bem!' 
                : completedDays < 20 
                ? 'Mais da metade do caminho já foi percorrida!' 
                : completedDays < 30 
                ? 'Você está quase lá! Continue assim!' 
                : 'Parabéns! Você completou toda a jornada!'
              }
            </h3>
            <p className="text-muted-foreground text-sm">
              {completedDays === 0 
                ? 'Lembre-se: cada passo é importante. Vamos com calma e cuidado.' 
                : completedDays < 30 
                ? 'Sua dedicação está transformando sua vida. Continue cuidando de você com carinho.' 
                : 'Você provou que é capaz de cuidar da sua saúde. Continue mantendo esses hábitos!'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
