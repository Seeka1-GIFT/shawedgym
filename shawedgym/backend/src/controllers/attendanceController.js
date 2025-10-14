const pool = require('../config/database');

// --- Face Device Integration Helpers ---
let schemaEnsured = false;
async function ensureAttendanceSchema() {
  if (schemaEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        vendor VARCHAR(50),
        serial VARCHAR(100) UNIQUE,
        secret VARCHAR(100),
        gym_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='members' AND column_name='face_id'
        ) THEN
          ALTER TABLE members ADD COLUMN face_id VARCHAR(100);
        END IF;
      END$$;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        member_id INTEGER NOT NULL,
        device_id INTEGER,
        event VARCHAR(20) DEFAULT 'checkin',
        check_in_time TIMESTAMP,
        check_out_time TIMESTAMP,
        photo_url TEXT,
        gym_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // Add photo_url column if missing (for existing installations)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='attendance' AND column_name='photo_url') THEN
          ALTER TABLE attendance ADD COLUMN photo_url TEXT;
        END IF;
      END$$;
    `);
    schemaEnsured = true;
  } catch (e) {
    console.error('ensureAttendanceSchema error:', e);
  }
}

// Public device webhook: minimal auth using device secret header
const deviceWebhook = async (req, res) => {
  try {
    await ensureAttendanceSchema();
    const sig = req.header('x-device-secret') || req.header('x-signature');
    const deviceSn = req.header('x-device-serial') || req.body.device_sn || req.body.deviceSn;
    const { person_id, ts, event, photo_url } = req.body;

    if (!deviceSn || !sig || !person_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing device_sn, secret or person_id' });
    }

    let device = await pool.query('SELECT * FROM devices WHERE serial = $1', [deviceSn]);
    if (device.rows.length === 0) {
      const inserted = await pool.query('INSERT INTO devices (serial, secret) VALUES ($1, $2) RETURNING *', [deviceSn, sig]);
      device = { rows: [inserted.rows[0]] };
    }
    const dev = device.rows[0];
    if (dev.secret && dev.secret !== sig) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid device secret' });
    }

    let member;
    if (dev.gym_id) {
      member = await pool.query('SELECT id, gym_id FROM members WHERE face_id = $1 AND gym_id = $2 LIMIT 1', [person_id, dev.gym_id]);
    } else {
      member = await pool.query('SELECT id, gym_id FROM members WHERE face_id = $1 LIMIT 1', [person_id]);
      if (member.rows.length) {
        await pool.query('UPDATE devices SET gym_id = $1 WHERE id = $2', [member.rows[0].gym_id, dev.id]);
      }
    }
    if (member.rows.length === 0) {
      return res.json({ success: true, message: 'Unknown person_id; ignored' });
    }
    const m = member.rows[0];
    const when = ts ? new Date(ts) : new Date();
    const ev = (event || 'checkin').toLowerCase();
    await pool.query(
      `INSERT INTO attendance (member_id, device_id, event, check_in_time, photo_url, gym_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [m.id, dev.id, ev, when, photo_url || null, m.gym_id]
    );
    return res.json({ success: true });
  } catch (e) {
    console.error('deviceWebhook error:', e);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to record attendance' });
  }
};

