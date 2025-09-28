const axios = require('axios');
const bcrypt = require('bcryptjs');

const API_BASE_URL = 'https://shawedgym.onrender.com/api';

async function debugAdminLogin() {
  console.log('🔍 Debugging Admin Login Issue...\n');

  try {
    // Step 1: Test database connection and check admin user
    console.log('📊 Step 1: Checking database setup...');
    const setupResponse = await axios.post(`${API_BASE_URL}/database/setup`, {}, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Database setup response:', setupResponse.data);

    // Step 2: Test login with different credentials
    console.log('\n🔐 Step 2: Testing login with admin credentials...');
    
    const testCredentials = [
      { email: 'admin@shawedgym.com', password: 'admin123' },
      { email: 'admin@shawedgym.com', password: 'Admin123!' },
      { email: 'admin@shawedgym.com', password: 'admin' },
      { email: 'admin@shawedgym.com', password: 'password' }
    ];

    for (const cred of testCredentials) {
      try {
        console.log(`\nTesting: ${cred.email} / ${cred.password}`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, cred, {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ Login successful!', {
          status: loginResponse.status,
          success: loginResponse.data.success,
          hasToken: !!loginResponse.data.data?.token,
          user: loginResponse.data.data?.user
        });
        break; // Stop on first successful login
      } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
      }
    }

    // Step 3: Test registration to see if it works
    console.log('\n📝 Step 3: Testing user registration...');
    try {
      const registerData = {
        email: 'test@shawedgym.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      };
      
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Registration successful!', registerResponse.data);

      // Test login with newly created user
      console.log('\n🔐 Step 4: Testing login with newly created user...');
      const newUserLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@shawedgym.com',
        password: 'test123'
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ New user login successful!', {
        status: newUserLogin.status,
        success: newUserLogin.data.success,
        hasToken: !!newUserLogin.data.data?.token,
        user: newUserLogin.data.data?.user
      });

    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    }

    // Step 5: Test password hashing
    console.log('\n🔒 Step 5: Testing password hashing...');
    const testPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log('Generated hash for "admin123":', hashedPassword);
    
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Password comparison test:', isValid ? '✅ Valid' : '❌ Invalid');

    // Step 6: Check if we can create admin user via registration
    console.log('\n👑 Step 6: Testing admin user creation via registration...');
    try {
      const adminRegisterData = {
        email: 'admin2@shawedgym.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      };
      
      const adminRegisterResponse = await axios.post(`${API_BASE_URL}/auth/register`, adminRegisterData, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Admin registration successful!', adminRegisterResponse.data);

      // Test login with newly created admin
      console.log('\n🔐 Step 7: Testing login with newly created admin...');
      const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin2@shawedgym.com',
        password: 'admin123'
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ New admin login successful!', {
        status: adminLogin.status,
        success: adminLogin.data.success,
        hasToken: !!adminLogin.data.data?.token,
        user: adminLogin.data.data?.user
      });

    } catch (error) {
      console.log('❌ Admin registration failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugAdminLogin();
