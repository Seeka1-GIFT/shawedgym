const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController');
const authMiddleware = require('../middleware/auth');
// Temporarily disable auth to allow frontend integration without login for classes.
// router.use(authMiddleware);

router.get('/', classesController.getClasses);
router.get('/:id', classesController.getClass);
router.post('/', classesController.createClass);
router.put('/:id', classesController.updateClass);
router.delete('/:id', classesController.deleteClass);
router.post('/:id/book', classesController.bookClass);

module.exports = router;



