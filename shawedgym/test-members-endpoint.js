// Test members endpoint to see the exact error
const https = require('https');

const testMembersEndpoint = async () => {
  // First, let's login to get a token
  const loginData = JSON.stringify({
    email: 'admin@shawedgym.com',
    password: 'admin123'
  });

  console.log('🔍 Step 1: Testing login...');
  
  const loginOptions = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginPromise = new Promise((resolve, reject) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse login response: ' + data));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(loginData);
    req.end();
  });

  try {
    const loginResponse = await loginPromise;
    console.log('✅ Login successful:', {
      success: loginResponse.success,
      hasToken: !!loginResponse.data?.token,
      hasGymId: !!loginResponse.data?.gym_id,
      user: loginResponse.data?.user
    });

    if (!loginResponse.success || !loginResponse.data?.token) {
      console.log('❌ Login failed, cannot test members endpoint');
      return;
    }

    const token = loginResponse.data.token;
    console.log('🔍 Step 2: Testing members endpoint with token...');

    // Now test members endpoint
    const membersOptions = {
      hostname: 'shawedgym.onrender.com',
      port: 443,
      path: '/api/members?limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const membersPromise = new Promise((resolve, reject) => {
      const req = https.request(membersOptions, (res) => {
        console.log('📡 Members endpoint status:', res.statusCode);
        console.log('📡 Members endpoint headers:', res.headers);

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });

    const membersResponse = await membersPromise;
    console.log('📄 Members endpoint response:');
    console.log('Status:', membersResponse.status);
    console.log('Data:', JSON.stringify(membersResponse.data, null, 2));

    if (membersResponse.status === 500) {
      console.log('❌ Members endpoint returned 500 error');
      console.log('Error details:', membersResponse.data);
    } else if (membersResponse.status === 200) {
      console.log('✅ Members endpoint working correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test payments endpoint too
const testPaymentsEndpoint = async () => {
  // First, let's login to get a token
  const loginData = JSON.stringify({
    email: 'admin@shawedgym.com',
    password: 'admin123'
  });

  console.log('\n🔍 Step 3: Testing payments endpoint...');
  
  const loginOptions = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginPromise = new Promise((resolve, reject) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse login response: ' + data));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(loginData);
    req.end();
  });

  try {
    const loginResponse = await loginPromise;
    
    if (!loginResponse.success || !loginResponse.data?.token) {
      console.log('❌ Login failed, cannot test payments endpoint');
      return;
    }

    const token = loginResponse.data.token;

    // Now test payments endpoint
    const paymentsOptions = {
      hostname: 'shawedgym.onrender.com',
      port: 443,
      path: '/api/payments?limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const paymentsPromise = new Promise((resolve, reject) => {
      const req = https.request(paymentsOptions, (res) => {
        console.log('📡 Payments endpoint status:', res.statusCode);

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });

    const paymentsResponse = await paymentsPromise;
    console.log('📄 Payments endpoint response:');
    console.log('Status:', paymentsResponse.status);
    console.log('Data:', JSON.stringify(paymentsResponse.data, null, 2));

    if (paymentsResponse.status === 500) {
      console.log('❌ Payments endpoint returned 500 error');
      console.log('Error details:', paymentsResponse.data);
    } else if (paymentsResponse.status === 200) {
      console.log('✅ Payments endpoint working correctly');
    }

  } catch (error) {
    console.error('❌ Payments test failed:', error.message);
  }
};

// Run both tests
testMembersEndpoint().then(() => {
  return testPaymentsEndpoint();
}).then(() => {
  console.log('\n🏁 All tests completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
