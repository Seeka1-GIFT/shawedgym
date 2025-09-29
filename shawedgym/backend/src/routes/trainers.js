const express = require('express');
const router = express.Router();
const trainersController = require('../controllers/trainersController');
const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', trainersController.getTrainers);
router.get('/:id', trainersController.getTrainer);
router.post('/', trainersController.createTrainer);
router.put('/:id', trainersController.updateTrainer);
router.delete('/:id', trainersController.deleteTrainer);

module.exports = router;



