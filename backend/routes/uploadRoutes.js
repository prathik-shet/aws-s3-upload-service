const express = require("express");
const multer = require("multer");
const s3 = require("../config/s3");
const allowedFolders = require("../utils/allowedFolders");

const router = express.Router();

/* ===============================
   MULTER CONFIG (LIMITED)
   =============================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // ⚠️ 10MB MAX
});

/* ===============================
   ALLOWED FILE TYPES
   =============================== */
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm"
];

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const uploadToS3 = (file, folder, suffix = "") => {
  const ext = file.mimetype.split("/")[1];
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}.${ext}`;

  return s3.upload({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: "public, max-age=31536000"
  }).promise().then((result) => ({
    name: file.originalname,
    url: result.Location,
    key
  }));
};

/* ===============================
   BULK IMAGE UPLOAD
   =============================== */
router.post("/upload/bulk", upload.array("files", 100), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: "No images received" });
    }

    const folder = (req.body.folder || "").trim().toLowerCase();
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: "Invalid folder" });
    }

    const invalidFile = req.files.find((file) => !allowedImageTypes.includes(file.mimetype));
    if (invalidFile) {
      return res.status(400).json({ error: "Bulk upload supports JPG, PNG, and WEBP images only" });
    }

    const files = await Promise.all(
      req.files.map((file, index) => uploadToS3(file, folder, `-${index}`))
    );

    res.json({ success: true, files });
  } catch (err) {
    console.error("BULK UPLOAD ERROR:", err);
    res.status(500).json({ error: "Bulk upload failed", message: err.message });
  }
});

/* ===============================
   UPLOAD
   =============================== */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File not received" });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Only JPG, PNG, WEBP, MP4, WEBM allowed"
      });
    }

    const folder = (req.body.folder || "").trim().toLowerCase();
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: "Invalid folder" });
    }

    const uploadedFile = await uploadToS3(req.file, folder);

    res.json({
      success: true,
      url: uploadedFile.url,
      key: uploadedFile.key
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
   DELETE
   =============================== */
router.post("/delete", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const parsedUrl = new URL(url);
    const key = decodeURIComponent(parsedUrl.pathname.slice(1));

    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ===============================
   MULTER ERROR HANDLER
   =============================== */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
