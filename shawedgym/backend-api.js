/**
 * ShawedGym Backend API Server
 * Simple API server for frontend connection
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { readFileSync } = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());

// Load dummy data from frontend
let dummyData = {};
try {
  const dummyDataPath = path.join(__dirname, 'src', 'data', 'dummy.js');
  const dummyContent = readFileSync(dummyDataPath, 'utf8');
  
  // Extract data arrays using regex
  const membersMatch = dummyContent.match(/export const members = (\[[\s\S]*?\]);/);
  const paymentsMatch = dummyContent.match(/export const payments = (\[[\s\S]*?\]);/);
  const classesMatch = dummyContent.match(/export const classes = (\[[\s\S]*?\]);/);
  const plansMatch = dummyContent.match(/export const plans = (\[[\s\S]*?\]);/);
  
  if (membersMatch) dummyData.members = eval(membersMatch[1]);
  if (paymentsMatch) dummyData.payments = eval(paymentsMatch[1]);
  if (classesMatch) dummyData.classes = eval(classesMatch[1]);
  if (plansMatch) dummyData.plans = eval(plansMatch[1]);
  
  console.log('✅ Frontend dummy data loaded successfully');
  console.log(`📊 Loaded: ${dummyData.members?.length || 0} members, ${dummyData.payments?.length || 0} payments`);
} catch (error) {
  console.log('⚠️ Using fallback dummy data');
  
  // Fallback data
  dummyData = {
    members: [
      { id: 1, name: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '252-61-123456', membershipType: 'premium', status: 'Active' },
      { id: 2, name: 'Fatima Ali', email: 'fatima@example.com', phone: '252-61-789012', membershipType: 'basic', status: 'Active' },
      { id: 3, name: 'Mohamed Omar', email: 'mohamed@example.com', phone: '252-61-345678', membershipType: 'vip', status: 'Active' }
    ],
    payments: [
      { id: 1, memberId: 1, amount: 75, method: 'card', status: 'completed', date: '2024-01-15', receipt: 'PAY001' },
      { id: 2, memberId: 2, amount: 50, method: 'cash', status: 'completed', date: '2024-01-14', receipt: 'PAY002' },
      { id: 3, memberId: 3, amount: 120, method: 'transfer', status: 'pending', date: '2024-01-13', receipt: 'PAY003' }
    ],
    classes: [
      { id: 1, title: 'Morning Yoga', schedule: 'Mon, Wed, Fri - 7:00 AM', trainer: 'Sarah Johnson', capacity: 20, enrolled: 15 },
      { id: 2, title: 'HIIT Training', schedule: 'Tue, Thu - 6:00 PM', trainer: 'Mike Wilson', capacity: 15, enrolled: 12 },
      { id: 3, title: 'Evening Pilates', schedule: 'Mon, Wed - 7:00 PM', trainer: 'Lisa Chen', capacity: 12, enrolled: 8 }
    ],
    plans: [
      { id: 1, name: 'Basic Monthly', price: 50, duration: '1 month', features: ['Gym access', 'Locker room'] },
      { id: 2, name: 'Premium Monthly', price: 75, duration: '1 month', features: ['Gym access', 'Group classes'] },
      { id: 3, name: 'VIP Monthly', price: 120, duration: '1 month', features: ['All access', 'Personal trainer'] }
    ]
  };
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ShawedGym Backend API Running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    type: 'Backend API Server',
    port: PORT,
    cors: 'http://localhost:5173',
    dataLoaded: {
      members: dummyData.members?.length || 0,
      payments: dummyData.payments?.length || 0,
      classes: dummyData.classes?.length || 0,
      plans: dummyData.plans?.length || 0
    }
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const totalRevenue = dummyData.payments
    ?.filter(p => p.status === 'completed')
    ?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const stats = {
    totalMembers: dummyData.members?.length || 0,
    activeMembers: dummyData.members?.filter(m => m.status === 'Active')?.length || 0,
    checkedInMembers: Math.floor(Math.random() * 15) + 5,
    totalRevenue: totalRevenue,
    monthlyRevenue: Math.floor(totalRevenue * 0.3),
    totalClasses: dummyData.classes?.length || 0,
    activeEquipment: 25,
    todayAttendance: Math.floor(Math.random() * 30) + 20
  };
  
  console.log('📊 Dashboard stats requested:', stats);
  
  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
});

// Recent activities
app.get('/api/dashboard/recent-activities', (req, res) => {
  const activities = [
    {
      id: 1,
      type: 'checkin',
      description: 'Ahmed Hassan checked in for workout',
      timestamp: new Date(Date.now() - 5 * 60000),
      member: { firstName: 'Ahmed', lastName: 'Hassan' }
    },
    {
      id: 2,
      type: 'payment',
      description: 'Payment of $75 received from Fatima Ali',
      timestamp: new Date(Date.now() - 15 * 60000),
      amount: 75,
      member: { firstName: 'Fatima', lastName: 'Ali' }
    },
    {
      id: 3,
      type: 'booking',
      description: 'New booking for HIIT Training class',
      timestamp: new Date(Date.now() - 30 * 60000),
      member: { firstName: 'Mohamed', lastName: 'Omar' }
    },
    {
      id: 4,
      type: 'equipment',
      description: 'Treadmill #3 maintenance completed',
      timestamp: new Date(Date.now() - 45 * 60000),
      member: { firstName: 'System', lastName: 'Admin' }
    }
  ];
  
  res.json({
    success: true,
    data: { activities }
  });
});

// Members endpoints
app.get('/api/members', (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  let members = dummyData.members || [];
  
  // Search filter
  if (search) {
    members = members.filter(m => 
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
    );
  }
  
  // Status filter
  if (status) {
    members = members.filter(m => m.status === status);
  }
  
  console.log(`👥 Members requested: ${members.length} found`);
  
  res.json({
    success: true,
    data: {
      members: members,
      pagination: {
        total: members.length,
        page: parseInt(page),
        pages: Math.ceil(members.length / parseInt(limit))
      }
    }
  });
});

app.get('/api/members/stats/dashboard', (req, res) => {
  const stats = {
    totalMembers: dummyData.members?.length || 0,
    activeMembers: dummyData.members?.filter(m => m.status === 'Active')?.length || 0,
    checkedInMembers: Math.floor(Math.random() * 8) + 2,
    expiringMembers: 3,
    newMembersThisMonth: 5
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Payments endpoints
app.get('/api/payments', (req, res) => {
  const { page = 1, limit = 20, status, method } = req.query;
  let payments = dummyData.payments || [];
  
  // Status filter
  if (status) {
    payments = payments.filter(p => p.status === status);
  }
  
  // Method filter
  if (method) {
    payments = payments.filter(p => p.method === method);
  }
  
  console.log(`💰 Payments requested: ${payments.length} found`);
  
  res.json({
    success: true,
    data: {
      payments: payments,
      pagination: {
        total: payments.length,
        page: parseInt(page),
        pages: Math.ceil(payments.length / parseInt(limit))
      }
    }
  });
});

app.get('/api/payments/stats/revenue', (req, res) => {
  const totalRevenue = dummyData.payments
    ?.filter(p => p.status === 'completed')
    ?.reduce((sum, p) => sum + p.amount, 0) || 0;
  
  const stats = {
    totalRevenue,
    revenueByMethod: [
      { paymentMethod: 'card', total: Math.floor(totalRevenue * 0.6), count: 15 },
      { paymentMethod: 'cash', total: Math.floor(totalRevenue * 0.3), count: 8 },
      { paymentMethod: 'transfer', total: Math.floor(totalRevenue * 0.1), count: 3 }
    ],
    monthlyRevenue: [
      { month: 1, revenue: totalRevenue, transactions: dummyData.payments?.length || 0 }
    ]
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Classes endpoints
app.get('/api/classes', (req, res) => {
  console.log(`📅 Classes requested: ${dummyData.classes?.length || 0} classes`);
  
  res.json({
    success: true,
    data: { classes: dummyData.classes || [] }
  });
});

// Plans endpoints
app.get('/api/plans', (req, res) => {
  console.log(`📋 Plans requested: ${dummyData.plans?.length || 0} plans`);
  
  res.json({
    success: true,
    data: { plans: dummyData.plans || [] }
  });
});

// Equipment endpoint
app.get('/api/equipment', (req, res) => {
  const equipment = [
    { id: 1, name: 'Treadmill Pro X1', type: 'cardio', status: 'active', location: 'Zone A' },
    { id: 2, name: 'Olympic Barbell Set', type: 'strength', status: 'active', location: 'Zone B' },
    { id: 3, name: 'Leg Press Machine', type: 'strength', status: 'maintenance', location: 'Zone B' },
    { id: 4, name: 'Elliptical Trainer', type: 'cardio', status: 'active', location: 'Zone A' }
  ];
  
  res.json({
    success: true,
    data: { equipment }
  });
});

// Reports endpoints
app.get('/api/reports/financial', (req, res) => {
  const totalRevenue = dummyData.payments
    ?.filter(p => p.status === 'completed')
    ?.reduce((sum, p) => sum + p.amount, 0) || 0;
    
  res.json({
    success: true,
    data: {
      totalRevenue,
      monthlyRevenue: [
        { month: 1, revenue: totalRevenue, transactions: dummyData.payments?.length || 0 }
      ]
    }
  });
});

// Auth endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email, password: '***' });
  
  if (email === 'admin@shawedgym.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@shawedgym.com',
          role: 'admin'
        }
      }
    });
  } else {
    res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid email or password'
    });
  }
});

// Create endpoints
app.post('/api/members', (req, res) => {
  const newMember = {
    id: (dummyData.members?.length || 0) + 1,
    ...req.body,
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  };
  
  if (!dummyData.members) dummyData.members = [];
  dummyData.members.push(newMember);
  
  console.log('👤 New member created:', newMember.name);
  
  res.status(201).json({
    success: true,
    message: 'Member created successfully',
    data: { member: newMember }
  });
});

app.post('/api/payments', (req, res) => {
  const newPayment = {
    id: (dummyData.payments?.length || 0) + 1,
    ...req.body,
    date: new Date().toISOString().split('T')[0],
    receipt: `PAY${String((dummyData.payments?.length || 0) + 1).padStart(3, '0')}`,
    status: 'completed'
  };
  
  if (!dummyData.payments) dummyData.payments = [];
  dummyData.payments.push(newPayment);
  
  console.log('💰 New payment processed:', `$${newPayment.amount}`);
  
  res.status(201).json({
    success: true,
    message: 'Payment processed successfully',
    data: { payment: newPayment }
  });
});

// Member check-in endpoint
app.post('/api/members/:id/checkin', (req, res) => {
  const memberId = parseInt(req.params.id);
  const member = dummyData.members?.find(m => m.id === memberId);
  
  if (!member) {
    return res.status(404).json({
      error: 'Member Not Found',
      message: 'Member does not exist'
    });
  }
  
  const isCheckedIn = !member.isCheckedIn; // Toggle status
  member.isCheckedIn = isCheckedIn;
  member.lastCheckIn = new Date().toISOString();
  
  console.log(`✅ ${member.name} ${isCheckedIn ? 'checked in' : 'checked out'}`);
  
  res.json({
    success: true,
    message: `Member ${isCheckedIn ? 'checked in' : 'checked out'} successfully`,
    data: { 
      member,
      action: isCheckedIn ? 'checkin' : 'checkout',
      timestamp: new Date().toISOString()
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/dashboard/stats',
      'GET /api/members',
      'GET /api/payments',
      'GET /api/classes',
      'POST /api/auth/login'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ShawedGym Backend API Started!');
  console.log('='.repeat(50));
  console.log(`🌐 Backend API: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`👥 Members API: http://localhost:${PORT}/api/members`);
  console.log(`💰 Payments API: http://localhost:${PORT}/api/payments`);
  console.log('='.repeat(50));
  console.log('🔗 Ready for frontend connection on http://localhost:5173');
  console.log('💡 Start frontend with: npm run dev');
  console.log('');
});

module.exports = app;
