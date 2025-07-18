import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://gvjbpypxvtbplgqhjyzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2amJweXB4dnRicGxncWhqeXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjAyNTgsImV4cCI6MjA2ODI5NjI1OH0.SUUOz3Yc3yiyB20xSae76DrNwcMmIj5TtquGDpt3NwY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});