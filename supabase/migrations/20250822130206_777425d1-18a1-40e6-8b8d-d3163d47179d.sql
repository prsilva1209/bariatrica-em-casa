-- Phase 1: Implement Role-Based Access Control and Fix Database Schema

-- 1. Create role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 4. Add missing image_url column to exercises table
ALTER TABLE public.exercises 
ADD COLUMN image_url TEXT;

-- 5. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Fix the broken admin policy on exercises table
DROP POLICY IF EXISTS "Admins can manage exercises" ON public.exercises;

CREATE POLICY "Admins can manage exercises" 
ON public.exercises 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Add missing DELETE policies for other tables
CREATE POLICY "Users can delete their own progress" 
ON public.daily_progress 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions" 
ON public.exercise_completions 
FOR DELETE 
USING (auth.uid() = user_id);

-- 8. Add trigger for updating updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Add validation constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_age CHECK (age >= 13 AND age <= 120),
ADD CONSTRAINT valid_height CHECK (height >= 100 AND height <= 250),
ADD CONSTRAINT valid_weight CHECK (weight >= 30 AND weight <= 300),
ADD CONSTRAINT valid_bmi CHECK (current_bmi >= 10 AND current_bmi <= 50);

ALTER TABLE public.exercises 
ADD CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 180),
ADD CONSTRAINT valid_difficulty CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
ADD CONSTRAINT valid_calories CHECK (calories_estimate >= 0 AND calories_estimate <= 1000),
ADD CONSTRAINT valid_day_number CHECK (day_number >= 1 AND day_number <= 30);

-- 10. Add URL validation for image_url and youtube_video_id
ALTER TABLE public.exercises 
ADD CONSTRAINT valid_youtube_id CHECK (
    youtube_video_id IS NULL OR 
    length(youtube_video_id) = 11 AND 
    youtube_video_id ~ '^[a-zA-Z0-9_-]+$'
),
ADD CONSTRAINT valid_image_url CHECK (
    image_url IS NULL OR 
    (image_url LIKE 'https://%' AND length(image_url) <= 500)
);