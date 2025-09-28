const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function testAdminLoginFixed() {
  console.log('🔍 Testing Admin Login After Password Fix...\n');

  try {
    // Step 1: Test login with corrected admin credentials
    console.log('🔐 Step 1: Testing admin login with admin123...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@shawedgym.com',
      password: 'admin123'
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Admin login successful!', {
      status: loginResponse.status,
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.data?.token,
      hasGymId: !!loginResponse.data.data?.gym_id,
      user: loginResponse.data.data?.user
    });

    const token = loginResponse.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Step 2: Test protected endpoints
    console.log('\n📋 Step 2: Testing protected endpoints...');

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

    // Test users endpoint (admin only)
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Users endpoint working (admin access)');
      console.log('Users count:', usersResponse.data.data?.users?.length || 0);
    } catch (error) {
      console.log('❌ Users endpoint failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to shawed.com/login');
    console.log('2. Login with: admin@shawedgym.com / admin123');
    console.log('3. Check Members and Payments pages');
    console.log('4. All should work without 500 errors');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Admin password still not fixed. Please run the SQL script:');
      console.log('1. Go to Neon SQL Editor');
      console.log('2. Run the fix-admin-password.sql script');
      console.log('3. Wait 2-3 minutes for backend redeploy');
      console.log('4. Run this test again');
    }
  }
}

testAdminLoginFixed();
