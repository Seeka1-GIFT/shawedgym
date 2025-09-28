const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com';

async function checkSubscriptionPlans() {
  console.log('🔍 Checking subscription plans...\n');

  try {
    // First, let's try to get subscription plans
    console.log('📤 Getting subscription plans...');
    const response = await axios.get(`${API_BASE_URL}/api/subscriptions/plans`, {
      timeout: 30000
    });

    console.log('✅ Subscription plans found:');
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error getting subscription plans:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Response:', error.response?.data);
    
    // Let's try the database setup endpoint
    console.log('\n🔧 Trying database setup...');
    try {
      const setupResponse = await axios.post(`${API_BASE_URL}/api/database/setup`, {}, {
        timeout: 30000
      });
      console.log('✅ Database setup response:', JSON.stringify(setupResponse.data, null, 2));
    } catch (setupError) {
      console.log('❌ Database setup failed:');
      console.log('📊 Status:', setupError.response?.status);
      console.log('📄 Response:', setupError.response?.data);
    }
  }
}

checkSubscriptionPlans();
