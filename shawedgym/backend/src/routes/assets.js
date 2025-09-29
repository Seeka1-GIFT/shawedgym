const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assetsController');
const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', assetsController.getAssets);
router.get('/:id', assetsController.getAsset);
router.post('/', assetsController.createAsset);
router.put('/:id', assetsController.updateAsset);
router.delete('/:id', assetsController.deleteAsset);

module.exports = router;



