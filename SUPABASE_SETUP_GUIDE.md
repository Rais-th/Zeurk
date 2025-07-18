# Supabase Authentication Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in your project details:
   - Name: `zeurk-auth`
   - Database Password: (choose a strong password)
   - Region: Choose the closest to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

Once your project is created:

1. Go to Settings → API
2. Copy your Project URL
3. Copy your `anon` `public` API key

## 3. Configure the App

1. Open `src/config/supabase.js`
2. Replace the placeholder values:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon public key
```

## 4. Set Up Authentication Tables (Optional)

Supabase automatically creates an `auth.users` table, but you can extend it with a profiles table:

1. Go to SQL Editor in your Supabase dashboard
2. Run this SQL to create a profiles table:

```sql
-- Create a table for public profiles
create table profiles (
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
create function public.handle_new_user()
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
```

## 5. Install Dependencies

Run the following command to install the Supabase client:

```bash
npm install @supabase/supabase-js
```

## 6. Test the Authentication

1. Start your Expo development server: `npm start`
2. Open the app in Expo Go
3. Tap the "Drive" button
4. You should see the beautiful authentication screen
5. Try signing up with a test email
6. Check your Supabase dashboard to see the new user

## 7. Email Configuration (Optional)

To enable email verification and password reset:

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure your SMTP settings or use Supabase's built-in email service
3. Customize your email templates

## Features Included

✅ **Beautiful Authentication UI** - Modern, gradient-based design
✅ **Sign Up & Sign In** - Email/password authentication
✅ **Form Validation** - Client-side validation with helpful error messages
✅ **Password Visibility Toggle** - Users can show/hide passwords
✅ **Loading States** - Visual feedback during authentication
✅ **Driver Benefits Display** - Shows benefits of becoming a driver
✅ **Responsive Design** - Works on all screen sizes
✅ **Haptic Feedback** - Enhanced user experience with vibrations
✅ **Auto-navigation** - Seamlessly integrates with existing app flow

## Security Features

🔒 **Row Level Security** - Database-level security policies
🔒 **JWT Tokens** - Secure session management
🔒 **Password Hashing** - Automatic password encryption
🔒 **Email Verification** - Optional email confirmation
🔒 **Session Persistence** - Users stay logged in across app restarts

## Next Steps

1. Configure your Supabase project with the credentials above
2. Test the authentication flow
3. Customize the UI colors/branding to match your app
4. Add additional user profile fields as needed
5. Implement driver verification logic in your DriverDashboard

The authentication is now fully integrated with your Drive button! 🚗✨