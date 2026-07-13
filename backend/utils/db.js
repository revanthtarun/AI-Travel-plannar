const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB not available, running in file-based fallback mode.');
    // Don't exit — app will use JSON file fallback
  }
};

module.exports = connectDB;
