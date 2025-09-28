const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function runCompleteFix() {
  console.log('🚀 Starting complete ShawedGym fix...\n');

  try {
    // Step 1: Test database setup endpoint
    console.log('📊 Step 1: Setting up database...');
    const setupResponse = await axios.post(`${API_BASE_URL}/database/setup`, {}, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Database setup successful');
    console.log('Setup response:', setupResponse.data);

    // Step 2: Test login with admin credentials
    console.log('\n🔐 Step 2: Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@shawedgym.com',
      password: 'admin123'
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Login successful');
    console.log('Login response:', {
      status: loginResponse.status,
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.data?.token,
      hasGymId: !!loginResponse.data.data?.gym_id,
      user: loginResponse.data.data?.user
    });

    const token = loginResponse.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Step 3: Test protected endpoints
    console.log('\n📋 Step 3: Testing protected endpoints...');

    // Test members endpoint
    try {
      const membersResponse = await axios.get(`${API_BASE_URL}/members`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Members endpoint working');
      console.log('Members count:', membersResponse.data.data?.members?.length || 0);
    } catch (error) {
      console.log('❌ Members endpoint failed:', error.response?.data || error.message);
    }

    // Test payments endpoint
    try {
      const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Payments endpoint working');
      console.log('Payments count:', paymentsResponse.data.data?.payments?.length || 0);
    } catch (error) {
      console.log('❌ Payments endpoint failed:', error.response?.data || error.message);
    }

    // Test dashboard stats
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Dashboard stats working');
      console.log('Stats:', statsResponse.data);
    } catch (error) {
      console.log('❌ Dashboard stats failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Complete fix test finished!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to shawed.com/login');
    console.log('2. Login with: admin@shawedgym.com / admin123');
    console.log('3. Check Members and Payments pages');
    console.log('4. All should work without 500 errors');

  } catch (error) {
    console.error('❌ Fix failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Admin user issue detected. Please run the SQL script in Neon:');
      console.log('1. Go to Neon SQL Editor');
      console.log('2. Run the fix-all-issues.sql script');
      console.log('3. Wait 2-3 minutes for backend redeploy');
      console.log('4. Run this test again');
    }
  }
}

runCompleteFix();
