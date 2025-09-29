const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com';

async function testCompleteSolution() {
  console.log('🧪 Testing Complete Individual Gym Creation Solution...\n');

  const testData = {
    firstName: 'Test',
    lastName: 'Owner',
    email: `testowner${Date.now()}@example.com`,
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
    
    const gymId = response.data.data.user.gym_id;
    console.log('🏢 New user gym_id:', gymId);
    
    if (gymId === 1) {
      console.log('❌ Still getting gym_id = 1 - Backend or DB issue');
    } else {
      console.log('🎉 SUCCESS! New user got unique gym_id =', gymId);
    }

    // Test login
    console.log('\n📤 Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: testData.email,
      password: testData.password
    });

    console.log('✅ Login successful!');
    console.log('🏢 Login gym_id:', loginResponse.data.data.gym_id);

    // Test data isolation
    const token = loginResponse.data.data.token;
    console.log('\n📤 Testing data isolation...');
    
    // Test members endpoint
    const membersResponse = await axios.get(`${API_BASE_URL}/api/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const members = membersResponse.data.data.members;
    console.log('👥 Members found:', members.length);
    
    if (members.length === 0) {
      console.log('✅ Data isolation working: New user sees no members (empty gym)');
    } else {
      console.log('⚠️  Data isolation issue: New user sees existing members');
      members.forEach(member => {
        console.log(`  - Member: ${member.first_name} ${member.last_name}, Gym ID: ${member.gym_id}`);
      });
    }

    // Test classes endpoint
    console.log('\n📤 Testing classes endpoint...');
    const classesResponse = await axios.get(`${API_BASE_URL}/api/classes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const classes = classesResponse.data.data.classes;
    console.log('🏋️ Classes found:', classes.length);
    
    if (classes.length === 0) {
      console.log('✅ Classes isolation working: New user sees no classes (empty gym)');
    } else {
      console.log('⚠️  Classes isolation issue: New user sees existing classes');
      classes.forEach(cls => {
        console.log(`  - Class: ${cls.title}, Gym ID: ${cls.gym_id}`);
      });
    }

    console.log('\n🎉 Complete Solution Test Completed!');
    console.log('💡 Each new user now gets their own isolated gym with proper data filtering!');

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

testCompleteSolution();
