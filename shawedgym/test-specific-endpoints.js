// Test specific endpoints that should be working
const https = require('https');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData
        });
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

// Test functions
async function testSpecificEndpoints() {
  console.log('🔍 Testing specific endpoints...');
  
  const endpoints = [
    { method: 'GET', path: '/members' },
    { method: 'GET', path: '/payments' },
    { method: 'GET', path: '/plans' },
    { method: 'GET', path: '/gyms' },
    { method: 'GET', path: '/multi-tenant/status' },
    { method: 'POST', path: '/multi-tenant/setup', data: {} }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint.method} ${endpoint.path}`);
      const response = await makeRequest(endpoint.method, endpoint.path, endpoint.data);
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ Endpoint working');
      } else if (response.status === 401) {
        console.log('🔒 Endpoint requires authentication (expected)');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found');
      } else {
        console.log('⚠️  Endpoint returned:', response.status);
      }
      
      // Show first 200 characters of response
      const preview = response.data.substring(0, 200);
      console.log('Response preview:', preview);
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🎯 Specific Endpoints Test...\n');
  await testSpecificEndpoints();
  console.log('\n🎉 Specific Endpoints Test Completed!');
}

// Run the tests
runTests().catch(console.error);
