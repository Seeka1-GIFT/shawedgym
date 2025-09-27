// Debug login response to see what's actually being returned
const https = require('https');

const debugLogin = async () => {
  const loginData = JSON.stringify({
    email: 'admin@shawedgym.com',
    password: 'admin123'
  });

  console.log('🔍 Testing login endpoint...');
  console.log('Request data:', loginData);
  
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

  const req = https.request(options, (res) => {
    console.log('📡 Response status:', res.statusCode);
    console.log('📡 Response headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Raw response body:');
      console.log(data);
      
      console.log('\n📄 Parsed response:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('\n✅ Login successful!');
          console.log('Token:', parsed.data?.token ? 'Present' : 'Missing');
          console.log('Gym ID:', parsed.data?.gym_id);
          console.log('User:', parsed.data?.user);
        } else {
          console.log('\n❌ Login failed');
          console.log('Error:', parsed.error);
          console.log('Message:', parsed.message);
        }
      } catch (e) {
        console.log('❌ Failed to parse JSON response');
        console.log('Error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(loginData);
  req.end();
};

debugLogin();
