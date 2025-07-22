const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDriversTable() {
  try {
    console.log('🚀 Setting up drivers table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-drivers-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    // Verify table creation
    console.log('🔍 Verifying drivers table...');
    const { data, error } = await supabase
      .from('drivers')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Error verifying table:', error.message);
    } else {
      console.log('✅ Drivers table is accessible');
    }
    
    console.log('🎉 Drivers table setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function setupDriversTableDirect() {
  try {
    console.log('🚀 Setting up drivers table (direct method)...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-drivers-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executing SQL script...');
    
    // Try to execute the entire SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      console.log('💡 You may need to run this SQL manually in your Supabase dashboard');
      console.log('📋 SQL to execute:');
      console.log(sql);
    } else {
      console.log('✅ SQL executed successfully');
    }
    
    // Verify table creation
    console.log('🔍 Verifying drivers table...');
    const { data: tableData, error: tableError } = await supabase
      .from('drivers')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error verifying table:', tableError.message);
      console.log('💡 Please run the SQL script manually in your Supabase dashboard');
    } else {
      console.log('✅ Drivers table is accessible');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('💡 Please run the SQL script manually in your Supabase dashboard');
  }
}

// Run the setup
console.log('🔧 Starting drivers table setup...');
setupDriversTableDirect();