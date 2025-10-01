const pool = require('../config/database');

const getAssets = async (req, res) => {
  try {
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.status(400).json({
        error: 'Missing gym_id',
        message: 'User gym_id is required'
      });
    }

    const result = await pool.query('SELECT * FROM assets WHERE gym_id = $1 ORDER BY name ASC', [gymId]);
    res.json({
      success: true,
      data: { assets: result.rows }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch assets'
    });
  }
};

const getAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user?.gym_id;
    if (!gymId) {
      return res.status(400).json({
        error: 'Missing gym_id',
        message: 'User gym_id is required'
      });
    }

    const result = await pool.query('SELECT * FROM assets WHERE id = $1 AND gym_id = $2', [id, gymId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Asset Not Found',
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: { asset: result.rows[0] }
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch asset'
    });
  }
};

const createAsset = async (req, res) => {
  try {
    const { name, type, location, status, purchase_date, purchase_price, description } = req.body;
    const gymId = req.user?.gym_id;
    
    if (!gymId) {
      return res.status(400).json({
        error: 'Missing gym_id',
        message: 'User gym_id is required'
      });
    }

    if (!name || !type) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name and type are required'
      });
    }

    const result = await pool.query(
      'INSERT INTO assets (name, type, location, status, purchase_date, purchase_price, description, gym_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
      [name, type, location, status || 'active', purchase_date, purchase_price, description, gymId]
    );

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: { asset: result.rows[0] }
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create asset'
    });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, location, status, purchase_date, purchase_price, description } = req.body;

    const result = await pool.query(
      'UPDATE assets SET name = $1, type = $2, location = $3, status = $4, purchase_date = $5, purchase_price = $6, description = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [name, type, location, status, purchase_date, purchase_price, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Asset Not Found',
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: { asset: result.rows[0] }
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update asset'
    });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Asset Not Found',
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      message: 'Asset deleted successfully',
      data: { asset: result.rows[0] }
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete asset'
    });
  }
};

module.exports = {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset
};






