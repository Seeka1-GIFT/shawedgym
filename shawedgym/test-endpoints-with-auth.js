// Test endpoints with proper authentication
const https = require('https');

const testEndpoints = async () => {
  console.log('🔍 Step 1: Testing login...');
  
  // First login to get token
  const loginData = JSON.stringify({
    email: 'admin@shawedgym.com',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginResponse = await new Promise((resolve, reject) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  console.log('Login response:', {
    status: loginResponse.status,
    success: loginResponse.data?.success,
    hasToken: !!loginResponse.data?.data?.token,
    hasGymId: !!loginResponse.data?.data?.gym_id
  });

  if (loginResponse.status !== 200 || !loginResponse.data?.data?.token) {
    console.log('❌ Login failed, cannot test endpoints');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    return;
  }

  const token = loginResponse.data.data.token;
  const gymId = loginResponse.data.data.gym_id;
  
  console.log('✅ Login successful');
  console.log('Token:', token.substring(0, 20) + '...');
  console.log('Gym ID:', gymId);

  // Test members endpoint
  console.log('\n🔍 Step 2: Testing members endpoint...');
  
  const membersOptions = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/members?limit=5',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const membersResponse = await new Promise((resolve, reject) => {
    const req = https.request(membersOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  console.log('Members endpoint response:');
  console.log('Status:', membersResponse.status);
  console.log('Data:', JSON.stringify(membersResponse.data, null, 2));

  // Test payments endpoint
  console.log('\n🔍 Step 3: Testing payments endpoint...');
  
  const paymentsOptions = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/payments?limit=5',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const paymentsResponse = await new Promise((resolve, reject) => {
    const req = https.request(paymentsOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  console.log('Payments endpoint response:');
  console.log('Status:', paymentsResponse.status);
  console.log('Data:', JSON.stringify(paymentsResponse.data, null, 2));

  // Test gyms endpoint
  console.log('\n🔍 Step 4: Testing gyms endpoint...');
  
  const gymsOptions = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/gyms',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const gymsResponse = await new Promise((resolve, reject) => {
    const req = https.request(gymsOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  console.log('Gyms endpoint response:');
  console.log('Status:', gymsResponse.status);
  console.log('Data:', JSON.stringify(gymsResponse.data, null, 2));

  // Summary
  console.log('\n📊 Summary:');
  console.log('Login:', loginResponse.status === 200 ? '✅' : '❌');
  console.log('Members:', membersResponse.status === 200 ? '✅' : '❌');
  console.log('Payments:', paymentsResponse.status === 200 ? '✅' : '❌');
  console.log('Gyms:', gymsResponse.status === 200 ? '✅' : '❌');
};

testEndpoints().catch(console.error);
