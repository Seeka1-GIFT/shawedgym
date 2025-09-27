// Test auth endpoints that should be working
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
async function testAuthEndpoints() {
  console.log('🔍 Testing auth endpoints...');
  
  const endpoints = [
    { method: 'POST', path: '/auth/login', data: { email: 'admin@shawedgym.com', password: 'admin123' } },
    { method: 'POST', path: '/auth/register', data: { first_name: 'Test', last_name: 'User', email: 'test@test.com', password: 'test123', role: 'user' } },
    { method: 'GET', path: '/auth/me' },
    { method: 'POST', path: '/database/setup', data: {} },
    { method: 'GET', path: '/users' }
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
  console.log('🎯 Auth Endpoints Test...\n');
  await testAuthEndpoints();
  console.log('\n🎉 Auth Endpoints Test Completed!');
}

// Run the tests
runTests().catch(console.error);
