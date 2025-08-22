import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flame } from 'lucide-react';

interface CaloriesBurnedCardProps {
  userId?: string;
}

const CaloriesBurnedCard = ({ userId }: CaloriesBurnedCardProps) => {
  const { data: totalCalories = 0 } = useQuery({
    queryKey: ['totalCaloriesBurned', userId],
    queryFn: async () => {
      if (!userId) return 0;

      // Get completed days
      const { data: completedDays, error: progressError } = await supabase
        .from('daily_progress')
        .select('day_number')
        .eq('user_id', userId)
        .eq('is_day_completed', true);

      if (progressError || !completedDays?.length) return 0;

      const dayNumbers = completedDays.map(d => d.day_number);

      // Get total calories from exercises in completed days
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('calories_estimate')
        .in('day_number', dayNumbers);

      if (exercisesError || !exercises?.length) return 0;

      return exercises.reduce((sum, exercise) => sum + (exercise.calories_estimate || 0), 0);
    },
    enabled: !!userId,
  });

  return (
    <Card className="shadow-soft border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Calorias Queimadas</p>
            <p className="text-2xl font-semibold">{totalCalories.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">total acumulado</p>
          </div>
          <Flame className="w-8 h-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CaloriesBurnedCard;