// Test API connection
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login endpoint
    const loginData = {
      email: 'admin@shawedgym.com',
      password: 'admin123'
    };
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
    console.log('✅ Login test:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
}

testAPI();





