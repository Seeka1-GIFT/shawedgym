// Test script to check root endpoints
const https = require('https');

const BASE_URL = 'https://shawedgym.onrender.com';

// Helper function to make HTTP requests
function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
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

    req.end();
  });
}

// Test functions
async function testRootEndpoints() {
  console.log('🔍 Testing root endpoints...');
  
  const endpoints = [
    '/',
    '/api',
    '/api/',
    '/api/health',
    '/api/dashboard/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      const response = await makeRequest('GET', endpoint);
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ Endpoint working');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found');
      } else {
        console.log('⚠️  Endpoint returned:', response.status);
      }
      
      // Show first 300 characters of response
      const preview = response.data.substring(0, 300);
      console.log('Response preview:', preview);
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🎯 Root Endpoints Test...\n');
  await testRootEndpoints();
  console.log('\n🎉 Root Endpoints Test Completed!');
}

// Run the tests
runTests().catch(console.error);
