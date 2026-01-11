const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');
const allowedFolders = require('../utils/allowedFolders');

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const folder = req.body.folder;

      if (!allowedFolders.includes(folder)) {
        return cb(new Error('Invalid folder selected'));
      }

      const ext = file.originalname.split('.').pop();
      const filename = `${Date.now()}.${ext}`;

      cb(null, `${folder}/${filename}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB (image + video)
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
      return cb(new Error('Only images and MP4/WebM videos allowed'));
    }

    cb(null, true);
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    url: req.file.location,
    type: req.file.mimetype.startsWith('video') ? 'video' : 'image'
  });
});

module.exports = router;
