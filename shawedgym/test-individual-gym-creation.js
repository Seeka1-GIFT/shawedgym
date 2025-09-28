const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com';

async function testIndividualGymCreation() {
  console.log('🧪 Testing individual gym creation for new admins...\n');

  const testData = {
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: `ahmed${Date.now()}@example.com`,
    password: 'password123',
    role: 'admin'
  };

  try {
    console.log('📤 Registering new admin user...');
    console.log('📋 Request data:', JSON.stringify(testData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Registration successful!');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

    // Test login with the new user
    console.log('\n📤 Testing login with new user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testData.email,
      password: testData.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Login successful!');
    console.log('📄 Login response:', JSON.stringify(loginResponse.data, null, 2));

    // Test protected endpoint with new user's token
    const token = loginResponse.data.data.token;
    console.log('\n📤 Testing protected endpoint with new user...');
    
    const membersResponse = await axios.get(`${API_BASE_URL}/api/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Members endpoint successful!');
    console.log('📄 Members response:', JSON.stringify(membersResponse.data, null, 2));

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

testIndividualGymCreation();
