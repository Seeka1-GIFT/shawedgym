// const express = require('express');
// const router = express.Router();
// const assetsController = require('../controllers/assetsController');
// const authMiddleware = require('../middleware/auth');
// const { authorizeRoles } = require('../middleware/authorize');

// // All asset routes require authentication
// router.use(authMiddleware);

// // GET /api/assets - Get all assets
// router.get('/', authorizeRoles('admin', 'user'), assetsController.getAssets);

// // GET /api/assets/:id - Get asset by ID
// router.get('/:id', authorizeRoles('admin', 'user'), assetsController.getAsset);

// // POST /api/assets - Create new asset
// router.post('/', authorizeRoles('admin'), assetsController.createAsset);

// // PUT /api/assets/:id - Update asset
// router.put('/:id', authorizeRoles('admin'), assetsController.updateAsset);

// // DELETE /api/assets/:id - Delete asset
// router.delete('/:id', authorizeRoles('admin'), assetsController.deleteAsset);

// module.exports = router;


