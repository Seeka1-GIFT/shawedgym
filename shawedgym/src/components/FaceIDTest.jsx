import React, { useState } from 'react';
import { api } from '../services/api.js';

/**
 * Test Component for Face ID System and Device Integration
 * This component tests the automatic image saving, face ID generation, and device integration
 */
const FaceIDTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceTestResult, setDeviceTestResult] = useState(null);

  const testFaceIDSystem = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test 1: Generate a test face ID
      const testFaceId = `FACE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Test 2: Create a test member with face ID
      const testMember = {
        firstName: 'Test',
        lastName: 'Member',
        phone: '+252-61-999-9999',
        planId: 1, // Assuming plan ID 1 exists
        photo_url: 'https://via.placeholder.com/300x300/0066CC/FFFFFF?text=Test+Photo',
        face_id: testFaceId,
        registered_at: new Date().toISOString().slice(0, 10),
        external_person_id: 'TEST_DEVICE_001'
      };

      // Test 3: Submit to API
      const response = await api.post('/members', testMember);
      
      if (response.data.success) {
        setTestResult({
          success: true,
          message: 'Face ID system working correctly!',
          details: {
            faceId: testFaceId,
            memberId: response.data.data?.id,
            photoUrl: testMember.photo_url
          }
        });
      } else {
        setTestResult({
          success: false,
          message: 'API returned error',
          details: response.data
        });
      }

    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testDeviceIntegration = async () => {
    setLoading(true);
    setDeviceTestResult(null);

    try {
      const deviceTests = [];

      // Test 1: Device Health Check
      try {
        const healthResponse = await api.get('/device/health?device_id=Face1');
        deviceTests.push({
          name: 'Device Health Check',
          success: healthResponse.data.success,
          result: healthResponse.data
        });
      } catch (error) {
        deviceTests.push({
          name: 'Device Health Check',
          success: false,
          error: error.message
        });
      }

      // Test 2: Face Recognition
      try {
        const faceResponse = await api.post('/device/face-recognition', {
          face_image: 'test_base64_image',
          device_id: 'Face1',
          face_id: 'FACE_94_1703123456'
        });
        deviceTests.push({
          name: 'Face Recognition',
          success: faceResponse.data.success,
          result: faceResponse.data
        });
      } catch (error) {
        deviceTests.push({
          name: 'Face Recognition',
          success: false,
          error: error.message
        });
      }

      // Test 3: Member Verification
      try {
        const verifyResponse = await api.post('/device/verify-member', {
          face_id: 'FACE_94_1703123456',
          member_id: 94
        });
        deviceTests.push({
          name: 'Member Verification',
          success: verifyResponse.data.success,
          result: verifyResponse.data
        });
      } catch (error) {
        deviceTests.push({
          name: 'Member Verification',
          success: false,
          error: error.message
        });
      }

      // Test 4: Check-in
      try {
        const checkInResponse = await api.post('/device/check-in', {
          member_id: 94,
          device_id: 'Face1',
          check_in_time: new Date().toISOString()
        });
        deviceTests.push({
          name: 'Check-in Recording',
          success: checkInResponse.data.success,
          result: checkInResponse.data
        });
      } catch (error) {
        deviceTests.push({
          name: 'Check-in Recording',
          success: false,
          error: error.message
        });
      }

      // Test 5: Get Member
      try {
        const memberResponse = await api.get('/device/member/FACE_94_1703123456');
        deviceTests.push({
          name: 'Get Member',
          success: memberResponse.data.success,
          result: memberResponse.data
        });
      } catch (error) {
        deviceTests.push({
          name: 'Get Member',
          success: false,
          error: error.message
        });
      }

      // Test 6: Get Attendance
      try {
        const attendanceResponse = await api.get('/device/attendance?device_id=Face1');
        deviceTests.push({
          name: 'Get Attendance Records',
          success: attendanceResponse.data.success,
          result: attendanceResponse.data
        });
      } catch (error) {
        deviceTests.push({
          name: 'Get Attendance Records',
          success: false,
          error: error.message
        });
      }

      const passedTests = deviceTests.filter(test => test.success).length;
      const totalTests = deviceTests.length;

      setDeviceTestResult({
        success: passedTests === totalTests,
        message: `Device Integration Tests: ${passedTests}/${totalTests} passed`,
        tests: deviceTests,
        summary: {
          passed: passedTests,
          total: totalTests,
          percentage: Math.round((passedTests / totalTests) * 100)
        }
      });

    } catch (error) {
      setDeviceTestResult({
        success: false,
        message: 'Device integration test failed',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Face ID System & Device Integration Tests
      </h3>
      
      {/* Face ID System Test */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
          Face ID System Test
        </h4>
        <button
          onClick={testFaceIDSystem}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Testing...' : 'Test Face ID System'}
        </button>

        {testResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700' 
              : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
          }`}>
            <h5 className={`font-semibold ${
              testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}>
              {testResult.success ? '✅ Test Passed' : '❌ Test Failed'}
            </h5>
            <p className={`mt-2 ${
              testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {testResult.message}
            </p>
            
            {testResult.details && (
              <div className="mt-3">
                <h6 className="font-medium text-gray-700 dark:text-gray-300">Details:</h6>
                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Device Integration Test */}
      <div>
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
          Device Integration Test
        </h4>
        <button
          onClick={testDeviceIntegration}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Testing...' : 'Test Device Integration'}
        </button>

        {deviceTestResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            deviceTestResult.success 
              ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700' 
              : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
          }`}>
            <h5 className={`font-semibold ${
              deviceTestResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}>
              {deviceTestResult.success ? '✅ All Tests Passed' : '⚠️ Some Tests Failed'}
            </h5>
            <p className={`mt-2 ${
              deviceTestResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {deviceTestResult.message}
            </p>
            
            {deviceTestResult.summary && (
              <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Test Summary:</h6>
                <p className="text-sm">
                  <span className="font-medium">Passed:</span> {deviceTestResult.summary.passed}/{deviceTestResult.summary.total} 
                  <span className="ml-2 font-medium">Success Rate:</span> {deviceTestResult.summary.percentage}%
                </p>
              </div>
            )}

            {deviceTestResult.tests && (
              <div className="mt-4">
                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Individual Test Results:</h6>
                <div className="space-y-2">
                  {deviceTestResult.tests.map((test, index) => (
                    <div key={index} className={`p-2 rounded text-sm ${
                      test.success ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300'
                    }`}>
                      <span className="font-medium">{test.success ? '✅' : '❌'}</span> {test.name}
                      {test.error && <span className="ml-2 text-xs">({test.error})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Information */}
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>What these tests do:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Face ID System:</strong> Tests member creation with automatic face ID generation</li>
          <li><strong>Device Health:</strong> Verifies device can connect to backend</li>
          <li><strong>Face Recognition:</strong> Tests face recognition API endpoint</li>
          <li><strong>Member Verification:</strong> Tests member verification by face_id</li>
          <li><strong>Check-in Recording:</strong> Tests attendance recording functionality</li>
          <li><strong>Get Member:</strong> Tests retrieving member data by face_id</li>
          <li><strong>Get Attendance:</strong> Tests retrieving attendance records</li>
        </ul>
      </div>
    </div>
  );
};

export default FaceIDTest;
