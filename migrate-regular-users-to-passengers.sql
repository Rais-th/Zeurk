-- Migration script: Replace regular_users with passengers table
-- This script safely migrates data and updates foreign key references

-- Step 1: Create passengers table if it doesn't exist
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

-- Step 2: Migrate data from regular_users to passengers (if regular_users has data)
INSERT INTO public.passengers (
    id, 
    full_name, 
    phone, 
    avatar_url, 
    email,
    emergency_contact,
    created_at, 
    updated_at
)
SELECT 
    id,
    full_name,
    phone,
    profile_photo_url as avatar_url,
    NULL as email, -- Will be populated from auth.users
    emergency_contact_phone as emergency_contact,
    created_at,
    updated_at
FROM regular_users
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url,
    emergency_contact = EXCLUDED.emergency_contact,
    updated_at = EXCLUDED.updated_at;

-- Step 3: Drop foreign key constraints that reference regular_users
ALTER TABLE user_favorite_addresses DROP CONSTRAINT IF EXISTS user_favorite_addresses_user_id_fkey;
ALTER TABLE user_payment_methods DROP CONSTRAINT IF EXISTS user_payment_methods_user_id_fkey;
ALTER TABLE ride_history DROP CONSTRAINT IF EXISTS ride_history_passenger_id_fkey;
ALTER TABLE user_ratings_summary DROP CONSTRAINT IF EXISTS user_ratings_summary_user_id_fkey;
ALTER TABLE zeurk_credits_history DROP CONSTRAINT IF EXISTS zeurk_credits_history_user_id_fkey;

-- Step 4: Add new foreign key constraints that reference passengers
ALTER TABLE user_favorite_addresses 
ADD CONSTRAINT user_favorite_addresses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES passengers(id) ON DELETE CASCADE;

ALTER TABLE user_payment_methods 
ADD CONSTRAINT user_payment_methods_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES passengers(id) ON DELETE CASCADE;

ALTER TABLE ride_history 
ADD CONSTRAINT ride_history_passenger_id_fkey 
FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE;

ALTER TABLE user_ratings_summary 
ADD CONSTRAINT user_ratings_summary_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES passengers(id) ON DELETE CASCADE;

ALTER TABLE zeurk_credits_history 
ADD CONSTRAINT zeurk_credits_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES passengers(id) ON DELETE CASCADE;

-- Step 5: Now we can safely drop the regular_users table
DROP TABLE IF EXISTS regular_users CASCADE;

-- Step 6: Add passengers table constraints and indexes (safely handle existing constraints)
DO $$
BEGIN
    -- Add phone constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'passengers_phone_check' 
        AND table_name = 'passengers'
    ) THEN
        ALTER TABLE public.passengers 
        ADD CONSTRAINT passengers_phone_check 
        CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');
    END IF;
    
    -- Add email constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'passengers_email_check' 
        AND table_name = 'passengers'
    ) THEN
        ALTER TABLE public.passengers 
        ADD CONSTRAINT passengers_email_check 
        CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_passengers_phone ON public.passengers(phone);
CREATE INDEX IF NOT EXISTS idx_passengers_email ON public.passengers(email);
CREATE INDEX IF NOT EXISTS idx_passengers_created_at ON public.passengers(created_at);

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own passenger profile" ON public.passengers;
CREATE POLICY "Users can view own passenger profile" ON public.passengers
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own passenger profile" ON public.passengers;
CREATE POLICY "Users can insert own passenger profile" ON public.passengers
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own passenger profile" ON public.passengers;
CREATE POLICY "Users can update own passenger profile" ON public.passengers
    FOR UPDATE USING (auth.uid() = id);

-- Step 8: Create functions and triggers
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! regular_users table has been replaced with passengers table.';
END $$;