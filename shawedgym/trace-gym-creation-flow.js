const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function traceGymCreationFlow() {
  console.log('🔍 Tracing Gym Creation Data Flow...\n');

  try {
    // Step 1: Login first
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@shawedgym.com',
      password: 'password'
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Login successful!');
    const token = loginResponse.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Step 2: Test gym creation with sample data
    console.log('\n📝 Step 2: Creating a test gym...');
    const gymData = {
      name: 'Somali Fitness',
      owner_name: 'Mohamed',
      owner_email: 'Mohamed@gmail.com',
      phone: '+252616667766',
      address: 'Bakaro,muqadisho,somalia',
      subscription_plan: 'basic'
    };

    console.log('📤 Sending data to backend:', gymData);

    const createResponse = await axios.post(`${API_BASE_URL}/gyms`, gymData, {
      timeout: 30000,
      headers: { ...authHeaders, 'Content-Type': 'application/json' }
    });

    console.log('✅ Gym created successfully!');
    console.log('📥 Backend response:', createResponse.data);

    // Step 3: Verify gym was saved in database
    console.log('\n🔍 Step 3: Verifying gym in database...');
    const gymsResponse = await axios.get(`${API_BASE_URL}/gyms`, {
      timeout: 30000,
      headers: authHeaders
    });

    console.log('📊 All gyms in database:');
    gymsResponse.data.data.gyms.forEach((gym, index) => {
      console.log(`\nGym ${index + 1}:`);
      console.log(`  ID: ${gym.id}`);
      console.log(`  Name: ${gym.name}`);
      console.log(`  Owner: ${gym.owner_name} (${gym.owner_email})`);
      console.log(`  Phone: ${gym.phone || 'Not set'}`);
      console.log(`  Address: ${gym.address || 'Not set'}`);
      console.log(`  Plan: ${gym.subscription_plan}`);
      console.log(`  Created: ${gym.created_at}`);
    });

    console.log('\n🎉 Data Flow Complete!');
    console.log('\n📋 Summary of where data goes:');
    console.log('1. Frontend Form → formData state');
    console.log('2. GymContext.createGym() → API call');
    console.log('3. apiService.createGym() → POST /api/gyms');
    console.log('4. gymsController.createGym() → Database INSERT');
    console.log('5. Database → gyms table');
    console.log('6. Response → Frontend state update');

  } catch (error) {
    console.error('❌ Trace failed:', error.response?.data || error.message);
  }
}

traceGymCreationFlow();
