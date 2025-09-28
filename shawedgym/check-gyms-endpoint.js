const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function checkGymsEndpoint() {
  console.log('🔍 Checking Gyms Endpoint...\n');

  try {
    // Step 1: Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@shawedgym.com',
      password: 'password'
    });

    const token = loginResponse.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Step 2: Check existing gyms
    console.log('📊 Checking existing gyms...');
    const gymsResponse = await axios.get(`${API_BASE_URL}/gyms`, {
      headers: authHeaders
    });

    console.log('✅ Gyms endpoint working!');
    console.log('📋 Current gyms:', gymsResponse.data.data.gyms.length);
    
    gymsResponse.data.data.gyms.forEach((gym, index) => {
      console.log(`\nGym ${index + 1}:`);
      console.log(`  ID: ${gym.id}`);
      console.log(`  Name: ${gym.name}`);
      console.log(`  Owner: ${gym.owner_name} (${gym.owner_email})`);
      console.log(`  Phone: ${gym.phone || 'Not set'}`);
      console.log(`  Address: ${gym.address || 'Not set'}`);
      console.log(`  Plan: ${gym.subscription_plan}`);
    });

    // Step 3: Test POST endpoint with curl-like data
    console.log('\n📝 Testing POST with different data format...');
    try {
      const testData = {
        name: 'New Test Gym',
        owner_name: 'New Owner',
        owner_email: 'newowner@test.com',
        phone: '+1234567890',
        address: 'Test Address',
        subscription_plan: 'basic'
      };

      console.log('📤 Sending POST data:', testData);
      
      const createResponse = await axios.post(`${API_BASE_URL}/gyms`, testData, {
        headers: { 
          ...authHeaders, 
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ POST successful:', createResponse.data);
    } catch (postError) {
      console.log('❌ POST failed:', {
        status: postError.response?.status,
        message: postError.response?.data?.message,
        data: postError.response?.data
      });
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

checkGymsEndpoint();
