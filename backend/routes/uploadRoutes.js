const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');
const allowedFolders = require('../utils/allowedFolders');

const router = express.Router();

/**
 * Normalize folder safely
 */
function getSafeFolder(req) {
  const folder =
    req.body?.folder ||
    req.query?.folder ||
    '';

  return folder.trim().toLowerCase();
}

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (req, file, cb) => {
      const folder = getSafeFolder(req);

      console.log('📁 Folder received:', folder);

      if (!allowedFolders.includes(folder)) {
        return cb(new Error(`Invalid folder selected: ${folder}`));
      }

      const ext = file.originalname.split('.').pop();
      const filename = `${Date.now()}.${ext}`;

      cb(null, `${folder}/${filename}`);
    }
  }),

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
      return cb(new Error('Only images and MP4/WebM videos allowed'));
    }

    cb(null, true);
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    url: req.file.location
  });
});

module.exports = router;
