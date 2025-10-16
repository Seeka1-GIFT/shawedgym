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
const cleanupRoutes = require('./routes/cleanup');
const gymsRoutes = require('./routes/gyms');
const multiTenantSetupRoutes = require('./routes/multiTenantSetup');
const subscriptionsRoutes = require('./routes/subscriptions');
const uploadsRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://shawedgym.com',
  'https://www.shawedgym.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow explicit origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview/production domain
    if (origin.includes('vercel.app')) return callback(null, true);
    // Allow shawedgym.com domain
    if (origin.includes('shawedgym.com')) return callback(null, true);
    // Allow localhost dev variants
    if (origin.includes('localhost')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Gym-Id', 'x-gym-id', 'X-Requested-With']
}));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files
app.use('/uploads', express.static(require('path').join(__dirname, '..', 'uploads')));

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

// ✅ Dashboard stats (scoped by tenant)
const authMiddleware = require('./middleware/auth');
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.status(400).json({ success: false, message: 'Gym ID is required' });
    }

    // Aggregate counts filtered by gym_id
    const [membersResult, paymentsResult, classesResult, expensesResult] = await Promise.all([
      pool.query(
        "SELECT COUNT(*) as total, COUNT(CASE WHEN status='Active' THEN 1 END) as active FROM members WHERE gym_id = $1",
        [gymId]
      ),
      pool.query(
        "SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) as revenue, SUM(CASE WHEN status='completed' AND payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END) as monthly_revenue FROM payments WHERE gym_id = $1",
        [gymId]
      ),
      pool.query("SELECT COUNT(*) as total FROM classes WHERE gym_id = $1", [gymId]),
      pool.query("SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM expenses WHERE gym_id = $1", [gymId])
    ]);

    const checkedIn = await pool.query(
      "SELECT COUNT(*) as inside FROM attendance WHERE check_out_time IS NULL AND gym_id = $1",
      [gymId]
    );

    // Additional metrics
    const [activeEquip, todays] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS cnt FROM assets WHERE status ILIKE 'active' AND gym_id = $1", [gymId]),
      pool.query("SELECT COUNT(*)::int AS cnt FROM attendance WHERE DATE(check_in_time) = CURRENT_DATE AND gym_id = $1", [gymId])
    ]);

    const revenue = parseFloat(paymentsResult.rows?.[0]?.revenue) || 0;
    const totalExpenses = parseFloat(expensesResult.rows?.[0]?.total_expenses) || 0;
    const stats = {
      totalMembers: parseInt(membersResult.rows?.[0]?.total) || 0,
      activeMembers: parseInt(membersResult.rows?.[0]?.active) || 0,
      totalRevenue: revenue,
      totalClasses: parseInt(classesResult.rows?.[0]?.total) || 0,
      checkedInMembers: parseInt(checkedIn.rows?.[0]?.inside) || 0,
      monthlyRevenue: parseFloat(paymentsResult.rows?.[0]?.monthly_revenue) || 0,
      totalExpenses: totalExpenses,
      activeEquipment: activeEquip.rows?.[0]?.cnt || 0,
      todayAttendance: todays.rows?.[0]?.cnt || 0
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
app.use('/api/cleanup', cleanupRoutes);
app.use('/api/gyms', gymsRoutes);
app.use('/api/multi-tenant', multiTenantSetupRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/uploads', uploadsRoutes);

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
