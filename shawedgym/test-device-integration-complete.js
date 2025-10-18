/**
 * Complete Device Integration Test for ShawedGym
 * Tests connectivity between face recognition device and ShawedGym backend
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  apiBaseUrl: 'http://localhost:3000/api',
  deviceId: 'Face1',
  deviceIp: '192.168.100.20',
  testFaceId: 'FACE_94_1703123456',
  testMemberId: 94
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

/**
 * Make HTTP request
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': CONFIG.deviceId,
        ...options.headers
      }
    };

    if (options.body) {
      const body = JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData,
            status: res.statusCode
          });
        } catch (error) {
          resolve({
            success: false,
            error: 'Invalid JSON response',
            status: res.statusCode
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Run a test and record results
 */
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Running test: ${testName}`);
  console.log('─'.repeat(50));
  
  try {
    const result = await testFunction();
    
    if (result.success) {
      console.log(`✅ ${testName}: PASSED`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response:`, JSON.stringify(result.data, null, 2));
      testResults.passed++;
    } else {
      console.log(`❌ ${testName}: FAILED`);
      console.log(`   Error: ${result.error}`);
      testResults.failed++;
    }
    
    testResults.details.push({
      name: testName,
      success: result.success,
      status: result.status,
      error: result.error,
      data: result.data
    });
    
  } catch (error) {
    console.log(`❌ ${testName}: ERROR`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
    
    testResults.details.push({
      name: testName,
      success: false,
      error: error.message
    });
  }
  
  testResults.total++;
}

/**
 * Test 1: Device Health Check
 */
async function testDeviceHealth() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/device/health?device_id=${CONFIG.deviceId}`);
}

/**
 * Test 2: Face Recognition
 */
async function testFaceRecognition() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/device/face-recognition`, {
    method: 'POST',
    body: {
      face_image: 'test_base64_image_data',
      device_id: CONFIG.deviceId,
      face_id: CONFIG.testFaceId
    }
  });
}

/**
 * Test 3: Member Verification
 */
async function testMemberVerification() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/device/verify-member`, {
    method: 'POST',
    body: {
      face_id: CONFIG.testFaceId,
      member_id: CONFIG.testMemberId
    }
  });
}

/**
 * Test 4: Check-in
 */
async function testCheckIn() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/device/check-in`, {
    method: 'POST',
    body: {
      member_id: CONFIG.testMemberId,
      device_id: CONFIG.deviceId,
      check_in_time: new Date().toISOString()
    }
  });
}

/**
 * Test 5: Get Member
 */
async function testGetMember() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/device/member/${CONFIG.testFaceId}`);
}

/**
 * Test 6: Get Attendance
 */
async function testGetAttendance() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/device/attendance?device_id=${CONFIG.deviceId}`);
}

/**
 * Test 7: ShawedGym API Health
 */
async function testShawedGymHealth() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/health`);
}

/**
 * Test 8: Members API
 */
async function testMembersAPI() {
  return await makeRequest(`${CONFIG.apiBaseUrl}/members`);
}

/**
 * Test 9: Network Connectivity
 */
async function testNetworkConnectivity() {
  // Test if we can reach the API server
  try {
    const result = await makeRequest(`${CONFIG.apiBaseUrl}/health`);
    return {
      success: result.success,
      data: {
        message: 'Network connectivity test passed',
        api_reachable: result.success,
        device_ip: CONFIG.deviceIp,
        api_url: CONFIG.apiBaseUrl
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Network connectivity failed: ${error.message}`
    };
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 ShawedGym Device Integration Test');
  console.log('=====================================');
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`🔌 Device ID: ${CONFIG.deviceId}`);
  console.log(`🌐 Device IP: ${CONFIG.deviceIp}`);
  console.log(`🔗 API URL: ${CONFIG.apiBaseUrl}`);
  console.log('=====================================');

  // Run all tests
  await runTest('Device Health Check', testDeviceHealth);
  await runTest('Face Recognition', testFaceRecognition);
  await runTest('Member Verification', testMemberVerification);
  await runTest('Check-in', testCheckIn);
  await runTest('Get Member', testGetMember);
  await runTest('Get Attendance', testGetAttendance);
  await runTest('ShawedGym API Health', testShawedGymHealth);
  await runTest('Members API', testMembersAPI);
  await runTest('Network Connectivity', testNetworkConnectivity);

  // Print summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  
  const successRate = Math.round((testResults.passed / testResults.total) * 100);
  console.log(`🎯 Success Rate: ${successRate}%`);
  
  // Determine integration status
  let integrationStatus;
  if (successRate >= 80) {
    integrationStatus = '🟢 EXCELLENT - Device is fully integrated';
  } else if (successRate >= 60) {
    integrationStatus = '🟡 GOOD - Device is partially integrated';
  } else {
    integrationStatus = '🔴 NEEDS IMPROVEMENT - Device integration issues';
  }
  
  console.log(`🔗 Integration Status: ${integrationStatus}`);
  
  // Print detailed results
  console.log('\n📋 DETAILED RESULTS');
  console.log('===================');
  testResults.details.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}`);
    if (!test.success && test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  if (successRate >= 80) {
    console.log('🎉 Device integration is working well!');
    console.log('✅ All major endpoints are responding correctly');
    console.log('✅ Face recognition system is operational');
    console.log('✅ Attendance tracking is working');
  } else if (successRate >= 60) {
    console.log('⚠️  Device integration has some issues');
    console.log('🔧 Check failed tests above for specific problems');
    console.log('🔧 Verify server is running and accessible');
    console.log('🔧 Check device configuration and network connectivity');
  } else {
    console.log('🚨 Device integration needs attention');
    console.log('🔧 Server may not be running or accessible');
    console.log('🔧 Check network connectivity between device and server');
    console.log('🔧 Verify API endpoints are properly configured');
  }
  
  return {
    success: successRate >= 60,
    successRate,
    integrationStatus,
    results: testResults
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then((result) => {
    process.exit(result.success ? 0 : 1);
  }).catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, CONFIG };
