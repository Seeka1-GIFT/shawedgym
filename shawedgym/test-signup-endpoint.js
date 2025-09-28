const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com';

async function testSignupEndpoint() {
  console.log('🧪 Testing register-gym-owner endpoint...\n');

  const testData = {
    first_name: 'Ahmed',
    last_name: 'Hassan',
    email: 'ahmed1@gmail.com',
    password: 'password123',
    role: 'admin',
    gym_name: 'Al-furat GYM',
    gym_phone: '616667766',
    gym_address: 'Warta Nabadda',
    subscription_plan: 'basic'
  };

  try {
    console.log('📤 Sending request to:', `${API_BASE_URL}/api/auth/register-gym-owner`);
    console.log('📋 Request data:', JSON.stringify(testData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/api/auth/register-gym-owner`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Success!');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    console.log('🔍 Error message:', error.message);
    
    if (error.response?.data) {
      console.log('📋 Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSignupEndpoint();
