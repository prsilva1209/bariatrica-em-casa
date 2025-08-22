import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Settings, Check } from 'lucide-react';

interface DifficultyInfo {
  level: 'leve' | 'medio' | 'pesado';
  label: string;
  description: string;
  color: string;
}

const difficultyOptions: DifficultyInfo[] = [
  {
    level: 'leve',
    label: 'Leve',
    description: 'Exercícios suaves, ideais para iniciantes ou recuperação',
    color: 'text-success'
  },
  {
    level: 'medio',
    label: 'Médio',
    description: 'Exercícios moderados, equilibrio entre desafio e segurança',
    color: 'text-warning'
  },
  {
    level: 'pesado',
    label: 'Pesado',
    description: 'Exercícios intensos, para quem já tem condicionamento',
    color: 'text-destructive'
  }
];

interface DifficultySelectorProps {
  showTitle?: boolean;
  compact?: boolean;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  showTitle = true, 
  compact = false 
}) => {
  const [currentDifficulty, setCurrentDifficulty] = useState<'leve' | 'medio' | 'pesado'>('medio');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentDifficulty();
  }, [user]);

  const loadCurrentDifficulty = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_difficulty')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setCurrentDifficulty(data?.preferred_difficulty || 'medio');
    } catch (error: any) {
      console.error('Error loading difficulty:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDifficulty = async (newDifficulty: 'leve' | 'medio' | 'pesado') => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_difficulty: newDifficulty })
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentDifficulty(newDifficulty);
      toast({
        title: "Dificuldade atualizada!",
        description: `Seus exercícios agora serão de nível ${difficultyOptions.find(d => d.level === newDifficulty)?.label.toLowerCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar dificuldade",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-muted rounded-lg" />;
  }

  const currentDifficultyInfo = difficultyOptions.find(d => d.level === currentDifficulty);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Dificuldade:</Label>
        <Select 
          value={currentDifficulty} 
          onValueChange={(value: 'leve' | 'medio' | 'pesado') => updateDifficulty(value)}
          disabled={saving}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {difficultyOptions.map((option) => (
              <SelectItem key={option.level} value={option.level}>
                <span className={option.color}>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {saving && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
      </div>
    );
  }

  return (
    <Card className="shadow-soft border-0">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Nível de Dificuldade
          </CardTitle>
          <CardDescription>
            Personalize a intensidade dos seus exercícios
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {difficultyOptions.map((option) => {
            const isSelected = currentDifficulty === option.level;
            
            return (
              <div
                key={option.level}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/30'
                  }
                `}
                onClick={() => updateDifficulty(option.level)}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className={`font-medium ${option.color} mb-1`}>
                    {option.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {currentDifficultyInfo && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Atualmente:</span>{' '}
              <span className={currentDifficultyInfo.color}>
                {currentDifficultyInfo.label}
              </span>
              {' - '}{currentDifficultyInfo.description}
            </p>
          </div>
        )}

        {saving && (
          <div className="flex items-center justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Salvando...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DifficultySelector;