-- Fix passenger registration issues
-- This script addresses the "Database error saving new user" issue

-- First, let's make sure the passengers table exists and has the right structure
CREATE TABLE IF NOT EXISTS public.passengers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    email TEXT,
    emergency_contact TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update constraints to be more flexible
ALTER TABLE public.passengers DROP CONSTRAINT IF EXISTS passengers_phone_check;
ALTER TABLE public.passengers 
ADD CONSTRAINT passengers_phone_check 
CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]+$');

ALTER TABLE public.passengers DROP CONSTRAINT IF EXISTS passengers_email_check;
ALTER TABLE public.passengers 
ADD CONSTRAINT passengers_email_check 
CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Enable Row Level Security (RLS)
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view own passenger profile" ON public.passengers;
DROP POLICY IF EXISTS "Users can insert own passenger profile" ON public.passengers;
DROP POLICY IF EXISTS "Users can update own passenger profile" ON public.passengers;

-- Create RLS policies
CREATE POLICY "Users can view own passenger profile" ON public.passengers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own passenger profile" ON public.passengers
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own passenger profile" ON public.passengers
    FOR UPDATE USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS on_passengers_updated ON public.passengers;
CREATE TRIGGER on_passengers_updated
    BEFORE UPDATE ON public.passengers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Updated function to create passenger profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_passenger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create passenger profile if userType is 'passenger' or not specified
    IF NEW.raw_user_meta_data->>'userType' IS NULL OR NEW.raw_user_meta_data->>'userType' = 'passenger' THEN
        INSERT INTO public.passengers (id, email, full_name, phone)
        VALUES (
            NEW.id, 
            NEW.email, 
            COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'phoneNumber', NEW.raw_user_meta_data->>'phone', NULL)
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and continue (don't fail the user creation)
        RAISE LOG 'Error creating passenger profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_passenger ON auth.users;
CREATE TRIGGER on_auth_user_created_passenger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_passenger();

-- Grant necessary permissions
GRANT ALL ON public.passengers TO authenticated;
GRANT ALL ON public.passengers TO service_role;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_passengers_phone ON public.passengers(phone);
CREATE INDEX IF NOT EXISTS idx_passengers_email ON public.passengers(email);
CREATE INDEX IF NOT EXISTS idx_passengers_created_at ON public.passengers(created_at);