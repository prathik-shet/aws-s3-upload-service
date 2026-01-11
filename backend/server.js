require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', uploadRoutes);

app.get('/', (req, res) => {
  res.send('AWS Upload Service Running');
});

app.listen(5000, () => {
  console.log('Upload service running on port 5000');
});
