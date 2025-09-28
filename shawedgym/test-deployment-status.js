const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com';

async function testCurrentDeployment() {
  console.log('🔍 Testing current deployment status...\n');

  try {
    // Test health endpoint
    console.log('📤 Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Health check:', healthResponse.status);

    // Test simple register endpoint
    console.log('\n📤 Testing simple register endpoint...');
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'admin'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, registerData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    console.log('✅ Simple register works:', registerResponse.status);
    console.log('📄 Response:', registerResponse.data.success ? 'Success' : 'Failed');

    // Test register-gym-owner endpoint
    console.log('\n📤 Testing register-gym-owner endpoint...');
    const gymOwnerData = {
      first_name: 'Test',
      last_name: 'GymOwner',
      email: `gymowner${Date.now()}@example.com`,
      password: 'password123',
      role: 'admin',
      gym_name: 'Test Gym',
      gym_phone: '123456789',
      gym_address: 'Test Address',
      subscription_plan: 'basic'
    };

    try {
      const gymOwnerResponse = await axios.post(`${API_BASE_URL}/api/auth/register-gym-owner`, gymOwnerData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      console.log('✅ Gym owner register works:', gymOwnerResponse.status);
    } catch (error) {
      console.log('❌ Gym owner register failed:', error.response?.status);
      console.log('📄 Error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

testCurrentDeployment();
