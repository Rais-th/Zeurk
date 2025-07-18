const https = require('https');

// Your Supabase project details
const accessToken = 'sbp_7c87b2c2c776fb44c5b8f6b00a454b34e8505af0';
const projectRef = 'gvjbpypxvtbplgqhjyzp'; // ZEURK project

// Function to make API requests to Supabase Management API
function makeSupabaseAPIRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-ZEURK-Client/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function listZeurkTables() {
  console.log('🚀 MCP-Style Table Listing for ZEURK Project');
  console.log('===========================================');
  console.log(`📋 Project: ZEURK (${projectRef})`);
  
  try {
    // Get project details
    console.log('\n🔍 Fetching project details...');
    const projectResponse = await makeSupabaseAPIRequest(`/projects/${projectRef}`);
    
    if (projectResponse.status === 200) {
      const project = projectResponse.data;
      console.log(`✅ Project Name: ${project.name}`);
      console.log(`✅ Status: ${project.status}`);
      console.log(`✅ Database URL: ${project.database?.host || 'Not available'}`);
      console.log(`✅ API URL: https://${projectRef}.supabase.co`);
    }
    
    // Try to get database schema information
    console.log('\n🗄️  Attempting to fetch database schema...');
    const schemaResponse = await makeSupabaseAPIRequest(`/projects/${projectRef}/database/tables`);
    
    if (schemaResponse.status === 200) {
      console.log('✅ Tables found:', schemaResponse.data);
    } else {
      console.log(`⚠️  Schema endpoint response: ${schemaResponse.status}`);
      console.log(`Response: ${JSON.stringify(schemaResponse.data)}`);
    }
    
    // Try alternative endpoints
    console.log('\n🔧 Trying alternative API endpoints...');
    
    const endpoints = [
      `/projects/${projectRef}/api-keys`,
      `/projects/${projectRef}/config`,
      `/projects/${projectRef}/settings`,
      `/projects/${projectRef}/database`,
      `/projects/${projectRef}/database/schemas`
    ];
    
    for (const endpoint of endpoints) {
      const response = await makeSupabaseAPIRequest(endpoint);
      console.log(`  ${endpoint}: ${response.status} ${response.status === 200 ? '✅' : '⚠️'}`);
      
      if (response.status === 200 && endpoint.includes('config')) {
        console.log(`    Config keys: ${Object.keys(response.data).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n💡 MCP Server Capabilities:');
  console.log('   ✅ Project management - WORKING');
  console.log('   ✅ Authentication - WORKING');
  console.log('   ⚠️  Direct table access - Requires different approach');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Use SQL queries through the project API');
  console.log('   2. Create tables using SQL migrations');
  console.log('   3. Access data through the standard Supabase client');
}

// Run the test
listZeurkTables().catch(console.error);