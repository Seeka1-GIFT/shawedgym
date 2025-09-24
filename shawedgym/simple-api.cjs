const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API working!' });
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalMembers: 148,
      activeMembers: 142,
      checkedInMembers: 12,
      totalRevenue: 18500,
      monthlyRevenue: 3200,
      totalClasses: 8,
      activeEquipment: 25,
      todayAttendance: 45
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
