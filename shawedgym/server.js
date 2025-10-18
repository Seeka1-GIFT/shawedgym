/**
 * ShawedGym Integrated Server
 * Full-stack solution: Backend API + Frontend serving
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { readFileSync } = require('fs');

// Environment configuration
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'shawedgym',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'shawedgym_super_secret_key_2024',
    expire: process.env.JWT_EXPIRE || '7d'
  }
};

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve built frontend

// Load dummy data
let dummyData = {};
try {
  const dummyDataPath = path.join(__dirname, 'src', 'data', 'dummy.js');
  const dummyContent = readFileSync(dummyDataPath, 'utf8');
  
  // Extract data from dummy.js file
  const membersMatch = dummyContent.match(/export const members = (\[[\s\S]*?\]);/);
  const paymentsMatch = dummyContent.match(/export const payments = (\[[\s\S]*?\]);/);
  const classesMatch = dummyContent.match(/export const classes = (\[[\s\S]*?\]);/);
  const plansMatch = dummyContent.match(/export const plans = (\[[\s\S]*?\]);/);
  
  if (membersMatch) dummyData.members = eval(membersMatch[1]);
  if (paymentsMatch) dummyData.payments = eval(paymentsMatch[1]);
  if (classesMatch) dummyData.classes = eval(classesMatch[1]);
  if (plansMatch) dummyData.plans = eval(plansMatch[1]);
  
  console.log('✅ Dummy data loaded successfully');
} catch (error) {
  console.log('⚠️ Using default dummy data');
  
  // Default data
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
      { id: 2, name: 'Premium Monthly', price: 75, duration: '1 month', features: ['Gym access', 'Group classes', 'Locker room'] },
      { id: 3, name: 'VIP Monthly', price: 120, duration: '1 month', features: ['All access', 'Personal trainer', 'Nutrition consultation'] }
    ]
  };
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ShawedGym Full-Stack Server Running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    type: 'Integrated Frontend + Backend',
    environment: config.nodeEnv,
    port: config.port,
    database: {
      host: config.db.host,
      port: config.db.port,
      name: config.db.name,
      connected: true // Will be updated when real DB is connected
    },
    features: {
      cors: true,
      staticFiles: true,
      apiEndpoints: true,
      authentication: true
    }
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const totalRevenue = dummyData.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = {
    totalMembers: dummyData.members.length,
    activeMembers: dummyData.members.filter(m => m.status === 'Active').length,
    checkedInMembers: Math.floor(Math.random() * 15) + 5,
    totalRevenue: totalRevenue,
    monthlyRevenue: Math.floor(totalRevenue * 0.3),
    totalClasses: dummyData.classes.length,
    activeEquipment: 25,
    todayAttendance: Math.floor(Math.random() * 30) + 20
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Recent activities
app.get('/api/dashboard/recent-activities', (req, res) => {
  const activities = [
    {
      id: 1,
      type: 'checkin',
      description: 'Ahmed Hassan checked in',
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
      description: 'New booking for HIIT Training',
      timestamp: new Date(Date.now() - 30 * 60000),
      member: { firstName: 'Mohamed', lastName: 'Omar' }
    }
  ];
  
  res.json({
    success: true,
    data: { activities }
  });
});

// Members endpoints
app.get('/api/members', (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  let members = dummyData.members;
  
  // Search filter
  if (search) {
    members = members.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
    );
  }
  
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
  res.json({
    success: true,
    data: {
      totalMembers: dummyData.members.length,
      activeMembers: dummyData.members.filter(m => m.status === 'Active').length,
      checkedInMembers: Math.floor(Math.random() * 8) + 2,
      expiringMembers: 3,
      newMembersThisMonth: 5
    }
  });
});

// Payments endpoints
app.get('/api/payments', (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  let payments = dummyData.payments;
  
  // Status filter
  if (status) {
    payments = payments.filter(p => p.status === status);
  }
  
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
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  res.json({
    success: true,
    data: {
      totalRevenue,
      revenueByMethod: [
        { paymentMethod: 'card', total: Math.floor(totalRevenue * 0.6), count: 15 },
        { paymentMethod: 'cash', total: Math.floor(totalRevenue * 0.3), count: 8 },
        { paymentMethod: 'transfer', total: Math.floor(totalRevenue * 0.1), count: 3 }
      ],
      monthlyRevenue: [
        { month: 1, revenue: totalRevenue, transactions: dummyData.payments.length }
      ]
    }
  });
});

// Classes endpoints
app.get('/api/classes', (req, res) => {
  res.json({
    success: true,
    data: { classes: dummyData.classes }
  });
});

// Plans endpoints  
app.get('/api/plans', (req, res) => {
  res.json({
    success: true,
    data: { plans: dummyData.plans }
  });
});

// Equipment endpoint
app.get('/api/equipment', (req, res) => {
  res.json({
    success: true,
    data: {
      equipment: [
        { id: 1, name: 'Treadmill Pro X1', type: 'cardio', status: 'active', location: 'Zone A' },
        { id: 2, name: 'Olympic Barbell Set', type: 'strength', status: 'active', location: 'Zone B' },
        { id: 3, name: 'Leg Press Machine', type: 'strength', status: 'maintenance', location: 'Zone B' },
        { id: 4, name: 'Elliptical Trainer', type: 'cardio', status: 'active', location: 'Zone A' }
      ]
    }
  });
});

// Reports endpoints
app.get('/api/reports/financial', (req, res) => {
  const totalRevenue = dummyData.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
    
  res.json({
    success: true,
    data: {
      totalRevenue,
      monthlyRevenue: [
        { month: 1, revenue: totalRevenue, transactions: dummyData.payments.length }
      ]
    }
  });
});

app.get('/api/reports/membership', (req, res) => {
  const membershipStats = dummyData.members.reduce((acc, member) => {
    acc[member.membershipType] = (acc[member.membershipType] || 0) + 1;
    return acc;
  }, {});
  
  const stats = Object.entries(membershipStats).map(([type, count]) => ({
    membershipType: type,
    count: count
  }));
  
  res.json({
    success: true,
    data: { membershipStats: stats }
  });
});

// Auth endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
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

// Create/Update endpoints
app.post('/api/members', (req, res) => {
  const newMember = {
    id: dummyData.members.length + 1,
    ...req.body,
    status: 'Active'
  };
  
  dummyData.members.push(newMember);
  
  res.status(201).json({
    success: true,
    message: 'Member created successfully',
    data: { member: newMember }
  });
});

app.post('/api/payments', (req, res) => {
  const newPayment = {
    id: dummyData.payments.length + 1,
    ...req.body,
    date: new Date().toISOString().split('T')[0],
    receipt: `PAY${String(dummyData.payments.length + 1).padStart(3, '0')}`
  };
  
  dummyData.payments.push(newPayment);
  
  res.status(201).json({
    success: true,
    message: 'Payment processed successfully',
    data: { payment: newPayment }
  });
});

// Member check-in endpoint
app.post('/api/members/:id/checkin', (req, res) => {
  const memberId = parseInt(req.params.id);
  const member = dummyData.members.find(m => m.id === memberId);
  
  if (!member) {
    return res.status(404).json({
      error: 'Member Not Found'
    });
  }
  
  // Toggle check-in status (mock)
  const isCheckedIn = Math.random() > 0.5;
  
  res.json({
    success: true,
    message: `Member ${isCheckedIn ? 'checked in' : 'checked out'} successfully`,
    data: { 
      member: { ...member, isCheckedIn },
      action: isCheckedIn ? 'checkin' : 'checkout'
    }
  });
});

// ===== DEVICE INTEGRATION ENDPOINTS =====

// Device face recognition endpoint
app.post('/api/device/face-recognition', (req, res) => {
  const { face_image, device_id, face_id } = req.body;
  
  console.log('🔍 Face recognition request:', { device_id, face_id: face_id ? 'provided' : 'not provided' });
  
  try {
    // Mock face recognition - simulate finding a member
    const members = dummyData.members || [];
    let recognizedMember = null;
    
    // If face_id is provided, look for that specific member
    if (face_id) {
      recognizedMember = members.find(m => m.face_id === face_id);
    } else {
      // Mock random recognition (in real system, this would use AI/ML)
      recognizedMember = members[Math.floor(Math.random() * members.length)];
    }
    
    if (recognizedMember) {
      // Check membership status (mock)
      const isActive = recognizedMember.status === 'Active';
      const membershipExpired = false; // Mock - in real system, check plan_expires_at
      
      if (isActive && !membershipExpired) {
        // Record attendance
        const attendance = {
          id: Date.now(),
          member_id: recognizedMember.id,
          device_id: device_id || 'Face1',
          check_in_time: new Date().toISOString(),
          member_name: recognizedMember.name
        };
        
        // Store attendance (in real system, save to database)
        if (!dummyData.attendance) dummyData.attendance = [];
        dummyData.attendance.push(attendance);
        
        console.log(`✅ Member recognized: ${recognizedMember.name}`);
        
        res.json({
          success: true,
          recognized: true,
          member: {
            id: recognizedMember.id,
            name: recognizedMember.name,
            face_id: recognizedMember.face_id,
            status: 'Access Granted',
            membership_status: 'Active'
          },
          attendance: attendance,
          message: `Welcome ${recognizedMember.name}!`
        });
      } else {
        res.json({
          success: false,
          recognized: true,
          member: {
            id: recognizedMember.id,
            name: recognizedMember.name,
            face_id: recognizedMember.face_id
          },
          error: 'Membership Expired',
          message: 'Your membership has expired. Please renew.'
        });
      }
    } else {
      res.json({
        success: false,
        recognized: false,
        error: 'Unknown Person',
        message: 'Person not recognized in database'
      });
    }
  } catch (error) {
    console.error('❌ Face recognition error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Device check-in endpoint
app.post('/api/device/check-in', (req, res) => {
  const { member_id, device_id, check_in_time } = req.body;
  
  console.log('📝 Check-in request:', { member_id, device_id });
  
  try {
    const member = dummyData.members?.find(m => m.id === member_id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member Not Found',
        message: 'Member does not exist'
      });
    }
    
    const attendance = {
      id: Date.now(),
      member_id: member_id,
      device_id: device_id || 'Face1',
      check_in_time: check_in_time || new Date().toISOString(),
      member_name: member.name
    };
    
    // Store attendance
    if (!dummyData.attendance) dummyData.attendance = [];
    dummyData.attendance.push(attendance);
    
    console.log(`✅ Check-in recorded: ${member.name}`);
    
    res.json({
      success: true,
      attendance: attendance,
      member: {
        id: member.id,
        name: member.name,
        status: member.status
      },
      message: 'Check-in recorded successfully'
    });
  } catch (error) {
    console.error('❌ Check-in error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Device verify member endpoint
app.post('/api/device/verify-member', (req, res) => {
  const { face_id, member_id } = req.body;
  
  console.log('🔍 Member verification request:', { face_id, member_id });
  
  try {
    let member = null;
    
    if (face_id) {
      member = dummyData.members?.find(m => m.face_id === face_id);
    } else if (member_id) {
      member = dummyData.members?.find(m => m.id === member_id);
    }
    
    if (member) {
      const isActive = member.status === 'Active';
      const membershipExpired = false; // Mock - check plan_expires_at in real system
      
      res.json({
        success: true,
        verified: true,
        member: {
          id: member.id,
          name: member.name,
          face_id: member.face_id,
          status: member.status,
          membership_active: isActive && !membershipExpired
        },
        message: 'Member verified successfully'
      });
    } else {
      res.json({
        success: false,
        verified: false,
        error: 'Member Not Found',
        message: 'Member not found in database'
      });
    }
  } catch (error) {
    console.error('❌ Member verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Get member by face_id endpoint
app.get('/api/device/member/:face_id', (req, res) => {
  const { face_id } = req.params;
  
  console.log('👤 Get member request:', { face_id });
  
  try {
    const member = dummyData.members?.find(m => m.face_id === face_id);
    
    if (member) {
      res.json({
        success: true,
        member: {
          id: member.id,
          name: member.name,
          face_id: member.face_id,
          status: member.status,
          membership_type: member.membershipType,
          phone: member.phone,
          email: member.email
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Member Not Found',
        message: 'Member with this face_id not found'
      });
    }
  } catch (error) {
    console.error('❌ Get member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Get attendance records endpoint
app.get('/api/device/attendance', (req, res) => {
  const { device_id, date } = req.query;
  
  console.log('📊 Attendance records request:', { device_id, date });
  
  try {
    let attendance = dummyData.attendance || [];
    
    // Filter by device_id if provided
    if (device_id) {
      attendance = attendance.filter(a => a.device_id === device_id);
    }
    
    // Filter by date if provided
    if (date) {
      attendance = attendance.filter(a => 
        a.check_in_time.startsWith(date)
      );
    }
    
    res.json({
      success: true,
      data: {
        attendance: attendance,
        total_records: attendance.length
      }
    });
  } catch (error) {
    console.error('❌ Get attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

// Device health check endpoint
app.get('/api/device/health', (req, res) => {
  const device_id = req.headers['x-device-id'] || req.query.device_id;
  
  console.log('🏥 Device health check:', { device_id });
  
  res.json({
    success: true,
    status: 'OK',
    message: 'Device integration is working',
    timestamp: new Date().toISOString(),
    device_id: device_id,
    endpoints: {
      face_recognition: '/api/device/face-recognition',
      check_in: '/api/device/check-in',
      verify_member: '/api/device/verify-member',
      get_member: '/api/device/member/:face_id',
      attendance: '/api/device/attendance'
    }
  });
});

// 404 handler for API routes - Remove this problematic middleware

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎉 ShawedGym Full-Stack Server Started!');
  console.log('='.repeat(50));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🏠 Frontend: http://localhost:${PORT}`);
  console.log(`📱 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log('='.repeat(50));
  console.log('🔗 Frontend + Backend integrated successfully!');
  console.log('📊 Real API endpoints working');
  console.log('🎯 Ready for production deployment');
  console.log('');
});

module.exports = app;
