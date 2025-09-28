const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function testAfterSchemaFix() {
  console.log('🔍 Testing After Database Schema Fix...\n');

  try {
    // Step 1: Login with working admin
    console.log('🔐 Step 1: Logging in with admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@shawedgym.com',
      password: 'password' // Using the working password
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Login successful!');
    const token = loginResponse.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Step 2: Test Members endpoint
    console.log('\n📋 Step 2: Testing Members endpoint...');
    try {
      const membersResponse = await axios.get(`${API_BASE_URL}/members`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Members endpoint working!');
      console.log('Members data:', {
        success: membersResponse.data.success,
        count: membersResponse.data.data?.members?.length || 0,
        pagination: membersResponse.data.data?.pagination
      });
      
      if (membersResponse.data.data?.members?.length > 0) {
        console.log('Sample member:', membersResponse.data.data.members[0]);
      }
    } catch (error) {
      console.log('❌ Members endpoint still failing:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        details: error.response?.data?.details
      });
    }

    // Step 3: Test Payments endpoint
    console.log('\n💰 Step 3: Testing Payments endpoint...');
    try {
      const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Payments endpoint working!');
      console.log('Payments data:', {
        success: paymentsResponse.data.success,
        count: paymentsResponse.data.data?.payments?.length || 0,
        pagination: paymentsResponse.data.data?.pagination
      });
      
      if (paymentsResponse.data.data?.payments?.length > 0) {
        console.log('Sample payment:', paymentsResponse.data.data.payments[0]);
      }
    } catch (error) {
      console.log('❌ Payments endpoint still failing:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        details: error.response?.data?.details
      });
    }

    // Step 4: Test other endpoints
    console.log('\n📊 Step 4: Testing other endpoints...');
    
    const endpoints = [
      { name: 'Dashboard Stats', url: '/dashboard/stats' },
      { name: 'Plans', url: '/plans' },
      { name: 'Assets', url: '/assets' },
      { name: 'Classes', url: '/classes' },
      { name: 'Trainers', url: '/trainers' },
      { name: 'Attendance', url: '/attendance' },
      { name: 'Expenses', url: '/expenses' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, {
          timeout: 30000,
          headers: authHeaders
        });
        console.log(`✅ ${endpoint.name} working`);
      } catch (error) {
        console.log(`❌ ${endpoint.name} failing:`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Testing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. If Members/Payments are still failing, run the SQL script again');
    console.log('2. Go to shawed.com/login');
    console.log('3. Login with: admin@shawedgym.com / password');
    console.log('4. Check Members and Payments pages should work now');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAfterSchemaFix();
