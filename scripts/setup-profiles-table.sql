-- Create a comprehensive table for driver profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  
  -- Basic Profile Information
  full_name text,
  avatar_url text,
  email text,
  phone text,
  date_of_birth date,
  emergency_contact_number text,
  
  -- Driver Status
  is_driver boolean default false,
  driver_status text default 'pending' check (driver_status in ('pending', 'active', 'suspended', 'inactive')),
  appear_online boolean default false,
  driver_rating decimal(3,2) default 0.00,
  
  -- Driver Documents & Photos
  dl_photo_url text, -- Driver's License photo
  selfie_photo_url text, -- Selfie verification photo
  
  -- Vehicle Information
  vehicle_type text, -- Car, Motorcycle, Truck, etc.
  vehicle_make_model text, -- Toyota Camry, Honda Civic, etc.
  plate_number text,
  vehicle_photo_url text,
  
  -- Vehicle Documents
  registration_document_url text, -- VIN, CARTE rose photo
  insurance_proof_url text,
  
  -- Payment Preferences
  mobile_money_preference text check (mobile_money_preference in ('Airtel', 'Vodacom', 'Orange', 'Mpesa')),
  
  -- Location (for driver tracking)
  current_latitude decimal(10, 8),
  current_longitude decimal(11, 8),
  last_location_update timestamp with time zone,
  
  -- Constraints
  constraint username_length check (char_length(full_name) >= 3),
  constraint phone_format check (phone ~ '^[+]?[0-9\s\-\(\)]+$'),
  constraint rating_range check (driver_rating >= 0.00 and driver_rating <= 5.00)
);

-- Create transaction history table
create table if not exists transaction_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  transaction_type text not null check (transaction_type in ('ride_payment', 'withdrawal', 'deposit', 'commission', 'bonus', 'refund')),
  amount decimal(10,2) not null,
  currency text default 'CDF',
  payment_method text check (payment_method in ('Airtel', 'Vodacom', 'Orange', 'Mpesa', 'Cash')),
  transaction_reference text,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table transaction_history enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Transaction history policies
create policy "Users can view their own transactions." on transaction_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions." on transaction_history
  for insert with check (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_profiles_driver_status on profiles(driver_status);
create index if not exists idx_profiles_appear_online on profiles(appear_online);
create index if not exists idx_profiles_location on profiles(current_latitude, current_longitude);
create index if not exists idx_profiles_phone on profiles(phone);
create index if not exists idx_transaction_history_user_id on transaction_history(user_id);
create index if not exists idx_transaction_history_created_at on transaction_history(created_at);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on profiles
    for each row execute procedure update_updated_at_column();

create trigger update_transaction_history_updated_at before update on transaction_history
    for each row execute procedure update_updated_at_column();

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();