// Test script to check backend status
const https = require('https');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

// Helper function to make HTTP requests
function makeRequest(method, path) {
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

    req.end();
  });
}

// Test functions
async function testBackendStatus() {
  console.log('🔍 Testing backend status...');
  
  const endpoints = [
    '/database/setup',
    '/gyms',
    '/multi-tenant/status',
    '/dashboard/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      const response = await makeRequest('GET', endpoint);
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ Endpoint working');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found (not deployed yet)');
      } else {
        console.log('⚠️  Endpoint exists but returned:', response.status);
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
  console.log('🎯 Backend Status Check...\n');
  await testBackendStatus();
  console.log('\n🎉 Backend Status Check Completed!');
}

// Run the tests
runTests().catch(console.error);
