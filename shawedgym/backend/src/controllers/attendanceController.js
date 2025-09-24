const pool = require('../config/database');

const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 20, memberId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, m.first_name, m.last_name, m.email 
      FROM attendance a 
      LEFT JOIN members m ON a.member_id = m.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM attendance a WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;

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

    if (!memberId) {
      return res.status(400).json({ error: 'Validation Error', message: 'Member ID is required' });
    }

    const memberResult = await pool.query('SELECT id FROM members WHERE id = $1', [memberId]);
    if (memberResult.rows.length === 0) {
      return res.status(400).json({ error: 'Validation Error', message: 'Member not found' });
    }

    const result = await pool.query(
      'INSERT INTO attendance (member_id, check_in_time, check_out_time, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [memberId, checkInTime || new Date(), checkOutTime]
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

    const result = await pool.query(
      'UPDATE attendance SET check_out_time = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [checkOutTime || new Date(), id]
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
    const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance Not Found', message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance deleted successfully', data: { attendance: result.rows[0] } });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete attendance' });
  }
};

module.exports = { getAttendance, createAttendance, updateAttendance, deleteAttendance };






