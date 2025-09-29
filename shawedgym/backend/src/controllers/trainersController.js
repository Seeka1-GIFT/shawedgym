const pool = require('../config/database');

const getTrainers = async (req, res) => {
  try {
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.json({ success: true, data: { trainers: [] } });
    }
    const result = await pool.query('SELECT * FROM trainers WHERE gym_id = $1 ORDER BY first_name ASC', [gymId]);
    res.json({
      success: true,
      data: { trainers: result.rows }
    });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch trainers' });
  }
};

const getTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id;
    const result = await pool.query('SELECT * FROM trainers WHERE id = $1 AND gym_id = $2', [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trainer Not Found', message: 'Trainer not found' });
    }

    res.json({ success: true, data: { trainer: result.rows[0] } });
  } catch (error) {
    console.error('Get trainer error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch trainer' });
  }
};

const createTrainer = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization, experience, hourly_rate } = req.body;
    const gymId = req.user?.gym_id;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Validation Error', message: 'First name, last name, and email are required' });
    }

    const result = await pool.query(
      'INSERT INTO trainers (first_name, last_name, email, phone, specialization, experience, hourly_rate, status, gym_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
      [first_name, last_name, email, phone || '', specialization || 'General', Number(experience) || 0, Number(hourly_rate) || 0, 'active', gymId]
    );

    res.status(201).json({ success: true, message: 'Trainer created successfully', data: { trainer: result.rows[0] } });
  } catch (error) {
    console.error('Create trainer error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create trainer' });
  }
};

const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, specialization, experience, hourly_rate, status } = req.body;
    const gymId = req.user?.gym_id;

    const result = await pool.query(
      'UPDATE trainers SET first_name = $1, last_name = $2, email = $3, phone = $4, specialization = $5, experience = $6, hourly_rate = $7, status = $8, updated_at = NOW() WHERE id = $9 AND gym_id = $10 RETURNING *',
      [first_name, last_name, email, phone, specialization, experience, hourly_rate, status, id, gymId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trainer Not Found', message: 'Trainer not found' });
    }

    res.json({ success: true, message: 'Trainer updated successfully', data: { trainer: result.rows[0] } });
  } catch (error) {
    console.error('Update trainer error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update trainer' });
  }
};

const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id;
    const result = await pool.query('DELETE FROM trainers WHERE id = $1 AND gym_id = $2 RETURNING *', [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trainer Not Found', message: 'Trainer not found' });
    }

    res.json({ success: true, message: 'Trainer deleted successfully', data: { trainer: result.rows[0] } });
  } catch (error) {
    console.error('Delete trainer error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete trainer' });
  }
};

module.exports = { getTrainers, getTrainer, createTrainer, updateTrainer, deleteTrainer };






