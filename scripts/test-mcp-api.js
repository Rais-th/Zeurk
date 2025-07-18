const https = require('https');

// Your Supabase personal access token
const accessToken = 'sbp_7c87b2c2c776fb44c5b8f6b00a454b34e8505af0';

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
        'User-Agent': 'MCP-Test-Client/1.0'
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

async function testSupabaseMCP() {
  console.log('🚀 Testing Supabase MCP-style API Access');
  console.log('=========================================');
  
  try {
    // List projects
    console.log('\n📋 Fetching Projects...');
    const projectsResponse = await makeSupabaseAPIRequest('/projects');
    
    if (projectsResponse.status === 200) {
      const projects = projectsResponse.data;
      console.log(`✅ Found ${projects.length} project(s):`);
      
      for (const project of projects) {
        console.log(`  🏗️  ${project.name} (${project.id})`);
        console.log(`      URL: https://${project.ref}.supabase.co`);
        console.log(`      Status: ${project.status}`);
        console.log(`      Region: ${project.region}`);
        
        // Try to get project config
        console.log(`\n🔧 Fetching config for ${project.name}...`);
        const configResponse = await makeSupabaseAPIRequest(`/projects/${project.ref}/config`);
        
        if (configResponse.status === 200) {
          const config = configResponse.data;
          console.log(`  ✅ Database URL: ${config.db_host}`);
          console.log(`  ✅ API URL: https://${project.ref}.supabase.co`);
          console.log(`  ✅ Auth enabled: ${config.auth?.enabled || 'Unknown'}`);
        }
        
        // Try to get database info
        console.log(`\n🗄️  Checking database for ${project.name}...`);
        const dbResponse = await makeSupabaseAPIRequest(`/projects/${project.ref}/database`);
        
        if (dbResponse.status === 200) {
          console.log(`  ✅ Database accessible via Management API`);
        } else {
          console.log(`  ⚠️  Database info: ${dbResponse.status} - ${JSON.stringify(dbResponse.data)}`);
        }
      }
    } else {
      console.log(`❌ Error fetching projects: ${projectsResponse.status}`);
      console.log(`Response: ${JSON.stringify(projectsResponse.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n✨ MCP-style API test complete!');
  console.log('\n💡 This demonstrates the kind of access the Supabase MCP server provides:');
  console.log('   - Project management');
  console.log('   - Configuration fetching');
  console.log('   - Database interaction');
  console.log('   - And much more with the full MCP server!');
}

// Run the test
testSupabaseMCP().catch(console.error);