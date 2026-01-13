require("dotenv").config();
const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

/* ===============================
   BODY PARSER (REQUIRED FOR RENDER)
   =============================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ===============================
   CORS CONFIGURATION
   =============================== */
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://aws-upload-frontend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

/* ===============================
   ROUTES
   =============================== */
app.use("/api", uploadRoutes);

/* ===============================
   HEALTH CHECK
   =============================== */
app.get("/", (req, res) => {
  res.status(200).send("AWS Upload Service Running ✅");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ===============================
   GLOBAL ERROR HANDLER
   =============================== */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

/* ===============================
   START SERVER (RENDER SAFE)
   =============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Upload service running on port ${PORT}`);
});
