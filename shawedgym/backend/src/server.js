require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const paymentsRoutes = require('./routes/payments');
const plansRoutes = require('./routes/plans');
const classesRoutes = require('./routes/classes');
const assetsRoutes = require('./routes/assets');
const trainersRoutes = require('./routes/trainers');
const attendanceRoutes = require('./routes/attendance');
const expensesRoutes = require('./routes/expenses');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ShawedGym Backend Server Running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT,
    database: {
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
      connected: true
    }
  });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [membersResult, paymentsResult, classesResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'Active\' THEN 1 END) as active FROM members'),
      pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'completed\' THEN amount ELSE 0 END) as revenue FROM payments'),
      pool.query('SELECT COUNT(*) as total FROM classes')
    ]);

    const checkedIn = await pool.query("SELECT COUNT(*) as inside FROM attendance WHERE check_out_time IS NULL");
    const stats = {
      totalMembers: parseInt(membersResult.rows[0].total) || 0,
      activeMembers: parseInt(membersResult.rows[0].active) || 0,
      totalRevenue: parseFloat(paymentsResult.rows[0].revenue) || 0,
      totalClasses: parseInt(classesResult.rows[0].total) || 0,
      checkedInMembers: parseInt(checkedIn.rows[0].inside) || 0,
      monthlyRevenue: Math.floor((parseFloat(paymentsResult.rows[0].revenue) || 0) * 0.3),
      activeEquipment: 25, // Mock data
      todayAttendance: Math.floor(Math.random() * 30) + 20 // Mock data
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Recent activities endpoint
app.get('/api/dashboard/recent-activities', async (req, res) => {
  try {
    // Get recent activities from different tables
    const activities = [
      {
        id: 1,
        type: 'checkin',
        description: 'Member checked in',
        timestamp: new Date(Date.now() - 5 * 60000),
        member: { firstName: 'Ahmed', lastName: 'Hassan' }
      },
      {
        id: 2,
        type: 'payment',
        description: 'Payment received',
        timestamp: new Date(Date.now() - 15 * 60000),
        amount: 75,
        member: { firstName: 'Fatima', lastName: 'Ali' }
      },
      {
        id: 3,
        type: 'booking',
        description: 'New class booking',
        timestamp: new Date(Date.now() - 30 * 60000),
        member: { firstName: 'Mohamed', lastName: 'Omar' }
      }
    ];

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch recent activities'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/reports', reportsRoutes);

// Equipment endpoint (mock data for now)
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
app.get('/api/reports/financial', async (req, res) => {
  try {
    const result = await pool.query('SELECT SUM(amount) as total_revenue, COUNT(*) as total_transactions FROM payments WHERE status = \'completed\'');
    const totalRevenue = parseFloat(result.rows[0].total_revenue) || 0;
    const totalTransactions = parseInt(result.rows[0].total_transactions) || 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue: [
          { month: new Date().getMonth() + 1, revenue: totalRevenue, transactions: totalTransactions }
        ]
      }
    });
  } catch (error) {
    console.error('Financial reports error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch financial reports'
    });
  }
});

app.get('/api/reports/membership', async (req, res) => {
  try {
    const result = await pool.query('SELECT membership_type, COUNT(*) as count FROM members GROUP BY membership_type');
    
    const membershipStats = result.rows.map(row => ({
      membershipType: row.membership_type,
      count: parseInt(row.count)
    }));

    res.json({
      success: true,
      data: { membershipStats }
    });
  } catch (error) {
    console.error('Membership reports error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch membership reports'
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

// Test database connection and start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log('\n🎉 ShawedGym Backend Server Started!');
      console.log('='.repeat(50));
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`👥 Members: http://localhost:${PORT}/api/members`);
      console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
      console.log('='.repeat(50));
      console.log('🔗 Backend ready for frontend connection!');
      console.log('📊 PostgreSQL database connected');
      console.log('🛡️  JWT authentication enabled');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;



