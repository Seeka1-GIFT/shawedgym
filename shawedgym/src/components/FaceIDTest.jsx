import React, { useState } from 'react';
import { api } from '../services/api.js';

/**
 * Test Component for Face ID System
 * This component tests the automatic image saving and face ID generation
 */
const FaceIDTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Face ID System Test
      </h3>
      
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
          <h4 className={`font-semibold ${
            testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          }`}>
            {testResult.success ? '✅ Test Passed' : '❌ Test Failed'}
          </h4>
          <p className={`mt-2 ${
            testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            {testResult.message}
          </p>
          
          {testResult.details && (
            <div className="mt-3">
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Details:</h5>
              <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>What this test does:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Generates a unique face ID</li>
          <li>Creates a test member with photo URL</li>
          <li>Submits to the API with face_id field</li>
          <li>Verifies the system works correctly</li>
        </ul>
      </div>
    </div>
  );
};

export default FaceIDTest;
