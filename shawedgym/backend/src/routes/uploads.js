const express = require('express');
const router = express.Router();
const { uploadBase64 } = require('../controllers/uploadsController');

// Simple base64 image upload (auth optional for now)
router.post('/base64', uploadBase64);

module.exports = router;


