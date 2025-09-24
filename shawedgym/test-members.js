// Test Members API
const axios = require('axios');

async function testMembersAPI() {
  try {
    console.log('Testing Members API...');
    
    // Test members endpoint
    const membersResponse = await axios.get('http://localhost:5000/api/members', {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail, but we want to see the error
      }
    });
    console.log('✅ Members data:', membersResponse.data);
    
  } catch (error) {
    console.log('❌ Members API Error:', error.response?.status, error.response?.data?.message || error.message);
    
    // Try without auth to see if endpoint exists
    try {
      const response = await axios.get('http://localhost:5000/api/members');
      console.log('Without auth - should get 401:', response.status);
    } catch (authError) {
      console.log('Expected auth error:', authError.response?.status, authError.response?.data?.message);
    }
  }
}

testMembersAPI();





