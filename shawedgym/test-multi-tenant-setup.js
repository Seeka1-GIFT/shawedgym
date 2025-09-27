// Test script to run multi-tenant setup
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

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
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

// Test functions
async function checkStatus() {
  console.log('🔍 Checking multi-tenant setup status...');
  try {
    const response = await makeRequest('GET', '/multi-tenant/status');
    console.log('📊 Status Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    return null;
  }
}

async function runSetup() {
  console.log('🚀 Running multi-tenant setup...');
  try {
    const response = await makeRequest('POST', '/multi-tenant/setup');
    console.log('✅ Setup Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return null;
  }
}

async function testGymsAPI() {
  console.log('🏋️ Testing gyms API...');
  try {
    const response = await makeRequest('GET', '/gyms');
    console.log('📋 Gyms Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Gyms API test failed:', error.message);
    return null;
  }
}

async function testSubscriptionPlans() {
  console.log('💳 Testing subscription plans API...');
  try {
    const response = await makeRequest('GET', '/gyms/plans');
    console.log('📦 Plans Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Plans API test failed:', error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🎯 Starting Multi-Tenant Setup Tests...\n');

  // Step 1: Check initial status
  console.log('='.repeat(50));
  console.log('STEP 1: Check Initial Status');
  console.log('='.repeat(50));
  const initialStatus = await checkStatus();
  
  if (initialStatus && initialStatus.data && initialStatus.data.setup_complete) {
    console.log('✅ Multi-tenant setup is already complete!');
    console.log('📊 Current status:', initialStatus.data.status);
    return;
  }

  // Step 2: Run setup
  console.log('\n' + '='.repeat(50));
  console.log('STEP 2: Run Multi-Tenant Setup');
  console.log('='.repeat(50));
  const setupResult = await runSetup();
  
  if (!setupResult || !setupResult.success) {
    console.log('❌ Setup failed, stopping tests');
    return;
  }

  // Step 3: Verify setup
  console.log('\n' + '='.repeat(50));
  console.log('STEP 3: Verify Setup');
  console.log('='.repeat(50));
  const finalStatus = await checkStatus();
  
  if (finalStatus && finalStatus.data && finalStatus.data.setup_complete) {
    console.log('✅ Multi-tenant setup completed successfully!');
  } else {
    console.log('⚠️  Setup may not be complete, check the status above');
  }

  // Step 4: Test APIs
  console.log('\n' + '='.repeat(50));
  console.log('STEP 4: Test New APIs');
  console.log('='.repeat(50));
  
  await testSubscriptionPlans();
  await testGymsAPI();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Multi-Tenant Setup Tests Completed!');
  console.log('='.repeat(50));
}

// Run the tests
runTests().catch(console.error);
