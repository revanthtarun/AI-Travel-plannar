const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/trips', require('./routes/trips'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/cities', require('./routes/cities'));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
