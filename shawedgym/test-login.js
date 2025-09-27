// Test login endpoint to debug the server error
const https = require('https');

const testLogin = async () => {
  const loginData = JSON.stringify({
    email: 'admin@shawedgym.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log('🔍 Testing login endpoint...');
  console.log('URL:', `https://${options.hostname}${options.path}`);
  console.log('Data:', loginData);

  const req = https.request(options, (res) => {
    console.log('📡 Response status:', res.statusCode);
    console.log('📡 Response headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response body:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(loginData);
  req.end();
};

// Test health endpoint first
const testHealth = async () => {
  const options = {
    hostname: 'shawedgym.onrender.com',
    port: 443,
    path: '/api/health',
    method: 'GET'
  };

  console.log('🔍 Testing health endpoint...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log('📡 Health status:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Health response:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw health response:', data);
      }
      
      // After health check, test login
      setTimeout(testLogin, 1000);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Health request error:', error.message);
  });

  req.end();
};

// Start with health check
testHealth();
