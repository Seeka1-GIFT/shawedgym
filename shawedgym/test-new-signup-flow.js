const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com';

async function testNewSignupFlow() {
  console.log('🧪 Testing new signup flow with individual gym creation...\n');

  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser${Date.now()}@example.com`,
    password: 'password123',
    role: 'admin'
  };

  try {
    console.log('📤 Registering new user...');
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

    // Check if gym_id is unique (not 1)
    const gymId = response.data.data.user.gym_id;
    if (gymId === 1) {
      console.log('⚠️  Warning: User still got gym_id = 1 (might be fallback)');
    } else {
      console.log('🎉 Success: User got unique gym_id =', gymId);
    }

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

    // Check if members are filtered by gym_id
    const members = membersResponse.data.data.members;
    if (members.length === 0) {
      console.log('✅ Data isolation working: New user sees no members (empty gym)');
    } else {
      console.log('📊 Members found:', members.length);
      members.forEach(member => {
        console.log(`  - Member: ${member.first_name} ${member.last_name}, Gym ID: ${member.gym_id}`);
      });
    }

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

testNewSignupFlow();
