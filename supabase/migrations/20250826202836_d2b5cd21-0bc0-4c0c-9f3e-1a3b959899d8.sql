-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Create a unique index on email for better performance
CREATE UNIQUE INDEX profiles_email_idx ON public.profiles(email);

-- Update existing profiles with email from auth.users
-- This is a one-time operation to sync existing data
UPDATE public.profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.user_id = auth.users.id;

-- Make email NOT NULL after updating existing records
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL;

-- Create or replace trigger function to automatically set email when creating profile
CREATE OR REPLACE FUNCTION public.set_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users when inserting new profile
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-set email on profile creation
DROP TRIGGER IF EXISTS on_profile_created_set_email ON public.profiles;
CREATE TRIGGER on_profile_created_set_email
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_email();