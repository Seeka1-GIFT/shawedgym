const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function checkGymsTable() {
  console.log('🔍 Checking Gyms Table Structure...\n');

  try {
    // Step 1: Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@shawedgym.com',
      password: 'password'
    });

    const token = loginResponse.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Step 2: Check database setup
    console.log('📊 Checking database setup...');
    const setupResponse = await axios.post(`${API_BASE_URL}/database/setup`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Database setup:', setupResponse.data);

    // Step 3: Test health endpoint
    console.log('\n🏥 Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Step 4: Test dashboard stats
    console.log('\n📊 Testing dashboard stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: authHeaders
    });
    console.log('✅ Dashboard stats:', statsResponse.data.success);

    // Step 5: Test users endpoint (should work)
    console.log('\n👥 Testing users endpoint...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: authHeaders
    });
    console.log('✅ Users endpoint:', usersResponse.data.success);

    // Step 6: Test gyms endpoint with detailed error
    console.log('\n🏢 Testing gyms endpoint...');
    try {
      const gymsResponse = await axios.get(`${API_BASE_URL}/gyms`, {
        headers: authHeaders
      });
      console.log('✅ Gyms endpoint working!');
      console.log('📋 Gyms count:', gymsResponse.data.data.gyms.length);
    } catch (gymsError) {
      console.log('❌ Gyms endpoint failed:', {
        status: gymsError.response?.status,
        message: gymsError.response?.data?.message,
        error: gymsError.response?.data?.error,
        details: gymsError.response?.data
      });
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

checkGymsTable();
