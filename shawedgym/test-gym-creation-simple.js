const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function testGymCreationSimple() {
  console.log('🔍 Simple Gym Creation Test...\n');

  try {
    // Step 1: Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@shawedgym.com',
      password: 'password'
    });

    const token = loginResponse.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Step 2: Test with minimal data
    console.log('📝 Testing with minimal data...');
    const minimalData = {
      name: 'Test Gym',
      owner_name: 'Test Owner',
      owner_email: 'test@example.com'
    };

    console.log('📤 Sending:', minimalData);

    const response = await axios.post(`${API_BASE_URL}/gyms`, minimalData, {
      headers: { ...authHeaders, 'Content-Type': 'application/json' }
    });

    console.log('✅ Success:', response.data);

  } catch (error) {
    console.log('❌ Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
  }
}

testGymCreationSimple();
