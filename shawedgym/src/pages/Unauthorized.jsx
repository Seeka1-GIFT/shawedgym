import React from 'react';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">You do not have permission to view this page.</p>
    </div>
  );
};

export default Unauthorized;


