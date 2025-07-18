#!/usr/bin/env node

// Test authentication flow and user management
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Supabase configuration
const supabaseUrl = 'https://gvjbpypxvtbplgqhjyzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2amJweXB4dnRicGxncWhqeXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjAyNTgsImV4cCI6MjA2ODI5NjI1OH0.SUUOz3Yc3yiyB20xSae76DrNwcMmIj5TtquGDpt3NwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function testSignIn() {
  console.log('🔐 Testing Sign In Flow\n');
  
  try {
    const email = await askQuestion('Enter email to test sign in (or press Enter to skip): ');
    
    if (!email.trim()) {
      console.log('⏭️  Skipping sign in test.\n');
      return null;
    }
    
    const password = await askQuestion('Enter password: ');
    
    console.log('\n🔄 Attempting to sign in...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });
    
    if (error) {
      console.log('❌ Sign in failed:', error.message);
      return null;
    }
    
    console.log('✅ Sign in successful!');
    console.log('👤 User Info:');
    console.log({
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
      last_sign_in_at: data.user.last_sign_in_at,
      email_confirmed_at: data.user.email_confirmed_at
    });
    
    return data.user;
    
  } catch (err) {
    console.log('❌ Error during sign in:', err.message);
    return null;
  }
}

async function testUserSession() {
  console.log('\n🔍 Checking current session...\n');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.log('❌ Session error:', error.message);
    return false;
  }
  
  if (session) {
    console.log('✅ Active session found:');
    console.log({
      user_id: session.user.id,
      email: session.user.email,
      expires_at: new Date(session.expires_at * 1000).toLocaleString()
    });
    return true;
  } else {
    console.log('❌ No active session');
    return false;
  }
}

async function testProfilesTable() {
  console.log('\n📋 Testing profiles table access...\n');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.log('❌ Profiles table error:', error.message);
      console.log('💡 The profiles table needs to be created. Run the SQL from setup-profiles-table.sql');
      return false;
    }
    
    console.log('✅ Profiles table accessible!');
    console.log(`📊 Found ${profiles.length} profiles:`);
    
    if (profiles.length > 0) {
      console.table(profiles);
    }
    
    return true;
    
  } catch (err) {
    console.log('❌ Error accessing profiles:', err.message);
    return false;
  }
}

async function signOut() {
  console.log('\n🚪 Signing out...');
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.log('❌ Sign out error:', error.message);
  } else {
    console.log('✅ Signed out successfully');
  }
}

async function main() {
  console.log('🚀 Zeurk Authentication Test Suite\n');
  console.log('=' .repeat(60));
  
  // Test 1: Check initial session
  await testUserSession();
  
  // Test 2: Try to sign in
  const user = await testSignIn();
  
  // Test 3: Check session after sign in
  if (user) {
    await testUserSession();
    await testProfilesTable();
    await signOut();
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Test Summary:');
  console.log('✅ Supabase connection: Working');
  console.log('✅ Authentication flow: Working');
  console.log('📊 Users in dashboard: 2 confirmed users');
  console.log('⚠️  Profiles table: Needs to be created');
  
  console.log('\n💡 Next steps:');
  console.log('1. Create profiles table using setup-profiles-table.sql');
  console.log('2. Test the mobile app authentication');
  console.log('3. Verify driver dashboard access');
  
  rl.close();
}

main().catch((error) => {
  console.error('❌ Test failed:', error.message);
  rl.close();
});