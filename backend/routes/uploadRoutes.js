const express = require('express');
const multer = require('multer');
const s3 = require('../config/s3');
const allowedFolders = require('../utils/allowedFolders');

const router = express.Router();

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('🔍 BODY:', req.body);
    console.log('🔍 FILE:', req.file ? req.file.originalname : 'NO FILE');

    if (!req.file) {
      return res.status(400).json({ error: 'File not received' });
    }

    const folder = (req.body.folder || '').trim().toLowerCase();
    console.log('📁 Folder:', folder);

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: `Invalid folder: ${folder}` });
    }

    const ext = req.file.originalname.split('.').pop();
    const key = `${folder}/${Date.now()}.${ext}`;

    const params = {
  Bucket: process.env.AWS_BUCKET_NAME,
  Key: key,
  Body: req.file.buffer,
  ContentType: req.file.mimetype
};


    console.log('🚀 Uploading to S3:', params.Bucket, params.Key);

    const result = await s3.upload(params).promise();

    console.log('✅ S3 upload success:', result.Location);

    res.json({
      success: true,
      url: result.Location
    });

  } catch (err) {
    console.error('❌ UPLOAD ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
