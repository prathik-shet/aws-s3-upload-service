const express = require('express');
const multer = require('multer');
const s3 = require('../config/s3');
const allowedFolders = require('../utils/allowedFolders');

const router = express.Router();

// Multer memory storage (IMPORTANT)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only images and videos allowed'));
    }

    cb(null, true);
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const folder = (req.body.folder || '').trim().toLowerCase();

    console.log('📁 Folder received:', folder);

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: 'Invalid folder selected' });
    }

    const ext = req.file.originalname.split('.').pop();
    const key = `${folder}/${Date.now()}.${ext}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    res.json({
      success: true,
      url: result.Location
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
