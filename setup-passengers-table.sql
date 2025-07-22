-- Create passengers table for passenger profiles
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

-- Add constraints
ALTER TABLE public.passengers 
ADD CONSTRAINT passengers_phone_check 
CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE public.passengers 
ADD CONSTRAINT passengers_email_check 
CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_passengers_phone ON public.passengers(phone);
CREATE INDEX IF NOT EXISTS idx_passengers_email ON public.passengers(email);
CREATE INDEX IF NOT EXISTS idx_passengers_created_at ON public.passengers(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view and edit their own profile
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

-- Function to create passenger profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_passenger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.passengers (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic passenger profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_passenger ON auth.users;
CREATE TRIGGER on_auth_user_created_passenger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_passenger();

-- Grant necessary permissions
GRANT ALL ON public.passengers TO authenticated;
GRANT ALL ON public.passengers TO service_role;