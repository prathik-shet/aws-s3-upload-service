require("dotenv").config();
const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

/* 🔥 REQUIRED FOR RENDER */
app.set("trust proxy", 1);

/* ===============================
   BODY PARSER
   =============================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ===============================
   CORS
   =============================== */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://aws-s3-upload-service-frontend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

/* ===============================
   ROUTES
   =============================== */
app.use("/api", uploadRoutes);

/* ===============================
   HEALTH
   =============================== */
app.get("/", (req, res) => {
  res.status(200).send("AWS Upload Service Running ✅");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ===============================
   ERROR HANDLER
   =============================== */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

/* ===============================
   START
   =============================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Upload service running on port ${PORT}`);
});
