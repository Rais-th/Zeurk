const { createClient } = require('@supabase/supabase-js');

// Use your existing Supabase configuration
const supabaseUrl = 'https://gvjbpypxvtbplgqhjyzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2amJweXB4dnRicGxncWhqeXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjAyNTgsImV4cCI6MjA2ODI5NjI1OH0.SUUOz3Yc3yiyB20xSae76DrNwcMmIj5TtquGDpt3NwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  console.log('🔍 Listing Supabase Tables (MCP-style)');
  console.log('=====================================');
  
  try {
    // Query to get all tables in the public schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      console.log('❌ Error accessing information_schema (expected with anon key)');
      console.log('Error:', error.message);
      
      // Try alternative approach - check for common tables
      console.log('\n🔄 Trying alternative approach...');
      
      const commonTables = ['profiles', 'users', 'drivers', 'rides', 'vehicles', 'bookings'];
      const existingTables = [];
      
      for (const tableName of commonTables) {
        try {
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!tableError) {
            existingTables.push({
              table_name: tableName,
              status: 'accessible',
              record_count: data ? data.length : 0
            });
          }
        } catch (e) {
          // Table doesn't exist or not accessible
        }
      }
      
      if (existingTables.length > 0) {
        console.log('\n✅ Accessible Tables:');
        existingTables.forEach(table => {
          console.log(`  📋 ${table.table_name} (${table.status})`);
        });
      } else {
        console.log('\n📝 No custom tables found in public schema');
        console.log('   This is normal for a new Supabase project');
      }
      
    } else {
      console.log('\n✅ Tables found:');
      tables.forEach(table => {
        console.log(`  📋 ${table.table_name} (${table.table_type})`);
      });
    }
    
    // Check auth.users table (this should always exist)
    console.log('\n🔐 Checking Authentication Tables:');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.log('  📋 auth.users (exists, but no active session)');
      } else {
        console.log('  📋 auth.users (exists, active session found)');
      }
    } catch (e) {
      console.log('  📋 auth.users (exists, authentication system active)');
    }
    
    console.log('\n📊 Database Summary:');
    console.log(`  🌐 Project URL: ${supabaseUrl}`);
    console.log(`  🔑 Using: Anonymous Key (limited access)`);
    console.log(`  📅 Timestamp: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
listTables().then(() => {
  console.log('\n✨ MCP-style table listing complete!');
}).catch(console.error);