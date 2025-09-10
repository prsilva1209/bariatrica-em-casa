-- Drop the old unique constraint that's causing conflicts
ALTER TABLE public.exercises 
DROP CONSTRAINT IF EXISTS uq_exercises_day_order_difficulty;

-- Add new unique constraint that includes target_audience
ALTER TABLE public.exercises 
ADD CONSTRAINT uq_exercises_day_order_difficulty_audience 
UNIQUE (day_number, exercise_order, difficulty_level, target_audience);

-- Add check constraint to ensure exercise_order is between 1 and 5
ALTER TABLE public.exercises 
ADD CONSTRAINT ck_exercises_order_range 
CHECK (exercise_order >= 1 AND exercise_order <= 5);

-- Add index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_exercises_day_goal_diff_order 
ON public.exercises (day_number, target_audience, difficulty_level, exercise_order);