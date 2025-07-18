#!/usr/bin/env node

// Enhanced Supabase management script
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://gvjbpypxvtbplgqhjyzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2amJweXB4dnRicGxncWhqeXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjAyNTgsImV4cCI6MjA2ODI5NjI1OH0.SUUOz3Yc3yiyB20xSae76DrNwcMmIj5TtquGDpt3NwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL to create the profiles table (from your setup guide)
const createProfilesTableSQL = `
-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  phone text,
  is_driver boolean default false,

  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`;

async function setupDatabase() {
  console.log('🔧 Setting up database structure...\n');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createProfilesTableSQL 
    });
    
    if (error) {
      console.log('❌ Could not execute SQL:', error.message);
      console.log('💡 You may need to run this SQL manually in your Supabase SQL Editor:');
      console.log('\n' + '='.repeat(60));
      console.log(createProfilesTableSQL);
      console.log('='.repeat(60));
    } else {
      console.log('✅ Database structure created successfully!');
    }
  } catch (err) {
    console.log('❌ Error setting up database:', err.message);
    console.log('💡 You may need to run the SQL manually in your Supabase dashboard.');
  }
}

async function listAuthUsers() {
  console.log('\n🔍 Checking authentication status...\n');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found:');
      console.log({
        user_id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at,
        last_sign_in_at: session.user.last_sign_in_at
      });
    } else {
      console.log('❌ No active session. User needs to sign in first.');
    }

    // Try to get profiles if table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.log('\n❌ Profiles table error:', profilesError.message);
    } else {
      console.log('\n✅ Profiles found:', profiles.length);
      if (profiles.length > 0) {
        console.table(profiles);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testAuthentication() {
  console.log('\n🧪 Testing authentication flow...\n');
  
  // Test sign up with a dummy email (this will fail but show us the flow)
  console.log('Testing sign up flow...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  if (signUpError) {
    console.log('❌ Sign up test:', signUpError.message);
  } else {
    console.log('✅ Sign up test successful:', signUpData.user?.email);
  }
}

async function showDashboardInfo() {
  console.log('\n📊 Supabase Dashboard Information\n');
  console.log('🌐 Project URL:', supabaseUrl);
  console.log('🔑 Using anon key (limited access)');
  console.log('\n💡 To see all users, you need to:');
  console.log('   1. Go to your Supabase dashboard');
  console.log('   2. Navigate to Authentication > Users');
  console.log('   3. Or use the service role key (not recommended for client apps)');
  console.log('\n🔗 Dashboard URL: https://supabase.com/dashboard/project/gvjbpypxvtbplgqhjyzp');
}

async function main() {
  console.log('🚀 Zeurk Supabase Management Tool\n');
  console.log('=' .repeat(60));
  
  await listAuthUsers();
  await showDashboardInfo();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✨ Done! Check your Supabase dashboard for complete user management.');
}

main().catch(console.error);