-- Drop the existing unique constraint that prevents multiple exercises per day
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS uq_exercises_day_order;

-- Add new unique constraint that allows same day/order but different difficulty levels
ALTER TABLE public.exercises ADD CONSTRAINT uq_exercises_day_order_difficulty 
  UNIQUE (day_number, exercise_order, difficulty_level);

-- Add a comment to document the constraint purpose
COMMENT ON CONSTRAINT uq_exercises_day_order_difficulty ON public.exercises IS 
  'Ensures unique combination of day, order, and difficulty - allows up to 15 exercises per day (5 per difficulty level)';

-- Optional: Add a check constraint to ensure exercise_order is between 1-5
ALTER TABLE public.exercises ADD CONSTRAINT check_exercise_order_range 
  CHECK (exercise_order >= 1 AND exercise_order <= 5);