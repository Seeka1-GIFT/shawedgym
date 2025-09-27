// Debug server.js to check if routes are properly mounted
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging server.js...\n');

// Check if server.js exists
const serverPath = path.join(__dirname, 'backend', 'src', 'server.js');
console.log('📁 Server path:', serverPath);
console.log('📁 Server exists:', fs.existsSync(serverPath));

if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check for route mounting
  console.log('\n🔍 Checking route mounting...');
  const routeMounts = serverContent.match(/app\.use\('\/api\/[^']+',\s*[^;]+\);/g);
  if (routeMounts) {
    console.log('✅ Found route mounts:');
    routeMounts.forEach(mount => console.log('  ', mount.trim()));
  } else {
    console.log('❌ No route mounts found');
  }
  
  // Check for route imports
  console.log('\n🔍 Checking route imports...');
  const routeImports = serverContent.match(/const\s+\w+Routes\s+=\s+require\('\.\/routes\/[^']+'\);/g);
  if (routeImports) {
    console.log('✅ Found route imports:');
    routeImports.forEach(imp => console.log('  ', imp.trim()));
  } else {
    console.log('❌ No route imports found');
  }
  
  // Check for 404 handler
  console.log('\n🔍 Checking 404 handler...');
  const has404Handler = serverContent.includes('app.use(\'/api/*\'');
  console.log('404 handler exists:', has404Handler);
  
  // Check for health endpoint
  console.log('\n🔍 Checking health endpoint...');
  const hasHealthEndpoint = serverContent.includes('app.get(\'/api/health\'');
  console.log('Health endpoint exists:', hasHealthEndpoint);
  
  // Check for dashboard stats endpoint
  console.log('\n🔍 Checking dashboard stats endpoint...');
  const hasDashboardStats = serverContent.includes('app.get(\'/api/dashboard/stats\'');
  console.log('Dashboard stats endpoint exists:', hasDashboardStats);
}

// Check if route files exist
console.log('\n🔍 Checking route files...');
const routesDir = path.join(__dirname, 'backend', 'src', 'routes');
console.log('📁 Routes directory:', routesDir);
console.log('📁 Routes directory exists:', fs.existsSync(routesDir));

if (fs.existsSync(routesDir)) {
  const routeFiles = fs.readdirSync(routesDir);
  console.log('📁 Route files:', routeFiles);
  
  // Check specific route files
  const importantRoutes = ['auth.js', 'members.js', 'payments.js', 'gyms.js', 'multiTenantSetup.js'];
  importantRoutes.forEach(routeFile => {
    const routePath = path.join(routesDir, routeFile);
    console.log(`📁 ${routeFile} exists:`, fs.existsSync(routePath));
  });
}

// Check if controller files exist
console.log('\n🔍 Checking controller files...');
const controllersDir = path.join(__dirname, 'backend', 'src', 'controllers');
console.log('📁 Controllers directory:', controllersDir);
console.log('📁 Controllers directory exists:', fs.existsSync(controllersDir));

if (fs.existsSync(controllersDir)) {
  const controllerFiles = fs.readdirSync(controllersDir);
  console.log('📁 Controller files:', controllerFiles);
  
  // Check specific controller files
  const importantControllers = ['authController.js', 'membersController.js', 'paymentsController.js', 'gymsController.js'];
  importantControllers.forEach(controllerFile => {
    const controllerPath = path.join(controllersDir, controllerFile);
    console.log(`📁 ${controllerFile} exists:`, fs.existsSync(controllerPath));
  });
}

console.log('\n🎉 Debug completed!');
