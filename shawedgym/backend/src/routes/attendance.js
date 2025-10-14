const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Public device endpoints first (no auth header; device secret verified inside controller)
router.post('/device-webhook', attendanceController.deviceWebhook);
router.post('/sync', attendanceController.syncFromService);

// Authenticated app endpoints
router.use(authMiddleware);

router.get('/', authorizeRoles('admin', 'cashier'), attendanceController.getAttendance);
router.post('/', authorizeRoles('admin', 'cashier'), attendanceController.createAttendance);
router.put('/:id', authorizeRoles('admin', 'cashier'), attendanceController.updateAttendance);
router.delete('/:id', authorizeRoles('admin'), attendanceController.deleteAttendance);

module.exports = router;






