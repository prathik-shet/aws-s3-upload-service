require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

/**
 * ✅ CORS CONFIGURATION
 * Allows:
 * - Local frontend (Vite)
 * - Render frontend
 */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://aws-upload-frontend.onrender.com'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Required for JSON parsing
app.use(express.json());

// Routes
app.use('/api', uploadRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('AWS Upload Service Running');
});

// Render provides PORT automatically
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Upload service running on port ${PORT}`);
});
