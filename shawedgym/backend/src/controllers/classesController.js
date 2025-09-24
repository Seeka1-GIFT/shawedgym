const pool = require('../config/database');

const getClasses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY schedule ASC');
    res.json({
      success: true,
      data: { classes: result.rows }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch classes'
    });
  }
};

const getClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Class Not Found',
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: { class: result.rows[0] }
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch class'
    });
  }
};

const createClass = async (req, res) => {
  try {
    const { title, schedule, trainer, capacity, description } = req.body;

    if (!title || !schedule || !trainer || !capacity) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title, schedule, trainer, and capacity are required'
      });
    }

    const result = await pool.query(
      'INSERT INTO classes (title, schedule, trainer, capacity, enrolled, description, created_at) VALUES ($1, $2, $3, $4, 0, $5, NOW()) RETURNING *',
      [title, schedule, trainer, capacity, description]
    );

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { class: result.rows[0] }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create class'
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, schedule, trainer, capacity, enrolled, description, status } = req.body;

    const result = await pool.query(
      'UPDATE classes SET title = $1, schedule = $2, trainer = $3, capacity = $4, enrolled = $5, description = $6, status = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [title, schedule, trainer, capacity, enrolled, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Class Not Found',
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: { class: result.rows[0] }
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update class'
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Class Not Found',
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully',
      data: { class: result.rows[0] }
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete class'
    });
  }
};

const bookClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Member ID is required'
      });
    }

    // Check if class exists and has capacity
    const classResult = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    if (classResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Class Not Found',
        message: 'Class not found'
      });
    }

    const classData = classResult.rows[0];
    if (classData.enrolled >= classData.capacity) {
      return res.status(400).json({
        error: 'Class Full',
        message: 'Class is at full capacity'
      });
    }

    // Check if member exists
    const memberResult = await pool.query('SELECT id FROM members WHERE id = $1', [memberId]);
    if (memberResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Member Not Found',
        message: 'Member not found'
      });
    }

    // Book the class (increment enrolled count)
    const updateResult = await pool.query(
      'UPDATE classes SET enrolled = enrolled + 1, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      success: true,
      message: 'Class booked successfully',
      data: { class: updateResult.rows[0] }
    });
  } catch (error) {
    console.error('Book class error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to book class'
    });
  }
};

module.exports = {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  bookClass
};






