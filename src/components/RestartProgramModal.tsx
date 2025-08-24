import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { RefreshCcw, Target, Zap } from 'lucide-react';

type GoalType = 'maintain_weight' | 'lose_weight' | 'bariatric_prep';
type DifficultyLevel = 'leve' | 'medio' | 'pesado';

interface RestartProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentGoal: string;
  currentDifficulty: string;
}

const RestartProgramModal: React.FC<RestartProgramModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  currentGoal,
  currentDifficulty
}) => {
  const [goal, setGoal] = useState<GoalType>(currentGoal as GoalType);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(currentDifficulty as DifficultyLevel);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const getGoalLabel = (goalType: string) => {
    switch (goalType) {
      case 'lose_weight': return 'Perder Peso';
      case 'maintain_weight': return 'Manter Peso';
      case 'bariatric_prep': return 'Bariátrica em Casa';
      default: return 'Objetivo';
    }
  };

  const getDifficultyLabel = (diffLevel: string) => {
    switch (diffLevel) {
      case 'leve': return 'Leve';
      case 'medio': return 'Médio';
      case 'pesado': return 'Pesado';
      default: return 'Médio';
    }
  };

  const handleRestart = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update profile with new goal, difficulty and reset program start date
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          goal_type: goal,
          preferred_difficulty: difficulty,
          program_start_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Archive current progress by updating all records to mark them as archived
      const { error: progressError } = await supabase
        .from('daily_progress')
        .delete()
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Delete exercise completions to start fresh
      const { error: completionsError } = await supabase
        .from('exercise_completions')
        .delete()
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      toast({
        title: "Programa reiniciado com sucesso!",
        description: `Novo objetivo: ${getGoalLabel(goal)} | Dificuldade: ${getDifficultyLabel(difficulty)}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao reiniciar programa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-primary" />
            Recomeçar Programa
          </DialogTitle>
          <DialogDescription>
            Parabéns por completar os 30 dias! Gostaria de recomeçar com novas configurações?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Goal Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Novo Objetivo
            </Label>
            <RadioGroup 
              value={goal} 
              onValueChange={(value: GoalType) => setGoal(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="lose_weight" id="lose_weight" />
                <Label htmlFor="lose_weight" className="flex-1 cursor-pointer text-sm">
                  Perder peso gradualmente
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="maintain_weight" id="maintain_weight" />
                <Label htmlFor="maintain_weight" className="flex-1 cursor-pointer text-sm">
                  Manter peso e melhorar saúde
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="bariatric_prep" id="bariatric_prep" />
                <Label htmlFor="bariatric_prep" className="flex-1 cursor-pointer text-sm">
                  Preparação bariátrica
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Nova Dificuldade
            </Label>
            <Select value={difficulty} onValueChange={(value: DifficultyLevel) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leve">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Leve - Iniciante
                  </div>
                </SelectItem>
                <SelectItem value="medio">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    Médio - Intermediário
                  </div>
                </SelectItem>
                <SelectItem value="pesado">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Pesado - Avançado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRestart}
              className="flex-1 bg-gradient-primary"
              disabled={loading}
            >
              {loading ? 'Reiniciando...' : 'Recomeçar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestartProgramModal;