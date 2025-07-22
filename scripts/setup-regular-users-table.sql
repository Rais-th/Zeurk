-- Create comprehensive tables for regular users (passengers)
-- This complements the existing driver profiles table

-- Main regular users table (extends the existing profiles table)
CREATE TABLE IF NOT EXISTS regular_users (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Basic Profile Information
  full_name text NOT NULL,
  phone text,
  profile_photo_url text,
  
  -- Account Information
  account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive')),
  language text DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'ar')),
  
  -- Emergency Contact
  emergency_contact_name text,
  emergency_contact_phone text,
  
  -- Rating and Credits
  passenger_rating decimal(3,2) DEFAULT 0.00 CHECK (passenger_rating >= 0.00 AND passenger_rating <= 5.00),
  zeurk_credits decimal(10,2) DEFAULT 0.00 CHECK (zeurk_credits >= 0.00),
  
  -- Preferences
  favorite_vehicle_type text,
  
  -- Constraints
  CONSTRAINT phone_format CHECK (phone ~ '^[+]?[0-9\s\-\(\)]+$'),
  CONSTRAINT emergency_phone_format CHECK (emergency_contact_phone ~ '^[+]?[0-9\s\-\(\)]+$')
);

-- Favorite Addresses Table
CREATE TABLE IF NOT EXISTS user_favorite_addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES regular_users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Address Information
  label text NOT NULL, -- 'Maison', 'Travail', 'Gym', etc.
  address_line text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  city text,
  country text DEFAULT 'Congo',
  
  -- Constraints
  UNIQUE(user_id, label),
  CONSTRAINT valid_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL AND 
     latitude >= -90 AND latitude <= 90 AND 
     longitude >= -180 AND longitude <= 180)
  )
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES regular_users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Payment Information
  payment_type text NOT NULL CHECK (payment_type IN ('cash', 'mobile_money', 'card')),
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  -- Mobile Money Information (for mobile_money type)
  mobile_money_provider text CHECK (mobile_money_provider IN ('airtel', 'orange', 'mpesa') OR mobile_money_provider IS NULL),
  mobile_money_number text,
  
  -- Card Information (for future card integration)
  card_last_four text,
  card_brand text,
  
  -- Constraints
  CONSTRAINT mobile_money_validation CHECK (
    (payment_type = 'mobile_money' AND mobile_money_provider IS NOT NULL AND mobile_money_number IS NOT NULL) OR
    (payment_type != 'mobile_money')
  ),
  CONSTRAINT mobile_money_number_format CHECK (
    mobile_money_number IS NULL OR mobile_money_number ~ '^[+]?[0-9\s\-\(\)]+$'
  )
);

-- Ride History Table
CREATE TABLE IF NOT EXISTS ride_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id uuid REFERENCES regular_users(id) ON DELETE CASCADE NOT NULL,
  driver_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ride Information
  ride_status text DEFAULT 'completed' CHECK (ride_status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
  vehicle_type text,
  
  -- Location Information
  pickup_address text NOT NULL,
  pickup_latitude decimal(10, 8),
  pickup_longitude decimal(11, 8),
  destination_address text NOT NULL,
  destination_latitude decimal(10, 8),
  destination_longitude decimal(11, 8),
  
  -- Timing
  requested_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- Pricing
  estimated_price decimal(10,2),
  final_price decimal(10,2),
  currency text DEFAULT 'CDF',
  
  -- Payment
  payment_method text CHECK (payment_method IN ('cash', 'mobile_money', 'zeurk_credits')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  
  -- Ratings
  passenger_rating_for_driver decimal(3,2) CHECK (passenger_rating_for_driver >= 0.00 AND passenger_rating_for_driver <= 5.00),
  driver_rating_for_passenger decimal(3,2) CHECK (driver_rating_for_passenger >= 0.00 AND driver_rating_for_passenger <= 5.00),
  
  -- Distance and Duration
  distance_km decimal(8,2),
  duration_minutes integer,
  
  -- Notes
  passenger_notes text,
  driver_notes text,
  cancellation_reason text
);

-- User Ratings Summary (for quick access to ratings)
CREATE TABLE IF NOT EXISTS user_ratings_summary (
  user_id uuid REFERENCES regular_users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Rating Statistics
  total_rides integer DEFAULT 0,
  total_rating_points decimal(10,2) DEFAULT 0.00,
  average_rating decimal(3,2) DEFAULT 0.00,
  
  -- Rating Breakdown
  five_star_count integer DEFAULT 0,
  four_star_count integer DEFAULT 0,
  three_star_count integer DEFAULT 0,
  two_star_count integer DEFAULT 0,
  one_star_count integer DEFAULT 0
);

-- Zeurk Credits Transaction History
CREATE TABLE IF NOT EXISTS zeurk_credits_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES regular_users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Transaction Information
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'refund', 'bonus', 'referral')),
  amount decimal(10,2) NOT NULL,
  balance_after decimal(10,2) NOT NULL,
  
  -- Reference Information
  ride_id uuid REFERENCES ride_history(id) ON DELETE SET NULL,
  description text,
  reference_code text
);

-- Row Level Security Policies

-- Regular Users Table
ALTER TABLE regular_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON regular_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON regular_users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON regular_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Favorite Addresses Table
ALTER TABLE user_favorite_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorite addresses" ON user_favorite_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Payment Methods Table
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payment methods" ON user_payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Ride History Table
ALTER TABLE ride_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ride history" ON ride_history
  FOR SELECT USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

CREATE POLICY "Users can insert their own rides" ON ride_history
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Users can update rides they're involved in" ON ride_history
  FOR UPDATE USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

-- User Ratings Summary Table
ALTER TABLE user_ratings_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rating summary" ON user_ratings_summary
  FOR SELECT USING (auth.uid() = user_id);

-- Zeurk Credits History Table
ALTER TABLE zeurk_credits_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits history" ON zeurk_credits_history
  FOR SELECT USING (auth.uid() = user_id);

-- Create Indexes for Better Performance
CREATE INDEX IF NOT EXISTS idx_regular_users_phone ON regular_users(phone);
CREATE INDEX IF NOT EXISTS idx_regular_users_account_status ON regular_users(account_status);
CREATE INDEX IF NOT EXISTS idx_favorite_addresses_user_id ON user_favorite_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON user_payment_methods(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_ride_history_passenger_id ON ride_history(passenger_id);
CREATE INDEX IF NOT EXISTS idx_ride_history_driver_id ON ride_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_history_status ON ride_history(ride_status);
CREATE INDEX IF NOT EXISTS idx_ride_history_created_at ON ride_history(created_at);
CREATE INDEX IF NOT EXISTS idx_zeurk_credits_user_id ON zeurk_credits_history(user_id);
CREATE INDEX IF NOT EXISTS idx_zeurk_credits_created_at ON zeurk_credits_history(created_at);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_regular_users_updated_at BEFORE UPDATE ON regular_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorite_addresses_updated_at BEFORE UPDATE ON user_favorite_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON user_payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ride_history_updated_at BEFORE UPDATE ON ride_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create regular user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_regular_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.regular_users (id, full_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Initialize rating summary
  INSERT INTO public.user_ratings_summary (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create regular user profile on auth user creation
CREATE TRIGGER on_auth_user_created_regular
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_regular_user();

-- Function to update rating summary when new rating is added
CREATE OR REPLACE FUNCTION update_user_rating_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update passenger rating summary when driver rates passenger
  IF NEW.driver_rating_for_passenger IS NOT NULL AND 
     (OLD.driver_rating_for_passenger IS NULL OR OLD.driver_rating_for_passenger != NEW.driver_rating_for_passenger) THEN
    
    INSERT INTO user_ratings_summary (user_id, total_rides, total_rating_points, average_rating)
    VALUES (NEW.passenger_id, 1, NEW.driver_rating_for_passenger, NEW.driver_rating_for_passenger)
    ON CONFLICT (user_id) DO UPDATE SET
      total_rides = user_ratings_summary.total_rides + 1,
      total_rating_points = user_ratings_summary.total_rating_points + NEW.driver_rating_for_passenger,
      average_rating = (user_ratings_summary.total_rating_points + NEW.driver_rating_for_passenger) / (user_ratings_summary.total_rides + 1),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating summary
CREATE TRIGGER update_rating_summary_trigger
  AFTER UPDATE ON ride_history
  FOR EACH ROW EXECUTE FUNCTION update_user_rating_summary();

-- Function to update Zeurk credits
CREATE OR REPLACE FUNCTION update_zeurk_credits(
  user_uuid uuid,
  transaction_type_param text,
  amount_param decimal,
  description_param text DEFAULT NULL,
  ride_id_param uuid DEFAULT NULL
)
RETURNS decimal AS $$
DECLARE
  current_balance decimal;
  new_balance decimal;
BEGIN
  -- Get current balance
  SELECT zeurk_credits INTO current_balance 
  FROM regular_users 
  WHERE id = user_uuid;
  
  -- Calculate new balance
  IF transaction_type_param IN ('earned', 'bonus', 'referral', 'refund') THEN
    new_balance := current_balance + amount_param;
  ELSE
    new_balance := current_balance - amount_param;
  END IF;
  
  -- Ensure balance doesn't go negative
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient Zeurk credits. Current balance: %, Requested: %', current_balance, amount_param;
  END IF;
  
  -- Update user balance
  UPDATE regular_users 
  SET zeurk_credits = new_balance, updated_at = now()
  WHERE id = user_uuid;
  
  -- Record transaction
  INSERT INTO zeurk_credits_history (
    user_id, transaction_type, amount, balance_after, description, ride_id
  ) VALUES (
    user_uuid, transaction_type_param, amount_param, new_balance, description_param, ride_id_param
  );
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data insertion (optional - remove if not needed)
-- This creates a sample regular user for testing
/*
INSERT INTO regular_users (
  id, full_name, phone, account_status, language, passenger_rating, zeurk_credits
) VALUES (
  gen_random_uuid(), 
  'Jean Dupont', 
  '+243123456789', 
  'active', 
  'fr', 
  4.5, 
  100.00
) ON CONFLICT (id) DO NOTHING;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Regular users tables created successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- regular_users (main user profiles)';
  RAISE NOTICE '- user_favorite_addresses (favorite locations)';
  RAISE NOTICE '- user_payment_methods (payment options)';
  RAISE NOTICE '- ride_history (complete ride records)';
  RAISE NOTICE '- user_ratings_summary (rating statistics)';
  RAISE NOTICE '- zeurk_credits_history (credits transactions)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features included:';
  RAISE NOTICE '✅ Row Level Security policies';
  RAISE NOTICE '✅ Automatic profile creation on user signup';
  RAISE NOTICE '✅ Rating system with automatic summary updates';
  RAISE NOTICE '✅ Zeurk credits system with transaction history';
  RAISE NOTICE '✅ Multiple payment methods support';
  RAISE NOTICE '✅ Favorite addresses management';
  RAISE NOTICE '✅ Comprehensive ride history';
  RAISE NOTICE '✅ Performance indexes';
  RAISE NOTICE '✅ Data validation constraints';
END $$;