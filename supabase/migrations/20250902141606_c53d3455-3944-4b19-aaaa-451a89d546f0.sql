-- Ensure legacy unique index/constraint is gone and add the correct ones
begin;

-- 1) Drop legacy unique index if it exists (some setups used an index instead of a constraint)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uq_exercises_day_order'
  ) THEN
    EXECUTE 'DROP INDEX public.uq_exercises_day_order';
  END IF;
END $$;

-- 2) Drop legacy unique constraint if it exists
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS uq_exercises_day_order;

-- 3) Create new unique constraint over day_number, exercise_order, difficulty_level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_exercises_day_order_difficulty'
      AND conrelid = 'public.exercises'::regclass
  ) THEN
    ALTER TABLE public.exercises
      ADD CONSTRAINT uq_exercises_day_order_difficulty
      UNIQUE (day_number, exercise_order, difficulty_level);
  END IF;
END $$;

-- 4) Ensure exercise_order range check (1..5)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'check_exercise_order_range'
      AND conrelid = 'public.exercises'::regclass
  ) THEN
    ALTER TABLE public.exercises
      ADD CONSTRAINT check_exercise_order_range
      CHECK (exercise_order >= 1 AND exercise_order <= 5);
  END IF;
END $$;

commit;