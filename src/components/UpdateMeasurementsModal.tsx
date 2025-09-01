import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateMeasurementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
  currentHeight: number;
}

export const UpdateMeasurementsModal: React.FC<UpdateMeasurementsModalProps> = ({
  isOpen,
  onClose,
  currentWeight,
  currentHeight,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newWeight, setNewWeight] = useState(currentWeight.toString());
  const [loading, setLoading] = useState(false);

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const handleUpdate = async () => {
    if (!user) return;

    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um peso válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const newBMI = calculateBMI(weightValue, currentHeight);

      const { error } = await supabase
        .from('profiles')
        .update({
          weight: weightValue,
          current_bmi: newBMI,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Medidas atualizadas!",
        description: `Novo peso: ${weightValue}kg | Novo IMC: ${newBMI.toFixed(1)}`,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao atualizar medidas:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar suas medidas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const newBMI = calculateBMI(parseFloat(newWeight) || currentWeight, currentHeight);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar suas medidas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Parabéns por completar 30 dias de exercícios! 🎉
            <br />
            Que tal atualizar suas medidas para acompanhar seu progresso?
          </p>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso atual (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Ex: 70.5"
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Novo IMC:</strong> {newBMI.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Altura: {currentHeight}cm | Peso anterior: {currentWeight}kg
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Agora não
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar medidas"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};