// Batch sync for FaceName PC service
const syncFromService = async (req, res) => {
  try {
    await ensureAttendanceSchema();
    const { device_sn, secret, records = [] } = req.body || {};
    if (!device_sn || !records.length) {
      return res.status(400).json({ error: 'Bad Request', message: 'device_sn and records required' });
    }
    let device = await pool.query('SELECT * FROM devices WHERE serial = $1', [device_sn]);
    if (device.rows.length === 0) {
      const inserted = await pool.query('INSERT INTO devices (serial, secret) VALUES ($1, $2) RETURNING *', [device_sn, secret || null]);
      device = { rows: [inserted.rows[0]] };
    }
    const dev = device.rows[0];
    if (dev.secret && secret && dev.secret !== secret) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid device secret' });
    }
    let inserted = 0;
    for (const r of records) {
      const person = String(r.person_id || '').trim();
      if (!person) continue;
      let m;
      if (dev.gym_id) {
        m = await pool.query('SELECT id, gym_id FROM members WHERE face_id = $1 AND gym_id = $2 LIMIT 1', [person, dev.gym_id]);
      } else {
        m = await pool.query('SELECT id, gym_id FROM members WHERE face_id = $1 LIMIT 1', [person]);
        if (m.rows.length && !dev.gym_id) {
          await pool.query('UPDATE devices SET gym_id = $1 WHERE id = $2', [m.rows[0].gym_id, dev.id]);
        }
      }
      if (!m.rows.length) continue;
      const when = r.ts ? new Date(r.ts) : new Date();
      const ev = (r.event || 'checkin').toLowerCase();
      await pool.query(
        `INSERT INTO attendance (member_id, device_id, event, check_in_time, photo_url, gym_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [m.rows[0].id, dev.id, ev, when, r.photo_url || null, m.rows[0].gym_id]
      );
      inserted++;
    }
    return res.json({ success: true, inserted });
  } catch (e) {
    console.error('syncFromService error:', e);
    return res.status(500).json({ error: 'Server Error', message: 'Failed to sync attendance' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 20, memberId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }

    let query = `
      SELECT a.*, m.first_name, m.last_name, m.email 
      FROM attendance a 
      LEFT JOIN members m ON a.member_id = m.id 
      WHERE a.gym_id = $1
    `;
    let countQuery = 'SELECT COUNT(*) FROM attendance a WHERE a.gym_id = $1';
    let queryParams = [gymId];
    let paramIndex = 2;

    if (memberId) {
      query += ` AND a.member_id = $${paramIndex}`;
      countQuery += ` AND a.member_id = $${paramIndex}`;
      queryParams.push(memberId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND a.check_in_time >= $${paramIndex}`;
      countQuery += ` AND a.check_in_time >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND a.check_in_time <= $${paramIndex}`;
      countQuery += ` AND a.check_in_time <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY a.check_in_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    const [attendanceResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalAttendance = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalAttendance / parseInt(limit));

    res.json({
      success: true,
      data: {
        attendance: attendanceResult.rows,
        pagination: { total: totalAttendance, page: parseInt(page), pages: totalPages, limit: parseInt(limit) }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch attendance' });
  }
};

const createAttendance = async (req, res) => {
  try {
    const { memberId, checkInTime, checkOutTime } = req.body;
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }

    if (!memberId) {
      return res.status(400).json({ error: 'Validation Error', message: 'Member ID is required' });
    }

    const memberResult = await pool.query('SELECT id FROM members WHERE id = $1 AND gym_id = $2', [memberId, gymId]);
    if (memberResult.rows.length === 0) {
      return res.status(400).json({ error: 'Validation Error', message: 'Member not found' });
    }

    const result = await pool.query(
      'INSERT INTO attendance (member_id, check_in_time, check_out_time, gym_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [memberId, checkInTime || new Date(), checkOutTime, gymId]
    );

    res.status(201).json({ success: true, message: 'Attendance recorded successfully', data: { attendance: result.rows[0] } });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to record attendance' });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkOutTime } = req.body;
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }

    const result = await pool.query(
      'UPDATE attendance SET check_out_time = $1, updated_at = NOW() WHERE id = $2 AND gym_id = $3 RETURNING *',
      [checkOutTime || new Date(), id, gymId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance Not Found', message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance updated successfully', data: { attendance: result.rows[0] } });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update attendance' });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id;

    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }

    const result = await pool.query('DELETE FROM attendance WHERE id = $1 AND gym_id = $2 RETURNING *', [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance Not Found', message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance deleted successfully', data: { attendance: result.rows[0] } });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete attendance' });
  }
};

module.exports = {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  deviceWebhook,
  syncFromService
};






