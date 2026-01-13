const express = require("express");
const multer = require("multer");
const s3 = require("../config/s3");
const allowedFolders = require("../utils/allowedFolders");

const router = express.Router();

/* ===============================
   MULTER CONFIG (MEMORY STORAGE)
   =============================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

/* ===============================
   ALLOWED FILE TYPES (IMAGES + VIDEOS)
   =============================== */
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm"
];

/* ===============================
   UPLOAD ROUTE
   POST /api/upload
   =============================== */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);
    console.log(
      "📎 FILE:",
      req.file ? req.file.originalname : "NO FILE"
    );

    /* ---------- FILE CHECK ---------- */
    if (!req.file) {
      return res.status(400).json({ error: "File not received" });
    }

    /* ---------- TYPE CHECK ---------- */
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Only JPG, PNG, WEBP, MP4, WEBM files are allowed"
      });
    }

    /* ---------- FOLDER CHECK ---------- */
    const folder = (req.body.folder || "").trim().toLowerCase();

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        error: `Invalid folder: ${folder}`
      });
    }

    /* ---------- FILE EXTENSION ---------- */
    const ext = req.file.originalname.split(".").pop();

    /* ---------- S3 KEY ---------- */
    const key = `${folder}/${Date.now()}.${ext}`;

    /* ---------- S3 PARAMS ---------- */
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      CacheControl: "public, max-age=31536000" // faster load
    };

    console.log("🚀 Uploading to S3:", key);

    /* ---------- UPLOAD ---------- */
    const result = await s3.upload(params).promise();

    console.log("✅ Upload success:", result.Location);

    res.json({
      success: true,
      url: result.Location,
      key
    });

  } catch (err) {
    console.error("❌ UPLOAD ERROR:", err);
    res.status(500).json({
      error: "Upload failed",
      message: err.message
    });
  }
});

/* ===============================
   DELETE ROUTE
   POST /api/delete
   =============================== */
router.post("/delete", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    /* ---------- SAFETY CHECK ---------- */
    if (!url.includes(process.env.AWS_BUCKET_NAME)) {
      return res.status(403).json({
        error: "Invalid S3 URL"
      });
    }

    /* ---------- EXTRACT KEY ---------- */
    const parsedUrl = new URL(url);
    const key = decodeURIComponent(parsedUrl.pathname.substring(1));

    console.log("🗑 Deleting:", key);

    await s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      })
      .promise();

    res.json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({
      error: "Delete failed",
      message: err.message
    });
  }
});

/* ===============================
   MULTER ERROR HANDLER (IMPORTANT)
   =============================== */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.message
    });
  }
  next(err);
});

module.exports = router;
