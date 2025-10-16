const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
}

// Save base64 image sent from client and return a public URL
const uploadBase64 = async (req, res) => {
  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64 || !/^data:image\/(png|jpeg|jpg);base64,/.test(imageBase64)) {
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }
    const ext = imageBase64.includes('image/png') ? 'png' : 'jpg';
    const base64Data = imageBase64.split(',')[1];
    const fileName = `member_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));
    // Public URL served via /uploads static
    const url = `/uploads/${fileName}`;
    return res.json({ success: true, data: { url } });
  } catch (e) {
    console.error('uploadBase64 error:', e);
    return res.status(500).json({ success: false, message: 'Failed to save image' });
  }
};

module.exports = { uploadBase64 };


