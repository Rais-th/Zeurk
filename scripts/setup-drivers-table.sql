-- Create the drivers table with all necessary fields
CREATE TABLE IF NOT EXISTS public.drivers (
   id uuid NOT NULL,
   updated_at timestamp with time zone NULL DEFAULT now(),
   created_at timestamp with time zone NULL DEFAULT now(),
   full_name text NULL,
   avatar_url text NULL,
   email text NULL,
   phone text NULL,
   date_of_birth date NULL,
   emergency_contact_number text NULL,
   is_driver boolean NULL DEFAULT false,
   driver_status text NULL DEFAULT 'pending'::text,
   appear_online boolean NULL DEFAULT false,
   driver_rating numeric(3, 2) NULL DEFAULT 0.00,
   dl_photo_url text NULL,
   selfie_photo_url text NULL,
   vehicle_type text NULL,
   vehicle_make_model text NULL,
   plate_number text NULL,
   vehicle_photo_url text NULL,
   registration_document_url text NULL,
   insurance_proof_url text NULL,
   mobile_money_preference text NULL,
   current_latitude numeric(10, 8) NULL,
   current_longitude numeric(11, 8) NULL,
   last_location_update timestamp with time zone NULL,
   CONSTRAINT drivers_pkey PRIMARY KEY (id),
   CONSTRAINT drivers_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
   CONSTRAINT phone_format CHECK ((phone ~ '^[+]?[0-9\s\-\(\)]+$'::text)),
   CONSTRAINT rating_range CHECK (
     (
       (driver_rating >= 0.00)
       AND (driver_rating <= 5.00)
     )
   ),
   CONSTRAINT username_length CHECK ((char_length(full_name) >= 3)),
   CONSTRAINT drivers_mobile_money_preference_check CHECK (
     (
       mobile_money_preference = ANY (
         ARRAY[
           'Airtel'::text,
           'Vodacom'::text,
           'Orange'::text,
           'Mpesa'::text
         ]
       )
     )
   ),
   CONSTRAINT drivers_driver_status_check CHECK (
     (
       driver_status = ANY (
         ARRAY[
           'pending'::text,
           'active'::text,
           'suspended'::text,
           'inactive'::text
         ]
       )
     )
   )
) TABLESPACE pg_default;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drivers_driver_status ON public.drivers USING btree (driver_status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_drivers_appear_online ON public.drivers USING btree (appear_online) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_drivers_location ON public.drivers USING btree (current_latitude, current_longitude) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON public.drivers USING btree (phone) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.drivers
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.drivers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.drivers
    FOR UPDATE USING (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.drivers (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$;