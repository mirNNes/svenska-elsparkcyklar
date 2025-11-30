const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/elsparkcyklar';

  try {
    await mongoose.connect(uri);
    console.log('MongoDB ansluten');
  } catch (error) {
    console.error('MongoDB fel:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
