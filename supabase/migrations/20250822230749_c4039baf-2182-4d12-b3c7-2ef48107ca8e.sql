-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('leve', 'medio', 'pesado');

-- Add preferred_difficulty column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_difficulty difficulty_level DEFAULT 'medio';

-- Add new difficulty column to exercises table
ALTER TABLE public.exercises 
ADD COLUMN new_difficulty_level difficulty_level DEFAULT 'medio';

-- Update the new column based on existing integer values
UPDATE public.exercises 
SET new_difficulty_level = CASE 
    WHEN difficulty_level = 1 THEN 'leve'::difficulty_level
    WHEN difficulty_level = 2 THEN 'medio'::difficulty_level
    WHEN difficulty_level = 3 THEN 'pesado'::difficulty_level
    ELSE 'medio'::difficulty_level
END;

-- Drop the old integer column and rename the new one
ALTER TABLE public.exercises DROP COLUMN difficulty_level;
ALTER TABLE public.exercises RENAME COLUMN new_difficulty_level TO difficulty_level;

-- Make the column not null
ALTER TABLE public.exercises ALTER COLUMN difficulty_level SET NOT NULL;