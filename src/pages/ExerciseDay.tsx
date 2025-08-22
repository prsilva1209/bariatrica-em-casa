
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  Target, 
  Heart,
  Trophy,
  Star,
  Flame
} from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  instructions: string;
  difficulty_level: number;
  calories_estimate: number;
  youtube_video_id?: string;
  image_url?: string;
}

interface ExerciseCompletion {
  exercise_id: string;
}

const ExerciseDay = () => {
  const { day } = useParams<{ day: string }>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completions, setCompletions] = useState<ExerciseCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const dayNumber = parseInt(day || '1');
  const nextDaySectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user && dayNumber) {
      loadDayData();
    }
  }, [user, dayNumber]);

  // Scroll to top when day changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dayNumber]);

  const loadDayData = async () => {
    try {
      // Load exercises for the day
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('day_number', dayNumber)
        .order('exercise_order');

      if (exercisesError) throw exercisesError;

      setExercises(exercisesData || []);

      // Load completed exercises
      const { data: completionsData, error: completionsError } = await supabase
        .from('exercise_completions')
        .select('exercise_id')
        .eq('user_id', user?.id)
        .eq('day_number', dayNumber);

      if (completionsError) throw completionsError;

      setCompletions(completionsData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar exercícios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isExerciseCompleted = (exerciseId: string) => {
    return completions.some(c => c.exercise_id === exerciseId);
  };

  const completedCount = exercises.filter(ex => isExerciseCompleted(ex.id)).length;
  const progress = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;
  const isDayCompleted = completedCount === exercises.length && exercises.length > 0;

  // Scroll to next day button when day is completed
  useEffect(() => {
    if (isDayCompleted) {
      setTimeout(() => {
        if (nextDaySectionRef.current) {
          nextDaySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1500); // Wait for celebration animation
    }
  }, [isDayCompleted]);

  const showMotivationalMessage = () => {
    const messages = [
      "Excelente! Você está cuidando muito bem de si mesmo! 💪",
      "Que orgulho! Mais um exercício concluído! ⭐",
      "Isso aí! Cada movimento é um passo rumo à sua melhor versão! 🌟",
      "Maravilhoso! Sua dedicação é inspiradora! ✨",
      "Perfeito! Continue assim, você está indo muito bem! 🎯"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const triggerCelebration = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const completeExercise = async (exerciseId: string) => {
    if (!user) return;
    
    setCompleting(exerciseId);
    
    try {
      // Mark exercise as complete
      const { error: completionError } = await supabase
        .from('exercise_completions')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          day_number: dayNumber,
        }, { onConflict: 'user_id,exercise_id' });

      if (completionError) throw completionError;

      // Update local state
      setCompletions(prev => [...prev, { exercise_id: exerciseId }]);

      // Check if day is completed
      const newCompletedCount = completedCount + 1;
      if (newCompletedCount === exercises.length) {
        // Update daily progress
        const { error: progressError } = await supabase
          .from('daily_progress')
          .upsert({
            user_id: user.id,
            day_number: dayNumber,
            completed_exercises: newCompletedCount,
            is_day_completed: true,
            completion_date: new Date().toISOString(),
          }, { onConflict: 'user_id,day_number' });

        if (progressError) console.error('Erro ao atualizar progresso:', progressError);

        setShowCelebration(true);
        triggerCelebration();
        
        setTimeout(() => {
          toast({
            title: "🎉 PARABÉNS! DIA COMPLETO! 🎉",
            description: "Você completou todos os exercícios do dia! Que conquista incrível!",
          });
        }, 1000);
      } else {
        // Update partial progress
        const { error: progressError } = await supabase
          .from('daily_progress')
          .upsert({
            user_id: user.id,
            day_number: dayNumber,
            completed_exercises: newCompletedCount,
            is_day_completed: false,
          }, { onConflict: 'user_id,day_number' });

        if (progressError) console.error('Erro ao atualizar progresso:', progressError);
      }

    } catch (error: any) {
      toast({
        title: "Erro ao completar exercício",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCompleting(null);
    }
  };

  const getDifficultyBadge = (level: number) => {
    switch (level) {
      case 1: return <Badge variant="secondary" className="bg-success/20 text-success">Suave</Badge>;
      case 2: return <Badge variant="secondary" className="bg-warning/20 text-warning">Moderado</Badge>;
      case 3: return <Badge variant="secondary" className="bg-destructive/20 text-destructive">Intenso</Badge>;
      default: return <Badge variant="secondary">Suave</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Carregando seus exercícios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="text-center">
              <h1 className="font-semibold">Dia {dayNumber}</h1>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{exercises.length} exercícios
              </p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Progress Card */}
        <Card className="shadow-soft border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Progresso do Dia</h2>
                <p className="text-muted-foreground">
                  {isDayCompleted 
                    ? 'Parabéns! Dia completo!' 
                    : `${completedCount} de ${exercises.length} exercícios concluídos`
                  }
                </p>
              </div>
              {isDayCompleted && (
                <div className="text-4xl animate-bounce">🏆</div>
              )}
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* No exercises available */}
        {exercises.length === 0 && (
          <Card className="shadow-soft border-0">
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum exercício disponível</h3>
              <p className="text-muted-foreground mb-6">
                Os exercícios para o Dia {dayNumber} ainda não foram cadastrados.
              </p>
              {dayNumber < 30 && (
                <Button onClick={() => navigate(`/exercises/${dayNumber + 1}`)}>
                  Ir para Dia {dayNumber + 1}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => {
            const isCompleted = isExerciseCompleted(exercise.id);
            const isCurrentlyCompleting = completing === exercise.id;
            
            return (
              <Card 
                key={exercise.id} 
                className={`shadow-soft border-0 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-success/5 border-success/20' 
                    : 'hover:shadow-medium'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted 
                            ? 'bg-success text-white' 
                            : 'bg-primary text-white'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </div>
                        <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base mb-3">
                        {exercise.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {exercise.duration_minutes} min
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Flame className="w-4 h-4" />
                          ~{exercise.calories_estimate} cal
                        </div>
                        {getDifficultyBadge(exercise.difficulty_level)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Centralized Media Display */}
                  {(exercise.youtube_video_id || exercise.image_url) && (
                    <div className="mb-6">
                      <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                          <div className="aspect-video bg-muted rounded-xl overflow-hidden shadow-soft border">
                            {exercise.youtube_video_id ? (
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${exercise.youtube_video_id}`}
                                title={exercise.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              />
                            ) : exercise.image_url ? (
                              <img
                                src={exercise.image_url}
                                alt={exercise.title}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Como fazer:
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {exercise.instructions}
                    </p>
                  </div>

                  {/* Action button */}
                  <div className="flex justify-end">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Exercício completo!</span>
                        <Star className="w-4 h-4" />
                      </div>
                    ) : (
                      <Button 
                        onClick={() => completeExercise(exercise.id)}
                        disabled={isCurrentlyCompleting}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        {isCurrentlyCompleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Completando...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Marcar como completo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Day completion celebration */}
        {showCelebration && (
          <Card className="shadow-celebration border-0 bg-gradient-celebration text-white animate-bounce">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">PARABÉNS!</h2>
              <p className="text-lg mb-4">
                Você completou todos os exercícios do Dia {dayNumber}!
              </p>
              <div className="flex justify-center gap-2 text-4xl">
                <Trophy className="w-10 h-10" />
                <Heart className="w-10 h-10" />
                <Star className="w-10 h-10" />
              </div>
              <p className="mt-4 text-white/90">
                Sua dedicação está transformando sua vida! Continue assim! ✨
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next day button */}
        {(isDayCompleted || exercises.length === 0) && dayNumber < 30 && (
          <div ref={nextDaySectionRef} className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate(`/exercises/${dayNumber + 1}`)}
              className="bg-gradient-primary"
            >
              Próximo dia (Dia {dayNumber + 1})
            </Button>
          </div>
        )}

        {/* Back to dashboard */}
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDay;
