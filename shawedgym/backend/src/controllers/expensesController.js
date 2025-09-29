const pool = require('../config/database');

const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM expenses WHERE gym_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM expenses WHERE gym_id = $1';
    let queryParams = [gymId];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND expense_date >= $${paramIndex}`;
      countQuery += ` AND expense_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND expense_date <= $${paramIndex}`;
      countQuery += ` AND expense_date <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY expense_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    const [expensesResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalExpenses = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalExpenses / parseInt(limit));

    res.json({
      success: true,
      data: {
        expenses: expensesResult.rows,
        pagination: { total: totalExpenses, page: parseInt(page), pages: totalPages, limit: parseInt(limit) }
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch expenses' });
  }
};

const getExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense Not Found', message: 'Expense not found' });
    }

    res.json({ success: true, data: { expense: result.rows[0] } });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch expense' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, expense_date, vendor } = req.body;
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }

    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'Validation Error', message: 'Title, amount, and category are required' });
    }

    const result = await pool.query(
      'INSERT INTO expenses (title, amount, category, description, expense_date, vendor, gym_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [title, amount, category, description, expense_date || new Date(), vendor, gymId]
    );

    res.status(201).json({ success: true, message: 'Expense created successfully', data: { expense: result.rows[0] } });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, description, expense_date, vendor, status } = req.body;
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }

    const result = await pool.query(
      'UPDATE expenses SET title = $1, amount = $2, category = $3, description = $4, expense_date = $5, vendor = $6, status = $7, updated_at = NOW() WHERE id = $8 AND gym_id = $9 RETURNING *',
      [title, amount, category, description, expense_date, vendor, status, id, gymId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense Not Found', message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense updated successfully', data: { expense: result.rows[0] } });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Gym ID is required' });
    }
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND gym_id = $2 RETURNING *', [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense Not Found', message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully', data: { expense: result.rows[0] } });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete expense' });
  }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense };






