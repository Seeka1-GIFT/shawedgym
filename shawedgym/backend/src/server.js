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
const usersRoutes = require('./routes/users');
const databaseRoutes = require('./routes/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logs for Render deploy check
console.log('ENV CHECK → has DATABASE_URL:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const masked = process.env.DATABASE_URL.replace(/:[^:@/]+@/, ':****@');
  console.log('ENV CHECK → DATABASE_URL (masked):', masked.slice(0, 80) + '...');
}
console.log('ENV CHECK → FRONTEND_URL:', process.env.FRONTEND_URL || '(not set)');

// ✅ Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'ShawedGym Backend Server Running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      port: PORT,
      database: {
        connected: true,
        time: result.rows[0].now
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database not reachable',
      error: err.message
    });
  }
});

// ✅ Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [membersResult, paymentsResult, classesResult] = await Promise.all([
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='Active' THEN 1 END) as active FROM members"),
      pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) as revenue FROM payments"),
      pool.query("SELECT COUNT(*) as total FROM classes")
    ]);

    const checkedIn = await pool.query("SELECT COUNT(*) as inside FROM attendance WHERE check_out_time IS NULL");

    const stats = {
      totalMembers: parseInt(membersResult.rows[0].total) || 0,
      activeMembers: parseInt(membersResult.rows[0].active) || 0,
      totalRevenue: parseFloat(paymentsResult.rows[0].revenue) || 0,
      totalClasses: parseInt(classesResult.rows[0].total) || 0,
      checkedInMembers: parseInt(checkedIn.rows[0].inside) || 0,
      monthlyRevenue: Math.floor((parseFloat(paymentsResult.rows[0].revenue) || 0) * 0.3),
      activeEquipment: 25,
      todayAttendance: Math.floor(Math.random() * 30) + 20
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch dashboard statistics' });
  }
});

// ✅ API routes
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
app.use('/api/users', usersRoutes);
app.use('/api/database', databaseRoutes);

// ✅ 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'API endpoint not found' });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong!' });
});

// ✅ Start server after DB check
const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log('\n🎉 ShawedGym Backend Server Started!');
      console.log('='.repeat(50));
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`👥 Members: http://localhost:${PORT}/api/members`);
      console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
      console.log('='.repeat(50));
      console.log('🔗 Backend ready for frontend connection!');
      console.log('🛡️ JWT authentication enabled');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
