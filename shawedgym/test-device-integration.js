/**
 * Device Integration Test Script
 * Tests all device endpoints for face recognition and attendance
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Test data
const testData = {
  device_id: 'Face1',
  face_id: 'FACE_94_1703123456', // Test face ID
  member_id: 94,
  face_image: 'base64_test_image_data'
};

// Test functions
async function testDeviceHealth() {
  console.log('\n🏥 Testing Device Health Check...');
  try {
    const response = await fetch(`${API_BASE_URL}/device/health?device_id=${testData.device_id}`);
    const result = await response.json();
    
    console.log('✅ Health Check Result:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testFaceRecognition() {
  console.log('\n🔍 Testing Face Recognition...');
  try {
    const response = await fetch(`${API_BASE_URL}/device/face-recognition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': testData.device_id
      },
      body: JSON.stringify({
        face_image: testData.face_image,
        device_id: testData.device_id,
        face_id: testData.face_id
      })
    });
    
    const result = await response.json();
    console.log('✅ Face Recognition Result:', result);
    return result;
  } catch (error) {
    console.error('❌ Face Recognition Failed:', error.message);
    return null;
  }
}

async function testMemberVerification() {
  console.log('\n🔍 Testing Member Verification...');
  try {
    const response = await fetch(`${API_BASE_URL}/device/verify-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': testData.device_id
      },
      body: JSON.stringify({
        face_id: testData.face_id,
        member_id: testData.member_id
      })
    });
    
    const result = await response.json();
    console.log('✅ Member Verification Result:', result);
    return result;
  } catch (error) {
    console.error('❌ Member Verification Failed:', error.message);
    return null;
  }
}

async function testCheckIn() {
  console.log('\n📝 Testing Check-in...');
  try {
    const response = await fetch(`${API_BASE_URL}/device/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': testData.device_id
      },
      body: JSON.stringify({
        member_id: testData.member_id,
        device_id: testData.device_id,
        check_in_time: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    console.log('✅ Check-in Result:', result);
    return result;
  } catch (error) {
    console.error('❌ Check-in Failed:', error.message);
    return null;
  }
}

async function testGetMember() {
  console.log('\n👤 Testing Get Member...');
  try {
    const response = await fetch(`${API_BASE_URL}/device/member/${testData.face_id}`);
    const result = await response.json();
    
    console.log('✅ Get Member Result:', result);
    return result;
  } catch (error) {
    console.error('❌ Get Member Failed:', error.message);
    return null;
  }
}

async function testGetAttendance() {
  console.log('\n📊 Testing Get Attendance...');
  try {
    const response = await fetch(`${API_BASE_URL}/device/attendance?device_id=${testData.device_id}`);
    const result = await response.json();
    
    console.log('✅ Get Attendance Result:', result);
    return result;
  } catch (error) {
    console.error('❌ Get Attendance Failed:', error.message);
    return null;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Device Integration Tests...');
  console.log('='.repeat(60));
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`🔧 Device ID: ${testData.device_id}`);
  console.log(`👤 Test Face ID: ${testData.face_id}`);
  console.log(`🆔 Test Member ID: ${testData.member_id}`);
  console.log('='.repeat(60));
  
  const results = {
    health: await testDeviceHealth(),
    faceRecognition: await testFaceRecognition(),
    memberVerification: await testMemberVerification(),
    checkIn: await testCheckIn(),
    getMember: await testGetMember(),
    attendance: await testGetAttendance()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('='.repeat(60));
  console.log(`🏥 Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔍 Face Recognition: ${results.faceRecognition?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔍 Member Verification: ${results.memberVerification?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📝 Check-in: ${results.checkIn?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`👤 Get Member: ${results.getMember?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📊 Get Attendance: ${results.attendance?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(r => r?.success !== false).length;
  const totalTests = Object.keys(results).length;
  
  console.log('='.repeat(60));
  console.log(`🎯 Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Device integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  return results;
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runAllTests().catch(console.error);
} else {
  // Browser environment
  window.runDeviceTests = runAllTests;
}

module.exports = {
  runAllTests,
  testDeviceHealth,
  testFaceRecognition,
  testMemberVerification,
  testCheckIn,
  testGetMember,
  testGetAttendance
};
