const axios = require('axios');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function debugAndFixAll() {
  console.log('🔍 Debugging and Fixing All Issues...\n');

  try {
    // Step 1: Test both admin accounts
    console.log('🔐 Step 1: Testing both admin accounts...');
    
    const adminAccounts = [
      { email: 'admin@shawedgym.com', password: 'admin123', name: 'Original Admin' },
      { email: 'admin@shawedgym.com', password: 'password', name: 'Original Admin (old password)' },
      { email: 'admin2@shawedgym.com', password: 'admin123', name: 'New Admin' }
    ];

    let workingAdmin = null;
    
    for (const admin of adminAccounts) {
      try {
        console.log(`\nTesting: ${admin.name} (${admin.email} / ${admin.password})`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: admin.email,
          password: admin.password
        }, {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        });

        console.log('✅ Login successful!', {
          status: loginResponse.status,
          success: loginResponse.data.success,
          hasToken: !!loginResponse.data.data?.token,
          user: loginResponse.data.data?.user
        });

        workingAdmin = {
          ...admin,
          token: loginResponse.data.data.token,
          user: loginResponse.data.data.user
        };
        break;
      } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
      }
    }

    if (!workingAdmin) {
      console.log('\n❌ No admin account is working. Need to fix database.');
      return;
    }

    console.log(`\n✅ Using working admin: ${workingAdmin.name}`);
    const authHeaders = { 'Authorization': `Bearer ${workingAdmin.token}` };

    // Step 2: Test protected endpoints
    console.log('\n📋 Step 2: Testing protected endpoints...');

    // Test members endpoint
    console.log('\n🔍 Testing Members endpoint...');
    try {
      const membersResponse = await axios.get(`${API_BASE_URL}/members`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Members endpoint working');
      console.log('Members data:', {
        success: membersResponse.data.success,
        count: membersResponse.data.data?.members?.length || 0,
        pagination: membersResponse.data.data?.pagination
      });
    } catch (error) {
      console.log('❌ Members endpoint failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }

    // Test payments endpoint
    console.log('\n🔍 Testing Payments endpoint...');
    try {
      const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Payments endpoint working');
      console.log('Payments data:', {
        success: paymentsResponse.data.success,
        count: paymentsResponse.data.data?.payments?.length || 0,
        pagination: paymentsResponse.data.data?.pagination
      });
    } catch (error) {
      console.log('❌ Payments endpoint failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }

    // Test dashboard stats
    console.log('\n🔍 Testing Dashboard stats...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Dashboard stats working');
      console.log('Stats data:', statsResponse.data);
    } catch (error) {
      console.log('❌ Dashboard stats failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }

    // Test users endpoint (admin only)
    console.log('\n🔍 Testing Users endpoint...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
        timeout: 30000,
        headers: authHeaders
      });
      console.log('✅ Users endpoint working');
      console.log('Users data:', {
        success: usersResponse.data.success,
        count: usersResponse.data.data?.users?.length || 0
      });
    } catch (error) {
      console.log('❌ Users endpoint failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }

    // Step 3: Test database setup
    console.log('\n📊 Step 3: Testing database setup...');
    try {
      const setupResponse = await axios.post(`${API_BASE_URL}/database/setup`, {}, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Database setup working:', setupResponse.data);
    } catch (error) {
      console.log('❌ Database setup failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Debug completed!');
    console.log('\n📝 Summary:');
    console.log(`- Working admin: ${workingAdmin.name} (${workingAdmin.email})`);
    console.log('- Check the results above to see which endpoints are failing');
    console.log('- If Members/Payments are failing, the issue is in the controllers');
    console.log('- If all endpoints fail, the issue is in authentication middleware');

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugAndFixAll();
